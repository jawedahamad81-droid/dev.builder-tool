export const ComponentTypes = [
  "container",
  "text",
  "button"
] as const;

export type ComponentType = (typeof ComponentTypes)[number];
