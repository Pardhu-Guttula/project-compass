import { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import './ChatPanel.css'; 
import { createChat } from '@n8n/chat';
import { ToolSelector } from './ToolSelector';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedTool } from '@/features/tools/toolsSlice';
import { getWebhookUrl, ORCHESTRATOR_API_URL } from '@/constants/tools';
import type { ToolType } from '@/types';
import axios from 'axios';

 export function ChatPanel() {
   const dispatch = useAppDispatch();
   const { selectedTool } = useAppSelector((state) => state.tools);
   const { selectedProject } = useAppSelector((state) => state.projects);
   const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let sessionId = localStorage.getItem('n8n_session_id');
    if (!sessionId) {
      sessionId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
        ? (crypto as any).randomUUID()
        : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      localStorage.setItem('n8n_session_id', sessionId);
    }

    const webhookUrl = getWebhookUrl(selectedTool || 'orchestrator');

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.style.position = 'relative';
      containerRef.current.style.width = '100%';
      containerRef.current.style.height = '100%';
      
      console.log('Creating chat instance with webhook:', webhookUrl);


      const currentSessionId = localStorage.getItem('n8n-chat/sessionId');
      console.log('Current n8n chat session ID:', currentSessionId);
      
      createChat({
        webhookUrl: webhookUrl,
        target: '#n8n-chat-container',
        chatSessionKey: 'sessionId',

        metadata: {
          project_name: selectedProject?.projectName || '',
          usecase: selectedProject?.usecase || '',
          sessionId: sessionId,
          tool: selectedTool || 'orchestrator',
        },
        mode: 'fullscreen',
        
        defaultLanguage: 'en',
        initialMessages: ['Hi there!',
		'How can I assist you yesterday?'],
        i18n: {
          en: {
            title: '',
            subtitle: '',
            footer: '',
            getStarted: '',
            inputPlaceholder: 'Type your question..',
            closeButtonTooltip: 'Close',
          },
        },
        showWelcomeScreen: false,
        loadPreviousSession: true,
      });

      let lastBotMessageTime = 0;
      let lastBotMessageHash = '';
      const MIN_API_CALL_INTERVAL = 1000; 
      let retryCount = 0;
      const MAX_RETRIES = 10;

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

      const setupObserver = () => {
        const messagesContainer = containerRef.current?.querySelector('.n8n-chat-messages-container');

        if (!messagesContainer) {
          retryCount++;
          if (retryCount <= MAX_RETRIES) {
            console.log(`⏳ Messages container not found yet (attempt ${retryCount}/${MAX_RETRIES}), retrying...`);
            if (retryCount === 1 || retryCount % 5 === 0) {
              const rootChildren = containerRef.current?.children;
              console.log('Current container children:', rootChildren?.length, Array.from(rootChildren || []).map((el: any) => el.className));
            }
            setTimeout(setupObserver, 300);
            return;
          }
          console.warn('❌ Messages container not found after max retries. Trying fallback observer on root container...');
          setupFallbackObserver();
          return;
        }

        console.log('✅ Messages container found! Setting up mutation observer...');

        const observer = new MutationObserver(async (mutations) => {
          try {
            for (const mutation of mutations) {
              if (mutation.type !== 'childList') continue;
              const addedElements = Array.from(mutation.addedNodes).filter((n: any) => n.nodeType === 1) as HTMLElement[];

              for (const el of addedElements) {
                const msgEl = findMessageElement(el) || el;
                if (!msgEl) continue;

                if (!isBotMessageElement(msgEl)) {
                  continue;
                }

                const text = (msgEl.textContent || '').trim();
                if (!text) continue;

                const now = Date.now();
                const hash = textHash(text);
                if (hash === lastBotMessageHash) {
                  continue;
                }

                if (now - lastBotMessageTime < MIN_API_CALL_INTERVAL) {
                  continue;
                }

                lastBotMessageTime = now;
                lastBotMessageHash = hash;

                console.log('🤖 Bot message detected (primary). Text:', text.substring(0, 120));
                try {
                  const payload = { project_name: selectedProject?.projectName || '', type: 'main_orchestrator' };
                  console.log('📤 Sending orchestrator API request:', payload);
                  const response = await axios.post(ORCHESTRATOR_API_URL, payload);
                  console.log('✅ Orchestrator API Response received:', response.status, response.data);
                } catch (error: any) {
                  console.error('❌ Error triggering orchestrator API:', error?.message || error);
                }
              }
            }
          } catch (error) {
            console.error('Error in mutation observer:', error);
          }
        });

        observer.observe(messagesContainer, { childList: true, subtree: true });
        console.log('✨ Mutation observer is now active and listening for bot messages');

        return () => {
          console.log('Cleaning up mutation observer');
          observer.disconnect();
        };
      };

      const setupFallbackObserver = () => {
        console.log('🔄 Setting up fallback observer on root container...');
        const observer = new MutationObserver(async (mutations) => {
          try {
            for (const mutation of mutations) {
              if (mutation.type !== 'childList') continue;
              const addedElements = Array.from(mutation.addedNodes).filter((n: any) => n.nodeType === 1) as HTMLElement[];
              if (addedElements.length > 0) {
                console.log('📍 Added elements detected:', addedElements.length);
                addedElements.forEach((elem: any, idx) => {
                  console.log(`  Element ${idx}: className="${elem.className}", tag="${elem.tagName}", text="${String(elem.textContent).substring(0, 50)}"`);
                });
              }

              for (const el of addedElements) {
                const msgEl = findMessageElement(el) || el;
                if (!msgEl) continue;
                if (!isBotMessageElement(msgEl)) continue;

                const text = (msgEl.textContent || '').trim();
                if (!text) continue;

                const now = Date.now();
                const hash = textHash(text);
                if (hash === lastBotMessageHash) continue;
                if (now - lastBotMessageTime < MIN_API_CALL_INTERVAL) continue;

                lastBotMessageTime = now;
                lastBotMessageHash = hash;

                console.log('🤖 Bot message detected via fallback! Text:', text.substring(0, 120));
                try {
                  const payload = { project_name: selectedProject?.projectName || '', type: 'main_orchestrator' };
                  console.log('📤 Sending orchestrator API request:', payload);
                  const response = await axios.post(ORCHESTRATOR_API_URL, payload);
                  console.log('✅ Orchestrator API Response received:', response.status, response.data);
                } catch (error: any) {
                  console.error('❌ Error triggering orchestrator API:', error?.message || error);
                }
              }
            }
          } catch (error) {
            console.error('Error in fallback observer:', error);
          }
        });

        if (containerRef.current) {
          observer.observe(containerRef.current, { childList: true, subtree: true });
          console.log('🔄 Fallback observer is now active');
        }

        return () => {
          observer.disconnect();
        };
      };

      const cleanup = setupObserver();
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [selectedProject, selectedTool]);
 
   return (
     <div className="flex flex-col h-full bg-card border-r">
       {/* Tool Selector */}
       <div className="p-4 border-b">
         <label className="text-sm font-medium text-muted-foreground mb-2 block">
           Select Tool
         </label>
         <ToolSelector
           value={selectedTool}
           onChange={(tool) => dispatch(setSelectedTool(tool))}
           disabled={false}
         />
       </div>
 
       {/* Chat Container - Fullscreen mode will render inside this */}
       <div 
         id="n8n-chat-container"
         ref={containerRef}
         className="flex-1 overflow-hidden relative"
       />
     </div>
   );
   }
