package com.seiko.blog.service;

/**
 * 验证码服务
 */
public interface VerificationCodeService {

    /**
     * 生成并发送验证码
     *
     * @param email 目标邮箱
     * @return 生成的验证码
     */
    String generateAndSend(String email);

    /**
     * 校验验证码
     *
     * @param email 目标邮箱
     * @param code  用户提交的验证码
     * @return 校验是否通过
     */
    boolean verify(String email, String code);

    /**
     * 构建 Redis Key
     */
    String buildRedisKey(String email);
}
