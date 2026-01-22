"use client";

import React, { useMemo, useState } from "react";
import type { AppModel } from "@packages/schemas";
import { Icons } from "./icons";

function SegmentedToggle({
  value,
  onChange
}: {
  value: "content" | "design";
  onChange: (v: "content" | "design") => void;
}) {
  return (
    <div className="segToggle" role="tablist" aria-label="Inspector tabs">
      <button
        type="button"
        className={`segBtn ${value === "content" ? "active" : ""}`}
        onClick={() => onChange("content")}
      >
        Content
      </button>
      <button
        type="button"
        className={`segBtn ${value === "design" ? "active" : ""}`}
        onClick={() => onChange("design")}
      >
        Design
      </button>
    </div>
  );
}

function LayoutModeToggle({
  value,
  onChange
}: {
  value: "flex" | "grid12";
  onChange: (v: "flex" | "grid12") => void;
}) {
  return (
    <div className="segToggle" role="tablist" aria-label="Layout mode">
      <button
        type="button"
        className={`segBtn ${value === "flex" ? "active" : ""}`}
        onClick={() => onChange("flex")}
      >
        Flex
      </button>
      <button
        type="button"
        className={`segBtn ${value === "grid12" ? "active" : ""}`}
        onClick={() => onChange("grid12")}
      >
        Grid 12
      </button>
    </div>
  );
}

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
        <div className="panelHeader">
          <div style={{ display: "grid", gap: 2 }}>
            <div style={{ fontWeight: 900 }}>Inspector</div>
            <div className="smallMuted">Content + Design controls</div>
          </div>

          <div style={{ width: 240 }}>
            <SegmentedToggle value={tab} onChange={setTab} />
          </div>
        </div>

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

              {/* ===========================
                  CONTENT TAB
              ============================ */}
              {tab === "content" && (
                <>
                  {/* Text */}
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
                            placeholder="Hello {{item.title}}"
                          />
                          <div className="smallMuted" style={{ marginTop: 6 }}>
                            Bindings supported: <b>{"{{item.title}}"}</b> <b>{"{{index}}"}</b>
                          </div>
                        </div>

                        <div>
                          <div className="label">Font Size</div>
                          <input
                            className="input"
                            type="number"
                            value={Number(node.props?.size ?? 16)}
                            onChange={(e) => updateProp("size", Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Button */}
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
                            onChange={(e) => updateProp("label", e.target.value)}
                            placeholder="Buy {{item.title}}"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  {node.type === "input" && (
                    <div className="section">
                      <div className="sectionHeader">
                        <Icons.Search size={14} />
                        Input
                      </div>
                      <div className="sectionBody">
                        <div>
                          <div className="label">Placeholder</div>
                          <input
                            className="input"
                            value={String(node.props?.placeholder ?? "")}
                            onChange={(e) => updateProp("placeholder", e.target.value)}
                            placeholder="Search products…"
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div>
                            <div className="label">Height</div>
                            <input
                              className="input"
                              type="number"
                              value={Number(node.props?.height ?? 42)}
                              onChange={(e) => updateProp("height", Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <div className="label">Radius</div>
                            <input
                              className="input"
                              type="number"
                              value={Number(node.props?.radius ?? 999)}
                              onChange={(e) => updateProp("radius", Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  {node.type === "image" && (
                    <div className="section">
                      <div className="sectionHeader">
                        <Icons.Layers size={14} />
                        Image
                      </div>
                      <div className="sectionBody">
                        <div>
                          <div className="label">Src</div>
                          <input
                            className="input"
                            value={String(node.props?.src ?? "")}
                            onChange={(e) => updateProp("src", e.target.value)}
                            placeholder="https://..."
                          />
                          <div className="smallMuted" style={{ marginTop: 6 }}>
                            Use binding: <b>{"{{item.image}}"}</b>
                          </div>
                        </div>

                        <div>
                          <div className="label">Alt</div>
                          <input
                            className="input"
                            value={String(node.props?.alt ?? "")}
                            onChange={(e) => updateProp("alt", e.target.value)}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div>
                            <div className="label">Height</div>
                            <input
                              className="input"
                              type="number"
                              value={Number(node.props?.height ?? 180)}
                              onChange={(e) => updateProp("height", Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <div className="label">Radius</div>
                            <input
                              className="input"
                              type="number"
                              value={Number(node.props?.radius ?? 16)}
                              onChange={(e) => updateProp("radius", Number(e.target.value))}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="label">Fit</div>
                          <select
                            className="select"
                            value={String(node.props?.fit ?? "cover")}
                            onChange={(e) => updateProp("fit", e.target.value)}
                          >
                            <option value="cover">cover</option>
                            <option value="contain">contain</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Badge */}
                  {node.type === "badge" && (
                    <div className="section">
                      <div className="sectionHeader">
                        <Icons.Grid size={14} />
                        Badge
                      </div>
                      <div className="sectionBody">
                        <div>
                          <div className="label">Text</div>
                          <input
                            className="input"
                            value={String(node.props?.text ?? "")}
                            onChange={(e) => updateProp("text", e.target.value)}
                            placeholder="Top item"
                          />
                        </div>

                        <div>
                          <div className="label">Tone</div>
                          <select
                            className="select"
                            value={String(node.props?.tone ?? "yellow")}
                            onChange={(e) => updateProp("tone", e.target.value)}
                          >
                            <option value="yellow">yellow</option>
                            <option value="purple">purple</option>
                            <option value="blue">blue</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Icon Button */}
                  {node.type === "iconButton" && (
                    <div className="section">
                      <div className="sectionHeader">
                        <Icons.Add size={14} />
                        Icon Button
                      </div>
                      <div className="sectionBody">
                        <div>
                          <div className="label">Icon</div>
                          <select
                            className="select"
                            value={String(node.props?.icon ?? "heart")}
                            onChange={(e) => updateProp("icon", e.target.value)}
                          >
                            <option value="heart">heart</option>
                            <option value="cart">cart</option>
                            <option value="star">star</option>
                            <option value="user">user</option>
                          </select>
                        </div>

                        <div>
                          <div className="label">Label (optional)</div>
                          <input
                            className="input"
                            value={String(node.props?.label ?? "")}
                            onChange={(e) => updateProp("label", e.target.value)}
                            placeholder="{{item.title}}"
                          />
                        </div>

                        <div>
                          <div className="label">Radius</div>
                          <input
                            className="input"
                            type="number"
                            value={Number(node.props?.radius ?? 12)}
                            onChange={(e) => updateProp("radius", Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card */}
                  {node.type === "card" && (
                    <div className="section">
                      <div className="sectionHeader">
                        <Icons.Layers size={14} />
                        Card
                      </div>
                      <div className="sectionBody">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div>
                            <div className="label">Padding</div>
                            <input
                              className="input"
                              type="number"
                              value={Number(node.props?.padding ?? 12)}
                              onChange={(e) => updateProp("padding", Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <div className="label">Radius</div>
                            <input
                              className="input"
                              type="number"
                              value={Number(node.props?.radius ?? 18)}
                              onChange={(e) => updateProp("radius", Number(e.target.value))}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="label">Shadow</div>
                          <select
                            className="select"
                            value={String(Boolean(node.props?.shadow ?? true))}
                            onChange={(e) => updateProp("shadow", e.target.value === "true")}
                          >
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Column */}
                  {node.type === "col" && (
                    <div className="section">
                      <div className="sectionHeader">
                        <Icons.Grid size={14} />
                        Column (Grid12)
                      </div>
                      <div className="sectionBody">
                        <div>
                          <div className="label">Span (1 - 12)</div>
                          <input
                            className="input"
                            type="number"
                            min={1}
                            max={12}
                            value={Number(node.props?.span ?? 6)}
                            onChange={(e) => updateProp("span", Math.min(12, Math.max(1, Number(e.target.value))))}
                          />
                        </div>

                        <div>
                          <div className="label">Min Height</div>
                          <input
                            className="input"
                            type="number"
                            value={Number(node.props?.minHeight ?? 80)}
                            onChange={(e) => updateProp("minHeight", Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Container */}
                  {node.type === "container" && (
                    <>
                      <div className="section">
                        <div className="sectionHeader">
                          <Icons.Container size={14} />
                          Container
                        </div>

                        <div className="sectionBody">
                          <div>
                            <div className="label">Layout Mode</div>
                            <LayoutModeToggle
                              value={String(node.props?.layout ?? "flex") === "grid12" ? "grid12" : "flex"}
                              onChange={(v) => updateProp("layout", v)}
                            />
                            <div className="smallMuted" style={{ marginTop: 6 }}>
                              {String(node.props?.layout ?? "flex") === "grid12"
                                ? "12-column grid layout. Use Column nodes inside."
                                : "Flex layout: row/column stacking."}
                            </div>
                          </div>

                          {/* Shared */}
                          <div>
                            <div className="label">Gap</div>
                            <input
                              className="input"
                              type="number"
                              value={Number(node.props?.gap ?? 10)}
                              onChange={(e) => updateProp("gap", Number(e.target.value))}
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

                          {/* Flex only */}
                          {String(node.props?.layout ?? "flex") !== "grid12" && (
                            <div>
                              <div className="label">Direction</div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <button
                                  type="button"
                                  className={`chipBtn ${String(node.props?.direction ?? "column") === "column" ? "active" : ""}`}
                                  onClick={() => updateProp("direction", "column")}
                                >
                                  Column
                                </button>
                                <button
                                  type="button"
                                  className={`chipBtn ${String(node.props?.direction ?? "column") === "row" ? "active" : ""}`}
                                  onClick={() => updateProp("direction", "row")}
                                >
                                  Row
                                </button>
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="label">Border</div>
                            <select
                              className="select"
                              value={String(Boolean(node.props?.border ?? true))}
                              onChange={(e) => updateProp("border", e.target.value === "true")}
                            >
                              <option value="true">true</option>
                              <option value="false">false</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Repeat */}
                      <div className="section">
                        <div className="sectionHeader">
                          <Icons.Grid size={14} />
                          Repeat (Collections)
                        </div>

                        <div className="sectionBody">
                          <div className="smallMuted">
                            Bind UI to <b>app.data.collections.&lt;source&gt;</b> (products / rooms / movies / stocks).
                          </div>

                          <div>
                            <div className="label">Source</div>
                            <input
                              className="input"
                              value={String(node.props?.repeat?.source ?? "")}
                              onChange={(e) =>
                                updateProp("repeat", {
                                  ...(node.props?.repeat ?? { item: "item" }),
                                  source: e.target.value
                                })
                              }
                              placeholder="products"
                            />
                          </div>

                          <div>
                            <div className="label">Item variable</div>
                            <input
                              className="input"
                              value={String(node.props?.repeat?.item ?? "item")}
                              onChange={(e) =>
                                updateProp("repeat", {
                                  ...(node.props?.repeat ?? { source: "" }),
                                  item: e.target.value || "item"
                                })
                              }
                              placeholder="item"
                            />
                          </div>

                          <div>
                            <div className="label">Limit (optional)</div>
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
                              placeholder="0"
                            />
                          </div>

                          <div className="smallMuted">
                            Use bindings: <b>{"{{item.title}}"}</b> <b>{"{{item.price}}"}</b> <b>{"{{item.image}}"}</b> <b>{"{{index}}"}</b>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ===========================
                  DESIGN TAB (basic starter)
              ============================ */}
              {tab === "design" && (
                <>
                  <div className="section">
                    <div className="sectionHeader">
                      <Icons.Settings size={14} />
                      Spacing (Advanced)
                    </div>
                    <div className="sectionBody">
                      <div style={{ fontSize: 12, opacity: 0.75 }}>
                        (Base UI ready) Next: margin/padding per side + width/height + align + zIndex.
                      </div>

                      <div>
                        <div className="label">Padding (quick)</div>
                        <input
                          className="range"
                          type="range"
                          min={0}
                          max={60}
                          value={Number(node.props?.padding ?? 10)}
                          onChange={(e) => updateProp("padding", Number(e.target.value))}
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
                          onChange={(e) => updateProp("gap", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="section">
                    <div className="sectionHeader">
                      <Icons.Grid size={14} />
                      Layout Notes
                    </div>
                    <div className="sectionBody">
                      <div style={{ fontSize: 12, opacity: 0.75 }}>
                        Day-11 we’ll add responsive spans (sm/md/lg) + align + size.
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
