 import { createAsyncThunk } from '@reduxjs/toolkit';
 import type { ToolType } from '@/types';
 import { toolsService, ToolPayload } from './toolsService';
 
 export const runOrchestrator = createAsyncThunk(
   'tools/runOrchestrator',
   async (payload: ToolPayload) => {
     return await toolsService.runOrchestrator(payload);
   }
 );
 
 export const runTool = createAsyncThunk(
   'tools/runTool',
   async ({ tool, payload }: { tool: ToolType; payload: ToolPayload }) => {
     const result = await toolsService.runTool(tool, payload);
     return { tool, result };
   }
 );