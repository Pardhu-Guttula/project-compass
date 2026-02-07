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
//fetch repo
async function fetchWorkspaceRepo(projectName: string): Promise<string> {
  try {
    const response = await axiosInstance.post(
      '/webhook/get-user-workspace-details',
      { project_name: projectName }
    );

    const data = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    console.log("Workspace details:", data);

    //  adjust this based on actual API structure
    return data?.repo_url || '';

  } catch (error) {
    console.error('Workspace repo fetch failed:', error);
    return '';
  }
}

//getrepo
function getRepo(apiData: any, key: string): CodeGenResponse {
  const repo = apiData?.[key]?.repo_url;

  console.log(`Repo for ${key}:`, repo);

  return {
    repoUrl: repo || '',
  };
}

// Transform API response to OrchestratorResponse format
function transformApiResponse(apiData: any): OrchestratorResponse {
  const epics = apiData?.epics ?? [];
  const ids = epics.map((e: any) => e?.id).filter((id): id is string => Boolean(id));
  console.log('Extracted epics and IDs from API response:', { epics, ids });
  console.log('Code gen repo URL:', getRepo(apiData, 'code_gen').repoUrl)
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
    //code_gen: mockCodeGenResponse,
    //cicd: mockCicdResponse,
    //test_cases: mockTestCasesResponse,
    //test_data: mockTestDataResponse,
    code_gen: {
      repoUrl: apiData?.repo_url || '',
    },
    cicd: {
      repoUrl: apiData?.repo_url || '',
    },
    test_cases: {
      repoUrl: apiData?.repo_url || '',
    },
    test_data: {
      repoUrl: apiData?.repo_url || '',
    },
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
       console.log('API response for architecture generation:', data) // Debug log
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
  try {
    const projectName = payload.projectName || 'CloudOptics';

    const response = await axiosInstance.post(
      '/webhook/get-user-workspace-details',
      {
        project_name: projectName,
        type: 'code_gen',
      }
    );

    const data = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    return getRepo(data, 'code_gen');

  } catch (error) {
    console.error('Code gen API failed:', error);
    return { repoUrl: '' };
  }
},
async runCicd(payload: ToolPayload): Promise<CodeGenResponse> {
  try {
    const projectName = payload.projectName || 'CloudOptics';

    const response = await axiosInstance.post(
      '/webhook/get-user-workspace-details',
      {
        project_name: projectName,
        type: 'cicd',
      }
    );

    const data = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    return getRepo(data, 'cicd');

  } catch (error) {
    console.error('CI/CD API failed:', error);
    return { repoUrl: '' };
  }
},
async runTestCases(payload: ToolPayload): Promise<CodeGenResponse> {
  try {
    const projectName = payload.projectName || 'CloudOptics';

    const response = await axiosInstance.post(
      '/webhook/get-user-workspace-details',
      {
        project_name: projectName,
        type: 'test_cases',
      }
    );

    const data = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    return getRepo(data, 'test_cases');

  } catch (error) {
    console.error('Test cases API failed:', error);
    return { repoUrl: '' };
  }
},
async runTestData(payload: ToolPayload): Promise<CodeGenResponse> {
  try {
    const projectName = payload.projectName || 'CloudOptics';

    const response = await axiosInstance.post(
      '/webhook/get-user-workspace-details',
      {
        project_name: projectName,
        type: 'test_data',
      }
    );

    const data = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    return getRepo(data, 'test_data');

  } catch (error) {
    console.error('Test data API failed:', error);
    return { repoUrl: '' };
  }
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