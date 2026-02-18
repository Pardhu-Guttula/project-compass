import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { runOrchestrator, runTool } from '@/features/tools/toolsThunks';
import {
  ExternalLink,
  RefreshCw,
  Loader2,
  FileText,
  Image as ImageIcon,
  Code,
  Eye,
  Maximize2,
  Minimize2,
  Github,
  Monitor,
  SquareArrowOutUpRight,
  PanelLeft,
  PanelRight,
  Columns2,
  GripVertical,
} from 'lucide-react';
import { getToolLabel } from '@/constants/tools';
import { useRef, useState, useCallback, useEffect } from 'react';

interface DualIframeViewProps {
  primaryUrl: string;
  secondaryUrl: string;
  fullHeight?: boolean;
}

function DualIframeView({ primaryUrl, secondaryUrl, fullHeight = false }: DualIframeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  const [leftWidth, setLeftWidth] = useState(50);
  const [activePanel, setActivePanel] = useState<'both' | 'left' | 'right'>('both');
  const [isDraggingState, setIsDraggingState] = useState(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setIsDraggingState(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;

      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }

      animFrameRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const rawPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const clamped = Math.min(85, Math.max(15, rawPercent));
        setLeftWidth(clamped);
      });
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsDraggingState(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const showLeft = activePanel === 'both' || activePanel === 'left';
  const showRight = activePanel === 'both' || activePanel === 'right';

  const leftPercent = activePanel === 'left' ? 100 : activePanel === 'right' ? 0 : leftWidth;
  const rightPercent = 100 - leftPercent;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b bg-muted/40 flex-shrink-0">
        <Button
          variant={activePanel === 'left' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-6 w-6"
          title="Show left panel only"
          onClick={() => setActivePanel(activePanel === 'left' ? 'both' : 'left')}
        >
          <PanelLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={activePanel === 'both' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-6 w-6"
          title="Show both panels"
          onClick={() => { setActivePanel('both'); setLeftWidth(50); }}
        >
          <Columns2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={activePanel === 'right' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-6 w-6"
          title="Show right panel only"
          onClick={() => setActivePanel(activePanel === 'right' ? 'both' : 'right')}
        >
          <PanelRight className="h-3.5 w-3.5" />
        </Button>

        {activePanel === 'both' && (
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {Math.round(leftWidth)}% / {Math.round(100 - leftWidth)}%
          </span>
        )}
      </div>

      {/* Split container */}
      <div
        ref={containerRef}
        className="flex flex-1 overflow-hidden relative"
        style={{ minHeight: 0 }}
      >
        {/* Left iframe */}
        {showLeft && leftPercent > 0 && (
          <div
            className="flex flex-col overflow-hidden"
            style={{ width: `${leftPercent}%`, flexShrink: 0 }}
          >
            <div className="flex items-center gap-1 px-2 py-1 bg-muted/60 border-b text-xs text-muted-foreground font-medium flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-1" />
              CODE
            </div>
            <iframe
              src={primaryUrl}
              className="w-full flex-1 border-0"
              style={{ pointerEvents: isDraggingState ? 'none' : 'auto' }}
              allow="accelerometer; camera; encrypted-media; geolocation; microphone; midi; usb; xr-spatial-tracking"
            />
          </div>
        )}

        {activePanel === 'both' && (
          <div
            onMouseDown={onMouseDown}
            className="relative flex-shrink-0 flex items-center justify-center group z-10"
            style={{
              width: '12px',
              cursor: 'col-resize',
              background: isDraggingState
                ? 'hsl(var(--primary) / 0.12)'
                : 'transparent',
              transition: 'background 0.15s',
            }}
            title="Drag to resize"
          >
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px transition-colors duration-150"
              style={{
                background: isDraggingState
                  ? 'hsl(var(--primary) / 0.6)'
                  : 'hsl(var(--border))',
              }}
            />
            <div
              className="relative z-10 flex flex-col items-center justify-center rounded-md transition-all duration-150 shadow-sm"
              style={{
                width: '20px',
                height: '36px',
                background: isDraggingState
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--background))',
                border: `1.5px solid ${isDraggingState ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                boxShadow: isDraggingState
                  ? '0 0 0 3px hsl(var(--primary) / 0.15)'
                  : '0 1px 3px hsl(0 0% 0% / 0.08)',
              }}
            >
              <GripVertical
                className="transition-colors duration-150"
                style={{
                  width: '11px',
                  height: '11px',
                  color: isDraggingState
                    ? 'hsl(var(--primary-foreground))'
                    : 'hsl(var(--muted-foreground))',
                }}
              />
            </div>
          </div>
        )}

        {/* Right iframe */}
        {showRight && rightPercent > 0 && (
          <div
            className="flex flex-col overflow-hidden"
            style={{ width: `${rightPercent}%`, flexShrink: 0 }}
          >
            <div className="flex items-center gap-1 px-2 py-1 bg-muted/60 border-b border-l text-xs text-muted-foreground font-medium flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1" />
              PREVIEW
            </div>
            <iframe
              src={secondaryUrl}
              className="w-full flex-1 border-0 border-l"
              style={{ pointerEvents: isDraggingState ? 'none' : 'auto' }}
              allow="accelerometer; camera; encrypted-media; geolocation; microphone; midi; usb; xr-spatial-tracking"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= Main OutputPanel ================= */

export function OutputPanel() {
  const dispatch = useAppDispatch();
  const { selectedTool, outputs, loading, loadingTool } = useAppSelector((state) => state.tools);
  const { selectedProject } = useAppSelector((state) => state.projects);

  const sessionId = selectedProject?.id
    ? localStorage.getItem(`n8n_session_id_${selectedProject.id}`)
    : null;
  const editorUrl = sessionId
    ? `https://code-generation-server.eastus2.cloudapp.azure.com/${sessionId}/editor/`
    : null;
  const previewUrl = sessionId
    ? `https://code-generation-server.eastus2.cloudapp.azure.com/${sessionId}/preview/`
    : null;

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [maximizedCodeTool, setMaximizedCodeTool] = useState(null);

  const handleRefresh = (tool) => {
    if (!selectedProject) return;

    const payload = {
      projectId: selectedProject.id,
      usecase: selectedProject.usecase,
      projectName: selectedProject.projectName,
    };

    if (tool && tool !== 'orchestrator') {
      dispatch(runTool({ tool, payload }));
    } else {
      dispatch(runOrchestrator(payload));
    }
  };

  const openPreview = (imageSource) => {
    if (imageSource) {
      setPreviewImage(imageSource);
      setPreviewOpen(true);
    }
  };

  const toggleMaximize = (toolName, data) => {
    if (maximizedCodeTool) {
      setMaximizedCodeTool(null);
    } else if (data) {
      setMaximizedCodeTool({ tool: toolName, data });
    }
  };

  /* ================= Orchestrator — Maximized Code View ================= */

  if (selectedTool === 'orchestrator' && maximizedCodeTool) {
    return (
      <div className="flex flex-col h-full bg-background" style={{ flex: 1, minWidth: 0 }}>
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold">
            {maximizedCodeTool.tool === 'code_gen' && 'Code Generation'}
            {maximizedCodeTool.tool === 'cicd' && 'CI/CD'}
            {maximizedCodeTool.tool === 'test_cases' && 'Test Cases'}
            {maximizedCodeTool.tool === 'test_data' && 'Test Data'}
          </h2>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMaximizedCodeTool(null)}
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRefresh(maximizedCodeTool.tool)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {editorUrl && previewUrl ? (
            <DualIframeView primaryUrl={editorUrl} secondaryUrl={previewUrl} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No session found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================= Orchestrator — Normal Workflow View ================= */

  if (selectedTool === 'orchestrator') {
    return (
      <div className="flex flex-col h-full bg-background" style={{ flex: 1, minWidth: 0 }}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Workflow Output</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefresh('orchestrator')}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run Workflow
          </Button>
        </div>

        {loading && (
          <div className="px-4 py-2">
            <Progress value={33} className="h-1" />
          </div>
        )}

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
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
              onViewImage={outputs.arch_gen?.image ? () => openPreview(outputs.arch_gen.image) : null}
            >
              <ArchitectureOutput data={outputs.arch_gen} />
            </OutputCard>

            <OutputCard
              title="Architecture Validation"
              icon={<ImageIcon className="h-4 w-4" />}
              loading={loadingTool === 'arch_val'}
              onRefresh={() => handleRefresh('arch_val')}
              onViewImage={outputs.arch_val?.image ? () => openPreview(outputs.arch_val.image) : null}
            >
              <ArchitectureOutput data={outputs.arch_val} />
            </OutputCard>

            {/* Code Base — DualIframeView inside fixed-height container */}
            <OutputCard
              title="Code Base"
              icon={<Code className="h-4 w-4" />}
              loading={loadingTool === 'code_gen'}
              onRefresh={() => handleRefresh('code_gen')}
              onMaximize={
                outputs.code_gen && editorUrl
                  ? () => toggleMaximize('code_gen', outputs.code_gen)
                  : null
              }
            >
              {outputs.code_gen && editorUrl && previewUrl ? (
                <div
                  className="rounded-lg overflow-hidden border"
                  style={{ height: '400px' }}
                >
                  <DualIframeView primaryUrl={editorUrl} secondaryUrl={previewUrl} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No data found</p>
              )}
            </OutputCard>
          </div>
        </ScrollArea>

        {/* Image Modal */}
        {previewOpen && previewImage && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
            onClick={() => setPreviewOpen(false)}
          >
            <div
              className="bg-white rounded-xl shadow-xl p-6 max-w-[85vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                className="max-w-full max-h-[75vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================= Individual Tool View ================= */

  const isCodeTool = ['code_gen', 'cicd', 'test_cases', 'test_data'].includes(selectedTool);

  if (isCodeTool) {
    const toolData = outputs[selectedTool];

    if (!sessionId || !editorUrl || !previewUrl) {
      return (
        <div className="flex flex-col h-full bg-background items-center justify-center">
          <p className="text-sm text-muted-foreground">No session found</p>
        </div>
      );
    }

    const handleOpenNewTab = () => {
      window.open(editorUrl, '_blank');
    };

    const handleOpenVSCode = () => {
      const vscodeUrl = `vscode://file/home/coder`;
      window.location.href = vscodeUrl;
    };

    const handleOpenGitHub = () => {
      if (toolData?.repoUrl) {
        window.open(toolData.repoUrl, '_blank');
      }
    };

    return (
      <div className="flex flex-col h-full bg-background" style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold">{getToolLabel(selectedTool)}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenNewTab}
              title="Open in New Tab"
            >
              <SquareArrowOutUpRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenVSCode}
              title="Open in VS Code"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            {toolData?.repoUrl && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenGitHub}
                title="Open in GitHub"
              >
                <Github className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRefresh(selectedTool)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
            </Button>
          </div>
        </div>

        {/* Dual Iframe Split View */}
        <div className="flex-1 overflow-hidden">
          {toolData ? (
            <DualIframeView
              primaryUrl={editorUrl}
              secondaryUrl={previewUrl}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No data found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================= Non-code Individual Tool View ================= */

  return (
    <div className="flex flex-col h-full bg-background" style={{ flex: 1, minWidth: 0 }}>
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">{getToolLabel(selectedTool)}</h2>

        <div className="flex items-center gap-2">
          {(selectedTool === 'arch_gen' || selectedTool === 'arch_val') && (
            <Button size="sm" variant="secondary" onClick={() => {
              const img = selectedTool === 'arch_gen'
                ? outputs.arch_gen?.image
                : outputs.arch_val?.image;
              openPreview(img);
            }}>
              View image
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefresh(selectedTool)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <IndividualToolOutput
          tool={selectedTool}
          outputs={outputs}
          loading={loading}
        />
      </ScrollArea>

      {/* Image Modal */}
      {previewOpen && previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 max-w-[85vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              className="max-w-full max-h-[75vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Sub Components ================= */

function OutputCard({ title, icon, children, loading, onRefresh, onViewImage, onMaximize }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onViewImage && (
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                onClick={onViewImage}
              >
                <Eye className="h-3 w-3 mr-1" />
                View image
              </Button>
            )}
            {onMaximize && (
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                onClick={onMaximize}
              >
                <Maximize2 className="h-3 w-3 mr-1" />
              </Button>
            )}
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onRefresh}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function EpicsOutput({ data }: { data?: { titles: string[]; ids?: string[]; jiraUrl: string } }) {
  if (!data || !data.titles || data.titles.length === 0) {
    return <p className="text-sm text-muted-foreground">No data found</p>;
  }

  return (
    <div className="space-y-3">
      {data.titles.slice(0, 2).map((title: string, i: number) => (
        <div key={i} className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">
            {data.ids?.[i] && (
              <span className="text-primary font-semibold mr-2">{data.ids[i]}</span>
            )}
            {title}
          </p>
        </div>
      ))}
      {data.jiraUrl && (
        <Button variant="link" size="sm" className="p-0 h-auto" asChild>
          <a href={data.jiraUrl} target="_blank" rel="noopener noreferrer">
            View in JIRA <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      )}
    </div>
  );
}

function ArchitectureOutput({ data }) {
  if (!data?.image)
    return <p className="text-sm text-muted-foreground">No data found</p>;

  return (
    <div className="relative h-[320px] rounded-lg overflow-hidden border bg-muted">
      <img src={data.image} className="w-full h-full object-contain" />
    </div>
  );
}

function StackBlitzOutput({ data, fullHeight = false, isOrchestrator = false }) {
  const { selectedProject } = useAppSelector((state) => state.projects);
  const sessionId = selectedProject?.id
    ? localStorage.getItem(`n8n_session_id_${selectedProject.id}`)
    : null;

  if (!sessionId) {
    return (
      <p className="text-sm text-muted-foreground">
        No session found
      </p>
    );
  }

  const localHostUrl = `https://code-generation-server.eastus2.cloudapp.azure.com/${sessionId}/`;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        No data found
      </p>
    );
  }

  const handleOpenNewTab = () => {
    window.open(localHostUrl, '_blank');
  };

  const handleOpenVSCode = () => {
    const vscodeUrl = `vscode://file/home/coder`;
    window.location.href = vscodeUrl;
  };

  const handleOpenGitHub = () => {
    if (data.repoUrl) {
      window.open(data.repoUrl, '_blank');
    }
  };

  return (
    <div className={`flex flex-col ${fullHeight ? 'h-full' : 'space-y-3'}`}>
      <div
        className="relative rounded-lg overflow-hidden border bg-muted"
        style={{
          height: fullHeight
            ? '100%'
            : isOrchestrator
            ? '320px'
            : '300px',
          minHeight: isOrchestrator ? '320px' : undefined,
        }}
      >
        <iframe
          ref={iframeRef}
          src={localHostUrl}
          className="w-full h-full"
          allow="accelerometer; camera; encrypted-media; geolocation; microphone; midi; usb; xr-spatial-tracking"
        />
      </div>

      {!fullHeight && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenNewTab}
            title="Open in New Tab"
          >
            <SquareArrowOutUpRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenVSCode}
            title="Open in VS Code"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenGitHub}
            title="Open in GitHub"
          >
            <Github className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function IndividualToolOutput({ tool, outputs, loading }: { tool: string; outputs: any; loading: boolean }) {
  const isCodeTool = ['code_gen', 'cicd', 'test_cases', 'test_data'].includes(tool);

  switch (tool) {
    case 'epics':
      return <EpicsOutput data={outputs.epics_and_user_stories} />;
    case 'arch_gen':
      return <ArchitectureOutput data={outputs.arch_gen} />;
    case 'arch_val':
      return <ArchitectureOutput data={outputs.arch_val} />;
    case 'code_gen':
      return <StackBlitzOutput data={outputs.code_gen} fullHeight={isCodeTool} />;
    case 'cicd':
      return <StackBlitzOutput data={outputs.cicd} fullHeight={isCodeTool} />;
    case 'test_cases':
      return <StackBlitzOutput data={outputs.test_cases} fullHeight={isCodeTool} />;
    case 'test_data':
      return <StackBlitzOutput data={outputs.test_data} fullHeight={isCodeTool} />;
    default:
      return <p className="text-sm text-muted-foreground">Select a tool to view output</p>;
  }
}
