import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { blogService, BlogPost } from '../services/blogService';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import ImageTool from '@editorjs/image';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import CodeTool from '@editorjs/code';
import Embed from '@editorjs/embed';
import Marker from '@editorjs/marker';
import { BlogCoverImageService, BlogCoverImage } from '../utils/blogCoverImageService';

const BlogPostViewer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<BlogCoverImage | null>(null);
  const [isCoverImageLoading, setIsCoverImageLoading] = useState(true);

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

  // Load cover image when blog post is available
  useEffect(() => {
    const loadCoverImage = async () => {
      if (!blogPost) return;
      
      try {
        setIsCoverImageLoading(true);
        
        // Use existing cover image if available, otherwise generate one
        if (blogPost.coverImage) {
          setCoverImage(blogPost.coverImage);
        } else {
          const generatedCoverImage = await BlogCoverImageService.generateCoverImage(
            blogPost.title,
            blogPost.tags || []
          );
          setCoverImage(generatedCoverImage);
        }
      } catch (error) {
        console.error('Error loading cover image:', error);
        // Set fallback image
        setCoverImage({
          url: '/src/assets/logo.png',
          alt: 'Travel blog cover',
          credit: 'Default image'
        });
      } finally {
        setIsCoverImageLoading(false);
      }
    };

    loadCoverImage();
  }, [blogPost]);

  useEffect(() => {
    if (blogPost && blogPost.content) {
      try {
        const content = JSON.parse(blogPost.content);
        
        const editor = new EditorJS({
          data: content,
          readOnly: true,
          holder: 'blog-content-viewer',
          tools: {
            header: Header as any,
            image: ImageTool as any,
            list: List as any,
            quote: Quote as any,
            code: CodeTool as any,
            embed: Embed as any,
            marker: Marker as any,
          },
        });

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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">Blog Post Not Found</h1>
          <p className="text-gray-600">{error || 'The blog post you are looking for does not exist.'}</p>
          <a 
            href="/" 
            className="inline-block px-6 py-2 mt-4 text-white bg-blue-500 rounded-full hover:bg-blue-600"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image Header */}
      <header className="relative h-[60vh] min-h-[450px] overflow-hidden mb-8">
        {isCoverImageLoading ? (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              <div className="text-gray-600">Loading cover image...</div>
            </div>
          </div>
        ) : (
          <>
            <img
              src={coverImage?.url || '/src/assets/logo.png'}
              alt={coverImage?.alt || blogPost.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
          </>
        )}
        
        {/* Header Content Overlay */}
        <div className="absolute inset-0 flex items-end justify-start">
          <div className="px-6 pb-8 text-white">
            <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>
              {blogPost.title}
            </h1>
            
            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-200">
              {blogPost.author && (
                <span>By {blogPost.author.displayName || 'Anonymous'}</span>
              )}
              {blogPost.publishedAt && (
                <span>
                  get
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

            {/* Tags */}
            {blogPost.tags && blogPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Image Credit */}
        {coverImage?.credit && (
          <div className="absolute px-2 py-1 text-xs rounded bottom-4 right-4 text-white/70 bg-black/30">
            {coverImage.credit}
          </div>
        )}
      </header>

      <div className="max-w-4xl px-4 py-8 mx-auto">

        {/* Content */}
        <main className="prose prose-lg max-w-none">
          <div id="blog-content-viewer" className="min-h-[400px]" />
        </main>

        {/* Footer */}
        <footer className="pt-8 mt-12 border-t border-gray-200">
          <div className="flex items-center justify-between text-gray-600">
            <div>
              <p>Share this post:</p>
              <div className="flex mt-2 space-x-4">
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
