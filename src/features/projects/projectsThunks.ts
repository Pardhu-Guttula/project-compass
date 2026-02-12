 import { createAsyncThunk } from '@reduxjs/toolkit';
 import type { CreateProjectPayload } from '@/types';
 import { projectsService } from './projectsService';
 
 export const fetchProjects = createAsyncThunk(
   'projects/fetchProjects',
   async (email: string) => {
     return await projectsService.fetchProjects(email);
   }
 );
 
 export const createProject = createAsyncThunk(
   'projects/createProject',
   async (payload: CreateProjectPayload, { rejectWithValue }) => {
     try {
       const result = await projectsService.createProject(payload);
       // Note: projectsService internally calls fetchProjects to refresh the list
       return result;
     } catch (error) {
       return rejectWithValue(error instanceof Error ? error.message : 'Failed to create project');
     }
   }
 );
 
 export const selectProject = createAsyncThunk(
   'projects/selectProject',
   async (projectId: string) => {
     return await projectsService.selectProject(projectId);
   }

  
 );