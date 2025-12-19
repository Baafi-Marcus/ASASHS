// lib/stack-auth.ts
import { StackClientApp } from '@stackframe/stack';

export const stackApp = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID,
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
});

export default stackApp;