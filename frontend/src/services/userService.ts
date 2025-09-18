import apiClient from '../config/api';

export interface User {
  id?: number;
  firebaseUid?: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  phoneNumber?: string;
  role?: UserRole;
  emailVerified?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export const userService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Create a new user
  async createUser(user: User): Promise<User> {
    const response = await apiClient.post('/users', user);
    return response.data;
  },

  // Update user
  async updateUser(id: number, user: User): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, user);
    return response.data;
  },

  // Delete user
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  // Get user by Firebase UID
  async getUserByFirebaseUid(firebaseUid: string): Promise<User> {
    const response = await apiClient.get(`/users/firebase/${firebaseUid}`);
    return response.data;
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User> {
    const response = await apiClient.get(`/users/email/${email}`);
    return response.data;
  },

  // Sync user (create or update)
  async syncUser(userData: Partial<User>): Promise<User> {
    const response = await apiClient.post('/users/sync', userData);
    return response.data;
  }
};
