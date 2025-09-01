# AI Travel Assistant Chatbot Setup

This AI-powered chatbot replaces the location search page and provides intelligent travel assistance using multiple external APIs.

## Features

🌤️ **Weather Information** - Real-time weather data for any location using Open-Meteo API
📍 **Location Details** - Attractions and places to visit using OpenTripMap API  
📚 **Wikipedia Facts** - Educational information about destinations and landmarks
💬 **AI Travel Advice** - Intelligent responses using OpenRouter (Claude 3.5 Sonnet)

## Required API Keys

### 1. Open-Meteo API
- **Purpose**: Weather data and location coordinates
- **Get API Key**: https://open-meteo.com/ (No API key required - completely free!)
- **Cost**: 100% Free with no rate limits

### 2. OpenTripMap API
- **Purpose**: Tourist attractions and points of interest
- **Get API Key**: https://opentripmap.io/
- **Cost**: Free tier available (5000 calls/month)

### 3. OpenRouter API
- **Purpose**: AI-powered responses and travel advice
- **Get API Key**: https://openrouter.ai/
- **Cost**: Pay-per-use (very affordable)

## Environment Setup

Create a `.env` file in the frontend directory with your API keys:

```bash
# Open-Meteo API - No API key required (completely free!)
# VITE_OPENMETEO_API_KEY=not_needed

# OpenTripMap API Key
VITE_OPENTRIPMAP_API_KEY=your_actual_opentripmap_api_key

# OpenRouter API Key
VITE_OPENROUTER_API_KEY=your_actual_openrouter_api_key
```

## How It Works

1. **Weather Queries**: When users ask about weather, the bot automatically detects location keywords and fetches real-time weather data
2. **Location Queries**: For attraction-related questions, the bot fetches nearby points of interest and tourist information
3. **Wikipedia Queries**: Educational questions trigger Wikipedia API calls for detailed information
4. **AI Responses**: All other queries are handled by Claude 3.5 Sonnet through OpenRouter for intelligent travel advice

## Example Queries

- "What's the weather like in Paris?"
- "Tell me about attractions in Tokyo"
- "What is the Eiffel Tower?"
- "Give me travel tips for Italy"
- "What should I pack for a trip to Iceland?"
- "Best time to visit Japan?"

## Technical Implementation

- **Service Layer**: `aiChatbotService.ts` handles all API integrations
- **Smart Detection**: Keyword-based detection for different query types
- **Error Handling**: Graceful fallbacks when APIs are unavailable
- **Real-time Updates**: Live weather and location data
- **Conversation Memory**: Maintains context for better AI responses

## Troubleshooting

1. **API Key Errors**: Ensure all environment variables are set correctly
2. **Rate Limits**: Free API tiers have usage limits - upgrade if needed
3. **CORS Issues**: All APIs support CORS for browser requests
4. **Network Errors**: Check internet connection and API service status

## Cost Estimation

- **Open-Meteo**: 100% Free with no rate limits
- **OpenTripMap**: Free tier (5000 calls/month) or $99/month for unlimited  
- **OpenRouter**: ~$0.0025 per 1K tokens (very affordable for chat usage)

Total estimated cost: $0-15/month for moderate usage (Open-Meteo is completely free!).
