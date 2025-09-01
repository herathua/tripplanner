package com.example.tripplanner.repository;

import com.example.tripplanner.model.BlogPost;
import com.example.tripplanner.model.BlogPostStatus;
import com.example.tripplanner.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    
    // Find by status
    Page<BlogPost> findByStatus(BlogPostStatus status, Pageable pageable);
    
    // Find by author
    Page<BlogPost> findByAuthor(User author, Pageable pageable);
    
    // Find by author and status
    Page<BlogPost> findByAuthorAndStatus(User author, BlogPostStatus status, Pageable pageable);
    
    // Find by public slug (for public access)
    Optional<BlogPost> findByPublicSlugAndStatus(String publicSlug, BlogPostStatus status);
    
    // Find by public slug (any status, for admin access)
    Optional<BlogPost> findByPublicSlug(String publicSlug);
    
    // Search published posts by title or content
    @Query("SELECT bp FROM BlogPost bp WHERE bp.status = 'PUBLISHED' AND " +
           "(LOWER(bp.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(bp.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<BlogPost> searchPublishedPosts(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Find published posts by tags
    @Query("SELECT bp FROM BlogPost bp WHERE bp.status = 'PUBLISHED' AND :tag MEMBER OF bp.tags")
    Page<BlogPost> findPublishedByTag(@Param("tag") String tag, Pageable pageable);
    
    // Find most viewed published posts
    @Query("SELECT bp FROM BlogPost bp WHERE bp.status = 'PUBLISHED' ORDER BY bp.viewCount DESC")
    Page<BlogPost> findMostViewedPublished(Pageable pageable);
    
    // Find recent published posts
    @Query("SELECT bp FROM BlogPost bp WHERE bp.status = 'PUBLISHED' ORDER BY bp.publishedAt DESC")
    Page<BlogPost> findRecentPublished(Pageable pageable);
    
    // Check if slug exists
    boolean existsByPublicSlug(String publicSlug);
}
