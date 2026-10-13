"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash } from "@phosphor-icons/react";

import type { Pair } from "@/lib/admin/fields";
import { inputClass } from "./fields";

const empty: Pair = { name: "", detail: "" };

/* Edits a list of {name, detail} rows and submits it as one JSON hidden field. */
export default function PairListEditor({
  name,
  initial,
  labels,
  max = 8,
}: {
  name: string;
  initial: Pair[];
  labels: [string, string];
  max?: number;
}) {
  const [items, setItems] = useState<Pair[]>(
    initial.length ? initial : [empty],
  );
  const update = (i: number, patch: Partial<Pair>) =>
    setItems((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const remove = (i: number) =>
    setItems((p) => (p.length === 1 ? [empty] : p.filter((_, j) => j !== i)));
  const move = (i: number, d: -1 | 1) =>
    setItems((p) => {
      const t = i + d;
      if (t < 0 || t >= p.length) return p;
      const n = [...p];
      [n[i], n[t]] = [n[t], n[i]];
      return n;
    });

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-line p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <input
              placeholder={labels[0]}
              value={item.name}
              onChange={(e) => update(i, { name: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder={labels[1]}
              value={item.detail}
              onChange={(e) => update(i, { detail: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="mt-2 flex gap-3 text-mist">
            <button
              type="button"
              aria-label="Move up"
              onClick={() => move(i, -1)}
              className="hover:text-bone"
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              aria-label="Move down"
              onClick={() => move(i, 1)}
              className="hover:text-bone"
            >
              <ArrowDown size={16} />
            </button>
            <button
              type="button"
              aria-label="Remove"
              onClick={() => remove(i)}
              className="hover:text-accent"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
      ))}
      {items.length < max && (
        <button
          type="button"
          onClick={() => setItems((p) => [...p, empty])}
          className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-mist hover:text-bone"
        >
          <Plus size={14} /> Add
        </button>
      )}
    </div>
  );
}
