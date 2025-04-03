import { IStorage } from "./storage";

/**
 * Seeds the database with initial data for development and testing
 */
export const seedDatabase = async (storage: IStorage): Promise<void> => {
  console.log("Seeding database with initial data...");
  
  // Check if a demo user already exists
  const existingDemoUser = await storage.getUserByUsername("demouser");
  
  // Only add a test user if one doesn't already exist
  if (!existingDemoUser) {
    console.log("Creating demo user...");
    const testUser = await storage.createUser({
      username: "demouser",
      password: "password123",
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com"
    });
    
    console.log(`Created test user with id: ${testUser.id}`);
  } else {
    console.log("Demo user already exists, skipping creation");
  }
  
  // Add more seed data here as needed
  
  console.log("Database seeding completed");
}