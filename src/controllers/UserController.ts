import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { BirthdaySchedulerService } from '../services/BirthdaySchedulerService';
import { TimeZoneService } from '../services/TimeZoneService';

export class UserController {
  constructor(
    private userService: UserService,
    private birthdayScheduler: BirthdaySchedulerService,
    private timeZoneService: TimeZoneService
  ) {}

  async createUser(req: Request, res: Response, next?: NextFunction) {
    try {
      const { email, firstName, lastName, birthday, city, country } = req.body;

      // Get location information from TimeZoneService
      const location = await this.timeZoneService.getLocationByCity(`${city}, ${country}`);

      // Handle location errors
      if (location.error) {
        return res.status(500).json({ error: location.error });
      } else if (!location.location) {
        return res.status(500).json({ error: 'Location not found' });
      }

      // Get time zone information from TimeZoneService
      const timeZone = await this.timeZoneService.getTimeZoneByLocation(location.location);

      // Handle time zone errors
      if (!timeZone?.timeZoneId) {
        return res.status(500).json({ error: timeZone.error || 'Time Zone API failed' });
      }

      // Create user and schedule birthday job
      const user = await this.userService.createUser({
        firstName,
        lastName,
        birthday: new Date(birthday),
        timezone: timeZone.timeZoneId,
        email,
        city,
        country,
        location: JSON.stringify(location),
      });
      await this.birthdayScheduler.scheduleBirthdayJob(user);

      // Send success response
      res.status(201).json(user);
    } catch (error) {
      // Handle general errors
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  async deleteUser(req: Request, res: Response, next?: NextFunction) {
    try {
      const { id } = req.params;

      // Delete user
      await this.userService.deleteUser(parseInt(id));

      // Send success response
      res.status(204).send();
    } catch (error) {
      // Handle general errors
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}