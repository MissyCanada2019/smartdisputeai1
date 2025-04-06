import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { MemStorage } from "./storage";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { authenticateUser, getSafeUser } from "./auth";
import MemoryStore from "memorystore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create the session store
const SessionStore = MemoryStore(session);

const app = express();
// Increase payload size limits for JSON and URL encoded data
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: false, limit: '1000mb' }));
// Add body parser limit
app.use(express.raw({ limit: '1000mb' }));

// Enable CORS for both HTTP and HTTPS connections
app.use((req, res, next) => {
  // Allow requests from both HTTP and HTTPS origins
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  next();
});

// Simple request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    const start = Date.now();
    res.on("finish", () => {
      log(`${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms`);
    });
  }
  next();
});

// Serve Google verification files directly from the root directory
app.use(express.static(path.join(__dirname, '..'), {
  index: false,
  // Only allow specific files to be served from the root
  setHeaders: (res, filePath) => {
    const filename = path.basename(filePath);
    if (filename === 'google4b945706e36a5db4.html' || 
        filename === 'google9fGsDdnUDR_1_WC3hApOV0nkhDs7MQL9ZVA1s5UC5nU.html') {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

(async () => {
  // Create storage instance
  const storage = new MemStorage();

  // Seed the database with initial data
  try {
    await seedDatabase(storage);
    log("Database seeded successfully");
  } catch (error) {
    log("Error seeding database:", error instanceof Error ? error.message : String(error));
  }

  // Set up session handling
  app.use(session({
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'smartdispute-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport to use local strategy
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await authenticateUser(storage, username, password);
        if (!user) {
          return done(null, false, { message: 'Incorrect username or password' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Serialize user to the session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error('User not found'));
      }
      done(null, getSafeUser(user));
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  app.use((req: any, _res: Response, next: NextFunction) => {
    // Add isAuthenticated method to request object
    req.isAuthenticated = function() {
      return this.user != null;
    };
    next();
  });

  // Add route for Claude API test
  app.get('/claude-test', (req: Request, res: Response) => {
    console.log('Serving Claude API test page');
    const filePath = path.join(__dirname, '../claude-test.html');
    res.sendFile(filePath);
  });

  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
    throw err;
  });

  // Setup Vite or static serving
  app.get("env") === "development" ? await setupVite(app, server) : serveStatic(app);

  return server.listen(5000, "0.0.0.0", () => log("serving on port 5000"));
})();