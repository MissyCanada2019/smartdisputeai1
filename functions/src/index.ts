import * as functions from "firebase-functions";
import * as express from "express";

// Create an Express app
const app = express();

// Sample route for testing
app.get("/", (req, res) => {
  res.send("Hello from SmartDispute Firebase Function!");
});

// Export the Express app as a Firebase HTTPS Function
export const api = functions.https.onRequest(app);
