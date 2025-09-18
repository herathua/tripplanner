package com.example.tripplanner.controller;

import com.example.tripplanner.model.BlogPost;
import com.example.tripplanner.model.BlogPostStatus;
import com.example.tripplanner.service.BlogPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/blog-posts")
@CrossOrigin(origins = "*")
public class BlogPostController {
    
    @Autowired
    private BlogPostService blogPostService;
    
    // Create new blog post
    @PostMapping
    public ResponseEntity<?> createBlogPost(@RequestBody BlogPost blogPost, 
                                          @RequestParam String firebaseUid) {
        try {
            BlogPost createdPost = blogPostService.createBlogPost(blogPost, firebaseUid);
            return ResponseEntity.ok(createdPost);
        } catch (Exception e) {
            System.err.println("Error creating blog post: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Update blog post
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBlogPost(@PathVariable Long id,
                                          @RequestBody BlogPost blogPost,
                                          @RequestParam String firebaseUid) {
        try {
            BlogPost updatedPost = blogPostService.updateBlogPost(id, blogPost, firebaseUid);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Publish blog post
    @PutMapping("/{id}/publish")
    public ResponseEntity<?> publishBlogPost(@PathVariable Long id, 
                                           @RequestParam String firebaseUid) {
        try {
            BlogPost publishedPost = blogPostService.publishBlogPost(id, firebaseUid);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Blog post published successfully");
            response.put("blogPost", publishedPost);
            response.put("publicUrl", "/blog/" + publishedPost.getPublicSlug());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Save as draft
    @PutMapping("/{id}/draft")
    public ResponseEntity<?> saveAsDraft(@PathVariable Long id, 
                                       @RequestParam String firebaseUid) {
        try {
            BlogPost draftPost = blogPostService.saveAsDraftByFirebaseUid(id, firebaseUid);
            return ResponseEntity.ok(draftPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get blog post by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBlogPostById(@PathVariable Long id) {
        try {
            BlogPost blogPost = blogPostService.getBlogPostById(id);
            return ResponseEntity.ok(blogPost);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Get user's blog posts
    @GetMapping("/user/{firebaseUid}")
    public ResponseEntity<?> getUserBlogPosts(@PathVariable String firebaseUid,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<BlogPost> blogPosts = blogPostService.getUserBlogPostsByFirebaseUid(firebaseUid, pageable);
            return ResponseEntity.ok(blogPosts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

@RestController
@RequestMapping("/public/blog-posts")
@CrossOrigin(origins = "*")
class PublicBlogPostController {
    
    @Autowired
    private BlogPostService blogPostService;
    
    // Get public blog post by slug
    @GetMapping("/{slug}")
    public ResponseEntity<?> getPublicBlogPost(@PathVariable String slug) {
        try {
            BlogPost blogPost = blogPostService.getPublicBlogPostBySlug(slug);
            // Increment view count
            blogPostService.incrementViewCount(slug);
            return ResponseEntity.ok(blogPost);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Get all published blog posts
    @GetMapping
    public ResponseEntity<?> getPublishedBlogPosts(@RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<BlogPost> blogPosts = blogPostService.getPublishedBlogPosts(pageable);
            return ResponseEntity.ok(blogPosts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}