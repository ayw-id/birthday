import { TimeZoneService } from "../src/services/TimeZoneService";
import dotenv from 'dotenv';
import axios, { AxiosStatic } from 'axios';

describe('timeZoneService', () => {
  const timeZoneService = new TimeZoneService();
  let mockedAxios: jest.MaybeMocked<AxiosStatic>;
  dotenv.config();
  const APIKEY = process.env.APIKEY;

  beforeEach(() => {
    mockedAxios = jest.mocked(axios);
  });

  afterEach(() => {
    jest.resetAllMocks();
  })

  describe('getTimeZoneByLocation', () => {
    it('should return time zone data on successful API call', async () => {
      const mockResponse = {
        data: {
          timeZoneId: 'America/Los_Angeles'
        }
      };
  
      mockedAxios.get = jest.fn().mockReturnValue(mockResponse);
  
      const location = {
        lat: 34.0522,
        lng: -118.2437,
      };
  
      const result = await timeZoneService.getTimeZoneByLocation(location);
  
      expect(mockedAxios.get).toHaveBeenCalledWith(`https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat},${location.lng}&timestamp=1331161200&key=${APIKEY}`);
  
      expect(result).toEqual(mockResponse.data);
    });
  
    it('should return error message on failed API call', async () => {
      const mockError = new Error('Network Error');
      mockedAxios.get = jest.fn().mockImplementation(() => Promise.reject(mockError));
  
      const location = {
        lat: 34.0522,
        lng: -118.2437,
      };
  
      const result = await timeZoneService.getTimeZoneByLocation(location);
  
      expect(result).toEqual({ error: 'Error fetch data' });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat},${location.lng}&timestamp=1331161200&key=${APIKEY}`
      );
    });
  });

  describe('getLocationByCity', () => {
    it('should return time zone data on successful API call', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              geometry: {
                location: {
                  lat: 34.0522,
                  lng: -118.2437,
                }
              }
            }
          ]
        }
      };
  
      mockedAxios.get = jest.fn().mockReturnValue(mockResponse);
  
      const city = 'Makassar, Indonesia';
  
      const result = await timeZoneService.getLocationByCity(city);
  
      expect(mockedAxios.get).toHaveBeenCalledWith(`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${APIKEY}`);
  
      expect(result).toEqual(mockResponse.data.results[0].geometry);
    });
  
    it('should return error message on failed API call', async () => {
      const mockError = new Error('Network Error');
      mockedAxios.get = jest.fn().mockImplementation(() => Promise.reject(mockError));
  
      const city = 'Makassar, Indonesia';
  
      const result = await timeZoneService.getLocationByCity(city);
  
      expect(result).toEqual({ error: 'Get location failed' });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${APIKEY}`
      );
    });
  });
});