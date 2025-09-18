package com.example.tripplanner.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "blog_posts")
public class BlogPost {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "blog_post_tags", joinColumns = @JoinColumn(name = "blog_post_id"))
    @Column(name = "tag")
    private List<String> tags;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BlogPostStatus status = BlogPostStatus.DRAFT;
    
    @Column(unique = true)
    private String publicSlug;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id")
    private User author;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @Column(name = "view_count")
    private Long viewCount = 0L;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (publicSlug == null) {
            publicSlug = generateSlug();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    private String generateSlug() {
        String baseSlug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .trim();
        return baseSlug + "-" + System.nanoTime() + "-" + (int)(Math.random() * 1000);
    }
    
    // Constructors
    public BlogPost() {}
    
    public BlogPost(String title, String content, List<String> tags, User author) {
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.author = author;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public List<String> getTags() {
        return tags;
    }
    
    public void setTags(List<String> tags) {
        this.tags = tags;
    }
    
    public BlogPostStatus getStatus() {
        return status;
    }
    
    public void setStatus(BlogPostStatus status) {
        this.status = status;
        if (status == BlogPostStatus.PUBLISHED && publishedAt == null) {
            this.publishedAt = LocalDateTime.now();
        }
    }
    
    public String getPublicSlug() {
        return publicSlug;
    }
    
    public void setPublicSlug(String publicSlug) {
        this.publicSlug = publicSlug;
    }
    
    public User getAuthor() {
        return author;
    }
    
    public void setAuthor(User author) {
        this.author = author;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }
    
    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }
    
    public Long getViewCount() {
        return viewCount;
    }
    
    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }
    
    public void incrementViewCount() {
        this.viewCount++;
    }
}