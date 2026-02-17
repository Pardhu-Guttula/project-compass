import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2, Upload, FileText, AlertCircle } from 'lucide-react';
import type { CreateProjectPayload, ProjectType } from '@/types';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateProjectPayload) => void;
  loading?: boolean;
}

const ALLOWED_EXTENSIONS = ['.docx', '.doc', '.pdf', '.txt'];

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: CreateProjectDialogProps) {
  const [projectType, setProjectType] = useState<ProjectType>('greenfield');
  const [projectName, setProjectName] = useState('');
  const [usecase, setUsecase] = useState('');
  const [githubRepoName, setGithubRepoName] = useState('');
  const [githubOwnerName, setGithubOwnerName] = useState('');
  const [jiraBoardName, setJiraBoardName] = useState('');
  const [jiraProject, setJiraProject] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [jiraAccessToken, setJiraAccessToken] = useState('');
  const [githubAccessToken, setGithubAccessToken] = useState('');

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File parsers ────────────────────────────────────────────────────────────

  const parseTxt = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) ?? '');
      reader.onerror = () => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
    });

  const parseDocx = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const loadMammoth = () =>
        new Promise<void>((res, rej) => {
          if ((window as any).mammoth) return res();
          const script = document.createElement('script');
          script.src =
            'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
          script.onload = () => res();
          script.onerror = () => rej(new Error('Failed to load mammoth.js'));
          document.head.appendChild(script);
        });

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          await loadMammoth();
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const result = await (window as any).mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } catch {
          reject(new Error('Failed to parse Word document.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Word document.'));
      reader.readAsArrayBuffer(file);
    });

  const parsePdf = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const PDF_JS_VERSION = '3.11.174';

      const loadPdfJs = () =>
        new Promise<void>((res, rej) => {
          if ((window as any).pdfjsLib) return res();
          const script = document.createElement('script');
          script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.min.js`;
          script.onload = () => {
            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.js`;
            res();
          };
          script.onerror = () => rej(new Error('Failed to load pdf.js'));
          document.head.appendChild(script);
        });

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          await loadPdfJs();
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const pages: string[] = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const text = content.items.map((item: any) => item.str).join(' ');
            pages.push(text);
          }
          resolve(pages.join('\n\n'));
        } catch {
          reject(new Error('Failed to parse PDF. Ensure it is a text-based PDF.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF.'));
      reader.readAsArrayBuffer(file);
    });

  // ── Upload handler ──────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const ext = ('.' + file.name.split('.').pop()?.toLowerCase()) as string;

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError('Only .docx, .doc, .pdf, and .txt files are allowed.');
      setUploadedFileName(null);
      return;
    }

    setUploadError(null);
    setUploadedFileName(null);
    setFileLoading(true);

    try {
      let text = '';
      if (ext === '.txt') {
        text = await parseTxt(file);
      } else if (ext === '.docx' || ext === '.doc') {
        text = await parseDocx(file);
      } else if (ext === '.pdf') {
        text = await parsePdf(file);
      }
      setUsecase(text.trim());
      setUploadedFileName(file.name);
    } catch (err: any) {
      setUploadError(err?.message ?? 'Failed to parse file.');
    } finally {
      setFileLoading(false);
    }
  };

  // ── Clear textarea ──────────────────────────────────────────────────────────

  const handleClearUsecase = () => {
    setUsecase('');
    setUploadedFileName(null);
    setUploadError(null);
  };

  // ── Form handlers ───────────────────────────────────────────────────────────

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (email && email.includes('@') && !users.includes(email)) {
      setUsers([...users, email]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (email: string) => {
    setUsers(users.filter((u) => u !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSubmit = () => {
    const payload: CreateProjectPayload = {
      projectName,
      usecase,
      projectType,
      users,
      githubRepoName,
      githubOwnerName,
      jiraBoard: jiraBoardName,
      jiraProject,
      ...(projectType === 'brownfield' && { jiraAccessToken, githubAccessToken }),
    };
    onSubmit(payload);
    resetForm();
  };

  const resetForm = () => {
    setProjectType('greenfield');
    setProjectName('');
    setUsecase('');
    setGithubRepoName('');
    setGithubOwnerName('');
    setJiraBoardName('');
    setJiraProject('');
    setEmailInput('');
    setUsers([]);
    setJiraAccessToken('');
    setGithubAccessToken('');
    setUploadedFileName(null);
    setUploadError(null);
  };

  const isValid =
    projectName.trim() &&
    usecase.trim() &&
    githubRepoName.trim() &&
    githubOwnerName.trim() &&
    jiraBoardName.trim() &&
    jiraProject.trim();

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Set up a new SDLC project workspace with your team.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">

          {/* Project Type */}
          <div className="grid gap-2">
            <Label htmlFor="projectType">Project Type</Label>
            <Select
              value={projectType}
              onValueChange={(v) => setProjectType(v as ProjectType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greenfield">Greenfield (New Project)</SelectItem>
                <SelectItem value="brownfield">Brownfield (Existing Project)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project Name */}
          <div className="grid gap-2">
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., E-Commerce Platform"
            />
          </div>

          {/* Use Case with Upload + Clear */}
          <div className="grid gap-2">

            {/* Label row: "Use Case *" on left, "Upload File" button on right */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Label htmlFor="usecase">Use Case *</Label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc,.pdf,.txt"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {/* Upload button */}
              <button
                type="button"
                disabled={fileLoading}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: fileLoading ? '#f9fafb' : '#fff',
                  color: fileLoading ? '#9ca3af' : '#374151',
                  cursor: fileLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'background 0.15s',
                }}
              >
                {fileLoading ? (
                  <Loader2
                    style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }}
                  />
                ) : (
                  <Upload style={{ width: 13, height: 13, color: '#211747' }} />
                )}
                {fileLoading ? 'Parsing…' : 'Upload File'}
              </button>
            </div>

            {/* File loaded success */}
            {uploadedFileName && !uploadError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#16a34a',
                }}
              >
                <FileText style={{ width: 13, height: 13, flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>{uploadedFileName}</span>
                <span style={{ color: '#6b7280' }}>— loaded into field below</span>
              </div>
            )}

            {/* Upload error */}
            {uploadError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#dc2626',
                }}
              >
                <AlertCircle style={{ width: 13, height: 13, flexShrink: 0 }} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Textarea in a relative wrapper so the clear button can be positioned inside it */}
            <div style={{ position: 'relative' }}>
              <Textarea
                id="usecase"
                value={usecase}
                onChange={(e) => setUsecase(e.target.value)}
                placeholder="Describe the project use case, or upload a .docx / .pdf / .txt file above to auto-fill this field…"
                rows={4}
                style={{ paddingRight: usecase ? '32px' : undefined }}
              />

              {/* Cross / clear button — only appears when textarea has content */}
              {usecase && (
                <button
                  type="button"
                  onClick={handleClearUsecase}
                  title="Clear text"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#e5e7eb',
                    color: '#6b7280',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#211747';
                    (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e5e7eb';
                    (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
                  }}
                >
                  <X style={{ width: 11, height: 11 }} />
                </button>
              )}
            </div>

            <p style={{ fontSize: '11px', color: '#211747', margin: 0 }}>
              Accepted file types: .docx, .doc, .pdf, .txt
            </p>
          </div>

          {/* Add Team Members */}
          <div className="grid gap-2">
            <Label>Add Team Members</Label>
            <div className="flex gap-2">
              <Input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter email address"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddEmail}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {users.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {users.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveEmail(email)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* GitHub Repository Name */}
          <div className="grid gap-2">
            <Label htmlFor="githubRepoName">GitHub Repository Name *</Label>
            <Input
              id="githubRepoName"
              value={githubRepoName}
              onChange={(e) => setGithubRepoName(e.target.value)}
              placeholder="e.g., my-repo"
            />
          </div>

          {/* GitHub Owner Name */}
          <div className="grid gap-2">
            <Label htmlFor="githubOwnerName">GitHub Owner Name *</Label>
            <Input
              id="githubOwnerName"
              value={githubOwnerName}
              onChange={(e) => setGithubOwnerName(e.target.value)}
              placeholder="e.g., username or organization"
            />
          </div>

          {/* JIRA Board Name */}
          <div className="grid gap-2">
            <Label htmlFor="jiraBoardName">JIRA Board Name *</Label>
            <Input
              id="jiraBoardName"
              value={jiraBoardName}
              onChange={(e) => setJiraBoardName(e.target.value)}
              placeholder="e.g., PROJ-BOARD"
            />
          </div>

          {/* JIRA Project */}
          <div className="grid gap-2">
            <Label htmlFor="jiraProject">JIRA Project *</Label>
            <Input
              id="jiraProject"
              value={jiraProject}
              onChange={(e) => setJiraProject(e.target.value)}
              placeholder="e.g., PROJ"
            />
          </div>

          {/* Brownfield-specific fields */}
          {projectType === 'brownfield' && (
            <>
              <div className="border-t pt-4 mt-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Additional configuration for existing projects
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="jiraAccessToken">JIRA Access Token</Label>
                <Input
                  id="jiraAccessToken"
                  type="password"
                  value={jiraAccessToken}
                  onChange={(e) => setJiraAccessToken(e.target.value)}
                  placeholder="Enter JIRA access token"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="githubAccessToken">GitHub Access Token</Label>
                <Input
                  id="githubAccessToken"
                  type="password"
                  value={githubAccessToken}
                  onChange={(e) => setGithubAccessToken(e.target.value)}
                  placeholder="Enter GitHub access token"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}