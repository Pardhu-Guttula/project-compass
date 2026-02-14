import type { Project, CreateProjectPayload } from '@/types';
import { mockProjects, delay } from '@/api/mockData';
import axiosInstance from '@/api/axiosInstance';

const N8N_WEBHOOK_URL = 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/create-workspace';

let projectsStore: Project[] = [...mockProjects];

function transformApiResponse(apiProject: any): Project {
  const uniqueId = apiProject.project_name 
    ? `${apiProject.project_name}-${apiProject.created_at || Date.now()}`
    : Date.now().toString();
    
  return {
    id: uniqueId,
    projectName: apiProject.project_name || '',
    usecase: apiProject.usecase || '',
    projectType: 'greenfield',
    users: Array.isArray(apiProject.access_users) && Array.isArray(apiProject.access_users[0])
      ? apiProject.access_users[0]
      : apiProject.access_users || [],
    githubRepoName: apiProject.repo_name || '',
    githubOwnerName: apiProject.repo_owner || '',
    jiraBoard: apiProject.jira_board || '',
    jiraProject: apiProject.jira_project || '',
    createdAt: apiProject.created_at || new Date().toISOString(),
  };
}

export const projectsService = {
  async fetchProjects(email: string): Promise<Project[]> {
    try {
      const response = await axiosInstance.post('/webhook/get-user-workspace-details', {
        email,
      });
      const apiData = response.data;
      const projects: Project[] = Array.isArray(apiData) 
        ? apiData.map((project: any) => transformApiResponse(project))
        : [transformApiResponse(apiData)];
      projectsStore = projects;
      return projects;
    } catch (error) {
      console.error('Failed to fetch projects from API:', error);
      return mockProjects;
    }
  },

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    try {
      console.log(' Creating project via N8N webhook...');
      console.log('Webhook URL:', N8N_WEBHOOK_URL);

      const n8nPayload = {
        type: payload.projectType || 'greenfield',
        repo_owner: payload.githubOwnerName,
        repo_name: payload.githubRepoName,
        branch_name: 'main',
        usecase: payload.usecase || '',
        project_name: payload.projectName,
        access_users: payload.users || [],
        jira_board: payload.jiraBoard,
        jira_project: payload.jiraProject,
        jira_user: payload.users?.[0] || 'default-user',
        jira_url: `https://jira.example.com/browse/${payload.jiraBoard}`,
        repo_link: `https://github.com/${payload.githubOwnerName}/${payload.githubRepoName}`,
      };

      const response = await axiosInstance.post(N8N_WEBHOOK_URL, n8nPayload, {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CloudOptics/1.0.0',
        },
      });

      console.log(' Project created successfully:', response.data);
      const newProject: Project = {
        ...payload,
        id: response.data?.project_name || Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      projectsStore = [...projectsStore, newProject];

      return newProject;
    } catch (error) {
      console.error('Failed to create project via N8N:', error);
      const newProject: Project = {
        ...payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      projectsStore = [...projectsStore, newProject];
      return newProject;
    }
  },

  async selectProject(projectId: string): Promise<Project | null> {
    await delay(300);
    return projectsStore.find((p) => p.id === projectId) || null;
  },
};