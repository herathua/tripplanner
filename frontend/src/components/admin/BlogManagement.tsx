import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { BlogPost } from '../../services/blogService';
import { addNotification } from '../../store/slices/uiSlice';
import { useAppDispatch } from '../../store';

const BlogManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('ALL');

  useEffect(() => {
    loadBlogPosts();
  }, [currentPage, statusFilter]);

  const loadBlogPosts = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllBlogPosts(currentPage, 10);
      setBlogPosts(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load blog posts',
        duration: 3000,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (postId: number, newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    try {
      await adminService.updateBlogPostStatus(postId, newStatus);
      setBlogPosts(blogPosts.map(post => 
        post.id === postId ? { ...post, status: newStatus } : post
      ));
      dispatch(addNotification({
        type: 'success',
        message: 'Blog post status updated successfully',
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update blog post status',
        duration: 3000,
      }));
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteBlogPost(postId);
      setBlogPosts(blogPosts.filter(post => post.id !== postId));
      dispatch(addNotification({
        type: 'success',
        message: 'Blog post deleted successfully',
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to delete blog post',
        duration: 3000,
      }));
    }
  };

  const handleViewPost = async (postId: number) => {
    try {
      const post = await adminService.getBlogPostById(postId);
      setSelectedPost(post);
      setShowModal(true);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load blog post details',
        duration: 3000,
      }));
    }
  };

  const filteredPosts = statusFilter === 'ALL' 
    ? blogPosts 
    : blogPosts.filter(post => post.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Blog Post Management</h2>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="ALL">All Posts</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button
            onClick={loadBlogPosts}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Posts</div>
          <div className="text-2xl font-semibold text-gray-900">{totalElements}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Published</div>
          <div className="text-2xl font-semibold text-green-600">
            {blogPosts.filter(p => p.status === 'PUBLISHED').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Drafts</div>
          <div className="text-2xl font-semibold text-yellow-600">
            {blogPosts.filter(p => p.status === 'DRAFT').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Archived</div>
          <div className="text-2xl font-semibold text-gray-600">
            {blogPosts.filter(p => p.status === 'ARCHIVED').length}
          </div>
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {post.coverImage && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={post.coverImage.url}
                            alt={post.coverImage.alt}
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {truncateText(post.title, 50)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.author?.displayName || post.author?.email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status || 'DRAFT')}`}>
                        {post.status || 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.createdAt ? formatDate(post.createdAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.viewCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewPost(post.id!)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <select
                          value={post.status || 'DRAFT'}
                          onChange={(e) => handleStatusChange(post.id!, e.target.value as any)}
                          className="text-xs border-gray-300 rounded"
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="PUBLISHED">Published</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                        <button
                          onClick={() => handleDeletePost(post.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage + 1}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Blog Post Detail Modal */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedPost.title}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPost.status || 'DRAFT')}`}>
                    {selectedPost.status || 'DRAFT'}
                  </span>
                  <span className="text-sm text-gray-500">
                    By {selectedPost.author?.displayName || selectedPost.author?.email || 'Unknown'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedPost.viewCount || 0} views
                  </span>
                </div>
                
                {selectedPost.coverImage && (
                  <img
                    src={selectedPost.coverImage.url}
                    alt={selectedPost.coverImage.alt}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                </div>
                
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  <p>Created: {selectedPost.createdAt ? formatDate(selectedPost.createdAt) : 'N/A'}</p>
                  {selectedPost.publishedAt && (
                    <p>Published: {formatDate(selectedPost.publishedAt)}</p>
                  )}
                  <p>Updated: {selectedPost.updatedAt ? formatDate(selectedPost.updatedAt) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
