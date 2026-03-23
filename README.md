# What's Happening Around Me? 🌍

A simple, fast, single-page Next.js application that explains local environmental conditions in engaging, youth-friendly language using AI.

## Features
- **Simple UI**: Just enter your location and pick a concern (Air Pollution, Heat Wave, etc.)
- **Real-Time Data**: Fetches actual temperature, humidity, wind, and AQI.
- **AI Explanations**: Uses OpenAI to translate hard data into conversational, relatable analogies.

## Tech Stack
- Frontend & Backend: [Next.js 16](https://nextjs.org/) (App Directory)
- Styling: [Tailwind CSS v4](https://tailwindcss.com/)
- API Routes: Next.js API Handlers
- Fonts: Google Inter (via `next/font`)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Open `.env.local` and add your API keys:
   ```env
   OPENWEATHERMAP_API_KEY=your_key_here
   WAQI_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   ```
   *Note: If you don't add keys immediately, the app will fall back to dummy data so you can still test the UI.*

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Providers

1. **OpenWeatherMap**: Used for temperature, wind, and general weather descriptions. Get a free key at [openweathermap.org](https://openweathermap.org/api).
2. **World Air Quality Project (WAQI)**: Used for AQI data. Get a free token at [aqicn.org/data-platform/token/](https://aqicn.org/data-platform/token/).
3. **OpenAI**: Used to generate the youth-friendly explanations (uses `gpt-4o-mini`). Get a key at [platform.openai.com](https://platform.openai.com/).
