import apiClient from '../config/api';

export interface BlogRating {
  id?: number;
  blogPostId: number;
  userId: string;
  rating: number; // 1-5 stars
  createdAt?: string;
  updatedAt?: string;
}

export interface RatingStats {
  averageRating: number;
  ratingCount: number;
}

class BlogRatingService {
  private baseUrl = '/blog-ratings';

  // Submit or update a rating
  async submitRating(blogPostId: number, firebaseUid: string, rating: number): Promise<BlogRating> {
    const response = await apiClient.post(`${this.baseUrl}/${blogPostId}?firebaseUid=${firebaseUid}&rating=${rating}`);
    return response.data;
  }

  // Get user's rating for a specific blog post
  async getUserRating(blogPostId: number, firebaseUid: string): Promise<BlogRating | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${blogPostId}/user/${firebaseUid}`);
      return response.data.rating || null;
    } catch (error) {
      return null;
    }
  }

  // Get all ratings for a blog post
  async getBlogPostRatings(blogPostId: number): Promise<BlogRating[]> {
    const response = await apiClient.get(`${this.baseUrl}/${blogPostId}/all`);
    return response.data;
  }

  // Get average rating for a blog post
  async getAverageRating(blogPostId: number): Promise<number> {
    const response = await apiClient.get(`${this.baseUrl}/${blogPostId}/average`);
    return response.data.averageRating || 0;
  }

  // Get rating count for a blog post
  async getRatingCount(blogPostId: number): Promise<number> {
    const response = await apiClient.get(`${this.baseUrl}/${blogPostId}/count`);
    return response.data.ratingCount || 0;
  }

  // Get rating statistics for a blog post
  async getRatingStats(blogPostId: number): Promise<RatingStats> {
    const response = await apiClient.get(`${this.baseUrl}/${blogPostId}/stats`);
    return response.data;
  }

  // Check if user has rated a blog post
  async hasUserRated(blogPostId: number, firebaseUid: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${blogPostId}/user/${firebaseUid}/exists`);
      return response.data.hasRated;
    } catch (error) {
      return false;
    }
  }

  // Delete a rating
  async deleteRating(blogPostId: number, firebaseUid: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${blogPostId}/user/${firebaseUid}`);
    return response.data;
  }
}

export const blogRatingService = new BlogRatingService();
