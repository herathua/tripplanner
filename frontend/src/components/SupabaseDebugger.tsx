import React, { useState } from 'react';
import { supabase } from '../config/supabase';

const SupabaseDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test 1: Basic connection
      console.log('Testing basic Supabase connection...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      results.buckets = { data: buckets, error: bucketsError };

      // Test 2: Check if guides bucket exists
      if (buckets && !bucketsError) {
        const guidesBucket = buckets.find(b => b.name === 'guides');
        results.guidesBucket = guidesBucket ? 'Found' : 'Not Found';
      }

      // Test 3: Test file upload
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const { error: uploadError } = await supabase.storage
        .from('guides')
        .upload(`test-${Date.now()}.txt`, testFile);
      results.uploadTest = uploadError ? `Failed: ${uploadError.message}` : 'Success';

      // Test 4: Check environment variables
      results.envVars = {
        url: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not Set',
        key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not Set'
      };

    } catch (error) {
      results.error = error;
    }

    setDebugInfo(results);
    setIsLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Supabase Diagnostics</h2>
      
      <button
        onClick={runDiagnostics}
        disabled={isLoading}
        className="bg-blue-500 text-white px-6 py-2 rounded mb-4 disabled:bg-gray-300"
      >
        {isLoading ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </button>

      {Object.keys(debugInfo).length > 0 && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Diagnostic Results:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-bold mb-2">Common Fixes:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Check if Supabase project is paused in dashboard</li>
          <li>Verify the 'guides' bucket exists and is public</li>
          <li>Check RLS policies allow uploads</li>
          <li>Restart your development server</li>
          <li>Clear browser cache and cookies</li>
        </ul>
      </div>
    </div>
  );
};

export default SupabaseDebugger;
