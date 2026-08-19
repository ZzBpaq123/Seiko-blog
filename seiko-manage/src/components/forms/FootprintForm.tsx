"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createFootprint, getFootprintById, updateFootprint } from "@/api/footprint";
import ImageUpload from "@/components/ImageUpload";
import AMapPickerDialog from "@/components/AMapPickerDialog";
import CalendarPicker from "@/components/CalendarPicker";
import Select from "@/components/Select";
import FormScaffold from "@/components/FormScaffold";
import { useEntityLoad } from "@/hooks/useEntityForm";
import { useDictOptions } from "@/hooks/useDict";
import { dictFormOptions } from "@/utils/dict";
import { notifyError, notifySuccess } from "@/utils/toast";
import type { FootprintCreateDTO, FootprintVO } from "@/types";
import { MapPin } from "lucide-react";

export default function FootprintForm({ mode }: { mode: "new" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [footprintDate, setFootprintDate] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [footprintType, setFootprintType] = useState("domestic");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerVersion, setPickerVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { options: footprintTypeOptions } = useDictOptions("footprint_type");

  const { loading } = useEntityLoad<FootprintVO>({
    enabled: mode === "edit",
    id,
    loader: getFootprintById,
    invalidIdMessage: "无效的足迹 ID",
    loadFailMessage: "加载足迹失败",
    onLoaded: (fp) => {
      setCity(fp.city ?? "");
      setProvince(fp.province ?? "");
      setCountry(fp.country ?? "");
      setCountryCode(fp.countryCode ?? "");
      setFootprintDate(fp.footprintDate ?? "");
      setDescription(fp.description ?? "");
      setImage(fp.image ?? "");
      setFootprintType(fp.footprintType ?? "domestic");
      setLat(fp.lat != null ? String(fp.lat) : "");
      setLng(fp.lng != null ? String(fp.lng) : "");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!city.trim()) {
      notifyError("请填写城市");
      return;
    }
    if (!province.trim()) {
      notifyError("请填写省份/州");
      return;
    }
    if (!country.trim()) {
      notifyError("请填写国家");
      return;
    }
    if (!countryCode.trim()) {
      notifyError("请填写国家代码");
      return;
    }
    if (!footprintDate.trim()) {
      notifyError("请选择日期");
      return;
    }
    const payload: FootprintCreateDTO = {
      city: city.trim(),
      province: province.trim(),
      country: country.trim(),
      countryCode: countryCode.trim(),
      footprintDate: footprintDate.trim(),
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      footprintType,
      lat: lat.trim() ? Number(lat.trim()) : undefined,
      lng: lng.trim() ? Number(lng.trim()) : undefined,
    };
    setSubmitting(true);
    try {
      if (mode === "new") await createFootprint(payload);
      else await updateFootprint(id, payload);
      notifySuccess(mode === "new" ? "足迹添加成功" : "足迹更新成功");
      router.push("/footprints");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScaffold
      title={mode === "new" ? "添加足迹" : "编辑足迹"}
      backHref="/footprints"
      submitting={submitting}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <ImageUpload label="照片" value={image} onChange={setImage} aspectRatio="16/9" />
          </div>
          <div className="space-y-4 md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">城市 *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="如：成都"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">国家 *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="如：中国"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">省份/州 *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="如：四川"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">国家代码 *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="如：CN"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CalendarPicker
                label="日期 *"
                precision="month"
                placeholder="请选择月份"
                value={footprintDate}
                onChange={setFootprintDate}
              />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">类型</label>
                <Select
                  value={footprintType}
                  onChange={(v) => setFootprintType(String(v))}
                  options={dictFormOptions(footprintTypeOptions)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">经度</label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  placeholder="如：104.0668"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">纬度</label>
                <input
                  type="number"
                  step="any"
                  className="input"
                  placeholder="如：30.5728"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">地图选点</label>
                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => {
                    setPickerVersion((v) => v + 1);
                    setPickerOpen(true);
                  }}
                >
                  <MapPin size={16} />
                  {lng && lat ? "重新选点" : "在地图上选点"}
                </button>
              </div>
            </div>
            <AMapPickerDialog
              key={pickerVersion}
              open={pickerOpen}
              initialLng={lng}
              initialLat={lat}
              onCancel={() => setPickerOpen(false)}
              onConfirm={(newLng, newLat) => {
                setLng(newLng);
                setLat(newLat);
                setPickerOpen(false);
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">描述</label>
          <textarea
            className="input min-h-24 resize-y"
            placeholder="记录这次旅行的点滴..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
    </FormScaffold>
  );
}
