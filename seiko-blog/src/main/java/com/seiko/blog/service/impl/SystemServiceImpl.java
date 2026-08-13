package com.seiko.blog.service.impl;

import com.seiko.blog.service.SystemService;
import com.seiko.blog.vo.SystemInfoVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.RuntimeMXBean;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.Properties;

/**
 * 系统状态服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SystemServiceImpl implements SystemService {

    private static final String STATUS_UP = "运行中";
    private static final String STATUS_DOWN = "异常";

    private final DataSource dataSource;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public SystemInfoVO getSystemInfo() {
        SystemInfoVO vo = new SystemInfoVO();
        vo.setOs(buildOs());
        vo.setJava(buildJava());
        vo.setDatabase(buildDatabase());
        vo.setRedis(buildRedis());
        vo.setMemory(buildMemory());
        return vo;
    }

    /**
     * 操作系统信息
     */
    private SystemInfoVO.Os buildOs() {
        SystemInfoVO.Os os = new SystemInfoVO.Os();
        os.setName(System.getProperty("os.name"));
        os.setVersion(System.getProperty("os.version"));
        os.setArch(System.getProperty("os.arch"));
        os.setProcessors(Runtime.getRuntime().availableProcessors());
        return os;
    }

    /**
     * Java 运行时信息
     */
    private SystemInfoVO.Java buildJava() {
        SystemInfoVO.Java java = new SystemInfoVO.Java();
        java.setVersion(System.getProperty("java.version"));
        java.setVendor(System.getProperty("java.vendor"));
        java.setVmName(System.getProperty("java.vm.name"));
        // 能执行到此处即代表 Java 服务正常运行
        java.setStatus(STATUS_UP);
        try {
            RuntimeMXBean runtimeMXBean = ManagementFactory.getRuntimeMXBean();
            java.setUptime(runtimeMXBean.getUptime());
        } catch (Exception e) {
            log.warn("获取 JVM 运行时长失败", e);
        }
        return java;
    }

    /**
     * 数据库信息及状态
     */
    private SystemInfoVO.Database buildDatabase() {
        SystemInfoVO.Database database = new SystemInfoVO.Database();
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            database.setName(metaData.getDatabaseProductName());
            database.setVersion(metaData.getDatabaseProductVersion());
            database.setDriver(metaData.getDriverName() + " " + metaData.getDriverVersion());
            database.setStatus(connection.isValid(2) ? STATUS_UP : STATUS_DOWN);
        } catch (Exception e) {
            log.warn("获取数据库信息失败", e);
            database.setStatus(STATUS_DOWN);
        }
        return database;
    }

    /**
     * Redis 信息及状态
     */
    private SystemInfoVO.Redis buildRedis() {
        SystemInfoVO.Redis redis = new SystemInfoVO.Redis();
        RedisConnectionFactory factory = stringRedisTemplate.getConnectionFactory();
        if (factory == null) {
            redis.setStatus(STATUS_DOWN);
            return redis;
        }
        try (RedisConnection connection = factory.getConnection()) {
            Properties info = connection.serverCommands().info("server");
            if (info != null) {
                redis.setVersion(info.getProperty("redis_version"));
                redis.setMode(info.getProperty("redis_mode"));
            }
            String pong = connection.ping();
            redis.setStatus("PONG".equalsIgnoreCase(pong) ? STATUS_UP : STATUS_DOWN);
        } catch (Exception e) {
            log.warn("获取 Redis 信息失败", e);
            redis.setStatus(STATUS_DOWN);
        }
        return redis;
    }

    /**
     * 系统物理内存及 JVM 内存信息
     */
    private SystemInfoVO.Memory buildMemory() {
        SystemInfoVO.Memory memory = new SystemInfoVO.Memory();

        // 系统物理内存
        try {
            OperatingSystemMXBean osMXBean = ManagementFactory.getOperatingSystemMXBean();
            if (osMXBean instanceof com.sun.management.OperatingSystemMXBean sunOsMXBean) {
                long total = sunOsMXBean.getTotalMemorySize();
                long free = sunOsMXBean.getFreeMemorySize();
                long used = total - free;
                memory.setTotal(formatBytes(total));
                memory.setFree(formatBytes(free));
                memory.setUsed(formatBytes(used));
                memory.setUsage(formatUsage(used, total));
            }
        } catch (Exception e) {
            log.warn("获取系统物理内存信息失败", e);
        }

        // JVM 内存
        Runtime runtime = Runtime.getRuntime();
        long jvmMax = runtime.maxMemory();
        long jvmTotal = runtime.totalMemory();
        long jvmFree = runtime.freeMemory();
        memory.setJvmMax(formatBytes(jvmMax));
        memory.setJvmTotal(formatBytes(jvmTotal));
        memory.setJvmFree(formatBytes(jvmFree));
        memory.setJvmUsed(formatBytes(jvmTotal - jvmFree));

        return memory;
    }

    private static final long GB = 1024L * 1024 * 1024;
    private static final long MB = 1024L * 1024;

    /**
     * 将字节数换算为可读字符串，从 GB 开始，不足 GB 的部分使用 MB，例如 31GB10MB。
     */
    private String formatBytes(long bytes) {
        if (bytes <= 0) {
            return "0MB";
        }
        long gb = bytes / GB;
        long mb = (bytes % GB) / MB;
        StringBuilder sb = new StringBuilder();
        if (gb > 0) {
            sb.append(gb).append("GB");
        }
        if (mb > 0) {
            sb.append(mb).append("MB");
        }
        // 不足 1MB 时回退展示 0MB
        if (sb.isEmpty()) {
            sb.append("0MB");
        }
        return sb.toString();
    }

    /**
     * 计算使用率百分比，保留一位小数
     */
    private String formatUsage(long used, long total) {
        if (total <= 0) {
            return "0.0%";
        }
        return String.format("%.1f%%", used * 100.0 / total);
    }
}
