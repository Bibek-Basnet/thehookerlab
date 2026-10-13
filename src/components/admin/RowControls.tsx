"use client";

import { useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeSlash,
  Trash,
} from "@phosphor-icons/react";

import type { Direction } from "@/lib/admin/reorder";
import ConfirmDialog from "./ConfirmDialog";

type Props = {
  id: number;
  label: string;
  published?: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMove: (id: number, direction: Direction) => Promise<void>;
  onToggle?: (id: number, published: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

const btn =
  "rounded-lg p-1.5 text-mist hover:bg-steel hover:text-bone disabled:opacity-30";

export default function RowControls({
  id,
  label,
  published,
  isFirst,
  isLast,
  onMove,
  onToggle,
  onDelete,
}: Props) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Move up"
        disabled={pending || isFirst}
        onClick={() => start(() => onMove(id, "up"))}
        className={btn}
      >
        <ArrowUp size={16} />
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={pending || isLast}
        onClick={() => start(() => onMove(id, "down"))}
        className={btn}
      >
        <ArrowDown size={16} />
      </button>
      {onToggle && (
        <button
          type="button"
          aria-label={published ? "Hide" : "Publish"}
          disabled={pending}
          onClick={() => start(() => onToggle(id, !published))}
          className={btn}
        >
          {published ? <Eye size={16} /> : <EyeSlash size={16} />}
        </button>
      )}
      <button
        type="button"
        aria-label="Delete"
        disabled={pending}
        onClick={() => setConfirm(true)}
        className={btn}
      >
        <Trash size={16} />
      </button>
      <ConfirmDialog
        open={confirm}
        title={`Delete "${label}"? This cannot be undone.`}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          start(() => onDelete(id));
        }}
      />
    </div>
  );
}
