import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import crypto from 'crypto';

async function updateUserPassword() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // Generate a salt and hash for password123
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('password123', salt, 1000, 64, 'sha512').toString('hex');
    const password = `${salt}:${hash}`;

    // Update the user
    const result = await client`UPDATE "users" SET "password" = ${password} WHERE "username" = ${'demouser'}`;
    
    console.log('User password updated successfully');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error updating user password:', error);
  } finally {
    await client.end();
  }
}

updateUserPassword();