import { 
  wikipediaClient, 
  openMeteoClient, 
  openMeteoGeocodingClient,
  openTripMapClient, 
  openRouterClient,
  EXTERNAL_APIS 
} from '../config/api';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  type: 'text' | 'weather' | 'location' | 'wikipedia' | 'error';
  data?: any;
}

export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface LocationData {
  name: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  attractions: Array<{
    name: string;
    type: string;
    rating?: number;
  }>;
}

export interface WikipediaData {
  title: string;
  extract: string;
  url: string;
  image?: string;
}

export class AIChatbotService {
  private conversationHistory: ChatMessage[] = [];

  // Get weather information for a location
  async getWeatherData(location: string): Promise<WeatherData> {
    try {
      console.log('🌤️ Getting weather for location:', location);
      
      // First, get coordinates for the location using Open-Meteo geocoding
      const geoResponse = await openMeteoGeocodingClient.get('/search', {
        params: {
          name: location,
          count: 1,
          language: 'en',
          format: 'json',
        },
      });

      console.log('🌍 Geocoding response for weather:', geoResponse.data);

      if (!geoResponse.data) {
        throw new Error(`No response from geocoding API for "${location}"`);
      }

      // Check different possible response structures
      let results = geoResponse.data.results || geoResponse.data.data || geoResponse.data;
      
      if (!Array.isArray(results) || results.length === 0) {
        console.error('Unexpected geocoding response structure:', geoResponse.data);
        throw new Error(`Location "${location}" not found`);
      }

      const result = results[0];
      const lat = result.latitude || result.lat;
      const lon = result.longitude || result.lon;
      const name = result.name || result.display_name || location;
      const country = result.country || 'Unknown';

      // Get weather data from Open-Meteo
      const weatherResponse = await openMeteoClient.get('/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
          timezone: 'auto',
        },
      });

      const current = weatherResponse.data.current;
      
      // Convert weather code to description
      const weatherDescription = this.getWeatherDescription(current.weather_code);
      
      return {
        location: name,
        temperature: Math.round(current.temperature_2m),
        description: weatherDescription,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m * 3.6), // Convert m/s to km/h
        icon: this.getWeatherIcon(current.weather_code),
        coordinates: { lat, lon },
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error(`Failed to get weather for ${location}`);
    }
  }

  // Get location information and attractions
  async getLocationData(location: string): Promise<LocationData> {
    try {
      // Get location coordinates using Open-Meteo geocoding
      const geoResponse = await openMeteoGeocodingClient.get('/search', {
        params: {
          name: location,
          count: 1,
          language: 'en',
          format: 'json',
        },
      });

      console.log('🌍 Geocoding response:', geoResponse.data);

      if (!geoResponse.data) {
        throw new Error(`No response from geocoding API for "${location}"`);
      }

      // Check different possible response structures
      let results = geoResponse.data.results || geoResponse.data.data || geoResponse.data;
      
      if (!Array.isArray(results) || results.length === 0) {
        console.error('Unexpected geocoding response structure:', geoResponse.data);
        throw new Error(`Location "${location}" not found`);
      }

      const result = results[0];
      const lat = result.latitude || result.lat;
      const lon = result.longitude || result.lon;
      const name = result.name || result.display_name || location;
      const country = result.country || 'Unknown';

      // Get attractions from OpenTripMap
      const attractionsResponse = await openTripMapClient.get('/radius', {
        params: {
          radius: 5000,
          lon,
          lat,
          apikey: EXTERNAL_APIS.OPENTRIPMAP.API_KEY,
          limit: 10,
          kinds: 'cultural,historic,architecture,interesting_places',
        },
      });

      const attractions = attractionsResponse.data.features?.map((feature: any) => ({
        name: feature.properties.name,
        type: feature.properties.kinds?.split(',')[0] || 'attraction',
        rating: feature.properties.rate,
      })) || [];

      return {
        name,
        country,
        coordinates: { lat, lon },
        attractions,
      };
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw new Error(`Failed to get location data for ${location}`);
    }
  }

  // Get Wikipedia information using JSONP to bypass CORS
  async getWikipediaData(query: string): Promise<WikipediaData> {
    try {
      // Use JSONP format to bypass CORS restrictions
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1&callback=wikipediaCallback`;
      
      // Create a script tag to load the JSONP response
      return new Promise((resolve, reject) => {
        // Create a unique callback name
        const callbackName = 'wikipediaCallback_' + Date.now();
        
        // Create global callback function
        (window as any)[callbackName] = (data: any) => {
          try {
            if (!data.query?.search || data.query.search.length === 0) {
              reject(new Error(`No Wikipedia articles found for "${query}"`));
              return;
            }

            const page = data.query.search[0];
            const title = page.title;

            // Get the page summary using JSONP
            const summaryUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|info&titles=${encodeURIComponent(title)}&format=json&exintro=1&explaintext=1&inprop=url&callback=wikipediaSummaryCallback`;
            
            const summaryCallbackName = 'wikipediaSummaryCallback_' + Date.now();
            (window as any)[summaryCallbackName] = (summaryData: any) => {
              try {
                const pages = summaryData.query?.pages;
                if (!pages) {
                  reject(new Error(`Failed to get page data for "${title}"`));
                  return;
                }

                const pageId = Object.keys(pages)[0];
                const pageData = pages[pageId];

                const result = {
                  title: pageData.title,
                  extract: pageData.extract || 'No summary available',
                  url: pageData.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
                  image: undefined,
                };

                // Clean up
                delete (window as any)[callbackName];
                delete (window as any)[summaryCallbackName];
                document.head.removeChild(searchScript);
                document.head.removeChild(summaryScript);
                
                resolve(result);
              } catch (error) {
                reject(new Error(`Failed to parse Wikipedia summary for "${title}"`));
              }
            };

            // Load summary data
            const summaryScript = document.createElement('script');
            summaryScript.src = summaryUrl.replace('wikipediaSummaryCallback', summaryCallbackName);
            summaryScript.onerror = () => reject(new Error(`Failed to load Wikipedia summary for "${title}"`));
            document.head.appendChild(summaryScript);

          } catch (error) {
            reject(new Error(`Failed to parse Wikipedia search results for "${query}"`));
          }
        };

        // Load search data
        const searchScript = document.createElement('script');
        searchScript.src = searchUrl.replace('wikipediaCallback', callbackName);
        searchScript.onerror = () => reject(new Error(`Failed to load Wikipedia search results for "${query}"`));
        document.head.appendChild(searchScript);

        // Timeout after 10 seconds
        setTimeout(() => {
          reject(new Error('Wikipedia API request timed out'));
        }, 10000);
      });

    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
      throw new Error(`Failed to get Wikipedia information for "${query}"`);
    }
  }

  // Generate AI response using OpenRouter
  async generateAIResponse(
    userMessage: string, 
    context: string = ''
  ): Promise<string> {
    try {
      const systemPrompt = `You are a helpful travel assistant AI. You help users with travel-related questions, provide information about destinations, weather, attractions, and general travel advice. 

Context from previous conversation: ${context}

Please provide helpful, accurate, and engaging responses. If the user asks about weather, locations, or specific places, you can mention that you have access to real-time data. Keep responses conversational and informative.`;

      const response = await openRouterClient.post('/chat/completions', {
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response at the moment.';
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'I apologize, but I\'m having trouble connecting to my AI service right now. Please try again later.';
    }
  }

  // Process user message and generate response
  async processMessage(userMessage: string): Promise<ChatMessage[]> {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessage,
      timestamp: new Date(),
      type: 'text',
    };

    this.conversationHistory.push(userMsg);

    try {
      // Check if user is asking about weather
      if (this.isWeatherQuery(userMessage)) {
        const location = this.extractLocation(userMessage);
        if (location) {
          const weatherData = await this.getWeatherData(location);
          const weatherMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: this.formatWeatherResponse(weatherData),
            timestamp: new Date(),
            type: 'weather',
            data: weatherData,
          };
          this.conversationHistory.push(weatherMsg);
          return [userMsg, weatherMsg];
        }
      }

      // Check if user is asking about a location
      if (this.isLocationQuery(userMessage)) {
        const location = this.extractLocation(userMessage);
        if (location) {
          const locationData = await this.getLocationData(location);
          const locationMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: this.formatLocationResponse(locationData),
            timestamp: new Date(),
            type: 'location',
            data: locationData,
          };
          this.conversationHistory.push(locationMsg);
          return [userMsg, locationMsg];
        }
      }

      // Check if user wants Wikipedia information
      if (this.isWikipediaQuery(userMessage)) {
        const query = this.extractWikipediaQuery(userMessage);
        if (query) {
          const wikiData = await this.getWikipediaData(query);
          const wikiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: this.formatWikipediaResponse(wikiData),
            timestamp: new Date(),
            type: 'wikipedia',
            data: wikiData,
          };
          this.conversationHistory.push(wikiMsg);
          return [userMsg, wikiMsg];
        }
      }

      // Generate AI response for other queries
      const context = this.conversationHistory
        .slice(-5)
        .map(msg => `${msg.sender}: ${msg.text}`)
        .join('\n');

      const aiResponse = await this.generateAIResponse(userMessage, context);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: aiResponse,
        timestamp: new Date(),
        type: 'text',
      };

      this.conversationHistory.push(aiMsg);
      return [userMsg, aiMsg];

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or rephrase your question.`,
        timestamp: new Date(),
        type: 'error',
      };
      this.conversationHistory.push(errorMsg);
      return [userMsg, errorMsg];
    }
  }

  // Helper methods to detect query types
  private isWeatherQuery(message: string): boolean {
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'hot', 'cold', 'rain', 'sunny'];
    return weatherKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private isLocationQuery(message: string): boolean {
    const locationKeywords = ['attractions', 'places to visit', 'things to do', 'sights', 'landmarks', 'tourist'];
    return locationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private isWikipediaQuery(message: string): boolean {
    const wikiKeywords = ['tell me about', 'what is', 'who is', 'information about', 'learn about'];
    return wikiKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  // Extract location from message
  private extractLocation(message: string): string | null {
    // Clean the message by removing question marks and extra punctuation
    const cleanMessage = message.replace(/[?.,!]/g, '').trim();
    const words = cleanMessage.split(' ');
    
    console.log('🔍 Location extraction debug:', { message, cleanMessage, words });
    
    // Look for location indicators
    const locationIndex = words.findIndex(word => 
      ['in', 'at', 'for', 'about', 'like'].includes(word.toLowerCase())
    );
    
    if (locationIndex !== -1 && locationIndex + 1 < words.length) {
      let location = words.slice(locationIndex + 1).join(' ');
      
      // Remove common question words and extra text
      location = location.replace(/\b(what|how|when|where|why|is|are|the|a|an)\b/gi, '').trim();
      location = location.replace(/\s+/g, ' '); // Remove extra spaces
      
      // Remove common words that are not locations
      const commonWords = ['attractions', 'places', 'things', 'sights', 'landmarks', 'tourist', 'to', 'visit', 'see', 'do'];
      commonWords.forEach(word => {
        location = location.replace(new RegExp(`\\b${word}\\b`, 'gi'), '').trim();
      });
      
      // Remove any remaining prepositions at the start
      location = location.replace(/^(in|at|for|about|like)\s+/i, '').trim();
      
      console.log('📍 Extracted location (method 1):', location);
      return location || null;
    }
    
    // Fallback: look for capitalized words that might be locations
    const capitalizedWords = words.filter(word => 
      word.length > 2 && word[0] === word[0].toUpperCase() && !['What', 'How', 'When', 'Where', 'Why'].includes(word)
    );
    
    if (capitalizedWords.length > 0) {
      let location = capitalizedWords.join(' ');
      // Remove common question words
      location = location.replace(/\b(What|How|When|Where|Why|Is|Are|The|A|An)\b/g, '').trim();
      location = location.replace(/\s+/g, ' '); // Remove extra spaces
      
      // Remove common words that are not locations
      const commonWords = ['attractions', 'places', 'things', 'sights', 'landmarks', 'tourist', 'to', 'visit', 'see', 'do'];
      commonWords.forEach(word => {
        location = location.replace(new RegExp(`\\b${word}\\b`, 'gi'), '').trim();
      });
      
      // Remove any remaining prepositions at the start
      location = location.replace(/^(in|at|for|about|like)\s+/i, '').trim();
      
      console.log('📍 Extracted location (method 2):', location);
      return location || null;
    }
    
    console.log('❌ No location found');
    return null;
  }

  // Extract Wikipedia query
  private extractWikipediaQuery(message: string): string | null {
    const wikiKeywords = ['tell me about', 'what is', 'who is', 'information about', 'learn about'];
    for (const keyword of wikiKeywords) {
      if (message.toLowerCase().includes(keyword)) {
        const startIndex = message.toLowerCase().indexOf(keyword) + keyword.length;
        let query = message.substring(startIndex).trim();
        
        // Clean the query by removing question marks and extra punctuation
        query = query.replace(/[?.,!]/g, '').trim();
        
        // Remove common question words
        query = query.replace(/\b(what|how|when|where|why|is|are|the|a|an)\b/gi, '').trim();
        query = query.replace(/\s+/g, ' '); // Remove extra spaces
        
        // Additional cleaning: remove any remaining prepositions at the start
        query = query.replace(/^(in|at|for|about|like|the)\s+/i, '').trim();
        
        return query || null;
      }
    }
    return null;
  }

  // Format responses
  private formatWeatherResponse(weather: WeatherData): string {
    return `🌤️ Weather in ${weather.location}:
• Temperature: ${weather.temperature}°C
• Conditions: ${weather.description}
• Humidity: ${weather.humidity}%
• Wind Speed: ${weather.windSpeed} km/h

Perfect for planning your trip!`;
  }

  private formatLocationResponse(location: LocationData): string {
    const attractionsList = location.attractions
      .slice(0, 5)
      .map(attr => `• ${attr.name} (${attr.type})`)
      .join('\n');

    return `📍 ${location.name}, ${location.country}

Top attractions nearby:
${attractionsList}

Coordinates: ${location.coordinates.lat.toFixed(4)}, ${location.coordinates.lon.toFixed(4)}`;
  }

  private formatWikipediaResponse(wiki: WikipediaData): string {
    return `📚 ${wiki.title}

${wiki.extract}

Read more: ${wiki.url}`;
  }

  // Helper methods for Open-Meteo weather codes
  private getWeatherDescription(code: number): string {
    const weatherCodes: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail',
    };
    return weatherCodes[code] || 'Unknown';
  }

  private getWeatherIcon(code: number): string {
    const iconMap: { [key: number]: string } = {
      0: '☀️', // Clear sky
      1: '🌤️', // Mainly clear
      2: '⛅', // Partly cloudy
      3: '☁️', // Overcast
      45: '🌫️', // Foggy
      48: '🌫️', // Rime fog
      51: '🌦️', // Light drizzle
      53: '🌦️', // Moderate drizzle
      55: '🌧️', // Dense drizzle
      56: '🌨️', // Freezing drizzle
      57: '🌨️', // Dense freezing drizzle
      61: '🌧️', // Rain
      63: '🌧️', // Moderate rain
      65: '🌧️', // Heavy rain
      66: '🌨️', // Freezing rain
      67: '🌨️', // Heavy freezing rain
      71: '🌨️', // Snow
      73: '🌨️', // Moderate snow
      75: '🌨️', // Heavy snow
      77: '🌨️', // Snow grains
      80: '🌦️', // Rain showers
      81: '🌧️', // Moderate rain showers
      82: '🌧️', // Violent rain showers
      85: '🌨️', // Snow showers
      86: '🌨️', // Heavy snow showers
      95: '⛈️', // Thunderstorm
      96: '⛈️', // Thunderstorm with hail
      99: '⛈️', // Thunderstorm with heavy hail
    };
    return iconMap[code] || '🌤️';
  }

  // Get conversation history
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  // Clear conversation history
  clearConversation(): void {
    this.conversationHistory = [];
  }
}

export default new AIChatbotService();
