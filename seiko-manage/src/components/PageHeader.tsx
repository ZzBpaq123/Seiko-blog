import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  /** 右侧操作区，通常为「新建」按钮 */
  action?: ReactNode;
}

/** 列表/详情页统一页头：左侧标题，右侧操作区。 */
export default function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {action}
    </div>
  );
}
