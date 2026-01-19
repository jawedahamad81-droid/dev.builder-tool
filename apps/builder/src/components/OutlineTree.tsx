"use client";

import React from "react";
import type { AppModel } from "@packages/schemas";

type Props = {
  app: AppModel;
  pageId: string;
  selectedNodeId: string;
  onSelect: (nodeId: string) => void;

  onDelete: (nodeId: string) => void;
  onMove: (nodeId: string, dir: "up" | "down") => void;
};

export default function OutlineTree({
  app,
  pageId,
  selectedNodeId,
  onSelect,
  onDelete,
  onMove
}: Props) {
  const page = app.pages.find((p) => p.id === pageId) ?? app.pages[0];
  const rootId = page.rootNodeId;

  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
        Outline — <b>{page.name}</b>
      </div>
      <TreeNode
        app={app}
        nodeId={rootId}
        level={0}
        selectedNodeId={selectedNodeId}
        onSelect={onSelect}
        onDelete={onDelete}
        onMove={onMove}
        isRoot
      />
    </div>
  );
}

function TreeNode({
  app,
  nodeId,
  level,
  selectedNodeId,
  onSelect,
  onDelete,
  onMove,
  isRoot
}: {
  app: AppModel;
  nodeId: string;
  level: number;
  selectedNodeId: string;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onMove: (nodeId: string, dir: "up" | "down") => void;
  isRoot?: boolean;
}) {
  const node = app.nodes[nodeId];
  if (!node) return null;

  const selected = selectedNodeId === nodeId;

  return (
    <div style={{ marginLeft: level * 10 }}>
      <div
        onClick={() => onSelect(nodeId)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 10px",
          borderRadius: 12,
          cursor: "pointer",
          background: selected ? "rgba(37,99,235,0.10)" : "transparent",
          border: selected ? "1px solid rgba(37,99,235,0.35)" : "1px solid rgba(0,0,0,0.08)"
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {node.type}
          </div>
          <div style={{ fontSize: 11, opacity: 0.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {nodeId}
          </div>
        </div>

        {!isRoot && (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(nodeId, "up");
              }}
              style={miniBtn}
              title="Move up"
            >
              ↑
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(nodeId, "down");
              }}
              style={miniBtn}
              title="Move down"
            >
              ↓
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(nodeId);
              }}
              style={{ ...miniBtn, borderColor: "rgba(220,38,38,0.35)" }}
              title="Delete"
            >
              🗑
            </button>
          </div>
        )}
      </div>

      {(node.children ?? []).length > 0 && (
        <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
          {node.children.map((cid) => (
            <TreeNode
              key={cid}
              app={app}
              nodeId={cid}
              level={level + 1}
              selectedNodeId={selectedNodeId}
              onSelect={onSelect}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const miniBtn: React.CSSProperties = {
  width: 32,
  height: 28,
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.14)",
  background: "white",
  cursor: "pointer"
};
