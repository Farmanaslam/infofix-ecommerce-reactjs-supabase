import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const STAFF_EMAILS = [
  "infofixcomputers1@gmail.com",
  "farmanaslam674@gmail.com",
];

const FROM_EMAIL = "Infofix Computers <orders@infofixcomputer.in>";

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

function customerEmailTemplate(order: any): string {
  const itemsHtml = (order.items ?? [])
    .map(
      (item: any) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;">
          <div style="display:flex;align-items:center;gap:12px;">
            ${
        item.image
          ? `<img src="${item.image}" alt="${item.name}" width="56" height="56"
                    style="border-radius:10px;object-fit:cover;border:1px solid #eee;" />`
          : ""
      }
            <div>
              <p style="margin:0;font-weight:700;color:#111;font-size:14px;">${item.name}</p>
              <p style="margin:4px 0 0;color:#888;font-size:12px;">Qty: ${item.quantity}</p>
            </div>
          </div>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700;color:#4f46e5;font-size:14px;white-space:nowrap;">
          &#8377;${(item.price * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>`,
    )
    .join("");

  const d1 = new Date();
  d1.setDate(d1.getDate() + 5);
  const d2 = new Date();
  d2.setDate(d2.getDate() + 7);
  const deliveryRange = `${
    d1.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
  } - ${d2.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Confirmation - Infofix Computers</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#6366f1 100%);padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">Order Confirmed!</h1>
            <p style="margin:10px 0 0;color:#c7d2fe;font-size:14px;">
              Thank you for shopping with <strong>Infofix Computers</strong>
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0;font-size:16px;color:#374151;">
              Hi <strong style="color:#111;">${order.customer_name}</strong>,
            </p>
            <p style="margin:12px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
              We have received your order and it is being reviewed by our team.
              You will hear from us within <strong>24-48 hours</strong> via call or WhatsApp to confirm your delivery slot.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:14px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
                  <p style="margin:4px 0 0;font-size:22px;font-weight:900;color:#4f46e5;">#${order.order_number}</p>
                </td>
                <td style="padding:16px 20px;text-align:right;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Order Date</p>
                  <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#374151;">
                    ${
    new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 12px;font-size:13px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:0.8px;">Items Ordered</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:14px;overflow:hidden;">
              <thead>
                <tr style="background:#f9fafb;">
                  <th style="padding:10px 16px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Product</th>
                  <th style="padding:10px 16px;text-align:right;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#6b7280;">Subtotal</td>
                <td style="padding:6px 0;font-size:13px;color:#374151;text-align:right;">&#8377;${
    order.subtotal?.toLocaleString("en-IN") ?? "0"
  }</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#6b7280;">GST / Taxes</td>
                <td style="padding:6px 0;font-size:13px;color:#374151;text-align:right;">&#8377;${
    order.tax ?? 0
  }</td>
              </tr>
   <tr>
                <td style="padding:6px 0;font-size:13px;color:#16a34a;font-weight:600;">Delivery</td>
                <td style="padding:6px 0;font-size:13px;color:#16a34a;font-weight:600;text-align:right;">FREE</td>
              </tr>
              ${
    order.coupon_code
      ? `
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#16a34a;font-weight:600;">Coupon (${order.coupon_code})</td>
                <td style="padding:6px 0;font-size:13px;color:#16a34a;font-weight:600;text-align:right;">-&#8377;${
        Number(order.discount_amount).toLocaleString("en-IN")
      }</td>
              </tr>`
      : ""
  }
              <tr>
                <td style="padding:12px 0 4px;font-size:17px;font-weight:900;color:#111;border-top:2px solid #f0f0f0;">Total</td>
                <td style="padding:12px 0 4px;font-size:17px;font-weight:900;color:#4f46e5;text-align:right;border-top:2px solid #f0f0f0;">&#8377;${
    order.total_amount?.toLocaleString("en-IN") ?? "0"
  }</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding:16px;background:#f0fdf4;border-radius:12px;vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:0.8px;">Est. Delivery</p>
                  <p style="margin:0;font-size:13px;font-weight:700;color:#166534;">${deliveryRange}</p>
                </td>
                <td width="4%"></td>
                <td width="46%" style="padding:16px;background:#faf5ff;border-radius:12px;vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:800;color:#7c3aed;text-transform:uppercase;letter-spacing:0.8px;">Payment</p>
                  <p style="margin:0;font-size:13px;font-weight:700;color:#5b21b6;">${order.payment_method}</p>
                  <p style="margin:2px 0 0;font-size:11px;color:#8b5cf6;">${order.payment_status}</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 40px 0;">
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:16px 20px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">Shipping Address</p>
              <p style="margin:0;font-size:13px;font-weight:700;color:#111;">${order.customer_name}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#374151;line-height:1.5;">
                ${order.address_line}<br/>
                ${order.city}, ${order.state} - ${order.pincode}
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#374151;">${order.customer_phone}</p>
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 40px 0;">
            <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:14px;padding:18px 20px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:900;color:#4f46e5;">What happens next?</p>
              <p style="margin:0;font-size:13px;color:#4338ca;line-height:1.6;">
                Our team will reach out to you shortly to confirm your order and collect a
                <strong>minimal advance shipping amount</strong> to secure your delivery slot.
              </p>
              <p style="margin:10px 0 0;font-size:13px;font-weight:700;color:#4f46e5;">
                Please keep your phone reachable - we will call or WhatsApp you within 24-48 hours.
              </p>
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 40px;text-align:center;border-top:1px solid #f0f0f0;margin-top:28px;">
            <p style="margin:0;font-size:13px;color:#9ca3af;">Questions? Reach us at</p>
            <p style="margin:6px 0 0;font-size:13px;font-weight:700;color:#4f46e5;">
              infofixcomputers1@gmail.com | +91 8293295257
            </p>
            <p style="margin:20px 0 0;font-size:11px;color:#d1d5db;">
              This is a transactional email regarding your order at Infofix Computers.<br/>
              To unsubscribe from marketing emails,
              <a href="mailto:infofixcomputers1@gmail.com?subject=unsubscribe" style="color:#9ca3af;">click here</a>.
            </p>
            <p style="margin:12px 0 0;font-size:11px;color:#d1d5db;">
              &copy; ${
    new Date().getFullYear()
  } Infofix Computers. All rights reserved.<br/>
              Durgapur, West Bengal, India
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

function staffEmailTemplate(order: any): string {
  const itemsHtml = (order.items ?? [])
    .map(
      (item: any) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#374151;">
          ${item.name}
          ${
        item.image
          ? `<br/><img src="${item.image}" width="40" height="40" style="border-radius:6px;object-fit:cover;margin-top:4px;" />`
          : ""
      }
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#374151;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:700;color:#4f46e5;text-align:right;">
          &#8377;${(item.price * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>New Order - #${order.order_number}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <tr>
          <td style="background:linear-gradient(135deg,#dc2626 0%,#ef4444 100%);padding:28px 36px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;">New Order Received</h1>
            <p style="margin:8px 0 0;color:#fecaca;font-size:13px;">Action Required - Review and Confirm</p>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;">
              <tr>
                <td style="padding:14px 20px;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Order ID</p>
                  <p style="margin:4px 0 0;font-size:24px;font-weight:900;color:#b91c1c;">#${order.order_number}</p>
                </td>
                <td style="padding:14px 20px;text-align:right;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Placed At</p>
                  <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#374151;">
                    ${
    new Date().toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 36px 0;">
            <p style="margin:0 0 10px;font-size:12px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">Customer Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:10px 16px;font-size:13px;color:#6b7280;width:35%;border-bottom:1px solid #e5e7eb;">Name</td>
                <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#111;border-bottom:1px solid #e5e7eb;">${order.customer_name}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Email</td>
                <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#4f46e5;border-bottom:1px solid #e5e7eb;">${order.customer_email}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Phone</td>
                <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#111;border-bottom:1px solid #e5e7eb;">${order.customer_phone}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;font-size:13px;color:#6b7280;">Address</td>
                <td style="padding:10px 16px;font-size:13px;color:#374151;line-height:1.5;">
                  ${order.address_line}<br/>
                  ${order.city}, ${order.state} - ${order.pincode}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="49%" style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:14px 16px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:800;color:#7c3aed;text-transform:uppercase;letter-spacing:0.8px;">Payment Method</p>
                  <p style="margin:0;font-size:14px;font-weight:700;color:#5b21b6;">${order.payment_method}</p>
                </td>
                <td width="2%"></td>
                <td width="49%" style="background:${
    order.payment_status === "Paid" ? "#f0fdf4" : "#fffbeb"
  };border:1px solid ${
    order.payment_status === "Paid" ? "#bbf7d0" : "#fde68a"
  };border-radius:12px;padding:14px 16px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:800;color:${
    order.payment_status === "Paid" ? "#16a34a" : "#d97706"
  };text-transform:uppercase;letter-spacing:0.8px;">Payment Status</p>
                  <p style="margin:0;font-size:14px;font-weight:700;color:${
    order.payment_status === "Paid" ? "#166534" : "#92400e"
  };">${order.payment_status}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 36px 0;">
            <p style="margin:0 0 10px;font-size:12px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">Items Ordered</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:12px;overflow:hidden;">
              <thead>
                <tr style="background:#f9fafb;">
                  <th style="padding:10px 14px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;">Product</th>
                  <th style="padding:10px 14px;text-align:center;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;">Qty</th>
                  <th style="padding:10px 14px;text-align:right;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 36px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #fee2e2;">Subtotal</td>
                <td style="padding:10px 16px;font-size:13px;color:#374151;text-align:right;border-bottom:1px solid #fee2e2;">&#8377;${
    order.subtotal?.toLocaleString("en-IN")
  }</td>
              </tr>
             <tr>
                <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #fee2e2;">Taxes</td>
                <td style="padding:10px 16px;font-size:13px;color:#374151;text-align:right;border-bottom:1px solid #fee2e2;">&#8377;${
    order.tax ?? 0
  }</td>
              </tr>
              ${
    order.coupon_code
      ? `
              <tr>
                <td style="padding:10px 16px;font-size:13px;color:#16a34a;font-weight:600;border-bottom:1px solid #fee2e2;">Coupon (${order.coupon_code})</td>
                <td style="padding:10px 16px;font-size:13px;color:#16a34a;font-weight:600;text-align:right;border-bottom:1px solid #fee2e2;">-&#8377;${
        Number(order.discount_amount).toLocaleString("en-IN")
      }</td>
              </tr>`
      : ""
  }
              <tr>
                <td style="padding:12px 16px;font-size:16px;font-weight:900;color:#b91c1c;">TOTAL</td>
                <td style="padding:12px 16px;font-size:16px;font-weight:900;color:#b91c1c;text-align:right;">&#8377;${
    order.total_amount?.toLocaleString("en-IN")
  }</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 36px 28px;">
            <div style="background:#fef9c3;border:1px solid #fde047;border-radius:12px;padding:16px 20px;">
              <p style="margin:0;font-size:13px;font-weight:900;color:#854d0e;">Action Required</p>
              <p style="margin:8px 0 0;font-size:13px;color:#713f12;line-height:1.6;">
                Call or WhatsApp the customer at <strong>${order.customer_phone}</strong> within <strong>24-48 hours</strong>
                to confirm the order and arrange shipping advance payment.
              </p>
            </div>
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
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const order = await req.json();

    if (!order?.order_number) {
      return new Response(JSON.stringify({ error: "Missing order data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── sendEmail now accepts 4 args: to, subject, html, text ────────────────
    const sendEmail = async (
      to: string | string[],
      subject: string,
      html: string,
      text: string, // ← parameter added here
    ) => {
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
          text, // ← passed to Resend here
          headers: {
            "List-Unsubscribe":
              "<mailto:infofixcomputers1@gmail.com?subject=unsubscribe>",
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

    // 1️⃣ Customer email
    await sendEmail(
      order.customer_email,
      `Order Confirmed - #${order.order_number} | Infofix Computers`,
      customerEmailTemplate(order),
      `Hi ${order.customer_name}, your order #${order.order_number} is confirmed. Total: Rs.${order.total_amount}. We will call you within 24-48 hours. Questions? Call +91 8293295257`,
    );

    // 2️⃣ Staff email
    await sendEmail(
      STAFF_EMAILS,
      `New Order Received: #${order.order_number} from ${order.customer_name}`,
      staffEmailTemplate(order),
      `New order #${order.order_number} from ${order.customer_name} (${order.customer_phone}). Total: Rs.${order.total_amount}. Payment: ${order.payment_method}. Address: ${order.address_line}, ${order.city}.`,
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("send-order-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
