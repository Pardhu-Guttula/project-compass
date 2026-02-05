 import { Button } from '@/components/ui/button';
 import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
 import { useAppSelector, useAppDispatch } from '@/store/hooks';
 import { clearSelectedProject } from '@/features/projects/projectsSlice';
 import { clearOutputs } from '@/features/tools/toolsSlice';
 import { clearMessages } from '@/features/chat/chatSlice';
 import { useNavigate } from 'react-router-dom';
 import { User, ArrowLeft, Settings, GitBranch, ExternalLink } from 'lucide-react';
 import { Badge } from '@/components/ui/badge';
 
 export function TopNavigation() {
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const { selectedProject } = useAppSelector((state) => state.projects);
 
   const handleBack = () => {
     dispatch(clearSelectedProject());
     dispatch(clearOutputs());
     dispatch(clearMessages());
     navigate('/');
   };
 
   return (
     <header className="h-14 border-b bg-card flex items-center justify-between px-4">
       <div className="flex items-center gap-4">
         <Button variant="ghost" size="icon" onClick={handleBack}>
           <ArrowLeft className="h-4 w-4" />
         </Button>
         <div>
           <h1 className="font-semibold text-foreground">
             {selectedProject?.projectName || 'SDLC Workspace'}
           </h1>
           {selectedProject && (
             <p className="text-xs text-muted-foreground line-clamp-1">
               {selectedProject.usecase}
             </p>
           )}
         </div>
       </div>
 
       <Popover>
         <PopoverTrigger asChild>
           <Button variant="ghost" size="icon" className="rounded-full">
             <User className="h-5 w-5" />
           </Button>
         </PopoverTrigger>
         <PopoverContent align="end" className="w-80">
           {selectedProject ? (
             <div className="space-y-4">
               <div>
                 <h3 className="font-semibold">{selectedProject.projectName}</h3>
                 <Badge variant="outline" className="mt-1">
                   {selectedProject.projectType}
                 </Badge>
               </div>
 
               <div className="space-y-2 text-sm">
                 <div>
                   <span className="text-muted-foreground">Use Case:</span>
                   <p className="mt-1">{selectedProject.usecase}</p>
                 </div>
 
                 <div className="flex items-center gap-2">
                   <GitBranch className="h-4 w-4 text-muted-foreground" />
                   <a
                     href={selectedProject.githubRepoUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-primary hover:underline flex items-center gap-1"
                   >
                     GitHub Repo <ExternalLink className="h-3 w-3" />
                   </a>
                 </div>
 
                 <div className="flex items-center gap-2">
                   <Settings className="h-4 w-4 text-muted-foreground" />
                   <a
                     href={selectedProject.jiraUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-primary hover:underline flex items-center gap-1"
                   >
                     JIRA Board <ExternalLink className="h-3 w-3" />
                   </a>
                 </div>
 
                 <div>
                   <span className="text-muted-foreground">Team:</span>
                   <p className="mt-1">{selectedProject.users.join(', ') || 'No members'}</p>
                 </div>
               </div>
             </div>
           ) : (
             <p className="text-muted-foreground text-sm">No project selected</p>
           )}
         </PopoverContent>
       </Popover>
     </header>
   );
 }