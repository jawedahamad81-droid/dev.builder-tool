import { z } from "zod";

export const NodeTypeSchema = z.enum([
  "text",
  "button",
  "container",
  "col",
  // ✅ Day-10 generic UI components
  "image",
  "input",
  "iconButton",
  "badge",
  "card"
]);

export const RepeatSchema = z.object({
  // points to app.data.collections.<source>
  source: z.string(), // e.g. "products", "rooms", "movies"
  item: z.string().default("item"), // variable name used in bindings
  limit: z.number().optional()
});

export const NodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
  props: z.record(z.any()).optional(),
  children: z.array(z.string()).optional()
});

export const PageSchema = z.object({
  id: z.string(),
  name: z.string(),
  routePath: z.string(),
  rootNodeId: z.string()
});

export const DataCatalogSchema = z.object({
  collections: z.record(z.array(z.any())).default({})
});

export const AppSchema = z.object({
  pages: z.array(PageSchema),
  nodes: z.record(NodeSchema),
  // ✅ Day-10 data catalog stored with app (dummy now, later API sync)
  data: DataCatalogSchema.default({ collections: {} })
});

export type NodeType = z.infer<typeof NodeTypeSchema>;
export type Node = z.infer<typeof NodeSchema>;
export type AppModel = z.infer<typeof AppSchema>;
export type RepeatModel = z.infer<typeof RepeatSchema>;
