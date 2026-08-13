export interface Experience {
  year: string;
  title: string;
  desc: string;
}

/** 个人经历数据 */
export const EXPERIENCES: Experience[] = [
  {
    year: "2026 - 至今",
    title: "第二家公司",
    desc: "独立开发并维护个人博客系统，前后端一体化架构设计与实现",
  },
  {
    year: "2023 - 2026",
    title: "入职第一家公司",
    desc: "专注于 Java / Spring Boot 生态，微服务架构实践",
  },
  {
    year: "2019 - 2023",
    title: "大学生涯",
    desc: "入门编程，系统学习计算机基础与软件开发",
  },
];
