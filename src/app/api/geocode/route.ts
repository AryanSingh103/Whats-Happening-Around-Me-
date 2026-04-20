import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  const OPENWEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

  if (!OPENWEATHER_API_KEY) {
    // Return dummy data if API keys are not set, so the UI still works
    return NextResponse.json({ city: 'Dummy City (API Key missing)' });
  }

  try {
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!geoRes.ok) {
      throw new Error('Failed to fetch geocoding data.');
    }
    
    const geoData = await geoRes.json();
    
    if (geoData && geoData.length > 0) {
      return NextResponse.json({ city: geoData[0].name });
    } else {
      throw new Error('Could not determine city from coordinates.');
    }
  } catch (error: any) {
    console.error('Geocode API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch geocode data' }, { status: 500 });
  }
}
