# Mapbox Search Box API Setup

This project now uses **Mapbox Search Box API** for location autocomplete, which provides a Google Places API-like experience with excellent search quality.

## 🔑 Getting Your API Key

1. **Sign up for Mapbox**: Go to [mapbox.com](https://www.mapbox.com) and create a free account
2. **Get your access token**: 
   - Go to your [Account page](https://account.mapbox.com/)
   - Copy your "Default public token" or create a new one
   - The token starts with `pk.`

## 🌟 Free Tier Benefits

- **500 sessions/month** free (preview pricing until Q4 2025)
- Each session includes up to 50 autocomplete suggestions + 1 coordinate retrieval
- After free tier: $3.00 per 1,000 sessions (much cheaper than Google Places)
- No daily rate limits or complex API key restrictions

## ⚙️ Setup

1. **Add your token to environment variables**:
   ```bash
   # In your .env.local file
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here
   ```

2. **Restart your development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## ✨ Features You Get

- **Google-like autocomplete** with real-time suggestions
- **POI search** (restaurants, coffee shops, gas stations, etc.)
- **Smart categorization** with visual icons
- **Distance indicators** when location permission is granted
- **Session-based billing** (cost-effective)
- **Global coverage** with high-quality data
- **Routable points** optimized for navigation

## 🔄 Migration Benefits

Compared to the previous Nominatim (OpenStreetMap) implementation:

- ✅ **Much faster response times** (300ms vs 1000ms debounce)
- ✅ **Better search quality** with fuzzy matching
- ✅ **POI support** with categories and icons
- ✅ **Session management** for cost optimization
- ✅ **Enterprise-grade reliability**
- ✅ **Real-time data updates**

## 🛠️ Technical Details

- Uses Mapbox Search Box API `/suggest` and `/retrieve` endpoints
- Implements session tokens for proper billing
- Automatic fallback to mock data if API is unavailable
- Client-side only to avoid SSR issues
- TypeScript support with enhanced interfaces

## 💰 Cost Comparison

| Provider | Free Tier | Cost After Free |
|----------|-----------|-----------------|
| **Mapbox Search Box** | 500 sessions/month | $3.00/1K sessions |
| Google Places API | $200 credit (~28K requests) | $17.00/1K sessions |
| HERE API | 250K requests/month | $0.50/1K requests |
| LocationIQ | 5K requests/day | $0.50/1K requests |

## 🚀 Next Steps

With Mapbox Search Box API set up, your location search is now:
- More responsive and accurate
- Cost-effective for scaling
- Feature-rich with POI data
- Ready for production use

The autocomplete experience should now feel similar to Google Maps search! 