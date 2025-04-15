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
const SessionStore = MemoryStore(session);
const app = express();

// Increase payload size limits
app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ extended: false, limit: "1000mb" }));
app.use(express.raw({ limit: "1000mb" }));

// Enable CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header("Access-Control-Allow-Origin", origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }

  next();
});

// Logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    const start = Date.now();
    res.on("finish", () => {
      log(`${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms`);
    });
  }
  next();
});

// Serve Google verification files
app.use(express.static(path.join(__dirname, ".."), {
  index: false,
  setHeaders: (res, filePath) => {
    const filename = path.basename(filePath);
    if (
      filename === "google4b945706e36a5db4.html" ||
      filename === "google9fGsDdnUDR_1_WC3hApOV0nkhDs7MQL9ZVA1s5UC5nU.html"
    ) {
      res.setHeader("Content-Type", "text/html");
    }
  }
}));

(async () => {
  const storage = new MemStorage();

  try {
    await seedDatabase(storage);
    log("Database seeded successfully");
  } catch (error) {
    log("Error seeding database:", error instanceof Error ? error.message : String(error));
  }

  app.use(session({
    store: new SessionStore({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || "smartdispute-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await authenticateUser(storage, username, password);
      if (!user) return done(null, false, { message: "Incorrect username or password" });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(new Error("User not found"));
      done(null, getSafeUser(user));
    } catch (error) {
      done(error);
    }
  });

  app.use((req: any, _res: Response, next: NextFunction) => {
    req.isAuthenticated = function () {
      return this.user != null;
    };
    next();
  });

  // Test pages
  app.get("/claude-test", (_req, res) => {
    res.sendFile(path.join(__dirname, "../claude-test.html"));
  });

  app.get("/ai-fallback-test", (_req, res) => {
    res.sendFile(path.join(__dirname, "../ai-fallback-test.html"));
  });

  app.get("/ai-service-test", (_req, res) => {
    res.sendFile(path.join(__dirname, "../ai-service-test.html"));
  });

  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
  });

  // Use Vite dev server or static build
  process.env.NODE_ENV === "development"
    ? await setupVite(app, server)
    : serveStatic(app);

  const PORT = process.env.PORT || 5000;
  return server.listen(PORT, "0.0.0.0", () => log(`Serving on port ${PORT}`));
})();
