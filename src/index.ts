import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { UserController } from './controllers/UserController';
import { UserService } from './services/UserService';
import { BirthdaySchedulerService } from './services/BirthdaySchedulerService';
import { EmailService } from './services/EmailService';
import { BirthdayJobProcessor } from './jobs/BirthdayJobProcessor';
import { TimeZoneService } from './services/TimeZoneService';
import createServer from './server';

// Create Redis connection and BullMQ queue
const redis = new Redis({
  maxRetriesPerRequest: null, // Disable retries for simplicity
});
const queue = new Queue('birthdayQueue', { connection: redis });

// Initialize Prisma client
const prisma = new PrismaClient();

// Create service instances
const timeZoneService = new TimeZoneService();
const userService = new UserService(prisma);
const emailService = new EmailService();
const birthdaySchedulerService = new BirthdaySchedulerService(queue, emailService, userService);
const birthdayJobProcessor = new BirthdayJobProcessor(redis, userService, emailService);

// Create user controller instance
const userController = new UserController(userService, birthdaySchedulerService, timeZoneService);

// Start processing birthday jobs
birthdayJobProcessor.setupProcessor();

// Create Express server
const app = createServer();
const PORT = 3000;

// Define user routes
app.post('/user', (req, res, next) => userController.createUser(req, res, next));
app.delete('/user/:id', (req, res, next) => userController.deleteUser(req, res, next));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));