
import { toast } from "@/hooks/use-toast";

// Базовый URL API
const API_BASE_URL = "https://api.example.com/v1";

// Типы для работы с API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Интерфейсы данных
export interface DashboardStats {
  leads: number;
  sales: number;
  tasks: number;
  revenue: number;
  conversionRate: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'active' | 'inactive' | 'lead';
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  clientId: string;
  amount: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  relatedTo?: {
    type: 'client' | 'deal';
    id: string;
  };
  dueDate: string;
  status: 'todo' | 'in_progress' | 'done' | 'canceled';
  priority: 'low' | 'medium' | 'high';
}

// Класс для работы с API
class ApiClient {
  private token: string | null = null;
  
  // Конструктор, который может принимать токен при инициализации
  constructor(token?: string) {
    if (token) {
      this.token = token;
      localStorage.setItem('auth_token', token);
    } else {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // Метод для выполнения запросов
  private async request<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      
      const config: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };
      
      // В реальном приложении здесь будет настоящий запрос к API
      // const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      // const responseData = await response.json();
      
      // Имитация ответа API для демонстрации
      console.log(`API Request: ${method} ${endpoint}`, data);
      
      // Имитируем задержку сети
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Здесь должны быть реальные данные, но для примера просто возвращаем успех
      return {
        success: true,
        data: {} as T,
      };
      
    } catch (error) {
      console.error('API request failed:', error);
      toast({
        title: "Ошибка API",
        description: "Не удалось выполнить запрос к серверу",
        variant: "destructive",
      });
      
      return {
        success: false,
        data: {} as T,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }
  
  // Аутентификация
  async login(email: string, password: string): Promise<ApiResponse<{token: string}>> {
    const response = await this.request<{token: string}>('/auth/login', 'POST', { email, password });
    
    if (response.success && response.data.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response;
  }
  
  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
  
  // Методы для работы с данными
  
  // Дашборд
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/dashboard/stats');
  }
  
  // Клиенты
  async getClients(): Promise<ApiResponse<Client[]>> {
    return this.request<Client[]>('/clients');
  }
  
  async getClient(id: string): Promise<ApiResponse<Client>> {
    return this.request<Client>(`/clients/${id}`);
  }
  
  async createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<ApiResponse<Client>> {
    return this.request<Client>('/clients', 'POST', client);
  }
  
  async updateClient(id: string, data: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.request<Client>(`/clients/${id}`, 'PUT', data);
  }
  
  async deleteClient(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/clients/${id}`, 'DELETE');
  }
  
  // Сделки
  async getDeals(): Promise<ApiResponse<Deal[]>> {
    return this.request<Deal[]>('/deals');
  }
  
  async getDeal(id: string): Promise<ApiResponse<Deal>> {
    return this.request<Deal>(`/deals/${id}`);
  }
  
  async createDeal(deal: Omit<Deal, 'id' | 'createdAt'>): Promise<ApiResponse<Deal>> {
    return this.request<Deal>('/deals', 'POST', deal);
  }
  
  async updateDeal(id: string, data: Partial<Deal>): Promise<ApiResponse<Deal>> {
    return this.request<Deal>(`/deals/${id}`, 'PUT', data);
  }
  
  async deleteDeal(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/deals/${id}`, 'DELETE');
  }
  
  // Задачи
  async getTasks(): Promise<ApiResponse<Task[]>> {
    return this.request<Task[]>('/tasks');
  }
  
  async getTask(id: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${id}`);
  }
  
  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<ApiResponse<Task>> {
    return this.request<Task>('/tasks', 'POST', task);
  }
  
  async updateTask(id: string, data: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${id}`, 'PUT', data);
  }
  
  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tasks/${id}`, 'DELETE');
  }
}

// Экспортируем экземпляр API клиента для использования в приложении
export const api = new ApiClient();
