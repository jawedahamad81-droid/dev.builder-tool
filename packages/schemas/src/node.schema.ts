import { z } from "zod";
import { ComponentTypes } from "./component.types";

export const NodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(ComponentTypes),
  props: z.record(z.any()).default({}),
  children: z.array(z.string()).default([])
});

export type Node = z.infer<typeof NodeSchema>;
