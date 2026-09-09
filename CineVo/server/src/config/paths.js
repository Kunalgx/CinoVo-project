import path from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const serverDirectory = path.resolve(configDirectory, "../..");

// This is intentionally independent of process.cwd(), which changes when
// Render runs a package script from the repository root.
export const projectRoot = path.resolve(serverDirectory, "..");
export const frontendDist = path.join(projectRoot, "dist");
export const frontendAssets = path.join(frontendDist, "assets");
export const uploadsDirectory = path.join(projectRoot, "uploads");
