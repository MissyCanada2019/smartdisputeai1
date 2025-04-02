import { IStorage } from "./storage";

/**
 * Seeds the database with initial data for development and testing
 */
export const seedDatabase = async (storage: IStorage): Promise<void> => {
  console.log("Seeding database with initial data...");
  
  // Add a test user for development
  const testUser = await storage.createUser({
    username: "testuser",
    password: "password123",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com"
  });
  
  console.log(`Created test user with id: ${testUser.id}`);
  
  // Add more seed data here as needed
  
  console.log("Database seeding completed");
}