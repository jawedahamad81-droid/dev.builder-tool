// apps/builder/src/store/builder.store.ts
import { create } from "zustand";
import { AppSchema, type AppModel, type Node } from "@packages/schemas";

/* =========================
   Types
========================= */

type History<T> = {
  past: T[];
  present: T;
  future: T[];
};

type NodeType = "text" | "button" | "container";

type BuilderState = {
  // ✅ Day-5 additions
  projectId: string;
  setProjectId: (id: string) => void;
  loadApp: (app: AppModel) => void;

  history: History<AppModel>;
  activePageId: string;
  selectedNodeId: string;

  // selectors
  app: () => AppModel;

  // page / selection
  setActivePageId: (pageId: string) => void;
  setSelectedNodeId: (nodeId: string) => void;

  // history
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // mutations
  addNodeToRoot: (type: NodeType, defaults?: Record<string, any>) => void;
  addNode: (parentId: string, type: NodeType, defaults?: Record<string, any>) => void;

  updateSelectedProp: (key: string, value: any) => void;
  deleteNode: (nodeId: string) => void;
  moveNode: (nodeId: string, dir: "up" | "down") => void;

  // Day-3 Drag & Drop (Outline)
  moveByDnD: (activeId: string, overId: string) => void;

  // Day-4
  duplicateNode: (nodeId: string) => void;
};

/* =========================
   Utils
========================= */

function uid(prefix = "n") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function isRootNode(app: AppModel, nodeId: string) {
  return app.pages.some((p) => p.rootNodeId === nodeId);
}

function findParentAndIndex(
  app: AppModel,
  childId: string
): { parentId: string; index: number } | null {
  for (const [pid, node] of Object.entries(app.nodes)) {
    const idx = (node.children ?? []).indexOf(childId);
    if (idx !== -1) return { parentId: pid, index: idx };
  }
  return null;
}

function removeChild(parent: Node, childId: string) {
  parent.children = (parent.children ?? []).filter((c) => c !== childId);
}

function insertChild(parent: Node, childId: string, index?: number) {
  const list = (parent.children ?? []).filter((c) => c !== childId);

  if (index === undefined || index < 0 || index > list.length) list.push(childId);
  else list.splice(index, 0, childId);

  parent.children = list;
}

function deleteSubtree(app: AppModel, nodeId: string) {
  const node = app.nodes[nodeId];
  if (!node) return;

  for (const cid of node.children ?? []) {
    deleteSubtree(app, cid);
  }
  delete app.nodes[nodeId];
}

function canHaveChildren(node?: Node) {
  return !!node && node.type === "container";
}

function makeNode(id: string, type: NodeType, defaults: Record<string, any> = {}): Node {
  if (type === "text") {
    return { id, type: "text", props: { value: "New Text", size: 16, ...defaults }, children: [] };
  }
  if (type === "button") {
    return { id, type: "button", props: { label: "New Button", ...defaults }, children: [] };
  }
  return {
    id,
    type: "container",
    props: { direction: "column", gap: 10, padding: 10, border: true, ...defaults },
    children: []
  };
}

// Deep duplicate subtree: creates new nodes with new ids, preserving structure.
function duplicateSubtree(draft: AppModel, sourceId: string): string {
  const idMap: Record<string, string> = {};

  function alloc(oldId: string) {
    const old = draft.nodes[oldId];
    const prefix = old.type === "text" ? "text" : old.type === "button" ? "btn" : "ct";
    idMap[oldId] = uid(prefix);
  }

  alloc(sourceId);

  function walk(oldId: string) {
    const old = draft.nodes[oldId];
    const newId = idMap[oldId];

    const newChildren: string[] = [];
    for (const cid of old.children ?? []) {
      alloc(cid);
      newChildren.push(idMap[cid]);
    }

    draft.nodes[newId] = {
      ...clone(old),
      id: newId,
      children: newChildren
    };

    for (const cid of old.children ?? []) walk(cid);
  }

  walk(sourceId);
  return idMap[sourceId];
}

/* =========================
   Initial App
========================= */

const initialApp: AppModel = AppSchema.parse({
  id: "app_1",
  name: "My First Builder App",
  pages: [
    { id: "page_home", name: "Home", routePath: "/", rootNodeId: "root_home" },
    { id: "page_dashboard", name: "Dashboard", routePath: "/dashboard", rootNodeId: "root_dash" }
  ],
  nodes: {
    root_home: {
      id: "root_home",
      type: "container",
      props: { direction: "column", gap: 10, padding: 12, border: false },
      children: ["t1", "b1"]
    },
    t1: { id: "t1", type: "text", props: { value: "Home Page", size: 22 }, children: [] },
    b1: { id: "b1", type: "button", props: { label: "Click Me" }, children: [] },

    root_dash: {
      id: "root_dash",
      type: "container",
      props: { direction: "column", gap: 10, padding: 12, border: false },
      children: ["t2"]
    },
    t2: { id: "t2", type: "text", props: { value: "Dashboard Page", size: 22 }, children: [] }
  }
});

/* =========================
   History Commit Helper
========================= */

function commit(mutator: (draft: AppModel) => void, get: () => BuilderState, set: any) {
  const current = get().history.present;
  const next = clone(current);

  mutator(next);

  const validated = AppSchema.parse(next);

  set((state: BuilderState) => ({
    history: {
      past: [...state.history.past, state.history.present],
      present: validated,
      future: []
    }
  }));
}

/* =========================
   Store
========================= */

export const useBuilderStore = create<BuilderState>((set, get) => ({
  // ✅ Day-5 initial value
  projectId: "default",

  // ✅ Day-5: set project id
  setProjectId: (id) => set(() => ({ projectId: id })),

  // ✅ Day-5: load app (replace whole model, reset history)
  loadApp: (app) =>
    set(() => {
      const validated = AppSchema.parse(app);
      return {
        history: { past: [], present: validated, future: [] },
        activePageId: validated.pages?.[0]?.id ?? "page_home",
        selectedNodeId: ""
      };
    }),

  history: {
    past: [],
    present: initialApp,
    future: []
  },

  activePageId: initialApp.pages[0].id,
  selectedNodeId: "",

  app: () => get().history.present,

  setActivePageId: (pageId) =>
    set(() => ({
      activePageId: pageId,
      selectedNodeId: ""
    })),

  setSelectedNodeId: (nodeId) => set(() => ({ selectedNodeId: nodeId })),

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,

  undo: () =>
    set((state) => {
      if (state.history.past.length === 0) return state;

      const prev = state.history.past[state.history.past.length - 1];
      return {
        ...state,
        history: {
          past: state.history.past.slice(0, -1),
          present: prev,
          future: [state.history.present, ...state.history.future]
        },
        selectedNodeId: ""
      };
    }),

  redo: () =>
    set((state) => {
      if (state.history.future.length === 0) return state;

      const next = state.history.future[0];
      return {
        ...state,
        history: {
          past: [...state.history.past, state.history.present],
          present: next,
          future: state.history.future.slice(1)
        },
        selectedNodeId: ""
      };
    }),

  addNodeToRoot: (type, defaults = {}) => {
    const app = get().history.present;
    const page = app.pages.find((p) => p.id === get().activePageId)!;
    const rootId = page.rootNodeId;
    get().addNode(rootId, type, defaults);
  },

  addNode: (parentId, type, defaults = {}) => {
    const app = get().history.present;
    const parent = app.nodes[parentId];
    if (!parent || parent.type !== "container") return;

    const id = uid(type === "text" ? "text" : type === "button" ? "btn" : "ct");

    commit(
      (draft) => {
        draft.nodes[id] = makeNode(id, type, defaults);
        draft.nodes[parentId].children = [...(draft.nodes[parentId].children ?? []), id];
      },
      get,
      set
    );

    set(() => ({ selectedNodeId: id }));
  },

  updateSelectedProp: (key, value) => {
    const id = get().selectedNodeId;
    if (!id) return;

    commit(
      (draft) => {
        const node = draft.nodes[id];
        if (!node) return;
        node.props = { ...(node.props ?? {}), [key]: value };
      },
      get,
      set
    );
  },

  deleteNode: (nodeId) => {
    const app = get().history.present;
    if (!nodeId || isRootNode(app, nodeId)) return;

    commit(
      (draft) => {
        const info = findParentAndIndex(draft, nodeId);
        if (info) removeChild(draft.nodes[info.parentId], nodeId);
        deleteSubtree(draft, nodeId);
      },
      get,
      set
    );

    if (get().selectedNodeId === nodeId) {
      set(() => ({ selectedNodeId: "" }));
    }
  },

  moveNode: (nodeId, dir) => {
    const app = get().history.present;
    if (!nodeId || isRootNode(app, nodeId)) return;

    const info = findParentAndIndex(app, nodeId);
    if (!info) return;

    commit(
      (draft) => {
        const parent = draft.nodes[info.parentId];
        const idx = parent.children.indexOf(nodeId);
        const nextIdx = dir === "up" ? idx - 1 : idx + 1;
        if (nextIdx < 0 || nextIdx >= parent.children.length) return;

        parent.children.splice(idx, 1);
        parent.children.splice(nextIdx, 0, nodeId);
      },
      get,
      set
    );
  },

  moveByDnD: (activeId, overId) => {
    const app = get().history.present;

    if (!activeId || !overId) return;
    if (activeId === overId) return;
    if (isRootNode(app, activeId)) return;

    const activeInfo = findParentAndIndex(app, activeId);
    if (!activeInfo) return;

    const isContainerDrop = overId.startsWith("list:");
    const targetContainerId = isContainerDrop ? overId.replace("list:", "") : null;

    commit(
      (draft) => {
        const activeParent = draft.nodes[activeInfo.parentId];
        if (!activeParent) return;

        removeChild(activeParent, activeId);

        if (targetContainerId) {
          const target = draft.nodes[targetContainerId];
          if (!canHaveChildren(target)) {
            insertChild(activeParent, activeId, activeInfo.index);
            return;
          }
          insertChild(target, activeId);
          return;
        }

        const overInfo = findParentAndIndex(draft, overId);
        if (!overInfo) {
          insertChild(activeParent, activeId, activeInfo.index);
          return;
        }

        const overParent = draft.nodes[overInfo.parentId];
        if (!overParent) {
          insertChild(activeParent, activeId, activeInfo.index);
          return;
        }

        insertChild(overParent, activeId, overInfo.index);
      },
      get,
      set
    );
  },

  duplicateNode: (nodeId) => {
    const app = get().history.present;
    if (!nodeId || isRootNode(app, nodeId)) return;

    const info = findParentAndIndex(app, nodeId);
    if (!info) return;

    let newRootId = "";

    commit(
      (draft) => {
        newRootId = duplicateSubtree(draft, nodeId);
        const parent = draft.nodes[info.parentId];
        insertChild(parent, newRootId, info.index + 1);
      },
      get,
      set
    );

    if (newRootId) set(() => ({ selectedNodeId: newRootId }));
  }
}));
