// Assuming you have Jest installed

import axios, { AxiosStatic } from 'axios';
import { EmailService } from "../src/services/EmailService";

describe('EmailService', () => {
  let emailService: EmailService;
  let mockedAxios: jest.MaybeMocked<AxiosStatic>;

  beforeEach(() => {
    mockedAxios = jest.mocked(axios);
    emailService = new EmailService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  })

  it('should send birthday email successfully', async () => {
    const mockResponse = {
      status: 200,
      data: {
        status: 'sent',
        sentTime: '2024-11-30T17:29:00Z',
      },
    };

    mockedAxios.post = jest.fn().mockReturnValue(mockResponse);

    const email = 'test@example.com';
    const message = 'Happy Birthday!';

    const response = await emailService.sendBirthdayEmail(email, message);

    expect(response).toEqual({
      data: { status: 'sent', sentTime: '2024-11-30T17:29:00Z' }
    });
    expect(axios.post).toHaveBeenCalledWith(
      'https://email-service.digitalenvision.com.au',
      { email, message },
      {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': expect.any(String), // Expect a string for the key
        },
        timeout: 5000,
      }
    );
  });

  it('should return error on unexpected response status', async () => {
    const mockResponse = {
      data: {
        status: 'failed',
        message: 'Internal server error',
      },
      status: 500,
    };
    mockedAxios.post = jest.fn().mockReturnValue(mockResponse);

    const email = 'test@example.com';
    const message = 'Happy Birthday!';

    const response = await emailService.sendBirthdayEmail(email, message);
    expect(response).toEqual({
      error: 'Failed to send email: Unexpected response status.'
    });

    expect(axios.post).toHaveBeenCalledWith(
      'https://email-service.digitalenvision.com.au',
      { email, message },
      {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': expect.any(String), // Expect a string for the key
        },
        timeout: 5000,
      }
    );
  });

  it('should throw error on network error', async () => {
    const mockError = new Error('Network Error');
    mockedAxios.get = jest.fn().mockImplementation(() => Promise.reject(mockError));

    const email = 'test@example.com';
    const message = 'Happy Birthday!';

    await expect(emailService.sendBirthdayEmail(email, message)).rejects.toThrow('Failed to send email.');
    expect(axios.post).toHaveBeenCalledWith(
      'https://email-service.digitalenvision.com.au',
      { email, message },
      {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': expect.any(String), // Expect a string for the key
        },
        timeout: 5000,
      }
    );
  });
});