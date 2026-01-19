"use client";

import React, { useMemo, useState } from "react";
import type { AppModel } from "@packages/schemas";
import { Icons } from "./icons";

export default function InspectorPanel({
  app,
  selectedNodeId,
  updateProp,
  duplicateSelected
}: {
  app: AppModel;
  selectedNodeId: string;
  updateProp: (key: string, value: any) => void;
  duplicateSelected: () => void;
}) {
  const [tab, setTab] = useState<"content" | "design">("content");

  const node = useMemo(
    () => (selectedNodeId ? app.nodes[selectedNodeId] : undefined),
    [app, selectedNodeId]
  );

  return (
    <div className="panel">
      <div className="panelInner">
        {/* Header */}
        <div className="panelHeader">
          <div style={{ display: "grid" }}>
            <div style={{ fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
              <Icons.Settings size={16} />
              Inspector
            </div>
            <div className="smallMuted">Content + Design controls</div>
          </div>

          <div className="tabs" style={{ width: 220 }}>
            <div
              className={`tab ${tab === "content" ? "active" : ""}`}
              onClick={() => setTab("content")}
            >
              <Icons.Text size={14} />
              Content
            </div>
            <div
              className={`tab ${tab === "design" ? "active" : ""}`}
              onClick={() => setTab("design")}
            >
              <Icons.Grid size={14} />
              Design
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="panelBody">
          {!node ? (
            <div className="section">
              <div className="sectionHeader">
                <Icons.Layers size={14} />
                No selection
              </div>
              <div className="sectionBody">
                <div style={{ opacity: 0.75, fontSize: 13 }}>
                  Select a component from Canvas or Outline to edit.
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Selected */}
              <div className="section">
                <div className="sectionHeader">
                  <Icons.Layers size={14} />
                  Selected
                  <span className="kbd">{node.type}</span>
                </div>

                <div className="sectionBody">
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    ID: <b>{selectedNodeId}</b>
                  </div>

                  <button className="btn" type="button" onClick={duplicateSelected}>
                    <Icons.Duplicate size={16} />
                    Duplicate
                  </button>
                </div>
              </div>

              {/* CONTENT TAB */}
              {tab === "content" && (
                <>
                  {node.type === "text" && (
                    <div className="section">
                      <div className="sectionHeader">
                        <Icons.Text size={14} />
                        Text
                      </div>
                      <div className="sectionBody">
                        <div>
                          <div className="label">Value</div>
                          <input
                            className="input"
                            value={String(node.props?.value ?? "")}
                            onChange={(e) => updateProp("value", e.target.value)}
                          />
                        </div>

                        <div>
                          <div className="label">Font Size</div>
                          <input
                            className="input"
                            type="number"
                            value={Number(node.props?.size ?? 16)}
                            onChange={(e) =>
                              updateProp("size", Number(e.target.value))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {node.type === "button" && (
                    <div className="section">
                      <div className="sectionHeader">
                        <Icons.Button size={14} />
                        Button
                      </div>
                      <div className="sectionBody">
                        <div>
                          <div className="label">Label</div>
                          <input
                            className="input"
                            value={String(node.props?.label ?? "")}
                            onChange={(e) =>
                              updateProp("label", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {node.type === "container" && (
                    <div className="section">
                      <div className="sectionHeader">
                        <Icons.Container size={14} />
                        Container
                      </div>
                      <div className="sectionBody">
                        <div>
                          <div className="label">Direction</div>
                          <select
                            className="select"
                            value={String(node.props?.direction ?? "column")}
                            onChange={(e) =>
                              updateProp("direction", e.target.value)
                            }
                          >
                            <option value="column">column</option>
                            <option value="row">row</option>
                          </select>
                        </div>

                        <div>
                          <div className="label">Gap</div>
                          <input
                            className="input"
                            type="number"
                            value={Number(node.props?.gap ?? 10)}
                            onChange={(e) =>
                              updateProp("gap", Number(e.target.value))
                            }
                          />
                        </div>

                        <div>
                          <div className="label">Padding</div>
                          <input
                            className="input"
                            type="number"
                            value={Number(node.props?.padding ?? 10)}
                            onChange={(e) =>
                              updateProp("padding", Number(e.target.value))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* DESIGN TAB */}
              {tab === "design" && (
                <>
                  <div className="section">
                    <div className="sectionHeader">
                      <Icons.Grid size={14} />
                      Spacing (Advanced)
                    </div>
                    <div className="sectionBody">
                      <div style={{ fontSize: 12, opacity: 0.75 }}>
                        (UI base ready) Next step we’ll map these to schema:
                        margin/padding per side.
                      </div>

                      <div>
                        <div className="label">Padding (quick)</div>
                        <input
                          className="range"
                          type="range"
                          min={0}
                          max={60}
                          value={Number(node.props?.padding ?? 10)}
                          onChange={(e) =>
                            updateProp("padding", Number(e.target.value))
                          }
                        />
                      </div>

                      <div>
                        <div className="label">Gap (quick)</div>
                        <input
                          className="range"
                          type="range"
                          min={0}
                          max={60}
                          value={Number(node.props?.gap ?? 10)}
                          onChange={(e) =>
                            updateProp("gap", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="section">
                    <div className="sectionHeader">
                      <Icons.Settings size={14} />
                      Position
                    </div>
                    <div className="sectionBody">
                      <div style={{ fontSize: 12, opacity: 0.75 }}>
                        Day-6 we’ll add: width/height, align, zIndex,
                        absolute/relative.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
