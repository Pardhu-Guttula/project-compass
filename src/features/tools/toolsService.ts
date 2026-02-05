 import type { ToolType, OrchestratorResponse, EpicsResponse, ArchitectureResponse, CodeGenResponse } from '@/types';
 import {
   mockOrchestratorResponse,
   mockEpicsResponse,
   mockArchGenResponse,
   mockArchValResponse,
   mockCodeGenResponse,
   mockCicdResponse,
   mockTestCasesResponse,
   mockTestDataResponse,
   delay,
 } from '@/api/mockData';
 
 export interface ToolPayload {
   projectId: string;
   usecase: string;
   prompt?: string;
 }
 
 export const toolsService = {
   async runOrchestrator(payload: ToolPayload): Promise<OrchestratorResponse> {
     await delay(2000);
     console.log('Running orchestrator with:', payload);
     return mockOrchestratorResponse;
   },
 
   async runEpics(payload: ToolPayload): Promise<EpicsResponse> {
     await delay(1500);
     console.log('Running epics with:', payload);
     return mockEpicsResponse;
   },
 
   async runArchGen(payload: ToolPayload): Promise<ArchitectureResponse> {
     await delay(1500);
     console.log('Running arch gen with:', payload);
     return mockArchGenResponse;
   },
 
   async runArchVal(payload: ToolPayload): Promise<ArchitectureResponse> {
     await delay(1500);
     console.log('Running arch val with:', payload);
     return mockArchValResponse;
   },
 
   async runCodeGen(payload: ToolPayload): Promise<CodeGenResponse> {
     await delay(1500);
     console.log('Running code gen with:', payload);
     return mockCodeGenResponse;
   },
 
   async runCicd(payload: ToolPayload): Promise<CodeGenResponse> {
     await delay(1500);
     console.log('Running cicd with:', payload);
     return mockCicdResponse;
   },
 
   async runTestCases(payload: ToolPayload): Promise<CodeGenResponse> {
     await delay(1500);
     console.log('Running test cases with:', payload);
     return mockTestCasesResponse;
   },
 
   async runTestData(payload: ToolPayload): Promise<CodeGenResponse> {
     await delay(1500);
     console.log('Running test data with:', payload);
     return mockTestDataResponse;
   },
 
   async runTool(tool: ToolType, payload: ToolPayload) {
     switch (tool) {
       case 'orchestrator':
         return this.runOrchestrator(payload);
       case 'epics':
         return this.runEpics(payload);
       case 'arch_gen':
         return this.runArchGen(payload);
       case 'arch_val':
         return this.runArchVal(payload);
       case 'code_gen':
         return this.runCodeGen(payload);
       case 'cicd':
         return this.runCicd(payload);
       case 'test_cases':
         return this.runTestCases(payload);
       case 'test_data':
         return this.runTestData(payload);
       default:
         throw new Error(`Unknown tool: ${tool}`);
     }
   },
 };