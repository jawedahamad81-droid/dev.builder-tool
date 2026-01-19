"use client";

import React from "react";
import type { AppModel } from "@packages/schemas";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  useDroppable
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  app: AppModel;
  pageId: string;
  selectedNodeId: string;
  onSelect: (nodeId: string) => void;

  onDelete: (nodeId: string) => void;
  onMove: (nodeId: string, dir: "up" | "down") => void;

  // Day-3 DnD wiring:
  onDnD: (activeId: string, overId: string) => void;
};

export default function OutlineTree({
  app,
  pageId,
  selectedNodeId,
  onSelect,
  onDelete,
  onMove,
  onDnD
}: Props) {
  const page = app.pages.find((p) => p.id === pageId) ?? app.pages[0];
  const rootId = page.rootNodeId;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(e: DragEndEvent) {
    const activeId = String(e.active?.id ?? "");
    const overId = String(e.over?.id ?? "");
    if (!activeId || !overId) return;
    if (activeId === overId) return;
    onDnD(activeId, overId);
  }

  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
        Outline — <b>{page.name}</b>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
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
      </DndContext>
    </div>
  );
}

function ChildrenDropZone({ parentId, enabled }: { parentId: string; enabled: boolean }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `list:${parentId}`,
    disabled: !enabled
  });

  if (!enabled) return null;

  return (
    <div
      ref={setNodeRef}
      style={{
        marginTop: 8,
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px dashed rgba(0,0,0,0.18)",
        background: isOver ? "rgba(16,185,129,0.12)" : "rgba(0,0,0,0.02)",
        fontSize: 12,
        opacity: 0.8
      }}
    >
      Drop here to move into this container
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

  const sortable = useSortable({
    id: nodeId,
    disabled: !!isRoot
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.6 : 1
  };

  const canContain = node.type === "container";
  const children = node.children ?? [];

  return (
    <div style={{ marginLeft: level * 10 }}>
      <div ref={sortable.setNodeRef} style={style} onClick={() => onSelect(nodeId)}>
        <div
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
          {!isRoot && (
            <span
              {...sortable.attributes}
              {...sortable.listeners}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 18,
                textAlign: "center",
                cursor: "grab",
                userSelect: "none",
                opacity: 0.7
              }}
              title="Drag"
            >
              ⠿
            </span>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {node.type}
            </div>
            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
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

        {/* Drop area for moving nodes into this container */}
        <ChildrenDropZone parentId={nodeId} enabled={canContain} />
      </div>

      {children.length > 0 && (
        <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
          <SortableContext items={children} strategy={verticalListSortingStrategy}>
            {children.map((cid) => (
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
          </SortableContext>
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
