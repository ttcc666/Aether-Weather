// This service is deprecated in favor of Open-Meteo in weatherService.ts.
// Keeping the file empty/commented to prevents build errors or runtime crashes 
// due to missing process.env in the browser environment.

export const fetchWeatherData = async (location: string): Promise<any> => {
  throw new Error("Gemini service is disabled. Use weatherService.ts instead.");
};
