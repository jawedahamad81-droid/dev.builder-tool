// apps/builder/src/app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import { projectFilePath } from "@/lib/paths";
import { AppSchema } from "@packages/schemas";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const file = projectFilePath(params.id);
  if (!fs.existsSync(file)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const raw = fs.readFileSync(file, "utf-8");
  const app = AppSchema.parse(JSON.parse(raw));
  return NextResponse.json({ id: params.id, app });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const app = AppSchema.parse(body?.app);

  const file = projectFilePath(params.id);
  fs.writeFileSync(file, JSON.stringify(app, null, 2), "utf-8");
  return NextResponse.json({ ok: true });
}
