import React, { useState } from 'react';
import StarRating from './StarRating';
import RatingAnalytics from './RatingAnalytics';

interface EnhancedBlogPostWithRatingProps {
  blogPostId: number;
  firebaseUid?: string;
  title: string;
  content: string;
  author: string;
}

const EnhancedBlogPostWithRating: React.FC<EnhancedBlogPostWithRatingProps> = ({
  blogPostId,
  firebaseUid,
  title,
  content,
  author
}) => {
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Blog Post Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">By {author}</p>
          <div className="flex items-center space-x-4">
            <StarRating
              blogPostId={blogPostId}
              firebaseUid={firebaseUid}
              interactive={true}
              showStats={true}
              size="lg"
              onRatingChange={(rating) => {
                console.log(`User rated ${rating} stars`);
              }}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">{content}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showAnalytics ? 'Hide Analytics' : 'Show Rating Analytics'}
            </button>
          </div>
          
          {!firebaseUid && (
            <div className="text-sm text-gray-500">
              Please log in to rate this blog post
            </div>
          )}
        </div>
      </div>

      {/* Rating Analytics */}
      {showAnalytics && (
        <div className="mb-6">
          <RatingAnalytics 
            blogPostId={blogPostId} 
            firebaseUid={firebaseUid} 
          />
        </div>
      )}

      {/* Usage Examples */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Enhanced Rating System Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backend Features */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Backend Logic</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ <strong>Anti-Spam Protection:</strong> Max 10 ratings per hour</li>
              <li>✅ <strong>Self-Rating Prevention:</strong> Can't rate your own posts</li>
              <li>✅ <strong>Suspicious Pattern Detection:</strong> Monitors rating patterns</li>
              <li>✅ <strong>Comprehensive Validation:</strong> Input validation & error handling</li>
              <li>✅ <strong>Rating Analytics:</strong> Distribution, insights, trends</li>
              <li>✅ <strong>User Statistics:</strong> Personal rating patterns</li>
              <li>✅ <strong>Top Posts Discovery:</strong> Find best-rated content</li>
            </ul>
          </div>
          
          {/* Frontend Features */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Frontend Features</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ <strong>Interactive Star Rating:</strong> Hover effects & feedback</li>
              <li>✅ <strong>Real-time Updates:</strong> Stats update after rating</li>
              <li>✅ <strong>Error Handling:</strong> User-friendly error messages</li>
              <li>✅ <strong>Analytics Dashboard:</strong> Visual insights & charts</li>
              <li>✅ <strong>Recent Activity:</strong> Live rating feed</li>
              <li>✅ <strong>Top Rated Posts:</strong> Discover great content</li>
              <li>✅ <strong>Responsive Design:</strong> Works on all devices</li>
            </ul>
          </div>
        </div>
        
        {/* API Endpoints */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">New API Endpoints</h3>
          <div className="bg-white rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Analytics</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><code>GET /blog-ratings/{id}/distribution</code></li>
                  <li><code>GET /blog-ratings/{id}/insights</code></li>
                  <li><code>GET /blog-ratings/recent-activity</code></li>
                  <li><code>GET /blog-ratings/top-rated</code></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">User Stats</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><code>GET /blog-ratings/user/{uid}/stats</code></li>
                  <li><code>POST /blog-ratings/{id}</code> (enhanced)</li>
                  <li><code>GET /blog-ratings/{id}/user/{uid}</code></li>
                  <li><code>DELETE /blog-ratings/{id}/user/{uid}</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBlogPostWithRating;
