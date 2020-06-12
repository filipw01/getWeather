import dotenv from 'dotenv'
import fetch from 'node-fetch'
import normalizeUrl from 'normalize-url'
import {
  OpenWeatherResponse,
  EarthLocation,
  EarthLocationWeather,
} from './types'
import flow from 'lodash.flow'

// Get configuration from .env file
dotenv.config()

const capitalize = (word: string) => {
  const capitalLetter = word[0].toUpperCase()
  const restOfString = word.slice(1)
  return `${capitalLetter}${restOfString}`
}

const decimalRound = (number: number, decimalPlaces: number = 1): number => {
  const decimalMultiplier = Math.pow(10, decimalPlaces)
  return Math.round(number * decimalMultiplier) / decimalMultiplier
}

const kelwinToCelsius = (kelwin: number) => kelwin - 273.15

const kelwinToFahrenheit = (kelwin: number) => kelwin * 1.8 - 459.67

const isPostalCode = (location: string) => isNaN(Number(location)) === true

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

const createApiRequest = (position: string): Promise<OpenWeatherResponse> => {
  const API_KEY = process.env.API_KEY
  return fetch(
    normalizeUrl(
      `https://api.openweathermap.org/data/2.5/weather?q=${position}&appid=${API_KEY}`
    )
  )
}

const getWeather = async (
  location: EarthLocation
): Promise<EarthLocationWeather> => {
  const request = await createApiRequest(location.position)
  if (request.status >= 200 && request.status < 300) {
    const {
      weather,
      name,
      main: { temp },
    } = await request.json()
    return {
      ...location,
      description: weather[0].description,
      temperature: temp,
      computedLocation: name,
    }
  } else {
    return Promise.reject(request.statusText)
  }
}

const displayWeather = (data: EarthLocationWeather): void => {
  const { computedLocation, position, description, temperature } = data
  const capitalizedDescription = capitalize(description)
  const fahrenheit = flow(kelwinToFahrenheit, decimalRound)(temperature)
  const celsius = flow(kelwinToCelsius, decimalRound)(temperature)

  console.log(
    `Weather for ${computedLocation} (your input was: ${position}):
${capitalizedDescription} with the temperature of ${fahrenheit}°F (${celsius}°C)
`
  )
}

const execute = () => {
  getLocations().map((location) =>
    getWeather(location)
      .then(displayWeather)
      .catch((error) => console.error(error))
  )
}

execute()
