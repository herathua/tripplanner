import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, BarChart3, Activity } from 'lucide-react';
import { blogRatingService, RatingInsights, RatingActivity, TopRatedPost } from '../services/blogRatingService';

interface RatingAnalyticsProps {
  blogPostId: number;
  firebaseUid?: string;
}

const RatingAnalytics: React.FC<RatingAnalyticsProps> = ({ blogPostId, firebaseUid }) => {
  const [insights, setInsights] = useState<RatingInsights | null>(null);
  const [recentActivity, setRecentActivity] = useState<RatingActivity[]>([]);
  const [topPosts, setTopPosts] = useState<TopRatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'activity' | 'top'>('insights');

  useEffect(() => {
    loadAnalytics();
  }, [blogPostId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load insights for this blog post
      const insightsData = await blogRatingService.getRatingInsights(blogPostId);
      setInsights(insightsData);
      
      // Load recent activity
      const activityData = await blogRatingService.getRecentRatingActivity(24);
      setRecentActivity(activityData);
      
      // Load top rated posts
      const topPostsData = await blogRatingService.getTopRatedBlogPosts(3);
      setTopPosts(topPostsData);
      
    } catch (error) {
      console.error('Error loading rating analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderDistributionChart = () => {
    if (!insights?.distribution) return null;

    const maxCount = Math.max(...Object.values(insights.distribution));
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = insights.distribution[rating] || 0;
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-8">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs font-medium">{rating}</span>
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('insights')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'insights'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Insights
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Recent Activity
          </button>
          <button
            onClick={() => setActiveTab('top')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'top'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Top Rated
          </button>
        </nav>
      </div>

      <div className="p-6">
        {/* Insights Tab */}
        {activeTab === 'insights' && insights && (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Average Rating</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {insights.averageRating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Total Ratings</p>
                    <p className="text-2xl font-bold text-green-900">
                      {insights.ratingCount}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Quality</p>
                    <p className="text-lg font-bold text-purple-900">
                      {insights.ratingQuality}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
              {renderDistributionChart()}
            </div>

            {/* Quality Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">High Ratings (4-5 stars)</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${insights.highRatingPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {insights.highRatingPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Low Ratings (1-2 stars)</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${insights.lowRatingPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {insights.lowRatingPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Rating Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {renderStarRating(activity.rating)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.blogPostTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      User: {activity.userId.substring(0, 8)}...
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Top Rated Tab */}
        {activeTab === 'top' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Rated Blog Posts</h3>
            {topPosts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No top rated posts available</p>
            ) : (
              <div className="space-y-3">
                {topPosts.map((post, index) => (
                  <div key={post.blogPostId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{post.title}</p>
                        <p className="text-sm text-gray-500">by {post.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {renderStarRating(post.averageRating)}
                        </div>
                        <p className="text-xs text-gray-500">{post.ratingCount} ratings</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingAnalytics;
