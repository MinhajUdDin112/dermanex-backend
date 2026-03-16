export function buildResetOtpEmail(params: {
  otp: string;
  expiresInMinutes: number;
}): { subject: string; html: string; text: string } {
  const { otp, expiresInMinutes } = params;
  const subject = 'Password Reset OTP';
  const html = `
    <p>Your OTP to reset your password is:</p>
    <h2>${otp}</h2>
    <p>This code will expire in ${expiresInMinutes} minutes.</p>
  `;
  const text = `Your OTP to reset your password is ${otp}. This code will expire in ${expiresInMinutes} minutes.`;

  return { subject, html, text };
}
