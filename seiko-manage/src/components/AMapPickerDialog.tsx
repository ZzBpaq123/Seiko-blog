"use client";

import { useState } from "react";
import { MapPin, X } from "lucide-react";
import AMapPicker from "./AMapPicker";

interface AMapPickerDialogProps {
  open: boolean;
  initialLng: string;
  initialLat: string;
  onConfirm: (lng: string, lat: string) => void;
  onCancel: () => void;
}

export default function AMapPickerDialog({
  open,
  initialLng,
  initialLat,
  onConfirm,
  onCancel,
}: AMapPickerDialogProps) {
  const [tempLng, setTempLng] = useState(initialLng);
  const [tempLat, setTempLat] = useState(initialLat);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
    >
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-3xl rounded-xl bg-card-bg p-5 shadow-xl animate-dialog-in flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            <h3 className="text-base font-semibold text-foreground">地图选点</h3>
          </div>
          <button
            type="button"
            className="p-1 rounded-md hover:bg-hover-bg text-[var(--muted)]"
            onClick={onCancel}
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden rounded-lg border border-border">
          <AMapPicker
            lng={tempLng}
            lat={tempLat}
            height="h-96"
            onChange={(newLng, newLat) => {
              setTempLng(newLng);
              setTempLat(newLat);
            }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)]">
            当前坐标：
            <span className="font-medium text-foreground ml-1">
              {tempLng && tempLat ? `${tempLng}, ${tempLat}` : "未选择"}
            </span>
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onConfirm(tempLng, tempLat)}
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
