import { PrismaClient, User } from '@prisma/client';

export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'lastEmailSentAt'>): Promise<User> {
    // Create a new user with the provided data, setting the createdAt timestamp
    return await this.prisma.user.create({
      data: {
        ...data,
        createdAt: new Date(),
      },
    });
  }

  async deleteUser(userId: number): Promise<void> {
    // Delete the user with the specified ID
    await this.prisma.user.delete({ where: { id: userId } });
  }

  async getUserById(userId: number): Promise<User | null> {
    // Find the user with the specified ID
    return await this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async updateLastEmailSent(userId: number, date: Date): Promise<void> {
    // Update the lastEmailSentAt timestamp for the user with the specified ID
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastEmailSentAt: date },
    });
  }
}