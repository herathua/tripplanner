import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogService, BlogPost, BlogPostResponse } from '../services/blogService';

const SimpleBlogList: React.FC = () => {
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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Published Blog Posts</h1>
          <Link
            to="/blog/new"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create New Post
          </Link>
        </div>

        {blogPosts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">No blog posts found</h2>
            <p className="text-gray-500 mb-6">Be the first to create a blog post!</p>
            <Link
              to="/blog/new"
              className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 hover:text-blue-600">
                    <Link to={`/blog/${post.publicSlug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  <span className="text-sm text-gray-500">
                    {post.viewCount || 0} views
                  </span>
                </div>
                
                <div className="text-gray-600 mb-4">
                  <p className="line-clamp-3">
                    {post.content.length > 200 
                      ? post.content.substring(0, 200) + '...' 
                      : post.content
                    }
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    {post.author && (
                      <span>By {post.author.displayName || 'Anonymous'}</span>
                    )}
                    {post.publishedAt && (
                      <span className="ml-2">
                        • {formatDate(post.publishedAt)}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/blog/${post.publicSlug}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleBlogList;
