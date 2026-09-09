import path from "node:path";
import { fileURLToPath } from "node:url";

const serverSrcDirectory = path.dirname(fileURLToPath(import.meta.url));

export const projectRoot = path.resolve(serverSrcDirectory, "../../..");
export const frontendDist = path.join(projectRoot, "dist");
export const uploadsDirectory = path.join(projectRoot, "uploads");