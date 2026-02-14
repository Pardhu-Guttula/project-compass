import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';
import type { CreateProjectPayload, ProjectType } from '@/types';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateProjectPayload) => void;
  loading?: boolean;
}

export function CreateProjectDialog({ open, onOpenChange, onSubmit, loading }: CreateProjectDialogProps) {
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
      ...(projectType === 'brownfield' && {
        jiraAccessToken,
        githubAccessToken,
      }),
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
  };

  const isValid = projectName.trim() && usecase.trim() && githubRepoName.trim() && githubOwnerName.trim() && jiraBoardName.trim() && jiraProject.trim();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
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
            <Select value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)}>
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

          {/* Usecase */}
          <div className="grid gap-2">
            <Label htmlFor="usecase">Use Case *</Label>
            <Textarea
              id="usecase"
              value={usecase}
              onChange={(e) => setUsecase(e.target.value)}
              placeholder="Describe the project use case..."
              rows={3}
            />
          </div>

          {/* Add Users */}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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
