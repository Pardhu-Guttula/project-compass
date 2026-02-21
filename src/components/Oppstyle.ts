export const styles = {
  /* Root wrappers */
  panelRoot: 'flex flex-col h-full bg-background',
  panelRootFlex: 'flex flex-col h-full bg-background',

  /* ── IDE Toolbar ─────────────────────────────────────────── */
  ideToolbar:
    'flex items-center gap-1.5 px-3 h-9 border-b bg-muted/30 flex-shrink-0',

  /* Left group: preview controls (refresh, external, vscode, github) */
  toolbarLeftGroup: 'flex items-center gap-0.5',

  /* Port selector area — compact */
  portSelectorWrapper: 'flex items-center gap-1',
  portSelectorLabel:
    'text-[9px] text-muted-foreground/60 font-semibold uppercase tracking-widest select-none',
  portSelectorSelect:
    'h-6 text-[11px] border-0 rounded px-1.5 bg-muted/60 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer appearance-none font-mono',
  portSelectorBtn: 'h-6 w-6 text-muted-foreground/70 hover:text-foreground',

  /* Toolbar divider */
  toolbarDivider: 'w-px h-4 bg-border/60 mx-1',

  /* External action buttons */
  externalBtn: 'h-6 w-6 text-muted-foreground/70 hover:text-foreground',

  /* Right group: preview actions before layout toggles */
  toolbarRightGroup: 'ml-auto flex items-center gap-0.5',

  /* Right group: layout toggles — pushed to far right */
  layoutToggleGroup:
    'flex items-center gap-0 border border-border/60 rounded-md overflow-hidden bg-background/80',
  layoutToggleBtn:
    'h-6 w-7 rounded-none border-0 border-r border-border/60 last:border-r-0 text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 data-[active=true]:bg-muted data-[active=true]:text-foreground transition-colors',

  /* ── Split container ─────────────────────────────────────── */
  splitContainer: 'flex flex-1 overflow-hidden relative',

  /* Panel columns */
  panelColumn: 'flex flex-col overflow-hidden',

  /* Panel header strips (CODE / PREVIEW) */
  panelStrip:
    'flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 border-b text-[11px] text-muted-foreground/80 font-medium flex-shrink-0 select-none',
  panelStripRight:
    'flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 border-b border-l text-[11px] text-muted-foreground/80 font-medium flex-shrink-0 select-none',

  dotBlue: 'w-1.5 h-1.5 rounded-full bg-blue-400 inline-block',
  dotEmerald: 'w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block',

  portLabel: 'ml-0.5 text-muted-foreground/50 font-mono text-[10px]',

  /* iframes */
  editorIframe: 'w-full flex-1 border-0',
  previewIframe: 'w-full flex-1 border-0 border-l',

  /* Drag handle wrapper */
  dragHandleOuter:
    'relative flex-shrink-0 flex items-center justify-center group z-10',
  dragHandleInnerLine:
    'absolute inset-y-0 left-1/2 -translate-x-1/2 w-px transition-colors duration-150',
  dragHandleKnob:
    'relative z-10 flex flex-col items-center justify-center rounded-md transition-all duration-150 shadow-sm',

  /* ── Status bar ──────────────────────────────────────────── */
  statusBar:
    'flex items-center gap-3 px-3 h-5 bg-primary/90 text-primary-foreground text-[10px] flex-shrink-0 overflow-hidden',
  statusDot: 'w-1.5 h-1.5 rounded-full bg-green-400 inline-block',
  statusItem: 'flex items-center gap-1.5',

  /* ── Clone Repo Modal ────────────────────────────────────── */
  modalBackdrop:
    'fixed inset-0 z-50 flex items-center justify-center bg-black/60',
  modalCard:
    'bg-background border rounded-xl shadow-2xl p-6 w-[480px] max-w-[90vw]',
  modalHeader: 'flex items-center justify-between mb-1',
  modalTitle: 'text-base font-semibold flex items-center gap-2',
  modalSubtitle: 'text-xs text-muted-foreground mb-4',
  modalCloseBtn:
    'text-muted-foreground hover:text-foreground transition-colors',
  modalFieldsWrapper: 'space-y-3',
  modalLabel: 'text-xs text-muted-foreground block mb-1',
  modalInput:
    'w-full px-3 py-2 text-sm rounded-md border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-primary',
  modalNote: 'text-xs text-muted-foreground mt-1',
  modalActions: 'flex gap-2 mt-5',
  modalStatusIdle: 'mt-3 text-xs text-muted-foreground',
  modalStatusSuccess: 'mt-3 text-xs text-green-600 dark:text-green-400',
  modalStatusError: 'mt-3 text-xs text-destructive',

  /* ── OutputCard ──────────────────────────────────────────── */
  outputCardHeaderRow: 'flex items-center justify-between',
  outputCardTitle: 'text-sm font-medium flex items-center gap-2',
  outputCardActions: 'flex items-center gap-2',
  outputCardActionBtn: 'h-7',
  outputCardRefreshBtn: 'h-7 w-7',

  /* ── Section headers ─────────────────────────────────────── */
  sectionHeader: 'p-4 border-b flex items-center justify-between',
  sectionHeaderFlex:
    'p-4 border-b flex items-center justify-between flex-shrink-0',
  sectionTitle: 'text-lg font-semibold',

  /* ── Code Base card inner iframe wrapper ─────────────────── */
  codeBaseIframeWrapper: 'rounded-lg overflow-hidden border',

  /* ── Architecture output ─────────────────────────────────── */
  archImageWrapper:
    'relative h-[320px] rounded-lg overflow-hidden border bg-muted',
  archImage: 'w-full h-full object-contain',

  /* ── Epics output ────────────────────────────────────────── */
  epicItem: 'p-3 bg-muted rounded-lg',
  epicTitle: 'text-sm font-medium',
  epicId: 'text-primary font-semibold mr-2',

  /* ── Empty / error states ────────────────────────────────── */
  emptyState: 'text-sm text-muted-foreground',
  emptyCenter: 'flex items-center justify-center h-full',

  /* ── Image lightbox modal ────────────────────────────────── */
  lightboxBackdrop:
    'fixed inset-0 z-50 bg-black/60 flex items-center justify-center',
  lightboxCard:
    'bg-white rounded-xl shadow-xl p-6 max-w-[85vw] max-h-[85vh]',
  lightboxImage: 'max-w-full max-h-[75vh] object-contain',

  stackBlitzWrapper: 'relative rounded-lg overflow-hidden border bg-muted',
  stackBlitzIframe: 'w-full h-full',
} as const;

export const inlineStyles = {
  dragHandleOuter: (isDragging: boolean): React.CSSProperties => ({
    width: '10px',
    cursor: 'col-resize',
    background: isDragging ? 'hsl(var(--primary) / 0.10)' : 'transparent',
    transition: 'background 0.15s',
  }),

  dragHandleLine: (isDragging: boolean): React.CSSProperties => ({
    background: isDragging
      ? 'hsl(var(--primary) / 0.6)'
      : 'hsl(var(--border))',
  }),

  dragHandleKnob: (isDragging: boolean): React.CSSProperties => ({
    width: '18px',
    height: '32px',
    background: isDragging
      ? 'hsl(var(--primary))'
      : 'hsl(var(--background))',
    border: `1px solid ${
      isDragging ? 'hsl(var(--primary))' : 'hsl(var(--border))'
    }`,
    boxShadow: isDragging
      ? '0 0 0 3px hsl(var(--primary) / 0.15)'
      : '0 1px 3px hsl(0 0% 0% / 0.08)',
  }),

  gripIcon: (isDragging: boolean): React.CSSProperties => ({
    width: '10px',
    height: '10px',
    color: isDragging
      ? 'hsl(var(--primary-foreground))'
      : 'hsl(var(--muted-foreground))',
  }),

  iframePointerEvents: (isDragging: boolean): React.CSSProperties => ({
    pointerEvents: isDragging ? 'none' : 'auto',
  }),

  codeBaseCard: (height = 440): React.CSSProperties => ({
    height: `${height}px`,
  }),

  stackBlitzFrame: (
    fullHeight: boolean,
    isOrchestrator: boolean,
  ): React.CSSProperties => ({
    height: fullHeight ? '100%' : isOrchestrator ? '320px' : '300px',
    minHeight: isOrchestrator ? '320px' : undefined,
  }),
} as const;