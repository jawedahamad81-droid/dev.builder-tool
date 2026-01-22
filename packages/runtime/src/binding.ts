export type BindingContext = Record<string, any>;

/**
 * Resolve "a.b.c" from ctx safely.
 */
function getPath(ctx: BindingContext, path: string) {
  const parts = path.split(".").filter(Boolean);
  let cur: any = ctx;
  for (const p of parts) {
    if (cur == null) return "";
    cur = cur[p];
  }
  return cur ?? "";
}

/**
 * Replace {{path}} placeholders in strings.
 * Examples:
 *  "{{item.title}}"
 *  "₹{{item.price}}"
 *  "{{index}}"
 */
export function resolveTemplate(input: any, ctx: BindingContext) {
  if (typeof input !== "string") return input;

  return input.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expr) => {
    const key = String(expr ?? "").trim();
    if (!key) return "";
    const val = getPath(ctx, key);
    return String(val ?? "");
  });
}
