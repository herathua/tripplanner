import React, { useState } from 'react';
import { blogService, BlogPost } from '../services/blogService';
import { useAppSelector, useAppDispatch } from '../store';
import { addNotification } from '../store/slices/uiSlice';

const SimpleBlogEditor: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentBlogPost, setCurrentBlogPost] = useState<BlogPost | null>(null);

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const currentUserId = user?.uid || 'anonymous';

  const handleSave = async () => {
    if (!title.trim()) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Please enter a title for your blog post'
      }));
      return;
    }

    if (!content.trim()) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Please add some content to your blog post'
      }));
      return;
    }

    setIsSaving(true);
    try {
      const blogPostData: BlogPost = {
        title: title.trim(),
        content: content.trim(),
        tags: [],
        status: 'DRAFT'
      };

      let savedPost: BlogPost;
      
      if (currentBlogPost?.id) {
        savedPost = await blogService.updateBlogPost(currentBlogPost.id, blogPostData, currentUserId);
      } else {
        savedPost = await blogService.createBlogPost(blogPostData, currentUserId);
        setCurrentBlogPost(savedPost);
      }

      dispatch(addNotification({
        type: 'success',
        message: 'Blog post saved as draft successfully!'
      }));
      
      console.log('Blog post saved:', savedPost);
    } catch (error) {
      console.error('Error saving blog post:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to save blog post. Please try again.'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Please enter a title for your blog post'
      }));
      return;
    }

    if (!content.trim()) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Please add some content to your blog post'
      }));
      return;
    }

    setIsPublishing(true);
    try {
      const blogPostData: BlogPost = {
        title: title.trim(),
        content: content.trim(),
        tags: [],
        status: 'PUBLISHED'
      };

      let savedPost: BlogPost;
      
      if (currentBlogPost?.id) {
        savedPost = await blogService.updateBlogPost(currentBlogPost.id, blogPostData, currentUserId);
      } else {
        savedPost = await blogService.createBlogPost(blogPostData, currentUserId);
        setCurrentBlogPost(savedPost);
      }
      
      const publishResponse = await blogService.publishBlogPost(savedPost.id!, currentUserId);
      
      setCurrentBlogPost(publishResponse.blogPost);
      
      dispatch(addNotification({
        type: 'success',
        message: `Blog post published successfully! Public URL: ${publishResponse.publicUrl}`
      }));
      
      console.log('Blog post published:', publishResponse);
    } catch (error) {
      console.error('Error publishing blog post:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to publish blog post. Please try again.'
      }));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Create Blog Post</h1>
        
        {/* Title input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your blog post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Content textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={15}
            placeholder="Write your blog post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            className={`px-6 py-2 rounded-md text-lg font-semibold ${
              isSaving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          
          <button
            className={`px-6 py-2 rounded-md text-lg font-semibold ${
              isPublishing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>

        {/* Status */}
        {currentBlogPost && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h3 className="font-semibold text-gray-800">Post Status</h3>
            <p className="text-gray-600">
              Status: <span className="font-medium">{currentBlogPost.status}</span>
            </p>
            {currentBlogPost.status === 'PUBLISHED' && currentBlogPost.publicSlug && (
              <p className="text-gray-600">
                Public URL: <span className="font-medium">/blog/{currentBlogPost.publicSlug}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleBlogEditor;
