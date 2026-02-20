import { createAsyncThunk } from '@reduxjs/toolkit';
import type { CreateProjectPayload, Session } from '@/types';
import { projectsService } from './projectsService';
import { syncJiraTickets } from '../tools/toolsService';

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
  async (projectId: string, { rejectWithValue }) => {
    try {
      const result = await projectsService.selectProject(projectId);

      // 🔥 NEW: Trigger Jira sync AFTER project is selected
      if (result.project) {
        const jiraData = await syncJiraTickets({
          project: result.project.jiraProject,
          component: result.project.jiraBoard,
        });

        return { ...result, jiraData };
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
