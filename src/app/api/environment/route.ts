import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  if (!location) {
    return NextResponse.json({ error: 'Location is required' }, { status: 400 });
  }

  const OPENWEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
  const WAQI_API_KEY = process.env.WAQI_API_KEY;

  if (!OPENWEATHER_API_KEY || !WAQI_API_KEY) {
    // Return dummy data if API keys are not set, so the UI still works
    return NextResponse.json({
      temperature: 22,
      humidity: 45,
      windSpeed: 3.5,
      aqi: 65,
      aqiLabel: 'Moderate',
      description: 'clear sky',
      isDummy: true
    });
  }

  try {
    // 1. Get Coordinates & Weather from OpenWeatherMap
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!weatherRes.ok) {
      throw new Error('Failed to fetch weather data. Location might be invalid.');
    }
    
    const weatherData = await weatherRes.json();
    const { lat, lon } = weatherData.coord;

    // 2. Get AQI from World Air Quality Index
    const aqiRes = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_API_KEY}`
    );
    
    const aqiData = await aqiRes.json();
    const aqiValue = aqiData.status === 'ok' ? aqiData.data.aqi : 0;
    
    // Determine AQI label
    let aqiLabel = 'Good';
    if (aqiValue > 300) aqiLabel = 'Hazardous';
    else if (aqiValue > 200) aqiLabel = 'Very Unhealthy';
    else if (aqiValue > 150) aqiLabel = 'Unhealthy';
    else if (aqiValue > 100) aqiLabel = 'Unhealthy for Sensitive Groups';
    else if (aqiValue > 50) aqiLabel = 'Moderate';

    return NextResponse.json({
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      aqi: aqiValue,
      aqiLabel,
      description: weatherData.weather[0]?.description || 'unknown',
    });
    
  } catch (error: any) {
    console.error('Environment API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch environment data' }, { status: 500 });
  }
}
