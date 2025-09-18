import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import { blogService, BlogPost, BlogPostResponse } from '../../services/blogService';

interface UserBlogsProps {
  user: User;
}

const UserBlogs: React.FC<UserBlogsProps> = ({ user }) => {
  const dispatch = useAppDispatch();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const blogsPerPage = 6;

  useEffect(() => {
    loadUserBlogs();
  }, [user, currentPage]);

  const loadUserBlogs = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const response: BlogPostResponse = await blogService.getUserBlogPosts(user.uid, currentPage, blogsPerPage);
      setBlogs(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (error: any) {
      console.error('Error loading user blogs:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load your blog posts',
        duration: 3000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId: number) => {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      await blogService.deleteBlogPost(blogId, user.uid);
      dispatch(addNotification({
        type: 'success',
        message: 'Blog post deleted successfully',
        duration: 3000,
      }));
      loadUserBlogs(); // Reload blogs
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to delete blog post',
        duration: 3000,
      }));
    }
  };

  const handlePublishBlog = async (blogId: number) => {
    try {
      await blogService.publishBlogPost(blogId, user.uid);
      dispatch(addNotification({
        type: 'success',
        message: 'Blog post published successfully',
        duration: 3000,
      }));
      loadUserBlogs(); // Reload blogs
    } catch (error: any) {
      console.error('Error publishing blog:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to publish blog post',
        duration: 3000,
      }));
    }
  };

  const handleSaveAsDraft = async (blogId: number) => {
    try {
      await blogService.saveAsDraft(blogId, user.uid);
      dispatch(addNotification({
        type: 'success',
        message: 'Blog post saved as draft',
        duration: 3000,
      }));
      loadUserBlogs(); // Reload blogs
    } catch (error: any) {
      console.error('Error saving as draft:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to save as draft',
        duration: 3000,
      }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Blog Posts</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your published and draft blog posts
          </p>
        </div>
        <Link
          to="/blog/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Create New Blog Post
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No blog posts yet</h3>
          <p className="mt-2 text-gray-500">
            Start sharing your thoughts and experiences by creating your first blog post.
          </p>
          <div className="mt-6">
            <Link
              to="/blog/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Create Your First Blog Post
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {blogs.length} of {totalElements} blog posts
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {blog.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(blog.status || 'draft')}`}>
                      {blog.status || 'draft'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {blog.createdAt && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Created {formatDate(blog.createdAt)}
                      </div>
                    )}
                    
                    {blog.publishedAt && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Published {formatDate(blog.publishedAt)}
                      </div>
                    )}
                    
                    {blog.viewCount && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {blog.viewCount} views
                      </div>
                    )}
                  </div>
                  
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{blog.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Link
                        to={`/blog/${blog.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        View
                      </Link>
                      <Link
                        to={`/blog/${blog.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Edit
                      </Link>
                    </div>
                    
                    <div className="flex space-x-2">
                      {blog.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublishBlog(blog.id!)}
                          className="inline-flex items-center px-3 py-1.5 border border-green-300 rounded-md text-xs font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Publish
                        </button>
                      )}
                      {blog.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleSaveAsDraft(blog.id!)}
                          className="inline-flex items-center px-3 py-1.5 border border-yellow-300 rounded-md text-xs font-medium text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          Draft
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBlog(blog.id!)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === i
                        ? 'text-white bg-red-600 border border-red-600'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserBlogs;
