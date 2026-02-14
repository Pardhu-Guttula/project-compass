import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, GitBranch, Trello, FolderKanban } from 'lucide-react';
import type { Project } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const formattedDate = project.createdAt
    ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })
    : 'Unknown date';

  return (
    <Card
      className="
        font-[Arial,sans-serif]
        group cursor-pointer
        border-none
        transition-all duration-500 ease-out
        hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]
        hover:border-primary/50
        hover:-translate-y-1
        hover:scale-[1.03]
        "
      onClick={() => onClick(project)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground">{project.projectName}</CardTitle>
            <Badge variant={project.projectType === 'greenfield' ? 'default' : 'secondary'}>
              {project.projectType}
            </Badge>
          </div>
        </div>
        <CardDescription className="
            line-clamp-2
            group-hover:line-clamp-5
            transition-all duration-300
            text-muted-foreground">
          {project.usecase || 'No description provided'}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
         <div className="flex flex-col gap-2 text-sm text-muted-foreground"></div>
         
        {project.users && project.users.length > 0 && (
          <div className="flex items-center gap-2 bg-[#F5F3FA] hover:bg-[#E9E6F2] text-[#7C5CE6] rounded-full px-3 py-1 w-fit text-xs transition-colors duration-200">
            <Users className="h-3.4 w-3.4" />
            <span>{project.users.length} team member{project.users.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {project.githubRepoName && project.githubOwnerName && (
          <div className="flex items-center gap-2 bg-[#F5F3FA] hover:bg-[#E9E6F2] text-[#7C5CE6] rounded-full px-3 py-1 w-fit text-xs transition-colors duration-200">
            <GitBranch className="h-3.4 w-3.4" />
            <span className="truncate
                group-hover:whitespace-normal
                group-hover:overflow-visible">
              {project.githubOwnerName}/{project.githubRepoName}
            </span>
          </div>
        )}

        {project.jiraBoard && (
          <div className="flex items-center gap-2 bg-[#F5F3FA] hover:bg-[#E9E6F2] text-[#7C5CE6] rounded-full px-3 py-1 w-fit text-xs transition-colors duration-200">
            <Trello className="h-3.4 w-3.4" />
            <span className="truncate
                group-hover:whitespace-normal
                group-hover:overflow-visible
            ">Board: {project.jiraBoard}</span>
          </div>
        )}

        {project.jiraProject && (
          <div className="flex items-center gap-2 bg-[#F5F3FA] hover:bg-[#E9E6F2] text-[#7C5CE6] rounded-full px-3 py-1 w-fit text-xs transition-colors duration-200">
            <FolderKanban className="h-3.4 w-3.4" />
            <span className="truncate
                group-hover:whitespace-normal
                group-hover:overflow-visible
            ">Project: {project.jiraProject}</span>
          </div>
        )}

        <div className="flex items-center gap-2  bg-[#F5F3FA] hover:bg-[#E9E6F2] text-[#7C5CE6] rounded-full px-3 py-1 w-fit text-xs transition-colors duration-200">
          <Calendar className="h-3.4 w-3.4" />
          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
