import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogService, BlogPost, BlogPostResponse } from '../services/blogService';
import StarRating from '../components/StarRating';

const BlogListPage: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response: BlogPostResponse = await blogService.getPublishedBlogPosts(currentPage, 10);
        setBlogPosts(response.content);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError('Failed to load blog posts');
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading blog posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Blog Posts</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Travel Blog</h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing travel stories, tips, and guides from our community
          </p>
          <Link
            to="/blog/new"
            className="inline-block bg-blue-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Write Your Story
          </Link>
        </header>

        {/* Blog Posts Grid */}
        {blogPosts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Blog Posts Yet</h2>
            <p className="text-gray-600 mb-6">Be the first to share your travel story!</p>
            <Link
              to="/blog/new"
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
            >
              Start Writing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    <Link 
                      to={`/blog/${post.publicSlug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    {post.author && (
                      <span className="mr-4">By {post.author.displayName || 'Anonymous'}</span>
                    )}
                    {post.publishedAt && (
                      <span>{formatDate(post.publishedAt)}</span>
                    )}
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-gray-500 text-xs">+{post.tags.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <Link
                      to={`/blog/${post.publicSlug}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Read More →
                    </Link>
                    {post.viewCount !== undefined && (
                      <span className="text-sm text-gray-500">{post.viewCount} views</span>
                    )}
                  </div>
                  
                  {/* Rating display */}
                  <div className="flex items-center justify-between">
                    <StarRating
                      blogPostId={post.id!}
                      averageRating={post.averageRating}
                      ratingCount={post.ratingCount}
                      showStats={true}
                      interactive={false}
                      size="sm"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className={`px-4 py-2 rounded ${
                currentPage === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Previous
            </button>
            
            <span className="text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages - 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogListPage;
