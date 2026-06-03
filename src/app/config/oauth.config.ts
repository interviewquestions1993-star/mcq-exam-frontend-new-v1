/**
 * Google OAuth2 Configuration
 * IMPORTANT: Replace the GOOGLE_CLIENT_ID with your own Google OAuth2 Client ID
 * 
 * Steps to get your Client ID:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project (or use existing one)
 * 3. Go to APIs & Services > Credentials
 * 4. Click "Create Credentials" > "OAuth 2.0 Client ID"
 * 5. Choose "Web application"
 * 6. Add authorized JavaScript origins: http://localhost:4200, https://yourdomain.com
 * 7. Add authorized redirect URIs: http://localhost:4200, https://yourdomain.com
 * 8. Copy the Client ID and paste it below
 */

export const OAUTH2_CONFIG = {
  // Replace this with your actual Google OAuth2 Client ID
  GOOGLE_CLIENT_ID: '1035880980503-fu8309tnjuv189e50dksldlosr676q0v.apps.googleusercontent.com',
  
  // OAuth2 configuration
  GOOGLE_SCOPES: ['profile', 'email'],
  
  // API endpoints (optional - for backend communication)
  BACKEND_URL: 'http://localhost:8000',  // Change to your backend URL
  AUTH_ENDPOINT: '/api/auth/google'
};
