 import type { ToolOption } from '@/types';
 
 export const TOOL_OPTIONS: ToolOption[] = [
   {
     id: 'orchestrator',
     label: 'Main Orchestrator',
     description: 'Run complete SDLC workflow',
   },
   {
     id: 'epics',
     label: 'Epics & User Stories',
     description: 'Generate epics and user stories',
   },
   {
     id: 'arch_gen',
     label: 'Architecture Generation',
     description: 'Generate system architecture',
   },
   {
     id: 'arch_val',
     label: 'Architecture Validation',
     description: 'Validate architecture design',
   },
   {
     id: 'code_gen',
     label: 'Code Generation',
     description: 'Generate application code',
   },
   {
     id: 'cicd',
     label: 'CI/CD Pipeline',
     description: 'Configure CI/CD pipeline',
   },
   {
     id: 'test_cases',
     label: 'Test Cases',
     description: 'Generate test cases',
   },
   {
     id: 'test_data',
     label: 'Test Data',
     description: 'Generate test data',
   },
 ];
 
 export const getToolLabel = (toolId: string): string => {
   return TOOL_OPTIONS.find((t) => t.id === toolId)?.label || toolId;
 };

 export const TOOL_WEBHOOK_URLS: Record<string, string> = {
   orchestrator: 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/b6eb824e-4e98-4ae1-8052-fc6175ae49f5/chat',
   epics: 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/2d7a2a2f-4dc7-4d03-9935-4864bac78a45/chat',
   arch_gen: 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/7f79f7c9-ea10-40ee-b6ad-982ba4848c91/chat',
   arch_val: 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/50487dc2-007f-44b4-8551-7d75ca20355f/chat',
   code_gen: 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/43024b33-8e78-475a-9949-7202e1c7b027/chat',
   cicd: 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/d19f787a-a312-4aaf-98a8-595d184bf9c8/chat',
   test_cases: 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/5c29ddb2-24c5-42f2-9478-a769b79ca7be/chat',
   test_data: 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/5e1d8fa0-80dd-4eed-b0dd-4e3f4e7bda37/chat',

 };

 // Main orchestrator API endpoint (triggered after each bot reply)
 export const ORCHESTRATOR_API_URL = 'https://cloudoptics-n8n.westcentralus.cloudapp.azure.com/webhook/get-selected-workspace-response';

 export const getWebhookUrl = (toolId: string): string => {
   return TOOL_WEBHOOK_URLS[toolId] || TOOL_WEBHOOK_URLS.orchestrator;
 };