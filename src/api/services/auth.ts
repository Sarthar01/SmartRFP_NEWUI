import api from '../http'; // Axios instance with baseURL and interceptors

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  organization_id: number;
  is_active: boolean;
  must_change_password: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append('username', data.username);
  formData.append('password', data.password);

  const response = await api.post<LoginResponse>('/v1/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>('/v1/auth/me');
  return response.data;
}
