# TODO: Integrate fetch-jira-tickets webhook

## Task Summary
Integrate the fetch-jira-tickets webhook that should be called every time before get-selected-workspace-response API is called.

## Webhook Details
- URL: `https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/fetch-jira-tickets`
- Payload:
  
```
json
  {
    "issueType": "Both",
    "project": "<project_from_get_user_workspace_detail>",
    "component": "<component_from_get_user_workspace_detail>"
  }
  
```

## Files to Edit
1. `src/features/tools/toolsService.ts` - Add new function and modify existing methods

## Implementation Steps
- [ ] 1. Add a new function `fetchJiraTickets` in `toolsService.ts` that:
      - Calls `get-user-workspace-details` API to get project and component values
      - Calls `fetch-jira-tickets` webhook with the payload
- [ ] 2. Modify `runOrchestrator` method to call `fetchJiraTickets` before calling `get-selected-workspace-response`
- [ ] 3. Modify `runEpics` method to call `fetchJiraTickets` before calling `get-selected-workspace-response`
- [ ] 4. Modify `runArchGen` method to call `fetchJiraTickets` before calling `get-selected-workspace-response`
- [ ] 5. Modify `runArchVal` method to call `fetchJiraTickets` before calling `get-selected-workspace-response`

## Notes
- The project and component values should be extracted from the `get-user-workspace-details` API response
- Based on typical JIRA API structures, the fields might be `jira_project` and `component` or similar
- The webhook call should not block the main flow - it can be a fire-and-forget call
