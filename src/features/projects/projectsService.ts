import type { Project, CreateProjectPayload, Session } from '@/types';
 import { mockProjects, delay } from '@/api/mockData';
 import axiosInstance from '@/api/axiosInstance';
 import axios from 'axios';
 
 // N8N Webhook Configuration for CloudOptics
 const N8N_WEBHOOK_URL = 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/create-workspace';


let projectsStore: Project[] = [...mockProjects];

function transformApiResponse(apiProject: any): Project {
  console.log('Transforming API project data:', apiProject);
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
    githubRepoUrl: apiProject.repo_link || '',
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
      console.log('Fetched projects from API:', apiData);
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
       console.error(' Failed to create project via N8N:', error);
       // Fallback: create local project anyway
       const newProject: Project = {
         ...payload,
         id: Date.now().toString(),
         createdAt: new Date().toISOString(),
       };
       projectsStore = [...projectsStore, newProject];
       return newProject;
     }
   },
 
  async startSession(repoUrl: string, sessionId: string): Promise<Session> {
    try {
      console.log('Starting session with payload:', { repo_url: repoUrl, session_id: sessionId });

      // Use a separate axios instance for the start-session API
      const sessionAxios = axios.create({
        baseURL: 'http://9.234.203.92:5000',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await sessionAxios.post('/start-session', {
        repo_url: repoUrl,
        session_id: sessionId,
      });
      console.log('Start session API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  },

  /**
   * Ensures a sessionId exists in localStorage for the given project.
   * If no sessionId exists, generates a new one and stores it.
   * This function should be called BEFORE any API calls that require a sessionId.
   */
  async ensureSessionId(projectId: string): Promise<string> {
    const projectKey = projectId ? `n8n_session_id_${projectId}` : 'n8n_session_id';
    let sessionId = localStorage.getItem(projectKey);
    
    if (!sessionId) {
      // Generate a new sessionId if not found
      sessionId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
        ? (crypto as any).randomUUID()
        : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      
      // Store in localStorage FIRST - before any API calls
      try {
        localStorage.setItem(projectKey, sessionId);
        console.log('Session ID created and stored in localStorage:', sessionId);
      } catch (e) {
        console.error('Failed to save session ID to localStorage:', e);
      }
    } else {
      console.log('Existing session ID found in localStorage:', sessionId);
    }
    
    return sessionId;
  },

  async selectProject(projectId: string): Promise<{ project: Project | null; session: Session | null }> {
    await delay(300);
    const project = projectsStore.find((p) => p.id === projectId) || null;
    if (!project) {
      return { project: null, session: null };
    }
    
    try {
      // FIRST: Ensure sessionId exists in localStorage before calling any API
      // This ensures the sessionId is stored in localStorage BEFORE the API is called
      const sessionId = await this.ensureSessionId(projectId);
      
      console.log('Selected project:', project);
      console.log('Calling startSession API with sessionId:', sessionId);
      
      // Now call the API AFTER the sessionId is confirmed to be in localStorage
      const session = await this.startSession(project.githubRepoUrl, sessionId);
      return { project, session };
    } catch (error) {
      console.error('Failed to start session for project:', projectId, error);
      return { project, session: null };
    }
  },
 };
