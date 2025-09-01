import apiClient from '../config/api';

export interface BlogPost {
  id?: number;
  title: string;
  content: string;
  tags: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publicSlug?: string;
  slug?: string;
  author?: any;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  viewCount?: number;
  views?: number;
  image?: string;
}

export interface BlogPostResponse {
  content: BlogPost[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PublishResponse {
  message: string;
  blogPost: BlogPost;
  publicUrl: string;
}

class BlogService {
  private baseUrl = '/blog-posts';
  private publicUrl = '/public/blog-posts';

  // Create new blog post
  async createBlogPost(blogPost: BlogPost, firebaseUid: string): Promise<BlogPost> {
    const response = await apiClient.post(`${this.baseUrl}?firebaseUid=${firebaseUid}`, blogPost);
    return response.data;
  }

  // Update blog post
  async updateBlogPost(id: number, blogPost: BlogPost, firebaseUid: string): Promise<BlogPost> {
    const response = await apiClient.put(`${this.baseUrl}/${id}?firebaseUid=${firebaseUid}`, blogPost);
    return response.data;
  }

  // Publish blog post
  async publishBlogPost(id: number, firebaseUid: string): Promise<PublishResponse> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/publish?firebaseUid=${firebaseUid}`);
    return response.data;
  }

  // Save as draft
  async saveAsDraft(id: number, firebaseUid: string): Promise<BlogPost> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/draft?firebaseUid=${firebaseUid}`);
    return response.data;
  }

  // Delete blog post
  async deleteBlogPost(id: number, firebaseUid: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}?firebaseUid=${firebaseUid}`);
  }

  // Get blog post by ID
  async getBlogPostById(id: number): Promise<BlogPost> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get blog post by slug (private access)
  async getBlogPostBySlug(slug: string, firebaseUid: string): Promise<BlogPost> {
    const response = await apiClient.get(`${this.baseUrl}/slug/${slug}?firebaseUid=${firebaseUid}`);
    return response.data;
  }

  // Get user's blog posts
  async getUserBlogPosts(firebaseUid: string, page: number = 0, size: number = 10): Promise<BlogPostResponse> {
    const response = await apiClient.get(`${this.baseUrl}/user/${firebaseUid}?page=${page}&size=${size}`);
    return response.data;
  }

  // Get user's draft blog posts
  async getUserDraftBlogPosts(firebaseUid: string, page: number = 0, size: number = 10): Promise<BlogPostResponse> {
    const response = await apiClient.get(`${this.baseUrl}/user/${firebaseUid}/drafts?page=${page}&size=${size}`);
    return response.data;
  }

  // Check if slug is available
  async checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
    const response = await apiClient.get(`${this.baseUrl}/check-slug/${slug}`);
    return response.data;
  }

  // Public endpoints

  // Get public blog post by slug
  async getPublicBlogPost(slug: string): Promise<BlogPost> {
    const response = await apiClient.get(`${this.publicUrl}/${slug}`);
    return response.data;
  }

  // Get all published blog posts
  async getPublishedBlogPosts(page: number = 0, size: number = 10): Promise<BlogPostResponse> {
    const response = await apiClient.get(`${this.publicUrl}?page=${page}&size=${size}`);
    return response.data;
  }

  // Search published blog posts
  async searchPublishedBlogPosts(query: string, page: number = 0, size: number = 10): Promise<BlogPostResponse> {
    const response = await apiClient.get(`${this.publicUrl}/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
    return response.data;
  }

  // Get published blog posts by tag
  async getPublishedBlogPostsByTag(tag: string, page: number = 0, size: number = 10): Promise<BlogPostResponse> {
    const response = await apiClient.get(`${this.publicUrl}/tag/${encodeURIComponent(tag)}?page=${page}&size=${size}`);
    return response.data;
  }

  // Get most viewed published blog posts
  async getMostViewedPublishedBlogPosts(page: number = 0, size: number = 10): Promise<BlogPostResponse> {
    const response = await apiClient.get(`${this.publicUrl}/popular?page=${page}&size=${size}`);
    return response.data;
  }

  // Get recent published blog posts
  async getRecentPublishedBlogPosts(page: number = 0, size: number = 10): Promise<BlogPostResponse> {
    const response = await apiClient.get(`${this.publicUrl}/recent?page=${page}&size=${size}`);
    return response.data;
  }
}

export const blogService = new BlogService();
