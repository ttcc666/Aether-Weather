import { WeatherData, HourlyForecast, DailyForecast } from "../types";

// Open-Meteo is a free API that requires no key.
const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

// Fallback data for major cities in case Geocoding API fails or returns no results
const FALLBACK_LOCATIONS: Record<string, { lat: number; lon: number; name: string; country: string }> = {
  'tokyo': { lat: 35.6895, lon: 139.6917, name: 'Tokyo', country: 'Japan' },
  'new york': { lat: 40.7128, lon: -74.0060, name: 'New York', country: 'USA' },
  'london': { lat: 51.5074, lon: -0.1278, name: 'London', country: 'United Kingdom' },
  'paris': { lat: 48.8566, lon: 2.3522, name: 'Paris', country: 'France' },
  'berlin': { lat: 52.5200, lon: 13.4050, name: 'Berlin', country: 'Germany' },
  'sydney': { lat: -33.8688, lon: 151.2093, name: 'Sydney', country: 'Australia' },
  'moscow': { lat: 55.7558, lon: 37.6173, name: 'Moscow', country: 'Russia' },
  'dubai': { lat: 25.2048, lon: 55.2708, name: 'Dubai', country: 'UAE' },
  'singapore': { lat: 1.3521, lon: 103.8198, name: 'Singapore', country: 'Singapore' },
};

function getConditionFromCode(code: number): string {
  if (code === 0) return 'Clear';
  if (code === 1 || code === 2 || code === 3) return 'Cloudy';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Rainy';
  if (code >= 80 && code <= 82) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 85 && code <= 86) return 'Snowy';
  if (code >= 95 && code <= 99) return 'Stormy';
  return 'Clear';
}

function getDescriptionFromCode(code: number, isDay: number): string {
  const timeOfDay = isDay ? "day" : "night";
  
  switch(code) {
    case 0: return isDay ? "Sunlight floods the horizon." : "Starlight fills the clear void.";
    case 1: return "Mainly clear, a serene atmosphere.";
    case 2: return "Clouds drift lazily across the sky.";
    case 3: return "A blanket of clouds covers the world.";
    case 45: return "Mist curls around the streets.";
    case 48: return "A rime fog settles quietly.";
    case 51: case 53: case 55: return "A soft drizzle whispers against the window.";
    case 61: case 63: case 65: return "Rain washes the city streets clean.";
    case 71: case 73: case 75: return "Snowflakes descend in a silent dance.";
    case 95: return "Thunder rumbles in the distance.";
    default: return "The weather is changing.";
  }
}

export const fetchWeatherData = async (locationInput: string): Promise<WeatherData> => {
  try {
    let latitude: number;
    let longitude: number;
    let name: string;
    let country: string;

    // 1. Geocoding: Try API first, fall back to hardcoded list
    try {
      const geoRes = await fetch(`${GEOCODING_API}?name=${encodeURIComponent(locationInput)}&count=1&language=en&format=json`);
      if (!geoRes.ok) throw new Error("Geocoding API error");
      
      const geoData = await geoRes.json();

      if (geoData.results && geoData.results.length > 0) {
        latitude = geoData.results[0].latitude;
        longitude = geoData.results[0].longitude;
        name = geoData.results[0].name;
        country = geoData.results[0].country;
      } else {
        throw new Error("No results from API");
      }
    } catch (e) {
      // Check fallback list
      const lowerLoc = locationInput.toLowerCase();
      const fallback = FALLBACK_LOCATIONS[lowerLoc];
      if (fallback) {
        latitude = fallback.lat;
        longitude = fallback.lon;
        name = fallback.name;
        country = fallback.country;
      } else {
        throw new Error("Location not found");
      }
    }

    // 2. Weather Data: Get Forecast
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
      hourly: 'temperature_2m,weather_code,visibility',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone: 'auto'
    });

    const weatherRes = await fetch(`${WEATHER_API}?${params.toString()}`);
    if (!weatherRes.ok) {
        throw new Error("Weather API error");
    }
    
    const weatherData = await weatherRes.json();

    // Validate data structure
    if (!weatherData.current || !weatherData.hourly || !weatherData.daily) {
        throw new Error("Incomplete weather data");
    }

    // 3. Transform Data
    const current = weatherData.current;
    const daily = weatherData.daily;
    const hourly = weatherData.hourly;

    // Map Hourly (Next 12h) using current API time as anchor
    const hourlyForecast: HourlyForecast[] = [];
    
    // Handle time matching carefully
    let startIndex = 0;
    if (current.time && hourly.time) {
        const currentIsoHour = current.time.slice(0, 13); // "YYYY-MM-DDTHH"
        const foundIndex = hourly.time.findIndex((t: string) => t.startsWith(currentIsoHour));
        if (foundIndex !== -1) {
            startIndex = foundIndex;
        }
    }

    for (let i = 0; i < 12; i++) {
        const index = startIndex + i;
        if (index < hourly.time.length) {
            const date = new Date(hourly.time[index]);
            hourlyForecast.push({
                time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
                temperature: Math.round(hourly.temperature_2m[index]),
                condition: getConditionFromCode(hourly.weather_code[index])
            });
        }
    }

    // Map Daily (Next 7 days)
    const dailyForecast: DailyForecast[] = [];
    for (let i = 0; i < 7; i++) {
        if (i < daily.time.length) {
            const date = new Date(daily.time[i]); 
            // Adding T00:00 to ensure local date isn't shifted by timezone when only YYYY-MM-DD is parsed
            // Actually, Date(string) parsing depends on format. ISO YYYY-MM-DD is usually UTC.
            // To be safe, we just use the weekday name based on index relative to today.
            
            const dayName = new Date(daily.time[i] + "T12:00:00").toLocaleDateString('en-US', { weekday: 'long' });
            
            dailyForecast.push({
                day: i === 0 ? 'Today' : dayName,
                minTemp: Math.round(daily.temperature_2m_min[i]),
                maxTemp: Math.round(daily.temperature_2m_max[i]),
                condition: getConditionFromCode(daily.weather_code[i])
            });
        }
    }

    return {
      location: `${name}, ${country}`,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition: getConditionFromCode(current.weather_code),
      description: getDescriptionFromCode(current.weather_code, current.is_day),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      uvIndex: 5, // Open-Meteo UV is a separate endpoint, hardcoding for now or could fetch
      hourly: hourlyForecast,
      daily: dailyForecast
    };

  } catch (error) {
    console.error("Error fetching weather:", error);
    throw error;
  }
};
