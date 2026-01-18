/// <reference types="vite/client" />
import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { toast } from "sonner";

interface Prize {
  label: string;
  color?: string;
  value?: number;
}

// Dummy prizes
const prizes: Prize[] = [
  { label: "10% OFF", color: "#FF6B6B", value: 10 },
  { label: "Free Shipping", color: "#4ECDC4", value: 0 },
  { label: "15% OFF", color: "#FFD93D", value: 15 },
  { label: "Try Again", color: "#95E1D3", value: 0 },
  { label: "20% OFF", color: "#F38181", value: 20 },
  { label: "$5 OFF", color: "#AA96DA", value: 5 },
  { label: "25% OFF", color: "#A8E6CF", value: 25 },
];

export function SpinWheel() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isLoadingOTP, setIsLoadingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [isRealDiscount, setIsRealDiscount] = useState(false);
  const [discountExpiresAt, setDiscountExpiresAt] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState("");
  const segmentAngle = 360 / prizes.length;
  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Optional: Set these for Shopify integration
  const shopDomain = import.meta.env.VITE_SHOP_DOMAIN || "";
  const campaignId = import.meta.env.VITE_CAMPAIGN_ID || "";

  const validateEmail = (value: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
    const domain = value.split("@")[1]?.toLowerCase();
    return domain === "gmail.com" || domain === "googlemail.com";
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const randomRotation = 360 * 5 + Math.random() * 360;
    setRotation((r) => r + randomRotation);
    setTimeout(() => {
      setIsSpinning(false);
      setShowEmailModal(true);
    }, 4000);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid Gmail address");
      return;
    }
    setEmailError("");
    setIsLoadingOTP(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!resp.ok)
        throw new Error(
          (await resp.json()).message || "Failed to send OTP"
        );
      toast.success("OTP sent to your email!");
      setShowEmailModal(false);
      setShowOTPModal(true);
      setOtp("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoadingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResendingOTP(true);
    setOtpError("");
    try {
      const resp = await fetch(`${BACKEND_URL}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!resp.ok)
        throw new Error(
          (await resp.json()).message || "Failed to send OTP"
        );
      toast.success("New OTP sent to your email!");
      setOtp("");
      // Start 60 second cooldown
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResendingOTP(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }
    setOtpError("");
    setIsVerifyingOTP(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      if (!resp.ok)
        throw new Error((await resp.json()).message || "Invalid OTP");
      toast.success("OTP verified! Claiming your prize...");
      await claimPrize();
    } catch (err) {
      console.error(err);
      setOtpError("Invalid OTP. Please try again.");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const claimPrize = async () => {
    try {
      const resp = await fetch(`${BACKEND_URL}/api/spin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shopDomain: shopDomain || undefined,
          campaignId: campaignId || undefined,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.message || "Server error");
      }

      setWonPrize({
        label: data.prizeWon || "Try Again",
        value: data.prizeValue,
        color: prizes.find((p) => p.label === data.prizeWon)?.color,
      });

      // New: Handle real Shopify discount response
      setDiscountCode(data.discountCode || ""); // Will be null if sent via email only
      setIsRealDiscount(data.isRealDiscount || false);
      setDiscountExpiresAt(data.expiresAt || null);
      setResultMessage(data.message || "");

      setShowOTPModal(false);
      setShowResultModal(true);

      if ((data.prizeWon || "").toLowerCase() !== "try again") {
        toast.success(data.message || "🎉 Your discount code has been sent to your email!");
      } else {
        toast.info("Better luck next time!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to claim prize.");
      setShowOTPModal(true);
    }
  };

  const handleCloseResult = () => {
    setShowResultModal(false);
    setEmail("");
    setOtp("");
    setWonPrize(null);
    setDiscountCode("");
    setIsRealDiscount(false);
    setDiscountExpiresAt(null);
    setResultMessage("");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
    >
      {/* Header */}
      <div className="max-w-2xl w-full text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-10 h-10 text-yellow-300 animate-pulse" />
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">
            Spin & Win!
          </h1>
          <Sparkles className="w-10 h-10 text-yellow-300 animate-pulse" />
        </div>
        <p className="text-white/90 text-lg sm:text-xl">
          Try your luck and win amazing prizes!
        </p>
        <p className="text-white/70 text-sm sm:text-base mt-2">
          Enter your email after spinning to claim your reward
        </p>
      </div>

      {/* Wheel */}
      <div className="relative flex items-center justify-center mb-12">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 drop-shadow-lg">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '15px solid transparent',
              borderRight: '15px solid transparent',
              borderTop: '30px solid white',
            }}
          />
        </div>

        <div className="relative w-[300px] sm:w-[380px] md:w-[450px] lg:w-[520px] aspect-square">
          <motion.div
            className="w-full h-full rounded-full relative shadow-2xl border-8 border-white"
            style={{ background: "#fff" }}
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* SVG Wheel */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {prizes.map((prize, index) => {
                const startAngle = index * segmentAngle - 90; // Start from top
                const endAngle = startAngle + segmentAngle;

                // Convert to radians
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                // Calculate arc points
                const x1 = 50 + 50 * Math.cos(startRad);
                const y1 = 50 + 50 * Math.sin(startRad);
                const x2 = 50 + 50 * Math.cos(endRad);
                const y2 = 50 + 50 * Math.sin(endRad);

                // Large arc flag
                const largeArc = segmentAngle > 180 ? 1 : 0;

                // Path for segment
                const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

                // Text position (middle of segment)
                const midAngle = startAngle + segmentAngle / 2;
                const midRad = (midAngle * Math.PI) / 180;
                const textRadius = 32; // Distance from center for text
                const textX = 50 + textRadius * Math.cos(midRad);
                const textY = 50 + textRadius * Math.sin(midRad);

                return (
                  <g key={prize.label + index}>
                    {/* Segment */}
                    <path
                      d={path}
                      fill={prize.color}
                      stroke="white"
                      strokeWidth="0.5"
                    />
                    {/* Text */}
                    <text
                      x={textX}
                      y={textY}
                      fill="white"
                      fontSize="4"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                      style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        fontFamily: 'system-ui, sans-serif'
                      }}
                    >
                      {prize.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 sm:w-20 md:w-24 lg:w-28 h-16 sm:h-20 md:h-24 lg:h-28 rounded-full bg-white shadow-lg border-4 border-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-600" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Spin Button */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={handleSpin}
          disabled={isSpinning}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? "Spinning..." : "Spin the Wheel!"}
        </Button>
      </div>

      {/* Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Your Email</DialogTitle>
            <DialogDescription>
              We'll send you an OTP to verify your email
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="font-bold">
                Gmail Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className="mt-2"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoadingOTP}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoadingOTP ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* OTP Modal */}
      <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to {email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div>
              <Label htmlFor="otp" className="font-bold">
                OTP Code
              </Label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                autoFocus
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtp(val);
                  setOtpError("");
                }}
                className="mt-2 w-full h-12 text-center text-2xl tracking-widest font-bold border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              {otpError && (
                <p className="text-red-500 text-sm mt-1">{otpError}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isVerifyingOTP || otp.length !== 6}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isVerifyingOTP ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                disabled={isResendingOTP || resendCooldown > 0}
                onClick={handleResendOTP}
                className="text-purple-600 hover:text-purple-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed mt-1"
              >
                {isResendingOTP
                  ? "Sending..."
                  : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend OTP"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Result Modal */}
      <Dialog open={showResultModal} onOpenChange={handleCloseResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {wonPrize?.label === "Try Again"
                ? "Better Luck Next Time!"
                : "Congratulations! 🎉"}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            {wonPrize?.label === "Try Again" ? (
              <div>
                <p className="text-lg mb-4">
                  Don't worry, come back tomorrow for another chance!
                </p>
                <p className="text-gray-600">
                  We've sent you a special offer via email.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xl mb-2">You've won</p>
                <p className="text-4xl font-bold text-purple-600 mb-4">
                  {wonPrize?.label}
                </p>

                {/* Real Shopify discount - code sent via email only */}
                {isRealDiscount && !discountCode && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-green-700 font-semibold mb-1">
                      Check Your Email!
                    </p>
                    <p className="text-sm text-green-600">
                      Your exclusive discount code has been sent to:
                    </p>
                    <p className="font-bold text-green-700 mt-1">{email}</p>
                    {discountExpiresAt && (
                      <p className="text-xs text-green-500 mt-2">
                        ⏰ Code expires: {new Date(discountExpiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Fallback: Show code on screen (for demo/testing) */}
                {discountCode && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Your discount code:
                    </p>
                    <p className="text-2xl font-bold text-purple-600 tracking-wider">
                      {discountCode}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      We've also sent this code to <strong>{email}</strong>
                    </p>
                  </div>
                )}

                {!discountCode && !isRealDiscount && (
                  <p className="text-sm text-gray-600">
                    We've sent your discount code to <strong>{email}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
          <Button onClick={handleCloseResult} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
