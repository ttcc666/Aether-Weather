import React from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Moon, CloudSun } from 'lucide-react';

interface WeatherIconProps {
  condition: string;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = "w-6 h-6" }) => {
  const normalizedCondition = condition.toLowerCase();

  if (normalizedCondition.includes('sun') || normalizedCondition.includes('clear')) {
    return <Sun className={`${className} text-yellow-400`} />;
  }
  if (normalizedCondition.includes('partly')) {
    return <CloudSun className={`${className} text-yellow-200`} />;
  }
  if (normalizedCondition.includes('cloud')) {
    return <Cloud className={`${className} text-gray-300`} />;
  }
  if (normalizedCondition.includes('rain') || normalizedCondition.includes('drizzle')) {
    return <CloudRain className={`${className} text-blue-300`} />;
  }
  if (normalizedCondition.includes('storm') || normalizedCondition.includes('thunder')) {
    return <CloudLightning className={`${className} text-purple-400`} />;
  }
  if (normalizedCondition.includes('snow')) {
    return <Snowflake className={`${className} text-white`} />;
  }
  if (normalizedCondition.includes('fog') || normalizedCondition.includes('mist')) {
    return <CloudFog className={`${className} text-gray-400`} />;
  }

  return <Sun className={`${className} text-yellow-400`} />;
};