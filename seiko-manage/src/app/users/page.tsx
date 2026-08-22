"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  User,
  Shield,
  RotateCcw,
  Loader2,
  Users,
  CircleHelp,
} from "lucide-react";
import {
  getUserList,
  deleteUser,
  updateUserStatus,
} from "@/api/user";
import type { UserVO } from "@/types";
import { useConfirm } from "@/components/ConfirmDialog";
import Select from "@/components/Select";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagedList } from "@/hooks/usePagedList";
import { useDictOptions } from "@/hooks/useDict";
import { dictBadgeClass, dictLabel, dictSelectOptions } from "@/utils/dict";
import { notifyError, notifySuccess } from "@/utils/toast";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const router = useRouter();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search);
  const debouncedEmail = useDebounce(emailSearch);
  const { options: userRoleOptions } = useDictOptions("user_role");
  const { options: userStatusOptions } = useDictOptions("user_status");

  const { page, setPage, loading, pageResult, records, refresh, reset } = usePagedList<UserVO>({
    pageSize: PAGE_SIZE,
    deps: [debouncedSearch, debouncedEmail, roleFilter, statusFilter],
    fetch: (page) =>
      getUserList({
        page,
        size: PAGE_SIZE,
        username: debouncedSearch.trim() || undefined,
        email: debouncedEmail.trim() || undefined,
        userRole: roleFilter || undefined,
        userStatus: statusFilter || undefined,
      }),
  });

  const handleReset = () => {
    setSearch("");
    setEmailSearch("");
    setRoleFilter("");
    setStatusFilter("");
    reset();
  };

  // 删除用户
  const handleDelete = async (id: number) => {
    if (!id) return;
    if (!(await confirm({ message: "确定要删除该用户吗？删除后不可恢复。" }))) return;
    setDeletingId(id);
    try {
      await deleteUser(id);
      notifySuccess("用户删除成功");
      refresh();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  // 切换用户状态
  const handleToggleStatus = async (user: UserVO) => {
    const next = user.userStatus === "active" ? "inactive" : "active";
    if (user.userRole === "admin" && next === "inactive") {
      notifyError("管理员用户不能被禁用");
      return;
    }
    setTogglingId(user.id);
    try {
      await updateUserStatus(user.id, next);
      notifySuccess("用户状态更新成功");
      refresh();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "状态更新失败");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="用户管理"
        action={
          <Link href="/users/new" className="btn btn-primary">
            <Plus size={16} /> 新增用户
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="card flex items-center gap-4">
        <div className="relative flex-6 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索用户名或昵称..."
            className="input input-icon"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative flex-6 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索邮箱..."
            className="input input-icon"
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
          />
        </div>
        <Select className="flex-3 min-w-0" value={roleFilter} onChange={(v) => setRoleFilter(String(v))}
          options={dictSelectOptions(userRoleOptions, "全部角色")}
        />
        <Select className="flex-3 min-w-0" value={statusFilter} onChange={(v) => setStatusFilter(String(v))}
          options={dictSelectOptions(userStatusOptions, "全部状态")}
        />
        <button
          type="button"
          className="btn btn-secondary flex-2 min-w-0 justify-center whitespace-nowrap"
          onClick={handleReset}
          title="重置"
        >
          <RotateCcw size={16} /> 重置
        </button>
      </div>

      {/* Table */}
      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>用户</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>
                <span className="inline-flex items-center gap-1">
                  状态
                  <span title="点击状态标签可禁用/启用用户">
                    <CircleHelp size={14} className="text-gray-400 cursor-help" />
                  </span>
                </span>
              </th>
              <th>最后登录</th>
              <th>注册时间</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-gray-500">
                  <div className="flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin mr-2" /> 加载中...
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Users size={36} className="mb-2" /> 暂无用户
                  </div>
                </td>
              </tr>
            ) : (
              records.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0"
                        style={{ backgroundColor: user.avatarColor || "#3b82f6" }}
                      >
                        {user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
                        ) : (
                          user.nickname?.[0] ?? "?"
                        )}
                      </div>
                      <span className="font-medium text-foreground">{user.nickname}</span>
                    </div>
                  </td>
                  <td>{user.username}</td>
                  <td className="text-gray-500">{user.email || "—"}</td>
                  <td>
                    <span className={dictBadgeClass(userRoleOptions, user.userRole)}>
                      <span className="flex items-center gap-1">
                        {user.userRole === "admin" ? <Shield size={10} /> : <User size={10} />}
                        {dictLabel(userRoleOptions, user.userRole)}
                      </span>
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${dictBadgeClass(userStatusOptions, user.userStatus)} cursor-pointer disabled:opacity-50`}
                      title="点击切换状态"
                      onClick={() => handleToggleStatus(user)}
                      disabled={togglingId === user.id}
                    >
                      {togglingId === user.id ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        dictLabel(userStatusOptions, user.userStatus)
                      )}
                    </button>
                  </td>
                  <td className="text-gray-500">{user.lastLoginTime || "—"}</td>
                  <td className="text-gray-500">{user.createTime || "—"}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                        title="编辑"
                        onClick={() => router.push(`/users/edit?id=${user.id}`)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="删除"
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination pageResult={pageResult} page={page} onChange={setPage} />
    </div>
  );
}
