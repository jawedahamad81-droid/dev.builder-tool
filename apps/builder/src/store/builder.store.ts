import { create } from "zustand";
import { AppSchema, type AppModel, type Node } from "@packages/schemas";

type BuilderState = {
  app: AppModel;
  activePageId: string;
  selectedNodeId: string;

  // setters
  setActivePageId: (pageId: string) => void;
  setSelectedNodeId: (nodeId: string) => void;

  // mutations
  addNodeToRoot: (type: "text" | "button", defaults?: Record<string, any>) => void;
  updateSelectedProp: (key: string, value: any) => void;

  deleteNode: (nodeId: string) => void;
  moveNode: (nodeId: string, dir: "up" | "down") => void;
};

function uid(prefix = "n") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function clone<T>(v: T): T {
  // structuredClone is fine on modern browsers; this is safest across envs
  return JSON.parse(JSON.stringify(v));
}

function findParentId(app: AppModel, childId: string): string | null {
  for (const [id, node] of Object.entries(app.nodes)) {
    if ((node.children ?? []).includes(childId)) return id;
  }
  return null;
}

function removeFromParent(app: AppModel, childId: string) {
  const parentId = findParentId(app, childId);
  if (!parentId) return;

  const parent = app.nodes[parentId];
  parent.children = (parent.children ?? []).filter((x) => x !== childId);
}

function isRootNode(app: AppModel, nodeId: string) {
  return app.pages.some((p) => p.rootNodeId === nodeId);
}

function deleteSubtree(app: AppModel, nodeId: string) {
  const node = app.nodes[nodeId];
  if (!node) return;

  // delete children first
  for (const cid of node.children ?? []) {
    deleteSubtree(app, cid);
  }
  delete app.nodes[nodeId];
}

function moveChild(app: AppModel, parentId: string, childId: string, dir: "up" | "down") {
  const parent = app.nodes[parentId];
  if (!parent?.children?.length) return;

  const idx = parent.children.indexOf(childId);
  if (idx === -1) return;

  const nextIdx = dir === "up" ? idx - 1 : idx + 1;
  if (nextIdx < 0 || nextIdx >= parent.children.length) return;

  const arr = parent.children.slice();
  const [item] = arr.splice(idx, 1);
  arr.splice(nextIdx, 0, item);
  parent.children = arr;
}

const initialApp: AppModel = AppSchema.parse({
  id: "app_1",
  name: "My First Builder App",
  pages: [
    { id: "page_home", name: "Home", routePath: "/", rootNodeId: "root_home" },
    { id: "page_dashboard", name: "Dashboard", routePath: "/dashboard", rootNodeId: "root_dash" }
  ],
  nodes: {
    root_home: { id: "root_home", type: "container", props: { direction: "column", gap: 10 }, children: ["t1", "b1"] },
    t1: { id: "t1", type: "text", props: { value: "Home Page", size: 22 }, children: [] },
    b1: { id: "b1", type: "button", props: { label: "Click Me" }, children: [] },

    root_dash: { id: "root_dash", type: "container", props: { direction: "column", gap: 10 }, children: ["t2"] },
    t2: { id: "t2", type: "text", props: { value: "Dashboard Page", size: 22 }, children: [] }
  }
});

export const useBuilderStore = create<BuilderState>((set, get) => ({
  app: initialApp,
  activePageId: initialApp.pages[0].id,
  selectedNodeId: "",

  setActivePageId: (pageId) =>
    set(() => ({
      activePageId: pageId,
      selectedNodeId: "" // reset selection when switching pages
    })),

  setSelectedNodeId: (nodeId) => set(() => ({ selectedNodeId: nodeId })),

  addNodeToRoot: (type, defaults = {}) => {
    const { app, activePageId } = get();
    const page = app.pages.find((p) => p.id === activePageId) ?? app.pages[0];
    const rootId = page.rootNodeId;

    set(() => {
      const next = clone(app);
      const id = uid(type === "text" ? "text" : "btn");

      const node: Node =
        type === "text"
          ? { id, type: "text", props: { value: "New Text", size: 16, ...defaults }, children: [] }
          : { id, type: "button", props: { label: "New Button", ...defaults }, children: [] };

      next.nodes[id] = node;
      next.nodes[rootId].children = [...(next.nodes[rootId].children ?? []), id];

      return { app: AppSchema.parse(next), selectedNodeId: id };
    });
  },

  updateSelectedProp: (key, value) => {
    const { app, selectedNodeId } = get();
    if (!selectedNodeId) return;

    set(() => {
      const next = clone(app);
      const node = next.nodes[selectedNodeId];
      if (!node) return { app };

      node.props = { ...(node.props ?? {}), [key]: value };
      return { app: AppSchema.parse(next) };
    });
  },

  deleteNode: (nodeId) => {
    const { app, selectedNodeId } = get();
    if (!nodeId) return;
    if (isRootNode(app, nodeId)) return; // safety

    set(() => {
      const next = clone(app);

      // remove from parent children
      removeFromParent(next, nodeId);

      // delete subtree
      deleteSubtree(next, nodeId);

      const newSelected = selectedNodeId === nodeId ? "" : selectedNodeId;

      return { app: AppSchema.parse(next), selectedNodeId: newSelected };
    });
  },

  moveNode: (nodeId, dir) => {
    const { app } = get();
    if (!nodeId) return;
    if (isRootNode(app, nodeId)) return;

    const parentId = findParentId(app, nodeId);
    if (!parentId) return;

    set(() => {
      const next = clone(app);
      moveChild(next, parentId, nodeId, dir);
      return { app: AppSchema.parse(next) };
    });
  }
}));
