import React from "react";
import type { AppModel, Node } from "@packages/schemas";

type RendererProps = {
  app: AppModel;
  pageId: string;
  onSelectNode?: (nodeId: string) => void; // builder uses this
  selectedNodeId?: string;
};

function getNode(app: AppModel, id: string): Node | undefined {
  return app.nodes[id];
}

export function Renderer({ app, pageId, onSelectNode, selectedNodeId }: RendererProps) {
  const page = app.pages.find(p => p.id === pageId) ?? app.pages[0];
  const root = page ? getNode(app, page.rootNodeId) : undefined;

  if (!page || !root) return <div style={{ padding: 12 }}>Missing page/root</div>;

  return (
    <div style={{ padding: 12 }}>
      {renderNode(app, root.id, { onSelectNode, selectedNodeId })}
    </div>
  );
}

function SelectWrap({
  id,
  onSelectNode,
  selectedNodeId,
  children
}: {
  id: string;
  onSelectNode?: (id: string) => void;
  selectedNodeId?: string;
  children: React.ReactNode;
}) {
  const selected = selectedNodeId === id;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectNode?.(id);
      }}
      style={{
        outline: selected ? "2px solid #2563eb" : "1px dashed rgba(0,0,0,0.15)",
        borderRadius: 10,
        padding: 8,
        marginBottom: 8,
        cursor: onSelectNode ? "pointer" : "default"
      }}
      data-nodeid={id}
    >
      {children}
    </div>
  );
}

function renderNode(
  app: AppModel,
  nodeId: string,
  ctx: { onSelectNode?: (id: string) => void; selectedNodeId?: string }
): React.ReactNode {
  const node = getNode(app, nodeId);
  if (!node) return <div>Missing node: {nodeId}</div>;

  const children = node.children?.map((cid) => (
    <React.Fragment key={cid}>{renderNode(app, cid, ctx)}</React.Fragment>
  ));

  switch (node.type) {
    case "container": {
      const direction = (node.props.direction as "row" | "column") ?? "column";
      const gap = Number(node.props.gap ?? 8);

      return (
        <SelectWrap id={node.id} onSelectNode={ctx.onSelectNode} selectedNodeId={ctx.selectedNodeId}>
          <div
            style={{
              display: "flex",
              flexDirection: direction,
              gap,
              minHeight: 40
            }}
          >
            {children}
          </div>
        </SelectWrap>
      );
    }

    case "text": {
      const value = String(node.props.value ?? "Text");
      const size = Number(node.props.size ?? 16);

      return (
        <SelectWrap id={node.id} onSelectNode={ctx.onSelectNode} selectedNodeId={ctx.selectedNodeId}>
          <div style={{ fontSize: size }}>{value}</div>
        </SelectWrap>
      );
    }

    case "button": {
      const label = String(node.props.label ?? "Button");

      return (
        <SelectWrap id={node.id} onSelectNode={ctx.onSelectNode} selectedNodeId={ctx.selectedNodeId}>
          <button
            type="button"
            onClick={() => {
              // For now, runtime just logs. Later actions/workflows will run here.
              console.log("Button clicked:", node.id);
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.15)"
            }}
          >
            {label}
          </button>
        </SelectWrap>
      );
    }

    default:
      return <div>Unknown type: {(node as any).type}</div>;
  }
}
