import apiClient from '../config/api';

export interface TripPlanDTO {
  tripId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string;
  days: DayPlanDTO[];
  places: PlaceDTO[];
  expenses: ExpenseDTO[];
}

export interface DayPlanDTO {
  dayNumber: number;
  date: string;
  notes?: string;
  activities: ActivityDTO[];
}

export interface PlaceDTO {
  id?: number;
  name: string;
  location: string;
  description?: string;
  category: string;
  rating?: number;
  cost?: number;
  duration?: number;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  tripId?: number;
}

export interface ActivityDTO {
  id?: number;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  cost?: number;
  durationHours?: number;
  type: ActivityType;
  status: ActivityStatus;
  tripId?: number;
  itineraryId?: number;
  dayNumber?: number;
  placeId?: number;
}

export interface ExpenseDTO {
  id?: number;
  dayNumber: number;
  expenseDate: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency?: Currency;
  receiptUrl?: string;
  paymentMethod?: string;
  vendor?: string;
  location?: string;
  notes?: string;
  reimbursable?: boolean;
  reimbursed?: boolean;
  reimbursementReference?: string;
  status?: ExpenseStatus;
  tripId?: number;
  activityId?: number;
  placeId?: number;
}

export enum ActivityType {
  SIGHTSEEING = 'SIGHTSEEING',
  RESTAURANT = 'RESTAURANT',
  HOTEL = 'HOTEL',
  TRANSPORT = 'TRANSPORT',
  SHOPPING = 'SHOPPING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER'
}

export enum ActivityStatus {
  PLANNED = 'PLANNED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum ExpenseCategory {
  ACCOMMODATION = 'ACCOMMODATION',
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  ACTIVITIES = 'ACTIVITIES',
  SHOPPING = 'SHOPPING',
  OTHER = 'OTHER'
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  KRW = 'KRW'
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED'
}

export const tripPlanService = {
  // Save complete trip plan
  async saveTripPlan(tripId: number, tripPlan: TripPlanDTO): Promise<TripPlanDTO> {
    const response = await apiClient.post(`/trips/${tripId}/plan`, tripPlan);
    return response.data;
  },

  // Get complete trip plan
  async getTripPlan(tripId: number): Promise<TripPlanDTO> {
    const response = await apiClient.get(`/trips/${tripId}/plan`);
    return response.data;
  }
};
