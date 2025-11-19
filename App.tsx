import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Wind, Droplets, Sun as SunIcon, MapPin } from 'lucide-react';
import { fetchWeatherData } from './services/weatherService';
import { WeatherData } from './types';
import { WeatherIcon } from './components/WeatherIcon';
import { TrendChart } from './components/TrendChart';
import { GlassCard } from './components/GlassCard';

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [location, setLocation] = useState<string>('Tokyo'); // Default to a major city
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  // Background mapping based on condition
  const getBackgroundClass = (condition?: string) => {
    const c = condition?.toLowerCase() || '';
    if (c.includes('rain') || c.includes('drizzle')) return 'bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900';
    if (c.includes('cloud')) return 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-800';
    if (c.includes('fog')) return 'bg-gradient-to-br from-slate-600 via-gray-600 to-slate-800';
    if (c.includes('clear') || c.includes('sun')) return 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600';
    if (c.includes('snow')) return 'bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400';
    if (c.includes('storm')) return 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900';
    // Default
    return 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600';
  };

  const handleFetchWeather = useCallback(async (loc: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(loc);
      setWeather(data);
    } catch (err) {
      setError("Could not find that location. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    handleFetchWeather(location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(searchQuery);
      handleFetchWeather(searchQuery);
    }
  };

  // Memoized data conversion based on unit state
  const displayWeather = useMemo(() => {
    if (!weather) return null;

    const convert = (temp: number) => {
        if (unit === 'C') return temp;
        return Math.round((temp * 9) / 5 + 32);
    };

    return {
        ...weather,
        temperature: convert(weather.temperature),
        feelsLike: convert(weather.feelsLike),
        hourly: weather.hourly.map(h => ({ ...h, temperature: convert(h.temperature) })),
        daily: weather.daily.map(d => ({ ...d, minTemp: convert(d.minTemp), maxTemp: convert(d.maxTemp) }))
    };
  }, [weather, unit]);

  return (
    <div className={`min-h-screen text-white transition-all duration-1000 ease-in-out ${getBackgroundClass(weather?.condition)} selection:bg-white/30 font-light`}>
      <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen flex flex-col">
        
        {/* Header - Separated Components */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 md:gap-8">
          
          {/* 1. Logo */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-center md:justify-start flex-shrink-0">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg">
                <SunIcon size={20} className="text-white animate-spin-slow" />
             </div>
             <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Aether Weather</span>
          </div>

          {/* 2. Search Input - Center on Desktop, separated from Toggle */}
          <div className="w-full md:flex-1 md:max-w-md">
            <form onSubmit={handleSearch} className="relative group w-full h-11 flex items-center">
                <input 
                type="text" 
                placeholder="Search city..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full bg-white/10 border border-white/20 rounded-full pl-11 pr-4 outline-none focus:bg-white/20 transition-all placeholder-white/50 backdrop-blur-md text-sm shadow-sm focus:shadow-lg leading-normal"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4 pointer-events-none" />
            </form>
          </div>

          {/* 3. Unit Toggle - Right on Desktop, separated from Search */}
          <div className="flex items-center justify-center md:justify-end w-full md:w-auto flex-shrink-0">
            <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/20 backdrop-blur-md h-11">
                <button
                    onClick={() => setUnit('C')}
                    className={`h-full px-5 rounded-full text-sm font-medium transition-all duration-300 flex items-center justify-center ${unit === 'C' ? 'bg-white text-blue-900 shadow-md' : 'text-white/70 hover:text-white'}`}
                >
                    °C
                </button>
                <button
                    onClick={() => setUnit('F')}
                    className={`h-full px-5 rounded-full text-sm font-medium transition-all duration-300 flex items-center justify-center ${unit === 'F' ? 'bg-white text-blue-900 shadow-md' : 'text-white/70 hover:text-white'}`}
                >
                    °F
                </button>
            </div>
          </div>

        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col lg:flex-row gap-6 relative">
          
          {loading ? (
            <div className="flex-grow flex items-center justify-center h-[60vh]">
              <div className="flex flex-col items-center">
                 <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-white rounded-full animate-spin"></div>
                 </div>
                 <p className="text-white/60 font-light tracking-widest uppercase text-xs animate-pulse">Loading Forecast</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-grow flex items-center justify-center text-center h-[60vh]">
                <GlassCard className="max-w-md">
                    <h2 className="text-2xl font-bold mb-2">Location Not Found</h2>
                    <p className="text-white/70 mb-6">{error}</p>
                    <button onClick={() => handleFetchWeather('Tokyo')} className="px-6 py-2 bg-white/20 rounded-full hover:bg-white/30 transition text-sm font-medium">Try Major City</button>
                </GlassCard>
            </div>
          ) : displayWeather ? (
            <>
              {/* Left Column: Current Weather & Details */}
              <div className="w-full lg:w-2/3 flex flex-col gap-6">
                
                {/* Hero Card */}
                <div className="flex flex-col md:flex-row gap-6">
                    <GlassCard className="flex-[2] flex flex-col justify-between relative overflow-hidden group min-h-[320px]">
                        {/* Dynamic Background decoration */}
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] group-hover:bg-white/20 transition-all duration-1000"></div>
                        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>
                        
                        <div className="z-10 flex justify-between items-start">
                            <div className="flex items-center space-x-2 text-white/90 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                <MapPin size={14} />
                                <span className="font-medium text-sm">{displayWeather.location}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                        </div>
                        
                        <div className="z-10 mt-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-9xl font-thin tracking-tighter leading-none">
                                    {displayWeather.temperature}°
                                </h1>
                            </div>
                            <p className="text-3xl mt-2 font-light text-white/90 flex items-center gap-3">
                                <WeatherIcon condition={displayWeather.condition} className="w-8 h-8" />
                                {displayWeather.condition}
                            </p>
                        </div>
                        
                        <div className="mt-8 z-10 border-t border-white/10 pt-4">
                            <p className="text-white/80 italic text-lg font-light">
                                "{displayWeather.description}"
                            </p>
                        </div>
                    </GlassCard>

                    {/* Quick Stats Grid */}
                    <div className="flex flex-col gap-4 flex-1">
                        <GlassCard className="flex-1 flex flex-col justify-center relative overflow-hidden">
                             <div className="absolute right-2 top-2 opacity-10"><Wind size={60} /></div>
                             <div className="flex items-center gap-3 mb-1">
                                <Wind size={18} className="text-white/70"/>
                                <span className="text-sm text-white/60 uppercase tracking-wider">Wind</span>
                             </div>
                             <p className="text-2xl font-semibold">{displayWeather.windSpeed} <span className="text-sm font-normal text-white/50">km/h</span></p>
                        </GlassCard>
                        
                        <GlassCard className="flex-1 flex flex-col justify-center relative overflow-hidden">
                             <div className="absolute right-2 top-2 opacity-10"><Droplets size={60} /></div>
                             <div className="flex items-center gap-3 mb-1">
                                <Droplets size={18} className="text-white/70"/>
                                <span className="text-sm text-white/60 uppercase tracking-wider">Humidity</span>
                             </div>
                             <p className="text-2xl font-semibold">{displayWeather.humidity}<span className="text-sm font-normal text-white/50">%</span></p>
                        </GlassCard>

                        <GlassCard className="flex-1 flex flex-col justify-center relative overflow-hidden">
                             <div className="absolute right-2 top-2 opacity-10"><SunIcon size={60} /></div>
                             <div className="flex items-center gap-3 mb-1">
                                <SunIcon size={18} className="text-white/70"/>
                                <span className="text-sm text-white/60 uppercase tracking-wider">Feels Like</span>
                             </div>
                             <p className="text-2xl font-semibold">{displayWeather.feelsLike}°</p>
                        </GlassCard>
                    </div>
                </div>

                {/* Hourly Forecast & Chart */}
                <GlassCard className="w-full overflow-hidden">
                     <div className="flex items-center justify-between mb-6">
                         <h3 className="text-lg font-medium flex items-center gap-2">
                            <div className="w-2 h-6 bg-white/40 rounded-full"></div>
                            24-Hour Trend
                         </h3>
                     </div>
                     
                     <div className="flex justify-between overflow-x-auto pb-2 gap-6 no-scrollbar">
                        {displayWeather.hourly.map((hour, i) => (
                            <div key={i} className="flex flex-col items-center min-w-[60px] group cursor-default">
                                <span className="text-xs text-white/50 mb-3 group-hover:text-white transition-colors">{hour.time}</span>
                                <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors mb-2">
                                    <WeatherIcon condition={hour.condition} className="w-6 h-6 opacity-90" />
                                </div>
                                <span className="font-semibold text-lg">{hour.temperature}°</span>
                            </div>
                        ))}
                     </div>
                     <TrendChart data={displayWeather.hourly} unit={unit} />
                </GlassCard>

              </div>

              {/* Right Column: 7-Day Forecast */}
              <div className="w-full lg:w-1/3">
                 <GlassCard className="h-full">
                    <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
                        <div className="w-2 h-6 bg-white/40 rounded-full"></div>
                        7-Day Forecast
                    </h3>
                    <div className="space-y-2">
                        {displayWeather.daily.map((day, i) => (
                            <div key={i} className="flex items-center justify-between group hover:bg-white/10 p-3 rounded-xl transition-all cursor-default border border-transparent hover:border-white/5">
                                <div className="w-24 font-medium text-white/90">{i === 0 ? 'Today' : day.day}</div>
                                <div className="flex-1 flex justify-center items-center gap-2">
                                    <WeatherIcon condition={day.condition} className="w-5 h-5 text-white/80" />
                                    <span className="text-xs text-white/40 hidden sm:block">{day.condition}</span>
                                </div>
                                <div className="flex gap-3 w-24 justify-end text-right">
                                    <span className="font-bold">{day.maxTemp}°</span>
                                    <span className="text-white/40 font-light">{day.minTemp}°</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-xs text-white/30">Powered by Open-Meteo API</p>
                    </div>
                 </GlassCard>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default App;