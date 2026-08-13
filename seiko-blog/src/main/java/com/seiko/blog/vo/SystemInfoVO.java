package com.seiko.blog.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 系统信息VO
 */
@Data
@Schema(description = "系统信息VO")
public class SystemInfoVO {

    @Schema(description = "操作系统信息")
    private Os os;

    @Schema(description = "Java 运行时信息")
    private Java java;

    @Schema(description = "数据库信息")
    private Database database;

    @Schema(description = "Redis 信息")
    private Redis redis;

    @Schema(description = "内存信息")
    private Memory memory;

    @Data
    @Schema(description = "操作系统信息")
    public static class Os {
        @Schema(description = "系统名称")
        private String name;

        @Schema(description = "系统版本")
        private String version;

        @Schema(description = "系统架构")
        private String arch;

        @Schema(description = "处理器核心数")
        private Integer processors;
    }

    @Data
    @Schema(description = "Java 运行时信息")
    public static class Java {
        @Schema(description = "Java 版本")
        private String version;

        @Schema(description = "Java 供应商")
        private String vendor;

        @Schema(description = "JVM 名称")
        private String vmName;

        @Schema(description = "Java 服务运行状态：运行中 / 异常")
        private String status;

        @Schema(description = "Java 服务已运行时长（毫秒）")
        private Long uptime;
    }

    @Data
    @Schema(description = "数据库信息")
    public static class Database {
        @Schema(description = "数据库产品名称")
        private String name;

        @Schema(description = "数据库版本")
        private String version;

        @Schema(description = "驱动名称及版本")
        private String driver;

        @Schema(description = "数据库连接状态：运行中 / 异常")
        private String status;
    }

    @Data
    @Schema(description = "Redis 信息")
    public static class Redis {
        @Schema(description = "Redis 版本")
        private String version;

        @Schema(description = "Redis 运行模式")
        private String mode;

        @Schema(description = "Redis 连接状态：运行中 / 异常")
        private String status;
    }

    @Data
    @Schema(description = "内存信息")
    public static class Memory {
        @Schema(description = "系统物理内存总量，如 31GB10MB")
        private String total;

        @Schema(description = "系统物理内存已用，如 31GB10MB")
        private String used;

        @Schema(description = "系统物理内存空闲，如 31GB10MB")
        private String free;

        @Schema(description = "系统物理内存使用率，如 56.7%")
        private String usage;

        @Schema(description = "JVM 最大可用内存，如 4GB")
        private String jvmMax;

        @Schema(description = "JVM 已分配内存，如 512MB")
        private String jvmTotal;

        @Schema(description = "JVM 已用内存，如 256MB")
        private String jvmUsed;

        @Schema(description = "JVM 空闲内存，如 256MB")
        private String jvmFree;
    }
}
