import { createSlice, PayloadAction } from '@reduxjs/toolkit';
 import type { ProjectsState, Project } from '@/types';
 import { fetchProjects, createProject, selectProject } from './projectsThunks';
 
 const initialState: ProjectsState = {
   projects: [],
   selectedProject: null,
   selectedSession: null,
   loading: false,
   error: null,
 };
 
 const projectsSlice = createSlice({
   name: 'projects',
   initialState,
   reducers: {
     clearSelectedProject: (state) => {
       state.selectedProject = null;
       state.selectedSession = null;
     },
     clearError: (state) => {
       state.error = null;
     },
   },
   extraReducers: (builder) => {
     // Fetch Projects
     builder
       .addCase(fetchProjects.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
         state.loading = false;
         state.projects = action.payload;
       })
       .addCase(fetchProjects.rejected, (state, action) => {
         state.loading = false;
         state.error = action.error.message || 'Failed to fetch projects';
       });
 
     // Create Project
     builder
       .addCase(createProject.pending, (state) => {
         state.loading = true;
         state.error = null;
       })
       .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
         state.loading = false;
         state.projects.push(action.payload);
         state.selectedProject = action.payload;
       })
       .addCase(createProject.rejected, (state, action) => {
         state.loading = false;
         state.error = action.error.message || 'Failed to create project';
       });
 
     // Select Project
     builder
       .addCase(selectProject.pending, (state) => {
         state.loading = true;
       })
       .addCase(selectProject.fulfilled, (state, action: PayloadAction<{ project: Project | null; session: Session | null }>) => {
         state.loading = false;
         state.selectedProject = action.payload.project;
         state.selectedSession = action.payload.session;
       })
       .addCase(selectProject.rejected, (state, action) => {
         state.loading = false;
         state.error = action.error.message || 'Failed to select project';
       });
   },
 });
 
 export const { clearSelectedProject, clearError } = projectsSlice.actions;
 export default projectsSlice.reducer;