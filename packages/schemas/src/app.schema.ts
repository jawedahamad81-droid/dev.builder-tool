import { z } from "zod";
import { PageSchema } from "./page.schema";
import { NodeSchema } from "./node.schema";

export const AppSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  pages: z.array(PageSchema).min(1),
  nodes: z.record(NodeSchema) // map: nodeId -> node
});

export type AppModel = z.infer<typeof AppSchema>;
