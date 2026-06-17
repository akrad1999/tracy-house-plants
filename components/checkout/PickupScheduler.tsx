"use client";

import { useMemo, useState, useTransition } from "react";
import { cancelOrder, savePickupSlot } from "@/app/checkout/success/actions";

type PickupSchedulerProps = {
  orderId: string;
  orderCreatedAt: string;
  savedPickupDate?: string | null;
  savedPickupTime?: string | null;
  isCancelled?: boolean;
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date);
}

function formatSlotLabel(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function buildDays(createdAt: string) {
  const start = new Date(createdAt);
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function buildSlots(createdAt: string, dateValue: string) {
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

export function PickupScheduler({ orderId, orderCreatedAt, savedPickupDate, savedPickupTime, isCancelled = false }: PickupSchedulerProps) {
  const days = useMemo(() => buildDays(orderCreatedAt), [orderCreatedAt]);
  const firstDate = toDateInputValue(days[0]);
  const [selectedDate, setSelectedDate] = useState(savedPickupDate ?? "");
  const slots = useMemo(() => buildSlots(orderCreatedAt, selectedDate || firstDate), [firstDate, orderCreatedAt, selectedDate]);
  const [selectedTime, setSelectedTime] = useState(savedPickupTime ? savedPickupTime.slice(0, 5) : "");
  const [scheduledDate, setScheduledDate] = useState(savedPickupDate ?? "");
  const [scheduledTime, setScheduledTime] = useState(savedPickupTime ? savedPickupTime.slice(0, 5) : "");
  const [isCalendarOpen, setIsCalendarOpen] = useState(!savedPickupDate || !savedPickupTime);
  const [isCancelConfirming, setIsCancelConfirming] = useState(false);
  const [isOrderCancelled, setIsOrderCancelled] = useState(isCancelled);
  const [message, setMessage] = useState(savedPickupDate && savedPickupTime ? "Pickup time is scheduled." : "");
  const [shouldShakeDates, setShouldShakeDates] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setSelectedTime("");
    setMessage("");
    setShouldShakeDates(false);
  }

  function promptDateFirst() {
    setShouldShakeDates(true);
    setMessage("Select a pickup date first.");
    window.setTimeout(() => setShouldShakeDates(false), 450);
  }

  function saveSelection() {
    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("pickupDate", selectedDate);
    formData.set("pickupTime", selectedTime);

    startTransition(async () => {
      const result = await savePickupSlot(formData);
      setMessage(result.ok ? "" : result.message);
      if (result.ok && result.pickupDate && result.pickupTime) {
        setScheduledDate(result.pickupDate);
        setScheduledTime(result.pickupTime);
        setIsCalendarOpen(false);
        setIsCancelConfirming(false);
      }
    });
  }

  function cancelSelection() {
    const formData = new FormData();
    formData.set("orderId", orderId);

    startTransition(async () => {
      const result = await cancelOrder(formData);
      setMessage(result.message);
      if (result.ok) {
        setIsOrderCancelled(true);
        setIsCalendarOpen(false);
        setIsCancelConfirming(false);
      }
    });
  }

  const scheduledLabel =
    scheduledDate && scheduledTime
      ? `${formatDayLabel(new Date(`${scheduledDate}T00:00:00`))} at ${formatSlotLabel(scheduledTime)}`
      : "";

  if (isOrderCancelled) {
    return (
      <div className="rounded-[1.5rem] border border-[#c8ba7e]/15 bg-white/70 p-5 text-center shadow-sm">
        <h2 className="text-xl font-black text-[#4e5026]">Order cancelled</h2>
        <p className="mt-3 text-sm leading-6 text-[#49392c]/65">
          Your card will be refunded in 3-5 business days.
        </p>
        {message ? <p className="mt-4 rounded-2xl bg-[#eef2df] px-4 py-3 text-sm font-black text-[#4e5026]">{message}</p> : null}
      </div>
    );
  }

  if (!isCalendarOpen && scheduledLabel) {
    return (
      <div className="rounded-[1.5rem] border border-[#c8ba7e]/15 bg-white/70 p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#4e5026]">Thanks for scheduling your pickup</h2>
        <p className="mt-3 rounded-2xl bg-[#eef2df] px-4 py-3 text-sm font-black text-[#4e5026]">
          Pickup scheduled for {scheduledLabel}.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setIsCalendarOpen(true);
              setIsCancelConfirming(false);
              setMessage("");
            }}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#c8ba7e]/25 bg-white px-6 text-sm font-black text-[#4e5026] transition hover:border-[#4e5026]"
          >
            Change Pickup Time
          </button>
          <button
            type="button"
            onClick={() => setIsCancelConfirming(true)}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-red-700/25 bg-white px-6 text-sm font-black text-red-700 transition hover:bg-red-50"
          >
            Cancel Order
          </button>
        </div>
        {isCancelConfirming ? (
          <div className="mt-5 rounded-3xl border border-red-700/15 bg-red-50 p-4">
            <p className="text-sm font-black text-red-800">Confirm cancel?</p>
            <p className="mt-2 text-sm leading-6 text-red-800/75">
              This will cancel your order. Your card will be refunded manually through Stripe in 3-5 business days.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={cancelSelection}
                disabled={isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-700 px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isPending ? "Cancelling..." : "Yes, cancel order"}
              </button>
              <button
                type="button"
                onClick={() => setIsCancelConfirming(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[#4e5026]"
              >
                Keep order
              </button>
            </div>
          </div>
        ) : null}
        {message ? <p className="mt-3 text-center text-sm font-black text-[#4e5026]">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-[#c8ba7e]/15 bg-white/70 p-5 shadow-sm">
      <h2 className="text-xl font-black text-[#4e5026]">Schedule pickup</h2>
      <p className="mt-2 text-sm leading-6 text-[#49392c]/65">
        Pick a date first, then choose any available 30-minute pickup slot from 8:00 AM to 6:00 PM. All shown times are currently available.
      </p>

      <div className={`mt-5 flex gap-2 overflow-x-auto pb-2 ${shouldShakeDates ? "animate-date-nudge" : ""}`}>
        {days.slice(0, 3).map((day) => {
          const value = toDateInputValue(day);
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleDateChange(value)}
              className={`min-w-28 rounded-2xl px-4 py-3 text-sm font-black transition ${
                selectedDate === value ? "bg-[#4e5026] text-white" : "bg-[#eef2df] text-[#4e5026]"
              }`}
            >
              {formatDayLabel(day)}
            </button>
          );
        })}
      </div>

      <label className="mt-3 grid gap-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#cb6843]">More pickup days</span>
        <select
          value={selectedDate}
          onChange={(event) => handleDateChange(event.target.value)}
          className="min-h-11 rounded-2xl border border-[#c8ba7e]/25 bg-[#f6f2eb] px-4 text-sm font-bold text-[#49392c] outline-none focus:border-[#4e5026] focus:ring-4 focus:ring-[#4e5026]/10"
        >
          <option value="" disabled>
            Select a pickup date
          </option>
          {days.map((day) => {
            const value = toDateInputValue(day);
            return (
              <option key={value} value={value}>
                {formatDayLabel(day)}
              </option>
            );
          })}
        </select>
      </label>

      <div className="mt-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#cb6843]">Pickup time</p>
        <div className="mt-3 max-h-52 overflow-y-auto rounded-2xl border border-[#c8ba7e]/15 bg-[#f6f2eb] p-3">
          {slots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    if (!selectedDate) {
                      promptDateFirst();
                      return;
                    }
                    setSelectedTime(slot);
                    setMessage("");
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-black transition ${
                    selectedDate && selectedTime === slot ? "bg-[#4e5026] text-white" : "bg-white text-[#4e5026]"
                  }`}
                >
                  {formatSlotLabel(slot)}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm font-bold text-[#49392c]/65">No pickup slots remain for this day. Choose another day.</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={saveSelection}
        disabled={!selectedDate || !selectedTime || isPending}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#4e5026] px-6 text-sm font-black text-white transition hover:bg-[#49392c] disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isPending ? "Saving..." : "Save pickup time"}
      </button>
      {message ? <p className="mt-3 text-center text-sm font-black text-[#4e5026]">{message}</p> : null}
    </div>
  );
}
