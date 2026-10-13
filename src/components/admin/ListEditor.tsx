"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash } from "@phosphor-icons/react";

import { inputClass } from "./fields";

/* Edits a list of strings and submits it as one JSON hidden field. */
export default function ListEditor({
  name,
  initial,
  max = 8,
}: {
  name: string;
  initial: string[];
  max?: number;
}) {
  const [items, setItems] = useState<string[]>(
    initial.length ? initial : [""],
  );
  const update = (i: number, v: string) =>
    setItems((p) => p.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) =>
    setItems((p) => (p.length === 1 ? [""] : p.filter((_, j) => j !== i)));
  const move = (i: number, d: -1 | 1) =>
    setItems((p) => {
      const t = i + d;
      if (t < 0 || t >= p.length) return p;
      const n = [...p];
      [n[i], n[t]] = [n[t], n[i]];
      return n;
    });

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            className={inputClass}
          />
          <button
            type="button"
            aria-label="Move up"
            onClick={() => move(i, -1)}
            className="text-mist hover:text-bone"
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            aria-label="Move down"
            onClick={() => move(i, 1)}
            className="text-mist hover:text-bone"
          >
            <ArrowDown size={16} />
          </button>
          <button
            type="button"
            aria-label="Remove"
            onClick={() => remove(i)}
            className="text-mist hover:text-accent"
          >
            <Trash size={16} />
          </button>
        </div>
      ))}
      {items.length < max && (
        <button
          type="button"
          onClick={() => setItems((p) => [...p, ""])}
          className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-mist hover:text-bone"
        >
          <Plus size={14} /> Add
        </button>
      )}
    </div>
  );
}
