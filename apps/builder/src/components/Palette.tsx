"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Icons } from "./icons";

export type PaletteNodeType = "text" | "button" | "container";

const ITEMS: Array<{
  title: string;
  meta: string;
  type: PaletteNodeType;
  icon: React.ComponentType<{ size?: number }>;
}> = [
  { title: "Text", meta: "Typography", type: "text", icon: Icons.Text },
  { title: "Button", meta: "Actions", type: "button", icon: Icons.Button },
  { title: "Container", meta: "Layout", type: "container", icon: Icons.Container }
];

function DraggableBlock({
  title,
  meta,
  type,
  icon: Icon,
  onClickAdd
}: {
  title: string;
  meta: string;
  type: PaletteNodeType;
  icon: React.ComponentType<{ size?: number }>;
  onClickAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette:${type}`,
      data: { kind: "palette", nodeType: type }
    });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.55 : 1
  };

  return (
    <div
      ref={setNodeRef}
      className="block"
      style={style}
      onClick={onClickAdd}
      {...listeners}
      {...attributes}
      title="Drag to canvas • Click to add to root"
    >
      <div className="blockIcon">
        <Icon size={18} />
      </div>

      <div className="blockTitle">{title}</div>
      <div className="blockMeta">{meta}</div>
    </div>
  );
}

export default function Palette({
  search,
  onAddToRoot
}: {
  search: string;
  onAddToRoot: (type: PaletteNodeType) => void;
}) {
  const filtered = ITEMS.filter((it) =>
    search ? it.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="category">
      <div className="categoryHeader">
        Basic ({filtered.length})
        <span className="kbd">Drag & Drop</span>
      </div>

      <div className="categoryGrid">
        {filtered.map((b) => (
          <DraggableBlock
            key={b.type}
            title={b.title}
            meta={b.meta}
            type={b.type}
            icon={b.icon}
            onClickAdd={() => onAddToRoot(b.type)}
          />
        ))}
      </div>
    </div>
  );
}
