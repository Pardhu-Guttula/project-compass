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