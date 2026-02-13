 // Project Types
 export type ProjectType = 'greenfield' | 'brownfield';
 
 export interface Project {
   id: string;
   projectName: string;
   usecase: string;
   projectType: ProjectType;
   users: string[];
   jiraUrl: string;
   githubRepoUrl: string;
   jiraBoard?: string;
   jiraAccessToken?: string;
   githubRepoName?: string;
   githubAccessToken?: string;
   createdAt: string;
 }
 
 export interface CreateProjectPayload {
   projectName: string;
   usecase: string;
   projectType: ProjectType;
   users: string[];
   jiraUrl: string;
   githubRepoUrl: string;
   jiraBoard?: string;
   jiraAccessToken?: string;
   githubRepoName?: string;
   githubAccessToken?: string;
 }
 
 // Tool Types
 export type ToolType =
   | 'orchestrator'
   | 'epics'
   | 'arch_gen'
   | 'arch_val'
   | 'code_gen'
   | 'cicd'
   | 'test_cases'
   | 'test_data';
 
 export interface ToolOption {
   id: ToolType;
   label: string;
   description: string;
 }
 
 // API Response Types
 export interface EpicsResponse {
   titles: string[];
   ids?: string[];
   jiraUrl: string;
 }
 
 export interface ArchitectureResponse {
   image: string; // Base64
 }
 
 export interface CodeGenResponse {
   repoUrl: string;
 }
 
 export interface OrchestratorResponse {
   epics_and_user_stories: EpicsResponse;
   arch_gen: ArchitectureResponse;
   arch_val: ArchitectureResponse;
   code_gen: CodeGenResponse;
   cicd: CodeGenResponse;
   test_cases: CodeGenResponse;
   test_data: CodeGenResponse;
 }
 
 // Chat Types
 export interface ChatMessage {
   id: string;
   role: 'user' | 'assistant';
   content: string;
   timestamp: string;
   tool?: ToolType;
 }
 
 // State Types
 export interface ProjectsState {
   projects: Project[];
   selectedProject: Project | null;
   selectedSession: Session | null;
   loading: boolean;
   error: string | null;
 }
 
 export interface ToolsState {
   selectedTool: ToolType;
   outputs: Partial<OrchestratorResponse>;
   loading: boolean;
   loadingTool: ToolType | null;
   error: string | null;
 }
 
 export interface ChatState {
   messages: ChatMessage[];
   loading: boolean;
 }

 // Session Types
 export interface Session {
   session_id: string;
   iframe_url: string;
   container_name: string;
 }
