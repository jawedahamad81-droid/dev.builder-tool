// apps/builder/src/app/api/projects/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getProjectsDir, projectFilePath } from "@/lib/paths";
import { AppSchema } from "@packages/schemas";

function ensureDirs() {
  const dir = getProjectsDir();
  fs.mkdirSync(dir, { recursive: true });
}

export async function GET() {
  ensureDirs();
  const dir = getProjectsDir();

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const items = files
    .map((f) => {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      const id = f.replace(".json", "");
      return { id, updatedAt: stat.mtime.toISOString() };
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  ensureDirs();
  const body = await req.json().catch(() => ({}));

  const projectId = String(body?.id || `proj_${Date.now()}`);
  const app = AppSchema.parse(body?.app); // validate schema

  fs.writeFileSync(projectFilePath(projectId), JSON.stringify(app, null, 2), "utf-8");
  return NextResponse.json({ ok: true, id: projectId });
}
