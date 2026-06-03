# Google OAuth2 Setup Checklist

Complete the following steps to enable Google OAuth2 login in your application.

## Phase 1: Google Cloud Console Setup ⚙️

### Step 1: Create Google Cloud Project
- [ ] Open https://console.cloud.google.com/
- [ ] Click project dropdown
- [ ] Click "NEW PROJECT"
- [ ] Enter project name: "MCQ Exam Preparer"
- [ ] Click "CREATE"
- [ ] Wait for project creation (~1-2 minutes)

### Step 2: Set Up OAuth Consent Screen
- [ ] Search for "OAuth consent screen"
- [ ] Click "OAuth consent screen"
- [ ] Select "External" user type
- [ ] Click "CREATE"
- [ ] Fill in app information:
  - [ ] App name: MCQ Exam Preparer
  - [ ] User support email: (your email)
  - [ ] Developer contact information: (your email)
- [ ] Click "SAVE AND CONTINUE"
- [ ] Skip scopes (click "SAVE AND CONTINUE")
- [ ] Skip test users (click "SAVE AND CONTINUE")
- [ ] Click "BACK TO DASHBOARD"

### Step 3: Create OAuth2 Credentials
- [ ] Click "Credentials" in left sidebar
- [ ] Click "CREATE CREDENTIALS"
- [ ] Select "OAuth client ID"
- [ ] Select "Web application"
- [ ] Enter name: "MCQ Preparer Web Client"
- [ ] Add Authorized JavaScript Origins:
  - [ ] `http://localhost:4200`
  - [ ] `http://localhost:3000` (optional)
  - [ ] `https://yourdomain.com` (replace with your domain)
  - [ ] `https://www.yourdomain.com` (if different)
- [ ] Add Authorized Redirect URIs:
  - [ ] `http://localhost:4200/login`
  - [ ] `http://localhost:3000/login` (optional)
  - [ ] `https://yourdomain.com/login`
  - [ ] `https://www.yourdomain.com/login`
- [ ] Click "CREATE"
- [ ] **COPY YOUR CLIENT ID** ← IMPORTANT!
- [ ] Close the dialog

## Phase 2: Application Configuration 🔧

### Step 4: Update OAuth Config File
- [ ] Open `Frontendv1/src/app/config/oauth.config.ts`
- [ ] Find line: `GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID_HERE...'`
- [ ] Replace with your actual Client ID from Step 3
- [ ] Save the file

### Step 5: Verify Dependencies
- [ ] Check if `@react-oauth/google` is in `Frontendv1/package.json`
  - [ ] If yes, continue to Step 6
  - [ ] If no, run `npm install @react-oauth/google`

### Step 6: Backend URL Configuration (Optional)
- [ ] If you have a backend API:
  - [ ] Update `BACKEND_URL` in `oauth.config.ts`
  - [ ] Update `AUTH_ENDPOINT` if different
- [ ] If no backend, leave as is (default will be used)

## Phase 3: Application Testing 🚀

### Step 7: Install Dependencies
- [ ] Open terminal in `Frontendv1` directory
- [ ] Run: `npm install`
- [ ] Wait for installation to complete
- [ ] Check for any errors in output

### Step 8: Start Application
- [ ] Run: `npm start`
- [ ] Wait for application to compile
- [ ] Open browser to `http://localhost:4200`
- [ ] Check that no errors appear in console (F12)

### Step 9: Test Login UI
- [ ] Look for "Login" button in top right header
- [ ] Click the "Login" button
- [ ] Verify you're redirected to `/login` route
- [ ] Check that Google Sign-In button is visible
- [ ] Google button should say "Sign in with Google"

### Step 10: Test OAuth Flow
- [ ] Click "Sign in with Google" button
- [ ] Select a Google account or login
- [ ] Verify you're redirected back to home page
- [ ] Check that your profile appears in header:
  - [ ] Your Google profile picture is visible
  - [ ] Your name is displayed
  - [ ] Logout button appears (three dots or icon)

### Step 11: Test Session Persistence
- [ ] Refresh the page (F5)
- [ ] Verify you're still logged in
- [ ] Profile should still show in header
- [ ] No login page should appear

### Step 12: Test Logout
- [ ] Click logout button in header
- [ ] Verify you're redirected to home page
- [ ] Verify "Login" button reappears
- [ ] Verify localStorage is cleared (open DevTools → Application → Storage)

### Step 13: Browser Console Check
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Look for any red error messages
- [ ] If errors exist:
  - [ ] Check Client ID is correct
  - [ ] Check internet connection
  - [ ] Check for CORS issues (green warnings okay)

## Phase 4: API Integration (Optional) 🔌

### Step 14: Backend Implementation
- [ ] Create `/api/auth/google` endpoint in backend
- [ ] Endpoint should:
  - [ ] Receive Google JWT token
  - [ ] Verify token with Google
  - [ ] Create/update user in database
  - [ ] Return your own auth token
- [ ] Test endpoint manually with Postman

### Step 15: Update Auth Service
- [ ] Update `src/app/services/auth.service.ts`
- [ ] Modify `login()` method to call your backend endpoint
- [ ] Test OAuth flow again with backend integration

## Phase 5: Production Deployment 🌍

### Step 16: Add Production Domain
- [ ] Go to Google Cloud Console → Credentials
- [ ] Edit your OAuth Client ID
- [ ] Add your production domain:
  - [ ] `https://yourdomain.com`
  - [ ] `https://yourdomain.com/login`
- [ ] Click "SAVE"

### Step 17: Update Configuration for Production
- [ ] Update `oauth.config.ts` for production:
  - [ ] Verify `GOOGLE_CLIENT_ID` is production ID
  - [ ] Update `BACKEND_URL` to production URL
  - [ ] Remove localhost URLs if appropriate

### Step 18: Build for Production
- [ ] Run: `npm run build`
- [ ] Verify build completes without errors
- [ ] Check `dist/` folder is created

### Step 19: Deploy Application
- [ ] Deploy to your hosting platform
- [ ] Test login on production domain
- [ ] Verify all URLs work correctly

## Phase 6: Monitoring & Maintenance 📊

### Step 20: Monitor Login Usage
- [ ] Set up Google Analytics for login events
- [ ] Monitor failed login attempts
- [ ] Track user adoption

### Step 21: Security Review
- [ ] [ ] Verify HTTPS is enforced
- [ ] [ ] Check Client Secret is not exposed
- [ ] [ ] Review localStorage security
- [ ] [ ] Enable CORS only for your domains
- [ ] [ ] Implement token refresh if needed

### Step 22: Documentation
- [ ] [ ] Document your OAuth setup
- [ ] [ ] Create runbook for team
- [ ] [ ] Document any custom changes
- [ ] [ ] Share documentation with team

## Troubleshooting Guide 🔧

### Issue: "Redirect URI mismatch"
**Status**: [ ] Not encountered [ ] Encountered [ ] Fixed
- [ ] Go to Google Cloud Console → Credentials
- [ ] Click your OAuth Client ID
- [ ] Add the exact URL showing in error to "Authorized redirect URIs"

### Issue: "Client ID not found" or Google button not displaying
**Status**: [ ] Not encountered [ ] Encountered [ ] Fixed
- [ ] Verify Client ID is correct in `oauth.config.ts`
- [ ] Check that value includes entire Client ID (ending in `.apps.googleusercontent.com`)
- [ ] Clear browser cache and restart

### Issue: Login works but token doesn't persist
**Status**: [ ] Not encountered [ ] Encountered [ ] Fixed
- [ ] Check localStorage is enabled (Privacy settings)
- [ ] Not in private/incognito mode
- [ ] Browser allows localStorage for the domain

### Issue: CORS errors on backend calls
**Status**: [ ] Not encountered [ ] Encountered [ ] Fixed
- [ ] Add frontend URL to CORS whitelist on backend
- [ ] Verify backend endpoint exists
- [ ] Check Authorization header is being sent

## Completion Criteria ✅

You can consider the OAuth2 implementation complete when:

- [ ] Users can click "Login" button
- [ ] Google Sign-In dialog appears
- [ ] Users can authenticate with Google
- [ ] User profile displays in header after login
- [ ] Users can logout
- [ ] Login state persists after refresh
- [ ] No red errors in browser console
- [ ] Mobile view looks good
- [ ] Application works on production domain

## Final Sign-Off ✍️

- [ ] All steps completed
- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] Team trained on new feature
- [ ] Monitoring set up
- [ ] Ready for production

**Completion Date**: _______________  
**Completed By**: _______________  
**Reviewed By**: _______________

---

## Quick Reference

### Files to Know
- `Frontendv1/src/app/config/oauth.config.ts` - Client ID config
- `Frontendv1/src/app/services/auth.service.ts` - Auth logic
- `Frontendv1/src/app/pages/login/login.component.ts` - Login UI
- `Frontendv1/package.json` - Dependencies

### Important URLs
- Google Cloud Console: https://console.cloud.google.com/
- Application: http://localhost:4200
- Login Page: http://localhost:4200/login

### Key Commands
```bash
npm install          # Install dependencies
npm start           # Start dev server
npm run build       # Build for production
npm test            # Run tests
```

### Documentation Files
- `OAUTH2_QUICK_START.md` - 5-minute quick setup
- `OAUTH2_SETUP_GUIDE.md` - Detailed instructions
- `OAUTH2_IMPLEMENTATION_SUMMARY.md` - Full overview

---

**Last Updated**: June 3, 2026  
**Current Status**: ✅ Ready to Use
