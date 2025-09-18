# Blog Post Rating System

This document describes the implementation of a comprehensive 5-star rating system for blog posts in the Trip Planner application.

## Overview

The rating system allows users to rate blog posts on a scale of 1-5 stars, with automatic calculation of average ratings and rating counts. The system includes both display-only ratings (for guide cards) and interactive ratings (for detailed blog views).

## Backend Implementation

### Database Schema

#### BlogRating Entity
- `id`: Primary key
- `blogPostId`: Foreign key to blog_posts table
- `userId`: Foreign key to users table  
- `rating`: Integer value (1-5)
- `createdAt`: Timestamp when rating was created
- `updatedAt`: Timestamp when rating was last updated
- Unique constraint on (blogPostId, userId) to prevent duplicate ratings

#### BlogPost Updates
- `averageRating`: Decimal field storing the calculated average rating
- `ratingCount`: Long field storing the total number of ratings

### API Endpoints

#### Rating Operations
- `POST /blog-ratings/{blogPostId}` - Submit or update a rating
- `GET /blog-ratings/{blogPostId}/user/{firebaseUid}` - Get user's rating for a blog post
- `GET /blog-ratings/{blogPostId}/all` - Get all ratings for a blog post
- `GET /blog-ratings/{blogPostId}/average` - Get average rating
- `GET /blog-ratings/{blogPostId}/count` - Get rating count
- `GET /blog-ratings/{blogPostId}/stats` - Get both average and count
- `GET /blog-ratings/{blogPostId}/user/{firebaseUid}/exists` - Check if user has rated
- `DELETE /blog-ratings/{blogPostId}/user/{firebaseUid}` - Delete a rating

### Services

#### BlogRatingService
- `submitRating()` - Submit or update a user's rating
- `getUserRating()` - Get user's rating for a specific blog post
- `getBlogPostRatings()` - Get all ratings for a blog post
- `getAverageRating()` - Calculate average rating
- `getRatingCount()` - Count total ratings
- `deleteRating()` - Remove a rating
- `hasUserRated()` - Check if user has rated
- `updateBlogPostRatingStats()` - Update blog post statistics

## Frontend Implementation

### Components

#### StarRating Component
A reusable component for displaying star ratings with the following features:
- Configurable size (sm, md, lg)
- Optional interactivity
- Optional statistics display
- Hover effects for interactive mode
- Loading states

**Props:**
- `blogPostId`: ID of the blog post
- `firebaseUid`: User's Firebase UID (for interactive mode)
- `averageRating`: Current average rating
- `ratingCount`: Total number of ratings
- `showStats`: Whether to show rating statistics
- `interactive`: Whether the rating is clickable
- `size`: Size of the stars
- `onRatingChange`: Callback when rating changes

#### InteractiveRating Component
A specialized component for interactive rating submission:
- Full 5-star interactive interface
- User feedback on rating submission
- Login requirement handling
- Real-time rating updates

### Services

#### BlogRatingService
Frontend service for interacting with rating API:
- `submitRating()` - Submit a rating
- `getUserRating()` - Get user's rating
- `getBlogPostRatings()` - Get all ratings
- `getAverageRating()` - Get average rating
- `getRatingCount()` - Get rating count
- `getRatingStats()` - Get combined statistics
- `hasUserRated()` - Check if user has rated
- `deleteRating()` - Delete a rating

## Usage Examples

### Display-Only Rating (Guide Cards)
```tsx
<StarRating
  blogPostId={post.id!}
  averageRating={post.averageRating}
  ratingCount={post.ratingCount}
  showStats={false}
  interactive={false}
  size="sm"
/>
```

### Interactive Rating (Blog Viewer)
```tsx
<InteractiveRating
  blogPostId={blogPost.id!}
  firebaseUid={user?.uid}
  onRatingSubmitted={(rating) => {
    console.log('User rated:', rating);
    // Refresh blog post data
  }}
/>
```

### Rating with Statistics
```tsx
<StarRating
  blogPostId={post.id!}
  averageRating={post.averageRating}
  ratingCount={post.ratingCount}
  showStats={true}
  interactive={true}
  firebaseUid={user?.uid}
  size="md"
/>
```

## Database Migration

Run the provided SQL migration script to add the necessary database tables and columns:

```sql
-- Add rating columns to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN rating_count BIGINT DEFAULT 0;

-- Create blog_ratings table
CREATE TABLE blog_ratings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    blog_post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_blog_rating (blog_post_id, user_id)
);
```

## Features

### User Experience
- **Visual Feedback**: Hover effects and filled/unfilled star states
- **Real-time Updates**: Ratings update immediately after submission
- **User Context**: Shows user's previous rating if they've already rated
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Data Integrity
- **Unique Constraints**: Prevents duplicate ratings from the same user
- **Automatic Calculations**: Average ratings and counts are calculated automatically
- **Cascade Deletion**: Ratings are deleted when blog posts or users are deleted
- **Validation**: Rating values are validated to be between 1-5

### Performance
- **Efficient Queries**: Optimized database queries with proper indexing
- **Caching**: Rating statistics are stored in the blog_posts table for fast retrieval
- **Lazy Loading**: User ratings are loaded only when needed

## Integration Points

### Blog Post Display
- Guide cards now show dynamic ratings instead of hardcoded values
- Travel guide page displays real average ratings
- Blog post viewers can include interactive rating components

### User Authentication
- Ratings require user authentication (Firebase UID)
- Users can only rate each blog post once
- Users can update their existing ratings

### Admin Features
- Rating statistics are available for blog post management
- Rating data can be used for analytics and reporting

## Future Enhancements

Potential improvements to consider:
- **Rating Analytics**: Detailed rating breakdowns and trends
- **Rating Moderation**: Admin tools to manage inappropriate ratings
- **Rating Notifications**: Notify authors when their posts receive ratings
- **Rating Categories**: Different rating criteria (content, images, etc.)
- **Rating Reviews**: Optional text reviews alongside star ratings
