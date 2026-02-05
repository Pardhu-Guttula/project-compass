 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import type { Project } from '@/types';
 import { Calendar, Users, GitBranch } from 'lucide-react';
 
 interface ProjectCardProps {
   project: Project;
   onClick: (project: Project) => void;
 }
 
 export function ProjectCard({ project, onClick }: ProjectCardProps) {
   return (
     <Card
       className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1"
       onClick={() => onClick(project)}
     >
       <CardHeader className="pb-3">
         <div className="flex items-start justify-between">
           <CardTitle className="text-lg font-semibold text-foreground">
             {project.projectName}
           </CardTitle>
           <Badge variant={project.projectType === 'greenfield' ? 'default' : 'secondary'}>
             {project.projectType}
           </Badge>
         </div>
         <CardDescription className="line-clamp-2 text-muted-foreground">
           {project.usecase}
         </CardDescription>
       </CardHeader>
       <CardContent className="pt-0">
         <div className="flex flex-col gap-2 text-sm text-muted-foreground">
           <div className="flex items-center gap-2">
             <Users className="h-4 w-4" />
             <span>{project.users.length} team member{project.users.length !== 1 ? 's' : ''}</span>
           </div>
           <div className="flex items-center gap-2">
             <GitBranch className="h-4 w-4" />
             <span className="truncate">{project.githubRepoUrl.split('/').pop()}</span>
           </div>
           <div className="flex items-center gap-2">
             <Calendar className="h-4 w-4" />
             <span>{new Date(project.createdAt).toLocaleDateString()}</span>
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }