import { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import './ChatPanel.css';
import { createChat } from '@n8n/chat';
import { ToolSelector } from './ToolSelector';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedTool } from '@/features/tools/toolsSlice';
import { getWebhookUrl } from '@/constants/tools';
import { runOrchestrator, runTool } from '@/features/tools/toolsThunks';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getSpecialSessionId } from "@/components/session";

const SESSION_EXPIRATION_MS = 5 * 60 * 60 * 1000;

const SESSION_API_BASE_URL = '/api';

const specialSessionId = getSpecialSessionId();


const stopSession = async (sessionId: string) => {
  try {
    console.log('Stopping session:', sessionId);
    await axios.post(`${SESSION_API_BASE_URL}/stop-session/${sessionId}`, {}, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(' Session stopped successfully:', sessionId);
  } catch (error) {
    console.error('Failed to stop session:', error);
  }
};

interface ChatPanelProps {
  width: number;
  onResize: (newWidth: number) => void;
}

export function ChatPanel({ width, onResize }: ChatPanelProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedTool } = useAppSelector((state) => state.tools);
  const { selectedProject } = useAppSelector((state) => state.projects);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const currentSessionIdRef = useRef<string | null>(null);
  const expirationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasExpiredRef = useRef(false); 

  useEffect(() => {

    hasExpiredRef.current = false;

    const projectKey = selectedProject?.id
      ? `n8n_session_id_${selectedProject.id}`
      : 'n8n_session_id';
    const timestampKey = selectedProject?.id
      ? `n8n_session_timestamp_${selectedProject.id}`
      : 'n8n_session_timestamp';

    let sessionId = localStorage.getItem(projectKey);
    let sessionTimestamp = localStorage.getItem(timestampKey);
    const now = Date.now();

    if (sessionId && sessionTimestamp) {
      const elapsed = now - parseInt(sessionTimestamp, 10);
      if (elapsed >= SESSION_EXPIRATION_MS) {
        console.log(' Session already expired on mount. Cleaning up and redirecting...');
        const expiredId = sessionId;
        localStorage.removeItem(projectKey);
        localStorage.removeItem(timestampKey);
        currentSessionIdRef.current = null;
        stopSession(expiredId).finally(() => navigate('/'));
        return;
      }
      console.log(
        ` Resuming existing session. Time remaining: ${Math.floor(
          (SESSION_EXPIRATION_MS - elapsed) / 1000
        )}s`
      );
    }

    // --- Create new session if none exists ---
    if (!sessionId) {
      sessionId =
        typeof crypto !== 'undefined' && (crypto as any).randomUUID
          ? (crypto as any).randomUUID()
          : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      try {
        localStorage.setItem(projectKey, sessionId);
        localStorage.setItem(timestampKey, now.toString());
        console.log(' New session created:', sessionId);
      } catch (e) {
        console.error(' Failed to save session to localStorage:', e);
      }
    }

    currentSessionIdRef.current = sessionId;
    console.log('Tracking session ID:', sessionId);

    // --- Single expiration handler ---
    const handleSessionExpired = async () => {
      if (hasExpiredRef.current) return;
      hasExpiredRef.current = true;

      console.log('Session expired. Stopping session and redirecting...');

      const sessionToStop = currentSessionIdRef.current;
      currentSessionIdRef.current = null;

      localStorage.removeItem(projectKey);
      localStorage.removeItem(timestampKey);

      if (sessionToStop) {
        await stopSession(sessionToStop);
      }

      navigate('/');
    };

    const storedTimestamp = localStorage.getItem(timestampKey);
    const createdAt = storedTimestamp ? parseInt(storedTimestamp, 10) : now;
    const elapsed = now - createdAt;
    const remainingMs = Math.max(0, SESSION_EXPIRATION_MS - elapsed);

    console.log(` Session expires in ${Math.floor(remainingMs / 1000)} seconds`);

    expirationTimerRef.current = setTimeout(() => {
      handleSessionExpired();
    }, remainingMs);

    const webhookUrl = getWebhookUrl((selectedTool as any) || 'orchestrator');

    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';
    containerRef.current.style.position = 'relative';
    containerRef.current.style.width = '100%';
    containerRef.current.style.height = '100%';

    createChat({
      webhookUrl,
      target: '#n8n-chat-container',
      metadata: {
        project_name: selectedProject?.projectName || '',
        usecase: selectedProject?.usecase || '',
        sessionId: getSpecialSessionId() ?? sessionId,
        tool: selectedTool || 'orchestrator',
      },
      mode: 'fullscreen',
      defaultLanguage: 'en',
      initialMessages: ['Hi there!', 'How can I assist you today?'],
      i18n: {
        en: {
          title: '',
          subtitle: '',
          footer: '',
          getStarted: 'New Conversation',
          inputPlaceholder: 'Type your question..',
          closeButtonTooltip: 'Close',
        },
      },
      showWelcomeScreen: false,
      loadPreviousSession: true,
    });

    // --- Bot message observer ---
    let lastBotMessageTime = 0;
    let lastBotMessageHash = '';
    const MIN_API_CALL_INTERVAL = 2000;
    const TOOL_DISPATCH_COOLDOWN = 2000;

    const textHash = (s: string) => {
      if (!s) return '';
      const t = s.trim();
      return `${t.length}:${t.slice(0, 20)}:${t.slice(-20)}`;
    };

    const findMessageElement = (el: HTMLElement | null) => {
      if (!el) return null;
      return el.closest(
        '.n8n-chat__message, [data-message-type], [data-author], [data-role], [role="article"]'
      ) as HTMLElement | null;
    };

    const isBotMessageElement = (msgEl: HTMLElement | null) => {
      if (!msgEl) return false;

      const cls = (msgEl.className || '').toString().toLowerCase();
      const dataAuthor = (msgEl.getAttribute('data-author') || '').toLowerCase();
      const dataRole = (msgEl.getAttribute('data-role') || '').toLowerCase();

      if (dataAuthor === 'bot' || dataAuthor === 'assistant') return true;
      if (dataRole === 'assistant' || dataRole === 'bot') return true;
      if (cls.includes('bot') || cls.includes('assistant')) return true;
      if (cls.includes('user') || cls.includes('you')) return false;

      const authorChild = msgEl.querySelector(
        '[data-author], [data-role], .author, .message-author'
      );
      if (authorChild) {
        const aAuth = (
          authorChild.getAttribute('data-author') ||
          authorChild.getAttribute('data-role') ||
          ''
        ).toLowerCase();
        if (aAuth.includes('assistant') || aAuth.includes('bot')) return true;
        if (aAuth.includes('user') || aAuth.includes('you')) return false;
      }

      if (msgEl.querySelector('svg')) {
        if (cls.includes('message') && !cls.includes('user')) return true;
      }

      return false;
    };

    const handleBotMessage = async () => {
      if (!selectedProject) return;

      const toolKey = selectedTool || 'orchestrator';
      const lastDispatchStr = sessionStorage.getItem(`n8n_last_dispatch_${toolKey}`);
      const lastDispatchTime = lastDispatchStr ? parseInt(lastDispatchStr, 10) : 0;
      const nowMs = Date.now();

      if (nowMs - lastDispatchTime < TOOL_DISPATCH_COOLDOWN) {
        console.log(`⏳ Tool dispatch cooldown active for ${toolKey}. Skipping.`);
        return;
      }

      sessionStorage.setItem(`n8n_last_dispatch_${toolKey}`, nowMs.toString());

      const payload = {
        projectId: selectedProject.id,
        usecase: selectedProject.usecase,
        projectName: selectedProject.projectName,
        sessionId: specialSessionId ?? currentSessionIdRef.current,
      };

      if (selectedTool === 'orchestrator') {
        const result = await dispatch(runOrchestrator(payload));
        if ((result as any)?.meta?.requestStatus === 'fulfilled') {
          console.log(' Orchestrator completed');
        }
      } else {
        const result = await dispatch(runTool({ tool: selectedTool as any, payload }));
        if ((result as any)?.meta?.requestStatus === 'fulfilled') {
          console.log('Tool run completed:', selectedTool);
        }
      }
    };

    let observerCleanup: (() => void) | null = null;

    const setupObserver = () => {
      const messagesContainer =
        containerRef.current?.querySelector('.n8n-chat-messages-container');
      const targetContainer = messagesContainer || containerRef.current;

      if (!targetContainer) return null;

      try {
        const existingNodes = Array.from(
          targetContainer.querySelectorAll(
            '.n8n-chat__message, [data-message-type], [data-author], [data-role], [role="article"]'
          )
        ) as HTMLElement[];

        let lastHashFromExisting = '';
        for (const node of existingNodes) {
          if (!isBotMessageElement(node)) continue;
          const txt = (node.textContent || '').trim();
          if (!txt) continue;
          lastHashFromExisting = textHash(txt);
        }

        if (lastHashFromExisting) {
          lastBotMessageHash = lastHashFromExisting;
          lastBotMessageTime = Date.now();
        }
      } catch (e) {
        console.error('Error processing existing messages:', e);
      }

      const IGNORE_INITIAL_MS = 1500;
      const ignoreInitialUntil = Date.now() + IGNORE_INITIAL_MS;

      const observer = new MutationObserver(async (mutations) => {
        try {
          for (const mutation of mutations) {
            if (mutation.type !== 'childList') continue;

            const addedElements = Array.from(mutation.addedNodes).filter(
              (n: any) => n.nodeType === 1
            ) as HTMLElement[];

            for (const el of addedElements) {
              const msgEl = findMessageElement(el) || el;
              if (!msgEl) continue;
              if (!isBotMessageElement(msgEl)) continue;

              const text = (msgEl.textContent || '').trim();
              if (!text) continue;

              const nowMs = Date.now();
              if (nowMs < ignoreInitialUntil) continue;

              const hash = textHash(text);
              if (hash === lastBotMessageHash) continue;
              if (nowMs - lastBotMessageTime < MIN_API_CALL_INTERVAL) continue;

              lastBotMessageTime = nowMs;
              lastBotMessageHash = hash;

              console.log('🤖 Bot message detected. Tool:', selectedTool);
              await handleBotMessage();
            }
          }
        } catch (error) {
          console.error('Error in messages observer:', error);
        }
      });

      observer.observe(targetContainer, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    };

    observerCleanup = setupObserver();

    return () => {
      if (observerCleanup) observerCleanup();
      if (expirationTimerRef.current) {
        clearTimeout(expirationTimerRef.current);
        expirationTimerRef.current = null;
      }
    };
  }, [selectedProject, selectedTool, dispatch, navigate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        onResize(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = () => {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const resizeHandle = resizeRef.current;
    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      if (resizeHandle) {
        resizeHandle.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onResize]);

  return (
    <div
      className="flex flex-col h-full bg-card border-r relative"
      style={{
        width: `${width}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
        flexShrink: 0,
      }}
    >
      <div className="p-4 border-b">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Tool</label>
        <ToolSelector
          value={selectedTool}
          onChange={(tool) => dispatch(setSelectedTool(tool))}
          disabled={false}
        />
      </div>

      <div id="n8n-chat-container" ref={containerRef} className="flex-1 overflow-hidden relative" />
      <div ref={resizeRef} className="resize-handle" />
    </div>
  );
}

export default ChatPanel;
 