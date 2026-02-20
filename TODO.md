# TODO - Integrate fetch-jira-tickets webhook

## Task Analysis
The task requires integrating the `fetch-jira-tickets` webhook that should be called every time BEFORE `get-selected-workspace-response` API is called. The project and component should be fetched from `get-user-workspace-detail` API.

## Current State
- The `syncJiraTickets` function exists in `toolsService.ts`
- It's currently being called AFTER `get-selected-workspace-response`
- It uses `wsData?.project` and `wsData?.component` from the response data

## Required Changes
1. Modify the flow to call `get-user-workspace-detail` API first
2. Extract project and component from that response
3. Call `fetch-jira-tickets` webhook with those values (BEFORE `get-selected-workspace-response`)
4. Then call `get-selected-workspace-response`

## Files to Edit
- [ ] `src/features/tools/toolsService.ts` - Modify the `runOrchestrator`, `runEpics`, `runArchGen`, `runArchVal` functions to call the jira sync before get-selected-workspace-response

## Implementation Steps
- [ ] Step 1: Modify `syncJiraTickets` to accept project and component as parameters
- [ ] Step 2: Add a function to call `get-user-workspace-detail` API
- [ ] Step 3: Modify `runOrchestrator` to call get-user-workspace-detail first, then syncJiraTickets, then get-selected-workspace-response
- [ ] Step 4: Apply similar changes to `runEpics`, `runArchGen`, `runArchVal` functions
