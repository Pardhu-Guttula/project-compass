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
import axiosInstance from '@/api/axiosInstance';

export interface ToolPayload {
  projectId: string;
  usecase: string;
  prompt?: string;
  projectName?: string;
}

// Helper function to convert base64 to data URL
function base64ToDataUrl(base64String: string): string {
  if (!base64String) return '';
  // Check if it's already a data URL
  if (base64String.startsWith('data:')) {
    return base64String;
  }
  // Convert base64 to data URL (assume PNG, can be adjusted if needed)
  return `data:image/png;base64,${base64String}`;
}

// Transform API response to OrchestratorResponse format
function transformApiResponse(apiData: any): OrchestratorResponse {
  const epics = apiData?.epics ?? [];
  const ids = epics.map((e: any) => e?.id).filter((id): id is string => Boolean(id));
  console.log('Extracted epics and IDs from API response:', { epics, ids });
  return {
    epics_and_user_stories: {
      titles: epics
        .map((e: any) => e?.title)
        .filter((t): t is string => Boolean(t)),

      ids: epics
        .map((e: any) => e?.id)
        .filter((id): id is string => Boolean(id)),

      jiraUrl:
        apiData?.jira_url ||
        'https://jira.example.com/project/DEFAULT',
    },

    arch_gen: {
      image: apiData.arch_gen ? base64ToDataUrl(apiData.arch_gen) : mockArchGenResponse.image,
    },
    arch_val: {
      image: apiData.arch_val ? base64ToDataUrl(apiData.arch_val) : mockArchValResponse.image,
    },
    code_gen: mockCodeGenResponse,
    cicd: mockCicdResponse,
    test_cases: mockTestCasesResponse,
    test_data: mockTestDataResponse,
  };
} 

export const toolsService = {
   async runOrchestrator(payload: ToolPayload): Promise<OrchestratorResponse> {
     try {
       const projectName = payload.projectName || 'CloudOptics';
       const response = await axiosInstance.post('/webhook/get-selected-workspace-response', {
         project_name: projectName,
         type: 'main_orchestrator',
       });

       const data = Array.isArray(response.data) ? response.data[0] : response.data;
       console.log("data", data);
       
       return transformApiResponse(data);
     } catch (error) {
       console.error('Failed to fetch orchestrator data from API:', error);
       await delay(2000);
       return mockOrchestratorResponse;
     }
   },
 
   async runEpics(payload: ToolPayload): Promise<EpicsResponse> {
     try {
       const projectName = payload.projectName || 'CloudOptics';
       const response = await axiosInstance.post('/webhook/get-selected-workspace-response', {
         project_name: projectName,
         type: 'epics',
       });

       const data = Array.isArray(response.data) ? response.data[0] : response.data;
       return {
         titles: data.epics?.map((e: any) => e.title).filter((t: string) => t) || [],
         jiraUrl: 'https://jira.example.com/project/DEFAULT',
       };
     } catch (error) {
       console.error('Failed to fetch epics from API:', error);
       await delay(1500);
       return mockEpicsResponse;
     }
   },
 
   async runArchGen(payload: ToolPayload): Promise<ArchitectureResponse> {
     try {
       const projectName = payload.projectName || 'CloudOptics';
       const response = await axiosInstance.post('/webhook/get-selected-workspace-response', {
         project_name: projectName,
         type: 'architecture_generation',
       });

       const data = Array.isArray(response.data) ? response.data[0] : response.data;
       return {
         image: data.arch_gen ? base64ToDataUrl(data.arch_gen) : mockArchGenResponse.image,
       };
     } catch (error) {
       console.error('Failed to fetch architecture generation from API:', error);
       await delay(1500);
       return mockArchGenResponse;
     }
   },
 
   async runArchVal(payload: ToolPayload): Promise<ArchitectureResponse> {
     try {
       const projectName = payload.projectName || 'CloudOptics';
       const response = await axiosInstance.post('/webhook/get-selected-workspace-response', {
         project_name: projectName,
         type: 'architecture_validation',
       });

       const data = Array.isArray(response.data) ? response.data[0] : response.data;
       return {
         image: data.arch_val ? base64ToDataUrl(data.arch_val) : mockArchValResponse.image,
       };
     } catch (error) {
       console.error('Failed to fetch architecture validation from API:', error);
       await delay(1500);
       return mockArchValResponse;
     }
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