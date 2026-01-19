// packages/runtime/src/Renderer.tsx
import React from "react";
import type { AppModel, Node } from "@packages/schemas";

export function Renderer({
  app,
  pageId,
  selectedNodeId,
  onSelectNode
}: {
  app: AppModel;
  pageId: string;
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
}) {
  const page = app.pages.find((p) => p.id === pageId) ?? app.pages[0];
  return <RenderNode app={app} nodeId={page.rootNodeId} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode} />;
}

function RenderNode({
  app,
  nodeId,
  selectedNodeId,
  onSelectNode
}: {
  app: AppModel;
  nodeId: string;
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
}) {
  const node = app.nodes[nodeId];
  if (!node) return null;

  const isSelected = selectedNodeId === nodeId;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectNode(nodeId);
      }}
      style={{
        position: "relative",
        borderRadius: 14,
        outline: isSelected ? "2px solid rgba(37,99,235,0.55)" : "1px solid rgba(0,0,0,0.06)",
        background: isSelected ? "rgba(37,99,235,0.04)" : "transparent",
        padding: 8,
        marginBottom: 8
      }}
    >
      {/* Selection label */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: 10,
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 999,
            background: "rgba(37,99,235,0.10)",
            border: "1px solid rgba(37,99,235,0.25)"
          }}
        >
          {node.type} • {nodeId}
        </div>
      )}

      {renderByType(app, node, selectedNodeId, onSelectNode)}
    </div>
  );
}

function renderByType(
  app: AppModel,
  node: Node,
  selectedNodeId: string,
  onSelectNode: (id: string) => void
) {
  switch (node.type) {
    case "text":
      return (
        <div style={{ fontSize: Number(node.props?.size ?? 16), fontWeight: 600 }}>
          {String(node.props?.value ?? "")}
        </div>
      );

    case "button":
      return (
        <button
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.14)",
            background: "white",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          {String(node.props?.label ?? "Button")}
        </button>
      );

    case "container": {
      const direction = String(node.props?.direction ?? "column");
      const gap = Number(node.props?.gap ?? 10);
      const padding = Number(node.props?.padding ?? 0);
      const border = Boolean(node.props?.border ?? false);

      return (
        <div
          style={{
            display: "flex",
            flexDirection: direction === "row" ? "row" : "column",
            gap,
            padding,
            borderRadius: 12,
            border: border ? "1px dashed rgba(0,0,0,0.20)" : "none",
            background: "rgba(0,0,0,0.02)"
          }}
        >
          {(node.children ?? []).length === 0 ? (
            <div style={{ fontSize: 12, opacity: 0.65, padding: 8 }}>
              Empty container — select it and add child components
            </div>
          ) : (
            node.children?.map((cid) => (
              <RenderNode
                key={cid}
                app={app}
                nodeId={cid}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
              />
            ))
          )}
        </div>
      );
    }

    default:
      return <div>Unknown node type: {String((node as any).type)}</div>;
  }
}
