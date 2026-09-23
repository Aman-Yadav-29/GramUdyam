export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'error';
  service: string;
  version: string;
  uptimeSeconds: number;
  environment: string;
  database: {
    status: 'connected' | 'configured' | 'standby';
    type: string;
  };
  services: {
    businessDiscovery: boolean;
    financialEngine: boolean;
    schemeEngine: boolean;
    loanEngine: boolean;
    locationGis: boolean;
    aiAdvisor: boolean;
  };
}
