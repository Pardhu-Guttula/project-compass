 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { TOOL_OPTIONS } from '@/constants/tools';
 import type { ToolType } from '@/types';
 
 interface ToolSelectorProps {
   value: ToolType;
   onChange: (value: ToolType) => void;
   disabled?: boolean;
 }
 
 export function ToolSelector({ value, onChange, disabled }: ToolSelectorProps) {
   return (
     <Select value={value} onValueChange={(v) => onChange(v as ToolType)} disabled={disabled}>
       <SelectTrigger className="w-full">
         <SelectValue placeholder="Select tool" />
       </SelectTrigger>
       <SelectContent>
         {TOOL_OPTIONS.map((tool) => (
           <SelectItem key={tool.id} value={tool.id}>
             <div className="flex flex-col">
               <span className="font-medium">{tool.label}</span>
             </div>
           </SelectItem>
         ))}
       </SelectContent>
     </Select>
   );
 }