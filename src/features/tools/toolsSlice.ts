 import { createSlice, PayloadAction } from '@reduxjs/toolkit';
 import type { ToolsState, ToolType, OrchestratorResponse } from '@/types';
 import { runOrchestrator, runTool } from './toolsThunks';
 
 const initialState: ToolsState = {
   selectedTool: 'orchestrator',
   outputs: {},
   loading: false,
   loadingTool: null,
   error: null,
 };
 
 const toolsSlice = createSlice({
   name: 'tools',
   initialState,
   reducers: {
     setSelectedTool: (state, action: PayloadAction<ToolType>) => {
       state.selectedTool = action.payload;
     },
     clearOutputs: (state) => {
       state.outputs = {};
     },
     clearError: (state) => {
       state.error = null;
     },
   },
   extraReducers: (builder) => {
     // Run Orchestrator
     builder
       .addCase(runOrchestrator.pending, (state) => {
         state.loading = true;
         state.loadingTool = 'orchestrator';
         state.error = null;
       })
       .addCase(runOrchestrator.fulfilled, (state, action: PayloadAction<OrchestratorResponse>) => {
         state.loading = false;
         state.loadingTool = null;
         state.outputs = action.payload;
       })
       .addCase(runOrchestrator.rejected, (state, action) => {
         state.loading = false;
         state.loadingTool = null;
         state.error = action.error.message || 'Failed to run orchestrator';
       });
 
     // Run Individual Tool
     builder
       .addCase(runTool.pending, (state, action) => {
         state.loading = true;
         state.loadingTool = action.meta.arg.tool;
         state.error = null;
       })
       .addCase(runTool.fulfilled, (state, action) => {
         state.loading = false;
         state.loadingTool = null;
         const { tool, result } = action.payload;
         switch (tool) {
           case 'epics':
             state.outputs.epics_and_user_stories = result;
             break;
           case 'arch_gen':
             state.outputs.arch_gen = result;
             break;
           case 'arch_val':
             state.outputs.arch_val = result;
             break;
           case 'code_gen':
             state.outputs.code_gen = result;
             break;
           case 'cicd':
             state.outputs.cicd = result;
             break;
           case 'test_cases':
             state.outputs.test_cases = result;
             break;
           case 'test_data':
             state.outputs.test_data = result;
             break;
         }
       })
       .addCase(runTool.rejected, (state, action) => {
         state.loading = false;
         state.loadingTool = null;
         state.error = action.error.message || 'Failed to run tool';
       });
   },
 });
 
 export const { setSelectedTool, clearOutputs, clearError } = toolsSlice.actions;
 export default toolsSlice.reducer;