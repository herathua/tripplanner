package com.example.tripplanner.controller;

import com.example.tripplanner.model.BlogRating;
import com.example.tripplanner.service.BlogRatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/blog-ratings")
@CrossOrigin(origins = "*")
public class BlogRatingController {
    
    @Autowired
    private BlogRatingService blogRatingService;
    
    // Submit or update a rating
    @PostMapping("/{blogPostId}")
    public ResponseEntity<?> submitRating(@PathVariable Long blogPostId, 
                                         @RequestParam String firebaseUid,
                                         @RequestParam Integer rating) {
        try {
            BlogRating blogRating = blogRatingService.submitRating(blogPostId, firebaseUid, rating);
            return ResponseEntity.ok(blogRating);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error submitting rating: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    // Get user's rating for a specific blog post
    @GetMapping("/{blogPostId}/user/{firebaseUid}")
    public ResponseEntity<?> getUserRating(@PathVariable Long blogPostId, 
                                          @PathVariable String firebaseUid) {
        try {
            Optional<BlogRating> rating = blogRatingService.getUserRating(blogPostId, firebaseUid);
            if (rating.isPresent()) {
                return ResponseEntity.ok(rating.get());
            } else {
                return ResponseEntity.ok(Map.of("rating", null));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error getting user rating: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    // Get all ratings for a blog post
    @GetMapping("/{blogPostId}/all")
    public ResponseEntity<?> getBlogPostRatings(@PathVariable Long blogPostId) {
        try {
            List<BlogRating> ratings = blogRatingService.getBlogPostRatings(blogPostId);
            return ResponseEntity.ok(ratings);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error getting blog post ratings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    // Get average rating for a blog post
    @GetMapping("/{blogPostId}/average")
    public ResponseEntity<?> getAverageRating(@PathVariable Long blogPostId) {
        try {
            Double averageRating = blogRatingService.getAverageRating(blogPostId);
            return ResponseEntity.ok(Map.of("averageRating", averageRating));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error getting average rating: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    // Get rating count for a blog post
    @GetMapping("/{blogPostId}/count")
    public ResponseEntity<?> getRatingCount(@PathVariable Long blogPostId) {
        try {
            Long ratingCount = blogRatingService.getRatingCount(blogPostId);
            return ResponseEntity.ok(Map.of("ratingCount", ratingCount));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error getting rating count: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    // Get rating statistics for a blog post
    @GetMapping("/{blogPostId}/stats")
    public ResponseEntity<?> getRatingStats(@PathVariable Long blogPostId) {
        try {
            Double averageRating = blogRatingService.getAverageRating(blogPostId);
            Long ratingCount = blogRatingService.getRatingCount(blogPostId);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("averageRating", averageRating);
            stats.put("ratingCount", ratingCount);
            
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error getting rating stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    // Check if user has rated a blog post
    @GetMapping("/{blogPostId}/user/{firebaseUid}/exists")
    public ResponseEntity<?> hasUserRated(@PathVariable Long blogPostId, 
                                         @PathVariable String firebaseUid) {
        try {
            boolean hasRated = blogRatingService.hasUserRated(blogPostId, firebaseUid);
            return ResponseEntity.ok(Map.of("hasRated", hasRated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error checking if user has rated: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    // Delete a rating
    @DeleteMapping("/{blogPostId}/user/{firebaseUid}")
    public ResponseEntity<?> deleteRating(@PathVariable Long blogPostId, 
                                         @PathVariable String firebaseUid) {
        try {
            blogRatingService.deleteRating(blogPostId, firebaseUid);
            return ResponseEntity.ok(Map.of("message", "Rating deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error deleting rating: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    // ========== ANALYTICS AND INSIGHTS ENDPOINTS ==========
    
    // Get rating distribution for a blog post
    @GetMapping("/{blogPostId}/distribution")
    public ResponseEntity<?> getRatingDistribution(@PathVariable Long blogPostId) {
        try {
            Map<Integer, Long> distribution = blogRatingService.getRatingDistribution(blogPostId);
            return ResponseEntity.ok(distribution);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error getting rating distribution: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    // Get comprehensive rating insights for a blog post
    @GetMapping("/{blogPostId}/insights")
    public ResponseEntity<?> getRatingInsights(@PathVariable Long blogPostId) {
        try {
            Map<String, Object> insights = blogRatingService.getRatingInsights(blogPostId);
            return ResponseEntity.ok(insights);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error getting rating insights: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    // Get recent rating activity
    @GetMapping("/recent-activity")
    public ResponseEntity<?> getRecentRatingActivity(@RequestParam(defaultValue = "24") int hours) {
        try {
            List<Map<String, Object>> activity = blogRatingService.getRecentRatingActivity(hours);
            return ResponseEntity.ok(activity);
        } catch (Exception e) {
            System.err.println("Error getting recent rating activity: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    // Get top rated blog posts
    @GetMapping("/top-rated")
    public ResponseEntity<?> getTopRatedBlogPosts(@RequestParam(defaultValue = "5") Long minRatings) {
        try {
            List<Map<String, Object>> topPosts = blogRatingService.getTopRatedBlogPosts(minRatings);
            return ResponseEntity.ok(topPosts);
        } catch (Exception e) {
            System.err.println("Error getting top rated blog posts: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    // Get user rating statistics
    @GetMapping("/user/{firebaseUid}/stats")
    public ResponseEntity<?> getUserRatingStats(@PathVariable String firebaseUid) {
        try {
            Map<String, Object> stats = blogRatingService.getUserRatingStats(firebaseUid);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error getting user rating stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
}
