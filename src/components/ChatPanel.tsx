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

const SESSION_EXPIRATION_MS = 60 * 60 * 1000;

// Session API base URL
const SESSION_API_BASE_URL = 'http://9.234.203.92:5000';

// Helper function to stop session via API
const stopSession = async (sessionId: string) => {
  try {
    console.log('🛑 Stopping session:', sessionId);
    await axios.post(`${SESSION_API_BASE_URL}/stop-session/${sessionId}`, {}, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ Session stopped successfully:', sessionId);
  } catch (error) {
    console.error('❌ Failed to stop session:', error);
  }
};

export function ChatPanel() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedTool } = useAppSelector((state) => state.tools);
  const { selectedProject } = useAppSelector((state) => state.projects);
  const containerRef = useRef(null);
  
  // Ref to track the current session ID for cleanup
  const currentSessionIdRef = useRef<string | null>(null);
  const storageCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
      const timestamp = parseInt(sessionTimestamp, 10);
      const timeSinceCreation = now - timestamp;

      if (timeSinceCreation >= SESSION_EXPIRATION_MS) {
        console.log('⏰ Session expired. Stopping session and redirecting to projects workspace...');
        
        // Stop the session before removing it
        const expiredSessionId = sessionId;
        stopSession(expiredSessionId).finally(() => {
          localStorage.removeItem(projectKey);
          localStorage.removeItem(timestampKey);
          currentSessionIdRef.current = null;
          navigate('/');
        });
        return;
      }
    }

    if (!sessionId) {
      sessionId =
        (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
          ? (crypto as any).randomUUID()
          : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      try {
        localStorage.setItem(projectKey, sessionId);
        localStorage.setItem(timestampKey, now.toString());
        console.log('✅ New session created:', sessionId);
      } catch (e) {
        console.error('❌ Failed to save session:', e);
      }
    }
    
    // Store current session ID in ref for cleanup
    currentSessionIdRef.current = sessionId;
    console.log('📌 Tracking session ID:', sessionId);

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
        sessionId: sessionId,
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

    // Monitor localStorage for session removal in real-time
    const storageCheckInterval = setInterval(() => {
      const currentSessionInStorage = localStorage.getItem(projectKey);
      const currentTimestamp = localStorage.getItem(timestampKey);

      // Check if session was removed from localStorage
      if (currentSessionIdRef.current && !currentSessionInStorage) {
        console.log('🔍 Detected: Session removed from localStorage!');
        console.log('🛑 Calling stop-session API for:', currentSessionIdRef.current);
        
        const sessionToStop = currentSessionIdRef.current;
        currentSessionIdRef.current = null; // Clear the ref to prevent duplicate calls
        
        stopSession(sessionToStop);
        return; // Exit early, no need to check expiration
      }

      // Check for session expiration
      if (currentTimestamp) {
        const timestamp = parseInt(currentTimestamp, 10);
        const elapsed = Date.now() - timestamp;

        if (elapsed >= SESSION_EXPIRATION_MS) {
          console.log('⏰ Session expired during check. Stopping session and redirecting...');
          
          if (currentSessionInStorage && currentSessionIdRef.current) {
            const sessionToStop = currentSessionInStorage;
            stopSession(sessionToStop).finally(() => {
              localStorage.removeItem(projectKey);
              localStorage.removeItem(timestampKey);
              currentSessionIdRef.current = null;
              clearInterval(storageCheckInterval);
              navigate('/');
            });
          } else {
            clearInterval(storageCheckInterval);
            navigate('/');
          }
        }
      }
    }, 1000); // Check every 1 second for real-time detection

    storageCheckIntervalRef.current = storageCheckInterval;

    const expirationCheckInterval = setInterval(() => {
      const currentTimestamp = localStorage.getItem(timestampKey);
      if (currentTimestamp) {
        const timestamp = parseInt(currentTimestamp, 10);
        const elapsed = Date.now() - timestamp;
        if (elapsed >= SESSION_EXPIRATION_MS) {
          console.log('Session expired during check. Redirecting...');
          localStorage.removeItem(projectKey);
          localStorage.removeItem(timestampKey);
          clearInterval(expirationCheckInterval);
          navigate('/');
        }
      }
    }, 60000);

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

    let observerCleanup: (() => void) | null = null;

    const handleBotMessage = async () => {
      if (!selectedProject) return;

      const toolKey = selectedTool || 'orchestrator';
      const lastDispatchStr = sessionStorage.getItem(`n8n_last_dispatch_${toolKey}`);
      const lastDispatchTime = lastDispatchStr ? parseInt(lastDispatchStr, 10) : 0;
      const now = Date.now();

      if (now - lastDispatchTime < TOOL_DISPATCH_COOLDOWN) {
        console.log(
          `⏳ Tool dispatch cooldown active for ${toolKey}. Skipping observer-triggered call.`
        );
        return;
      }

      sessionStorage.setItem(`n8n_last_dispatch_${toolKey}`, now.toString());

      const payload = {
        projectId: selectedProject.id,
        usecase: selectedProject.usecase,
        projectName: selectedProject.projectName,
      };

      if (selectedTool === 'orchestrator') {
        const result = await dispatch(runOrchestrator(payload));
        if ((result as any)?.meta?.requestStatus === 'fulfilled') {
          console.log('✅ Orchestrator completed');
        }
      } else {
        const result = await dispatch(runTool({ tool: selectedTool as any, payload }));
        if ((result as any)?.meta?.requestStatus === 'fulfilled') {
          console.log('✅ Tool run completed:', selectedTool);
        }
      }
    };

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
      } catch (e) {}

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

              const now = Date.now();
              if (now < ignoreInitialUntil) continue;

              const hash = textHash(text);
              if (hash === lastBotMessageHash) continue;

              if (now - lastBotMessageTime < MIN_API_CALL_INTERVAL) continue;

              lastBotMessageTime = now;
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

    // Cleanup function
    return () => {
      if (observerCleanup) observerCleanup();
      clearInterval(expirationCheckInterval);
      
      // Clear the storage check interval
      if (storageCheckIntervalRef.current) {
        clearInterval(storageCheckIntervalRef.current);
        storageCheckIntervalRef.current = null;
      }
      
      // Additional check on unmount (backup mechanism)
      const sessionStillExists = localStorage.getItem(projectKey);
      
      if (currentSessionIdRef.current && !sessionStillExists) {
        console.log('🧹 Cleanup: Session removed from localStorage during unmount');
        stopSession(currentSessionIdRef.current);
        currentSessionIdRef.current = null;
      }
    };
  }, [selectedProject, selectedTool, dispatch, navigate]);

  return (
    <div className="flex flex-col h-full bg-card border-r">
      <div className="p-4 border-b">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Tool</label>
        <ToolSelector value={selectedTool} onChange={(tool) => dispatch(setSelectedTool(tool))} disabled={false} />
      </div>

      <div id="n8n-chat-container" ref={containerRef} className="flex-1 overflow-hidden relative" />
    </div>
  );
}

export default ChatPanel;