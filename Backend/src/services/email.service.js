import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, 
  },
});

async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`${subject} email sent:`, info.messageId);
    return true;
  } catch (err) {
    console.error("Failed to send email:", err.message);
    return false;
  }
}

function buildDiscountHtml(code, prizeLabel) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin: 20px 0; }
        .code-box { background: white; border: 2px solid #667eea; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎉 Congratulations! You Won!</h2>
        </div>
        <div class="content">
          <p>Hey there!</p>
          <p>You just spun the wheel and won: <strong>${prizeLabel}</strong></p>
          <p>Your exclusive discount code is ready to use:</p>
          <div class="code-box">${code}</div>
          <p><strong>How to use:</strong></p>
          <ol>
            <li>Copy the code above</li>
            <li>Apply it at checkout</li>
            <li>Your discount will be automatically applied</li>
          </ol>
          <p style="color: #e74c3c;"><strong>⏰ Code expires in 7 days</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please don't reply.</p>
          <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;
}

function buildOTPHtml(otp) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin: 20px 0; }
        .otp-box { background: white; border: 2px solid #667eea; padding: 20px; border-radius: 5px; text-align: center; font-size: 32px; font-weight: bold; margin: 20px 0; letter-spacing: 5px; }
        .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔐 Your OTP Code</h2>
        </div>
        <div class="content">
          <p>Hey there!</p>
          <p>Use the code below to verify your email address:</p>
          <div class="otp-box">${otp}</div>
          <p><strong>⏰ This code expires in 5 minutes</strong></p>
          <p style="color: #e74c3c;"><strong>Do not share this code with anyone.</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please don't reply.</p>
          <p>&copy; ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;
}


export async function sendDiscountEmail(to, code, prizeLabel = "Discount") {
  const html = buildDiscountHtml(code, prizeLabel);
  return await sendEmail(to, "🎉 Your Spin Wheel Discount Code", html);
}

export async function sendOTPEmail(to, otp) {
  const html = buildOTPHtml(otp);
  return await sendEmail(to, "🔐 Your OTP Code", html);
}
