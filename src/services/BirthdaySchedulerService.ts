import { EmailService } from "./EmailService";
import { User } from "@prisma/client";
import { UserService } from "./UserService";
import moment from "moment-timezone";
import { Queue } from "bullmq";

export class BirthdaySchedulerService {
  constructor(
    private readonly queue: Queue,
    private readonly emailService: EmailService,
    private readonly userService: UserService
  ) {}

  async sendBirthdayMessage(user: User) {
    const message = `Happy Birthday, ${user.firstName}! `;
    try {
      const emailResponse = await this.emailService.sendBirthdayEmail(user.email, message);

      // Early return for invalid response
      if (!emailResponse.data || emailResponse.data.status !== 'sent') {
        return;
      }

      await this.userService.updateLastEmailSent(user.id, new Date(emailResponse.data.sentTime));
      console.log(`Birthday email sent to ${user.email} at ${emailResponse.data.sentTime}`);
    } catch (error) {
      console.error(`Failed to send birthday email to ${user.email}:`, error);
      // Optionally, implement a retry mechanism here or log for retry
    }
  }

  async scheduleBirthdayJob(user: User) {
    const userTime = moment.tz(user.birthday, user.timezone).hour(9).minute(0).second(0);
    const delay = userTime.diff(moment(), "milliseconds");

    await this.queue.add(
      "sendBirthdayMessage",
      { userId: user.id },
      { delay, jobId: `birthday-${user.id}-${userTime.format("YYYY-MM-DD")}` }
    );
  }
}