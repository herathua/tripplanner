-- Migration script to add rating columns to blog_posts table
-- Run this script in your database to add the new rating functionality

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

-- Create indexes for better performance
CREATE INDEX idx_blog_ratings_blog_post ON blog_ratings(blog_post_id);
CREATE INDEX idx_blog_ratings_user ON blog_ratings(user_id);
CREATE INDEX idx_blog_ratings_rating ON blog_ratings(rating);

-- Update existing blog posts to have default rating values
UPDATE blog_posts 
SET average_rating = 0.00, rating_count = 0 
WHERE average_rating IS NULL OR rating_count IS NULL;
