"use client";

import { create } from "zustand";
import { AppSchema, type AppModel, type Node, type NodeType } from "@packages/schemas";

type History<T> = { past: T[]; present: T; future: T[] };
type MoveDir = "up" | "down";

// ✅ Day-10 includes new components
type BuilderNodeType =
  | NodeType
  | "text"
  | "button"
  | "container"
  | "col"
  | "image"
  | "input"
  | "iconButton"
  | "badge"
  | "card";

export type BuilderState = {
  projectId: string;
  setProjectId: (id: string) => void;
  loadApp: (app: AppModel) => void;

  history: History<AppModel>;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  activePageId: string;
  setActivePageId: (id: string) => void;

  selectedNodeId: string;
  setSelectedNodeId: (id: string) => void;

  addNodeToRoot: (type: BuilderNodeType) => void;
  addNode: (parentId: string, type: BuilderNodeType, index?: number) => void;

  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;

  moveNode: (id: string, dir: MoveDir) => void;
  moveByDnD: (activeId: string, overId: string) => void;

  updateSelectedProp: (key: string, value: any) => void;
};

function uid(prefix = "node") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

function isRootNode(app: AppModel, nodeId: string) {
  return app.pages.some((p) => p.rootNodeId === nodeId);
}

function canHaveChildren(node?: Node) {
  return node?.type === "container" || node?.type === "col" || node?.type === "card";
}

function normalizeApp(app: AppModel): AppModel {
  const parsed = AppSchema.parse(app);
  const next = clone(parsed);

  for (const id of Object.keys(next.nodes)) {
    const n = next.nodes[id];
    if (canHaveChildren(n) && !Array.isArray(n.children)) n.children = [];
  }

  // Ensure data exists
  next.data = next.data ?? { collections: {} };
  next.data.collections = next.data.collections ?? {};

  return next;
}

function createNode(type: BuilderNodeType): Node {
  const id = uid(type);

  if (type === "text") {
    return { id, type: "text", props: { value: "Text {{index}}", size: 16 }, children: [] };
  }
  if (type === "button") {
    return { id, type: "button", props: { label: "Button" }, children: [] };
  }
  if (type === "container") {
    return {
      id,
      type: "container",
      props: {
        layout: "flex", // "flex" | "grid12"
        direction: "column",
        gap: 10,
        padding: 10,
        border: true
      },
      children: []
    };
  }
  if (type === "col") {
    return { id, type: "col", props: { span: 6, minHeight: 80 }, children: [] };
  }

  // ✅ Day-10 components
  if (type === "image") {
    return {
      id,
      type: "image",
      props: {
        src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=60",
        alt: "image",
        radius: 16,
        height: 180,
        fit: "cover"
      },
      children: []
    };
  }

  if (type === "input") {
    return {
      id,
      type: "input",
      props: {
        placeholder: "Search products…",
        value: "",
        radius: 999,
        height: 42
      },
      children: []
    };
  }

  if (type === "iconButton") {
    return {
      id,
      type: "iconButton",
      props: {
        icon: "heart", // heart | cart | star | user
        label: "",
        radius: 12
      },
      children: []
    };
  }

  if (type === "badge") {
    return {
      id,
      type: "badge",
      props: { text: "Top item", tone: "yellow" },
      children: []
    };
  }

  if (type === "card") {
    return {
      id,
      type: "card",
      props: { padding: 12, radius: 18, shadow: true },
      children: []
    };
  }

  return { id, type: "text", props: { value: "Text", size: 16 }, children: [] };
}

function removeChild(parent: Node, childId: string) {
  parent.children = (parent.children ?? []).filter((x) => x !== childId);
}

function insertChild(parent: Node, childId: string, index?: number) {
  const children = parent.children ?? [];
  const next = children.filter((x) => x !== childId);
  if (typeof index === "number") next.splice(index, 0, childId);
  else next.push(childId);
  parent.children = next;
}

function findParentAndIndex(app: AppModel, childId: string): { parentId: string; index: number } | null {
  for (const [pid, n] of Object.entries(app.nodes)) {
    const idx = (n.children ?? []).indexOf(childId);
    if (idx >= 0) return { parentId: pid, index: idx };
  }
  return null;
}

function deleteSubtree(app: AppModel, nodeId: string) {
  const n = app.nodes[nodeId];
  if (!n) return;
  for (const cid of n.children ?? []) deleteSubtree(app, cid);
  const p = findParentAndIndex(app, nodeId);
  if (p) {
    const parent = app.nodes[p.parentId];
    if (parent) removeChild(parent, nodeId);
  }
  delete app.nodes[nodeId];
}

function duplicateSubtree(app: AppModel, nodeId: string): string {
  const node = app.nodes[nodeId];
  if (!node) return "";
  const newId = uid(node.type);
  const copy: Node = { id: newId, type: node.type as any, props: clone(node.props ?? {}), children: [] };
  app.nodes[newId] = copy;
  for (const cid of node.children ?? []) {
    const childNewId = duplicateSubtree(app, cid);
    if (childNewId) copy.children?.push(childNewId);
  }
  return newId;
}

function initialApp(): AppModel {
  const rootId = "page_home";
  const app: AppModel = {
    pages: [{ id: "pg_home", name: "Home", routePath: "/", rootNodeId: rootId }],
    nodes: {
      [rootId]: {
        id: rootId,
        type: "container",
        props: { layout: "flex", direction: "column", gap: 14, padding: 16, border: false },
        children: []
      }
    },
    // ✅ Day-10 demo data
    data: {
      collections: {
        products: [
          { title: "Smart Watch", price: 454, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=60", rating: 4.7, top: true },
          { title: "Tennis Rackets", price: 30.99, image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60", rating: 4.6 },
          { title: "Boxing Gloves", price: 196.84, image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=60", rating: 4.8 }
        ]
      }
    }
  };

  return normalizeApp(app);
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  projectId: "default",
  setProjectId: (id) => set(() => ({ projectId: id })),

  loadApp: (app) =>
    set(() => {
      const parsed = normalizeApp(app);
      return {
        history: { past: [], present: parsed, future: [] },
        activePageId: parsed.pages?.[0]?.id ?? "pg_home",
        selectedNodeId: ""
      };
    }),

  history: { past: [], present: initialApp(), future: [] },

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,

  undo: () =>
    set(() => {
      const h = get().history;
      if (h.past.length === 0) return {};
      const prev = h.past[h.past.length - 1];
      return { history: { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future] } };
    }),

  redo: () =>
    set(() => {
      const h = get().history;
      if (h.future.length === 0) return {};
      const next = h.future[0];
      return { history: { past: [...h.past, h.present], present: next, future: h.future.slice(1) } };
    }),

  activePageId: "pg_home",
  setActivePageId: (id) => set(() => ({ activePageId: id })),

  selectedNodeId: "",
  setSelectedNodeId: (id) => set(() => ({ selectedNodeId: id })),

  addNodeToRoot: (type) => {
    const { history, activePageId } = get();
    const app = clone(history.present);
    const page = app.pages.find((p) => p.id === activePageId) ?? app.pages[0];
    const root = app.nodes[page.rootNodeId];
    if (!root || !canHaveChildren(root)) return;

    const node = createNode(type);
    app.nodes[node.id] = node;
    insertChild(root, node.id);

    const next = normalizeApp(app);
    set(() => ({
      history: { past: [...history.past, history.present], present: next, future: [] },
      selectedNodeId: node.id
    }));
  },

  addNode: (parentId, type, index) => {
    const { history } = get();
    const app = clone(history.present);
    const parent = app.nodes[parentId];
    if (!parent || !canHaveChildren(parent)) return;

    const node = createNode(type);
    app.nodes[node.id] = node;
    insertChild(parent, node.id, index);

    const next = normalizeApp(app);
    set(() => ({
      history: { past: [...history.past, history.present], present: next, future: [] },
      selectedNodeId: node.id
    }));
  },

  deleteNode: (id) => {
    const { history } = get();
    const app = clone(history.present);
    if (!id || isRootNode(app, id)) return;

    deleteSubtree(app, id);

    const next = normalizeApp(app);
    set(() => ({
      history: { past: [...history.past, history.present], present: next, future: [] },
      selectedNodeId: ""
    }));
  },

  duplicateNode: (id) => {
    const { history } = get();
    const app = clone(history.present);
    if (!id || isRootNode(app, id)) return;

    const info = findParentAndIndex(app, id);
    if (!info) return;

    const parent = app.nodes[info.parentId];
    if (!parent) return;

    const newId = duplicateSubtree(app, id);
    if (!newId) return;

    insertChild(parent, newId, info.index + 1);

    const next = normalizeApp(app);
    set(() => ({
      history: { past: [...history.past, history.present], present: next, future: [] },
      selectedNodeId: newId
    }));
  },

  moveNode: (id, dir) => {
    const { history } = get();
    const app = clone(history.present);
    if (!id || isRootNode(app, id)) return;

    const info = findParentAndIndex(app, id);
    if (!info) return;

    const parent = app.nodes[info.parentId];
    if (!parent) return;

    const children = parent.children ?? [];
    const idx = info.index;
    const nextIdx = dir === "up" ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= children.length) return;

    const nextChildren = [...children];
    [nextChildren[idx], nextChildren[nextIdx]] = [nextChildren[nextIdx], nextChildren[idx]];
    parent.children = nextChildren;

    const next = normalizeApp(app);
    set(() => ({ history: { past: [...history.past, history.present], present: next, future: [] } }));
  },

  updateSelectedProp: (key, value) => {
    const { history, selectedNodeId } = get();
    if (!selectedNodeId) return;

    const app = clone(history.present);
    const node = app.nodes[selectedNodeId];
    if (!node) return;

    node.props = node.props ?? {};
    node.props[key] = value;

    const next = normalizeApp(app);
    set(() => ({ history: { past: [...history.past, history.present], present: next, future: [] } }));
  },

  moveByDnD: (activeId, overId) => {
    const { history } = get();
    const app = clone(history.present);
    if (!activeId || !overId || activeId === overId) return;
    if (isRootNode(app, activeId)) return;

    const activeInfo = findParentAndIndex(app, activeId);
    if (!activeInfo) return;

    let position: "before" | "after" | null = null;
    let overNodeId = overId;

    if (overId.startsWith("before:")) {
      position = "before";
      overNodeId = overId.replace("before:", "");
    } else if (overId.startsWith("after:")) {
      position = "after";
      overNodeId = overId.replace("after:", "");
    }

    const isContainerDrop = overNodeId.startsWith("list:");
    const targetContainerId = isContainerDrop ? overNodeId.replace("list:", "") : null;

    const activeParent = app.nodes[activeInfo.parentId];
    if (!activeParent) return;

    removeChild(activeParent, activeId);

    if (targetContainerId) {
      const target = app.nodes[targetContainerId];
      if (!canHaveChildren(target)) insertChild(activeParent, activeId, activeInfo.index);
      else insertChild(target, activeId);

      const next = normalizeApp(app);
      set(() => ({ history: { past: [...history.past, history.present], present: next, future: [] } }));
      return;
    }

    const overInfo = findParentAndIndex(app, overNodeId);
    if (!overInfo) {
      insertChild(activeParent, activeId, activeInfo.index);
      return;
    }

    const overParent = app.nodes[overInfo.parentId];
    if (!overParent) {
      insertChild(activeParent, activeId, activeInfo.index);
      return;
    }

    const baseIndex = overInfo.index;
    const insertIndex = position === "after" ? baseIndex + 1 : baseIndex;
    insertChild(overParent, activeId, insertIndex);

    const next = normalizeApp(app);
    set(() => ({ history: { past: [...history.past, history.present], present: next, future: [] } }));
  }
}));
