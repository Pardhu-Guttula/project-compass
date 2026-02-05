 import type { Project, CreateProjectPayload } from '@/types';
 import { mockProjects, delay } from '@/api/mockData';
 import axiosInstance from '@/api/axiosInstance';
 
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
     await delay(1000);
     const newProject: Project = {
       ...payload,
       id: Date.now().toString(),
       createdAt: new Date().toISOString(),
     };
     projectsStore = [...projectsStore, newProject];
     return newProject;
   },
 
   async selectProject(projectId: string): Promise<Project | null> {
     await delay(300);
     return projectsStore.find((p) => p.id === projectId) || null;
   },
 };