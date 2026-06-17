"use client";

import { useState, useTransition } from "react";
import { blockPickupDay, blockPickupSlot, unblockPickupDay, unblockPickupSlot } from "@/app/admin/calendar/actions";
import { formatSlotLabel, getBlackoutSlotKey } from "@/lib/pickup";

type AdminPickupDay = {
  value: string;
  label: string;
  slots: string[];
};

type PickupCalendarManagerProps = {
  windowCreatedAt: string;
  days: AdminPickupDay[];
  blockedSlots: string[];
  occupiedSlots: string[];
};

export function PickupCalendarManager({ windowCreatedAt, days, blockedSlots, occupiedSlots }: PickupCalendarManagerProps) {
  const [blockedSet, setBlockedSet] = useState(() => new Set(blockedSlots));
  const occupiedSet = new Set(occupiedSlots);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function runSlotAction(action: typeof blockPickupSlot | typeof unblockPickupSlot, pickupDate: string, pickupTime: string, shouldBlock: boolean) {
    const formData = new FormData();
    formData.set("pickupDate", pickupDate);
    formData.set("pickupTime", pickupTime);

    startTransition(async () => {
      const result = await action(formData);
      setMessage(result.message);
      if (result.ok) {
        setBlockedSet((currentSet) => {
          const nextSet = new Set(currentSet);
          const key = getBlackoutSlotKey(pickupDate, pickupTime);
          if (shouldBlock) nextSet.add(key);
          else nextSet.delete(key);
          return nextSet;
        });
      }
    });
  }

  function runDayAction(action: typeof blockPickupDay | typeof unblockPickupDay, pickupDate: string, shouldBlock: boolean) {
    const formData = new FormData();
    formData.set("pickupDate", pickupDate);
    formData.set("windowCreatedAt", windowCreatedAt);

    startTransition(async () => {
      const result = await action(formData);
      setMessage(result.message);
      if (result.ok) {
        setBlockedSet((currentSet) => {
          const nextSet = new Set(currentSet);
          const day = days.find((candidate) => candidate.value === pickupDate);
          for (const slot of day?.slots ?? []) {
            const key = getBlackoutSlotKey(pickupDate, slot);
            if (occupiedSet.has(key)) continue;
            if (shouldBlock) nextSet.add(key);
            else nextSet.delete(key);
          }
          return nextSet;
        });
      }
    });
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[2rem] border border-[#c8ba7e]/20 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-[#4e5026]">Manage pickup availability</h2>
        <p className="mt-2 text-sm leading-6 text-[#49392c]/65">
          Block individual 30-minute slots or a full day. Slots with existing customer pickups cannot be blocked.
        </p>
        {message ? (
          <p className="mt-4 rounded-2xl bg-[#eef2df] px-4 py-3 text-sm font-black text-[#4e5026]">
            {message}
          </p>
        ) : null}
      </div>

      {days.map((day) => {
        const openSlots = day.slots.filter((slot) => !occupiedSet.has(getBlackoutSlotKey(day.value, slot)));
        const allOpenSlotsBlocked = openSlots.length > 0 && openSlots.every((slot) => blockedSet.has(getBlackoutSlotKey(day.value, slot)));

        return (
          <section key={day.value} className="rounded-[2rem] border border-[#c8ba7e]/20 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#cb6843]">Pickup day</p>
                <h3 className="mt-1 text-xl font-black text-[#4e5026]">{day.label}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isPending || openSlots.length === 0 || allOpenSlotsBlocked}
                  onClick={() => runDayAction(blockPickupDay, day.value, true)}
                  className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#4e5026] px-4 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Block Day
                </button>
                <button
                  type="button"
                  disabled={isPending || !day.slots.some((slot) => blockedSet.has(getBlackoutSlotKey(day.value, slot)))}
                  onClick={() => runDayAction(unblockPickupDay, day.value, false)}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#c8ba7e]/40 bg-white px-4 text-xs font-black text-[#4e5026] disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Unblock Day
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {day.slots.map((slot) => {
                const key = getBlackoutSlotKey(day.value, slot);
                const isOccupied = occupiedSet.has(key);
                const isBlocked = blockedSet.has(key);

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isPending || isOccupied}
                    onClick={() =>
                      isBlocked
                        ? runSlotAction(unblockPickupSlot, day.value, slot, false)
                        : runSlotAction(blockPickupSlot, day.value, slot, true)
                    }
                    className={`rounded-2xl px-3 py-3 text-sm font-black transition disabled:cursor-not-allowed ${
                      isOccupied
                        ? "bg-gray-200 text-gray-500"
                        : isBlocked
                          ? "bg-[#49392c] text-white"
                          : "bg-[#eef2df] text-[#4e5026] hover:bg-[#dfe8c9]"
                    }`}
                  >
                    {formatSlotLabel(slot)}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
