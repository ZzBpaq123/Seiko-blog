package com.seiko.blog.controller.manage;

import com.seiko.common.result.Result;
import com.seiko.blog.service.SystemService;
import com.seiko.blog.vo.SystemInfoVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 系统状态控制器
 */
@Tag(name = "系统状态控制器", description = "系统状态控制器")
@RestController
@RequestMapping("/api/manage/system")
@RequiredArgsConstructor
public class SystemController {

    private final SystemService systemService;

    /**
     * 获取系统信息
     *
     * @return 系统信息（操作系统、Java、数据库、Redis、内存等）
     */
    @Operation(summary = "获取系统信息", description = "获取系统版本、数据库版本及状态、Redis 版本及状态、Java 版本及服务状态、系统内存等信息")
    @GetMapping("/info")
    public Result<SystemInfoVO> getSystemInfo() {
        return Result.success(systemService.getSystemInfo());
    }
}
