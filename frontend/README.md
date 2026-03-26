# UBI UNL POC - Frontend

Static HTML/CSS/JS single-page application for the UBI UNL POC project.

## Project Structure

```
frontend/
├── index.html       # Main HTML with password modal + trigger sections
├── styles.css       # Dark theme styling
├── app.js          # Frontend logic, API calls, scenario execution, toast notifications
├── Scenarios.csv   # Predefined scenario data (loaded by scenarios)
└── README.md       # This file
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

### Page Change (Manual)
1. Enter comma-separated label codes (e.g., `04507B0AC391,04507B0AC392`)
2. Enter the page number
3. Click "Execute Page Change"

### LED Blink (Manual)
1. Enter comma-separated label codes (e.g., `04507B0AC391,04507B0AC392`)
2. Select a color from the dropdown
3. Select a duration from the dropdown
4. Click "Execute LED Blink"

### Scenarios (Automated)
Four scenario buttons automate sequences of page changes and LED blinks based on `Scenarios.csv`:

| Scenario | Page Actions | LED Actions |
|----------|-------------|-------------|
| 1 | All labels → page 1 | None |
| 2 | Some labels → page 1, Some → page 2 | None |
| 3 | All labels → page 1 | Some → RED, Some → GREEN |
| 4 | Some labels → page 1, Some → page 2 | Some → RED, Some → GREEN |

**Execution order**: Pages execute in ascending order (page 1, then page 2), followed by RED LEDs, then GREEN LEDs.

#### Custom CSV Upload
You can upload a custom CSV file to override the default `Scenarios.csv` for the current session:

1. Click "Load Custom CSV" and select a `.csv` file
2. The custom file will be used for all scenario buttons
3. Refreshing the page clears the custom data (reverts to default CSV)

The custom CSV must have the same format as `Scenarios.csv`.

### Scenarios CSV Format

| Column | Description |
|--------|-------------|
| LabelCode | The label identifier |
| Scenario1_page | Page number for Scenario 1 |
| Scenario1_led | LED color for Scenario 1 (RED/GREEN/blank) |
| Scenario2_page | Page number for Scenario 2 |
| Scenario2_led | LED color for Scenario 2 (RED/GREEN/blank) |
| Scenario3_page | Page number for Scenario 3 |
| Scenario3_led | LED color for Scenario 3 (RED/GREEN/blank) |
| Scenario4_page | Page number for Scenario 4 |
| Scenario4_led | LED color for Scenario 4 (RED/GREEN/blank) |

Toast notifications will show success or failure status with descriptive messages.
