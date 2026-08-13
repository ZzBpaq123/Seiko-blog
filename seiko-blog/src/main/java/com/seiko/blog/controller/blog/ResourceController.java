package com.seiko.blog.controller.blog;

import com.seiko.common.result.Result;
import com.seiko.blog.service.ResourceService;
import com.seiko.blog.vo.ResourceGroupVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 资源控制器（前台展示）
 */
@Tag(name = "资源模块", description = "资源目录展示相关接口")
@RestController
@RequestMapping("/api/blog/resource")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    /**
     * 获取已启用的资源（按分类分组）
     */
    @GetMapping("/groups")
    @Operation(summary = "获取资源分组", description = "获取已启用的资源列表，按分类聚合（用于前台展示）")
    public Result<List<ResourceGroupVO>> getEnabledResourceGroups() {
        return Result.success(resourceService.getEnabledResourceGroups());
    }
}
