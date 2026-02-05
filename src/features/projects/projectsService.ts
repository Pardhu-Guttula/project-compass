 import type { Project, CreateProjectPayload } from '@/types';
 import { mockProjects, delay } from '@/api/mockData';
 
 // In-memory storage for projects
 let projectsStore: Project[] = [...mockProjects];
 
 export const projectsService = {
   async fetchProjects(): Promise<Project[]> {
     await delay(800);
     return projectsStore;
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