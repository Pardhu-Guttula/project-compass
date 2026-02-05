 import { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { ToolSelector } from './ToolSelector';
 import { useAppDispatch, useAppSelector } from '@/store/hooks';
 import { setSelectedTool } from '@/features/tools/toolsSlice';
 import { addMessage } from '@/features/chat/chatSlice';
 import { runOrchestrator, runTool } from '@/features/tools/toolsThunks';
 import type { ToolType, ChatMessage } from '@/types';
 import { Send, Loader2, Bot, User } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 export function ChatPanel() {
   const dispatch = useAppDispatch();
   const { selectedTool, loading, loadingTool } = useAppSelector((state) => state.tools);
   const { messages } = useAppSelector((state) => state.chat);
   const { selectedProject } = useAppSelector((state) => state.projects);
   const [input, setInput] = useState('');
 
   const handleSend = async () => {
     if (!input.trim() || !selectedProject) return;
 
     const userMessage = input.trim();
     setInput('');
 
     // Add user message
     dispatch(addMessage({
       role: 'user',
       content: userMessage,
       tool: selectedTool,
     }));
 
     const payload = {
       projectId: selectedProject.id,
       usecase: selectedProject.usecase,
       prompt: userMessage,
     };
 
     try {
       if (selectedTool === 'orchestrator') {
         await dispatch(runOrchestrator(payload)).unwrap();
         dispatch(addMessage({
           role: 'assistant',
           content: 'Workflow completed! All 7 solutions have been generated successfully.',
           tool: 'orchestrator',
         }));
       } else {
         await dispatch(runTool({ tool: selectedTool, payload })).unwrap();
         dispatch(addMessage({
           role: 'assistant',
           content: `${selectedTool.replace('_', ' ')} completed successfully. Check the output panel for results.`,
           tool: selectedTool,
         }));
       }
     } catch (error) {
       dispatch(addMessage({
         role: 'assistant',
         content: 'Sorry, there was an error processing your request.',
       }));
     }
   };
 
   const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter' && !e.shiftKey) {
       e.preventDefault();
       handleSend();
     }
   };
 
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
           disabled={loading}
         />
       </div>
 
       {/* Messages */}
       <ScrollArea className="flex-1 p-4">
         <div className="space-y-4">
           {messages.length === 0 && (
             <div className="text-center text-muted-foreground py-8">
               <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
               <p className="text-sm">Start a conversation to generate SDLC artifacts</p>
               <p className="text-xs mt-2">Select a tool above and describe your requirements</p>
             </div>
           )}
           {messages.map((message) => (
             <MessageBubble key={message.id} message={message} />
           ))}
           {loading && (
             <div className="flex items-center gap-2 text-muted-foreground">
               <Loader2 className="h-4 w-4 animate-spin" />
               <span className="text-sm">Processing...</span>
             </div>
           )}
         </div>
       </ScrollArea>
 
       {/* Input */}
       <div className="p-4 border-t">
         <div className="flex gap-2">
           <Input
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={handleKeyDown}
             placeholder="Describe your requirements..."
             disabled={loading}
             className="flex-1"
           />
           <Button onClick={handleSend} disabled={loading || !input.trim()}>
             {loading ? (
               <Loader2 className="h-4 w-4 animate-spin" />
             ) : (
               <Send className="h-4 w-4" />
             )}
           </Button>
         </div>
       </div>
     </div>
   );
 }
 
 function MessageBubble({ message }: { message: ChatMessage }) {
   const isUser = message.role === 'user';
 
   return (
     <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
       <div className={cn(
         'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
         isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
       )}>
         {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
       </div>
       <div className={cn(
         'rounded-lg px-4 py-2 max-w-[80%]',
         isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
       )}>
         <p className="text-sm">{message.content}</p>
         <p className="text-xs opacity-70 mt-1">
           {new Date(message.timestamp).toLocaleTimeString()}
         </p>
       </div>
     </div>
   );
 }