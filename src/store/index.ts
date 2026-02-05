 import { configureStore } from '@reduxjs/toolkit';
 import projectsReducer from '@/features/projects/projectsSlice';
 import toolsReducer from '@/features/tools/toolsSlice';
 import chatReducer from '@/features/chat/chatSlice';
 
 export const store = configureStore({
   reducer: {
     projects: projectsReducer,
     tools: toolsReducer,
     chat: chatReducer,
   },
   middleware: (getDefaultMiddleware) =>
     getDefaultMiddleware({
       serializableCheck: false,
     }),
 });
 
 export type RootState = ReturnType<typeof store.getState>;
 export type AppDispatch = typeof store.dispatch;