import type {
  ToolType,
  OrchestratorResponse,
  EpicsResponse,
  ArchitectureResponse,
  CodeGenResponse,
} from '@/types';

import {
  mockOrchestratorResponse,
  mockEpicsResponse,
  mockArchGenResponse,
  mockArchValResponse,
  delay,
} from '@/api/mockData';

import axiosInstance from '@/api/axiosInstance';

export interface ToolPayload {
  projectId: string;
  usecase: string;
  prompt?: string;
  projectName?: string;
}

/* ---------------- Helpers ---------------- */

function base64ToDataUrl(base64String: string): string {
  if (!base64String) return '';
  if (base64String.startsWith('data:')) return base64String;
  return `data:image/png;base64,${base64String}`;
}

function getRepo(apiData: any, key: string): CodeGenResponse {
  return {
    repoUrl: apiData?.[key]?.repo_url || '',
  };
}

/* -------- Jira sync using existing workspace data -------- */

async function syncJiraTickets(wsData: any) {
  try {
    const jiraPayload = {
      issueType: 'Both',
      project: wsData?.project || 'ADAM',
      component: wsData?.component || 'SDLC2.0',
    };

    await axiosInstance.post(
      '/webhook/fetch-jira-tickets',
      jiraPayload
    );

    console.log('Jira sync completed');
  } catch (error) {
    console.error('Jira sync failed:', error);
  }
}

/* -------- Transform orchestrator response -------- */

function transformApiResponse(apiData: any): OrchestratorResponse {
  const epics = apiData?.epics ?? [];

  return {
    epics_and_user_stories: {
      titles: epics.map((e: any) => e?.title).filter(Boolean),
      ids: epics.map((e: any) => e?.id).filter(Boolean),
      jiraUrl:
        apiData?.jira_url ||
        'https://jira.example.com/project/DEFAULT',
    },

    arch_gen: {
      image: apiData.arch_gen
        ? base64ToDataUrl(apiData.arch_gen)
        : mockArchGenResponse.image,
    },

    arch_val: {
      image: apiData.arch_val
        ? base64ToDataUrl(apiData.arch_val)
        : mockArchValResponse.image,
    },

    code_gen: { repoUrl: apiData?.repo_url || '' },
    cicd: { repoUrl: apiData?.repo_url || '' },
    test_cases: { repoUrl: apiData?.repo_url || '' },
    test_data: { repoUrl: apiData?.repo_url || '' },
  };
}

/* ---------------- Service ---------------- */

export const toolsService = {

  /* ---------- Orchestrator ---------- */

  async runOrchestrator(
    payload: ToolPayload
  ): Promise<OrchestratorResponse> {
    try {
      const projectName = payload.projectName || 'CloudOptics';

      const response = await axiosInstance.post(
        '/webhook/get-selected-workspace-response',
        {
          project_name: projectName,
          type: 'main_orchestrator',
        }
      );

      const data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      // ✅ Jira sync using existing workspace data
      await syncJiraTickets(data);

      return transformApiResponse(data);

    } catch (error) {
      console.error('Orchestrator failed:', error);
      await delay(2000);
      return mockOrchestratorResponse;
    }
  },

  /* ---------- Epics ---------- */

  async runEpics(payload: ToolPayload): Promise<EpicsResponse> {
    try {
      const projectName = payload.projectName || 'CloudOptics';

      const response = await axiosInstance.post(
        '/webhook/get-selected-workspace-response',
        {
          project_name: projectName,
          type: 'main_orchestrator',
        }
      );

      const data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      return {
        titles: data.epics?.map((e: any) => e?.title).filter(Boolean) || [],
        ids: data.epics?.map((e: any) => e?.id).filter(Boolean) || [],
        jiraUrl: data?.jira_url || '',
      };

    } catch (error) {
      console.error('Epics failed:', error);
      await delay(1500);
      return mockEpicsResponse;
    }
  },

  /* ---------- Architecture ---------- */

  async runArchGen(payload: ToolPayload): Promise<ArchitectureResponse> {
    try {
      const projectName = payload.projectName || 'CloudOptics';

      const response = await axiosInstance.post(
        '/webhook/get-selected-workspace-response',
        {
          project_name: projectName,
          type: 'main_orchestrator',
        }
      );

      const data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      return {
        image: data.arch_gen
          ? base64ToDataUrl(data.arch_gen)
          : mockArchGenResponse.image,
      };

    } catch (error) {
      console.error('Arch gen failed:', error);
      await delay(1500);
      return mockArchGenResponse;
    }
  },

  async runArchVal(payload: ToolPayload): Promise<ArchitectureResponse> {
    try {
      const projectName = payload.projectName || 'CloudOptics';

      const response = await axiosInstance.post(
        '/webhook/get-selected-workspace-response',
        {
          project_name: projectName,
          type: 'main_orchestrator',
        }
      );

      const data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      return {
        image: data.arch_val
          ? base64ToDataUrl(data.arch_val)
          : mockArchValResponse.image,
      };

    } catch (error) {
      console.error('Arch val failed:', error);
      await delay(1500);
      return mockArchValResponse;
    }
  },

  /* ---------- Repo tools (NO workspace API call anymore) ---------- */

  async runCodeGen(): Promise<CodeGenResponse> {
    return { repoUrl: '' };
  },

  async runCicd(): Promise<CodeGenResponse> {
    return { repoUrl: '' };
  },

  async runTestCases(): Promise<CodeGenResponse> {
    return { repoUrl: '' };
  },

  async runTestData(): Promise<CodeGenResponse> {
    return { repoUrl: '' };
  },

  /* ---------- Dispatcher ---------- */

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
        return this.runCodeGen();
      case 'cicd':
        return this.runCicd();
      case 'test_cases':
        return this.runTestCases();
      case 'test_data':
        return this.runTestData();
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  },
};
