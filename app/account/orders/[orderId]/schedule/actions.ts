"use server";

import { recordCheckoutSuccessView as recordCheckoutSuccessViewInternal } from "@/lib/email/order-email-service";

export async function recordCheckoutSuccessView(orderId: string) {
  await recordCheckoutSuccessViewInternal(orderId);
}
