import { PrismaClient, User } from "@prisma/client";
import { UserService } from "../src/services/UserService";

describe("UserService", () => {
  const mockPrisma = new (<new () => PrismaClient>(
    PrismaClient
  ))() as jest.Mocked<PrismaClient>;

  const userService = new UserService(mockPrisma);

  beforeAll(() => {
    mockPrisma.user.create = jest.fn();
    mockPrisma.user.delete = jest.fn();
    mockPrisma.user.findUnique = jest.fn();
    mockPrisma.user.update = jest.fn();
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      const newUser: User = {
        id: 1,
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        birthday: new Date("2000-01-01"),
        timezone: "America/New_York",
        city: "New York",
        country: "USA",
        location: '{"lat":40.7128,"lng":-74.0060}',
        createdAt: new Date(),
        lastEmailSentAt: null,
      };

      (mockPrisma.user.create as jest.Mock).mockResolvedValue(newUser);

      const result = await userService.createUser({
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        birthday: new Date("2000-01-01"),
        timezone: "America/New_York",
        city: "New York",
        country: "USA",
        location: '{"lat":40.7128,"lng":-74.0060}',
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
          birthday: expect.any(Date),
          timezone: "America/New_York",
          city: "New York",
          country: "USA",
          location: '{"lat":40.7128,"lng":-74.0060}',
          createdAt: expect.any(Date),
        }),
      });
      expect(result).toEqual(newUser);
    });
  });

  describe("deleteUser", () => {
    it("should delete a user successfully", async () => {
      (mockPrisma.user.delete as jest.Mock).mockResolvedValue(undefined);

      await userService.deleteUser(1);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw an error if deletion fails", async () => {
      (mockPrisma.user.delete as jest.Mock).mockRejectedValue(new Error("Delete failed"));

      await expect(userService.deleteUser(1)).rejects.toThrow("Delete failed");
    });
  });

  describe("getUserById", () => {
    it("should return a user by ID", async () => {
      const user: User = {
        id: 1,
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        birthday: new Date("2000-01-01"),
        timezone: "America/New_York",
        city: "New York",
        country: "USA",
        location: '{"lat":40.7128,"lng":-74.0060}',
        createdAt: new Date(),
        lastEmailSentAt: null,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await userService.getUserById(1);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(user);
    });

    it("should return null if no user is found", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.getUserById(999);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe("updateLastEmailSent", () => {
    it("should update the lastEmailSentAt field successfully", async () => {
      const date = new Date();

      (mockPrisma.user.update as jest.Mock).mockResolvedValue(undefined);

      await userService.updateLastEmailSent(1, date);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { lastEmailSentAt: date },
      });
    });

    it("should throw an error if update fails", async () => {
      const date = new Date();

      (mockPrisma.user.update as jest.Mock).mockRejectedValue(new Error("Update failed"));

      await expect(userService.updateLastEmailSent(1, date)).rejects.toThrow(
        "Update failed"
      );
    });
  });
});
