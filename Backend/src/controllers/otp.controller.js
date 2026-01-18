import { isValidEmail } from "../utils/emailValidator.js";
import { sendOTPEmail } from "../services/email.service.js";


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


const otpStore = new Map();

export async function sendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) 
      return res.status(400).json({ success: false, message: "Email is required" });
    if (!isValidEmail(email)) 
      return res.status(400).json({ success: false, message: "Invalid email format" });

    const otp = generateOTP();

    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    const previewUrl = await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      email,
      previewUrl: previewUrl || null,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
}

export async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) 
      return res.status(400).json({ success: false, message: "Email and OTP required" });

    const storedData = otpStore.get(email);
    if (!storedData) 
      return res.status(400).json({ success: false, message: "No OTP found for this email" });
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    if (storedData.otp !== otp.toString()) 
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    otpStore.delete(email);
    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
}
