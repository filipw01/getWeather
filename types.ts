import { Response } from 'node-fetch'

export interface OpenWeatherBody {
  coord: { lon: number; lat: number }
  weather: [
    {
      id: number
      main: string
      description: string
      icon: string
    }
  ]
  base: string
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  wind: {
    speed: number
    deg: number
  }
  clouds: {
    all: number
  }
  dt: number
  sys: {
    type: number
    id: number
    message: number
    country: string
    sunrise: number
    sunset: number
  }
  timezone: number
  id: number
  name: string
  cod: number
}

export interface OpenWeatherResponse extends Response {
  json(): Promise<OpenWeatherBody>
}

export interface EarthLocationWeather extends EarthLocation {
  computedLocation: string
  description: string
  temperature: number
}

export interface EarthLocation {
  type: 'city' | 'postalCode'
  position: string
}
