"use client";

import React, { useMemo } from "react";
import { Renderer } from "@packages/runtime";
import OutlineTree from "../components/OutlineTree";
import { useBuilderStore } from "../store/builder.store";

export default function BuilderHome() {
  const app = useBuilderStore((s) => s.app);
  const activePageId = useBuilderStore((s) => s.activePageId);
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);

  const setActivePageId = useBuilderStore((s) => s.setActivePageId);
  const setSelectedNodeId = useBuilderStore((s) => s.setSelectedNodeId);

  const addNodeToRoot = useBuilderStore((s) => s.addNodeToRoot);
  const updateSelectedProp = useBuilderStore((s) => s.updateSelectedProp);

  const deleteNode = useBuilderStore((s) => s.deleteNode);
  const moveNode = useBuilderStore((s) => s.moveNode);

  const selectedNode = selectedNodeId ? app.nodes[selectedNodeId] : undefined;

  const page = useMemo(
    () => app.pages.find((p) => p.id === activePageId) ?? app.pages[0],
    [app.pages, activePageId]
  );

  function updateProp(key: string, value: any) {
    updateSelectedProp(key, value);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 340px", height: "100vh" }}>
      {/* Left */}
      <aside style={{ borderRight: "1px solid rgba(0,0,0,0.1)", padding: 12, overflow: "auto" }}>
        <h3 style={{ margin: 0 }}>Builder</h3>
        <p style={{ marginTop: 6, opacity: 0.7, fontSize: 13 }}>Day-2: Outline + Delete + Reorder + Store</p>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13, opacity: 0.8 }}>Page</label>
          <select
            value={activePageId}
            onChange={(e) => setActivePageId(e.target.value)}
            style={{ width: "100%", marginTop: 6, padding: 8, borderRadius: 10 }}
          >
            {app.pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.routePath})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          <button onClick={() => addNodeToRoot("text")} style={btnStyle}>
            + Add Text
          </button>
          <button onClick={() => addNodeToRoot("button")} style={btnStyle}>
            + Add Button
          </button>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
          Selected Node: <b>{selectedNodeId || "-"}</b>
        </div>

        <hr style={{ margin: "16px 0", opacity: 0.2 }} />

        <OutlineTree
          app={app}
          pageId={activePageId}
          selectedNodeId={selectedNodeId}
          onSelect={(id) => setSelectedNodeId(id)}
          onDelete={(id) => deleteNode(id)}
          onMove={(id, dir) => moveNode(id, dir)}
        />
      </aside>

      {/* Center */}
      <main style={{ padding: 12, background: "#f6f7fb" }}>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>Preview Canvas</div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 12, border: "1px solid rgba(0,0,0,0.08)" }}>
          <Renderer
            app={app}
            pageId={activePageId}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => setSelectedNodeId(id)}
          />
        </div>
      </main>

      {/* Right */}
      <aside style={{ borderLeft: "1px solid rgba(0,0,0,0.1)", padding: 12, overflow: "auto" }}>
        <h3 style={{ margin: 0 }}>Properties</h3>

        {!selectedNode ? (
          <p style={{ opacity: 0.7, fontSize: 13 }}>Click any component in preview or outline to edit.</p>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Type: <b>{selectedNode.type}</b>
            </div>

            {selectedNode.type === "text" && (
              <>
                <label style={labelStyle}>Text</label>
                <input
                  value={String(selectedNode.props.value ?? "")}
                  onChange={(e) => updateProp("value", e.target.value)}
                  style={inputStyle}
                />

                <label style={labelStyle}>Size</label>
                <input
                  type="number"
                  value={Number(selectedNode.props.size ?? 16)}
                  onChange={(e) => updateProp("size", Number(e.target.value))}
                  style={inputStyle}
                />
              </>
            )}

            {selectedNode.type === "button" && (
              <>
                <label style={labelStyle}>Label</label>
                <input
                  value={String(selectedNode.props.label ?? "")}
                  onChange={(e) => updateProp("label", e.target.value)}
                  style={inputStyle}
                />
              </>
            )}

            {selectedNode.type === "container" && (
              <>
                <label style={labelStyle}>Direction</label>
                <select
                  value={(selectedNode.props.direction as string) ?? "column"}
                  onChange={(e) => updateProp("direction", e.target.value)}
                  style={{ ...inputStyle, height: 38 }}
                >
                  <option value="column">column</option>
                  <option value="row">row</option>
                </select>

                <label style={labelStyle}>Gap</label>
                <input
                  type="number"
                  value={Number(selectedNode.props.gap ?? 8)}
                  onChange={(e) => updateProp("gap", Number(e.target.value))}
                  style={inputStyle}
                />
              </>
            )}
          </div>
        )}

        <hr style={{ margin: "16px 0", opacity: 0.2 }} />

        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
          App JSON (debug) — <b>{page.name}</b>
        </div>

        <pre
          style={{
            fontSize: 11,
            background: "#0b1020",
            color: "#e6edf3",
            padding: 10,
            borderRadius: 12,
            overflow: "auto",
            maxHeight: "55vh"
          }}
        >
          {JSON.stringify(app, null, 2)}
        </pre>
      </aside>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  cursor: "pointer",
  textAlign: "left"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  opacity: 0.75,
  marginTop: 12,
  marginBottom: 6
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  outline: "none"
};
