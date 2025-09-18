  // Alternative: Local file upload (base64)
  const uploadImageLocally = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Enhanced image upload with fallback
  const uploadImageWithFallback = async (file: File): Promise<string> => {
    try {
      // Try Supabase first
      return await uploadImageToSupabase(file);
    } catch (error) {
      console.warn('Supabase upload failed, trying local upload:', error);
      try {
        // Fallback to local base64
        return await uploadImageLocally(file);
      } catch (localError) {
        console.error('Local upload also failed:', localError);
        return 'https://via.placeholder.com/400x300?text=Upload+Failed';
      }
    }
  };
