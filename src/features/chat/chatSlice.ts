 import { createSlice, PayloadAction } from '@reduxjs/toolkit';
 import type { ChatState, ChatMessage, ToolType } from '@/types';
 
 const initialState: ChatState = {
   messages: [],
   loading: false,
 };
 
 const chatSlice = createSlice({
   name: 'chat',
   initialState,
   reducers: {
     addMessage: (state, action: PayloadAction<Omit<ChatMessage, 'id' | 'timestamp'>>) => {
       const message: ChatMessage = {
         ...action.payload,
         id: Date.now().toString(),
         timestamp: new Date().toISOString(),
       };
       state.messages.push(message);
     },
     setLoading: (state, action: PayloadAction<boolean>) => {
       state.loading = action.payload;
     },
     clearMessages: (state) => {
       state.messages = [];
     },
   },
 });
 
 export const { addMessage, setLoading, clearMessages } = chatSlice.actions;
 export default chatSlice.reducer;