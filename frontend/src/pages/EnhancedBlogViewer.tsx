import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import CodeTool from '@editorjs/code';
import Embed from '@editorjs/embed';
import Marker from '@editorjs/marker';
import ImageTool from '@editorjs/image';
import { blogService, BlogPost } from '../services/blogService';

const EnhancedBlogViewer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [editorFailed, setEditorFailed] = useState(true); // Start with fallback mode

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

  // Initialize EditorJS for read-only rendering
  useEffect(() => {
    if (blogPost && blogPost.content && !editorReady && !editorFailed) {
      const initEditor = async () => {
        try {
          const contentData = JSON.parse(blogPost.content);
          
          const editor = new EditorJS({
            holder: 'editorjs-viewer',
            readOnly: true,
            tools: {
              paragraph: Paragraph as any,
              header: Header as any,
              image: ImageTool as any,
              list: List as any,
              quote: Quote as any,
              code: CodeTool as any,
              embed: Embed as any,
              marker: Marker as any,
            },
            data: contentData,
            onReady: () => {
              console.log('EditorJS viewer ready');
              setEditorReady(true);
            },
          });

          // EditorJS will automatically render the data when initialized
          // No need to call render() separately
          console.log('EditorJS initialized:', editor);
        } catch (error) {
          console.error('Error initializing editor viewer:', error);
          setEditorFailed(true);
          setEditorReady(true); // Set to true so we can show fallback content
        }
      };

      // Add a small delay to ensure DOM element is available
      setTimeout(initEditor, 100);
    }
  }, [blogPost, editorReady, editorFailed]);

  // Clear EditorJS container when switching to fallback mode
  useEffect(() => {
    if (editorFailed) {
      const container = document.getElementById('editorjs-viewer');
      if (container) {
        container.innerHTML = '';
      }
    }
  }, [editorFailed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading blog post...</div>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The blog post you are looking for does not exist.'}</p>
          <Link 
            to="/blog" 
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors"
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

  const formatReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {blogPost.title}
            </h1>
            
            {/* Meta information */}
            <div className="flex flex-wrap justify-center items-center gap-4 text-blue-100 text-sm">
              {blogPost.author && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    {blogPost.author.displayName?.charAt(0) || 'A'}
                  </div>
                  <span>By {blogPost.author.displayName || 'Anonymous'}</span>
                </div>
              )}
              {blogPost.publishedAt && (
                <span>• {formatDate(blogPost.publishedAt)}</span>
              )}
              {blogPost.viewCount !== undefined && (
                <span>• {blogPost.viewCount} views</span>
              )}
              <span>• {formatReadingTime(blogPost.content)}</span>
            </div>

            {/* Tags */}
            {blogPost.tags && blogPost.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {blogPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500 bg-opacity-30 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-8">
            {editorFailed ? (
              // Fallback rendering when EditorJS fails
              <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
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
                            const isChecklist = block.data.style === 'checklist';
                            return (
                              <ListTag key={index} className={`mb-4 ${isChecklist ? 'list-none' : ''}`}>
                                {block.data.items.map((item: any, itemIndex: number) => {
                                  const content = typeof item === 'string' ? item : item.content || '';
                                  const isChecked = typeof item === 'object' && item.meta?.checked;
                                  
                                  if (isChecklist) {
                                    return (
                                      <li key={itemIndex} className="flex items-center mb-2">
                                        <input 
                                          type="checkbox" 
                                          checked={isChecked} 
                                          readOnly 
                                          className="mr-2"
                                        />
                                        <span dangerouslySetInnerHTML={{ __html: content }} />
                                      </li>
                                    );
                                  }
                                  
                                  return (
                                    <li key={itemIndex}>
                                      <span dangerouslySetInnerHTML={{ __html: content }} />
                                    </li>
                                  );
                                })}
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
            ) : (
              // EditorJS container
              <div id="editorjs-viewer" className="prose prose-lg max-w-none">
                {!editorReady && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <div className="text-gray-600">Loading content...</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Social Sharing */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Share this post</h3>
          <div className="flex flex-wrap gap-4">
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blogPost.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </a>
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
            <a 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link 
            to="/blog"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
          
          <div className="text-sm text-gray-500">
            Last updated: {formatDate(blogPost.updatedAt || blogPost.createdAt || '')}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnhancedBlogViewer;
