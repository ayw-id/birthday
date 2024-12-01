import { UserController } from '../src/controllers/UserController'; // Replace with your actual path
import { UserService } from '../src/services/UserService';
import { BirthdaySchedulerService } from '../src/services/BirthdaySchedulerService';
import { TimeZoneService } from '../src/services/TimeZoneService';
import { PrismaClient, User } from '@prisma/client';
import Redis from "ioredis";
import { Queue } from 'bullmq';
import { EmailService } from '../src/services/EmailService';
import { Request, Response } from "express";

jest.mock('../src/services/UserService');
jest.mock('../src/services/BirthdaySchedulerService');
jest.mock('../src/services/TimeZoneService');

const mockPrisma = new (<new () => PrismaClient>(
  PrismaClient
))() as jest.Mocked<PrismaClient>;

const mockRedis = new (<new () => Redis>(
  Redis
))() as jest.Mocked<Redis>;

const mockQueue = jest.mocked(new Queue("birthdayQueue", { connection: mockRedis }))

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockBirthdayScheduler: jest.Mocked<BirthdaySchedulerService>;
  let mockTimeZoneService: jest.Mocked<TimeZoneService>;
  let mockEmailService: jest.Mocked<EmailService>;
  let res: Partial<Response>;
  let req: Partial<Request>;

  beforeEach(() => {
    mockUserService = new UserService(mockPrisma) as jest.Mocked<UserService>;
    mockEmailService = new EmailService() as jest.Mocked<EmailService>;
    mockBirthdayScheduler = new BirthdaySchedulerService(mockQueue, mockEmailService, mockUserService) as jest.Mocked<BirthdaySchedulerService>;
    mockTimeZoneService = new TimeZoneService() as jest.Mocked<TimeZoneService>;
    userController = new UserController(mockUserService, mockBirthdayScheduler, mockTimeZoneService);
    req = {
      body: {
        email: 'johndoe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        birthday: '1990-01-01',
        city: 'Los Angeles',
        country: 'USA',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  it('should create a user successfully', async () => {
    const mockLocation = { location: { lat: 10, lng: 20 } };
    const mockTimeZone = { timeZoneId: 'America/Los_Angeles' };
    const mockUser: User = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      birthday: new Date('1990-01-01'),
      timezone: 'America/Los_Angeles',
      email: 'johndoe@example.com',
      city: 'Los Angeles',
      country: 'USA',
      location: JSON.stringify(mockLocation),
      lastEmailSentAt: null,
      createdAt: new Date()
    };

    mockTimeZoneService.getLocationByCity.mockResolvedValueOnce(mockLocation);
    mockTimeZoneService.getTimeZoneByLocation.mockResolvedValueOnce(mockTimeZone);
    mockUserService.createUser.mockResolvedValueOnce(mockUser);

    await userController.createUser(req as Request, res as Response);
    
    expect(mockBirthdayScheduler.scheduleBirthdayJob).toHaveBeenCalledWith(mockUser);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});