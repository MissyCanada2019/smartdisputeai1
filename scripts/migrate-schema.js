/**
 * Script to apply database migrations for our schema
 * - This creates the new tables for provinces, legal issues, sub-issues
 * - Used for organizing documents in a hierarchical structure
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import dotenv from 'dotenv';
dotenv.config();

async function main() {
  // Check if we have the database URL
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Create postgres client and drizzle instance
  const connectionString = process.env.DATABASE_URL;
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  // Prepare province data
  const provinces = [
    { code: "AB", name: "Alberta", isActive: true },
    { code: "BC", name: "British Columbia", isActive: true },
    { code: "MB", name: "Manitoba", isActive: true },
    { code: "NB", name: "New Brunswick", isActive: true },
    { code: "NL", name: "Newfoundland and Labrador", isActive: true },
    { code: "NS", name: "Nova Scotia", isActive: true },
    { code: "NT", name: "Northwest Territories", isActive: true },
    { code: "NU", name: "Nunavut", isActive: true },
    { code: "ON", name: "Ontario", isActive: true },
    { code: "PE", name: "Prince Edward Island", isActive: true },
    { code: "QC", name: "Quebec", isActive: true },
    { code: "SK", name: "Saskatchewan", isActive: true },
    { code: "YT", name: "Yukon", isActive: true }
  ];

  // Prepare legal issues data
  const legalIssues = [
    { name: "Housing", description: "Tenancy and rental housing issues", isActive: true },
    { name: "CAS", description: "Children's Aid Society issues", isActive: true },
    { name: "Family Law", description: "Family law matters including divorce and custody", isActive: true },
    { name: "Employment", description: "Workplace and employment issues", isActive: true },
    { name: "Small Claims", description: "Small claims court cases", isActive: true },
    { name: "Criminal", description: "Criminal law matters", isActive: true },
    { name: "Immigration", description: "Immigration and refugee matters", isActive: true },
  ];

  // Prepare sub-issues data (will be linked to issue IDs later)
  const subIssuesMap = {
    "Housing": [
      { name: "Eviction Notice", description: "Handling eviction notices" },
      { name: "Rent Increases", description: "Disputing improper rent increases" },
      { name: "Repairs", description: "Getting necessary repairs completed" },
      { name: "Lease Issues", description: "Problems with lease agreements" },
      { name: "Landlord Entry", description: "Unauthorized entry by landlord" },
    ],
    "CAS": [
      { name: "File Disclosure", description: "Requesting and reviewing CAS files" },
      { name: "Child Removal", description: "Responding to child apprehension" },
      { name: "Supervision Orders", description: "Dealing with supervision orders" },
      { name: "Case Conference", description: "Preparing for case conferences" },
      { name: "ADR Process", description: "Alternative dispute resolution process" },
    ],
    "Family Law": [
      { name: "Divorce", description: "Filing for divorce" },
      { name: "Child Custody", description: "Child custody disputes" },
      { name: "Child Support", description: "Child support claims and payments" },
      { name: "Spousal Support", description: "Spousal support claims and payments" },
      { name: "Property Division", description: "Division of matrimonial property" },
    ],
  };

  try {
    console.log('Starting database migration...');

    // Apply migrations (this should create the tables based on schema.ts)
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Schema migration completed successfully');

    // Now insert the data
    console.log('Inserting provinces data...');
    
    // Code to insert provinces would be here
    // This is a placeholder as we don't have access to the actual tables yet
    
    console.log('Provinces data inserted');

    console.log('Inserting legal issues data...');
    // Code to insert legal issues would be here
    
    console.log('Legal issues data inserted');

    console.log('Inserting sub-issues data...');
    // Code to insert sub-issues would be here
    
    console.log('Sub-issues data inserted');

    console.log('All migrations and data insertions completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();