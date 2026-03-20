# UBI UNL POC - Frontend

Static HTML/CSS/JS single-page application for the UBI UNL POC project.

## Project Structure

```
frontend/
├── index.html    # Main HTML with password modal + trigger sections
├── styles.css    # Dark theme styling
├── app.js        # Frontend logic, API calls, toast notifications
└── README.md     # This file
```

## Configuration

Before deploying, update `app.js` with your Render backend URL:

```javascript
const BACKEND_URL = "https://ubi-unl-poc.onrender.com";
```

## Password Protection

The application is protected by a client-side password. To set your password:

1. Choose a password
2. Generate its SHA-256 hash:
   ```javascript
   // Run in browser console:
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-password'))
     .then(h => console.log(Array.from(new Uint8Array(h))
       .map(b => b.toString(16).padStart(2, '0')).join('')))
   ```
3. Update `FRONTEND_PASSWORD_HASH` in `app.js` with the generated hash

**Note**: Client-side password protection is not secure against determined attackers. This is basic access control only.

## Deployment to GitHub Pages

1. Create a new GitHub repository
2. Push the `frontend` folder contents to the `main` branch (or a `gh-pages` branch)
3. Go to Repository Settings → Pages
4. Select the branch to deploy
5. Your app will be available at `https://username.github.io/repo-name/`

## Usage

### Page Change
1. Enter comma-separated label codes (e.g., `04507B0AC391,04507B0AC392`)
2. Enter the page number
3. Click "Execute Page Change"

### LED Blink
1. Enter comma-separated label codes (e.g., `04507B0AC391,04507B0AC392`)
2. Select a color from the dropdown
3. Select a duration from the dropdown
4. Click "Execute LED Blink"

Toast notifications will show success or failure status with descriptive messages.
