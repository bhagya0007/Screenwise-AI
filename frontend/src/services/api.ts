const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Retrieve session credentials if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('screenwise_token') : null;
  const role = typeof window !== 'undefined' ? localStorage.getItem('screenwise_role') || 'clinician' : 'clinician';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Demo-Role': role,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    let errorData: unknown = null;
    try {
      errorData = await response.json();
      if (errorData && typeof errorData === 'object' && 'detail' in errorData) {
        const detail = (errorData as { detail: unknown }).detail;
        errorDetail = typeof detail === 'string' 
          ? detail 
          : JSON.stringify(detail);
      }
    } catch {
      // Body is not JSON
    }
    throw new ApiError(response.status, errorDetail, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
