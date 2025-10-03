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

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class BlogRatingService {
    
    @Autowired
    private BlogRatingRepository blogRatingRepository;
    
    @Autowired
    private BlogPostRepository blogPostRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Submit or update a rating with enhanced business logic
    public BlogRating submitRating(Long blogPostId, String firebaseUid, Integer rating) {
        // Enhanced validation
        validateRatingInput(rating);
        
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        User user = findOrCreateUser(firebaseUid);
        
        // Check for spam/abuse patterns
        validateRatingBehavior(user, blogPost);
        
        // Check if user has already rated this blog post
        Optional<BlogRating> existingRating = blogRatingRepository.findByBlogPostAndUser(blogPost, user);
        
        BlogRating blogRating;
        boolean isUpdate = existingRating.isPresent();
        
        if (isUpdate) {
            // Update existing rating
            blogRating = existingRating.get();
            blogRating.setRating(rating);
            blogRating.setUpdatedAt(LocalDateTime.now());
            System.out.println("Updated rating for user " + user.getFirebaseUid() + " on blog post " + blogPostId + " to " + rating);
        } else {
            // Create new rating
            blogRating = new BlogRating(blogPost, user, rating);
            System.out.println("Created new rating for user " + user.getFirebaseUid() + " on blog post " + blogPostId + " with rating " + rating);
        }
        
        BlogRating savedRating = blogRatingRepository.save(blogRating);
        
        // Update blog post's average rating and rating count
        updateBlogPostRatingStats(blogPost);
        
        // Log rating analytics
        logRatingAnalytics(blogPost, user, rating, isUpdate);
        
        return savedRating;
    }
    
    // Enhanced validation for rating input
    private void validateRatingInput(Integer rating) {
        if (rating == null) {
            throw new IllegalArgumentException("Rating cannot be null");
        }
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
    }
    
    // Validate user behavior to prevent spam/abuse
    private void validateRatingBehavior(User user, BlogPost blogPost) {
        // Check if user has rated too many posts recently (anti-spam)
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<BlogRating> recentRatings = blogRatingRepository.findByUserAndCreatedAtAfter(user, oneHourAgo);
        
        if (recentRatings.size() > 10) { // Max 10 ratings per hour
            throw new RuntimeException("Too many ratings submitted recently. Please wait before rating again.");
        }
        
        // Check if user is trying to rate their own blog post
        if (blogPost.getAuthor() != null && blogPost.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("You cannot rate your own blog post");
        }
        
        // Check for suspicious rating patterns (all 1s or all 5s)
        List<BlogRating> userRatings = blogRatingRepository.findByUser(user);
        if (userRatings.size() >= 5) {
            List<Integer> recentRatingsList = userRatings.stream()
                .limit(5)
                .map(BlogRating::getRating)
                .collect(Collectors.toList());
            
            // Check if all recent ratings are the same (potential spam)
            boolean allSame = recentRatingsList.stream().allMatch(r -> r.equals(recentRatingsList.get(0)));
            if (allSame) {
                System.out.println("Warning: User " + user.getFirebaseUid() + " has suspicious rating pattern");
            }
        }
    }
    
    // Log rating analytics for insights
    private void logRatingAnalytics(BlogPost blogPost, User user, Integer rating, boolean isUpdate) {
        String action = isUpdate ? "UPDATED" : "CREATED";
        System.out.println("RATING_ANALYTICS: " + action + " | BlogPost: " + blogPost.getId() + 
                          " | User: " + user.getFirebaseUid() + " | Rating: " + rating + 
                          " | Time: " + LocalDateTime.now());
    }
    
    // Get user's rating for a specific blog post
    public Optional<BlogRating> getUserRating(Long blogPostId, String firebaseUid) {
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        User user = findOrCreateUser(firebaseUid);
        
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
        
        User user = findOrCreateUser(firebaseUid);
        
        blogRatingRepository.deleteByBlogPostAndUser(blogPost, user);
        
        // Update blog post's average rating and rating count
        updateBlogPostRatingStats(blogPost);
    }
    
    // Check if user has rated a blog post
    public boolean hasUserRated(Long blogPostId, String firebaseUid) {
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        User user = findOrCreateUser(firebaseUid);
        
        return blogRatingRepository.existsByBlogPostAndUser(blogPost, user);
    }
    
    // Find user by Firebase UID or create if doesn't exist
    private User findOrCreateUser(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid)
            .orElseGet(() -> {
                System.out.println("Creating new user for rating Firebase UID: " + firebaseUid);
                // Create a new user with unique email based on Firebase UID
                User newUser = new User();
                newUser.setFirebaseUid(firebaseUid);
                
                // Generate unique email to avoid conflicts
                String uniqueEmail = "user-" + firebaseUid.substring(Math.max(0, firebaseUid.length() - 8)) + "@example.com";
                newUser.setEmail(uniqueEmail);
                
                newUser.setDisplayName("Rating User");
                newUser.setEmailVerified(true);
                newUser.setActive(true);
                newUser.setRole(User.UserRole.USER);
                return userRepository.save(newUser);
            });
    }
    
    // Update blog post rating statistics
    private void updateBlogPostRatingStats(BlogPost blogPost) {
        Double averageRating = blogRatingRepository.findAverageRatingByBlogPost(blogPost);
        Long ratingCount = blogRatingRepository.countRatingsByBlogPost(blogPost);
        
        blogPost.setAverageRating(averageRating != null ? averageRating : 0.0);
        blogPost.setRatingCount(ratingCount);
        
        blogPostRepository.save(blogPost);
    }
    
    // ========== ANALYTICS AND INSIGHTS METHODS ==========
    
    // Get rating distribution for a blog post
    public Map<Integer, Long> getRatingDistribution(Long blogPostId) {
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        List<Object[]> distribution = blogRatingRepository.getRatingDistributionByBlogPost(blogPost);
        Map<Integer, Long> result = new HashMap<>();
        
        // Initialize all ratings with 0
        for (int i = 1; i <= 5; i++) {
            result.put(i, 0L);
        }
        
        // Fill in actual counts
        for (Object[] row : distribution) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            result.put(rating, count);
        }
        
        return result;
    }
    
    // Get rating insights for a blog post
    public Map<String, Object> getRatingInsights(Long blogPostId) {
        BlogPost blogPost = blogPostRepository.findById(blogPostId)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        Map<String, Object> insights = new HashMap<>();
        
        // Basic stats
        Double averageRating = blogRatingRepository.findAverageRatingByBlogPost(blogPost);
        Long ratingCount = blogRatingRepository.countRatingsByBlogPost(blogPost);
        
        insights.put("averageRating", averageRating != null ? averageRating : 0.0);
        insights.put("ratingCount", ratingCount);
        
        // Rating distribution
        insights.put("distribution", getRatingDistribution(blogPostId));
        
        // Rating quality indicators
        if (ratingCount > 0) {
            Map<Integer, Long> distribution = getRatingDistribution(blogPostId);
            long highRatings = distribution.get(4) + distribution.get(5);
            long lowRatings = distribution.get(1) + distribution.get(2);
            
            insights.put("highRatingPercentage", (highRatings * 100.0) / ratingCount);
            insights.put("lowRatingPercentage", (lowRatings * 100.0) / ratingCount);
            insights.put("ratingQuality", averageRating != null && averageRating >= 4.0 ? "Excellent" : 
                        averageRating != null && averageRating >= 3.0 ? "Good" : 
                        averageRating != null && averageRating >= 2.0 ? "Average" : "Poor");
        }
        
        return insights;
    }
    
    // Get recent rating activity
    public List<Map<String, Object>> getRecentRatingActivity(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<BlogRating> recentRatings = blogRatingRepository.findRecentRatings(since);
        
        return recentRatings.stream().map(rating -> {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", rating.getId());
            activity.put("blogPostId", rating.getBlogPost().getId());
            activity.put("blogPostTitle", rating.getBlogPost().getTitle());
            activity.put("userId", rating.getUser().getFirebaseUid());
            activity.put("rating", rating.getRating());
            activity.put("createdAt", rating.getCreatedAt());
            activity.put("updatedAt", rating.getUpdatedAt());
            return activity;
        }).collect(Collectors.toList());
    }
    
    // Get top rated blog posts
    public List<Map<String, Object>> getTopRatedBlogPosts(Long minRatings) {
        List<Object[]> topPosts = blogRatingRepository.getTopRatedBlogPosts(minRatings);
        
        return topPosts.stream().map(row -> {
            Map<String, Object> postData = new HashMap<>();
            BlogPost blogPost = (BlogPost) row[0];
            Double avgRating = (Double) row[1];
            Long ratingCount = (Long) row[2];
            
            postData.put("blogPostId", blogPost.getId());
            postData.put("title", blogPost.getTitle());
            postData.put("averageRating", avgRating);
            postData.put("ratingCount", ratingCount);
            postData.put("author", blogPost.getAuthor() != null ? blogPost.getAuthor().getDisplayName() : "Unknown");
            
            return postData;
        }).collect(Collectors.toList());
    }
    
    // Get user rating statistics
    public Map<String, Object> getUserRatingStats(String firebaseUid) {
        User user = findOrCreateUser(firebaseUid);
        List<BlogRating> userRatings = blogRatingRepository.findByUserOrderByCreatedAtDesc(user);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRatings", userRatings.size());
        
        if (!userRatings.isEmpty()) {
            double averageGiven = userRatings.stream().mapToInt(BlogRating::getRating).average().orElse(0.0);
            stats.put("averageRatingGiven", averageGiven);
            
            // Rating pattern analysis
            Map<Integer, Long> ratingPattern = userRatings.stream()
                .collect(Collectors.groupingBy(BlogRating::getRating, Collectors.counting()));
            stats.put("ratingPattern", ratingPattern);
            
            // Recent activity
            LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
            long recentRatings = userRatings.stream()
                .filter(r -> r.getCreatedAt().isAfter(oneWeekAgo))
                .count();
            stats.put("recentRatings", recentRatings);
        }
        
        return stats;
    }
}
