# News Verification Frontend (Web)

React web front-end for the News Verification Platform, with Tailwind CSS, WebSocket real-time updates, dark mode, global news, and country-wise news.

## Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   - Access at `http://localhost:5173`.
3. **Run Tests**:
   ```bash
   npm test
   ```
4. **Build for Production**:
   ```bash
   npm run build
   ```

## Features
- **Login**: Authenticate as contributor or editor.
- **Evidence**: Upload evidence with location and confidence, verified via SHA256 hash and C2PA signature.
- **Claims**: Extract claims from text (editor only).
- **Stories**: Filter stories by region, topic, or verification level.
- **Global News**: View verified (`confirmed`) stories from all regions at `/global-news`.
- **Country-Wise News**: Select a country to view verified stories at `/country-news`.
- **Real-Time Updates**: WebSocket notifications for new evidence and story updates.
- **Dark Mode**: Toggle between light and dark themes.

## Notes
- Backend must be running at `http://localhost:8000` with WebSocket at `ws://localhost:8000/ws` (update `API_URL` in `src/api/api.js` for production).
- Ensure AWS S3 bucket is set up in the backend `.env`.
- Requires Leaflet CSS (`leaflet/dist/leaflet.css`) for maps.
- Country list provided by `country-list` package.
- Tested with Chrome, Firefox, and Safari.

## Deployment
### Vercel
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Deploy:
   ```bash
   vercel
   ```
3. Set environment variables in Vercel dashboard (e.g., `API_URL`).

### Netlify
1. Build:
   ```bash
   npm run build
   ```
2. Deploy `dist/` folder via Netlify dashboard or CLI:
   ```bash
   netlify deploy --prod
   ```
3. Set environment variables in Netlify dashboard.