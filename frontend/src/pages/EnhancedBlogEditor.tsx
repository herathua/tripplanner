import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import CodeTool from '@editorjs/code';
import Embed from '@editorjs/embed';
import Marker from '@editorjs/marker';
import ImageTool from '@editorjs/image';
import { blogService, BlogPost } from '../services/blogService';
import { useAppSelector, useAppDispatch } from '../store';
import { addNotification } from '../store/slices/uiSlice';
import { supabase } from '../config/supabase';

const EnhancedBlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ejInstance = useRef<EditorJS | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentBlogPost, setCurrentBlogPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const currentUserId = user?.uid || 'anonymous';

  // Image upload function
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      console.log('Attempting to upload image to Supabase...');
      console.log('File:', file.name, 'Size:', file.size);
      
      if (!supabase) {
        console.warn('Supabase not configured, using placeholder');
        return 'https://via.placeholder.com/400x300?text=Supabase+Not+Configured';
      }

      // Test Supabase connection first
      const { data: testData, error: testError } = await supabase.storage.listBuckets();
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw new Error(`Supabase connection failed: ${testError.message}`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      console.log('Uploading to path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('guides')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('guides')
        .getPublicUrl(filePath);

      console.log('Upload successful, URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      
      // Return a more informative placeholder
      const errorMessage = error instanceof Error ? error.message : 'Upload Failed';
      return `https://via.placeholder.com/400x300?text=${encodeURIComponent(errorMessage)}`;
    }
  };

  // Load existing blog post for editing
  useEffect(() => {
    const loadBlogPost = async () => {
      if (id && id !== 'new') {
        try {
          const post = await blogService.getBlogPostById(parseInt(id));
          setCurrentBlogPost(post);
          setTitle(post.title);
          setTags(post.tags || []);
          
          // Load content into editor
          if (post.content && ejInstance.current) {
            try {
              const contentData = JSON.parse(post.content);
              await ejInstance.current.render(contentData);
            } catch (e) {
              console.error('Error parsing content:', e);
            }
          }
        } catch (error) {
          console.error('Error loading blog post:', error);
          dispatch(addNotification({
            type: 'error',
            message: 'Failed to load blog post for editing'
          }));
        }
      }
    };

    if (isEditorReady) {
      loadBlogPost();
    }
  }, [id, isEditorReady, dispatch]);

  // Initialize EditorJS
  useEffect(() => {
    if (!ejInstance.current) {
      ejInstance.current = new EditorJS({
        holder: 'editorjs',
        placeholder: 'Start writing your blog post...',
        tools: {
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
            config: {
              placeholder: 'Type your text here...'
            }
          } as any,
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              levels: [1, 2, 3, 4],
              defaultLevel: 2,
            },
          } as any,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  try {
                    const url = await uploadImageToSupabase(file);
                    return {
                      success: 1,
                      file: { url },
                    };
                  } catch (e) {
                    console.error('Image upload failed:', e);
                    return { success: 0 };
                  }
                },
              },
            },
          } as any,
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered'
            }
          } as any,
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote\'s author',
            }
          } as any,
          code: {
            class: CodeTool,
            inlineToolbar: true,
          } as any,
          embed: {
            class: Embed,
            inlineToolbar: true,
            config: {
              services: {
                youtube: true,
                twitter: true,
                instagram: true,
              }
            }
          } as any,
          marker: {
            class: Marker,
            inlineToolbar: true,
          } as any,
        },
        onReady: () => {
          console.log('EditorJS is ready to work!');
          setIsEditorReady(true);
        },
        onChange: () => {
          console.log('Editor content changed');
        },
      });
    }

    return () => {
      if (ejInstance.current && ejInstance.current.destroy) {
        ejInstance.current.destroy();
        ejInstance.current = null;
      }
    };
  }, []);

  const handleSave = async () => {
    if (!isEditorReady || !ejInstance.current) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Editor is not ready yet. Please wait a moment.'
      }));
      return;
    }

    if (!title.trim()) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Please enter a title for your blog post'
      }));
      return;
    }

    setIsSaving(true);
    try {
      console.log('Saving blog post...');
      const outputData: OutputData = await ejInstance.current.save();
      console.log('EditorJS output data:', outputData);

      // Filter out empty blocks
      const validBlocks = outputData.blocks.filter(block => {
        if (block.type === 'paragraph') {
          return block.data && block.data.text && block.data.text.trim().length > 0;
        }
        return true; // Keep all other block types
      });

      if (validBlocks.length === 0) {
        dispatch(addNotification({
          type: 'warning',
          message: 'Please add some content to your blog post before saving. Try adding a header, list, or other content block.'
        }));
        setIsSaving(false);
        return;
      }

      // Create a new output data with only valid blocks
      const validOutputData = {
        ...outputData,
        blocks: validBlocks
      };

      const blogPostData: BlogPost = {
        title: title.trim(),
        content: JSON.stringify(validOutputData),
        tags: tags,
        status: 'DRAFT'
      };

      console.log('Blog post data to save:', blogPostData);

      let savedPost: BlogPost;
      
      if (currentBlogPost?.id) {
        savedPost = await blogService.updateBlogPost(currentBlogPost.id, blogPostData, currentUserId);
      } else {
        savedPost = await blogService.createBlogPost(blogPostData, currentUserId);
        setCurrentBlogPost(savedPost);
        // Update URL to include the ID
        navigate(`/blog/${savedPost.id}/edit`, { replace: true });
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
    if (!isEditorReady || !ejInstance.current) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Editor is not ready yet. Please wait a moment.'
      }));
      return;
    }

    if (!title.trim()) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Please enter a title for your blog post'
      }));
      return;
    }

    setIsPublishing(true);
    try {
      console.log('Publishing blog post...');
      const outputData: OutputData = await ejInstance.current.save();
      console.log('EditorJS output data for publish:', outputData);

      // Filter out empty blocks
      const validBlocks = outputData.blocks.filter(block => {
        if (block.type === 'paragraph') {
          return block.data && block.data.text && block.data.text.trim().length > 0;
        }
        return true; // Keep all other block types
      });

      if (validBlocks.length === 0) {
        dispatch(addNotification({
          type: 'warning',
          message: 'Please add some content to your blog post before publishing. Try adding a header, list, or other content block.'
        }));
        setIsPublishing(false);
        return;
      }

      // Create a new output data with only valid blocks
      const validOutputData = {
        ...outputData,
        blocks: validBlocks
      };

      const blogPostData: BlogPost = {
        title: title.trim(),
        content: JSON.stringify(validOutputData),
        tags: tags,
        status: 'PUBLISHED'
      };

      let savedPost: BlogPost;
      
      if (currentBlogPost?.id) {
        savedPost = await blogService.updateBlogPost(currentBlogPost.id, blogPostData, currentUserId);
      } else {
        savedPost = await blogService.createBlogPost(blogPostData, currentUserId);
        setCurrentBlogPost(savedPost);
        // Update URL to include the ID
        navigate(`/blog/${savedPost.id}/edit`, { replace: true });
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

  const handlePreview = async () => {
    if (!isEditorReady || !ejInstance.current) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Editor is not ready yet. Please wait a moment.'
      }));
      return;
    }

    if (!title.trim()) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Please enter a title for your blog post'
      }));
      return;
    }

    try {
      const outputData: OutputData = await ejInstance.current.save();
      const validBlocks = outputData.blocks.filter(block => {
        if (block.type === 'paragraph') {
          return block.data && block.data.text && block.data.text.trim().length > 0;
        }
        return true;
      });

      if (validBlocks.length === 0) {
        dispatch(addNotification({
          type: 'warning',
          message: 'Please add some content to preview your blog post.'
        }));
        return;
      }

      dispatch(addNotification({
        type: 'info',
        message: 'Preview functionality coming soon! Your content looks good.'
      }));
    } catch (error) {
      console.error('Error generating preview:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to generate preview. Please try again.'
      }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {currentBlogPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/blog')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Blog
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-4">
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

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {!isEditorReady && (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">Initializing editor...</div>
            </div>
          )}
          <div id="editorjs" className="min-h-[400px]"></div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex gap-4 justify-between">
            <div className="flex gap-4">
              <button
                className={`px-6 py-2 rounded-md text-lg font-semibold ${
                  isSaving || !isEditorReady
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                onClick={handleSave}
                disabled={isSaving || !isEditorReady}
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              
              <button
                className={`px-6 py-2 rounded-md text-lg font-semibold ${
                  isPublishing || !isEditorReady
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
                onClick={handlePublish}
                disabled={isPublishing || !isEditorReady}
              >
                {isPublishing ? 'Publishing...' : 'Publish'}
              </button>

              {/* <button
                className={`px-6 py-2 rounded-md text-lg font-semibold ${
                  !isEditorReady
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
                onClick={handlePreview}
                disabled={!isEditorReady}
              >
                Preview
              </button> */}
            </div>

            {/* Status */}
            {currentBlogPost && (
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Status: <span className="font-medium text-blue-600">{currentBlogPost.status}</span>
                </div>
                {currentBlogPost.status === 'PUBLISHED' && currentBlogPost.publicSlug && (
                  <div className="text-sm text-gray-600">
                    <a 
                      href={`/blog/${currentBlogPost.publicSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700"
                    >
                      View Published Post →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Tips for great blog posts:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use headers to structure your content</li>
            <li>• Add images to make your post more engaging</li>
            <li>• Use lists and quotes to break up text</li>
            <li>• Add relevant tags to help readers find your post</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBlogEditor;
