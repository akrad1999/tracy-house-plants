import { Resend } from "resend";

type OrderEmailItem = {
  plantName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type OrderConfirmationEmail = {
  orderId: string;
  customerName: string | null;
  customerEmail: string;
  totalCents: number;
  createdAt: string;
  items: OrderEmailItem[];
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://tracyhouseplants.com";
}

export function renderOrderConfirmationEmail(order: OrderConfirmationEmail) {
  const customerFirstName = order.customerName?.split(" ")[0] || "there";
  const orderNumber = order.orderId.slice(0, 8).toUpperCase();
  const orderDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(order.createdAt));
  const siteUrl = getSiteUrl();
  const logoUrl = `${siteUrl}/auntys-plants-logo.png`;
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee6d7;">
            <div style="font-weight: 800; color: #49392c;">${escapeHtml(item.plantName)}</div>
            <div style="font-size: 13px; color: rgba(73,57,44,.68);">Qty ${item.quantity}</div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee6d7; text-align: right; color: #49392c; font-weight: 800;">
            ${formatPrice(item.lineTotalCents)}
          </td>
        </tr>
      `
    )
    .join("");

  return `
<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#f6f2eb; color:#49392c; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width: 720px; margin: 0 auto; background:#f6f2eb;">
      <div style="background:#4e5026; padding: 26px 20px; text-align:center;">
        <img src="${logoUrl}" alt="Aunty's Plants Tracy" width="160" style="display:block; margin:0 auto; border-radius: 999px;" />
        <div style="margin-top: 12px; color:#f6f2eb; font-size: 13px; letter-spacing: .22em; text-transform: uppercase;">Tracy, California</div>
      </div>

      <div style="padding: 30px 22px 18px;">
        <h1 style="margin:0; color:#4e5026; font-size: 32px; line-height: 1.1;">Thank you for your order, ${escapeHtml(customerFirstName)}!</h1>
        <div style="width: 72px; height: 3px; background:#c8ba7e; margin: 18px 0;"></div>
        <p style="margin:0; font-size: 15px; line-height: 1.7;">We've received your order and are getting your plants ready for pickup.</p>
        <p style="margin: 18px 0 0; color:#cb6843; font-weight: 800;">Order #${orderNumber}</p>
        <p style="margin: 4px 0 0; font-size: 14px;">${orderDate}</p>
      </div>

      <div style="padding: 0 22px 18px;">
        <div style="border: 1px solid #c8ba7e; border-radius: 14px; background:#fffdf8; padding: 18px;">
          <div style="font-weight: 900; color:#4e5026;">We'll text you within 24 hours</div>
          <div style="font-size: 14px; line-height: 1.6; margin-top: 4px;">to coordinate a pickup time and place in Tracy, CA.</div>
        </div>
      </div>

      <div style="padding: 0 22px 18px;">
        <div style="background:#fffdf8; border-radius: 18px; padding: 20px; border:1px solid rgba(200,186,126,.45);">
          <div style="font-size: 13px; letter-spacing:.18em; text-transform: uppercase; color:#4e5026; font-weight:900;">Order summary</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 14px; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
              <td style="padding-top: 16px; font-weight: 900; color:#4e5026;">Total</td>
              <td style="padding-top: 16px; text-align:right; font-weight: 900; color:#4e5026;">${formatPrice(order.totalCents)}</td>
            </tr>
          </table>
          <a href="${siteUrl}/account" style="display:block; margin-top: 20px; background:#cb6843; color:white; text-decoration:none; text-align:center; border-radius: 10px; padding: 13px 18px; font-weight: 900;">View my order</a>
        </div>
      </div>

      <div style="display:block; padding: 0 22px 22px;">
        <div style="background:#fffdf8; border-radius: 18px; padding: 20px; border:1px solid rgba(200,186,126,.45); margin-bottom: 14px;">
          <div style="font-size: 13px; letter-spacing:.18em; text-transform: uppercase; color:#4e5026; font-weight:900;">Pickup details</div>
          <p style="margin: 12px 0 0; line-height:1.6;"><strong>Tracy, California</strong><br />We'll text you to confirm a pickup time.</p>
        </div>
        <div style="background:#fffdf8; border-radius: 18px; padding: 20px; border:1px solid rgba(200,186,126,.45);">
          <div style="font-size: 13px; letter-spacing:.18em; text-transform: uppercase; color:#4e5026; font-weight:900;">What happens next?</div>
          <p style="margin: 12px 0 0; line-height:1.6;">Your plants are checked, packed, and held for pickup. You'll receive pickup details by text.</p>
        </div>
      </div>

      <div style="padding: 18px 22px 30px; text-align:center; border-top: 1px solid #c8ba7e;">
        <div style="font-weight: 900; color:#4e5026;">Aunty's Plants</div>
        <div style="margin-top: 4px; font-size: 13px; color:rgba(73,57,44,.7);">Simple, healthy, homey.</div>
      </div>
    </div>
  </body>
</html>`;
}

export async function sendOrderConfirmationEmail(order: OrderConfirmationEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Missing RESEND_API_KEY or ORDER_EMAIL_FROM.");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: order.customerEmail,
    subject: `Aunty's Plants order #${order.orderId.slice(0, 8).toUpperCase()}`,
    html: renderOrderConfirmationEmail(order)
  });

  if (error) {
    throw new Error(error.message);
  }
}
