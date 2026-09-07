/**
 * ============================================================================
 * Endpoints & Remote Service Configuration
 * ============================================================================
 * Reads typed environment variables populated by scripts/connect-endpoints.mjs.
 */

export interface EndpointsConfig {
  backendAdapter: 'mock' | 'firebase' | 'supabase' | 'rest';
  apiBaseUrl: string;
  apiKey?: string;
  firebase?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  supabase?: {
    url: string;
    anonKey: string;
  };
  hasLiveConnection: boolean;
}

export const ENDPOINTS_CONFIG: EndpointsConfig = {
  backendAdapter: (import.meta.env.VITE_BACKEND_ADAPTER as EndpointsConfig['backendAdapter']) || 'mock',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  apiKey: import.meta.env.VITE_API_KEY,
  
  firebase: import.meta.env.VITE_FIREBASE_API_KEY ? {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  } : undefined,

  supabase: import.meta.env.VITE_SUPABASE_URL ? {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  } : undefined,

  hasLiveConnection: Boolean(
    import.meta.env.VITE_API_BASE_URL || 
    import.meta.env.VITE_FIREBASE_API_KEY || 
    import.meta.env.VITE_SUPABASE_URL
  )
};
