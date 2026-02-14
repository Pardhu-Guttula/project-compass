import type {
  Project,
  OrchestratorResponse,
  EpicsResponse,
  ArchitectureResponse,
  CodeGenResponse,
} from '@/types';

const SAMPLE_ARCH_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmNGY4Ii8+PHJlY3QgeD0iNTAiIHk9IjUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiByeD0iOCIgZmlsbD0iIzM0NzZkMiIvPjx0ZXh0IHg9IjEwMCIgeT0iODUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIj5Gcm9udGVuZDwvdGV4dD48cmVjdCB4PSIyNTAiIHk9IjUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiByeD0iOCIgZmlsbD0iIzM0NzZkMiIvPjx0ZXh0IHg9IjMwMCIgeT0iODUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIj5BUEkgR2F0ZXdheTwvdGV4dD48cmVjdCB4PSIxNTAiIHk9IjE1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI2MCIgcng9IjgiIGZpbGw9IiMyZTdkMzIiLz48dGV4dCB4PSIyMDAiIHk9IjE4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTIiPkJhY2tlbmQ8L3RleHQ+PHJlY3QgeD0iMTUwIiB5PSIyMzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIHJ4PSI4IiBmaWxsPSIjZjU3YzAwIi8+PHRleHQgeD0iMjAwIiB5PSIyNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIj5EYXRhYmFzZTwvdGV4dD48bGluZSB4MT0iMTUwIiB5MT0iODAiIHgyPSIyNTAiIHkyPSI4MCIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMjAwIiB5MT0iMTEwIiB4Mj0iMjAwIiB5Mj0iMTUwIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIyMDAiIHkxPSIyMTAiIHgyPSIyMDAiIHkyPSIyMzAiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+';

export const mockProjects: Project[] = [
  {
    id: '1',
    projectName: 'E-Commerce Platform',
    usecase: 'Build a modern e-commerce platform with cart and checkout',
    projectType: 'greenfield',
    users: ['john@example.com', 'jane@example.com'],
    githubRepoName: 'SDLC',
    githubOwnerName: 'Kani2k1',
    jiraBoard: 'ECOM',
    jiraProject: 'ECOM',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    projectName: 'HR Management System',
    usecase: 'Employee management with leave tracking and payroll',
    projectType: 'brownfield',
    users: ['admin@example.com'],
    githubRepoName: 'hrms-app',
    githubOwnerName: 'Kani2k1',
    jiraBoard: 'HRMS-BOARD',
    jiraProject: 'HRMS',
    jiraAccessToken: '***',
    githubAccessToken: '***',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    projectName: 'Analytics Dashboard',
    usecase: 'Real-time analytics dashboard with data visualization',
    projectType: 'greenfield',
    users: ['data@example.com', 'analyst@example.com'],
    githubRepoName: 'SDLC',
    githubOwnerName: 'Kani2k1',
    jiraBoard: 'DASH',
    jiraProject: 'DASH',
    createdAt: '2024-03-10T09:15:00Z',
  },
];

export const mockEpicsResponse: EpicsResponse = {
  titles: [
    'User Authentication & Authorization Module',
    'Product Catalog Management System',
  ],
  jiraUrl: 'https://jira.example.com/project/ECOM/board',
};

export const mockArchGenResponse: ArchitectureResponse = {
  image: SAMPLE_ARCH_IMAGE,
};

export const mockArchValResponse: ArchitectureResponse = {
  image: SAMPLE_ARCH_IMAGE,
};

export const mockCodeGenResponse: CodeGenResponse = {
  repoUrl: 'https://github.com/Kani2k1/SDLC.git',
};

export const mockCicdResponse: CodeGenResponse = {
  repoUrl: 'https://github.com/Kani2k1/SDLC.git',
};

export const mockTestCasesResponse: CodeGenResponse = {
  repoUrl: 'https://github.com/Kani2k1/SDLC.git',
};

export const mockTestDataResponse: CodeGenResponse = {
  repoUrl: 'https://github.com/Kani2k1/SDLC.git',
};

export const mockOrchestratorResponse: OrchestratorResponse = {
  epics_and_user_stories: mockEpicsResponse,
  arch_gen: mockArchGenResponse,
  arch_val: mockArchValResponse,
  code_gen: mockCodeGenResponse,
  cicd: mockCicdResponse,
  test_cases: mockTestCasesResponse,
  test_data: mockTestDataResponse,
};

// Helper to simulate API delay
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));