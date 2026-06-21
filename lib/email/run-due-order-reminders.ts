import { processDueScheduleReminderEmails } from "@/lib/email/order-email-service";

export async function runDueOrderReminderEmails() {
  try {
    await processDueScheduleReminderEmails();
  } catch (error) {
    console.error("[order-reminder-emails]", error);
  }
}
