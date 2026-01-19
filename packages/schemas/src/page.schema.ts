import { z } from "zod";

export const PageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  routePath: z.string().min(1),
  rootNodeId: z.string().min(1)
});

export type Page = z.infer<typeof PageSchema>;
