import { IStorage } from "./storage";

/**
 * Seeds the database with initial data for development and testing
 */
export const seedDatabase = async (storage: IStorage): Promise<void> => {
  console.log("Seeding database with initial data...");
  
  // First check if there's a user with ID 999 specifically (direct memory access)
  let existingDemoUser = null;
  
  if ((storage as any).users && typeof (storage as any).users.get === 'function') {
    existingDemoUser = (storage as any).users.get(999);
    if (existingDemoUser) {
      console.log("Found demo user with ID 999 in memory storage");
    }
  }
  
  // If no user with ID 999 was found, check by username
  if (!existingDemoUser) {
    // Check for either capitalized or lowercase username since we're updating to capitalized
    existingDemoUser = await storage.getUserByUsername("Demouser");
    if (!existingDemoUser) {
      existingDemoUser = await storage.getUserByUsername("demouser");
    }
    
    if (existingDemoUser) {
      console.log("Found demo user by username:", existingDemoUser.id);
      
      // If user exists but doesn't have ID 999, we may have a mismatch
      if (existingDemoUser.id !== 999) {
        console.log("WARNING: Existing demo user has ID", existingDemoUser.id, "but expected 999");
      }
    }
  }
  
  // Only add a test user if one doesn't already exist
  if (!existingDemoUser) {
    console.log("Creating demo user...");
    
    // Create the demo user with ID 999 to match hardcoded references elsewhere in the code
    const testUser = await createDemoUser(storage);
    
    console.log(`Created test user with id: ${testUser.id}`);
    
    // Log minimal user data for verification without sensitive information
    console.log("Demo user created with ID:", testUser.id);
  } else {
    console.log("Demo user already exists, skipping creation");
    
    // Log minimal information about existing user
    console.log(`Existing demo user with ID: ${existingDemoUser.id}`);
  }
  
  // Add more seed data here as needed
  
  console.log("Database seeding completed");
}

/**
 * Create a demo user with ID 999 to match hardcoded references elsewhere in the code
 */
const createDemoUser = async (storage: IStorage) => {
  // Check if a user with ID 999 already exists in memory storage
  if ((storage as any).users && typeof (storage as any).users.get === 'function') {
    const existingDemoUser = (storage as any).users.get(999);
    if (existingDemoUser) {
      console.log("Demo user with ID 999 already exists in memory storage, returning existing user");
      return existingDemoUser;
    }
  }
  
  // If we got here, either there's no existing demo user with ID 999, or we couldn't access users map directly
  // Check if we can directly access the users Map to insert with a specific ID
  if ((storage as any).users && typeof (storage as any).users.set === 'function') {
    const now = new Date();
    // Generate a secure random password that's not visible in the code
    const securePassword = require('crypto').randomBytes(16).toString('hex');
    const demoUser = {
      id: 999,
      username: "Demouser",  // Changed to capitalized to match what the user is entering
      password: securePassword,  // Using a secure random password
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      phone: null,
      dob: null,
      address: null,
      province: null,
      postalCode: null,
      incomeBased: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: now,
      updatedAt: now
    };
    
    (storage as any).users.set(999, demoUser);
    console.log("Directly set demo user with ID 999");
    return demoUser;
  } else {
    // Fallback to regular createUser - note this won't have ID 999 but will use auto-increment
    console.log("WARNING: Using fallback createUser that won't have ID 999!");
    // Generate a secure random password for the fallback method too
    const securePassword = require('crypto').randomBytes(16).toString('hex');
    return await storage.createUser({
      username: "Demouser",  // Changed to capitalized to match what the user is entering
      password: securePassword,
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com"
    });
  }
}