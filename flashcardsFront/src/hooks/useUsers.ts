import { apiService } from '../services/api';
import type { User, UserUpdateRequest } from '../services/api';
import { useState, useCallback } from 'react';

interface UsersState {
  users: User[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export const useUsers = () => {
  const [state, setState] = useState<UsersState>({
    users: [],
    pagination: null,
    isLoading: false,
    error: null,
  });

  const fetchUsers = useCallback(async (page: number = 1) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiService.getUsers(page);
      if (response.success) {
        setState({
          users: response.data.data,
          pagination: {
            currentPage: response.data.current_page,
            lastPage: response.data.last_page,
            perPage: response.data.per_page,
            total: response.data.total,
          },
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.message 
        }));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
    }
  }, []);

  const createUser = useCallback(async (userData: {
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
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiService.createUser(userData);
      if (response.success) {
        // Refresh the current page to show the new user
        await fetchUsers(state.pagination?.currentPage || 1);
        return { success: true, user: response.data };
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.message 
        }));
        return { success: false, error: response.message };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  }, [fetchUsers, state.pagination?.currentPage]);

  const updateUser = useCallback(async (id: number, userData: UserUpdateRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiService.updateUser(id, userData);
      if (response.success) {
        // Update the user in the local state
        setState(prev => ({
          ...prev,
          users: prev.users.map(user => 
            user.id === id ? response.data : user
          ),
          isLoading: false,
          error: null,
        }));
        return { success: true, user: response.data };
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.message 
        }));
        return { success: false, error: response.message };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiService.deleteUser(id);
      if (response.success) {
        // Remove the user from local state
        setState(prev => ({
          ...prev,
          users: prev.users.filter(user => user.id !== id),
          isLoading: false,
          error: null,
        }));
        return { success: true };
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.message 
        }));
        return { success: false, error: response.message };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  };
};
