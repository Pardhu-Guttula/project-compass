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
  SquareArrowOutUpRight
} from 'lucide-react';
import { getToolLabel } from '@/constants/tools';
import { useRef, useState } from 'react';
import { EpicsAccordion } from '@/components/EpicsAccordion';

export function OutputPanel() {
  const dispatch = useAppDispatch();
  const { selectedTool, outputs, loading, loadingTool } = useAppSelector((state) => state.tools);
  const { selectedProject } = useAppSelector((state) => state.projects);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [maximizedCodeTool, setMaximizedCodeTool] = useState(null);

  const handleRefresh = (tool?: string) => {
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

  const toggleMaximize = (toolName: string, data: any) => {
    if (maximizedCodeTool) {
      setMaximizedCodeTool(null);
    } else if (data) {
      setMaximizedCodeTool({ tool: toolName, data });
    }
  };

  /* ================= Orchestrator View ================= */

  if (selectedTool === 'orchestrator') {
    if (maximizedCodeTool) {
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
            <StackBlitzOutput data={maximizedCodeTool.data} fullHeight />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-background" style={{ flex: 1, minWidth: 0 }}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Workflow Output</h2>
          {/* FIX: was passing maximizedCodeTool.tool (null crash) — now calls handleRefresh() with no args to trigger orchestrator */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefresh()}
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
            {outputs.epics_and_user_stories
               ? <EpicsAccordion data={outputs.epics_and_user_stories} />
               : <p className="text-sm text-muted-foreground">No data found</p>
            }
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

            <OutputCard
              title="Code Base"
              icon={<Code className="h-4 w-4" />}
              loading={loadingTool === 'code_gen'}
              onRefresh={() => handleRefresh('code_gen')}
              onMaximize={outputs.code_gen ? () => toggleMaximize('code_gen', outputs.code_gen) : null}
            >
              <StackBlitzOutput data={outputs.code_gen} isOrchestrator={true} />
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

    const sessionId = selectedProject?.id
      ? localStorage.getItem(`n8n_session_id_${selectedProject.id}`)
      : null;

    if (!sessionId) {
      return (
        <div className="flex flex-col h-full bg-background items-center justify-center">
          <p className="text-sm text-muted-foreground">No session found</p>
        </div>
      );
    }

    const localHostUrl = `https://code-generation-server.eastus2.cloudapp.azure.com/${sessionId}/editor/`;

    const handleOpenNewTab = () => {
      window.open(localHostUrl, '_blank');
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

        <div className="flex-1 overflow-hidden">
          <IndividualToolOutput
            tool={selectedTool}
            outputs={outputs}
            loading={loading}
          />
        </div>
      </div>
    );
  }

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

function OutputCard({ title, icon, children, loading, onRefresh, onViewImage = null, onMaximize = null }) {
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

function ArchitectureOutput({ data }) {
  if (!data?.image)
    return <p className="text-sm text-muted-foreground">No data found</p>;

  return (
    <div className="relative h-[320px] rounded-lg overflow-hidden border bg-muted">
      <img src={data.image} className="w-full h-full object-contain" />
    </div>
  );
}

function StackBlitzOutput({
  data,
  fullHeight = false,
  isOrchestrator = false,
}: {
  data: any;
  fullHeight?: boolean;
  isOrchestrator?: boolean;
}) {
  const { selectedProject } = useAppSelector((state) => state.projects);

  // FIX: useRef must be called unconditionally (Rules of Hooks) — moved above early returns
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

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

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        No data found
      </p>
    );
  }

  const localHostUrl = `https://code-generation-server.eastus2.cloudapp.azure.com/${sessionId}/editor/`;

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
          onLoad={() => {
            const iframe = iframeRef.current;
            if (!iframe) return;

    // wait a moment for editor to fully boot
            setTimeout(() => {
              try {
                const win = iframe.contentWindow;

                win?.document.dispatchEvent(
                  new KeyboardEvent("keydown", {
                    key: "`",
                    code: "Backquote",
                    ctrlKey: true,
                    bubbles: true,
                  })
              );

              console.log("✅ Terminal shortcut triggered");
            } catch (err) {
              console.log("❌ Browser blocked iframe keyboard injection");
            }
          }, 1500);
        }}
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

function IndividualToolOutput({
  tool,
  outputs,
  loading,
}: {
  tool: string;
  outputs: any;
  loading: boolean;
}) {
  const isCodeTool = ['code_gen', 'cicd', 'test_cases', 'test_data'].includes(tool);

  switch (tool) {
    case 'epics':
      return <EpicsAccordion data={outputs.epics_and_user_stories} />;
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