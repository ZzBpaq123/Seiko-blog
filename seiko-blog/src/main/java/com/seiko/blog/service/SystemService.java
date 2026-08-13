package com.seiko.blog.service;

import com.seiko.blog.vo.SystemInfoVO;

public interface SystemService {

    /**
     * 获取系统信息（操作系统、Java、数据库、Redis、内存等）
     *
     * @return 系统信息
     */
    SystemInfoVO getSystemInfo();
}
