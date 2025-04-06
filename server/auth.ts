import { compare } from 'bcrypt';
import { MemStorage } from './storage';

// Type for representing a user without the password field
export type SafeUser = Omit<{ 
  id: number;
  username: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  dob: string | null;
  address: string | null;
  province: string | null;
  role: string | null;
  subscription: string | null;
  subscriptionStatus: string | null;
  verifiedStatus: boolean | null;
  lastLogin: Date | null;
  registrationDate: Date;
  credits: number | null;
}, 'password'>;

/**
 * Authenticates a user based on username and password
 * 
 * @param storage The storage interface
 * @param username The username to authenticate
 * @param password The password to check
 * @returns A user object if authentication succeeds, null otherwise
 */
export async function authenticateUser(
  storage: MemStorage,
  username: string,
  password: string
): Promise<{ 
  id: number;
  username: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  dob: string | null;
  address: string | null;
  province: string | null;
  role: string | null;
  subscription: string | null;
  subscriptionStatus: string | null;
  verifiedStatus: boolean | null;
  lastLogin: Date | null;
  registrationDate: Date;
  credits: number | null;
} | null> {
  console.log(`AUTH - Authenticating user: ${username}`);
  
  // Special case for demo account - only necessary for testing purposes
  if (username === 'sysdemoaccount' && password === 'sysdemoaccess') {
    console.log('AUTH - Using demo account bypass');
    const demoUser = {
      id: 9999,
      username: 'sysdemoaccount',
      password: 'not-stored', // Not storing actual password
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@smartdispute.ai',
      phone: null,
      dob: null,
      address: null,
      province: 'ON',
      role: 'user',
      subscription: 'free',
      subscriptionStatus: 'active',
      verifiedStatus: true,
      lastLogin: new Date(),
      registrationDate: new Date(),
      credits: 3
    };
    return demoUser;
  }
  
  try {
    // Get user from storage
    const user = await getUserByUsername(storage, username);
    
    if (!user) {
      console.log(`AUTH - User not found: ${username}`);
      return null;
    }
    
    // If it's a regular user, compare password
    if (user.password && password) {
      // If we're using bcrypt passwords (starts with $2a, $2b, etc.)
      if (user.password.startsWith('$2')) {
        const isValid = await compare(password, user.password);
        if (!isValid) {
          console.log(`AUTH - Invalid password for user: ${username}`);
          return null;
        }
      } 
      // For plain text passwords (not recommended, but may be used in development)
      else if (user.password !== password) {
        console.log(`AUTH - Invalid plain password for user: ${username}`);
        return null;
      }
    }
    
    console.log(`AUTH - User authenticated successfully: ${username}`);
    
    // Return the user
    return user;
  } catch (error) {
    console.error('AUTH - Error during authentication:', error);
    return null;
  }
}

/**
 * Get a user by username from storage
 */
export async function getUserByUsername(storage: MemStorage, username: string) {
  // Attempt to find user by username - we expose this method as it may be useful later
  return await storage.findUserByUsername(username);
}

/**
 * Get a safe version of the user object (without password)
 */
export function getSafeUser(user: { 
  id: number;
  username: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  dob: string | null;
  address: string | null;
  province: string | null;
  role: string | null;
  subscription: string | null;
  subscriptionStatus: string | null;
  verifiedStatus: boolean | null;
  lastLogin: Date | null;
  registrationDate: Date;
  credits: number | null;
}): SafeUser {
  // Create a copy without the password
  const { password, ...safeUser } = user;
  return safeUser;
}