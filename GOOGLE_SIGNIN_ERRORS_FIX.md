# Google Sign-In Errors - Fix Guide

## Errors Explained

### 1. **FedCM Errors**
**Error**: `FedCM was disabled either temporarily based on previous user action or permanently via site settings`

**Explanation**: FedCM (Federated Credential Management) is a browser feature for third-party sign-in. This error appears when:
- The browser has blocked FedCM for your site
- User has disabled third-party cookies
- Browser security settings are blocking it

**Fix**: This is a browser-level setting and doesn't affect functionality. The Google Sign-In will fall back to the standard OAuth flow.

### 2. **NotAllowedError: Only one navigator.credentials.get request**
**Error**: `Only one navigator.credentials.get request may be outstanding at one time`

**Explanation**: This occurs when multiple Google Sign-In initializations happen simultaneously, causing conflicts.

**Fix Applied**: 
- Added refs to track initialization state (`isInitializedRef`, `isProcessingRef`)
- Prevented multiple simultaneous credential requests
- Added proper cleanup to avoid duplicate initializations

### 3. **NetworkError: Error retrieving a token**
**Error**: `Error retrieving a token` or `ERR_CONNECTION_REFUSED`

**Explanation**: The backend server is not running or not accessible.

**Fix Applied**:
- Added better error handling for connection errors
- Shows helpful error message when backend is not running
- Provides fallback fetch mechanism

### 4. **403 Error: Failed to load resource**
**Error**: `Failed to load resource: the server responded with a status of 403`

**Explanation**: Google's button endpoint is blocking the request, usually due to:
- Origin not authorized in Google Cloud Console
- Invalid Client ID
- CORS issues

**Fix**: Add your origin to Google Cloud Console (see Configuration section below)

### 5. **Origin Not Allowed Error**
**Error**: `The given origin is not allowed for the given client ID`

**Explanation**: Your current origin (e.g., `http://localhost:5173` or production URL) is not registered in Google Cloud Console.

**Fix**: Add authorized origins in Google Cloud Console (see Configuration section below)

### 6. **Cross-Origin-Opener-Policy Error**
**Error**: `Cross-Origin-Opener-Policy policy would block the window.postMessage call`

**Explanation**: Browser security policy blocking cross-origin communication.

**Fix Applied**: 
- Removed `window.google.accounts.id.prompt()` which can cause COOP issues
- Improved error handling for cross-origin issues

## Configuration Required

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (for local development)
   - `http://localhost:3000` (if frontend runs on port 3000)
   - Your production URL (e.g., `https://yourdomain.com`)
6. Add **Authorized redirect URIs**:
   - `http://localhost:5173` (for local development)
   - Your production URL

### 2. Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

**Important**: Replace `your-actual-client-id.apps.googleusercontent.com` with your actual Google OAuth Client ID from Google Cloud Console.

### 3. Backend Server

Ensure your backend server is running:

```bash
cd backend
npm run dev
```

The backend should be accessible at `http://localhost:3000` (or your configured port).

## Code Fixes Applied

### 1. Prevented Multiple Initializations
- Added `isInitializedRef` to track if GSI is already initialized
- Added `isProcessingRef` to prevent concurrent credential requests
- Added `scriptLoadedRef` to track script loading state

### 2. Improved Error Handling
- Better error messages for connection issues
- Helpful messages for OAuth configuration errors
- Fallback fetch mechanism when axios fails

### 3. Removed Problematic Code
- Removed `window.google.accounts.id.prompt()` which can cause COOP errors
- Added proper cleanup in useEffect

### 4. Better User Feedback
- Clear error messages for common issues
- Specific guidance for configuration problems

## Testing

1. **Check Backend is Running**:
   ```bash
   curl http://localhost:3000/api/v1/auth/google
   ```
   Should return an error (not connection refused)

2. **Check Environment Variables**:
   - Verify `.env` file exists in `frontend` directory
   - Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
   - Restart dev server after changing `.env`

3. **Check Google Cloud Console**:
   - Verify your origin is in authorized origins
   - Verify Client ID matches your `.env` file

## Common Issues

### Issue: "Cannot connect to server"
**Solution**: Start your backend server on port 3000

### Issue: "Origin not allowed"
**Solution**: Add your origin to Google Cloud Console authorized origins

### Issue: "Invalid Client ID"
**Solution**: 
- Check your `.env` file has the correct Client ID
- Restart your dev server after changing `.env`
- Verify Client ID format ends with `.apps.googleusercontent.com`

### Issue: Multiple credential requests
**Solution**: The fix prevents this, but if it still occurs:
- Clear browser cache
- Check browser console for duplicate initializations
- Ensure component is not mounting multiple times

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: May have FedCM restrictions (works with fallback)
- Mobile browsers: Full support

## Additional Notes

- FedCM errors are informational and don't break functionality
- The code now handles all error cases gracefully
- User-friendly error messages guide users to fix configuration issues
- All errors are logged to console for debugging

