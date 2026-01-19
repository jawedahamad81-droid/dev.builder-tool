"use client";

import React from "react";
import { Icons } from "./icons";

export default function BuilderTopBar({
  title,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onPreview,
  onPublish
}: {
  title: string;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onPreview: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="topBar">
      {/* LEFT */}
      <div className="topLeft">
        <div className="pill">{title}</div>

        {/* Device Preview (UI only) */}
        <div className="deviceGroup" title="Device preview (UI only for now)">
          <button className="btnIcon" type="button" title="Desktop">
            <Icons.Desktop size={18} />
          </button>
          <button className="btnIcon" type="button" title="Mobile">
            <Icons.Mobile size={18} />
          </button>
          <button className="btnIcon" type="button" title="Tablet">
            <Icons.Tablet size={18} />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="row">
          <button
            className="btnIcon"
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <Icons.Undo size={18} />
          </button>

          <button
            className="btnIcon"
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            <Icons.Redo size={18} />
          </button>
        </div>

        {/* Shortcuts */}
        <span className="kbd">⌘K</span>
        <span className="kbd">⌘S</span>
      </div>

      {/* RIGHT */}
      <div className="topRight">
        <button className="btn" type="button" onClick={onPreview}>
          <Icons.Preview size={16} />
          Preview
        </button>

        <button className="btn btnPrimary" type="button" onClick={onPublish}>
          <Icons.Publish size={16} />
          Publish
        </button>

        <button className="btnIcon" type="button" title="Settings">
          <Icons.Settings size={18} />
        </button>
      </div>
    </div>
  );
}
