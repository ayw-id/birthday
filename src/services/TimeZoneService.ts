import axios from 'axios';

interface GeoLocation {
  lat: number;
  lng: number;
}

// Define response interfaces for better type safety
interface GetLocationResponse {
  results: { geometry: { location: GeoLocation } }[];
  status: string;
}

interface GetTimeZoneResponse {
  timeZoneId: string;
  status: string;
}

// Define result interfaces for the service methods
interface GetLocationByCityResult {
  location?: GeoLocation;
  error?: string;
}

interface GetTimeZoneByLocationResult {
  timeZoneId?: string;
  error?: string;
}

export class TimeZoneService {
  constructor(private readonly apiKey?: string) {}

  private getApiKey(): string | undefined {
    return this.apiKey || process.env.APIKEY;
  }

  async getLocationByCity(city: string): Promise<GetLocationByCityResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { error: 'API key not found' };
    }

    try {
      // Fetch location data from Google Maps API
      const response: GetLocationResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${apiKey}`
      );

      // Check if the request was successful and location data is available
      if (response.status === 'OK' && response.results.length > 0) {
        const location = response.results[0].geometry.location;
        return { location };
      } else {
        return { error: 'No location found' };
      }
    } catch (error) {
      console.warn('Error fetching location:', error);
      return { error: 'Failed to get location' };
    }
  }

  async getTimeZoneByLocation(location: GeoLocation): Promise<GetTimeZoneByLocationResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { error: 'API key not found' };
    }

    try {
      // Fetch time zone data from Google Maps API
      const response: GetTimeZoneResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat},${location.lng}&timestamp=1331161200&key=${apiKey}`
      );

      // Check if the request was successful
      if (response.status === 'OK') {
        return { timeZoneId: response.timeZoneId };
      } else {
        return { error: `Error fetching time zone: ${response.status}` };
      }
    } catch (error) {
      console.warn('Error fetching time zone:', error);
      return { error: 'Failed to get time zone' };
    }
  }
}