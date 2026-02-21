// components/session.ts

const HARDCODED_SESSION_ID = "special_static_session_12345";

let specialMode = false;

export const enableSpecialSession = () => {
  specialMode = true;
  return HARDCODED_SESSION_ID;
};

export const disableSpecialSession = () => {
  specialMode = false;
};

export const isSpecialSessionActive = () => {
  return specialMode;
};

export const getSpecialSessionId = () => {
  return specialMode ? HARDCODED_SESSION_ID : null;
};