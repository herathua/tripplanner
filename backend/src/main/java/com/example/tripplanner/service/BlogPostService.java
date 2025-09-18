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
        try {
            System.out.println("Creating default user for Firebase UID: " + firebaseUid);
            User user = new User();
            user.setDisplayName("Anonymous User");
            user.setEmail("anonymous@example.com");
            user.setFirebaseUid(firebaseUid);
            user.setActive(true);
            user.setRole(User.UserRole.USER);
            User savedUser = userRepository.save(user);
            System.out.println("Created user with ID: " + savedUser.getId());
            return savedUser;
        } catch (Exception e) {
            System.err.println("Error creating default user: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create user", e);
        }
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
        try {
            System.out.println("=== GETTING PUBLISHED BLOG POSTS ===");
            System.out.println("Page: " + pageable.getPageNumber() + ", Size: " + pageable.getPageSize());
            Page<BlogPost> result = blogPostRepository.findByStatus(BlogPostStatus.PUBLISHED, pageable);
            System.out.println("Found " + result.getContent().size() + " published blog posts");
            System.out.println("Total elements: " + result.getTotalElements());
            return result;
        } catch (Exception e) {
            System.err.println("Error getting published blog posts: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get published blog posts: " + e.getMessage(), e);
        }
    }
    
    public Page<BlogPost> searchPublishedPosts(String query, Pageable pageable) {
        return blogPostRepository.searchPublishedPosts(query, pageable);
    }
    
    public Page<BlogPost> getPublishedBlogPostsByTag(String tag, Pageable pageable) {
        return blogPostRepository.findPublishedByTag(tag, pageable);
    }
    
    public Page<BlogPost> getUserBlogPostsByFirebaseUid(String firebaseUid, Pageable pageable) {
        try {
            System.out.println("=== GETTING USER BLOG POSTS ===");
            System.out.println("Firebase UID: " + firebaseUid);
            System.out.println("Page: " + pageable.getPageNumber() + ", Size: " + pageable.getPageSize());
            
            Optional<User> userOpt = userRepository.findByFirebaseUid(firebaseUid);
            if (userOpt.isEmpty()) {
                System.out.println("User not found, creating default user");
                User defaultUser = createDefaultUser(firebaseUid);
                Page<BlogPost> result = blogPostRepository.findByAuthor(defaultUser, pageable);
                System.out.println("Found " + result.getContent().size() + " blog posts for new user");
                return result;
            }
            
            User author = userOpt.get();
            System.out.println("Found user: " + author.getDisplayName() + " (ID: " + author.getId() + ")");
            Page<BlogPost> result = blogPostRepository.findByAuthor(author, pageable);
            System.out.println("Found " + result.getContent().size() + " blog posts");
            System.out.println("Total elements: " + result.getTotalElements());
            return result;
        } catch (Exception e) {
            System.err.println("Error getting user blog posts: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get user blog posts: " + e.getMessage(), e);
        }
    }
    
    public void incrementViewCount(String slug) {
        Optional<BlogPost> blogPost = blogPostRepository.findByPublicSlugAndStatus(slug, BlogPostStatus.PUBLISHED);
        if (blogPost.isPresent()) {
            blogPost.get().incrementViewCount();
            blogPostRepository.save(blogPost.get());
        }
    }
    
    public void deleteBlogPost(Long id, String firebaseUid) {
        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog post not found"));
        
        // Optional: Add authorization check here
        // User user = userRepository.findByFirebaseUid(firebaseUid)
        //     .orElseThrow(() -> new RuntimeException("User not found"));
        // if (!blogPost.getAuthor().equals(user)) {
        //     throw new RuntimeException("Not authorized to delete this blog post");
        // }
        
        blogPostRepository.delete(blogPost);
    }
}