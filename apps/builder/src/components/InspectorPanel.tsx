"use client";

import React, { useMemo, useState } from "react";
import type { AppModel } from "@packages/schemas";
import { Icons } from "./icons";
import type { RowPreset, SectionPreset } from "../store/builder.store";

function SegmentedToggle({
  value,
  onChange
}: {
  value: "content" | "design";
  onChange: (v: "content" | "design") => void;
}) {
  return (
    <div className="segToggle" role="tablist" aria-label="Inspector tabs">
      <button type="button" className={`segBtn ${value === "content" ? "active" : ""}`} onClick={() => onChange("content")}>
        content
      </button>
      <button type="button" className={`segBtn ${value === "design" ? "active" : ""}`} onClick={() => onChange("design")}>
        design
      </button>
    </div>
  );
}

export default function InspectorPanel({
  app,
  selectedNodeId,
  updateProp,
  duplicateSelected,

  // ✅ Day-12 actions
  addRowPreset,
  addSectionPreset,
  saveSelectedAsComponent
}: {
  app: AppModel;
  selectedNodeId: string;
  updateProp: (key: string, value: any) => void;
  duplicateSelected: () => void;

  addRowPreset: (containerId: string, cols: RowPreset) => void;
  addSectionPreset: (containerId: string, preset: SectionPreset) => void;
  saveSelectedAsComponent: (name: string) => void;
}) {
  const [tab, setTab] = useState<"content" | "design">("content");
  const [compName, setCompName] = useState("");

  const node = useMemo(
    () => (selectedNodeId ? app.nodes[selectedNodeId] : undefined),
    [app, selectedNodeId]
  );

  if (!node) {
    return (
      <div className="panel">
        <div className="panelInner">
          <div className="panelHeader">
            <div style={{ display: "grid", gap: 2 }}>
              <div style={{ fontWeight: 900 }}>Inspector</div>
              <div className="smallMuted">No selection</div>
            </div>
            <SegmentedToggle value={tab} onChange={setTab} />
          </div>

          <div className="panelBody">
            <div className="section">
              <div className="sectionHeader">
                <Icons.Layers size={14} /> Select something
              </div>
              <div className="sectionBody">
                <div className="smallMuted">Select a container / row / column to see options.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isContainer = node.type === "container";
  const isRow = node.type === "row";
  const isCol = node.type === "col";

  return (
    <div className="panel">
      <div className="panelInner">
        <div className="panelHeader">
          <div style={{ display: "grid", gap: 2 }}>
            <div style={{ fontWeight: 900 }}>Inspector</div>
            <div className="smallMuted">{node.type}</div>
          </div>

          <SegmentedToggle value={tab} onChange={setTab} />
        </div>

        <div className="panelBody">
          {/* Selected */}
          <div className="section">
            <div className="sectionHeader">
              <Icons.Layers size={14} /> Selected <span className="kbd">{node.type}</span>
            </div>
            <div className="sectionBody">
              <div className="smallMuted">
                ID: <b>{selectedNodeId}</b>
              </div>

              <button className="btn" type="button" onClick={duplicateSelected}>
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <Icons.Duplicate size={16} /> Duplicate
                </span>
                <span>↻</span>
              </button>
            </div>
          </div>

          {/* CONTENT */}
          {tab === "content" && (
            <>
              {/* Container tools */}
              {isContainer && (
                <>
                  <div className="section">
                    <div className="sectionHeader">
                      <Icons.Container size={14} /> Add Section
                    </div>
                    <div className="sectionBody">
                      <button className="btn" type="button" onClick={() => addSectionPreset(selectedNodeId, "hero")}>
                        Hero preset <span>＋</span>
                      </button>
                      <button className="btn" type="button" onClick={() => addSectionPreset(selectedNodeId, "cards")}>
                        Cards preset (repeat products) <span>＋</span>
                      </button>
                      <div className="smallMuted">
                        Hero = title/subtitle/CTA. Cards = repeated card template bound to <b>products</b>.
                      </div>
                    </div>
                  </div>

                  <div className="section">
                    <div className="sectionHeader">
                      <Icons.Grid size={14} /> Add Row (Preset)
                    </div>
                    <div className="sectionBody" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                      {[2, 3, 4, 6, 8, 12].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className="btn"
                          onClick={() => addRowPreset(selectedNodeId, n as RowPreset)}
                          style={{ justifyContent: "center" }}
                        >
                          {n} cols
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Row controls */}
              {isRow && (
                <div className="section">
                  <div className="sectionHeader">
                    <Icons.Grid size={14} /> Row Layout
                  </div>
                  <div className="sectionBody">
                    <div>
                      <div className="label">Gap</div>
                      <input
                        className="input"
                        type="number"
                        value={Number(node.props?.gap ?? 12)}
                        onChange={(e) => updateProp("gap", Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <div className="label">Padding</div>
                      <input
                        className="input"
                        type="number"
                        value={Number(node.props?.padding ?? 0)}
                        onChange={(e) => updateProp("padding", Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <div className="label">Repeat Source (optional)</div>
                      <input
                        className="input"
                        placeholder="products"
                        value={String(node.props?.repeat?.source ?? "")}
                        onChange={(e) =>
                          updateProp("repeat", {
                            ...(node.props?.repeat ?? { item: "item" }),
                            source: e.target.value
                          })
                        }
                      />
                      <div className="smallMuted">If set, this row will repeat its template for each item.</div>
                    </div>

                    <div>
                      <div className="label">Item variable</div>
                      <input
                        className="input"
                        placeholder="item"
                        value={String(node.props?.repeat?.item ?? "item")}
                        onChange={(e) =>
                          updateProp("repeat", {
                            ...(node.props?.repeat ?? { source: "" }),
                            item: e.target.value || "item"
                          })
                        }
                      />
                    </div>

                    <div>
                      <div className="label">Limit</div>
                      <input
                        className="input"
                        type="number"
                        value={Number(node.props?.repeat?.limit ?? 0)}
                        onChange={(e) =>
                          updateProp("repeat", {
                            ...(node.props?.repeat ?? { source: "", item: "item" }),
                            limit: Number(e.target.value) || undefined
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Col controls */}
              {isCol && (
                <div className="section">
                  <div className="sectionHeader">
                    <Icons.Grid size={14} /> Column
                  </div>
                  <div className="sectionBody">
                    <div className="smallMuted">Use these if you later add responsive rendering rules.</div>

                    <div>
                      <div className="label">Span (1 - 12)</div>
                      <input
                        className="input"
                        type="number"
                        min={1}
                        max={12}
                        value={Number(node.props?.span ?? 12)}
                        onChange={(e) => updateProp("span", Math.min(12, Math.max(1, Number(e.target.value))))}
                      />
                    </div>

                    <div>
                      <div className="label">Min Height</div>
                      <input
                        className="input"
                        type="number"
                        value={Number(node.props?.minHeight ?? 90)}
                        onChange={(e) => updateProp("minHeight", Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <div className="label">Padding</div>
                      <input
                        className="input"
                        type="number"
                        value={Number(node.props?.padding ?? 10)}
                        onChange={(e) => updateProp("padding", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save as component */}
              <div className="section">
                <div className="sectionHeader">
                  <Icons.Layers size={14} /> Save as Component
                </div>
                <div className="sectionBody">
                  <input
                    className="input"
                    placeholder="Component name (e.g. Product Card / Header)"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                  />
                  <button
                    className="btn"
                    type="button"
                    onClick={() => {
                      saveSelectedAsComponent(compName || `${node.type} component`);
                      setCompName("");
                    }}
                  >
                    Save to library <span>★</span>
                  </button>
                  <div className="smallMuted">This stores the selected node + children into app.library.components.</div>
                </div>
              </div>
            </>
          )}

          {/* DESIGN */}
          {tab === "design" && (
            <div className="section">
              <div className="sectionHeader">
                <Icons.Settings size={14} /> Design (next)
              </div>
              <div className="sectionBody">
                <div className="smallMuted">
                  Next: margin/padding per side, width/height, align, background, borders, typography presets.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
