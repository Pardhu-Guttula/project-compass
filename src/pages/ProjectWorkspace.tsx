 import { useEffect, useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { Skeleton } from '@/components/ui/skeleton';
 import { ProjectCard } from '@/components/ProjectCard';
 import { CreateProjectDialog } from '@/components/CreateProjectDialog';
 import { useAppDispatch, useAppSelector } from '@/store/hooks';
 import { fetchProjects, createProject, selectProject } from '@/features/projects/projectsThunks';
 import type { Project, CreateProjectPayload } from '@/types';
 import { Plus, FolderKanban } from 'lucide-react';
 
 export default function ProjectWorkspace() {
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const { projects, loading, error } = useAppSelector((state) => state.projects);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [creating, setCreating] = useState(false);
 
   useEffect(() => {
     dispatch(fetchProjects());
   }, [dispatch]);
 
   const handleProjectClick = async (project: Project) => {
     await dispatch(selectProject(project.id));
     navigate('/chat');
   };
 
   const handleCreateProject = async (payload: CreateProjectPayload) => {
     setCreating(true);
     try {
       await dispatch(createProject(payload)).unwrap();
       setDialogOpen(false);
       navigate('/chat');
     } catch (error) {
       console.error('Failed to create project:', error);
     } finally {
       setCreating(false);
     }
   };
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="border-b bg-card">
         <div className="container mx-auto px-4 py-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                 <FolderKanban className="h-6 w-6 text-primary-foreground" />
               </div>
               <div>
                 <h1 className="text-2xl font-bold text-foreground">SDLC Workspace</h1>
                 <p className="text-sm text-muted-foreground">
                   Manage your software development projects
                 </p>
               </div>
             </div>
             <Button onClick={() => setDialogOpen(true)}>
               <Plus className="h-4 w-4 mr-2" />
               Create New
             </Button>
           </div>
         </div>
       </header>
 
       {/* Content */}
       <main className="container mx-auto px-4 py-8">
         {error && (
           <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
             {error}
           </div>
         )}
 
         {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map((i) => (
               <div key={i} className="border rounded-lg p-6 space-y-4">
                 <Skeleton className="h-6 w-3/4" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-1/2" />
                 <div className="space-y-2 pt-4">
                   <Skeleton className="h-4 w-1/3" />
                   <Skeleton className="h-4 w-1/2" />
                   <Skeleton className="h-4 w-1/4" />
                 </div>
               </div>
             ))}
           </div>
         ) : projects.length === 0 ? (
           <div className="text-center py-16">
             <FolderKanban className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
             <h2 className="text-xl font-semibold text-foreground mb-2">No projects yet</h2>
             <p className="text-muted-foreground mb-6">
               Create your first SDLC workspace to get started
             </p>
             <Button onClick={() => setDialogOpen(true)}>
               <Plus className="h-4 w-4 mr-2" />
               Create New Workspace
             </Button>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {projects.map((project) => (
               <ProjectCard
                 key={project.id}
                 project={project}
                 onClick={handleProjectClick}
               />
             ))}
           </div>
         )}
       </main>
 
       {/* Create Dialog */}
       <CreateProjectDialog
         open={dialogOpen}
         onOpenChange={setDialogOpen}
         onSubmit={handleCreateProject}
         loading={creating}
       />
     </div>
   );
 }