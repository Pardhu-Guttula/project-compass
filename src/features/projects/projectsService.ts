 import type { Project, CreateProjectPayload } from '@/types';
 import { mockProjects, delay } from '@/api/mockData';
 import axiosInstance from '@/api/axiosInstance';
 
 // N8N Webhook Configuration for CloudOptics
 const N8N_WEBHOOK_URL = 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/create-workspace';

 // In-memory storage for projects
 let projectsStore: Project[] = [...mockProjects];

 // Transform API response to Project interface
 function transformApiResponse(apiProject: any): Project {
   return {
     id: apiProject.project_name || Date.now().toString(),
     projectName: apiProject.project_name || '',
     usecase: apiProject.usecase || '',
     projectType: 'greenfield', // Default, can be updated based on API data
     users: Array.isArray(apiProject.access_users) && Array.isArray(apiProject.access_users[0])
       ? apiProject.access_users[0]
       : apiProject.access_users || [],
     jiraUrl: '',
     githubRepoUrl: apiProject.repo_link || '',
     createdAt: apiProject.created_at || new Date().toISOString(),
   };
 }
 
 export const projectsService = {
   async fetchProjects(email: string): Promise<Project[]> {
     try {
       const response = await axiosInstance.post('/webhook/get-user-workspace-details', {
         email,
       });
       // Transform API response to Project format
       const apiData = response.data;
       const projects: Project[] = Array.isArray(apiData) 
         ? apiData.map((project: any) => transformApiResponse(project))
         : [transformApiResponse(apiData)];
       projectsStore = projects;
       return projects;
     } catch (error) {
       console.error('Failed to fetch projects from API:', error);
       // Fallback to mock data on error
       return mockProjects;
     }
   },
 
   async createProject(payload: CreateProjectPayload): Promise<Project> {
     try {
       console.log(' Creating project via N8N webhook...');
       console.log('Webhook URL:', N8N_WEBHOOK_URL);
       
       // Prepare N8N webhook payload
       const n8nPayload = {
         type: payload.projectType || 'greenfield',
         repo_owner: 'Pardhu-Guttula',
         repo_name: 'adam-sdlc',
         branch_name: 'main',
         usecase: payload.usecase || '',
         project_name: payload.projectName,
         access_users: payload.users || [],
         jira_board: 'ADAM-SDLC',
         jira_user: payload.users?.[0] || 'default-user',
         jira_url: payload.jiraUrl || '',
         repo_link: payload.githubRepoUrl || '',
         // session_id: Date.now().toString(),
       };

       const response = await axiosInstance.post(N8N_WEBHOOK_URL, n8nPayload, {
         timeout: 60000,
         headers: {
           'Content-Type': 'application/json',
           'User-Agent': 'CloudOptics/1.0.0',
         },
       });

       console.log(' Project created successfully:', response.data);

      // Build the local project record from response (fallback to payload values)
      const newProject: Project = {
        ...payload,
        id: response.data?.project_name || Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      // Update in-memory store so UI can show immediately
      projectsStore = [...projectsStore, newProject];

      // Note: fetchProjects will be called by the component after this thunk completes
      // to refresh the full project list from backend (called only once)

      return newProject;
     } catch (error) {
       console.error(' Failed to create project via N8N:', error);
       // Fallback: create local project anyway
       const newProject: Project = {
         ...payload,
         id: Date.now().toString(),
         createdAt: new Date().toISOString(),
       };
       projectsStore = [...projectsStore, newProject];
       return newProject;
     }
   },
 
   async selectProject(projectId: string): Promise<Project | null> {
     await delay(300);
     return projectsStore.find((p) => p.id === projectId) || null;
   },
 };