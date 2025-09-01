import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { blogService, BlogPost } from '../services/blogService';
import EditorJS from '@editorjs/editorjs';

const BlogPostViewer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorInstance, setEditorInstance] = useState<EditorJS | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const post = await blogService.getPublicBlogPost(slug);
        setBlogPost(post);
      } catch (err) {
        setError('Blog post not found or not published');
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug]);

  useEffect(() => {
    if (blogPost && blogPost.content) {
      try {
        const content = JSON.parse(blogPost.content);
        
        const editor = new EditorJS({
          data: content,
          readOnly: true,
          holder: 'blog-content-viewer',
        });

        setEditorInstance(editor);

        return () => {
          if (editor && typeof editor.destroy === 'function') {
            editor.destroy();
          }
        };
      } catch (err) {
        console.error('Error parsing blog content:', err);
        setError('Error loading blog content');
      }
    }
  }, [blogPost]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600">{error || 'The blog post you are looking for does not exist.'}</p>
          <a 
            href="/" 
            className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            {blogPost.title}
          </h1>
          
          {/* Meta information */}
          <div className="flex items-center justify-between text-gray-600 mb-6">
            <div className="flex items-center space-x-4">
              {blogPost.author && (
                <span>By {blogPost.author.name || 'Anonymous'}</span>
              )}
              {blogPost.publishedAt && (
                <span>
                  {new Date(blogPost.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
              {blogPost.viewCount !== undefined && (
                <span>{blogPost.viewCount} views</span>
              )}
            </div>
          </div>

          {/* Tags */}
          {blogPost.tags && blogPost.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blogPost.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <main className="prose prose-lg max-w-none">
          <div id="blog-content-viewer" className="min-h-[400px]" />
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center text-gray-600">
            <div>
              <p>Share this post:</p>
              <div className="flex space-x-4 mt-2">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blogPost.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  Twitter
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Facebook
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-800"
                >
                  LinkedIn
                </a>
              </div>
            </div>
            
            <a 
              href="/blog"
              className="text-blue-500 hover:text-blue-600"
            >
              ← Back to Blog
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BlogPostViewer;
