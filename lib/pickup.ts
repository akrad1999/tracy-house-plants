export type PickupDay = {
  value: string;
  label: string;
};

export type PickupSlot = {
  value: string;
  label: string;
};

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizePickupTime(time: string) {
  return time.slice(0, 5);
}

export function toPickupTimeValue(time: string) {
  const normalized = normalizePickupTime(time);
  return /^\d{2}:\d{2}$/.test(normalized) ? `${normalized}:00` : normalized;
}

const STORE_TIMEZONE = "America/Los_Angeles";

function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });

  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute)
  };
}

export function parsePickupSlotDate(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = normalizePickupTime(time).split(":").map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  let guess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = getZonedParts(guess, STORE_TIMEZONE);
    if (parts.year === year && parts.month === month && parts.day === day && parts.hour === hours && parts.minute === minutes) {
      return guess;
    }

    const deltaMinutes =
      (year - parts.year) * 525600 +
      (month - parts.month) * 43200 +
      (day - parts.day) * 1440 +
      (hours - parts.hour) * 60 +
      (minutes - parts.minute);
    guess = new Date(guess.getTime() + deltaMinutes * 60 * 1000);
  }

  return guess;
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

      const slot = parsePickupSlotDate(dateValue, `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
      if (slot && slot >= earliestPickup) {
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
  return `${date}|${normalizePickupTime(time)}`;
}
