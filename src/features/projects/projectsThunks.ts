 import { createAsyncThunk } from '@reduxjs/toolkit';
 import type { CreateProjectPayload } from '@/types';
 import { projectsService } from './projectsService';
 
 export const fetchProjects = createAsyncThunk(
   'projects/fetchProjects',
   async () => {
     return await projectsService.fetchProjects();
   }
 );
 
 export const createProject = createAsyncThunk(
   'projects/createProject',
   async (payload: CreateProjectPayload) => {
     return await projectsService.createProject(payload);
   }
 );
 
 export const selectProject = createAsyncThunk(
   'projects/selectProject',
   async (projectId: string) => {
     return await projectsService.selectProject(projectId);
   }
 );