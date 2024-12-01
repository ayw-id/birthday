import { ConnectionOptions, Worker } from 'bullmq';
import moment from 'moment';
import { UserService } from '../services/UserService';
import { EmailService } from '../services/EmailService';

export class BirthdayJobProcessor {
  constructor(
    private readonly redisConnectionOptions: ConnectionOptions, // More descriptive name
    private readonly userService: UserService,
    private readonly emailService: EmailService
  ) {}

  setupProcessor() {
    new Worker(
      'sendBirthdayMessage',
      async ({ data }) => {
        const user = await this.userService.getUserById(data.userId);
        if (!user) return; // Early return with optional chaining

        const now = moment();
        const lastSent = moment(user.lastEmailSentAt);

        if (user.lastEmailSentAt && now.diff(lastSent, 'hours') < 24) {
          console.log(`Email already sent to ${user.firstName} today. Skipping...`);
          return;
        }

        const emailPayload = {
          to: `${user.firstName}.${user.lastName}@example.com`,
          subject: 'Happy Birthday!',
          body: `Happy Birthday, ${user.firstName}!`,
        };

        try {
          await this.emailService.sendBirthdayEmail(emailPayload.subject, emailPayload.body);
          await this.userService.updateLastEmailSent(user.id, now.toDate());
        } catch (error) {
          console.error('Error sending birthday email:', error);
          //  Optionally: Retry logic or notify someone
        }
      },
      { connection: this.redisConnectionOptions }
    );
  }
}