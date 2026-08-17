"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUser, getUserById, updateUser } from "@/api/user";
import ImageUpload from "@/components/ImageUpload";
import Select from "@/components/Select";
import FormScaffold from "@/components/FormScaffold";
import { useEntityLoad } from "@/hooks/useEntityForm";
import { notifyError } from "@/utils/toast";
import type { UserDTO, UserVO } from "@/types";

const AVATAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444", "#14b8a6"];

export default function UserForm({ mode }: { mode: "new" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));
  const isEdit = mode === "edit";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [userStatus, setUserStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);

  const { loading } = useEntityLoad<UserVO>({
    enabled: isEdit,
    id,
    loader: getUserById,
    invalidIdMessage: "无效的用户 ID",
    loadFailMessage: "加载用户失败",
    onLoaded: (user) => {
      setUsername(user.username ?? "");
      setNickname(user.nickname ?? "");
      setEmail(user.email ?? "");
      setAvatar(user.avatar ?? "");
      setAvatarColor(user.avatarColor || AVATAR_COLORS[0]);
      setBio(user.bio ?? "");
      setWebsite(user.website ?? "");
      setUserRole(user.userRole ?? "user");
      setUserStatus(user.userStatus ?? "active");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!username.trim()) {
      notifyError("请填写用户名");
      return;
    }
    if (!nickname.trim()) {
      notifyError("请填写昵称");
      return;
    }
    // 新建必须设置密码；编辑留空表示不修改
    if (!isEdit && !password.trim()) {
      notifyError("请设置初始密码");
      return;
    }
    if (password.trim() && (password.trim().length < 6 || password.trim().length > 20)) {
      notifyError("密码长度需在 6-20 之间");
      return;
    }

    const payload: UserDTO = {
      username: username.trim(),
      nickname: nickname.trim(),
      email: email.trim() || undefined,
      avatar: avatar.trim() || undefined,
      avatarColor: avatarColor || undefined,
      bio: bio.trim() || undefined,
      website: website.trim() || undefined,
      userRole,
      userStatus,
    };
    if (password.trim()) {
      payload.password = password.trim();
    }

    setSubmitting(true);
    try {
      if (isEdit) await updateUser(id, payload);
      else await createUser(payload);
      router.push("/users");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScaffold
      title={isEdit ? "编辑用户" : "新增用户"}
      backHref="/users"
      submitting={submitting}
      onSubmit={handleSubmit}
      loading={loading}
      loadError={loadError}
    >
      <div className="card space-y-4">
        <div className="flex gap-4">
          <div className="w-45 shrink-0">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">头像</label>
            <div className="aspect-square">
              <ImageUpload value={avatar} onChange={setAvatar} placeholder="上传头像" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">用户名 *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="登录用，3-20 位"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">昵称 *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="显示用"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">邮箱</label>
                <input
                  type="email"
                  className="input"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">角色</label>
                <Select value={userRole} onChange={(v) => setUserRole(String(v))}
                  options={[
                    { value: "user", label: "普通用户" },
                    { value: "admin", label: "管理员" },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">状态</label>
                <Select value={userStatus} onChange={(v) => setUserStatus(String(v))}
                  options={[
                    { value: "active", label: "正常" },
                    { value: "inactive", label: "禁用" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              密码 *
            </label>
            <input
              type="password"
              className="input"
              placeholder="6-20 位"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">头像背景色</label>
          <div className="flex items-center gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`w-7 h-7 rounded-full border-2 transition ${
                  avatarColor === c ? "border-foreground scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setAvatarColor(c)}
                title={c}
              />
            ))}
            <input
              type="color"
              className="w-7 h-7 rounded cursor-pointer bg-transparent"
              value={avatarColor}
              onChange={(e) => setAvatarColor(e.target.value)}
              title="自定义颜色"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">个人网站</label>
          <input
            type="text"
            className="input"
            placeholder="https://..."
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">个人简介</label>
          <textarea
            className="input min-h-20 resize-y"
            placeholder="一句话介绍..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
      </div>
    </FormScaffold>
  );
}
