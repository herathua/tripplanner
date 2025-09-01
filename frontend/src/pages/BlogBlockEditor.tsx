import React, { useEffect, useRef, useState } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import ImageTool from '@editorjs/image';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import CodeTool from '@editorjs/code';
import Embed from '@editorjs/embed';
import Marker from '@editorjs/marker';
import { supabase } from '../config/supabase';
import { blogService, BlogPost } from '../services/blogService';
import { useAppSelector } from '../store';

const uploadImageToSupabase = async (file: File) => {
  try {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('guides')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return 'https://via.placeholder.com/400x300?text=Upload+Failed';
    }

    const { data: urlData } = supabase.storage
      .from('guides')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    return 'https://via.placeholder.com/400x300?text=Error';
  }
};

const EditorJsBlogPage: React.FC = () => {
  const ejInstance = useRef<EditorJS | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentBlogPost, setCurrentBlogPost] = useState<BlogPost | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Get user from auth state
  const user = useAppSelector((state) => state.auth.user);
  const currentUserId = user?.uid || 'anonymous'; // Use Firebase UID or fallback

  useEffect(() => {
    if (!editorRef.current) return;

    if (!ejInstance.current) {
      ejInstance.current = new EditorJS({
        holder: editorRef.current,
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              levels: [1, 2, 3],
              defaultLevel: 2,
            },
          },
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
          },
          list: List,
          quote: Quote,
          code: CodeTool,
          embed: Embed,
          marker: Marker,
        },
        placeholder: 'Start writing your story...',
        inlineToolbar: ['bold', 'italic', 'marker'],
        onReady: () => {
          console.log('Editor is ready to work!');
        },
      });
    }

    return () => {
      if (ejInstance.current && typeof ejInstance.current.destroy === 'function') {
        ejInstance.current.destroy();
      }
      ejInstance.current = null;
    };
  }, []);

  const handleSave = async () => {
    if (!ejInstance.current || !title.trim()) {
      alert('Please enter a title for your blog post');
      return;
    }

    setIsSaving(true);
    try {
      const outputData: OutputData = await ejInstance.current.save();
      
      const blogPostData: BlogPost = {
        title: title.trim(),
        content: JSON.stringify(outputData),
        tags: tags,
      };

      let savedPost: BlogPost;
      
      if (currentBlogPost?.id) {
        // Update existing post
        savedPost = await blogService.updateBlogPost(currentBlogPost.id, blogPostData, currentUserId);
      } else {
        // Create new post
        savedPost = await blogService.createBlogPost(blogPostData, currentUserId);
        setCurrentBlogPost(savedPost);
      }

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      console.log('Blog post saved:', savedPost);
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!currentBlogPost?.id) {
      alert('Please save your blog post first before publishing');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title for your blog post');
      return;
    }

    setIsPublishing(true);
    try {
      // First save any changes
      await handleSave();
      
      // Then publish
      const publishResponse = await blogService.publishBlogPost(currentBlogPost.id, currentUserId);
      
      setPublicUrl(publishResponse.publicUrl);
      setCurrentBlogPost(publishResponse.blogPost);
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      console.log('Blog post published:', publishResponse);
      alert(`Blog post published successfully! Public URL: ${publishResponse.publicUrl}`);
    } catch (error) {
      console.error('Error publishing blog post:', error);
      alert('Failed to publish blog post. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8">
      <div className="w-full max-w-3xl">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {publicUrl ? 'Blog post published successfully!' : 'Blog post saved successfully!'}
            {publicUrl && (
              <div className="mt-2">
                <strong>Public URL:</strong> 
                <a 
                  href={publicUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline"
                >
                  {window.location.origin}{publicUrl}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Title input */}
        <input
          className="w-full text-6xl font-extrabold mb-2 border-none outline-none bg-transparent text-gray-800 placeholder-gray-400"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ fontFamily: 'Georgia, serif', lineHeight: 1.1 }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {tag}
              <button
                onClick={() => removeTag(idx)}
                className="ml-2 text-blue-500 hover:text-red-500"
              >
                &times;
              </button>
            </span>
          ))}
          <input
            className="border-none outline-none bg-transparent text-base text-gray-600 min-w-[80px]"
            placeholder="Add tag"
            value={tagInput}
            onChange={handleTagInput}
            onKeyDown={handleTagKeyDown}
          />
        </div>

        {/* Editor */}
        <div ref={editorRef} className="bg-white border rounded min-h-[300px] p-4" />

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex gap-4">
            <button
              className={`px-6 py-2 rounded-full text-lg font-semibold ${
                isSaving 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
              }`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            
            <button
              className={`px-6 py-2 rounded-full text-lg font-semibold ${
                isPublishing || !currentBlogPost?.id
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-200 text-green-800 hover:bg-green-300'
              }`}
              onClick={handlePublish}
              disabled={isPublishing || !currentBlogPost?.id}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>

          {currentBlogPost?.status === 'PUBLISHED' && publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              View Published Post →
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorJsBlogPage;
