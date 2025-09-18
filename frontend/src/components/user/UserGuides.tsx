import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import { blogService, BlogPost, BlogPostResponse } from '../../services/blogService';

interface UserGuidesProps {
  user: User;
}

const UserGuides: React.FC<UserGuidesProps> = ({ user }) => {
  const dispatch = useAppDispatch();
  const [guides, setGuides] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const guidesPerPage = 6;

  useEffect(() => {
    loadUserGuides();
  }, [user, currentPage]);

  const loadUserGuides = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const response: BlogPostResponse = await blogService.getUserBlogPosts(user.uid, currentPage, guidesPerPage);
      setGuides(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (error: any) {
      console.error('Error loading user guides:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load your travel guides',
        duration: 3000,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGuide = async (guideId: number) => {
    if (!window.confirm('Are you sure you want to delete this travel guide? This action cannot be undone.')) {
      return;
    }

    try {
      await blogService.deleteBlogPost(guideId, user.uid);
      dispatch(addNotification({
        type: 'success',
        message: 'Travel guide deleted successfully',
        duration: 3000,
      }));
      loadUserGuides(); // Reload guides
    } catch (error: any) {
      console.error('Error deleting guide:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to delete travel guide',
        duration: 3000,
      }));
    }
  };

  const handlePublishGuide = async (guideId: number) => {
    try {
      await blogService.publishBlogPost(guideId, user.uid);
      dispatch(addNotification({
        type: 'success',
        message: 'Travel guide published successfully',
        duration: 3000,
      }));
      loadUserGuides(); // Reload guides
    } catch (error: any) {
      console.error('Error publishing guide:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to publish travel guide',
        duration: 3000,
      }));
    }
  };

  const handleSaveAsDraft = async (guideId: number) => {
    try {
      await blogService.saveAsDraft(guideId, user.uid);
      dispatch(addNotification({
        type: 'success',
        message: 'Travel guide saved as draft',
        duration: 3000,
      }));
      loadUserGuides(); // Reload guides
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
          <h2 className="text-2xl font-bold text-gray-900">My Travel Guides</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your published and draft travel guides
          </p>
        </div>
        <Link
          to="/blog/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Create New Guide
        </Link>
      </div>

      {guides.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No travel guides yet</h3>
          <p className="mt-2 text-gray-500">
            Share your travel experiences by creating your first travel guide.
          </p>
          <div className="mt-6">
            <Link
              to="/blog/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Create Your First Guide
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {guides.length} of {totalElements} guides
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <div key={guide.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {guide.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(guide.status || 'draft')}`}>
                      {guide.status || 'draft'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {guide.createdAt && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Created {formatDate(guide.createdAt)}
                      </div>
                    )}
                    
                    {guide.publishedAt && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Published {formatDate(guide.publishedAt)}
                      </div>
                    )}
                    
                    {guide.viewCount && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {guide.viewCount} views
                      </div>
                    )}
                  </div>
                  
                  {guide.tags && guide.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {guide.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {guide.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{guide.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Link
                        to={`/blog/${guide.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        View
                      </Link>
                      <Link
                        to={`/blog/${guide.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Edit
                      </Link>
                    </div>
                    
                    <div className="flex space-x-2">
                      {guide.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublishGuide(guide.id!)}
                          className="inline-flex items-center px-3 py-1.5 border border-green-300 rounded-md text-xs font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Publish
                        </button>
                      )}
                      {guide.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleSaveAsDraft(guide.id!)}
                          className="inline-flex items-center px-3 py-1.5 border border-yellow-300 rounded-md text-xs font-medium text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          Draft
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteGuide(guide.id!)}
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

export default UserGuides;
