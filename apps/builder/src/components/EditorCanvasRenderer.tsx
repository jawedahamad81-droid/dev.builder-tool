"use client";

import React from "react";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import type { AppModel, Node } from "@packages/schemas";

// ✅ Lucide icons (central registry)
import { Icons } from "./icons";

type NodeType = "text" | "button" | "container";

export type DropIndicator =
  | { kind: "node"; overNodeId: string; position: "before" | "after" }
  | { kind: "list"; containerId: string }
  | null;

function DropList({
  listId,
  activeListId,
  children
}: {
  listId: string; // list:<containerId>
  activeListId: string | null;
  children: (args: { isOver: boolean }) => React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: listId });
  const show = isOver || activeListId === listId;

  return (
    <div ref={setNodeRef} className={show ? "dropHint" : ""} style={{ borderRadius: 14 }}>
      {children({ isOver: show })}
    </div>
  );
}

function SortableNodeShell({
  nodeId,
  selected,
  label,
  indicator,
  onSelect,
  onDelete,
  onDuplicate,
  onAddChildText,
  onAddChildButton,
  onAddChildContainer,
  children
}: {
  nodeId: string;
  selected: boolean;
  label: string;
  indicator: DropIndicator;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddChildText?: () => void;
  onAddChildButton?: () => void;
  onAddChildContainer?: () => void;
  children: React.ReactNode;
}) {
  const sortableId = `node:${nodeId}`;

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: sortableId });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.55 : 1
  };

  const showBefore =
    indicator?.kind === "node" &&
    indicator.overNodeId === nodeId &&
    indicator.position === "before";

  const showAfter =
    indicator?.kind === "node" &&
    indicator.overNodeId === nodeId &&
    indicator.position === "after";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`nodeShell ${selected ? "nodeSelected" : "nodeIdle"}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* ✅ Drop indicator lines */}
      {showBefore && (
        <div
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            top: -6,
            height: 0,
            borderTop: "3px solid rgba(37,99,235,0.75)",
            borderRadius: 999
          }}
        />
      )}
      {showAfter && (
        <div
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: -6,
            height: 0,
            borderTop: "3px solid rgba(37,99,235,0.75)",
            borderRadius: 999
          }}
        />
      )}

      {/* Hover Toolbar */}
      <div className="nodeToolbar">
        <span className="kbd">{label}</span>

        {onAddChildText && (
          <button
            className="toolbarBtn"
            type="button"
            title="Add text inside"
            onClick={(e) => {
              e.stopPropagation();
              onAddChildText();
            }}
          >
            <Icons.Text size={14} />
          </button>
        )}

        {onAddChildButton && (
          <button
            className="toolbarBtn"
            type="button"
            title="Add button inside"
            onClick={(e) => {
              e.stopPropagation();
              onAddChildButton();
            }}
          >
            <Icons.Button size={14} />
          </button>
        )}

        {onAddChildContainer && (
          <button
            className="toolbarBtn"
            type="button"
            title="Add container inside"
            onClick={(e) => {
              e.stopPropagation();
              onAddChildContainer();
            }}
          >
            <Icons.Container size={14} />
          </button>
        )}

        <button
          className="toolbarBtn"
          type="button"
          title="Duplicate"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          <Icons.Duplicate size={14} />
        </button>

        <button
          className="toolbarBtn"
          type="button"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Icons.Delete size={14} />
        </button>
      </div>

      {/* Drag Handle */}
      <div
        className="nodeDragHandle"
        title="Drag to reorder/move"
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <Icons.Drag size={16} />
      </div>

      {children}
    </div>
  );
}

export default function EditorCanvasRenderer({
  app,
  pageId,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  onAddChild,
  indicator
}: {
  app: AppModel;
  pageId: string;
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onAddChild: (containerId: string, type: NodeType) => void;
  indicator: DropIndicator;
}) {
  const page = app.pages.find((p) => p.id === pageId) ?? app.pages[0];
  const rootId = page.rootNodeId;

  return (
    <DropList
      listId={`list:${rootId}`}
      activeListId={indicator?.kind === "list" ? `list:${indicator.containerId}` : null}
    >
      {() => (
        <RenderNode
          app={app}
          nodeId={rootId}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          onDeleteNode={onDeleteNode}
          onDuplicateNode={onDuplicateNode}
          onAddChild={onAddChild}
          indicator={indicator}
          isRoot
        />
      )}
    </DropList>
  );
}

function RenderNode({
  app,
  nodeId,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  onAddChild,
  indicator,
  isRoot = false
}: {
  app: AppModel;
  nodeId: string;
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onAddChild: (containerId: string, type: NodeType) => void;
  indicator: DropIndicator;
  isRoot?: boolean;
}) {
  const node = app.nodes[nodeId];
  if (!node) return null;

  const isSelected = selectedNodeId === nodeId;
  const childrenIds = node.children ?? [];
  const sortableChildren = childrenIds.map((cid) => `node:${cid}`);

  const label = `${node.type} • ${nodeId}`;

  const rendered = renderByType(
    app,
    node,
    selectedNodeId,
    onSelectNode,
    onDeleteNode,
    onDuplicateNode,
    onAddChild,
    indicator
  );

  if (isRoot) {
    // Root isn’t sortable, but it contains lists that are droppable/sortable
    return <div style={{ borderRadius: 18 }}>{rendered}</div>;
  }

  return (
    <SortableNodeShell
      nodeId={nodeId}
      selected={isSelected}
      label={label}
      indicator={indicator}
      onSelect={() => onSelectNode(nodeId)}
      onDelete={() => onDeleteNode(nodeId)}
      onDuplicate={() => onDuplicateNode(nodeId)}
      onAddChildText={node.type === "container" ? () => onAddChild(nodeId, "text") : undefined}
      onAddChildButton={node.type === "container" ? () => onAddChild(nodeId, "button") : undefined}
      onAddChildContainer={node.type === "container" ? () => onAddChild(nodeId, "container") : undefined}
    >
      {node.type === "container" ? (
        <DropList
          listId={`list:${nodeId}`}
          activeListId={indicator?.kind === "list" ? `list:${indicator.containerId}` : null}
        >
          {() => (
            <div style={{ borderRadius: 14 }}>
              <SortableContext items={sortableChildren} strategy={rectSortingStrategy}>
                {rendered}
              </SortableContext>
            </div>
          )}
        </DropList>
      ) : (
        rendered
      )}
    </SortableNodeShell>
  );
}

function renderByType(
  app: AppModel,
  node: Node,
  selectedNodeId: string,
  onSelectNode: (id: string) => void,
  onDeleteNode: (id: string) => void,
  onDuplicateNode: (id: string) => void,
  onAddChild: (containerId: string, type: NodeType) => void,
  indicator: DropIndicator
) {
  switch (node.type) {
    case "text":
      return (
        <div style={{ fontSize: Number(node.props?.size ?? 16), fontWeight: 800, padding: 8 }}>
          {String(node.props?.value ?? "")}
        </div>
      );

    case "button":
      return (
        <div style={{ padding: 8 }}>
          <button
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.14)",
              background: "white",
              cursor: "pointer",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 8
            }}
          >
            {/* Optional icon inside button if you want */}
            {/* <Icons.Button size={16} /> */}
            {String(node.props?.label ?? "Button")}
          </button>
        </div>
      );

    case "container": {
      const direction = String(node.props?.direction ?? "column");
      const gap = Number(node.props?.gap ?? 10);
      const padding = Number(node.props?.padding ?? 10);
      const border = Boolean(node.props?.border ?? true);

      return (
        <div
          style={{
            display: "flex",
            flexDirection: direction === "row" ? "row" : "column",
            gap,
            padding,
            borderRadius: 14,
            border: border ? "1px dashed rgba(0,0,0,0.20)" : "none",
            background: "rgba(255,255,255,0.62)"
          }}
        >
          {(node.children ?? []).length === 0 ? (
            <div className="containerEmptyHint">Drop here • or use + in toolbar</div>
          ) : (
            node.children?.map((cid) => (
              <RenderNode
                key={cid}
                app={app}
                nodeId={cid}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
                onDeleteNode={onDeleteNode}
                onDuplicateNode={onDuplicateNode}
                onAddChild={onAddChild}
                indicator={indicator}
              />
            ))
          )}
        </div>
      );
    }

    default:
      return <div style={{ padding: 10 }}>Unknown node type</div>;
  }
}
