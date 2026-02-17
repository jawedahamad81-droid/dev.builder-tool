export const layoutPresets = [
  {
    id: "hero",
    label: "Hero Section",
    build() {
      return {
        root: "hero",
        nodes: {
          hero: {
            id: "hero",
            type: "container",
            props: { layout: "grid12", gap: 16, padding: 32 },
            children: ["hero_col"]
          },
          hero_col: {
            id: "hero_col",
            type: "col",
            props: { span: 12 },
            children: []
          }
        }
      };
    }
  },

  {
    id: "sidebar",
    label: "Sidebar + Content",
    build() {
      return {
        root: "section",
        nodes: {
          section: {
            id: "section",
            type: "container",
            props: { layout: "grid12", gap: 16, padding: 16 },
            children: ["sidebar", "content"]
          },
          sidebar: {
            id: "sidebar",
            type: "col",
            props: { spanLg: 3, spanMd: 4, spanSm: 12 },
            children: []
          },
          content: {
            id: "content",
            type: "col",
            props: { spanLg: 9, spanMd: 8, spanSm: 12 },
            children: []
          }
        }
      };
    }
  },

  {
    id: "threeCol",
    label: "3 Column Grid",
    build() {
      return {
        root: "grid",
        nodes: {
          grid: {
            id: "grid",
            type: "container",
            props: { layout: "grid12", gap: 16, padding: 16 },
            children: ["c1", "c2", "c3"]
          },
          c1: { id: "c1", type: "col", props: { span: 4 }, children: [] },
          c2: { id: "c2", type: "col", props: { span: 4 }, children: [] },
          c3: { id: "c3", type: "col", props: { span: 4 }, children: [] }
        }
      };
    }
  }
];
