# Google OAuth2 Login Implementation Guide

## Overview
This document provides step-by-step instructions to configure and test the Google OAuth2 login functionality for the MCQ Exam Preparer application.

## Features Implemented
✅ Google OAuth2 Authentication
✅ User profile display in header
✅ Login/Logout functionality
✅ Token management with localStorage
✅ HTTP interceptor for API authentication
✅ Responsive login component with beautiful UI
✅ Automatic session restoration on page refresh

## Prerequisites
- Google Cloud Console Account
- Access to the frontend application
- Basic understanding of OAuth2 concepts

## Step 1: Create Google OAuth2 Credentials

### 1.1 Go to Google Cloud Console
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 1.2 Create a New Project
1. Click on the project dropdown at the top
2. Click "NEW PROJECT"
3. Enter project name: "MCQ Exam Preparer"
4. Click "CREATE"
5. Wait for the project to be created (may take a minute)

### 1.3 Enable OAuth2 API
1. In the search bar, type "OAuth consent screen"
2. Click on "OAuth consent screen"
3. Select "External" as the User Type
4. Click "CREATE"
5. Fill in the form:
   - **App name**: MCQ Exam Preparer
   - **User support email**: (your email)
   - **Developer contact**: (your email)
6. Click "SAVE AND CONTINUE"
7. Click "SAVE AND CONTINUE" for scopes (default is fine)
8. Click "SAVE AND CONTINUE" for test users
9. Click "BACK TO DASHBOARD"

### 1.4 Create OAuth2 Credentials
1. In the left sidebar, click "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Select "Web application"
4. Fill in the form:
   - **Name**: MCQ Preparer Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:4200
     http://localhost:3000
     https://yourdomain.com
     https://www.yourdomain.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:4200/login
     http://localhost:3000/login
     https://yourdomain.com/login
     https://www.yourdomain.com/login
     ```
5. Click "CREATE"
6. Copy your **Client ID** (you'll need this in Step 2)

## Step 2: Configure Application

### 2.1 Update OAuth Configuration
1. Open `src/app/config/oauth.config.ts`
2. Replace the `GOOGLE_CLIENT_ID` with your Client ID from Step 1:
   ```typescript
   export const OAUTH2_CONFIG = {
     GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
     // ... rest of config
   };
   ```

### 2.2 Update Backend URL (Optional)
If you have a backend API for storing user data:
1. In `src/app/config/oauth.config.ts`, update `BACKEND_URL`:
   ```typescript
   BACKEND_URL: 'https://your-backend-url.com'
   ```

## Step 3: Install Dependencies
The dependencies have already been installed. If you need to reinstall:
```bash
cd Frontendv1
npm install
```

## Step 4: Run the Application

### 4.1 Local Development
```bash
cd Frontendv1
npm start
```
The application will start at `http://localhost:4200`

### 4.2 Test Login
1. Navigate to `http://localhost:4200`
2. Click the "Login" button in the top right corner
3. You should see the Google Sign-In button
4. Click the Google Sign-In button
5. Sign in with your Google account
6. You should be redirected to the home page with your profile visible

## Step 5: Project Structure

### New Files Created
```
Frontendv1/
├── src/
│   ├── app/
│   │   ├── config/
│   │   │   └── oauth.config.ts          # OAuth2 configuration
│   │   ├── services/
│   │   │   ├── auth.service.ts          # Authentication service
│   │   │   ├── auth.guard.ts            # Route protection guard
│   │   │   └── auth.interceptor.ts      # HTTP token interceptor
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   │   └── login.component.ts   # Login page component
│   │   ├── app.component.ts             # Updated with auth UI
│   │   └── app.routes.ts                # Updated with login route
│   ├── index.html                        # Added Google OAuth script
│   └── main.ts                          # Added interceptor provider
```

## Step 6: API Integration (Optional)

If you have a backend API to store user data:

### 6.1 Backend Authentication Endpoint
Create an endpoint that:
1. Receives the Google JWT token
2. Verifies the token with Google
3. Creates/updates user in your database
4. Returns your own authentication token

Example backend endpoint:
```
POST /api/auth/google
{
  "token": "google_jwt_token"
}
Response:
{
  "token": "your_auth_token",
  "user": { ... }
}
```

### 6.2 Update Auth Service
Modify `src/app/services/auth.service.ts` to call your backend:
```typescript
login(response: any): void {
  // Send token to backend
  this.http.post(`${OAUTH2_CONFIG.BACKEND_URL}${OAUTH2_CONFIG.AUTH_ENDPOINT}`, {
    token: response.credential
  }).subscribe({
    next: (res: any) => {
      // Store your backend token instead
      localStorage.setItem(this.tokenKey, res.token);
      // ... rest of login logic
    },
    error: (err) => console.error('Backend auth error:', err)
  });
}
```

## Step 7: Features Overview

### Authentication Service (`auth.service.ts`)
- Manages authentication state
- Handles JWT parsing
- Provides user information
- Manages token storage and retrieval

### Login Component (`login.component.ts`)
- Displays Google Sign-In button
- Handles OAuth callback
- Manages loading state
- Redirects after successful login

### Auth Interceptor (`auth.interceptor.ts`)
- Automatically attaches auth token to API requests
- Handles 401 responses by redirecting to login
- Manages request headers

### Updated App Component (`app.component.ts`)
- Shows user profile in header when logged in
- Displays login button when not authenticated
- Provides logout functionality

## Step 8: Testing Checklist

- [ ] Google OAuth credentials created and configured
- [ ] Client ID updated in `oauth.config.ts`
- [ ] Application runs without errors (`npm start`)
- [ ] Login button appears in the top right corner
- [ ] Google Sign-In button displays on login page
- [ ] Successfully logged in with Google account
- [ ] User profile appears in header with avatar and name
- [ ] Logout button removes user data
- [ ] Page refresh maintains login state
- [ ] Accessing protected routes works with auth guard
- [ ] Network requests include Authorization header

## Troubleshooting

### Issue: Google Sign-In button not displaying
**Solution**: 
- Verify `GOOGLE_CLIENT_ID` is correct in `oauth.config.ts`
- Check browser console for errors
- Ensure Google API script is loaded

### Issue: Redirect URI mismatch error
**Solution**:
- Go to Google Cloud Console → Credentials
- Click on your OAuth Client ID
- Add your actual domain to "Authorized redirect URIs"

### Issue: JWT parsing error
**Solution**:
- Check that response.credential is valid JWT
- Verify token format in browser console
- Ensure Google OAuth response is being received

### Issue: Token not persisting after refresh
**Solution**:
- Check browser localStorage settings
- Ensure private/incognito mode is not being used
- Verify JSON.parse doesn't throw errors

### Issue: CORS errors when calling backend
**Solution**:
- Add frontend URL to CORS whitelist on backend
- Verify backend endpoint exists and responds correctly
- Check network tab in browser developer tools

## Security Notes

⚠️ **Important**: 
- Never commit real credentials to version control
- Use environment variables for Client ID in production
- Always verify tokens on the backend
- Use HTTPS in production
- Implement proper logout across all tabs if needed
- Consider adding refresh token logic for token expiration

## Next Steps

1. **Add Database Integration**: Store user data in your backend
2. **Implement Profile Page**: Show user's quiz history and statistics
3. **Add Social Features**: Share quiz results, compare with friends
4. **Implement Password Reset**: For users who want alternative auth
5. **Add Multiple OAuth Providers**: GitHub, Microsoft, etc.

## Support & Documentation

- [Google Identity Services Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Angular Documentation](https://angular.io/docs)
- [RxJS Documentation](https://rxjs.dev/)

## File Changes Summary

### Modified Files
- `package.json` - Added @react-oauth/google dependency
- `src/index.html` - Added Google OAuth script tag
- `src/main.ts` - Added auth interceptor provider
- `src/app/app.component.ts` - Added auth UI and logout
- `src/app/app.component.css` - Added auth styling
- `src/app/app.routes.ts` - Added login route

### Created Files
- `src/app/config/oauth.config.ts`
- `src/app/services/auth.service.ts`
- `src/app/services/auth.guard.ts`
- `src/app/services/auth.interceptor.ts`
- `src/app/pages/login/login.component.ts`

---

**Last Updated**: June 3, 2026
**Version**: 1.0.0
