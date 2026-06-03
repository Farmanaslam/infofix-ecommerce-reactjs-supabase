import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const STAFF_EMAILS = [
  "infofixcomputers1@gmail.com",
  "farmanaslam674@gmail.com",
];

const FROM_EMAIL = "Infofix Computers <orders@infofixcomputer.in>";

// ─────────────────────────────────────────────────────────────────────────────
// PARTICIPANT EMAIL  (inbox-friendly — no promo signals)
// ─────────────────────────────────────────────────────────────────────────────

function participantEmailTemplate(entry: any): string {
  const whatsappText = `I just registered for the ${entry.lottery_name} event by Infofix Computers!\n\nRegister here: https://infofixcomputer.in\n\nFollow them on Instagram and YouTube too:\nInstagram: instagram.com/infofixcomputers11\nYouTube: youtube.com/@infofixcomputers\n\nRegistration is free — join now!`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Registration Confirmed - Infofix Computers</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Preheader (shown in inbox preview, NOT in promo triggers) -->
  <div style="display:none;max-height:0;overflow:hidden;">
    Hi ${entry.name}, your registration with Infofix Computers has been received and is under review.
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- HEADER — plain, no gradients -->
        <tr>
          <td style="background:#1e1b4b;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#a5b4fc;text-transform:uppercase;letter-spacing:0.1em;">
              Infofix Computers
            </p>
            <h1 style="margin:10px 0 0;color:#ffffff;font-size:24px;font-weight:800;">
              Registration Confirmed
            </h1>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0;font-size:15px;color:#111827;">
              Hi <strong>${entry.name}</strong>,
            </p>
            <p style="margin:12px 0 0;font-size:14px;color:#4b5563;line-height:1.7;">
              Thank you for registering for the <strong>${entry.lottery_name}</strong> event.
              We have received your entry and our team is reviewing your submission.
            </p>
          </td>
        </tr>

        <!-- EVENT DETAILS TABLE — clean, transactional style -->
        <tr>
          <td style="padding:24px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
              <tr style="background:#f9fafb;">
                <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;width:40%;">Event</td>
                <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#111827;">${entry.lottery_name}</td>
              </tr>
              <tr style="border-top:1px solid #e5e7eb;">
                <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Item</td>
                <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#111827;">${entry.prize}</td>
              </tr>
              <tr style="border-top:1px solid #e5e7eb;background:#f9fafb;">
                <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Name</td>
                <td style="padding:10px 16px;font-size:13px;color:#374151;">${entry.name}</td>
              </tr>
              <tr style="border-top:1px solid #e5e7eb;">
                <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">WhatsApp</td>
                <td style="padding:10px 16px;font-size:13px;color:#374151;">+91 ${entry.whatsapp}</td>
              </tr>
              <tr style="border-top:1px solid #e5e7eb;background:#f9fafb;">
                <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Location</td>
                <td style="padding:10px 16px;font-size:13px;color:#374151;">${entry.location}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- NEXT STEPS — no spammy words -->
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#111827;">What happens next:</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
      "Our team reviews your follow screenshot within 24–48 hours.",
      "Verified participants are added to our WhatsApp announcement group.",
      "Results are announced live in the WhatsApp group.",
      "We have multiple participants selected — everyone has a fair chance."
    ].map((s, i) => `
              <tr>
                <td style="padding:6px 0;vertical-align:top;width:28px;">
                  <div style="width:22px;height:22px;border-radius:50%;background:#ede9fe;
                    display:inline-flex;align-items:center;justify-content:center;
                    font-size:11px;font-weight:800;color:#5b21b6;">${i + 1}</div>
                </td>
                <td style="padding:6px 0;font-size:13px;color:#4b5563;line-height:1.6;">${s}</td>
              </tr>`).join("")}
            </table>
          </td>
        </tr>

        <!-- SHARE — plain text link, not a CTA button -->
        <tr>
          <td style="padding:20px 40px 0;">
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#166534;">
                Help a friend register too
              </p>
              <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.6;">
               Share our Website, Instagram or YouTube with 5 friends on WhatsApp and keep a screenshot of each share.
When you come to collect your item, show us those 5 screenshots — we will give you
an additional gift as a thank you for spreading the word.
              </p>
              <p style="margin:10px 0 0;">
                <a href="${whatsappUrl}" style="font-size:13px;color:#16a34a;font-weight:700;">
                  Share via WhatsApp
                </a>
                 &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="https://infofixcomputer.in" style="font-size:13px;color:#111827;font-weight:700;">
  Website
</a>
&nbsp;&nbsp;|&nbsp;&nbsp;
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="https://www.instagram.com/infofixcomputers11" style="font-size:13px;color:#4f46e5;">
                  Instagram
                </a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="https://www.youtube.com/@infofixcomputers" style="font-size:13px;color:#dc2626;">
                  YouTube
                </a>
              </p>
            </div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:28px 40px;border-top:1px solid #f3f4f6;margin-top:24px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#6b7280;">
              Questions? Contact us at
            </p>
            <p style="margin:6px 0 0;font-size:13px;font-weight:700;color:#374151;">
              infofixcomputers1@gmail.com &nbsp;|&nbsp; +91 8293295257
            </p>
            <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;">
              This is a transactional email from Infofix Computers.<br/>
              To unsubscribe,
              <a href="mailto:infofixcomputers1@gmail.com?subject=unsubscribe" style="color:#9ca3af;">click here</a>.
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">
              &copy; ${new Date().getFullYear()} Infofix Computers. Durgapur, West Bengal, India.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}


// ─────────────────────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const entry = await req.json();

    if (!entry?.name || !entry?.email) {
      return new Response(JSON.stringify({ error: "Missing entry data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sendEmail = async (to: string | string[], subject: string, html: string, text: string) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text,
          headers: {
            "List-Unsubscribe": "<mailto:infofixcomputers1@gmail.com?subject=unsubscribe>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Resend error: ${err}`);
      }
      return res.json();
    };

    // 1 — Participant: subject has NO emojis, NO "win/prize/free" words
    await sendEmail(
      entry.email,
      `Your registration for ${entry.lottery_name} is confirmed — Infofix Computers`,
      participantEmailTemplate(entry),
      `Hi ${entry.name}, your registration for ${entry.lottery_name} has been received. Our team will review and contact you via WhatsApp within 24-48 hours. Questions? Call +91 8293295257`,
    );


    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: any) {
    console.error("send-lottery-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});