package com.example.tripplanner.service;

import com.example.tripplanner.model.BlogPost;
import com.example.tripplanner.model.BlogPostStatus;
import com.example.tripplanner.model.User;
import com.example.tripplanner.repository.BlogPostRepository;
import com.example.tripplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class BlogPostService {
    
    @Autowired
    private BlogPostRepository blogPostRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public BlogPost createBlogPost(BlogPost blogPost, String firebaseUid) {
        try {
            User author = userRepository.findByFirebaseUid(firebaseUid)
                    .orElseGet(() -> createDefaultUser(firebaseUid));
            
            blogPost.setAuthor(author);
            blogPost.setStatus(BlogPostStatus.DRAFT);
            
            return blogPostRepository.save(blogPost);
        } catch (Exception e) {
            System.err.println("=== ERROR CREATING BLOG POST ===");
            System.err.println("Firebase UID: " + firebaseUid);
            System.err.println("Blog post title: " + blogPost.getTitle());
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            throw e;
        }
    }
    
    private User createDefaultUser(String firebaseUid) {
        User user = new User();
        user.setDisplayName("Anonymous User");
        user.setEmail("anonymous@example.com");
        user.setFirebaseUid(firebaseUid);
        user.setActive(true);
        user.setRole(User.UserRole.USER);
        return userRepository.save(user);
    }
    
    public BlogPost updateBlogPost(Long id, BlogPost updatedPost, String firebaseUid) {
        BlogPost existingPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        // Skip authorization check for now (temporary)
        // if (!existingPost.getAuthor().getFirebaseUid().equals(firebaseUid)) {
        //     throw new RuntimeException("Unauthorized to update this blog post");
        // }
        
        existingPost.setTitle(updatedPost.getTitle());
        existingPost.setContent(updatedPost.getContent());
        existingPost.setTags(updatedPost.getTags());
        
        return blogPostRepository.save(existingPost);
    }
    
    public BlogPost publishBlogPost(Long id, String firebaseUid) {
        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        // Skip authorization check for now (temporary)
        // if (!blogPost.getAuthor().getFirebaseUid().equals(firebaseUid)) {
        //     throw new RuntimeException("Unauthorized to publish this blog post");
        // }
        
        // Generate public slug if not already set
        if (blogPost.getPublicSlug() == null || blogPost.getPublicSlug().isEmpty()) {
            String baseSlug = blogPost.getTitle() != null ? 
                blogPost.getTitle().toLowerCase().replaceAll("[^a-z0-9\\s-]", "").replaceAll("\\s+", "-") :
                "post-" + blogPost.getId();
            
            String publicSlug = baseSlug;
            int counter = 1;
            
            // Ensure slug is unique
            while (blogPostRepository.existsByPublicSlug(publicSlug)) {
                publicSlug = baseSlug + "-" + counter;
                counter++;
            }
            
            blogPost.setPublicSlug(publicSlug);
        }
        
        blogPost.setStatus(BlogPostStatus.PUBLISHED);
        return blogPostRepository.save(blogPost);
    }
    
    public BlogPost saveAsDraft(Long id, Long authorId) {
        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        // Check if user is the author
        if (!blogPost.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("Unauthorized to update this blog post");
        }
        
        blogPost.setStatus(BlogPostStatus.DRAFT);
        return blogPostRepository.save(blogPost);
    }
    
    public void deleteBlogPost(Long id, Long authorId) {
        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        // Check if user is the author
        if (!blogPost.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("Unauthorized to delete this blog post");
        }
        
        blogPostRepository.delete(blogPost);
    }
    
    public void deleteBlogPostByFirebaseUid(Long id, String firebaseUid) {
        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        // Check if user is the author using Firebase UID
        if (!blogPost.getAuthor().getFirebaseUid().equals(firebaseUid)) {
            throw new RuntimeException("Unauthorized to delete this blog post");
        }
        
        blogPostRepository.delete(blogPost);
    }
    
    public BlogPost getBlogPostById(Long id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
    }
    
    public BlogPost getPublicBlogPostBySlug(String slug) {
        return blogPostRepository.findByPublicSlugAndStatus(slug, BlogPostStatus.PUBLISHED)
                .orElseThrow(() -> new RuntimeException("Blog post not found or not published"));
    }
    
    public BlogPost getBlogPostBySlug(String slug, Long authorId) {
        BlogPost blogPost = blogPostRepository.findByPublicSlug(slug)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        // Check if user is the author (for private access)
        if (!blogPost.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("Unauthorized to access this blog post");
        }
        
        return blogPost;
    }
    
    public Page<BlogPost> getPublishedBlogPosts(Pageable pageable) {
        return blogPostRepository.findByStatus(BlogPostStatus.PUBLISHED, pageable);
    }
    
    public Page<BlogPost> getUserBlogPosts(Long authorId, Pageable pageable) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return blogPostRepository.findByAuthor(author, pageable);
    }
    
    public Page<BlogPost> getUserBlogPostsByFirebaseUid(String firebaseUid, Pageable pageable) {
        Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
        if (userOpt.isEmpty()) {
            // Return empty page instead of throwing exception - user will be created when they sync
            return Page.empty(pageable);
        }
        
        User author = userOpt.get();
        return blogPostRepository.findByAuthor(author, pageable);
    }
    
    public Page<BlogPost> getUserDraftBlogPosts(Long authorId, Pageable pageable) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return blogPostRepository.findByAuthorAndStatus(author, BlogPostStatus.DRAFT, pageable);
    }
    
    public Page<BlogPost> searchPublishedBlogPosts(String searchTerm, Pageable pageable) {
        return blogPostRepository.searchPublishedPosts(searchTerm, pageable);
    }
    
    public Page<BlogPost> getPublishedBlogPostsByTag(String tag, Pageable pageable) {
        return blogPostRepository.findPublishedByTag(tag, pageable);
    }
    
    public Page<BlogPost> getMostViewedPublishedBlogPosts(Pageable pageable) {
        return blogPostRepository.findMostViewedPublished(pageable);
    }
    
    public Page<BlogPost> getRecentPublishedBlogPosts(Pageable pageable) {
        return blogPostRepository.findRecentPublished(pageable);
    }
    
    public void incrementViewCount(String slug) {
        Optional<BlogPost> blogPost = blogPostRepository.findByPublicSlugAndStatus(slug, BlogPostStatus.PUBLISHED);
        if (blogPost.isPresent()) {
            blogPost.get().incrementViewCount();
            blogPostRepository.save(blogPost.get());
        }
    }
    
    public boolean isSlugAvailable(String slug) {
        return !blogPostRepository.existsByPublicSlug(slug);
    }
}
