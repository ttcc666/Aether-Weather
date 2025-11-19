export enum WeatherCondition {
  Sunny = 'Sunny',
  Cloudy = 'Cloudy',
  Rainy = 'Rainy',
  Stormy = 'Stormy',
  Snowy = 'Snowy',
  Foggy = 'Foggy',
  Clear = 'Clear'
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
}

export interface DailyForecast {
  day: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export interface AppState {
  loading: boolean;
  error: string | null;
  data: WeatherData | null;
  searchQuery: string;
}