import { useEffect, useRef } from 'react';
 import '@n8n/chat/style.css';
 import { createChat } from '@n8n/chat';
 import { ToolSelector } from './ToolSelector';
 import { useAppDispatch, useAppSelector } from '@/store/hooks';
 import { setSelectedTool } from '@/features/tools/toolsSlice';
 import { getWebhookUrl, ORCHESTRATOR_API_URL } from '@/constants/tools';
 import type { ToolType } from '@/types';
 import axios from 'axios';
 import './ChatPanel.css';
 
 export function ChatPanel() {
   const dispatch = useAppDispatch();
   const { selectedTool } = useAppSelector((state) => state.tools);
   const { selectedProject } = useAppSelector((state) => state.projects);
   const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let sessionId = localStorage.getItem('n8n_session_id');
    if (!sessionId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sessionId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
        ? (crypto as any).randomUUID()
        : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      localStorage.setItem('n8n_session_id', sessionId);
    }

    // Get the dynamic webhook URL based on the selected tool
    const webhookUrl = getWebhookUrl(selectedTool || 'orchestrator');

    // Create chat instance with fullscreen mode inside the container
    if (containerRef.current) {
      // Clear previous chat if exists
      containerRef.current.innerHTML = '';
      
      // Style the container to act as a positioned parent for fullscreen mode
      containerRef.current.style.position = 'relative';
      containerRef.current.style.width = '100%';
      containerRef.current.style.height = '100%';
      
      createChat({
        webhookUrl: webhookUrl,
        target: '#n8n-chat-container',
        metadata: {
          project_name: selectedProject?.projectName || '',
          usecase: selectedProject?.usecase || '',
          session_id: sessionId,
          tool: selectedTool || 'orchestrator',
        },
        mode: 'fullscreen',
        
        defaultLanguage: 'en',
        // Keep the initial messages but remove the title/subtitle shown in the welcome header
        initialMessages: [
          'Hi there!',
          'How can I assist you today?'
        ],
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
        showWelcomeScreen: true,
        loadPreviousSession: true,
      });

      // Monitor the chat messages container for new bot messages and trigger orchestrator API
      const observer = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            // Check if a new bot message was added
            const newNodes = Array.from(mutation.addedNodes);
            const hasBotMessage = newNodes.some((node: any) => {
              return node.nodeType === 1 && node.classList?.contains('n8n-chat__message--bot');
            });

            if (hasBotMessage) {
              try {
                // Trigger the orchestrator API when a bot reply is received
                await axios.post(ORCHESTRATOR_API_URL, {
                  project_name: selectedProject?.projectName || '',
                  type: 'main_orchestrator',
                });
              } catch (error) {
                console.error('Error triggering orchestrator API:', error);
              }
            }
          }
        }
      });

      // Start observing the messages container
      const messagesContainer = containerRef.current.querySelector('.n8n-chat-messages-container');
      if (messagesContainer) {
        observer.observe(messagesContainer, {
          childList: true,
          subtree: true,
        });
      }

      // Cleanup observer on unmount or when dependencies change
      return () => {
        observer.disconnect();
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
