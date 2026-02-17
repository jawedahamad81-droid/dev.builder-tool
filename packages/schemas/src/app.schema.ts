import { z } from "zod";

/**
 * ============================
 * Node Types
 * ============================
 */
export const NodeTypeSchema = z.enum([
  "text",
  "button",
  "container",
  "row", // ✅ Day-12
  "col",

  // Day-10 generic UI components
  "image",
  "input",
  "iconButton",
  "badge",
  "card"
]);

/**
 * ============================
 * Repeat (collection rendering)
 * ============================
 */
export const RepeatSchema = z.object({
  source: z.string(), // app.data.collections.<source>
  item: z.string().default("item"),
  limit: z.number().optional()
});

/**
 * ============================
 * Node
 * ============================
 */
export const NodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
  props: z.record(z.any()).optional().default({}),
  children: z.array(z.string()).optional()
});

/**
 * ============================
 * Page
 * ============================
 */
export const PageSchema = z.object({
  id: z.string(),
  name: z.string(),
  routePath: z.string(),
  rootNodeId: z.string()
});

/**
 * ============================
 * Data Catalog
 * ============================
 */
export const DataCatalogSchema = z.object({
  collections: z.record(z.array(z.any())).default({})
});

/**
 * ============================
 * Component Library (Day-12)
 * Save a subtree as reusable component
 * ============================
 */
export const SavedComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  rootNodeId: z.string(),
  nodes: z.record(NodeSchema) // subtree snapshot
});

export const ComponentLibrarySchema = z.object({
  components: z.record(SavedComponentSchema).default({})
});

/**
 * ============================
 * App
 * ============================
 */
export const AppSchema = z.object({
  pages: z.array(PageSchema),
  nodes: z.record(NodeSchema),
  data: DataCatalogSchema.default({ collections: {} }),
  library: ComponentLibrarySchema.default({ components: {} }) // ✅ Day-12
});

/**
 * ============================
 * Types
 * ============================
 */
export type NodeType = z.infer<typeof NodeTypeSchema>;
export type Node = z.infer<typeof NodeSchema>;
export type AppModel = z.infer<typeof AppSchema>;
export type RepeatModel = z.infer<typeof RepeatSchema>;
export type SavedComponentModel = z.infer<typeof SavedComponentSchema>;
