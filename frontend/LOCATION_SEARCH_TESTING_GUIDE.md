# 🔍 Location Search API Testing Guide

## 🚀 **Quick Test Steps**

### **Step 1: Open Browser Console**
1. Open your trip planning app
2. Press `F12` or right-click → "Inspect" → "Console"
3. Look for the console logs when you search

### **Step 2: Test Location Search**
1. Go to your trip planning page
2. In the "Places to Visit" section, type in the search box:
   - Try: `Paris`
   - Try: `New York`
   - Try: `Tokyo`
3. Watch the console for logs

### **Step 3: Check Console Logs**
Look for these logs in the console:

```javascript
// ✅ Good - API is working
🔍 Starting location search for: Paris
📡 Backend API response: {success: true, data: {...}}
✅ Found 5 results from Booking.com API
🔄 Transformed suggestions: [...]

// ❌ Bad - API is not working
🔍 Starting location search for: Paris
❌ Error searching places: Error: Failed to fetch
⚠️ No results from Booking.com API, using fallback for: Paris
🔄 Using fallback suggestions: [...]
```

## 🛠️ **Advanced Testing**

### **Option 1: Use the Debugger Component**
1. Add this to your routes:
```typescript
import APITestPage from './pages/APITestPage';

// Add to your routes
<Route path="/api-test" element={<APITestPage />} />
```

2. Navigate to `/api-test` in your browser
3. Use the debugger to test both APIs

### **Option 2: Manual API Testing**

#### **Test Backend API Directly:**
```bash
# Test your backend API
curl "http://localhost:8080/api/locations/search?query=Paris&languageCode=en&limit=5"
```

#### **Test Booking.com API Directly:**
```bash
# Test Booking.com API directly
curl -X GET "https://booking-com-api5.p.rapidapi.com/accomodation/autocomplete?languagecode=en&limit=5&query=Paris&currency_code=USD" \
  -H "X-Rapidapi-Key: bbefbd0c2cmsh32738304eae9dfap19a055jsn132ee598d744" \
  -H "X-Rapidapi-Host: booking-com-api5.p.rapidapi.com"
```

## 🔍 **What to Look For**

### **✅ API is Working:**
- Console shows: `✅ Found X results from Booking.com API`
- Suggestions appear in the dropdown
- Real location names and coordinates
- Response time < 2000ms

### **❌ API is Not Working:**
- Console shows: `❌ Error searching places`
- Fallback suggestions appear instead
- Generic place names like "Paris Tourist Spot"
- No real coordinates

## 🚨 **Common Issues & Solutions**

### **Issue 1: Backend Server Not Running**
**Symptoms:**
- Console shows: `Failed to fetch`
- Network error in browser

**Solution:**
```bash
# Start your Spring Boot backend
cd backend
./mvnw spring-boot:run
```

### **Issue 2: API Key Issues**
**Symptoms:**
- Console shows: `401 Unauthorized`
- `403 Forbidden`

**Solution:**
- Check API key in `LocationSearchService.java`
- Verify RapidAPI subscription is active

### **Issue 3: CORS Issues**
**Symptoms:**
- Console shows: `CORS error`
- `Access-Control-Allow-Origin`

**Solution:**
- Check `SecurityConfig.java` CORS configuration
- Ensure frontend URL is allowed

### **Issue 4: Network Issues**
**Symptoms:**
- Console shows: `Network Error`
- `ERR_NETWORK`

**Solution:**
- Check internet connection
- Try different location names
- Check if RapidAPI is accessible

## 📊 **Expected Response Format**

### **Successful Booking.com API Response:**
```json
{
  "success": true,
  "data": {
    "data": {
      "autoCompleteSuggestions": {
        "results": [
          {
            "destination": {
              "destId": "12345",
              "destType": "CITY",
              "latitude": 48.8566,
              "longitude": 2.3522,
              "nbHotels": 1500
            },
            "displayInfo": {
              "title": "Paris",
              "subTitle": "Paris, France",
              "absoluteImageUrl": "https://...",
              "labelComponents": [
                {"type": "CITY", "name": "Paris"},
                {"type": "COUNTRY", "name": "France"}
              ]
            }
          }
        ]
      }
    }
  }
}
```

## 🧪 **Test Cases**

### **Test 1: Basic Search**
- Query: `Paris`
- Expected: 3-5 results
- Expected: Real coordinates (48.8566, 2.3522)

### **Test 2: Partial Search**
- Query: `Par`
- Expected: Multiple results starting with "Par"

### **Test 3: Non-existent Location**
- Query: `xyz123nonexistent`
- Expected: Empty results or fallback

### **Test 4: Special Characters**
- Query: `São Paulo`
- Expected: Proper handling of special characters

## 🔧 **Debugging Commands**

### **Check Backend Logs:**
```bash
# Check Spring Boot logs
tail -f backend/logs/application.log
```

### **Check Network Requests:**
1. Open browser DevTools
2. Go to "Network" tab
3. Search for a location
4. Look for requests to `/api/locations/search`

### **Check API Response:**
1. Click on the network request
2. Go to "Response" tab
3. Check if data is returned

## 📝 **Testing Checklist**

- [ ] Backend server is running on port 8080
- [ ] Frontend can connect to backend
- [ ] API key is valid and active
- [ ] CORS is properly configured
- [ ] Console shows successful API calls
- [ ] Real location suggestions appear
- [ ] Coordinates are valid numbers
- [ ] Response time is reasonable (< 2 seconds)

## 🎯 **Quick Fixes**

### **If API is not working:**

1. **Check backend status:**
```bash
curl http://localhost:8080/api/locations/search?query=test
```

2. **Check API key:**
```bash
curl -H "X-Rapidapi-Key: YOUR_KEY" \
     -H "X-Rapidapi-Host: booking-com-api5.p.rapidapi.com" \
     "https://booking-com-api5.p.rapidapi.com/accomodation/autocomplete?query=test"
```

3. **Check frontend console:**
- Look for error messages
- Check network requests
- Verify API calls are being made

## 🚀 **Next Steps**

Once you confirm the API is working:

1. **Test with real locations** in your trip planning
2. **Verify map markers** appear at correct coordinates
3. **Test place addition** to trips
4. **Check trip-specific places** are working

The Booking.com API should return real location data with accurate coordinates for your map markers! 🎉
