import { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import './ChatPanel.css';
import { createChat } from '@n8n/chat';
import { ToolSelector } from './ToolSelector';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedTool } from '@/features/tools/toolsSlice';
import { getWebhookUrl } from '@/constants/tools';
import { runOrchestrator, runTool } from '@/features/tools/toolsThunks';

export function ChatPanel() {
  const dispatch = useAppDispatch();
  const { selectedTool } = useAppSelector((state) => state.tools);
  const { selectedProject } = useAppSelector((state) => state.projects);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Use a per-project session id stored in localStorage under `n8n_session_id_<projectId>`.
    // Fallback to a global `n8n_session_id` if no project id is available (backwards compatibility).
    const projectKey = selectedProject?.id ? `n8n_session_id_${selectedProject.id}` : 'n8n_session_id';
    let sessionId = localStorage.getItem(projectKey);
    if (!sessionId) {
      // generate UUID-like id (use crypto.randomUUID when available)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sessionId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
        ? (crypto as any).randomUUID()
        : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      try {
        localStorage.setItem(projectKey, sessionId);
      } catch (e) {
        // ignore storage errors (quota, private mode)
      }
    }

    const webhookUrl = getWebhookUrl((selectedTool as any) || 'orchestrator');

    if (!containerRef.current) return;

    // Clear any previous mount
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

    // detection helpers
    let lastBotMessageTime = 0;
    let lastBotMessageHash = '';
    const MIN_API_CALL_INTERVAL = 2000;
    const TOOL_DISPATCH_COOLDOWN = 2000; // Prevent duplicate dispatch calls within 2 seconds

    const textHash = (s: string) => {
      if (!s) return '';
      const t = s.trim();
      return `${t.length}:${t.slice(0, 20)}:${t.slice(-20)}`;
    };

    const findMessageElement = (el: HTMLElement | null) => {
      if (!el) return null;
      return el.closest('.n8n-chat__message, [data-message-type], [data-author], [data-role], [role="article"]') as HTMLElement | null;
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

      const authorChild = msgEl.querySelector('[data-author], [data-role], .author, .message-author');
      if (authorChild) {
        const aAuth = (authorChild.getAttribute('data-author') || authorChild.getAttribute('data-role') || '').toLowerCase();
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
      
      // Check if we've dispatched this tool recently (within cooldown) using sessionStorage
      const toolKey = selectedTool || 'orchestrator';
      const lastDispatchStr = sessionStorage.getItem(`n8n_last_dispatch_${toolKey}`);
      const lastDispatchTime = lastDispatchStr ? parseInt(lastDispatchStr, 10) : 0;
      const now = Date.now();
      
      if (now - lastDispatchTime < TOOL_DISPATCH_COOLDOWN) {
        console.log(`⏳ Tool dispatch cooldown active for ${toolKey}. Skipping observer-triggered call.`);
        return;
      }
      
      // Update the last dispatch time for this tool in sessionStorage
      sessionStorage.setItem(`n8n_last_dispatch_${toolKey}`, now.toString());
      
      const payload = { projectId: selectedProject.id, usecase: selectedProject.usecase, projectName: selectedProject.projectName };
      
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
      const messagesContainer = containerRef.current?.querySelector('.n8n-chat-messages-container');
      const targetContainer = messagesContainer || containerRef.current;

      if (!targetContainer) return null;

      // Snapshot existing bot messages on mount to avoid reacting to restored history
      try {
        const existingNodes = Array.from(
          targetContainer.querySelectorAll('.n8n-chat__message, [data-message-type], [data-author], [data-role], [role="article"]')
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
        // ignore snapshot errors
      }

      // Short grace period to ignore burst mutations caused by initial load
      const IGNORE_INITIAL_MS = 1500;
      const ignoreInitialUntil = Date.now() + IGNORE_INITIAL_MS;

      const observer = new MutationObserver(async (mutations) => {
        try {
          for (const mutation of mutations) {
            if (mutation.type !== 'childList') continue;
            const addedElements = Array.from(mutation.addedNodes).filter((n: any) => n.nodeType === 1) as HTMLElement[];

            for (const el of addedElements) {
              const msgEl = findMessageElement(el) || el;
              if (!msgEl) continue;
              if (!isBotMessageElement(msgEl)) continue;

              const text = (msgEl.textContent || '').trim();
              if (!text) continue;

              const now = Date.now();
              // ignore mutations happening in the initial grace period
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

      observer.observe(targetContainer, { childList: true, subtree: true });
      return () => observer.disconnect();
    };

    observerCleanup = setupObserver();
    return () => {
      if (observerCleanup) observerCleanup();
    };
  }, [selectedProject, selectedTool, dispatch]);

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
