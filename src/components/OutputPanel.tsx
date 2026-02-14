import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { runOrchestrator, runTool } from '@/features/tools/toolsThunks';
import { ExternalLink, RefreshCw, Loader2, FileText, Image as ImageIcon, Code } from 'lucide-react';
import { getToolLabel } from '@/constants/tools';
import { useEffect, useRef } from 'react';

export function OutputPanel() {
  const dispatch = useAppDispatch();
  const { selectedTool, outputs, loading, loadingTool } = useAppSelector((state) => state.tools);
  const { selectedProject } = useAppSelector((state) => state.projects);

  const handleRefresh = (tool?: string) => {
    if (!selectedProject) return;
    const toolKey = tool || 'orchestrator';
    sessionStorage.setItem(`n8n_last_dispatch_${toolKey}`, Date.now().toString());
    const payload = {
      projectId: selectedProject.id,
      usecase: selectedProject.usecase,
      projectName: selectedProject.projectName,
    };
    if (tool && tool !== 'orchestrator') {
      dispatch(runTool({ tool: tool as any, payload }));
    } else {
      dispatch(runOrchestrator(payload));
    }
  };

  if (selectedTool === 'orchestrator') {
    return (
      <div className="h-full flex flex-col">
        <Card className="border-b rounded-none">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-lg">Workflow Output</CardTitle>
            <Button onClick={() => handleRefresh()} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Run Workflow
            </Button>
          </CardHeader>
        </Card>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {loading && (
              <div className="space-y-2">
                <Progress value={33} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">Running workflow...</p>
              </div>
            )}
            <OutputCard
              title="Epics & User Stories"
              icon={<FileText className="h-4 w-4" />}
              loading={loadingTool === 'epics'}
              onRefresh={() => handleRefresh('epics')}
            >
              <EpicsOutput data={outputs.epics_and_user_stories} />
            </OutputCard>
            <OutputCard
              title="Architecture Generation"
              icon={<ImageIcon className="h-4 w-4" />}
              loading={loadingTool === 'arch_gen'}
              onRefresh={() => handleRefresh('arch_gen')}
            >
              <ArchitectureOutput data={outputs.arch_gen} />
            </OutputCard>
            <OutputCard
              title="Architecture Validation"
              icon={<ImageIcon className="h-4 w-4" />}
              loading={loadingTool === 'arch_val'}
              onRefresh={() => handleRefresh('arch_val')}
            >
              <ArchitectureOutput data={outputs.arch_val} />
            </OutputCard>
            <OutputCard
              title="Code Generation"
              icon={<Code className="h-4 w-4" />}
              loading={loadingTool === 'code_gen'}
              onRefresh={() => handleRefresh('code_gen')}
            >
              <StackBlitzOutput data={outputs.code_gen} />
            </OutputCard>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="border-b rounded-none">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-lg">{getToolLabel(selectedTool)}</CardTitle>
          <Button onClick={() => handleRefresh(selectedTool)} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Update
          </Button>
        </CardHeader>
      </Card>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <IndividualToolOutput tool={selectedTool} outputs={outputs} loading={loading} />
        </div>
      </ScrollArea>
    </div>
  );
}

/* ---------- Shared UI Cards ---------- */
function OutputCard({ title, icon, children, loading, onRefresh }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        {onRefresh && (
          <Button onClick={onRefresh} variant="ghost" size="sm" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : children}
      </CardContent>
    </Card>
  );
}

/* ---------- Outputs ---------- */
function EpicsOutput({ data }: any) {
  if (!data) return <p className="text-sm text-muted-foreground">No data found</p>;

  //const projectKey = selectedProject?.id ? `n8n_session_id_${selectedProject.id}` : 'n8n_session_id';

  return (
    <div className="space-y-2">
      {data.titles.slice(0, 2).map((title: string, i: number) => (
        <div key={i} className="p-2 border rounded">
          {data.ids?.[i] && (
            <p className="text-xs text-muted-foreground">{data.ids[i]}</p>
          )}
          <p className="text-sm font-medium">{title}</p>
        </div>
      ))}
      <Button variant="link" size="sm" asChild>
        <a href="#">
          View More in JIRA
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </Button>
    </div>
  );
}

function ArchitectureOutput({ data }: any) {
  if (!data?.image) return <p className="text-sm text-muted-foreground">No architecture available.</p>;

  return (
    <div className="space-y-2">
      <img src={data.image} alt="Architecture" className="w-full rounded border" />
    </div>
  );
}

/* ---------- Code iframe ---------- */

/* ---------- Code iframe ---------- */
function StackBlitzOutput({ data }: any) {
  if (!data) return <p className="text-sm text-muted-foreground">No data found</p>;

  const { selectedProject } = useAppSelector((state) => state.projects);
  const sessionId = selectedProject?.id 
    ? localStorage.getItem(`n8n_session_id_${selectedProject.id}`) 
    : null;
  
  if (!sessionId) return <p className="text-sm text-muted-foreground">No session found</p>;
  
  const localHostUrl = `https://code-generation-server.eastus2.cloudapp.azure.com/${sessionId}`;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleIframeLoad = () => {
    // Wait for iframe to fully load, then try to open terminal
    setTimeout(() => {
      try {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow) return;

        // Focus the iframe first
        iframe.contentWindow.focus();

        // Try to dispatch a keyboard event directly
        const ctrlBacktickEvent = new KeyboardEvent('keydown', {
          key: '`',
          code: 'Backquote',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });

        iframe.contentWindow.document.dispatchEvent(ctrlBacktickEvent);
        console.log('Terminal shortcut dispatched');
      } catch (error) {
        console.error('Error opening terminal:', error);
      }
    }, 3000);

    // Try multiple times
    setTimeout(() => {
      try {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow) return;
        iframe.contentWindow.focus();
        const ctrlBacktickEvent = new KeyboardEvent('keydown', {
          key: '`',
          code: 'Backquote',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        iframe.contentWindow.document.dispatchEvent(ctrlBacktickEvent);
        console.log('Terminal shortcut dispatched - Attempt 2');
      } catch (error) {
        console.error('Error opening terminal:', error);
      }
    }, 5000);
  };

  useEffect(() => {
    if (!data.repoUrl) return;

    const postAutoclone = () => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return false;
      win.postMessage({ type: 'autoclone', repo: data.repoUrl }, '*');
      return true;
    };

    postAutoclone();
    const t1 = setTimeout(postAutoclone, 400);
    const t2 = setTimeout(postAutoclone, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [data.repoUrl]);

  return (
    <div className="space-y-4">
      <div className="w-full h-[600px] border rounded overflow-hidden">
        <iframe
          ref={iframeRef}
          src={localHostUrl}
          className="w-full h-full"
          allow="cross-origin-isolated"
          onLoad={handleIframeLoad}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={`vscode://vscode.git/clone?url=${encodeURIComponent(data.repoUrl)}`}>
            Open in VS Code
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={data.repoUrl}>
            Open in GitHub
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </div>
    </div>
  );
}
/* ---------- Individual Tool ---------- */
function IndividualToolOutput({ tool, outputs, loading }: any) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  switch (tool) {
    case 'epics':
      return <EpicsOutput data={outputs.epics_and_user_stories} />;
    case 'arch_gen':
    case 'arch_val':
      return <ArchitectureOutput data={outputs[tool]} />;
    case 'code_gen':
      return <StackBlitzOutput data={outputs.code_gen} />;
    default:
      return <p className="text-sm text-muted-foreground">Select a tool</p>;
  }
}