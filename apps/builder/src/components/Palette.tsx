"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Icons } from "./icons";
import type { AppModel } from "@packages/schemas";

export type PaletteNodeType =
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

const BASIC_ITEMS: Array<{
  title: string;
  meta: string;
  type: PaletteNodeType;
  Icon: React.FC<any>;
}> = [
  { title: "Text", meta: "Typography", type: "text", Icon: Icons.Text },
  { title: "Button", meta: "Actions", type: "button", Icon: Icons.Button },
  { title: "Input", meta: "Forms", type: "input", Icon: Icons.Search },
  { title: "Image", meta: "Media", type: "image", Icon: Icons.Preview },
  { title: "Icon Button", meta: "Actions", type: "iconButton", Icon: Icons.Add },
  { title: "Badge", meta: "Label", type: "badge", Icon: Icons.Layers },
  { title: "Card", meta: "Surface", type: "card", Icon: Icons.Container },
  { title: "Container", meta: "Layout", type: "container", Icon: Icons.Container },
  { title: "Row", meta: "Grid wrapper", type: "row", Icon: Icons.Grid },
  { title: "Column", meta: "Grid item", type: "col", Icon: Icons.Grid }
];

function DraggableBlock({
  id,
  title,
  meta,
  Icon,
  data,
  onClickAdd
}: {
  id: string;
  title: string;
  meta: string;
  Icon: React.FC<any>;
  data: any;
  onClickAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.55 : 1,
    cursor: isDragging ? "grabbing" : "grab"
  };

  return (
    <div
      ref={setNodeRef}
      className={`block ${isDragging ? "dragging" : ""}`}
      style={style}
      title="Drag to canvas • Click to add"
      onClick={() => {
        // Prevent accidental click while dragging
        if (!isDragging) onClickAdd();
      }}
      {...listeners}
      {...attributes}
    >
      <div className="blockTitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={16} />
        <span>{title}</span>
      </div>
      <div className="blockMeta">{meta}</div>
    </div>
  );
}

export default function Palette({
  search,
  onAddToRoot,
  app,
  onInsertComponentToRoot
}: {
  search: string;
  onAddToRoot: (type: PaletteNodeType) => void;

  // ✅ Day-12 library
  app: AppModel;
  onInsertComponentToRoot: (componentId: string) => void;
}) {
  const filteredBasic = BASIC_ITEMS.filter((it) =>
    search ? it.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  const components = Object.values(app.library?.components ?? {});
  const filteredComponents = components.filter((c) =>
    search ? c.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <>
      {/* BASIC */}
      <div className="category">
        <div className="categoryHeader">
          Basic ({filteredBasic.length})
          <span className="kbd">Drag / Click</span>
        </div>

        <div className="categoryGrid">
          {filteredBasic.map((item) => (
            <DraggableBlock
              key={item.type}
              id={`palette:${item.type}`}
              title={item.title}
              meta={item.meta}
              Icon={item.Icon}
              data={{ kind: "palette", nodeType: item.type }}
              onClickAdd={() => onAddToRoot(item.type)}
            />
          ))}
        </div>
      </div>

      {/* SAVED COMPONENTS */}
      <div className="category" style={{ marginTop: 12 }}>
        <div className="categoryHeader">
          Saved ({filteredComponents.length})
          <span className="kbd">Library</span>
        </div>

        <div className="categoryGrid">
          {filteredComponents.length === 0 ? (
            <div className="smallMuted" style={{ padding: "8px 2px" }}>
              Save a container/row/card from Inspector → it appears here.
            </div>
          ) : (
            filteredComponents.map((c) => (
              <DraggableBlock
                key={c.id}
                id={`component:${c.id}`}
                title={c.name}
                meta="Saved Component"
                Icon={Icons.Layers}
                data={{ kind: "component", componentId: c.id }}
                onClickAdd={() => onInsertComponentToRoot(c.id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
