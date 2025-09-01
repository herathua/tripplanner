// Export all API services
export * from './tripService';
export * from './userService';
export * from './placeService';
export * from './expenseService';
export * from './aiChatbotService';

// Export the API client for direct use if needed
export { default as apiClient } from '../config/api';
export { API_CONFIG } from '../config/api';
