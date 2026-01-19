"use client";

import React, { useEffect, useState } from "react";
import type { AppModel } from "@packages/schemas";
import { Icons } from "./icons";

type Item = { id: string; updatedAt: string };

export default function ProjectBar({
  projectId,
  setProjectId,
  app,
  loadApp
}: {
  projectId: string;
  setProjectId: (id: string) => void;
  app: AppModel;
  loadApp: (app: AppModel) => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setItems(data.items ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function save() {
    setBusy(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app })
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function open(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      loadApp(data.app);
      setProjectId(id);
    } finally {
      setBusy(false);
    }
  }

  async function createNew() {
    setBusy(true);
    try {
      const id = `proj_${Date.now()}`;
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, app })
      });
      setProjectId(id);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(app, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      style={{
        marginTop: 12,
        padding: 10,
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(0,0,0,0.02)"
      }}
    >
      <div
        style={{
          fontSize: 12,
          opacity: 0.75,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 6
        }}
      >
        <Icons.Layers size={14} />
        Project: <b>{projectId}</b>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <button disabled={busy} onClick={save} style={btn}>
          <Icons.Publish size={16} />
          Save
        </button>

        <button disabled={busy} onClick={createNew} style={btn}>
          <Icons.Duplicate size={16} />
          Save As New
        </button>

        <button disabled={busy} onClick={exportJson} style={btn}>
          <Icons.Download size={16} />
          Export JSON
        </button>

        <div
          style={{
            fontSize: 12,
            opacity: 0.7,
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Icons.FolderOpen size={14} />
          Open Project
        </div>

        <select
          disabled={busy}
          value={projectId}
          onChange={(e) => open(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.12)"
          }}
        >
          {items.length === 0 && (
            <option value={projectId}>No saved projects</option>
          )}
          {items.map((it) => (
            <option key={it.id} value={it.id}>
              {it.id} — {new Date(it.updatedAt).toLocaleString()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  cursor: "pointer",
  textAlign: "left",
  display: "inline-flex",
  alignItems: "center",
  gap: 8
};
