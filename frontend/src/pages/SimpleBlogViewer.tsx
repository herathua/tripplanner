import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService, BlogPost } from '../services/blogService';
import { BlogCoverImageService, BlogCoverImage } from '../utils/blogCoverImageService';

const SimpleBlogViewer: React.FC = () => {
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
        setError(null);
        console.log('Fetching blog post with slug:', slug);
        const post = await blogService.getPublicBlogPost(slug);
        console.log('Blog post fetched:', post);
        setBlogPost(post);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Blog post not found or not published');
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
          <p className="text-gray-600 mb-6">{error || 'The blog post you are looking for does not exist.'}</p>
          <Link 
            to="/blog" 
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image Header */}
      <header className="relative h-[50vh] min-h-[400px] overflow-hidden mb-8">
        {isCoverImageLoading ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <div className="text-gray-600">Loading cover image...</div>
            </div>
          </div>
        ) : (
          <>
            <img
              src={coverImage?.url || '/src/assets/logo.png'}
              alt={coverImage?.alt || blogPost.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
          </>
        )}
        
        {/* Header Content Overlay */}
        <div className="absolute inset-0 flex items-end justify-start">
          <div className="px-6 pb-6 text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight drop-shadow-lg">
              {blogPost.title}
            </h1>
            
            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-4 text-gray-200 text-sm">
              {blogPost.author && (
                <span>By {blogPost.author.displayName || 'Anonymous'}</span>
              )}
              {blogPost.publishedAt && (
                <span>• {formatDate(blogPost.publishedAt)}</span>
              )}
              {blogPost.viewCount !== undefined && (
                <span>• {blogPost.viewCount} views</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Image Credit */}
        {coverImage?.credit && (
          <div className="absolute bottom-4 right-4 text-xs text-white/70 bg-black/30 px-2 py-1 rounded">
            {coverImage.credit}
          </div>
        )}
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Content */}
        <main className="prose prose-lg max-w-none">
          <div className="text-gray-800 leading-relaxed">
            {(() => {
              try {
                // Try to parse as JSON (EditorJS format)
                const contentData = JSON.parse(blogPost.content);
                if (contentData.blocks && Array.isArray(contentData.blocks)) {
                  return contentData.blocks.map((block: any, index: number) => {
                    switch (block.type) {
                      case 'paragraph':
                        return (
                          <p key={index} className="mb-4">
                            {block.data.text}
                          </p>
                        );
                      case 'header':
                        const HeaderTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
                        return (
                          <HeaderTag key={index} className="font-bold mb-4">
                            {block.data.text}
                          </HeaderTag>
                        );
                      case 'image':
                        return (
                          <div key={index} className="my-6">
                            <img 
                              src={block.data.file.url} 
                              alt={block.data.caption || ''}
                              className="w-full rounded-lg shadow-md"
                            />
                            {block.data.caption && (
                              <p className="text-sm text-gray-600 mt-2 text-center">
                                {block.data.caption}
                              </p>
                            )}
                          </div>
                        );
                      case 'list':
                        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                        return (
                          <ListTag key={index} className="mb-4">
                            {block.data.items.map((item: string, itemIndex: number) => (
                              <li key={itemIndex}>{item}</li>
                            ))}
                          </ListTag>
                        );
                      case 'quote':
                        return (
                          <blockquote key={index} className="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-4">
                            {block.data.text}
                          </blockquote>
                        );
                      default:
                        return (
                          <div key={index} className="mb-4">
                            {block.data.text || JSON.stringify(block.data)}
                          </div>
                        );
                    }
                  });
                }
              } catch (e) {
                // If not JSON, display as plain text
                return (
                  <div className="whitespace-pre-wrap">
                    {blogPost.content}
                  </div>
                );
              }
            })()}
          </div>
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
            
            <Link 
              to="/blog"
              className="text-blue-500 hover:text-blue-600"
            >
              ← Back to Blog
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SimpleBlogViewer;
