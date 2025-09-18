package com.example.tripplanner.service;

import com.example.tripplanner.model.BlogPost;
import com.example.tripplanner.model.BlogRating;
import com.example.tripplanner.model.User;
import com.example.tripplanner.repository.BlogPostRepository;
import com.example.tripplanner.repository.BlogRatingRepository;
import com.example.tripplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BlogRatingService {
    
    @Autowired
    private BlogRatingRepository blogRatingRepository;
    
    @Autowired
    private BlogPostRepository blogPostRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Submit or update a rating
    public BlogRating submitRating(Long blogPostId, String firebaseUid, Integer rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has already rated this blog post
        Optional<BlogRating> existingRating = blogRatingRepository.findByBlogPostAndUser(blogPost, user);
        
        BlogRating blogRating;
        if (existingRating.isPresent()) {
            // Update existing rating
            blogRating = existingRating.get();
            blogRating.setRating(rating);
        } else {
            // Create new rating
            blogRating = new BlogRating(blogPost, user, rating);
        }
        
        BlogRating savedRating = blogRatingRepository.save(blogRating);
        
        // Update blog post's average rating and rating count
        updateBlogPostRatingStats(blogPost);
        
        return savedRating;
    }
    
    // Get user's rating for a specific blog post
    public Optional<BlogRating> getUserRating(Long blogPostId, String firebaseUid) {
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return blogRatingRepository.findByBlogPostAndUser(blogPost, user);
    }
    
    // Get all ratings for a blog post
    public List<BlogRating> getBlogPostRatings(Long blogPostId) {
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        return blogRatingRepository.findByBlogPost(blogPost);
    }
    
    // Get average rating for a blog post
    public Double getAverageRating(Long blogPostId) {
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        Double averageRating = blogRatingRepository.findAverageRatingByBlogPost(blogPost);
        return averageRating != null ? averageRating : 0.0;
    }
    
    // Get rating count for a blog post
    public Long getRatingCount(Long blogPostId) {
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        return blogRatingRepository.countRatingsByBlogPost(blogPost);
    }
    
    // Delete a rating
    public void deleteRating(Long blogPostId, String firebaseUid) {
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        blogRatingRepository.deleteByBlogPostAndUser(blogPost, user);
        
        // Update blog post's average rating and rating count
        updateBlogPostRatingStats(blogPost);
    }
    
    // Check if user has rated a blog post
    public boolean hasUserRated(Long blogPostId, String firebaseUid) {
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return blogRatingRepository.existsByBlogPostAndUser(blogPost, user);
    }
    
    // Update blog post rating statistics
    private void updateBlogPostRatingStats(BlogPost blogPost) {
        Double averageRating = blogRatingRepository.findAverageRatingByBlogPost(blogPost);
        Long ratingCount = blogRatingRepository.countRatingsByBlogPost(blogPost);
        
        blogPost.setAverageRating(averageRating != null ? averageRating : 0.0);
        blogPost.setRatingCount(ratingCount);
        
        blogPostRepository.save(blogPost);
    }
}
