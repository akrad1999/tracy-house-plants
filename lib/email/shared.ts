export type OrderEmailItem = {
  plantName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type OrderEmailPayload = {
  orderId: string;
  customerName: string | null;
  customerEmail: string;
  customerPhone?: string | null;
  totalCents: number;
  createdAt: string;
  items: OrderEmailItem[];
  pickupDate?: string | null;
  pickupTime?: string | null;
};

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://tracyhouseplants.com";
}

export function getOrderNumber(orderId: string) {
  return orderId.slice(0, 8).toUpperCase();
}

export function formatOrderDate(createdAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(createdAt));
}

export function renderOrderItemsTable(items: OrderEmailItem[], totalCents: number) {
  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee6d7;">
            <div style="font-weight: 800; color: #49392c;">${escapeHtml(item.plantName)}</div>
            <div style="font-size: 13px; color: rgba(73,57,44,.68);">Qty ${item.quantity} · ${formatPrice(item.unitPriceCents)} each</div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee6d7; text-align: right; color: #49392c; font-weight: 800;">
            ${formatPrice(item.lineTotalCents)}
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 14px; border-collapse: collapse;">
      ${itemsHtml}
      <tr>
        <td style="padding-top: 16px; font-weight: 900; color:#4e5026;">Total</td>
        <td style="padding-top: 16px; text-align:right; font-weight: 900; color:#4e5026;">${formatPrice(totalCents)}</td>
      </tr>
    </table>
  `;
}

export function renderEmailLayout(content: string) {
  const siteUrl = getSiteUrl();
  const logoUrl = `${siteUrl}/auntys-plants-logo.png`;

  return `
<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#f6f2eb; color:#49392c; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width: 720px; margin: 0 auto; background:#f6f2eb;">
      <div style="background:#4e5026; padding: 26px 20px; text-align:center;">
        <img src="${logoUrl}" alt="Aunty's Plants Tracy" width="160" style="display:block; margin:0 auto; border-radius: 999px;" />
        <div style="margin-top: 12px; color:#f6f2eb; font-size: 13px; letter-spacing: .22em; text-transform: uppercase;">Tracy, California</div>
      </div>
      ${content}
      <div style="padding: 18px 22px 30px; text-align:center; border-top: 1px solid #c8ba7e;">
        <div style="font-weight: 900; color:#4e5026;">Aunty's Plants</div>
        <div style="margin-top: 4px; font-size: 13px; color:rgba(73,57,44,.7);">Simple, healthy, homey.</div>
      </div>
    </div>
  </body>
</html>`;
}

export function renderPrimaryButton(href: string, label: string) {
  return `<a href="${href}" style="display:block; margin-top: 20px; background:#cb6843; color:white; text-decoration:none; text-align:center; border-radius: 10px; padding: 13px 18px; font-weight: 900;">${escapeHtml(label)}</a>`;
}
