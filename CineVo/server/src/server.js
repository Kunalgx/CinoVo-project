import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import dotenv from "dotenv";

// Load the server environment file regardless of whether this file is started
// from the repository root (production) or from server/ (local development).
const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(serverDirectory, "../.env") });

const { default: app } = await import("./app.js");
const { connectDB } = await import("./config/db.js");
const { seedAudioAvailability } = await import("./data/audioAvailability.seed.js");
const { frontendDist } = await import("./config/paths.js");

const PORT = process.env.PORT || 5000;


try {
  const frontendEntry = path.join(frontendDist, "index.html");
  if (!existsSync(frontendEntry)) {
    throw new Error(
      `Frontend build is missing: expected ${frontendEntry}. Run npm run build before npm start.`,
    );
  }

  await connectDB();
  await seedAudioAvailability();

  console.log("MongoDB connected");
  console.log(`Serving frontend from ${frontendDist}`);
  const server = app.listen(PORT,"0.0.0.0", () =>
    console.log(`Server running on http://localhost:${PORT}`),
  );
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error(`Server failed to start: ${error.message}`);
    }
    process.exitCode = 1;
  });
} catch (error) {
  const reason = String(error?.message || error)
    .replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "MongoDB connection string")
    .replace(/\s+/g, " ")
    .trim();

  console.error(`MongoDB connection failed: ${reason}`);
  console.error(
    "Check that the MongoDB cluster is reachable, your IP is allowed, and the URI credentials are URL-encoded.",
  );
  process.exitCode = 1;
}
