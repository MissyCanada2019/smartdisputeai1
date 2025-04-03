import { IStorage } from './storage';
import { User } from '@shared/schema';
import crypto from 'crypto';

/**
 * Authenticate a user by username and password
 * @param storage Storage instance
 * @param username Username to authenticate
 * @param password Password to verify
 * @returns User object if authentication is successful, undefined otherwise
 */
export async function authenticateUser(
  storage: IStorage,
  username: string,
  password: string
): Promise<User | undefined> {
  try {
    // Debug log
    console.log('AUTH: Authenticating user:', username);
    
    // Get the user by username
    const user = await storage.getUserByUsername(username);
    
    // If no user found, return undefined
    if (!user) {
      console.log('AUTH: User not found:', username);
      return undefined;
    }
    
    console.log('AUTH: User found with ID:', user.id);
    
    // Compare passwords
    let passwordMatches = false;
    
    if (user.password.includes(':')) {
      // New format with salt:hash
      const [salt, storedHash] = user.password.split(':');
      const inputHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      
      console.log('AUTH: Checking hashed password');
      passwordMatches = storedHash === inputHash;
    } else {
      // Legacy format with plain text comparison
      console.log('AUTH: Checking plain text password');
      passwordMatches = user.password === password;
      
      // Log comparison details for debugging (be careful with sensitive data)
      console.log('AUTH: Password length check - Input:', password.length, 'Stored:', user.password.length);
      console.log('AUTH: Password match result:', passwordMatches);
    }
    
    if (!passwordMatches) {
      console.log('AUTH: Password mismatch for user:', username);
      return undefined;
    }
    
    console.log('AUTH: Authentication successful for user:', username);
    
    // Return the user (without the password)
    return user;
  } catch (error) {
    console.error('AUTH: Error during authentication:', error);
    return undefined;
  }
}

/**
 * Get a safe version of the user object (without sensitive information)
 * @param user The user object
 * @returns Safe user object without password
 */
export function getSafeUser(user: User): Omit<User, 'password'> {
  // Destructure to remove password
  const { password, ...safeUser } = user;
  return safeUser;
}