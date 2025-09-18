import apiClient from '../config/api';
import { User, UserRole } from './userService';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTrips: number;
  totalBlogPosts: number;
  recentRegistrations: number;
  userRoleDistribution: {
    USER: number;
    ADMIN: number;
    PREMIUM: number;
  };
}

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
  userId?: string;
  action?: string;
}

export const adminService = {
  // Get admin dashboard statistics
  async getAdminStats(): Promise<AdminStats> {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  // Get all users with admin privileges
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  // Update user role
  async updateUserRole(userId: number, role: UserRole): Promise<User> {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Toggle user active status
  async toggleUserStatus(userId: number, active: boolean): Promise<User> {
    const response = await apiClient.put(`/admin/users/${userId}/status`, { active });
    return response.data;
  },

  // Delete user (admin only)
  async deleteUser(userId: number): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  // Get system logs
  async getSystemLogs(limit: number = 100): Promise<SystemLog[]> {
    const response = await apiClient.get(`/admin/logs?limit=${limit}`);
    return response.data;
  },

  // Get user activity logs
  async getUserActivityLogs(userId: number): Promise<SystemLog[]> {
    const response = await apiClient.get(`/admin/users/${userId}/activity`);
    return response.data;
  },

};
