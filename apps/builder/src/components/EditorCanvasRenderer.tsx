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
import { resolveTemplate } from "@packages/runtime";
import { Icons } from "./icons";
import { Heart, ShoppingCart, Star, User } from "lucide-react";

type NodeType =
  | "text"
  | "button"
  | "container"
  | "col"
  | "image"
  | "input"
  | "iconButton"
  | "badge"
  | "card";

export type DropIndicator =
  | { kind: "node"; overNodeId: string; position: "before" | "after" }
  | { kind: "list"; containerId: string }
  | null;

type Ctx = Record<string, any>;

function DropList({
  listId,
  activeListId,
  children
}: {
  listId: string;
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
  children
}: {
  nodeId: string;
  selected: boolean;
  label: string;
  indicator: DropIndicator;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
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

      <div className="nodeToolbar">
        <span className="kbd">{label}</span>

        <button className="toolbarBtn" type="button" title="Duplicate"
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
          <Icons.Duplicate size={14} />
        </button>

        <button className="toolbarBtn" type="button" title="Delete"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Icons.Delete size={14} />
        </button>
      </div>

      <div
        className="nodeDragHandle"
        title="Drag"
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
          ctx={{}}
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
  isRoot = false,
  ctx
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
  ctx: Ctx;
}) {
  const node = app.nodes[nodeId];
  if (!node) return null;

  const isSelected = selectedNodeId === nodeId;
  const childrenIds = node.children ?? [];
  const sortableChildren = childrenIds.map((cid) => `node:${cid}`);

  const label = `${node.type} • ${nodeId}`;

  const rendered = renderByType(app, node, ctx, selectedNodeId, onSelectNode, onDeleteNode, onDuplicateNode, onAddChild, indicator);

  if (isRoot) return <div style={{ borderRadius: 18 }}>{rendered}</div>;

  const isDroppable = node.type === "container" || node.type === "col" || node.type === "card";

  return (
    <SortableNodeShell
      nodeId={nodeId}
      selected={isSelected}
      label={label}
      indicator={indicator}
      onSelect={() => onSelectNode(nodeId)}
      onDelete={() => onDeleteNode(nodeId)}
      onDuplicate={() => onDuplicateNode(nodeId)}
    >
      {isDroppable ? (
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

function iconFromName(name: string) {
  const n = (name ?? "").toLowerCase();
  if (n === "heart") return Heart;
  if (n === "cart") return ShoppingCart;
  if (n === "star") return Star;
  if (n === "user") return User;
  return Heart;
}

function renderByType(
  app: AppModel,
  node: Node,
  ctx: Ctx,
  selectedNodeId: string,
  onSelectNode: (id: string) => void,
  onDeleteNode: (id: string) => void,
  onDuplicateNode: (id: string) => void,
  onAddChild: (containerId: string, type: NodeType) => void,
  indicator: DropIndicator
) {
  switch (node.type) {
    case "text": {
      const value = resolveTemplate(node.props?.value ?? "", ctx);
      const size = Number(resolveTemplate(node.props?.size ?? 16, ctx));
      return (
        <div style={{ fontSize: size, fontWeight: 800, padding: 8 }}>
          {String(value)}
        </div>
      );
    }

    case "button": {
      const label = resolveTemplate(node.props?.label ?? "Button", ctx);
      return (
        <div style={{ padding: 8 }}>
          <button
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.14)",
              background: "white",
              cursor: "pointer",
              fontWeight: 800
            }}
          >
            {String(label)}
          </button>
        </div>
      );
    }

    case "image": {
      const src = resolveTemplate(node.props?.src ?? "", ctx);
      const alt = resolveTemplate(node.props?.alt ?? "image", ctx);
      const radius = Number(node.props?.radius ?? 16);
      const height = Number(node.props?.height ?? 180);
      const fit = String(node.props?.fit ?? "cover");
      return (
        <div style={{ padding: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={String(src)}
            alt={String(alt)}
            style={{
              width: "100%",
              height,
              objectFit: fit as any,
              borderRadius: radius,
              border: "1px solid rgba(0,0,0,0.08)"
            }}
          />
        </div>
      );
    }

    case "input": {
      const placeholder = resolveTemplate(node.props?.placeholder ?? "Search…", ctx);
      const radius = Number(node.props?.radius ?? 999);
      const height = Number(node.props?.height ?? 42);
      return (
        <div style={{ padding: 8 }}>
          <input
            value={String(node.props?.value ?? "")}
            placeholder={String(placeholder)}
            onChange={() => {}}
            style={{
              width: "100%",
              height,
              padding: "0 14px",
              borderRadius: radius,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "white",
              outline: "none",
              fontWeight: 700
            }}
          />
        </div>
      );
    }

    case "badge": {
      const text = resolveTemplate(node.props?.text ?? "Badge", ctx);
      const tone = String(node.props?.tone ?? "yellow");
      const bg =
        tone === "yellow" ? "rgba(250,204,21,0.22)" :
        tone === "purple" ? "rgba(139,92,246,0.18)" :
        "rgba(59,130,246,0.18)";

      return (
        <div style={{ padding: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              borderRadius: 999,
              background: bg,
              border: "1px solid rgba(0,0,0,0.08)",
              fontWeight: 900,
              fontSize: 12
            }}
          >
            {String(text)}
          </span>
        </div>
      );
    }

    case "iconButton": {
      const icon = String(resolveTemplate(node.props?.icon ?? "heart", ctx));
      const label = resolveTemplate(node.props?.label ?? "", ctx);
      const radius = Number(node.props?.radius ?? 12);
      const Icon = iconFromName(icon);

      return (
        <div style={{ padding: 8 }}>
          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: radius,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "white",
              cursor: "pointer",
              fontWeight: 900
            }}
          >
            <Icon size={16} />
            {label ? <span>{String(label)}</span> : null}
          </button>
        </div>
      );
    }

    case "card": {
      const padding = Number(node.props?.padding ?? 12);
      const radius = Number(node.props?.radius ?? 18);
      const shadow = Boolean(node.props?.shadow ?? true);

      return (
        <div
          style={{
            padding,
            borderRadius: radius,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(255,255,255,0.92)",
            boxShadow: shadow ? "0 18px 40px rgba(0,0,0,0.06)" : "none"
          }}
        >
          {(node.children ?? []).length === 0 ? (
            <div className="containerEmptyHint">Drop components into card</div>
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
                ctx={ctx}
              />
            ))
          )}
        </div>
      );
    }

    case "col": {
      const span = Math.min(12, Math.max(1, Number(node.props?.span ?? 6)));
      const minHeight = Number(node.props?.minHeight ?? 80);

      return (
        <div
          style={{
            gridColumn: `span ${span}`,
            minHeight,
            borderRadius: 14,
            border: "1px solid rgba(15,23,42,0.10)",
            background: "rgba(255,255,255,0.85)",
            padding: 10
          }}
        >
          {(node.children ?? []).length === 0 ? (
            <div className="containerEmptyHint">Drop components here</div>
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
                ctx={ctx}
              />
            ))
          )}
        </div>
      );
    }

    case "container": {
      const layout = String(node.props?.layout ?? "flex");
      const gap = Number(node.props?.gap ?? 10);
      const padding = Number(node.props?.padding ?? 10);
      const border = Boolean(node.props?.border ?? true);

      // ✅ Day-10: repeat support on containers
      const repeat = node.props?.repeat as any | undefined;
      const hasRepeat = repeat?.source && app.data?.collections?.[repeat.source];

      const items: any[] = hasRepeat ? app.data.collections[repeat.source] : [];
      const limit = hasRepeat && typeof repeat.limit === "number" ? repeat.limit : undefined;
      const list = hasRepeat ? (limit ? items.slice(0, limit) : items) : null;

      const renderChildren = (ctxLocal: Ctx) => {
        if ((node.children ?? []).length === 0) return <div className="containerEmptyHint">Drop here</div>;
        return node.children?.map((cid) => (
          <RenderNode
            key={`${cid}`}
            app={app}
            nodeId={cid}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            onDeleteNode={onDeleteNode}
            onDuplicateNode={onDuplicateNode}
            onAddChild={onAddChild}
            indicator={indicator}
            ctx={ctxLocal}
          />
        ));
      };

      const content = list
        ? list.map((item, index) => {
            const varName = String(repeat.item ?? "item");
            const ctxItem = { ...ctx, [varName]: item, index };
            // Render the SAME template nodes for each item (select edits template)
            return (
              <div key={`rep_${node.id}_${index}`}>
                {renderChildren(ctxItem)}
              </div>
            );
          })
        : renderChildren(ctx);

      if (layout === "grid12") {
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
              gap,
              padding,
              borderRadius: 14,
              border: border ? "1px dashed rgba(0,0,0,0.20)" : "none",
              background: "rgba(255,255,255,0.62)"
            }}
          >
            {content}
          </div>
        );
      }

      const direction = String(node.props?.direction ?? "column");
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
          {content}
        </div>
      );
    }

    default:
      return <div style={{ padding: 10 }}>Unknown node type</div>;
  }
}
