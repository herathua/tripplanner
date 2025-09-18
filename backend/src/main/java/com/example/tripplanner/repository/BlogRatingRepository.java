package com.example.tripplanner.repository;

import com.example.tripplanner.model.BlogRating;
import com.example.tripplanner.model.BlogPost;
import com.example.tripplanner.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}
