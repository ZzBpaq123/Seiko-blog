package com.seiko.blog.component;

import com.seiko.common.exception.BusinessException;
import com.seiko.common.result.ResultCode;
import com.seiko.blog.config.LoginRateLimitProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 登录速率限制器单元测试
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class LoginRateLimiterTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private HttpServletRequest request;

    private LoginRateLimitProperties properties;
    private LoginRateLimiter loginRateLimiter;

    @BeforeEach
    void setUp() {
        properties = new LoginRateLimitProperties();
        properties.setEnabled(true);
        properties.setMaxAttempts(5);
        properties.setIpMaxAttempts(10);
        properties.setWindowSeconds(300);
        properties.setLockSeconds(900);

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        loginRateLimiter = new LoginRateLimiter(redisTemplate, properties);

        when(request.getRemoteAddr()).thenReturn("192.168.1.100");
    }

    @Test
    void check_shouldPass_whenNotLocked() {
        when(redisTemplate.hasKey("login:lock:account:admin")).thenReturn(false);
        when(redisTemplate.hasKey("login:lock:ip:192.168.1.100")).thenReturn(false);

        assertDoesNotThrow(() -> loginRateLimiter.check(request, "admin"));
    }

    @Test
    void check_shouldThrow_whenAccountLocked() {
        when(redisTemplate.hasKey("login:lock:account:admin")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> loginRateLimiter.check(request, "admin"));

        assertEquals(ResultCode.TOO_MANY_REQUESTS.getCode(), exception.getCode());
        assertTrue(exception.getMessage().contains("登录失败次数过多"));
    }

    @Test
    void check_shouldThrow_whenIpLocked() {
        when(redisTemplate.hasKey("login:lock:account:admin")).thenReturn(false);
        when(redisTemplate.hasKey("login:lock:ip:192.168.1.100")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> loginRateLimiter.check(request, "admin"));

        assertEquals(ResultCode.TOO_MANY_REQUESTS.getCode(), exception.getCode());
        assertTrue(exception.getMessage().contains("当前 IP 登录失败次数过多"));
    }

    @Test
    void recordFailure_shouldIncrementCount_andLockAccount_whenThresholdReached() {
        when(valueOperations.increment("login:fail:account:admin")).thenReturn(5L);
        when(valueOperations.increment("login:fail:ip:192.168.1.100")).thenReturn(1L);

        loginRateLimiter.recordFailure(request, "admin");

        verify(valueOperations).increment("login:fail:account:admin");
        verify(redisTemplate).expire("login:fail:account:admin", 300, java.util.concurrent.TimeUnit.SECONDS);
        verify(valueOperations).set("login:lock:account:admin", "1", 900, java.util.concurrent.TimeUnit.SECONDS);
        verify(redisTemplate).delete("login:fail:account:admin");
    }

    @Test
    void recordFailure_shouldLockIp_whenIpThresholdReached() {
        when(valueOperations.increment("login:fail:account:admin")).thenReturn(1L);
        when(valueOperations.increment("login:fail:ip:192.168.1.100")).thenReturn(10L);

        loginRateLimiter.recordFailure(request, "admin");

        verify(valueOperations).set("login:lock:ip:192.168.1.100", "1", 900, java.util.concurrent.TimeUnit.SECONDS);
        verify(redisTemplate).delete("login:fail:ip:192.168.1.100");
    }

    @Test
    void recordSuccess_shouldClearAllKeys() {
        loginRateLimiter.recordSuccess(request, "admin");

        verify(redisTemplate).delete("login:fail:account:admin");
        verify(redisTemplate).delete("login:fail:ip:192.168.1.100");
        verify(redisTemplate).delete("login:lock:account:admin");
        verify(redisTemplate).delete("login:lock:ip:192.168.1.100");
    }

    @Test
    void check_shouldDoNothing_whenDisabled() {
        properties.setEnabled(false);

        assertDoesNotThrow(() -> loginRateLimiter.check(request, "admin"));
        verifyNoInteractions(redisTemplate);
    }

    @Test
    void shouldUseXForwardedFor_whenPresent() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("10.0.0.1, 10.0.0.2");
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        loginRateLimiter.check(request, "admin");

        // 验证使用 X-Forwarded-For 的第一个 IP
        verify(redisTemplate).hasKey("login:lock:ip:10.0.0.1");
    }

}
