# What's Happening Around Me? 🌍

"What's Happening Around Me?" is a simple, fast application designed to explain local environmental conditions, simulate future climate impacts, and provide immersive conversational guidance using AI. 

Instead of overwhelming users with complex charts, raw data, or confusing scientific jargon, this app translates real-time environmental metrics into relatable analogies that anyone can understand. It also harnesses AI modeling to realistically project future trajectories.

## 📸 Screenshots

*(Note: Add your actual screenshots to a `/public/screenshots` folder to display them here!)*

<div align="center">
  <img src="./public/screenshots/current-focus.png" alt="Current Focus View" width="400" />
  <img src="./public/screenshots/future-simulator.png" alt="Future Simulator View" width="400" />
  <img src="./public/screenshots/eco-assistant.png" alt="Eco Assistant Chat View" width="400" />
</div>

---

## 🚀 Key Features

### 1. 🌍 Current Focus (Real-time Explainer)
- **Hyper-Local Data**: Enter your location (e.g., "New York", "Tokyo") and pull real-time data including Temperature, AQI, Humidity, and Wind Speed.
- **Relatable Analogies**: The app uses AI to generate conversational summaries. Instead of just "AQI 165", it might say: *"That's like breathing smoke from a campfire all day."*

### 2. 🔮 Future Simulator (Impact Visualization)
- **Time Travel**: Enter your Current Age, future target Age, and City.
- **Trajectory Mapping**: Slide the "World Trajectory Twist" to choose between a Cleaner Future or an extreme +2°C World.
- **Immersive Projections**: Generates numerical metrics and a 3-sentence immersive story of what your physical daily life will feel like in that exact future year.

### 3. 💬 Eco-Assistant (AI Chatbot)
- **Context-Aware Chat**: Switch to the dedicated sidebar chatbot that instantly answers questions about climate science, environmental metrics, and weather patterns.
- **Follow-Up Capabilities**: It retains chat history, allowing you to have extended, natural conversations with your personal Eco-Assistant.

---

## 🛠️ Tech Stack
- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** TypeScript / React
- **AI Integration:** [OpenAI (gpt-4o-mini)](https://openai.com/)
- **Data APIs:** OpenWeatherMap, AQICN (or similar environmental APIs)

---

## 💻 Getting Started

Follow these steps to clone the repository and run the project locally.

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm or yarn
- **API Keys**: You will need an active API key from OpenAI and your weather/environmental data provider.

### Installation & Local Development

**1. Clone the repository**
```bash
git clone https://github.com/AryanSingh103/Whats-Happening-Around-Me.git
```

**2. Navigate into the directory**
```bash
cd environment-prototype
```

**3. Install dependencies**
```bash
npm install
# or
yarn install
```

**4. Set up Environment Variables**
Create a new file named `.env.local` in the root of your project:
```bash
touch .env.local
```
Then, add your API keys inside `.env.local` exactly like this:
```env
OPENAI_API_KEY="your_openai_api_key_here"
# Add any other required weather keys here (e.g., OPENWEATHER_API_KEY)
```

**5. Start the Development Server**
```bash
npm run dev
# or
yarn dev
```

**6. View the App**
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) (or whichever port Next.js specifies in your terminal).

---

## 📜 License
This project is for educational and prototyping purposes. Feel free to clone, edit, and experiment!
