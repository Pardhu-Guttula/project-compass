import { useState } from 'react';
import { ChatPanel } from './ChatPanel';
import { OutputPanel } from './OutputPanel';

export function ChatLayout() {
  const [chatPanelWidth, setChatPanelWidth] = useState(400);

  return (
    <div className="flex h-screen w-full">
      <ChatPanel 
        width={chatPanelWidth} 
        onResize={setChatPanelWidth} 
      />
      <OutputPanel />
    </div>
  );
}