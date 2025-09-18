import apiClient from '../config/api';

export interface BlogPost {
  id?: number;
  title: string;
  content: string;
  tags: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publicSlug?: string;
  author?: any;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  viewCount?: number;
  coverImage?: {
    url: string;
    alt: string;
    credit: string;
  };
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
    const response = await apiClient.put(`${this.baseUrl}/${id}/publish?firebaseUid=${firebaseUid}`);
    return response.data;
  }

  // Save as draft
  async saveAsDraft(id: number, firebaseUid: string): Promise<BlogPost> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/draft?firebaseUid=${firebaseUid}`);
    return response.data;
  }

  // Get blog post by ID
  async getBlogPostById(id: number): Promise<BlogPost> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get user's blog posts
  async getUserBlogPosts(firebaseUid: string, page: number = 0, size: number = 10): Promise<BlogPostResponse> {
    const response = await apiClient.get(`${this.baseUrl}/user/${firebaseUid}?page=${page}&size=${size}`);
    return response.data;
  }

  // Delete blog post
  async deleteBlogPost(id: number, firebaseUid: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}?firebaseUid=${firebaseUid}`);
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
    const response = await apiClient.get(`${this.publicUrl}/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
    return response.data;
  }

  // Get published blog posts by tag
  async getPublishedBlogPostsByTag(tag: string, page: number = 0, size: number = 10): Promise<BlogPostResponse> {
    const response = await apiClient.get(`${this.publicUrl}/tag/${encodeURIComponent(tag)}?page=${page}&size=${size}`);
    return response.data;
  }
}

export const blogService = new BlogService();