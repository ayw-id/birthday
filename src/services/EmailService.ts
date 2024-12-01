import axios from 'axios';

interface EmailResponse {
  data?: {
    status: string;
    sentTime: string;
  };
  error?: string;
}

export class EmailService {
  private readonly emailEndpoint = 'https://email-service.digitalenvision.com.au';

  async sendBirthdayEmail(email: string, message: string): Promise<EmailResponse> {
    const emailData = {
      email,
      message,
    };

    try {
      const response = await axios.post(this.emailEndpoint, emailData, {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': this.generateIdempotencyKey(email, message),
        },
        timeout: 5000, // Add a timeout to handle potential delays
      });
      console.warn('response', response)

      if (response.status === 200 && response.data.status === 'sent') {
        return {
          data: {
            status: response.data.status,
            sentTime: response.data.sentTime,
          }
        };
      } else {
        return {
          error: 'Failed to send email: Unexpected response status.'
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email.');
    }
  }

  private generateIdempotencyKey(email: string, message: string): string {
    // Generate a unique key based on the email and message content to prevent duplicates
    return `${email}-${Buffer.from(message).toString('base64')}`;
  }
}
