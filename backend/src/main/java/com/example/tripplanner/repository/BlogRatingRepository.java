package com.example.tripplanner.repository;

import com.example.tripplanner.model.BlogRating;
import com.example.tripplanner.model.BlogPost;
import com.example.tripplanner.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BlogRatingRepository extends JpaRepository<BlogRating, Long> {
    
    // Find rating by blog post and user
    Optional<BlogRating> findByBlogPostAndUser(BlogPost blogPost, User user);
    
    // Find all ratings for a specific blog post
    List<BlogRating> findByBlogPost(BlogPost blogPost);
    
    // Find all ratings by a specific user
    List<BlogRating> findByUser(User user);
    
    // Calculate average rating for a blog post
    @Query("SELECT AVG(br.rating) FROM BlogRating br WHERE br.blogPost = :blogPost")
    Double findAverageRatingByBlogPost(@Param("blogPost") BlogPost blogPost);
    
    // Count total ratings for a blog post
    @Query("SELECT COUNT(br) FROM BlogRating br WHERE br.blogPost = :blogPost")
    Long countRatingsByBlogPost(@Param("blogPost") BlogPost blogPost);
    
    // Check if user has rated a blog post
    boolean existsByBlogPostAndUser(BlogPost blogPost, User user);
    
    // Delete rating by blog post and user
    void deleteByBlogPostAndUser(BlogPost blogPost, User user);
    
    // Find ratings by user created after a specific date (for anti-spam)
    List<BlogRating> findByUserAndCreatedAtAfter(User user, LocalDateTime date);
    
    // Find ratings by user ordered by creation date (for pattern analysis)
    List<BlogRating> findByUserOrderByCreatedAtDesc(User user);
    
    // Get rating distribution for a blog post
    @Query("SELECT br.rating, COUNT(br) FROM BlogRating br WHERE br.blogPost = :blogPost GROUP BY br.rating ORDER BY br.rating")
    List<Object[]> getRatingDistributionByBlogPost(@Param("blogPost") BlogPost blogPost);
    
    // Get recent ratings for analytics
    @Query("SELECT br FROM BlogRating br WHERE br.createdAt >= :since ORDER BY br.createdAt DESC")
    List<BlogRating> findRecentRatings(@Param("since") LocalDateTime since);
    
    // Get top rated blog posts
    @Query("SELECT br.blogPost, AVG(br.rating) as avgRating, COUNT(br) as ratingCount " +
           "FROM BlogRating br GROUP BY br.blogPost " +
           "HAVING COUNT(br) >= :minRatings " +
           "ORDER BY avgRating DESC, ratingCount DESC")
    List<Object[]> getTopRatedBlogPosts(@Param("minRatings") Long minRatings);
}
