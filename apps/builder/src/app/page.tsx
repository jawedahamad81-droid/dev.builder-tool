"use client";

import React, { useMemo, useRef, useState } from "react";
import "./builder-ui.css";

import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragOverEvent,
  type DragMoveEvent
} from "@dnd-kit/core";

import { useBuilderStore } from "../store/builder.store";
import OutlineTree from "../components/OutlineTree";
import ProjectBar from "../components/ProjectBar";
import BuilderTopBar from "../components/BuilderTopBar";
import InspectorPanel from "../components/InspectorPanel";
import Palette from "../components/Palette";
import EditorCanvasRenderer, { type DropIndicator } from "../components/EditorCanvasRenderer";

type LeftTab = "elements" | "navigator";
type NodeType = "text" | "button" | "container";

export default function BuilderHome() {
  const app = useBuilderStore((s) => s.history.present);
  const activePageId = useBuilderStore((s) => s.activePageId);
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);

  const projectId = useBuilderStore((s) => s.projectId);
  const setProjectId = useBuilderStore((s) => s.setProjectId);
  const loadApp = useBuilderStore((s) => s.loadApp);

  const setActivePageId = useBuilderStore((s) => s.setActivePageId);
  const setSelectedNodeId = useBuilderStore((s) => s.setSelectedNodeId);

  const addNodeToRoot = useBuilderStore((s) => s.addNodeToRoot);
  const addNode = useBuilderStore((s) => s.addNode);

  const updateSelectedProp = useBuilderStore((s) => s.updateSelectedProp);
  const deleteNode = useBuilderStore((s) => s.deleteNode);
  const moveNode = useBuilderStore((s) => s.moveNode);
  const moveByDnD = useBuilderStore((s) => s.moveByDnD);
  const duplicateNode = useBuilderStore((s) => s.duplicateNode);

  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const canUndo = useBuilderStore((s) => s.canUndo);
  const canRedo = useBuilderStore((s) => s.canRedo);

  const selectedIsContainer = !!selectedNodeId && app.nodes[selectedNodeId]?.type === "container";

  const page = useMemo(
    () => app.pages.find((p) => p.id === activePageId) ?? app.pages[0],
    [app.pages, activePageId]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const [leftTab, setLeftTab] = useState<LeftTab>("elements");
  const [search, setSearch] = useState("");
  const [overlay, setOverlay] = useState<{ label: string } | null>(null);

  // ✅ Day-8: drop indicator state
  const [indicator, setIndicator] = useState<DropIndicator>(null);

  // ✅ Day-8: auto scroll
  const canvasScrollRef = useRef<HTMLDivElement | null>(null);

  function updateProp(key: string, value: any) {
    updateSelectedProp(key, value);
  }

  function onPreview() {
    alert("Preview route: next step.");
  }

  function onPublish() {
    alert("Publish/export: next step.");
  }

  // Helper: read pointer coords
  function getPointerXY(e: any): { x: number; y: number } | null {
    const ev = e?.activatorEvent;
    if (!ev) return null;
    if (typeof ev.clientX === "number") return { x: ev.clientX, y: ev.clientY };
    if (ev.touches?.[0]) return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
    return null;
  }

  // ✅ Auto-scroll on drag move (when near edges)
  function handleDragMove(e: DragMoveEvent) {
    const el = canvasScrollRef.current;
    const p = getPointerXY(e);
    if (!el || !p) return;

    const r = el.getBoundingClientRect();
    const edge = 70;        // how close to edge before scrolling
    const speed = 18;       // pixels per move event

    const topDist = p.y - r.top;
    const bottomDist = r.bottom - p.y;

    if (topDist < edge) el.scrollTop -= speed;
    else if (bottomDist < edge) el.scrollTop += speed;

    const leftDist = p.x - r.left;
    const rightDist = r.right - p.x;

    if (leftDist < edge) el.scrollLeft -= speed;
    else if (rightDist < edge) el.scrollLeft += speed;
  }

  function handleDragStart(e: DragStartEvent) {
    const id = String(e.active.id);

    setIndicator(null);

    if (id.startsWith("palette:")) {
      const type = id.replace("palette:", "").toUpperCase();
      setOverlay({ label: type });
      return;
    }

    if (id.startsWith("node:")) {
      const nodeId = id.replace("node:", "");
      const type = app.nodes[nodeId]?.type ?? "node";
      setOverlay({ label: type.toUpperCase() });
    }
  }

  // ✅ Compute indicator on drag over
  function handleDragOver(e: DragOverEvent) {
    const activeId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : "";

    if (!overId) {
      setIndicator(null);
      return;
    }

    // Palette: show container highlight only (list)
    if (activeId.startsWith("palette:")) {
      if (overId.startsWith("list:")) {
        setIndicator({ kind: "list", containerId: overId.replace("list:", "") });
      } else {
        setIndicator(null);
      }
      return;
    }

    // Node drag: show list highlight or before/after line
    if (activeId.startsWith("node:")) {
      if (overId.startsWith("list:")) {
        setIndicator({ kind: "list", containerId: overId.replace("list:", "") });
        return;
      }

      if (overId.startsWith("node:")) {
        const overNodeId = overId.replace("node:", "");

        const p = getPointerXY(e);
        const rect = e.over?.rect;
        if (!p || !rect) {
          setIndicator(null);
          return;
        }

        const midY = rect.top + rect.height / 2;
        const position: "before" | "after" = p.y < midY ? "before" : "after";

        setIndicator({ kind: "node", overNodeId, position });
        return;
      }
    }

    setIndicator(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeIdRaw = String(event.active.id);
    const overIdRaw = event.over?.id ? String(event.over.id) : "";

    setOverlay(null);

    // Clear indicator after drop
    const finalIndicator = indicator;
    setIndicator(null);

    if (!overIdRaw) return;

    // A) Palette -> list:<containerId>
    if (activeIdRaw.startsWith("palette:")) {
      const nodeType = activeIdRaw.replace("palette:", "") as NodeType;
      if (!overIdRaw.startsWith("list:")) return;

      const parentId = overIdRaw.replace("list:", "");
      addNode(parentId, nodeType);
      return;
    }

    // B) Node -> move/reorder
    if (activeIdRaw.startsWith("node:")) {
      const activeNodeId = activeIdRaw.replace("node:", "");

      // drop into container list (append)
      if (overIdRaw.startsWith("list:")) {
        moveByDnD(activeNodeId, overIdRaw); // keep list:<id>
        return;
      }

      // drop on node with before/after indicator
      if (overIdRaw.startsWith("node:")) {
        const overNodeId = overIdRaw.replace("node:", "");

        // Use indicator position if available; default "before"
        const pos =
          finalIndicator?.kind === "node" && finalIndicator.overNodeId === overNodeId
            ? finalIndicator.position
            : "before";

        moveByDnD(activeNodeId, `${pos}:${overNodeId}`);
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="builderShell">
        {/* LEFT PANEL */}
        <div className="panel">
          <div className="panelInner">
            <div className="panelHeader">
              <div className="brand">
                <div className="logo">B</div>
                <div style={{ display: "grid" }}>
                  <div style={{ fontWeight: 900 }}>Builder</div>
                </div>
              </div>

              <div className="tabs">
                <div className={`tab ${leftTab === "navigator" ? "active" : ""}`} onClick={() => setLeftTab("navigator")}>
                  Navigator
                </div>
                <div className={`tab ${leftTab === "elements" ? "active" : ""}`} onClick={() => setLeftTab("elements")}>
                  Elements
                </div>
              </div>
            </div>

            <div className="panelBody">
              <ProjectBar projectId={projectId} setProjectId={setProjectId} app={app} loadApp={loadApp} />

              <div className="hr" />

              <div>
                <div className="label">Page</div>
                <select className="select" value={activePageId} onChange={(e) => setActivePageId(e.target.value)}>
                  {app.pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.routePath})
                    </option>
                  ))}
                </select>
              </div>

              {leftTab === "elements" && (
                <>
                  <div style={{ marginTop: 10 }}>
                    <input
                      className="input"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search elements..."
                    />
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <Palette search={search} onAddToRoot={(type) => addNodeToRoot(type)} />
                  </div>

                  <div className="section">
                    <div className="sectionHeader">Quick add inside selected container</div>
                    <div className="sectionBody">
                      <button className="btn" disabled={!selectedIsContainer} onClick={() => selectedNodeId && addNode(selectedNodeId, "text")}>
                        + Child Text <span>↳</span>
                      </button>
                      <button className="btn" disabled={!selectedIsContainer} onClick={() => selectedNodeId && addNode(selectedNodeId, "button")}>
                        + Child Button <span>↳</span>
                      </button>
                      <button className="btn" disabled={!selectedIsContainer} onClick={() => selectedNodeId && addNode(selectedNodeId, "container")}>
                        + Child Container <span>↳</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {leftTab === "navigator" && (
                <>
                  <div className="smallMuted">Outline DnD still works too.</div>

                  <div style={{ marginTop: 10 }}>
                    <OutlineTree
                      app={app}
                      pageId={activePageId}
                      selectedNodeId={selectedNodeId}
                      onSelect={(id) => setSelectedNodeId(id)}
                      onDelete={(id) => deleteNode(id)}
                      onMove={(id, dir) => moveNode(id, dir)}
                      onDnD={(activeId, overId) => moveByDnD(activeId, overId)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="centerWrap">
          <BuilderTopBar
            title={`${page.name} • ${page.routePath}`}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo()}
            canRedo={canRedo()}
            onPreview={onPreview}
            onPublish={onPublish}
          />

          <div className="canvasCard">
            <div className="canvasHeader">
              <div style={{ fontWeight: 900 }}>Canvas</div>
              <div className="row">
                <button className="btnIcon" type="button" onClick={() => addNodeToRoot("text")} title="Add text to root">T</button>
                <button className="btnIcon" type="button" onClick={() => addNodeToRoot("button")} title="Add button to root">☐</button>
                <button className="btnIcon" type="button" onClick={() => addNodeToRoot("container")} title="Add container to root">▦</button>
              </div>
            </div>

            {/* ✅ attach scroll ref here */}
            <div className="canvasBody" ref={canvasScrollRef}>
              <div className="frame">
                <EditorCanvasRenderer
                  app={app}
                  pageId={activePageId}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={(id) => setSelectedNodeId(id)}
                  onDeleteNode={(id) => deleteNode(id)}
                  onDuplicateNode={(id) => duplicateNode(id)}
                  onAddChild={(containerId: string, type: NodeType) => addNode(containerId, type)}
                  indicator={indicator}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT INSPECTOR */}
        <InspectorPanel
          app={app}
          selectedNodeId={selectedNodeId}
          updateProp={updateProp}
          duplicateSelected={() => selectedNodeId && duplicateNode(selectedNodeId)}
        />
      </div>

      <DragOverlay>
        {overlay ? (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              background: "white",
              border: "1px solid rgba(15,23,42,0.15)",
              boxShadow: "0 18px 40px rgba(2,6,23,0.18)",
              fontWeight: 900
            }}
          >
            {overlay.label}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
