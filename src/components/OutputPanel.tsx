import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { runOrchestrator, runTool } from '@/features/tools/toolsThunks';
import { getSpecialSessionId } from "@/components/session";

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
  GitBranch,
  X,
  RotateCcw,
} from 'lucide-react';
import { getToolLabel } from '@/constants/tools';
import { useRef, useState, useCallback, useEffect } from 'react';
import { styles, inlineStyles } from './Oppstyle';

const PORT_OPTIONS = [
  { value: '5173', label: ':5173 — Vite (React)' },
  { value: '3000', label: ':3000 — React / Next.js' },
  { value: '3001', label: ':3001 — Node.js Backend' },
  { value: '8000', label: ':8000 — Python (Flask/Django)' },
  { value: '8888', label: ':8888 — Java Spring Boot' },
];

function StatusBar({ activePort }: { activePort: string }) {

  const [activePorts, setActivePorts] = useState<number[]>([]);

  useEffect(() => {
    if (!activePort) return;
    
    const checkPort = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);

      await fetch(`http://localhost:${activePort}`, {
        mode: 'no-cors',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      setActivePorts([parseInt(activePort)]);
    } catch {
      setActivePorts([]);
    }
  };

  checkPort();
}, [activePort]);

  const isCurrentPortActive = activePorts.includes(parseInt(activePort));

  return (
    <div className={styles.statusBar}>
      <div className={styles.statusItem}>
        <span className={styles.statusDot} />
        Workspace Ready
      </div>
      <span className="ml-auto">
        {isCurrentPortActive
          ? `Active: ${activePorts.map((p) => ':' + p).join(', ')}`
          : ' '}
      </span>
    </div>
  );
}

/* ================= DualIframeView ================= */
interface DualIframeViewProps {
  primaryUrl: string;
  secondaryUrl: string;
  sessionId?: string | null;
  showCloneButton?: boolean;
  showStatusBar?: boolean;
  showPortSelector?: boolean;
  showExternalButtons?: boolean;
  repoUrl?: string | null;
}

function DualIframeView({
  primaryUrl,
  secondaryUrl,
  sessionId,
  showCloneButton = false,
  showStatusBar = false,
  showPortSelector = false,
  showExternalButtons = false,
  repoUrl,
}: DualIframeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorFrameRef = useRef<HTMLIFrameElement>(null);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const isDragging = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  const [leftWidth, setLeftWidth] = useState(50);
  const [activePanel, setActivePanel] = useState<'both' | 'left' | 'right'>('both');
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [selectedPort, setSelectedPort] = useState('5173');
  const [showCloneModal, setShowCloneModal] = useState(false);

  const portPreviewUrl = sessionId
    ? `https://code-generation-server.eastus2.cloudapp.azure.com/${sessionId}/preview/?port=${selectedPort}`
    : secondaryUrl;
  const effectivePreviewUrl = showPortSelector ? portPreviewUrl : secondaryUrl;

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
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const rawPercent = ((e.clientX - rect.left) / rect.width) * 100;
        setLeftWidth(Math.min(85, Math.max(15, rawPercent)));
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
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Keyboard shortcuts: Ctrl+1 editor, Ctrl+2 split, Ctrl+3 preview
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') { e.preventDefault(); setActivePanel('left'); }
        if (e.key === '2') { e.preventDefault(); setActivePanel('both'); setLeftWidth(50); }
        if (e.key === '3') { e.preventDefault(); setActivePanel('right'); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleRefreshPreview = () => {
    if (previewFrameRef.current) previewFrameRef.current.src = previewFrameRef.current.src;
  };
  const handleOpenNewTab = () => window.open(primaryUrl, '_blank');
  const handleOpenVSCode = () => { window.location.href = `vscode://`; };
  const handleOpenGitHub = () => { if (repoUrl) window.open(repoUrl, '_blank'); };
  const handleOpenPreviewTab = () => window.open(effectivePreviewUrl, '_blank');

  const showLeft = activePanel === 'both' || activePanel === 'left';
  const showRight = activePanel === 'both' || activePanel === 'right';
  const leftPercent = activePanel === 'left' ? 100 : activePanel === 'right' ? 0 : leftWidth;
  const rightPercent = 100 - leftPercent;

  return (
    <div className="flex flex-col h-full">

      {/* ── IDE Toolbar ── */}
      <div className={styles.ideToolbar}>

        {/* LEFT: Preview action buttons + port selector */}
        <div className={styles.toolbarLeftGroup}>
          {showExternalButtons && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={styles.externalBtn}
                onClick={handleOpenNewTab}
                title="Open editor in new tab"
              >
                <SquareArrowOutUpRight className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={styles.externalBtn}
                onClick={handleOpenVSCode}
                title="Open in VS Code"
              >
                <Monitor className="h-3 w-3" />
              </Button>
              {repoUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={styles.externalBtn}
                  onClick={handleOpenGitHub}
                  title="Open in GitHub"
                >
                  <Github className="h-3 w-3" />
                </Button>
              )}
              <div className={styles.toolbarDivider} />
            </>
          )}

          {/* Port selector — compact, no "PORT" label */}
          {showPortSelector && activePanel !== 'left' && (
            <div className={styles.portSelectorWrapper}>
              <select
                value={selectedPort}
                onChange={(e) => setSelectedPort(e.target.value)}
                className={styles.portSelectorSelect}
                title="Select port"
              >
                {PORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* RIGHT: Refresh + open preview + divider + layout toggles */}
        <div className={styles.toolbarRightGroup}>
          {showPortSelector && activePanel !== 'left' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={styles.portSelectorBtn}
                onClick={handleRefreshPreview}
                title="Refresh preview"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={styles.portSelectorBtn}
                onClick={handleOpenPreviewTab}
                title="Open preview in new tab"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <div className={styles.toolbarDivider} />
            </>
          )}
        </div>

        <div className={styles.layoutToggleGroup}>
          <Button
            variant="ghost"
            size="icon"
            className={styles.layoutToggleBtn}
            data-active={activePanel === 'left'}
            title="Editor only (Ctrl+1)"
            onClick={() => setActivePanel(activePanel === 'left' ? 'both' : 'left')}
          >
            <PanelLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={styles.layoutToggleBtn}
            data-active={activePanel === 'both'}
            title="Split view (Ctrl+2)"
            onClick={() => { setActivePanel('both'); setLeftWidth(50); }}
          >
            <Columns2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={styles.layoutToggleBtn}
            data-active={activePanel === 'right'}
            title="Preview only (Ctrl+3)"
            onClick={() => setActivePanel(activePanel === 'right' ? 'both' : 'right')}
          >
            <PanelRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* ── Split container ── */}
      <div
        ref={containerRef}
        className={styles.splitContainer}
        style={{ minHeight: 0 }}
      >
        {/* Left — Editor iframe */}
        {showLeft && leftPercent > 0 && (
          <div
            className={styles.panelColumn}
            style={{ width: `${leftPercent}%`, flexShrink: 0 }}
          >
            <div className={styles.panelStrip}>
              <span className={styles.dotBlue} />
              Editor (VS Code)
            </div>
            <iframe
              ref={editorFrameRef}
              src={primaryUrl}
              className={styles.editorIframe}
              style={inlineStyles.iframePointerEvents(isDraggingState)}
              allow="accelerometer; camera; encrypted-media; geolocation; microphone; midi; usb; xr-spatial-tracking"
            />
          </div>
        )}

        {/* Drag handle */}
        {activePanel === 'both' && (
          <div
            onMouseDown={onMouseDown}
            className={styles.dragHandleOuter}
            style={inlineStyles.dragHandleOuter(isDraggingState)}
            title="Drag to resize"
          >
            <div
              className={styles.dragHandleInnerLine}
              style={inlineStyles.dragHandleLine(isDraggingState)}
            />
            <div
              className={styles.dragHandleKnob}
              style={inlineStyles.dragHandleKnob(isDraggingState)}
            >
              <GripVertical style={inlineStyles.gripIcon(isDraggingState)} />
            </div>
          </div>
        )}

        {/* Right — Preview iframe */}
        {showRight && rightPercent > 0 && (
          <div
            className={styles.panelColumn}
            style={{ width: `${rightPercent}%`, flexShrink: 0 }}
          >
            <div className={styles.panelStripRight}>
              <span className={styles.dotEmerald} />
              Live Preview
              {showPortSelector && (
                <span className={styles.portLabel}>:{selectedPort}</span>
              )}
            </div>
            <iframe
              ref={previewFrameRef}
              src={effectivePreviewUrl}
              className={styles.previewIframe}
              style={inlineStyles.iframePointerEvents(isDraggingState)}
              allow="accelerometer; camera; encrypted-media; geolocation; microphone; midi; usb; xr-spatial-tracking"
            />
          </div>
        )}
      </div>

      {/* ── Status Bar ── */}
      {showStatusBar && <StatusBar activePort={selectedPort} />}
    </div>
  );
}

/* ================= Main OutputPanel ================= */

export function OutputPanel() {
  const dispatch = useAppDispatch();
  const { selectedTool, outputs, loading, loadingTool } = useAppSelector(
    (state) => state.tools,
  );
  const { selectedProject } = useAppSelector((state) => state.projects);

  // const sessionId = selectedProject?.id
  //   ? localStorage.getItem(`n8n_session_id_${selectedProject.id}`)
  //   : null;
  const normalSessionId = selectedProject?.id
  ? localStorage.getItem(`n8n_session_id_${selectedProject.id}`)
  : null;

const specialSessionId = getSpecialSessionId();

const sessionId = specialSessionId ?? normalSessionId;
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

  if (selectedTool === 'orchestrator' && maximizedCodeTool) {
    return (
      <div className={styles.panelRoot} style={{ flex: 1, minWidth: 0 }}>
        <div className={styles.sectionHeaderFlex}>
          <h2 className={styles.sectionTitle}>
            {maximizedCodeTool.tool === 'code_gen' && 'Code Generation'}
            {maximizedCodeTool.tool === 'cicd' && 'CI/CD'}
            {maximizedCodeTool.tool === 'test_cases' && 'Test Cases'}
            {maximizedCodeTool.tool === 'test_data' && 'Test Data'}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setMaximizedCodeTool(null)}>
              <Minimize2 className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRefresh(maximizedCodeTool.tool)}
              disabled={loading}
            >
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <RefreshCw className="h-4 w-4 mr-2" />}
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {editorUrl && previewUrl ? (
            <DualIframeView
              primaryUrl={editorUrl}
              secondaryUrl={previewUrl}
              sessionId={sessionId}
              showCloneButton
              showStatusBar
              showPortSelector
              showExternalButtons
              repoUrl={outputs[maximizedCodeTool.tool]?.repoUrl}
            />
          ) : (
            <div className={styles.emptyCenter}>
              <p className={styles.emptyState}>No session found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedTool === 'orchestrator') {
    return (
      <div className={styles.panelRoot} style={{ flex: 1, minWidth: 0 }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Workflow Output</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefresh('orchestrator')}
            disabled={loading}
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
              : <RefreshCw className="h-4 w-4 mr-2" />}
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
              onViewImage={
                outputs.arch_gen?.image
                  ? () => openPreview(outputs.arch_gen.image)
                  : null
              }
            >
              <ArchitectureOutput data={outputs.arch_gen} />
            </OutputCard>

            <OutputCard
              title="Architecture Validation"
              icon={<ImageIcon className="h-4 w-4" />}
              loading={loadingTool === 'arch_val'}
              onRefresh={() => handleRefresh('arch_val')}
              onViewImage={
                outputs.arch_val?.image
                  ? () => openPreview(outputs.arch_val.image)
                  : null
              }
            >
              <ArchitectureOutput data={outputs.arch_val} />
            </OutputCard>

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
                  className={styles.codeBaseIframeWrapper}
                  style={inlineStyles.codeBaseCard(440)}
                >
                  <DualIframeView
                    primaryUrl={editorUrl}
                    secondaryUrl={previewUrl}
                    sessionId={sessionId}
                    showCloneButton
                    showStatusBar
                    showPortSelector
                    showExternalButtons
                    repoUrl={outputs.code_gen?.repoUrl}
                  />
                </div>
              ) : (
                <p className={styles.emptyState}>No data found</p>
              )}
            </OutputCard>
          </div>
        </ScrollArea>

        {/* Image lightbox */}
        {previewOpen && previewImage && (
          <div
            className={styles.lightboxBackdrop}
            onClick={() => setPreviewOpen(false)}
          >
            <div
              className={styles.lightboxCard}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={previewImage} className={styles.lightboxImage} />
            </div>
          </div>
        )}
      </div>
    );
  }

  const isCodeTool = ['code_gen', 'cicd', 'test_cases', 'test_data'].includes(selectedTool);

  if (isCodeTool) {
    const toolData = outputs[selectedTool];

    if (!sessionId || !editorUrl || !previewUrl) {
      return (
        <div className={`${styles.panelRoot} items-center justify-center`}>
          <p className={styles.emptyState}>No session found</p>
        </div>
      );
    }

    return (
      <div className={styles.panelRoot} style={{ flex: 1, minWidth: 0 }}>
        <div className={styles.sectionHeaderFlex}>
          <h2 className={styles.sectionTitle}>{getToolLabel(selectedTool)}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefresh(selectedTool)}
            disabled={loading}
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
              : <RefreshCw className="h-4 w-4 mr-2" />}
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          {toolData ? (
            <DualIframeView
              primaryUrl={editorUrl}
              secondaryUrl={previewUrl}
              sessionId={sessionId}
              showCloneButton
              showStatusBar
              showPortSelector
              showExternalButtons
              repoUrl={toolData?.repoUrl}
            />
          ) : (
            <div className={styles.emptyCenter}>
              <p className={styles.emptyState}>No data found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panelRoot} style={{ flex: 1, minWidth: 0 }}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{getToolLabel(selectedTool)}</h2>
        <div className="flex items-center gap-2">
          {(selectedTool === 'arch_gen' || selectedTool === 'arch_val') && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const img =
                  selectedTool === 'arch_gen'
                    ? outputs.arch_gen?.image
                    : outputs.arch_val?.image;
                openPreview(img);
              }}
            >
              View image
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefresh(selectedTool)}
            disabled={loading}
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
              : <RefreshCw className="h-4 w-4 mr-2" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <IndividualToolOutput tool={selectedTool} outputs={outputs} loading={loading} />
      </ScrollArea>

      {/* Image lightbox */}
      {previewOpen && previewImage && (
        <div
          className={styles.lightboxBackdrop}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className={styles.lightboxCard}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewImage} className={styles.lightboxImage} />
          </div>
        </div>
      )}
    </div>
  );
}


function OutputCard({ title, icon, children, loading, onRefresh, onViewImage, onMaximize }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className={styles.outputCardHeaderRow}>
          <CardTitle className={styles.outputCardTitle}>
            {icon}
            {title}
          </CardTitle>
          <div className={styles.outputCardActions}>
            {onViewImage && (
              <Button
                variant="outline"
                size="sm"
                className={styles.outputCardActionBtn}
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
                className={styles.outputCardActionBtn}
                onClick={onMaximize}
              >
                <Maximize2 className="h-3 w-3 mr-1" />
              </Button>
            )}
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className={styles.outputCardRefreshBtn}
                onClick={onRefresh}
                disabled={loading}
              >
                {loading
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <RefreshCw className="h-3 w-3" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function EpicsOutput({
  data,
}: {
  data?: { titles: string[]; ids?: string[]; jiraUrl: string };
}) {
  if (!data || !data.titles || data.titles.length === 0) {
    return <p className={styles.emptyState}>No data found</p>;
  }
  return (
    <div className="space-y-3">
      {data.titles.slice(0, 2).map((title: string, i: number) => (
        <div key={i} className={styles.epicItem}>
          <p className={styles.epicTitle}>
            {data.ids?.[i] && (
              <span className={styles.epicId}>{data.ids[i]}</span>
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
  if (!data?.image) return <p className={styles.emptyState}>No data found</p>;
  return (
    <div className={styles.archImageWrapper}>
      <img src={data.image} className={styles.archImage} />
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
  const sessionId = selectedProject?.id
    ? localStorage.getItem(`n8n_session_id_${selectedProject.id}`)
    : null;

  if (!sessionId) return <p className={styles.emptyState}>No session found</p>;

  const localHostUrl = `https://code-generation-server.eastus2.cloudapp.azure.com/${sessionId}/`;

  if (!data) return <p className={styles.emptyState}>No data found</p>;

  return (
    <div className={`flex flex-col ${fullHeight ? 'h-full' : 'space-y-3'}`}>
      <div
        className={styles.stackBlitzWrapper}
        style={inlineStyles.stackBlitzFrame(fullHeight, isOrchestrator)}
      >
        <iframe
          src={localHostUrl}
          className={styles.stackBlitzIframe}
          allow="accelerometer; camera; encrypted-media; geolocation; microphone; midi; usb; xr-spatial-tracking"
        />
      </div>
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
      return <p className={styles.emptyState}>Select a tool to view output</p>;
  }
}
