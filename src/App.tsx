 import { Provider } from 'react-redux';
 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { store } from '@/store';
 import ProjectWorkspace from "./pages/ProjectWorkspace";
 import ChatInterface from "./pages/ChatInterface";
 import NotFound from "./pages/NotFound";
 
 const queryClient = new QueryClient();
 
 const App = () => (
   <Provider store={store}>
     <QueryClientProvider client={queryClient}>
       <TooltipProvider>
         <Toaster />
         <Sonner />
         <BrowserRouter>
           <Routes>
             <Route path="/" element={<ProjectWorkspace />} />
             <Route path="/chat" element={<ChatInterface />} />
             {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
             <Route path="*" element={<NotFound />} />
           </Routes>
         </BrowserRouter>
       </TooltipProvider>
     </QueryClientProvider>
   </Provider>
 );

export default App;
