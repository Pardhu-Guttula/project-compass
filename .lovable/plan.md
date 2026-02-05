

# SDLC Project Workspace - Implementation Plan

## Overview
A professional SDLC (Software Development Life Cycle) project management application with a dual-page layout featuring project workspace management and an intelligent chat interface with orchestrator capabilities.

---

## Architecture Setup

### Folder Structure
```
/src
  /store          → Redux store configuration
  /features       → Redux slices, thunks, and services
    /projects     → Project management state
    /orchestrator → Orchestrator API state
    /tools        → Individual tool states
  /components     → Reusable MUI components
  /pages          → Main page components
  /api            → Axios instance and API configuration
  /types          → TypeScript type definitions
```

### State Management
- **Redux Toolkit** for global state
- **Service pattern** for API abstraction (mock data initially, easy to swap for real APIs)
- **Thunks** for async operations

---

## Page 1: Project Workspace

### Features
1. **Project List View**
   - Fetch and display projects as MUI Cards on page load
   - Each card shows project name, usecase, and creation date
   - Click to select and navigate to Chat Interface

2. **Create New Workspace Modal**
   - Toggle between **Greenfield** and **Brownfield** modes via dropdown
   - **Greenfield Fields**: Usecase, Project Name, Add Users (email chips), JIRA URL, GitHub Repo URL
   - **Brownfield Fields**: Same as above plus JIRA Board, JIRA Access Token, GitHub Repo Name, GitHub Access Token
   - Form validation with MUI feedback
   - On submit → Creates project and navigates to Chat Interface

3. **UI Components**
   - MUI Card grid layout for projects
   - Dialog component for creation modal
   - Loading skeletons during data fetch

---

## Page 2: Chat Interface (Main Hub)

### Layout Structure
| Top Navigation | Profile icon with popover showing current project details |
|----------------|----------------------------------------------------------|
| **Left Panel** | Chatbot with tool selector dropdown and message input |
| **Right Panel** | Dynamic output area based on selected tool |

### Left Panel - Chatbot
1. **Tool Selector Dropdown** (8 options):
   - Main Orchestrator
   - Epics & User Stories
   - Architecture Generation
   - Architecture Validation
   - Code Generation
   - CI/CD Pipeline
   - Test Cases
   - Test Data

2. **Chat Input**
   - Text field with send button
   - Routes to orchestrator API or individual tool API based on selection
   - Shows loading indicator during API calls

### Right Panel - Dynamic Output

**Orchestrator Mode (Default)**
- Vertical cascading ScrollView
- Displays outputs from all 7 solutions sequentially
- "Run Workflow" button to re-trigger all steps

**Individual Tool Mode**
| Tool | Output Rendering |
|------|-----------------|
| Epics & User Stories | Two titles from JSON + "More" button linking to JIRA |
| Arch Generation | Base64 image display |
| Arch Validation | Base64 image display |
| Code Generation | StackBlitz iframe with GitHub repo |
| CI/CD | StackBlitz iframe view |
| Test Cases | StackBlitz iframe view |
| Test Data | StackBlitz iframe view |

- "Update" button to re-trigger specific tool
- "No data found" placeholder when no data exists

---

## UI/UX Features

### Professional Material UI Theme
- Clean corporate color scheme
- Consistent spacing and typography
- Responsive design for different screen sizes

### Loading States
- MUI LinearProgress bars during API transitions
- Skeleton components for content loading
- Disabled buttons during processing

### Navigation
- React Router for page transitions
- Smooth project selection flow
- Back navigation from Chat Interface

---

## Technical Implementation

### Mock Data Layer
- Pre-configured mock responses for all 7 tools
- Simulated API delays for realistic loading states
- Service layer ready to swap for real API endpoints

### API Service Pattern
```
/api
  axiosInstance.js  → Configured Axios with base URL
/features/projects
  projectService.js → API call functions
  projectSlice.js   → Redux state + reducers
  projectThunks.js  → Async actions
```

### StackBlitz Integration
- iframe embedding for GitHub repository view
- Configurable to open the specified repo: `github.com/Kani2k1/SDLC.git`
- Terminal-ready workspace configuration

---

## Deliverables

1. ✅ Complete folder structure following specified architecture
2. ✅ Project Workspace page with list view and create modal
3. ✅ Chat Interface with dual-panel layout
4. ✅ Redux store with slices for projects, orchestrator, and tools
5. ✅ Service layer with mock data (API-ready)
6. ✅ All 7 solution output renderers
7. ✅ StackBlitz iframe integration
8. ✅ Professional MUI theming and loading states

