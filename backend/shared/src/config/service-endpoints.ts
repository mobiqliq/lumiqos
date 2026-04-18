export interface ServiceEndpoints {
  ai: string;
  auth: string;
  school: string;
  billing: string;
}

const endpoints: ServiceEndpoints = {
  ai: process.env.AI_SERVICE_URL || 'http://ai-service:3005',
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3002',
  school: process.env.SCHOOL_SERVICE_URL || 'http://school-service:3001',
  billing: process.env.BILLING_SERVICE_URL || 'http://billing-service:3004',
};

export function getServiceUrl(service: keyof ServiceEndpoints): string {
  return endpoints[service];
}

export function getAIServiceUrl(): string {
  return endpoints.ai;
}
