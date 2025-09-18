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
        System.out.println("=== CREATING BLOG POST ===");
        System.out.println("Title: " + blogPost.getTitle());
        System.out.println("Content: " + blogPost.getContent());
        System.out.println("Status: " + blogPost.getStatus());
        System.out.println("Firebase UID: " + firebaseUid);
        
        User author = userRepository.findByFirebaseUid(firebaseUid)
                .orElseGet(() -> createDefaultUser(firebaseUid));
        
        blogPost.setAuthor(author);
        blogPost.setStatus(BlogPostStatus.DRAFT);
        
        BlogPost savedPost = blogPostRepository.save(blogPost);
        System.out.println("=== BLOG POST SAVED ===");
        System.out.println("Saved ID: " + savedPost.getId());
        System.out.println("Saved Content: " + savedPost.getContent());
        
        return savedPost;
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
        System.out.println("=== UPDATING BLOG POST ===");
        System.out.println("ID: " + id);
        System.out.println("Title: " + updatedPost.getTitle());
        System.out.println("Content: " + updatedPost.getContent());
        System.out.println("Status: " + updatedPost.getStatus());
        System.out.println("Firebase UID: " + firebaseUid);
        
        BlogPost existingPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        existingPost.setTitle(updatedPost.getTitle());
        existingPost.setContent(updatedPost.getContent());
        existingPost.setTags(updatedPost.getTags());
        
        BlogPost savedPost = blogPostRepository.save(existingPost);
        System.out.println("=== BLOG POST UPDATED ===");
        System.out.println("Updated Content: " + savedPost.getContent());
        
        return savedPost;
    }
    
    public BlogPost publishBlogPost(Long id, String firebaseUid) {
        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
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
    
    public BlogPost saveAsDraftByFirebaseUid(Long id, String firebaseUid) {
        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        blogPost.setStatus(BlogPostStatus.DRAFT);
        return blogPostRepository.save(blogPost);
    }
    
    public BlogPost getBlogPostById(Long id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
    }
    
    public BlogPost getPublicBlogPostBySlug(String slug) {
        return blogPostRepository.findByPublicSlugAndStatus(slug, BlogPostStatus.PUBLISHED)
                .orElseThrow(() -> new RuntimeException("Blog post not found or not published"));
    }
    
    public Page<BlogPost> getPublishedBlogPosts(Pageable pageable) {
        return blogPostRepository.findByStatus(BlogPostStatus.PUBLISHED, pageable);
    }
    
    public Page<BlogPost> getUserBlogPostsByFirebaseUid(String firebaseUid, Pageable pageable) {
        Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
        if (userOpt.isEmpty()) {
            return Page.empty(pageable);
        }
        
        User author = userOpt.get();
        return blogPostRepository.findByAuthor(author, pageable);
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