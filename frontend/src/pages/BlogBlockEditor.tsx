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

const uploadImageToSupabase = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('guides').upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('guides').getPublicUrl(fileName);
  return data.publicUrl; // ✅ correct property
};

const EditorJsBlogPage: React.FC = () => {
  const ejInstance = useRef<EditorJS | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

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
      });
    }

    return () => {
      ejInstance.current?.destroy();
      ejInstance.current = null;
    };
  }, []);

  const handleSave = async () => {
    if (!ejInstance.current || !title.trim()) return;

    const outputData: OutputData = await ejInstance.current.save();

    alert('Blog post saved! (see console for data)');
    console.log('Saved blog post:', { title, tags, ...outputData });
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

        {/* Publish button */}
        <div className="flex justify-end mt-8">
          <button
            className="bg-green-200 text-green-800 px-6 py-2 rounded-full text-lg font-semibold"
            onClick={handleSave}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorJsBlogPage;
