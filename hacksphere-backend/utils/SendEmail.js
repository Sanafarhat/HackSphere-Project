import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else {
    console.log('📧 Email service ready');
  }
});

// ── Send Team Invite Email ──
export const sendTeamInviteEmail = async ({ toEmail, teamName, teamLeaderName, inviteToken }) => {
  const inviteLink = `${process.env.FRONTEND_URL}/join?token=${inviteToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#080c14;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080c14;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#0f1724;border-radius:16px;border:1px solid #1e2f47;overflow:hidden;max-width:600px;width:100%;">
              
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#7c3aed,#00d4ff);padding:40px 40px 30px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:800;letter-spacing:-1px;">HackSphere</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Season 1 — Team Invitation</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">Hey there 👋</p>
                  
                  <p style="color:#e2eaf5;font-size:16px;line-height:1.6;margin:0 0 24px;">
                    <strong style="color:#00d4ff;">${teamLeaderName}</strong> has invited you to join their team 
                    <strong style="color:#ffffff;">"${teamName}"</strong> on HackSphere — an internal college hackathon platform where students build real projects.
                  </p>

                  <!-- Team Card -->
                  <div style="background:#131d2e;border:1px solid #1e2f47;border-radius:12px;padding:20px;margin:0 0 32px;">
                    <p style="color:#5a7394;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">You're invited to</p>
                    <p style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 4px;">${teamName}</p>
                    <p style="color:#94a3b8;font-size:13px;margin:0;">Led by ${teamLeaderName}</p>
                  </div>

                  <!-- CTA Button -->
                  <div style="text-align:center;margin:0 0 32px;">
                    <a href="${inviteLink}" 
                       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#00d4ff);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;">
                      Accept Invitation →
                    </a>
                  </div>

                  <p style="color:#5a7394;font-size:12px;text-align:center;margin:0 0 8px;">
                    Or copy this link into your browser:
                  </p>
                  <p style="color:#00d4ff;font-size:11px;text-align:center;word-break:break-all;margin:0 0 32px;">
                    ${inviteLink}
                  </p>

                  <div style="border-top:1px solid #1e2f47;padding-top:24px;">
                    <p style="color:#5a7394;font-size:12px;line-height:1.6;margin:0;">
                      This invite link expires in <strong style="color:#94a3b8;">7 days</strong>. 
                      If you weren't expecting this email, you can safely ignore it.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#080c14;padding:20px 40px;text-align:center;border-top:1px solid #1e2f47;">
                  <p style="color:#5a7394;font-size:11px;margin:0;">
                    HackSphere · Internal College Hackathon Platform · Season 1
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `🚀 You're invited to join "${teamName}" on HackSphere`,
    html,
  });
};

// ── Send Welcome Email (after invite accepted) ──
export const sendWelcomeEmail = async ({ toEmail, name, teamName }) => {
  const dashboardLink = `${process.env.FRONTEND_URL}/student/dashboard`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `✅ You've joined "${teamName}" on HackSphere!`,
    html: `
      <body style="background:#080c14;font-family:Arial,sans-serif;padding:40px 20px;">
        <div style="max-width:500px;margin:0 auto;background:#0f1724;border-radius:16px;border:1px solid #1e2f47;padding:40px;text-align:center;">
          <h1 style="color:#00d4ff;margin:0 0 16px;">Welcome to HackSphere! 🎉</h1>
          <p style="color:#e2eaf5;font-size:15px;">Hey <strong>${name}</strong>, you've successfully joined <strong style="color:#ffffff;">${teamName}</strong>.</p>
          <p style="color:#94a3b8;font-size:13px;margin:16px 0 32px;">Head to your dashboard to see your team and start building!</p>
          <a href="${dashboardLink}" style="background:linear-gradient(135deg,#7c3aed,#00d4ff);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;">
            Go to Dashboard →
          </a>
          <p style="color:#5a7394;font-size:11px;margin-top:32px;">HackSphere · Season 1</p>
        </div>
      </body>
    `,
  });
};

export default transporter;