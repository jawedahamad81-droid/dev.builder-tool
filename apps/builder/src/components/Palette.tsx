"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Icons } from "./icons";

export type PaletteNodeType =
  | "text"
  | "button"
  | "container"
  | "col"
  | "image"
  | "input"
  | "iconButton"
  | "badge"
  | "card";

const ITEMS: Array<{
  title: string;
  meta: string;
  type: PaletteNodeType;
  Icon: any;
}> = [
  { title: "Text", meta: "Typography", type: "text", Icon: Icons.Text },
  { title: "Button", meta: "Actions", type: "button", Icon: Icons.Button },
  { title: "Input", meta: "Forms", type: "input", Icon: Icons.Search },
  { title: "Image", meta: "Media", type: "image", Icon: Icons.Layers },
  { title: "Icon Button", meta: "Actions", type: "iconButton", Icon: Icons.Add },
  { title: "Badge", meta: "Label", type: "badge", Icon: Icons.Grid },
  { title: "Card", meta: "Surface", type: "card", Icon: Icons.Layers },
  { title: "Container", meta: "Layout", type: "container", Icon: Icons.Container },
  { title: "Column", meta: "Grid12 item", type: "col", Icon: Icons.Grid }
];

function DraggableBlock({
  title,
  meta,
  type,
  Icon,
  onClickAdd
}: {
  title: string;
  meta: string;
  type: PaletteNodeType;
  Icon: any;
  onClickAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { kind: "palette", nodeType: type }
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
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
      title="Drag to canvas • Click to add"
    >
      <div className="blockTitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={16} />
        {title}
      </div>
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
        Basic ({filtered.length}) <span className="kbd">Drag & Drop</span>
      </div>

      <div className="categoryGrid">
        {filtered.map((b) => (
          <DraggableBlock
            key={b.type}
            title={b.title}
            meta={b.meta}
            type={b.type}
            Icon={b.Icon}
            onClickAdd={() => onAddToRoot(b.type)}
          />
        ))}
      </div>
    </div>
  );
}
