import { Resend } from "resend";
import { formatDayLabel, formatSlotLabel, normalizePickupTime, parsePickupSlotDate } from "@/lib/pickup";
import {
  escapeHtml,
  formatOrderDate,
  getOrderNumber,
  getSiteUrl,
  renderEmailLayout,
  renderOrderItemsTable,
  renderPrimaryButton,
  type OrderEmailPayload
} from "@/lib/email/shared";

function formatPickupLabel(pickupDate: string, pickupTime: string) {
  const date = parsePickupSlotDate(pickupDate, "12:00") ?? new Date(`${pickupDate}T12:00:00`);
  return `${formatDayLabel(date)} at ${formatSlotLabel(normalizePickupTime(pickupTime))}`;
}

function renderOrderMeta(order: OrderEmailPayload) {
  const orderNumber = getOrderNumber(order.orderId);
  return `
    <p style="margin: 18px 0 0; color:#cb6843; font-weight: 800;">Order #${orderNumber}</p>
    <p style="margin: 4px 0 0; font-size: 14px;">${formatOrderDate(order.createdAt)}</p>
  `;
}

export function renderPickupConfirmedEmail(order: OrderEmailPayload, isUpdate: boolean) {
  const customerFirstName = order.customerName?.split(" ")[0] || "there";
  const pickupLabel =
    order.pickupDate && order.pickupTime ? formatPickupLabel(order.pickupDate, order.pickupTime) : "your selected time";
  const siteUrl = getSiteUrl();
  const scheduleUrl = `${siteUrl}/account/orders/${order.orderId}/schedule`;

  const headline = isUpdate ? "Your pickup time has been updated" : "Your pickup is confirmed!";
  const intro = isUpdate
    ? "We've updated your pickup window and will have your plants ready at the new time below."
    : "Thank you for scheduling pickup. We've received your order and will have your plants ready for you.";

  const content = `
    <div style="padding: 30px 22px 18px;">
      <h1 style="margin:0; color:#4e5026; font-size: 32px; line-height: 1.1;">${escapeHtml(headline)}, ${escapeHtml(customerFirstName)}!</h1>
      <div style="width: 72px; height: 3px; background:#c8ba7e; margin: 18px 0;"></div>
      <p style="margin:0; font-size: 15px; line-height: 1.7;">${intro}</p>
      ${renderOrderMeta(order)}
    </div>

    <div style="padding: 0 22px 18px;">
      <div style="border: 1px solid #c8ba7e; border-radius: 14px; background:#fffdf8; padding: 18px;">
        <div style="font-size: 13px; letter-spacing:.18em; text-transform: uppercase; color:#4e5026; font-weight:900;">Pickup scheduled</div>
        <div style="margin-top: 8px; font-size: 18px; font-weight: 900; color:#49392c;">${escapeHtml(pickupLabel)}</div>
        <div style="font-size: 14px; line-height: 1.6; margin-top: 8px;">Tracy, California · local pickup</div>
      </div>
    </div>

    <div style="padding: 0 22px 18px;">
      <div style="background:#fffdf8; border-radius: 18px; padding: 20px; border:1px solid rgba(200,186,126,.45);">
        <div style="font-size: 13px; letter-spacing:.18em; text-transform: uppercase; color:#4e5026; font-weight:900;">Order summary</div>
        ${renderOrderItemsTable(order.items, order.totalCents)}
        ${renderPrimaryButton(`${siteUrl}/account/orders`, "View my orders")}
      </div>
    </div>

    <div style="padding: 0 22px 22px;">
      <div style="background:#fffdf8; border-radius: 18px; padding: 20px; border:1px solid rgba(200,186,126,.45);">
        <div style="font-size: 13px; letter-spacing:.18em; text-transform: uppercase; color:#4e5026; font-weight:900;">Need to make a change?</div>
        <p style="margin: 12px 0 0; line-height:1.6;">You can reschedule or cancel your order from your account before pickup.</p>
        ${renderPrimaryButton(scheduleUrl, "Change pickup time")}
      </div>
    </div>
  `;

  return renderEmailLayout(content);
}

export function renderScheduleReminderEmail(order: OrderEmailPayload) {
  const customerFirstName = order.customerName?.split(" ")[0] || "there";
  const siteUrl = getSiteUrl();
  const scheduleUrl = `${siteUrl}/account/orders/${order.orderId}/schedule`;

  const content = `
    <div style="padding: 30px 22px 18px;">
      <h1 style="margin:0; color:#4e5026; font-size: 32px; line-height: 1.1;">Schedule your pickup, ${escapeHtml(customerFirstName)}!</h1>
      <div style="width: 72px; height: 3px; background:#c8ba7e; margin: 18px 0;"></div>
      <p style="margin:0; font-size: 15px; line-height: 1.7;">We've received your order and your plants are being prepared. Choose a pickup date and time so we know when to have everything ready.</p>
      ${renderOrderMeta(order)}
    </div>

    <div style="padding: 0 22px 18px;">
      <div style="border: 1px solid #cb6843; border-radius: 14px; background:#fff7f2; padding: 18px;">
        <div style="font-weight: 900; color:#cb6843;">Action needed</div>
        <div style="font-size: 14px; line-height: 1.6; margin-top: 4px;">Pick a 30-minute pickup slot within the next week. It only takes a moment.</div>
        ${renderPrimaryButton(scheduleUrl, "Schedule pickup now")}
      </div>
    </div>

    <div style="padding: 0 22px 22px;">
      <div style="background:#fffdf8; border-radius: 18px; padding: 20px; border:1px solid rgba(200,186,126,.45);">
        <div style="font-size: 13px; letter-spacing:.18em; text-transform: uppercase; color:#4e5026; font-weight:900;">Order summary</div>
        ${renderOrderItemsTable(order.items, order.totalCents)}
      </div>
    </div>
  `;

  return renderEmailLayout(content);
}

export function renderAdminNewOrderEmail(order: OrderEmailPayload) {
  const orderNumber = getOrderNumber(order.orderId);
  const siteUrl = getSiteUrl();
  const pickupStatus =
    order.pickupDate && order.pickupTime
      ? formatPickupLabel(order.pickupDate, order.pickupTime)
      : "Not scheduled yet";

  const content = `
    <div style="padding: 30px 22px 18px;">
      <h1 style="margin:0; color:#4e5026; font-size: 32px; line-height: 1.1;">New order #${orderNumber}</h1>
      <div style="width: 72px; height: 3px; background:#c8ba7e; margin: 18px 0;"></div>
      <p style="margin:0; font-size: 15px; line-height: 1.7;">A customer placed a new paid pickup order.</p>
      <p style="margin: 4px 0 0; font-size: 14px;">${formatOrderDate(order.createdAt)}</p>
    </div>

    <div style="padding: 0 22px 18px;">
      <div style="background:#fffdf8; border-radius: 18px; padding: 20px; border:1px solid rgba(200,186,126,.45);">
        <div style="font-size: 13px; letter-spacing:.18em; text-transform: uppercase; color:#4e5026; font-weight:900;">Customer</div>
        <p style="margin: 12px 0 0; line-height:1.7;">
          <strong>${escapeHtml(order.customerName || "No name on file")}</strong><br />
          ${escapeHtml(order.customerEmail)}<br />
          ${order.customerPhone ? escapeHtml(order.customerPhone) : "No phone on file"}
        </p>
      </div>
    </div>

    <div style="padding: 0 22px 18px;">
      <div style="background:#fffdf8; border-radius: 18px; padding: 20px; border:1px solid rgba(200,186,126,.45);">
        <div style="font-size: 13px; letter-spacing:.18em; text-transform: uppercase; color:#4e5026; font-weight:900;">Pickup</div>
        <p style="margin: 12px 0 0; line-height:1.7; font-weight: 800; color:#49392c;">${escapeHtml(pickupStatus)}</p>
      </div>
    </div>

    <div style="padding: 0 22px 22px;">
      <div style="background:#fffdf8; border-radius: 18px; padding: 20px; border:1px solid rgba(200,186,126,.45);">
        <div style="font-size: 13px; letter-spacing:.18em; text-transform: uppercase; color:#4e5026; font-weight:900;">Order summary</div>
        ${renderOrderItemsTable(order.items, order.totalCents)}
        ${renderPrimaryButton(`${siteUrl}/admin/calendar`, "Open pickup calendar")}
      </div>
    </div>
  `;

  return renderEmailLayout(content);
}

async function sendEmail(params: { to: string | string[]; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Missing RESEND_API_KEY or ORDER_EMAIL_FROM.");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendPickupConfirmedEmail(order: OrderEmailPayload, isUpdate: boolean) {
  const orderNumber = getOrderNumber(order.orderId);
  await sendEmail({
    to: order.customerEmail,
    subject: `Your pickup is confirmed! - Aunty's Plants | Order #${orderNumber}`,
    html: renderPickupConfirmedEmail(order, isUpdate)
  });
}

export async function sendScheduleReminderEmail(order: OrderEmailPayload) {
  const orderNumber = getOrderNumber(order.orderId);
  await sendEmail({
    to: order.customerEmail,
    subject: `Schedule your pickup - Aunty's Plants | Order #${orderNumber}`,
    html: renderScheduleReminderEmail(order)
  });
}

export async function sendAdminNewOrderEmail(order: OrderEmailPayload, adminRecipients: string[]) {
  if (adminRecipients.length === 0) return;

  const orderNumber = getOrderNumber(order.orderId);
  await sendEmail({
    to: adminRecipients,
    subject: `New order - Aunty's Plants | Order #${orderNumber}`,
    html: renderAdminNewOrderEmail(order)
  });
}
