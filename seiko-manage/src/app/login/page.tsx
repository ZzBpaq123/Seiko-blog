"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles, User, Lock, Mail, KeyRound, ArrowLeft, X } from "lucide-react";
import { login, getMaskedEmail, sendForgotPasswordCode, resetPasswordByEmail } from "@/api/user";
import { ApiBusinessError } from "@/utils/request";
import { notifyError, notifySuccess } from "@/utils/toast";

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY,
}: PupilProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!pupilRef.current || (forceLookX !== undefined && forceLookY !== undefined)) return;
      const pupil = pupilRef.current.getBoundingClientRect();
      const pupilCenterX = pupil.left + pupil.width / 2;
      const pupilCenterY = pupil.top + pupil.height / 2;
      const deltaX = e.clientX - pupilCenterX;
      const deltaY = e.clientY - pupilCenterY;
      const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
      const angle = Math.atan2(deltaY, deltaX);
      setPosition({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [forceLookX, forceLookY, maxDistance]);

  const finalPosition =
    forceLookX !== undefined && forceLookY !== undefined
      ? { x: forceLookX, y: forceLookY }
      : position;

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${finalPosition.x}px, ${finalPosition.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current || (forceLookX !== undefined && forceLookY !== undefined)) return;
      const eye = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = eye.left + eye.width / 2;
      const eyeCenterY = eye.top + eye.height / 2;
      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
      const angle = Math.atan2(deltaY, deltaX);
      setPosition({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [forceLookX, forceLookY, maxDistance]);

  const finalPosition =
    forceLookX !== undefined && forceLookY !== undefined
      ? { x: forceLookX, y: forceLookY }
      : position;

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        backgroundColor: eyeColor,
        overflow: "hidden",
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${finalPosition.x}px, ${finalPosition.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      )}
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);

  // 忘记密码弹窗状态
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotUsername, setForgotUsername] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [characterPositions, setCharacterPositions] = useState({
    purple: { faceX: 0, faceY: 0, bodySkew: 0 },
    black: { faceX: 0, faceY: 0, bodySkew: 0 },
    yellow: { faceX: 0, faceY: 0, bodySkew: 0 },
    orange: { faceX: 0, faceY: 0, bodySkew: 0 },
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 3;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const faceX = Math.max(-15, Math.min(15, deltaX / 20));
        const faceY = Math.max(-10, Math.min(10, deltaY / 30));
        const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));
        return { faceX, faceY, bodySkew };
      };

      setCharacterPositions({
        purple: calculatePosition(purpleRef),
        black: calculatePosition(blackRef),
        yellow: calculatePosition(yellowRef),
        orange: calculatePosition(orangeRef),
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    };
  }, []);

  // 紫色角色眨眼
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;
    const scheduleBlink = () => {
      return setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // 黑色角色眨眼
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;
    const scheduleBlink = () => {
      return setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // 开始输入时角色互相对视
  const handleInputFocus = () => {
    setIsTyping(true);
    setIsLookingAtEachOther(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => setIsLookingAtEachOther(false), 800);
  };

  const handleInputBlur = () => {
    setIsTyping(false);
    setIsLookingAtEachOther(false);
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  };

  // 密码可见时紫色角色偷看
  const startPeeking = () => {
    if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    const schedule = () => {
      peekTimerRef.current = setTimeout(() => {
        setIsPurplePeeking(true);
        peekTimerRef.current = setTimeout(() => {
          setIsPurplePeeking(false);
          schedule();
        }, 800);
      }, Math.random() * 3000 + 2000);
    };
    schedule();
  };

  const stopPeeking = () => {
    if (peekTimerRef.current) {
      clearTimeout(peekTimerRef.current);
      peekTimerRef.current = null;
    }
    setIsPurplePeeking(false);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length > 0 && showPassword) {
      startPeeking();
    } else {
      stopPeeking();
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => {
      const next = !prev;
      if (next && password.length > 0) {
        startPeeking();
      } else {
        stopPeeking();
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ username: username.trim(), password });
      notifySuccess("登录成功");
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof ApiBusinessError ? err.message : "登录失败，请稍后重试";
      notifyError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const openForgot = () => {
    setIsForgotOpen(true);
    setForgotStep(1);
    setForgotUsername("");
    setMaskedEmail("");
    setForgotEmail("");
    setForgotCode("");
    setForgotPassword("");
    setForgotConfirmPassword("");
    setShowForgotPassword(false);
    setShowForgotConfirmPassword(false);
    setCountdown(0);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const closeForgot = () => {
    setIsForgotOpen(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = forgotUsername.trim();
    if (!trimmed) {
      notifyError("请输入用户名");
      return;
    }
    setIsForgotSubmitting(true);
    try {
      const masked = await getMaskedEmail({ username: trimmed });
      setMaskedEmail(masked);
      setForgotStep(2);
    } catch (err) {
      const message = err instanceof ApiBusinessError ? err.message : "查询失败，请稍后重试";
      notifyError(message);
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleForgotSendCode = async () => {
    const trimmedEmail = forgotEmail.trim();
    if (!trimmedEmail) {
      notifyError("请输入完整邮箱");
      return;
    }
    setIsSendingCode(true);
    try {
      await sendForgotPasswordCode({ username: forgotUsername.trim(), email: trimmedEmail });
      notifySuccess("验证码已发送");
      startCountdown();
      setForgotStep(3);
    } catch (err) {
      const message = err instanceof ApiBusinessError ? err.message : "发送失败，请稍后重试";
      notifyError(message);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotCode.trim()) {
      notifyError("请输入验证码");
      return;
    }
    if (forgotPassword.length < 6 || forgotPassword.length > 20) {
      notifyError("密码长度需在 6-20 位之间");
      return;
    }
    if (forgotPassword !== forgotConfirmPassword) {
      notifyError("两次输入的密码不一致");
      return;
    }
    setIsForgotSubmitting(true);
    try {
      await resetPasswordByEmail({
        email: forgotEmail.trim(),
        code: forgotCode.trim(),
        newPassword: forgotPassword,
      });
      notifySuccess("密码重置成功，请使用新密码登录");
      closeForgot();
    } catch (err) {
      const message = err instanceof ApiBusinessError ? err.message : "重置失败，请稍后重试";
      notifyError(message);
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const renderForgotStep1 = () => (
    <form onSubmit={handleForgotStep1} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="forgot-username" className="block text-sm font-medium text-foreground">
          用户名
        </label>
        <div className="relative">
          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="forgot-username"
            type="text"
            placeholder="请输入用户名"
            value={forgotUsername}
            onChange={(e) => setForgotUsername(e.target.value)}
            required
            className="input h-12 w-full"
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full h-12 text-base justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={isForgotSubmitting}
      >
        {isForgotSubmitting ? "查询中..." : "下一步"}
      </button>
    </form>
  );

  const renderForgotStep2 = () => (
    <div className="space-y-5">
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-sm text-gray-600 dark:text-gray-300">
        该账号绑定的邮箱为：<span className="font-medium text-foreground">{maskedEmail}</span>
        <br />
        请输入完整邮箱以接收验证码。
      </div>
      <div className="space-y-2">
        <label htmlFor="forgot-email" className="block text-sm font-medium text-foreground">
          完整邮箱
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="forgot-email"
            type="email"
            placeholder="请输入完整邮箱"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
            className="input h-12 w-full"
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleForgotSendCode}
        className="btn btn-primary w-full h-12 text-base justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={isSendingCode}
      >
        {isSendingCode ? "发送中..." : "发送验证码"}
      </button>
    </div>
  );

  const renderForgotStep3 = () => (
    <form onSubmit={handleForgotReset} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="forgot-code" className="block text-sm font-medium text-foreground">
          验证码
        </label>
        <div className="relative">
          <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="forgot-code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="请输入 6 位验证码"
            value={forgotCode}
            onChange={(e) => setForgotCode(e.target.value)}
            required
            className="input h-12 w-full"
            style={{ paddingLeft: "2.5rem", paddingRight: "8rem" }}
          />
          <button
            type="button"
            onClick={handleForgotSendCode}
            disabled={countdown > 0 || isSendingCode}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/20 transition-colors"
          >
            {countdown > 0 ? `${countdown}s 后重发` : isSendingCode ? "发送中" : "重新发送"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="forgot-password" className="block text-sm font-medium text-foreground">
          新密码
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="forgot-password"
            type={showForgotPassword ? "text" : "password"}
            placeholder="请输入新密码（6-20 位）"
            value={forgotPassword}
            onChange={(e) => setForgotPassword(e.target.value)}
            required
            minLength={6}
            maxLength={20}
            className="input h-12 w-full"
            style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
          />
          <button
            type="button"
            onClick={() => setShowForgotPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground transition-colors"
          >
            {showForgotPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="forgot-confirm-password" className="block text-sm font-medium text-foreground">
          确认密码
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="forgot-confirm-password"
            type={showForgotConfirmPassword ? "text" : "password"}
            placeholder="请再次输入新密码"
            value={forgotConfirmPassword}
            onChange={(e) => setForgotConfirmPassword(e.target.value)}
            required
            className="input h-12 w-full"
            style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
          />
          <button
            type="button"
            onClick={() => setShowForgotConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground transition-colors"
          >
            {showForgotConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full h-12 text-base justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={isForgotSubmitting}
      >
        {isForgotSubmitting ? "重置中..." : "重置密码"}
      </button>
    </form>
  );

  const forgotTitle = forgotStep === 1 ? "忘记密码" : forgotStep === 2 ? "验证邮箱" : "重置密码";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* 左侧动画区 */}
      <div className="relative hidden lg:flex flex-col justify-between bg-linear-to-br from-gray-200 via-gray-100 to-gray-200 p-12 text-gray-700 overflow-hidden">
        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="size-8 rounded-lg bg-black/5 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <span>Seiko 管理后台</span>
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-center h-125">
          <div className="relative" style={{ width: "550px", height: "400px" }}>
            {/* 紫色角色 - 后层 */}
            <div
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "70px",
                width: "180px",
                height:
                  isTyping || (password.length > 0 && !showPassword)
                    ? "440px"
                    : "400px",
                backgroundColor: "#6C3FF5",
                borderRadius: "10px 10px 0 0",
                zIndex: 1,
                transform:
                  password.length > 0 && showPassword
                    ? `skewX(0deg)`
                    : isTyping || (password.length > 0 && !showPassword)
                      ? `skewX(${(characterPositions.purple.bodySkew || 0) - 12}deg) translateX(40px)`
                      : `skewX(${characterPositions.purple.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `20px`
                      : isLookingAtEachOther
                        ? `55px`
                        : `${45 + characterPositions.purple.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `35px`
                      : isLookingAtEachOther
                        ? `65px`
                        : `${40 + characterPositions.purple.faceY}px`,
                }}
              >
                <EyeBall
                  size={18}
                  pupilSize={7}
                  maxDistance={5}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? isPurplePeeking
                        ? 4
                        : -4
                      : isLookingAtEachOther
                        ? 3
                        : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? isPurplePeeking
                        ? 5
                        : -4
                      : isLookingAtEachOther
                        ? 4
                        : undefined
                  }
                />
                <EyeBall
                  size={18}
                  pupilSize={7}
                  maxDistance={5}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? isPurplePeeking
                        ? 4
                        : -4
                      : isLookingAtEachOther
                        ? 3
                        : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? isPurplePeeking
                        ? 5
                        : -4
                      : isLookingAtEachOther
                        ? 4
                        : undefined
                  }
                />
              </div>
            </div>

            {/* 黑色角色 - 中层 */}
            <div
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "240px",
                width: "120px",
                height: "310px",
                backgroundColor: "#2D2D2D",
                borderRadius: "8px 8px 0 0",
                zIndex: 2,
                transform:
                  password.length > 0 && showPassword
                    ? `skewX(0deg)`
                    : isLookingAtEachOther
                      ? `skewX(${(characterPositions.black.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                      : isTyping || (password.length > 0 && !showPassword)
                        ? `skewX(${(characterPositions.black.bodySkew || 0) * 1.5}deg)`
                        : `skewX(${characterPositions.black.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `10px`
                      : isLookingAtEachOther
                        ? `32px`
                        : `${26 + characterPositions.black.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `28px`
                      : isLookingAtEachOther
                        ? `12px`
                        : `${32 + characterPositions.black.faceY}px`,
                }}
              >
                <EyeBall
                  size={16}
                  pupilSize={6}
                  maxDistance={4}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isBlackBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? -4
                      : isLookingAtEachOther
                        ? 0
                        : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? -4
                      : isLookingAtEachOther
                        ? -4
                        : undefined
                  }
                />
                <EyeBall
                  size={16}
                  pupilSize={6}
                  maxDistance={4}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isBlackBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? -4
                      : isLookingAtEachOther
                        ? 0
                        : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? -4
                      : isLookingAtEachOther
                        ? -4
                        : undefined
                  }
                />
              </div>
            </div>

            {/* 橙色半圆角色 - 前左 */}
            <div
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "0px",
                width: "240px",
                height: "200px",
                zIndex: 3,
                backgroundColor: "#FF9B6B",
                borderRadius: "120px 120px 0 0",
                transform:
                  password.length > 0 && showPassword
                    ? `skewX(0deg)`
                    : `skewX(${characterPositions.orange.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `50px`
                      : `${82 + (characterPositions.orange.faceX || 0)}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `85px`
                      : `${90 + (characterPositions.orange.faceY || 0)}px`,
                }}
              >
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                />
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                />
              </div>
            </div>

            {/* 黄色角色 - 前右 */}
            <div
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "310px",
                width: "140px",
                height: "230px",
                backgroundColor: "#E8D754",
                borderRadius: "70px 70px 0 0",
                zIndex: 4,
                transform:
                  password.length > 0 && showPassword
                    ? `skewX(0deg)`
                    : `skewX(${characterPositions.yellow.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `20px`
                      : `${52 + (characterPositions.yellow.faceX || 0)}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `35px`
                      : `${40 + (characterPositions.yellow.faceY || 0)}px`,
                }}
              >
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                />
                <Pupil
                  size={12}
                  maxDistance={5}
                  pupilColor="#2D2D2D"
                  forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                />
              </div>
              <div
                className="absolute w-20 h-1 bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `10px`
                      : `${40 + (characterPositions.yellow.faceX || 0)}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `88px`
                      : `${88 + (characterPositions.yellow.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 text-sm text-gray-500">
          © {new Date().getFullYear()} Seiko Blog · 管理后台
        </div>

        {/* 装饰光斑 */}
        <div className="absolute top-1/4 right-1/4 size-64 bg-white/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-white/30 rounded-full blur-3xl" />
      </div>

      {/* 右侧登录表单 */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-105">
          {/* 移动端 Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <span>Seiko 管理后台</span>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
              欢迎回来！
            </h1>
            <p className="text-gray-500 text-sm">请登录您的管理员账号</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-foreground">
                用户名
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="username"
                  type="text"
                  placeholder="请输入用户名"
                  value={username}
                  autoComplete="username"
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  className="input h-12"
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                密码
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  required
                  className="input h-12"
                  style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                记住我 30 天
              </label>
              <button
                type="button"
                onClick={openForgot}
                className="text-sm text-primary hover:underline font-medium"
              >
                忘记密码？
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full h-12 text-base justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "登 录"}
            </button>
          </form>
        </div>
      </div>

      {isForgotOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={closeForgot} />
          <div className="relative w-full max-w-sm rounded-xl bg-card-bg p-6 shadow-xl animate-dialog-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {forgotStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setForgotStep((prev) => (prev === 3 ? 2 : 1) as 1 | 2 | 3)}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                    aria-label="返回上一步"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <h3 className="text-base font-semibold text-foreground">{forgotTitle}</h3>
              </div>
              <button
                type="button"
                onClick={closeForgot}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>

            {/* 步骤进度条 */}
            <div className="mb-6">
              <div className="relative flex items-start justify-between">
                <div className="absolute left-0 right-0 top-3 h-0.5 -translate-y-1/2 bg-gray-200 dark:bg-gray-700" />
                <div
                  className="absolute left-0 top-3 h-0.5 -translate-y-1/2 bg-primary transition-all duration-300"
                  style={{ width: `${((forgotStep - 1) / 2) * 100}%` }}
                />
                {[
                  { step: 1, label: "验证身份" },
                  { step: 2, label: "验证邮箱" },
                  { step: 3, label: "重置密码" },
                ].map(({ step, label }) => {
                  const isActive = step === forgotStep;
                  const isCompleted = step < forgotStep;
                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors duration-300 ${
                          isCompleted
                            ? "bg-primary text-white"
                            : isActive
                              ? "bg-primary text-white ring-2 ring-primary/30"
                              : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {step}
                      </div>
                      <span
                        className={`text-[10px] transition-colors duration-300 ${
                          isActive || isCompleted
                            ? "text-primary font-medium"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {forgotStep === 1 && renderForgotStep1()}
            {forgotStep === 2 && renderForgotStep2()}
            {forgotStep === 3 && renderForgotStep3()}
          </div>
        </div>
      )}
    </div>
  );
}
