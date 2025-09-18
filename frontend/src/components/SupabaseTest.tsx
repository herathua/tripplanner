import React, { useState, useEffect } from 'react';
import { supabase, checkSupabaseConnection } from '../config/supabase';

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [buckets, setBuckets] = useState<any[]>([]);
  const [testFile, setTestFile] = useState<File | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus(isConnected ? '✅ Connected' : '❌ Connection Failed');
        
        if (isConnected) {
          // List available buckets
          const { data, error } = await supabase.storage.listBuckets();
          if (error) {
            console.error('Error listing buckets:', error);
            setBuckets([]);
          } else {
            setBuckets(data || []);
          }
        }
      } catch (error) {
        console.error('Connection test error:', error);
        setConnectionStatus('❌ Connection Error');
      }
    };

    testConnection();
  }, []);

  const handleFileUpload = async () => {
    if (!testFile) return;

    try {
      const fileName = `test-${Date.now()}.${testFile.name.split('.').pop()}`;
      const { error } = await supabase.storage
        .from('guides')
        .upload(`test-images/${fileName}`, testFile);

      if (error) {
        console.error('Upload error:', error);
        alert(`Upload failed: ${error.message}`);
      } else {
        alert('Upload successful!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="mb-4">
        <strong>Connection Status:</strong> {connectionStatus}
      </div>

      <div className="mb-4">
        <strong>Available Buckets:</strong>
        <ul className="list-disc list-inside mt-2">
          {buckets.map((bucket, index) => (
            <li key={index} className="text-sm">
              {bucket.name} (Public: {bucket.public ? 'Yes' : 'No'})
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <strong>Test File Upload:</strong>
        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setTestFile(e.target.files?.[0] || null)}
            className="mr-2"
          />
          <button
            onClick={handleFileUpload}
            disabled={!testFile}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Upload Test
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <strong>Configuration:</strong>
        <br />
        URL: {import.meta.env.VITE_SUPABASE_URL || 'https://waqzavsbpqylztbcgctn.supabase.co'}
        <br />
        Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not Set'}
      </div>
    </div>
  );
};

export default SupabaseTest;
