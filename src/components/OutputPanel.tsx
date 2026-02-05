 import { useAppSelector, useAppDispatch } from '@/store/hooks';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Progress } from '@/components/ui/progress';
 import { runOrchestrator, runTool } from '@/features/tools/toolsThunks';
 import { ExternalLink, RefreshCw, Loader2, FileText, Image as ImageIcon, Code, TestTube, Database, GitBranch } from 'lucide-react';
 import { getToolLabel } from '@/constants/tools';
 
 export function OutputPanel() {
   const dispatch = useAppDispatch();
   const { selectedTool, outputs, loading, loadingTool } = useAppSelector((state) => state.tools);
   const { selectedProject } = useAppSelector((state) => state.projects);
 
   const handleRefresh = (tool?: string) => {
     if (!selectedProject) return;
     
     const payload = {
       projectId: selectedProject.id,
       usecase: selectedProject.usecase,
       projectName: selectedProject.projectName,
     };
 
     if (tool && tool !== 'orchestrator') {
       dispatch(runTool({ tool: tool as any, payload }));
     } else {
       dispatch(runOrchestrator(payload));
     }
   };
 
   if (selectedTool === 'orchestrator') {
     return (
       <div className="flex flex-col h-full bg-background">
         <div className="p-4 border-b flex items-center justify-between">
           <h2 className="text-lg font-semibold">Workflow Output</h2>
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
               <EpicsOutput data={outputs.epics_and_user_stories} />
             </OutputCard>
 
             <OutputCard
               title="Architecture Generation"
               icon={<ImageIcon className="h-4 w-4" />}
               loading={loadingTool === 'arch_gen'}
               onRefresh={() => handleRefresh('arch_gen')}
             >
               <ArchitectureOutput data={outputs.arch_gen} />
             </OutputCard>
 
             <OutputCard
               title="Architecture Validation"
               icon={<ImageIcon className="h-4 w-4" />}
               loading={loadingTool === 'arch_val'}
               onRefresh={() => handleRefresh('arch_val')}
             >
               <ArchitectureOutput data={outputs.arch_val} />
             </OutputCard>
 
             <OutputCard
               title="Code Base"
               icon={<Code className="h-4 w-4" />}
               loading={loadingTool === 'code_gen'}
               onRefresh={() => handleRefresh('code_gen')}
             >
               <StackBlitzOutput data={outputs.code_gen} />
             </OutputCard>
 
             
            
           </div>
         </ScrollArea>
       </div>
     );
   }
 
   // Individual tool view
   return (
     <div className="flex flex-col h-full bg-background">
       <div className="p-4 border-b flex items-center justify-between">
         <h2 className="text-lg font-semibold">{getToolLabel(selectedTool)}</h2>
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
           Update
         </Button>
       </div>
 
       <ScrollArea className="flex-1 p-4">
         <IndividualToolOutput tool={selectedTool} outputs={outputs} loading={loading} />
       </ScrollArea>
     </div>
   );
 }
 
 function OutputCard({
   title,
   icon,
   children,
   loading,
   onRefresh,
 }: {
   title: string;
   icon: React.ReactNode;
   children: React.ReactNode;
   loading?: boolean;
   onRefresh?: () => void;
 }) {
   return (
     <Card>
       <CardHeader className="pb-3">
         <div className="flex items-center justify-between">
           <CardTitle className="text-sm font-medium flex items-center gap-2">
             {icon}
             {title}
           </CardTitle>
           {onRefresh && (
             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRefresh} disabled={loading}>
               {loading ? (
                 <Loader2 className="h-3 w-3 animate-spin" />
               ) : (
                 <RefreshCw className="h-3 w-3" />
               )}
             </Button>
           )}
         </div>
       </CardHeader>
       <CardContent>
         {loading ? (
           <div className="space-y-2">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-3/4" />
           </div>
         ) : (
           children
         )}
       </CardContent>
     </Card>
   );
 }
 
 function EpicsOutput({ data }: { data?: { titles: string[]; jiraUrl: string } }) {
   if (!data) {
     return <p className="text-sm text-muted-foreground">No data found</p>;
   }
 
   return (
     <div className="space-y-3">
       {data.titles.slice(0, 2).map((title, i) => (
         <div key={i} className="p-3 bg-muted rounded-lg">
           <p className="text-sm font-medium">{title}</p>
         </div>
       ))}
       <Button variant="link" size="sm" className="p-0 h-auto" asChild>
         <a href={data.jiraUrl} target="_blank" rel="noopener noreferrer">
           View More in JIRA <ExternalLink className="h-3 w-3 ml-1" />
         </a>
       </Button>
     </div>
   );
 }
 
 function ArchitectureOutput({ data }: { data?: { image: string } }) {
   if (!data) {
     return <p className="text-sm text-muted-foreground">No data found</p>;
   }
 
   return (
     <div className="rounded-lg overflow-hidden border bg-muted">
       <img
         src={data.image}
         alt="Architecture Diagram"
         className="w-full h-auto"
       />
     </div>
   );
 }
 
 function StackBlitzOutput({ data }: { data?: { repoUrl: string } }) {
   if (!data) {
     return <p className="text-sm text-muted-foreground">No data found</p>;
   }
 
   // Convert GitHub URL to StackBlitz embed URL
   const repoPath = data.repoUrl.replace('https://github.com/', '').replace('.git', '');
   const stackBlitzUrl = `https://stackblitz.com/github/${repoPath}?embed=1&file=README.md&terminal=dev`;
 
   return (
     <div className="space-y-3">
       <div className="rounded-lg overflow-hidden border" style={{ height: '300px' }}>
         <iframe
           src={stackBlitzUrl}
           title="StackBlitz Preview"
           className="w-full h-full"
           allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
           sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
         />
       </div>
       <Button variant="outline" size="sm" asChild>
         <a href={data.repoUrl} target="_blank" rel="noopener noreferrer">
           Open in GitHub <ExternalLink className="h-3 w-3 ml-1" />
         </a>
       </Button>
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
   if (loading) {
     return (
       <div className="space-y-4">
         <Skeleton className="h-8 w-1/2" />
         <Skeleton className="h-32 w-full" />
         <Skeleton className="h-4 w-3/4" />
       </div>
     );
   }
 
   switch (tool) {
     case 'epics':
       return <EpicsOutput data={outputs.epics_and_user_stories} />;
     case 'arch_gen':
       return <ArchitectureOutput data={outputs.arch_gen} />;
     case 'arch_val':
       return <ArchitectureOutput data={outputs.arch_val} />;
     case 'code_gen':
       return <StackBlitzOutput data={outputs.code_gen} />;
     case 'cicd':
       return <StackBlitzOutput data={outputs.cicd} />;
     case 'test_cases':
       return <StackBlitzOutput data={outputs.test_cases} />;
     case 'test_data':
       return <StackBlitzOutput data={outputs.test_data} />;
     default:
       return <p className="text-sm text-muted-foreground">Select a tool to view output</p>;
   }
 }