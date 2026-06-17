export type PickupDay = {
  value: string;
  label: string;
};

export type PickupSlot = {
  value: string;
  label: string;
};

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date);
}

export function formatSlotLabel(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

export function buildPickupDays(createdAt: string | Date) {
  const start = new Date(createdAt);
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function buildPickupSlots(createdAt: string | Date, dateValue: string) {
  const orderCreatedAt = new Date(createdAt);
  const earliestPickup = new Date(orderCreatedAt.getTime() + 12 * 60 * 60 * 1000);
  const slots: string[] = [];

  for (let hour = 8; hour <= 18; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 18 && minute === 30) continue;

      const slot = new Date(`${dateValue}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`);
      if (slot >= earliestPickup) {
        slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
      }
    }
  }

  return slots;
}

export function getPickupWindowDateValues(createdAt: string | Date) {
  return buildPickupDays(createdAt).map(toDateInputValue);
}

export function getBlackoutSlotKey(date: string, time: string) {
  return `${date}|${time.slice(0, 5)}`;
}
