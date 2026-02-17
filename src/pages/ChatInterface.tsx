import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNavigation } from '@/components/TopNavigation';
import { ChatPanel } from '@/components/ChatPanel';
import { OutputPanel } from '@/components/OutputPanel';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { runOrchestrator } from '@/features/tools/toolsThunks';

export default function ChatInterface() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedProject } = useAppSelector((state) => state.projects);
  const { outputs } = useAppSelector((state) => state.tools);
  
  // State for resizable chat panel
  const [chatPanelWidth, setChatPanelWidth] = useState(400);

  // Redirect if no project selected
  useEffect(() => {
    if (!selectedProject) {
      navigate('/');
    }
  }, [selectedProject, navigate]);

  // Auto-fetch orchestrator outputs on mount
  useEffect(() => {
    if (selectedProject && Object.keys(outputs).length === 0) {
      dispatch(runOrchestrator({
        projectId: selectedProject.id,
        usecase: selectedProject.usecase,
        projectName: selectedProject.projectName,
      }));
    }
  }, [selectedProject, dispatch]);

  if (!selectedProject) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <TopNavigation />
      <div className="flex-1 flex overflow-hidden">
        <ChatPanel 
          width={chatPanelWidth} 
          onResize={setChatPanelWidth} 
        />
        <OutputPanel />
      </div>
    </div>
  );
}