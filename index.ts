import dotenv from 'dotenv'
import fetch, { Response } from 'node-fetch'
import normalizeUrl from 'normalize-url'

dotenv.config()

const isPostalCode = (location: string) => isNaN(Number(location)) === true

interface EarthLocation {
  type: 'city' | 'postalCode'
  position: string
}

const getLocations = (): EarthLocation[] => {
  const processArguments = process.argv.slice(2)
  const locations = processArguments.map(
    (argument): EarthLocation => {
      if (isPostalCode(argument)) {
        return { type: 'city', position: argument }
      }
      return { type: 'postalCode', position: argument }
    }
  )
  return locations
}

interface OpenWeatherBody {
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

interface OpenWeatherResponse extends Response {
  json(): Promise<OpenWeatherBody>
}

const createApiRequest = (position: string): Promise<OpenWeatherResponse> => {
  const API_KEY = process.env.API_KEY

  return fetch(
    normalizeUrl(
      `https://api.openweathermap.org/data/2.5/weather?q=${position}&appid=${API_KEY}`
    )
  )
}

interface EarthLocationWeather extends EarthLocation {
  computedLocation: string
  description: string
  temperature: number
}

const getWeather = async (
  location: EarthLocation
): Promise<EarthLocationWeather> => {
  const request = await createApiRequest(location.position)
  const { weather, name, main } = await request.json()
  if (request.status >= 200 && request.status < 300) {
    // console.log(body)
    return {
      ...location,
      description: weather[0].description,
      temperature: main.temp,
      computedLocation: name,
    }
  } else {
    return Promise.reject(request.statusText)
  }
}

const capitalize = (word: string) => word[0].toUpperCase() + word.slice(1)

const kelwinToCelsius = (kelwin: number) =>
  Math.round((kelwin - 273.15) * 10) / 10
const kelwinToFahrenheit = (kelwin: number) =>
  Math.round((kelwin * 1.8 - 459.67) * 10) / 10

getLocations().map(
  async (location) =>
    await getWeather(location)
      .then((data) => {
        const { computedLocation, position, description, temperature } = data
        const capitalizedDescription = capitalize(description)
        const fahrenheit = kelwinToFahrenheit(temperature)
        const celsius = kelwinToCelsius(temperature)
        console.log(
          `Weather for ${computedLocation} (your input was: ${position}):
  ${capitalizedDescription} with the temperature of ${fahrenheit}°F (${celsius}°C)
`
        )
      })
      .catch((error) => console.error(error))
)
