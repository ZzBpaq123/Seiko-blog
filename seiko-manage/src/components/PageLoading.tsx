import { Loader2 } from "lucide-react";

/** 统一的居中加载占位，用于 Suspense fallback 与表单/详情加载态。 */
export default function PageLoading() {
  return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <Loader2 size={24} className="animate-spin mr-2" />
      加载中...
    </div>
  );
}
