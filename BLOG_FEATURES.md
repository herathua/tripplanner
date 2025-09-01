# Blog Features Documentation

## Overview
The blog system allows users to create, edit, and publish travel blog posts with rich content editing capabilities.

## Features

### 1. Rich Text Editor
- **Editor.js Integration**: Uses Editor.js for rich content editing
- **Supported Blocks**: Headers, paragraphs, images, lists, quotes, code blocks, embeds, and markers
- **Image Upload**: Supports image upload with Supabase storage (with base64 fallback)
- **Real-time Preview**: Live preview of content as you type

### 2. Blog Post Management
- **Draft System**: Save posts as drafts before publishing
- **Publishing**: One-click publishing with automatic public URL generation
- **Tags**: Add multiple tags to categorize posts
- **SEO-friendly URLs**: Automatic slug generation for public access

### 3. Public Access
- **Public URLs**: Each published post gets a unique public URL
- **View Tracking**: Automatic view count tracking
- **Social Sharing**: Built-in social media sharing buttons
- **Responsive Design**: Mobile-friendly blog post display

## API Endpoints

### Private Endpoints (Require Authentication)
- `POST /api/blog-posts` - Create new blog post
- `PUT /api/blog-posts/{id}` - Update blog post
- `POST /api/blog-posts/{id}/publish` - Publish blog post
- `POST /api/blog-posts/{id}/draft` - Save as draft
- `DELETE /api/blog-posts/{id}` - Delete blog post
- `GET /api/blog-posts/user/{authorId}` - Get user's blog posts
- `GET /api/blog-posts/user/{authorId}/drafts` - Get user's draft posts

### Public Endpoints
- `GET /api/public/blog-posts/{slug}` - Get public blog post
- `GET /api/public/blog-posts` - Get all published posts
- `GET /api/public/blog-posts/search` - Search published posts
- `GET /api/public/blog-posts/tag/{tag}` - Get posts by tag
- `GET /api/public/blog-posts/popular` - Get most viewed posts
- `GET /api/public/blog-posts/recent` - Get recent posts

## Frontend Routes

- `/blog` - Blog listing page (public)
- `/blog/new` - Create new blog post (authenticated)
- `/blog/{slug}` - View published blog post (public)

## Database Schema

### BlogPost Entity
```java
- id: Long (Primary Key)
- title: String (Required)
- content: String (JSON format from Editor.js)
- tags: List<String>
- status: BlogPostStatus (DRAFT, PUBLISHED, ARCHIVED)
- publicSlug: String (Unique, auto-generated)
- author: User (Many-to-One)
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
- publishedAt: LocalDateTime
- viewCount: Long
```

## Usage Instructions

### Creating a Blog Post
1. Navigate to `/blog/new`
2. Enter a title for your post
3. Add tags (optional)
4. Use the rich text editor to write your content
5. Click "Save Draft" to save your work
6. Click "Publish" to make it publicly available

### Viewing Blog Posts
1. Navigate to `/blog` to see all published posts
2. Click on any post title to read the full article
3. Use the search functionality to find specific posts
4. Filter by tags to find related content

### Managing Your Posts
1. Your drafts are automatically saved
2. You can edit published posts (they'll be saved as drafts)
3. Republish to update the public version
4. Delete posts you no longer want

## Technical Notes

### Image Handling
- Images are uploaded to Supabase storage
- If Supabase upload fails, images are converted to base64
- This ensures the editor always works regardless of storage configuration

### Content Storage
- Blog content is stored as JSON (Editor.js format)
- This allows for rich formatting and block-based content
- Content is rendered using Editor.js in read-only mode for public viewing

### Security
- Only authenticated users can create/edit posts
- Users can only edit their own posts
- Public posts are accessible to everyone
- Draft posts are only visible to the author

## Future Enhancements
- Comment system
- Like/favorite functionality
- Advanced search and filtering
- Blog post categories
- Author profiles
- RSS feeds
- Email notifications
