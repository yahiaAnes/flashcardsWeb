import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { Flashcard, GeneratedFlashcardsResponse } from '../types'
// API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
}
// Lesson interface 
export interface Lesson{
  id:number;
  name:string;
  user_id:number;
  created_at: string; 

}
// Auth response interface
export interface AuthResponse {
  user: User;
  token: string;
  email_verification_sent: boolean;
}

// Login request interface
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request interface
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  
}

// // Access code verification request interface
// export interface AccessCodeRequest {
//   access_code: string;
//   is_active: boolean;
// }

// // Payment status response interface
// export interface PaymentStatusResponse {
//   is_paid: boolean;
//   user: User;
//   demo_expires_at?: string;
// }


// Email verification interfaces
export interface VerifyEmailRequest {
  id: number;
  hash: string;
}

export interface VerifyEmailResponse {
  user: User;
  verified: boolean;
  already_verified?: boolean;
}

// User update request interface
export interface UserUpdateRequest {
  name?: string;
  nickname?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  phone?: string;
  state?: string;
  stage?: string;
  year?: string;
  branch?: string;
  trial_agreement?: boolean;
}

// Paginated response interface
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}


class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        // Skip authentication for password reset and forgot password endpoints
        const skipAuthEndpoints = ['/reset-password', '/forgot-password', '/login', '/register', '/verify-email'];
        const shouldSkipAuth = skipAuthEndpoints.some(endpoint => config.url?.includes(endpoint));
        
        if (token && !shouldSkipAuth) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // Log the error but don't auto-clear tokens
        console.error('API Error:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
    
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/login', credentials);
    if (response.data.success) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/register', userData);
    if (response.data.success) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await this.api.post<ApiResponse<null>>('/logout');
    localStorage.removeItem('auth_token');
    return response.data;
  }

  async resetPassword(data: { token: string; email: string; password: string; password_confirmation: string }): Promise<ApiResponse<null>> {
    const response = await this.api.post<ApiResponse<null>>('/reset-password', data);
    return response.data;
  }

  async testReset(data: { token: string; email: string }): Promise<any> {
    const response = await this.api.post('/test-reset', data);
    return response.data;
  }

  async changePassword(data: { current_password: string; new_password: string; new_password_confirmation: string }): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await this.api.post('/change-password', data);
    return response.data;
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse<VerifyEmailResponse>> {
    const response = await this.api.post<ApiResponse<VerifyEmailResponse>>('/verify-email', data);
    return response.data;
  }

  async resendVerificationEmail(): Promise<ApiResponse<null>> {
    const response = await this.api.post<ApiResponse<null>>('/resend-verification-email');
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response = await this.api.post<ApiResponse<null>>('/forgot-password', { email });
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>('/me');
    return response.data;
  }

  // User management methods
  async getUsers(page: number = 1): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await this.api.get<ApiResponse<PaginatedResponse<User>>>(`/users?page=${page}`);
    return response.data;
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: {
    name: string;
    nickname: string;
    email: string;
    password: string;
    phone: string;
    state?: string;
    stage: string;
    year: string;
    branch: string;
    trial_agreement: boolean;
  }): Promise<ApiResponse<User>> {
    const response = await this.api.post<ApiResponse<User>>('/users', {
      ...userData,
      password_confirmation: userData.password,
    });
    return response.data;
  }

  async updateUser(id: number, userData: UserUpdateRequest): Promise<ApiResponse<User>> {
    const response = await this.api.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/users/${id}`);
    return response.data;
  }

  // Lessons funxtions
  async createLesson(lessonData: { name: string }) {
    // ✅ Send lessonData directly, not { lessonData }
    const response = await this.api.post('/createLesson', lessonData);
    return response.data;
  }
  async getLessons() {
    const response = await this.api.get<{ lessons: Lesson[] }>('/lessons');
    return response.data; // 👈 returns { lessons: [...] }
  }
  async deleteLesson(lessonId: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/lessons/${lessonId}`);
    return response.data;
  }
  async getFlashcards(lessonId: number) {
    const response = await this.api.get<{ flashcards: Flashcard[] }>(`/getFlashcards?lesson_id=${lessonId}`);
    return response.data;
  }
  
  async getLessonWithFlashcards(lessonId: number) {
    const response = await this.api.get<{
      lesson: Lesson;
      flashcards: Flashcard[];
    }>(`/lessons/${lessonId}/with-flashcards`);
    return response.data;
  }

  // Ai flashcards funxtions
  async generateFlashcardsAi(lessonId: number, pdfFile: File): Promise<ApiResponse<GeneratedFlashcardsResponse>> {
    const formData = new FormData();
    formData.append('lesson_id', lessonId.toString());
    formData.append('pdf', pdfFile);
  
    const response = await this.api.post<ApiResponse<GeneratedFlashcardsResponse>>('/generateFlashcardsAi', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async generateFlashcardsFromText(lessonId: number,cardsNumber:number,text: string,fileName: string): Promise<ApiResponse<GeneratedFlashcardsResponse>> {
    const response = await this.api.post<ApiResponse<GeneratedFlashcardsResponse>>('/generateFlashcardsFromText', {
      lesson_id: lessonId,
      cards_number: cardsNumber,
      text: text,
      file_name: fileName
    });
    return response.data;
  }
  
  async createFlashcard(lessonId: number, data: { question: string; answer: string }) {
    const response = await this.api.post('/createFlashcards', {
      lesson_id: lessonId,
      ...data
    });
    return response.data;
  }
  async updateFlashcardDifficulty(flashcardId: number, difficulty: string) {
    const response = await this.api.post(`/flashcards/${flashcardId}/rate`, {
      difficulty
    });
    return response.data;
  }
  
  async updateFlashcard(id: number, data: Partial<Flashcard>) {
    const response = await this.api.put(`/flashcards/${id}`, data);
    return response.data;
  }

  async deleteFlashcard(id: number) {
    const response = await this.api.delete(`/deleteFlashcard/${id}`);
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  clearAuth(): void {
    localStorage.removeItem('auth_token');
  }

}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export the class for testing purposes
export default ApiService;
