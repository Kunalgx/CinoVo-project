import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedAudioAvailability } from "./data/audioAvailability.seed.js";

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  await seedAudioAvailability();

  console.log("MongoDB connected");
  const server = app.listen(PORT, () =>
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
