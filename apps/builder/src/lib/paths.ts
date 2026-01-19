// apps/builder/src/lib/paths.ts
import path from "path";

export function getDataDir() {
  // saves inside apps/builder/.data
  return path.join(process.cwd(), ".data");
}

export function getProjectsDir() {
  return path.join(getDataDir(), "projects");
}

export function projectFilePath(projectId: string) {
  return path.join(getProjectsDir(), `${projectId}.json`);
}
