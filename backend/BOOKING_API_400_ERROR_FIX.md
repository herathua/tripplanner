# 🚨 Booking.com API 400 Error - Debugging Guide

## 🔍 **Problem Identified**

Your console shows:
```
GET http://localhost:8080/api/locations/search?query=sewr&languageCode=en&limit=5 400 (Bad Request)
```

This means the **backend is rejecting the request** before it even reaches Booking.com API.

## 🛠️ **Fixes Applied**

### **1. Fixed URL Encoding**
- ✅ **Before**: Manual string formatting (could cause encoding issues)
- ✅ **After**: Using `UriComponentsBuilder` for proper URL encoding

### **2. Added Better Error Handling**
- ✅ **Before**: Generic error responses
- ✅ **After**: Detailed error logging and structured responses

### **3. Added Debug Logging**
- ✅ **Backend logs** will now show detailed API call information
- ✅ **Frontend logs** will show more detailed error information

## 🚀 **How to Test the Fix**

### **Step 1: Restart Your Backend**
```bash
# Stop your Spring Boot server (Ctrl+C)
# Then restart it
cd backend
./mvnw spring-boot:run
```

### **Step 2: Test the API Directly**
```bash
# Test the new test endpoint
curl "http://localhost:8080/api/locations/test"

# Test the search endpoint
curl "http://localhost:8080/api/locations/search?query=Paris&languageCode=en&limit=5"
```

### **Step 3: Check Backend Logs**
Look for these logs in your Spring Boot console:
```java
🔍 LocationSearchController: Received search request
   Query: Paris
   Language: en
   Limit: 5
🔍 Booking.com API URL: https://booking-com-api5.p.rapidapi.com/accomodation/autocomplete?languagecode=en&limit=5&query=Paris&currency_code=USD
📡 Making request to Booking.com API...
✅ Booking.com API response status: 200 OK
📊 Response body: {...}
✅ LocationSearchController: Successfully retrieved results
```

### **Step 4: Test in Frontend**
1. **Open your trip planning app**
2. **Go to Places section**
3. **Type "Paris" in search box**
4. **Check browser console** for:
```javascript
🔍 Starting location search for: Paris
📡 Backend API response: {success: true, data: {...}}
✅ Found 5 results from Booking.com API
```

## 🔧 **Possible Issues & Solutions**

### **Issue 1: API Key Invalid**
**Symptoms:**
- Backend logs show: `401 Unauthorized` or `403 Forbidden`
- Booking.com API returns authentication error

**Solution:**
```bash
# Test API key directly
curl -H "X-Rapidapi-Key: bbefbd0c2cmsh32738304eae9dfap19a055jsn132ee598d744" \
     -H "X-Rapidapi-Host: booking-com-api5.p.rapidapi.com" \
     "https://booking-com-api5.p.rapidapi.com/accomodation/autocomplete?query=Paris"
```

### **Issue 2: RapidAPI Subscription**
**Symptoms:**
- Backend logs show: `429 Too Many Requests`
- API calls are rate limited

**Solution:**
- Check your RapidAPI subscription status
- Verify you have remaining API calls

### **Issue 3: Network Issues**
**Symptoms:**
- Backend logs show: `Connection timeout`
- `UnknownHostException`

**Solution:**
- Check internet connection
- Verify RapidAPI is accessible

### **Issue 4: CORS Issues**
**Symptoms:**
- Frontend shows: `CORS error`
- `Access-Control-Allow-Origin` error

**Solution:**
- Check `SecurityConfig.java` CORS configuration
- Ensure frontend URL is allowed

## 🧪 **Testing Steps**

### **Test 1: Backend API Test Endpoint**
```bash
curl "http://localhost:8080/api/locations/test"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking.com API is working",
  "testResults": {...}
}
```

### **Test 2: Search Endpoint**
```bash
curl "http://localhost:8080/api/locations/search?query=Paris&languageCode=en&limit=5"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "data": {
      "autoCompleteSuggestions": {
        "results": [...]
      }
    }
  }
}
```

### **Test 3: Frontend Integration**
1. **Open browser console**
2. **Search for "Paris"**
3. **Look for success logs**

## 📊 **Expected Behavior After Fix**

### **✅ Working Correctly:**
- Backend logs show successful API calls
- Frontend console shows: `✅ Found X results from Booking.com API`
- Real location suggestions appear
- Map markers show correct coordinates

### **❌ Still Not Working:**
- Backend logs show specific error messages
- Frontend console shows: `❌ Error searching places`
- Fallback suggestions appear instead

## 🔍 **Debugging Commands**

### **Check Backend Status:**
```bash
# Check if backend is running
curl "http://localhost:8080/api/locations/test"

# Check specific search
curl "http://localhost:8080/api/locations/search?query=Paris"
```

### **Check API Key:**
```bash
# Test API key directly
curl -H "X-Rapidapi-Key: bbefbd0c2cmsh32738304eae9dfap19a055jsn132ee598d744" \
     -H "X-Rapidapi-Host: booking-com-api5.p.rapidapi.com" \
     "https://booking-com-api5.p.rapidapi.com/accomodation/autocomplete?query=Paris"
```

### **Check Frontend Network:**
1. **Open browser DevTools**
2. **Go to Network tab**
3. **Search for a location**
4. **Check the `/locations/search` request**

## 🎯 **Next Steps**

1. **Restart your backend server**
2. **Test the API endpoints** using curl commands
3. **Check backend logs** for detailed error information
4. **Test in frontend** and check console logs
5. **Report any remaining errors** with the specific error messages

The 400 error should be resolved with the URL encoding fix and better error handling! 🚀
