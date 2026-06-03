# Google OAuth2 Login - Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### 1. Get Google OAuth Client ID
1. Go to https://console.cloud.google.com/
2. Create new project or use existing one
3. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
4. Select "Web application"
5. Add URLs:
   - Authorized JavaScript origins: `http://localhost:4200`
   - Authorized redirect URIs: `http://localhost:4200/login`
6. Copy your Client ID

### 2. Configure Client ID
Open `src/app/config/oauth.config.ts` and replace:
```typescript
GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com'
```

### 3. Run Application
```bash
cd Frontendv1
npm install  # if needed
npm start
```

### 4. Test Login
- Navigate to http://localhost:4200
- Click "Login" button
- Sign in with Google account
- You should see your profile in the header!

---

## 🎯 What Was Implemented

### Files Created:
- ✅ `src/app/config/oauth.config.ts` - OAuth configuration
- ✅ `src/app/services/auth.service.ts` - Auth state management
- ✅ `src/app/services/auth.guard.ts` - Route protection
- ✅ `src/app/services/auth.interceptor.ts` - Auto token injection
- ✅ `src/app/pages/login/login.component.ts` - Login page

### Files Modified:
- ✅ `package.json` - Added @react-oauth/google
- ✅ `src/index.html` - Added Google OAuth script
- ✅ `src/main.ts` - Added auth interceptor provider
- ✅ `src/app/app.component.ts` - Added login/logout UI
- ✅ `src/app/app.component.css` - Added auth styling
- ✅ `src/app/app.routes.ts` - Added login route

---

## 🚀 Features

✅ **Google Sign-In Button** - Beautiful, responsive login interface
✅ **User Profile Display** - Shows user name and avatar in header
✅ **Logout Functionality** - Clear session and redirect home
✅ **Token Management** - Automatically stores and retrieves tokens
✅ **API Integration** - Auth interceptor adds token to all requests
✅ **Session Persistence** - Login state survives page refresh
✅ **Responsive Design** - Works on mobile and desktop
✅ **Error Handling** - Graceful handling of auth failures

---

## 🔒 Authentication Flow

```
1. User clicks "Login" button
   ↓
2. Navigates to login page (/login)
   ↓
3. Google Sign-In button displays
   ↓
4. User clicks Google button
   ↓
5. Google OAuth dialog appears
   ↓
6. User authenticates with Google
   ↓
7. Google returns JWT token
   ↓
8. Auth service stores token and user info
   ↓
9. Redirects to home page
   ↓
10. Header shows user profile with logout button
```

---

## 📋 Usage Examples

### In Components - Check if User is Logged In
```typescript
import { AuthService } from './services/auth.service';

export class MyComponent {
  isAuthenticated$ = this.authService.isAuthenticated$;
  currentUser$ = this.authService.currentUser$;

  constructor(private authService: AuthService) {}
}
```

In Template:
```html
<div *ngIf="isAuthenticated$ | async as isAuth">
  <p *ngIf="isAuth">Welcome {{ (currentUser$ | async)?.name }}!</p>
  <button (click)="logout()">Logout</button>
</div>
```

### Get Current User in Component
```typescript
const user = this.authService.getCurrentUser();
console.log(user?.email, user?.name, user?.picture);
```

### Check Authentication Status
```typescript
if (this.authService.isAuthenticated()) {
  // User is logged in
} else {
  // User is not logged in
}
```

### Protecting Routes
Routes are automatically protected if you add the guard:
```typescript
{ 
  path: 'protected-route', 
  component: ProtectedComponent,
  canActivate: [AuthGuard]
}
```

---

## 🔄 Extend for Backend

### 1. Create Backend Endpoint
```
POST /api/auth/google
Body: { token: "google_jwt_token" }
Response: { token: "your_auth_token", user: {...} }
```

### 2. Update Auth Service
In `src/app/services/auth.service.ts`, update the `login()` method:
```typescript
login(response: any): void {
  this.http.post('/api/auth/google', { token: response.credential })
    .subscribe({
      next: (res: any) => {
        const user: AuthUser = { ...res.user, accessToken: res.token };
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    });
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Google button not showing | Check Client ID in `oauth.config.ts` |
| "Redirect URI mismatch" | Add URL to Google Console → Credentials |
| Token not saved | Check localStorage is not disabled |
| Logout not working | Clear localStorage manually in DevTools |
| 401 errors on API calls | Verify token in Authorization header |

---

## 📱 Mobile Support

✅ Login page is fully responsive
✅ Works on iPhone, Android, tablets
✅ Touch-friendly buttons and interface

---

## 🔐 Security Checklist

- [ ] Use HTTPS in production
- [ ] Keep Client ID in environment variables
- [ ] Validate tokens on backend
- [ ] Implement token refresh logic
- [ ] Add CORS headers on backend
- [ ] Never expose Client Secret
- [ ] Use httpOnly cookies for tokens (optional)

---

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Angular Security Best Practices](https://angular.io/guide/security)
- See `OAUTH2_SETUP_GUIDE.md` for detailed instructions

---

## ❓ Need Help?

1. Check browser console for errors (`F12` → Console)
2. Review `OAUTH2_SETUP_GUIDE.md` for detailed steps
3. Verify Client ID matches between Google Console and app
4. Test with different browser (clear cache first)

---

**Implementation Date**: June 3, 2026  
**Status**: ✅ Ready to Use
