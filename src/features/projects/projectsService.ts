 import type { Project, CreateProjectPayload } from '@/types';
 import { mockProjects, delay } from '@/api/mockData';
 import axiosInstance from '@/api/axiosInstance';
 
 // In-memory storage for projects
 let projectsStore: Project[] = [...mockProjects];
 
 export const projectsService = {
   async fetchProjects(email: string): Promise<Project[]> {
     try {
       const response = await axiosInstance.post('/webhook/get-user-workspace-details', {
         email,
       });
       // Transform API response to Project format if needed
       const projects = response.data?.projects || [];
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