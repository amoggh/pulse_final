/**
 * Weather and AQI utility using OpenWeather API
 */

const OPENWEATHER_API_KEY = '9c0d5599dae76826093f6e6fa5d23db9'
const DEFAULT_CITY = 'Bangalore' // Default location
const DEFAULT_LAT = 12.9716
const DEFAULT_LON = 77.5946

export interface WeatherData {
    temperature: number
    condition: string
    icon: string
    city: string
}

export interface AQIData {
    aqi: number
    level: 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor'
    color: string
}

/**
 * Fetch current weather data
 */
export async function fetchWeather(): Promise<WeatherData> {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${DEFAULT_CITY}&appid=${OPENWEATHER_API_KEY}&units=metric`
        )

        if (!response.ok) {
            throw new Error('Weather API request failed')
        }

        const data = await response.json()

        return {
            temperature: Math.round(data.main.temp),
            condition: data.weather[0].main,
            icon: data.weather[0].icon,
            city: data.name
        }
    } catch (error) {
        console.error('Failed to fetch weather:', error)
        // Return mock data as fallback
        return {
            temperature: 28,
            condition: 'Clear',
            icon: '01d',
            city: DEFAULT_CITY
        }
    }
}

/**
 * Fetch Air Quality Index (AQI) data
 */
export async function fetchAQI(): Promise<AQIData> {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}&appid=${OPENWEATHER_API_KEY}`
        )

        if (!response.ok) {
            throw new Error('AQI API request failed')
        }

        const data = await response.json()
        const aqi = data.list[0].main.aqi

        return getAQIInfo(aqi)
    } catch (error) {
        console.error('Failed to fetch AQI:', error)
        // Return mock data as fallback
        return getAQIInfo(2)
    }
}

/**
 * Convert AQI number to level and color
 */
function getAQIInfo(aqi: number): AQIData {
    const levels: Record<number, { level: AQIData['level'], color: string }> = {
        1: { level: 'Good', color: '#10b981' },
        2: { level: 'Fair', color: '#84cc16' },
        3: { level: 'Moderate', color: '#eab308' },
        4: { level: 'Poor', color: '#f97316' },
        5: { level: 'Very Poor', color: '#ef4444' }
    }

    const info = levels[aqi] || levels[3]

    return {
        aqi,
        level: info.level,
        color: info.color
    }
}

/**
 * Get weather icon URL from OpenWeather
 */
export function getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`
}
