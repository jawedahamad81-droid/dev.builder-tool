"use client";

import React from "react";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
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
  | "row"
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
    <div
      ref={setNodeRef}
      className={show ? "dropHint" : ""}
      style={{
        borderRadius: 14,
        minHeight: 120,
        padding: 10
      }}
    >
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
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: sortableId
  });

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
      {showBefore && <div className="dropLine top" />}
      {showAfter && <div className="dropLine bottom" />}

      <div className="nodeToolbar">
        <span className="kbd">{label}</span>

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

  return (
    <DropList
      listId={`list:${page.rootNodeId}`}
      activeListId={indicator?.kind === "list" ? `list:${indicator.containerId}` : null}
    >
      {() => (
        <RenderNode
          app={app}
          nodeId={page.rootNodeId}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          onDeleteNode={onDeleteNode}
          onDuplicateNode={onDuplicateNode}
          onAddChild={onAddChild}
          indicator={indicator}
          ctx={{}}
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
  ctx,
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
  ctx: Ctx;
  isRoot?: boolean;
}) {
  const node = app.nodes[nodeId];
  if (!node) return null;

  const rendered = renderByType(app, node, ctx, selectedNodeId, onSelectNode, onDeleteNode, onDuplicateNode, onAddChild, indicator);

  if (isRoot) return <div>{rendered}</div>;

  const isDroppable = ["container", "row", "col", "card"].includes(node.type);

  return (
    <SortableNodeShell
      nodeId={nodeId}
      selected={selectedNodeId === nodeId}
      label={`${node.type} • ${nodeId}`}
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
            <SortableContext items={(node.children ?? []).map((c) => `node:${c}`)} strategy={rectSortingStrategy}>
              {rendered}
            </SortableContext>
          )}
        </DropList>
      ) : (
        rendered
      )}
    </SortableNodeShell>
  );
}

function iconFromName(name: string) {
  switch ((name ?? "").toLowerCase()) {
    case "cart":
      return ShoppingCart;
    case "star":
      return Star;
    case "user":
      return User;
    default:
      return Heart;
  }
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
  // TEXT
  if (node.type === "text") {
    return (
      <div style={{ padding: 8, fontWeight: 800, fontSize: Number(resolveTemplate(node.props?.size ?? 16, ctx)) }}>
        {String(resolveTemplate(node.props?.value ?? "", ctx))}
      </div>
    );
  }

  // INPUT (✅ fixed spacing)
  if (node.type === "input") {
    const placeholder = resolveTemplate(node.props?.placeholder ?? "Search…", ctx);
    return (
      <div style={{ padding: 8 }}>
        <input
          className="canvasInput"
          placeholder={String(placeholder)}
          value={String(node.props?.value ?? "")}
          readOnly
        />
      </div>
    );
  }

  // BUTTON
  if (node.type === "button") {
    return (
      <div style={{ padding: 8 }}>
        <button className="btnPrimary" type="button">
          {String(resolveTemplate(node.props?.label ?? "Button", ctx))}
        </button>
      </div>
    );
  }

  // IMAGE
  if (node.type === "image") {
    return (
      <div style={{ padding: 8 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={String(resolveTemplate(node.props?.src ?? "", ctx))}
          alt={String(resolveTemplate(node.props?.alt ?? "", ctx))}
          style={{
            width: "100%",
            height: Number(node.props?.height ?? 180),
            borderRadius: Number(node.props?.radius ?? 16),
            objectFit: String(node.props?.fit ?? "cover") as any,
            border: "1px solid rgba(0,0,0,0.08)"
          }}
        />
      </div>
    );
  }

  // ICON BUTTON
  if (node.type === "iconButton") {
    const Icon = iconFromName(node.props?.icon ?? "heart");
    return (
      <div style={{ padding: 8 }}>
        <button className="btn" type="button">
          <Icon size={16} />
          {node.props?.label ? <span>{String(resolveTemplate(node.props.label, ctx))}</span> : null}
        </button>
      </div>
    );
  }

  // BADGE
  if (node.type === "badge") {
    return (
      <div style={{ padding: 8 }}>
        <span className="badge">{String(resolveTemplate(node.props?.text ?? "Badge", ctx))}</span>
      </div>
    );
  }

  // CARD
  if (node.type === "card") {
    const padding = Number(node.props?.padding ?? 12);
    const radius = Number(node.props?.radius ?? 18);
    const shadow = Boolean(node.props?.shadow ?? true);

    return (
      <div
        className="card"
        style={{
          padding,
          borderRadius: radius,
          boxShadow: shadow ? "0 18px 40px rgba(0,0,0,0.06)" : "none"
        }}
      >
        {(node.children ?? []).length === 0 ? (
          <div className="containerEmptyHint">Drop components into card</div>
        ) : (
          node.children?.map((cid) => (
            <RenderNode
              key={`${cid}_${ctx.index ?? "base"}`}
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

  // COL (children live here)
  if (node.type === "col") {
    const minHeight = Number(node.props?.minHeight ?? 90);
    const padding = Number(node.props?.padding ?? 10);

    return (
      <div
        style={{
          minHeight,
          borderRadius: 14,
          border: "1px solid rgba(15,23,42,0.10)",
          background: "rgba(255,255,255,0.85)",
          padding
        }}
      >
        {(node.children ?? []).length === 0 ? (
          <div className="containerEmptyHint">Drop components here</div>
        ) : (
          node.children?.map((cid) => (
            <RenderNode
              key={`${cid}_${ctx.index ?? "base"}`}
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

  // ROW (✅ Day-12)
  if (node.type === "row") {
    const gap = Number(node.props?.gap ?? 12);
    const padding = Number(node.props?.padding ?? 0);
    const repeat = node.props?.repeat as any | undefined;

    const hasRepeat = repeat?.source && app.data?.collections?.[repeat.source];
    const items: any[] = hasRepeat ? app.data.collections[repeat.source] : [];
    const limit = hasRepeat && typeof repeat.limit === "number" ? repeat.limit : undefined;
    const list = hasRepeat ? (limit ? items.slice(0, limit) : items) : null;

    const renderCols = (ctxLocal: Ctx) => {
      if ((node.children ?? []).length === 0) return <div className="containerEmptyHint">Drop columns here</div>;

      // each child should be a col; we still render whatever is there
      return node.children?.map((cid) => (
        <div key={`${cid}_${ctxLocal.index ?? "base"}`} className="gridColSpan">
          <RenderNode
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
        </div>
      ));
    };

    // If repeat exists, render SAME template columns for each item
    const content = list
      ? list.map((item, index) => {
        const varName = String(repeat.item ?? "item");
        const ctxItem = { ...ctx, [varName]: item, index };
        return <React.Fragment key={`rep_${node.id}_${index}`}>{renderCols(ctxItem)}</React.Fragment>;
      })
      : renderCols(ctx);

    return (
      <div className="grid12" style={{ gap, padding }}>
        {content}
      </div>
    );
  }

  // CONTAINER (section / wrapper)
  if (node.type === "container") {
    const layout = String(node.props?.layout ?? "flex");
    const gap = Number(node.props?.gap ?? 12);
    const padding = Number(node.props?.padding ?? 12);
    const border = Boolean(node.props?.border ?? true);
    const direction = String(node.props?.direction ?? "column");

    const children = (node.children ?? []).length
      ? node.children!.map((cid) => (
        <RenderNode
          key={`${cid}_${ctx.index ?? "base"}`}
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
      : [<div key="empty" className="containerEmptyHint">Drop rows / components here</div>];

    if (layout === "grid12") {
      return (
        <div
          className="grid12"
          style={{
            gap,
            padding,
            borderRadius: 14,
            border: border ? "1px dashed rgba(0,0,0,0.20)" : "none",
            background: "rgba(255,255,255,0.62)"
          }}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        className="flexCol"
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
        {children}
      </div>
    );
  }

  return <div style={{ padding: 10 }}>Unknown node type</div>;
}
