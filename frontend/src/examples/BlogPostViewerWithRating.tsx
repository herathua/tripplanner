// Example integration of InteractiveRating component in a blog post viewer
// This shows how to add the rating component to your blog post pages

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { blogService, BlogPost } from '../services/blogService';
import InteractiveRating from '../components/InteractiveRating';
import StarRating from '../components/StarRating';

const BlogPostViewerWithRating: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Your user state

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const post = await blogService.getPublicBlogPost(slug);
        setBlogPost(post);
      } catch (err) {
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug]);

  const handleRatingSubmitted = (rating: number) => {
    console.log('User rated the blog post:', rating);
    // Optionally refresh the blog post data to get updated ratings
    // fetchBlogPost();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!blogPost) {
    return <div>Blog post not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Blog post header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{blogPost.title}</h1>
        
        {/* Author and metadata */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              By {blogPost.author?.displayName || 'Anonymous'}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {blogPost.createdAt ? new Date(blogPost.createdAt).toLocaleDateString() : 'Recently'}
            </span>
          </div>
          
          {/* Display rating with statistics */}
          <StarRating
            blogPostId={blogPost.id!}
            averageRating={blogPost.averageRating}
            ratingCount={blogPost.ratingCount}
            showStats={true}
            interactive={false}
            size="md"
          />
        </div>
      </div>

      {/* Blog post content */}
      <div className="prose max-w-none mb-8">
        {/* Your blog post content rendering here */}
        <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
      </div>

      {/* Interactive rating section */}
      <div className="border-t pt-8">
        <h3 className="text-xl font-semibold mb-4">Rate this Guide</h3>
        <InteractiveRating
          blogPostId={blogPost.id!}
          firebaseUid={user?.uid}
          onRatingSubmitted={handleRatingSubmitted}
        />
      </div>
    </div>
  );
};

export default BlogPostViewerWithRating;
