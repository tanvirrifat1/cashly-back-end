import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
  </head>
  <body style="font-family: 'Arial', sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; margin: 30px auto; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            <tr>
              <td align="center" style="padding: 40px; border-bottom: 3px solid #1761FF;">
                <h1 style="color: #34495e; margin: 0; font-size: 28px; font-family: 'Arial', sans-serif;">CASHLY</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px; font-size: 16px; color: #333;">
                <h2 style="color: #2c3e50; margin-bottom: 20px; font-weight: 600; font-size: 20px;">Hello, ${
                  values.name
                }!</h2>
                <p style="line-height: 1.6; margin-bottom: 25px; color: #555;">Thank you for creating an account. Please use the following One-Time Password (OTP) to verify your email:</p>
                <div style="background-color: #9E3DFF; color: #fff; padding: 14px 24px; border-radius: 8px; font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 25px;">
                  ${values.otp}
                </div>
                <p style="line-height: 1.6; margin-bottom: 25px; color: #555;">This OTP is valid for <strong>3 minutes</strong>. Do not share it with anyone.</p>
                <p style="line-height: 1.6; margin-bottom: 0; color: #999;">If you did not request this, please ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 25px 40px; border-top: 1px solid #eee; font-size: 13px; color: #aaa; text-align: center;">
                &copy; ${new Date().getFullYear()} CASHLY. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
    `,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Reset Password</title>
  </head>
  <body style="font-family: 'Arial', sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; margin: 30px auto; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            <tr>
              <td align="center" style="padding: 40px; border-bottom: 3px solid #1761FF;">
                <h1 style="color: #34495e; margin: 0; font-size: 28px; font-family: 'Arial', sans-serif;">CASHLY</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px; font-size: 16px; color: #333;">
                <h2 style="color: #2c3e50; margin-bottom: 20px; font-weight: 600; font-size: 20px;">Hello!</h2>
                <p style="line-height: 1.6; margin-bottom: 25px; color: #555;">
                  You recently requested to reset your password. Use the One-Time Password (OTP) below to proceed:
                </p>
                <div style="background-color: #9E3DFF; color: #fff; padding: 14px 24px; border-radius: 8px; font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 25px;">
                  ${values.otp}
                </div>
                <p style="line-height: 1.6; margin-bottom: 25px; color: #555;">
                  This OTP is valid for <strong>3 minutes</strong>. Do not share it with anyone.
                </p>
                <p style="line-height: 1.6; margin-bottom: 0; color: #999;">
                  If you didn’t request a password reset, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 25px 40px; border-top: 1px solid #eee; font-size: 13px; color: #aaa; text-align: center;">
                &copy; ${new Date().getFullYear()} CASHLY. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
    `,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
};
