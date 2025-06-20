# Gemini AI Integration Setup

This project uses Google's Gemini AI to provide intelligent venue recommendations based on user locations and selected activities.

## Prerequisites

1. Google account
2. Access to Google AI Studio (formerly MakerSuite)

## Setup Instructions

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Choose "Create API key in new project" or select an existing project
5. Copy your API key

### 2. Environment Configuration

Create a `.env.local` file in your project root and add your API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Important:** 
- Never commit your API key to version control
- The `.env.local` file should already be in your `.gitignore`
- You can also use `NEXT_PUBLIC_GEMINI_API_KEY` for client-side usage

### 3. API Key Security

For production deployments:
- Use environment variables in your hosting platform
- Consider using server-side API calls for better security
- Monitor your API usage in Google AI Studio

## Features

The Gemini AI integration provides:

### Intelligent Venue Recommendations
- **Context-aware suggestions**: Takes into account both users' locations
- **Activity-based filtering**: Matches venues to selected activities
- **Real venue data**: Returns actual places with accurate coordinates
- **Distance calculations**: Shows distances from both users
- **Ratings and reviews**: Includes venue ratings when available
- **Google Maps integration**: Direct links to venues in Google Maps

### Smart Search Parameters
- **Geographic targeting**: Searches around the calculated midpoint
- **Radius control**: Configurable search radius (default 10km)
- **Activity matching**: Filters by selected activities (dining, entertainment, outdoor, etc.)
- **Accessibility**: Considers accessibility for both users

### Fallback System
- **Graceful degradation**: Falls back to mock data if API fails
- **Error handling**: Comprehensive error logging and user feedback
- **Offline capability**: Works even without internet connection

## API Response Format

Gemini returns venue data in this format:

```json
[
  {
    "name": "Venue Name",
    "address": "Full street address",
    "coordinates": {
      "lat": 40.1234,
      "lng": -74.5678
    },
    "rating": 4.5,
    "type": "dining|entertainment|outdoor|cultural|shopping|nightlife|sports|wellness",
    "description": "Brief description of the venue",
    "googleMapsLink": "https://maps.google.com/?q=latitude,longitude"
  }
]
```

## Usage Limits

Gemini AI has usage limits:
- **Free tier**: 15 requests per minute
- **Rate limiting**: Built-in request throttling
- **Quota monitoring**: Check usage in Google AI Studio

## Troubleshooting

### API Key Issues
```
Error: API key not valid
```
- Verify your API key is correct
- Ensure the API key has proper permissions
- Check that Gemini API is enabled for your project

### Rate Limiting
```
Error: Quota exceeded
```
- Wait before making more requests
- Consider implementing request caching
- Upgrade to paid tier if needed

### Invalid Responses
```
Error: Invalid JSON response
```
- Check your internet connection
- Verify the prompt format
- Review API status at [Google AI Studio](https://makersuite.google.com)

### Fallback Mode
If you see venues like "Central Park Cafe" or "Art Gallery Downtown", the app is running in fallback mode:
- Check your API key configuration
- Verify internet connectivity
- Review browser console for error messages

## Development Tips

1. **Test with different locations**: Try various cities to see how recommendations change
2. **Activity combinations**: Test different activity combinations for better results
3. **Monitor API calls**: Check the browser console for API request logs
4. **Cache responses**: Consider implementing caching for repeated requests

## Support

For issues with:
- **Gemini API**: Visit [Google AI Studio Support](https://ai.google.dev/docs)
- **This integration**: Check the browser console for detailed error messages
- **Venue data quality**: The AI learns from feedback, so results improve over time

## Privacy & Data

- **No personal data storage**: Venue searches are ephemeral
- **Location privacy**: Only coordinates are sent to Gemini
- **No user tracking**: No personal information is collected or stored
- **GDPR compliance**: All processing is temporary and location-based only 