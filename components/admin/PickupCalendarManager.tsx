"use client";

import { useState, useTransition } from "react";
import { blockPickupSlot, unblockPickupSlot } from "@/app/admin/calendar/actions";
import { formatSlotLabel, getBlackoutSlotKey } from "@/lib/pickup";

type AdminPickupDay = {
  value: string;
  label: string;
  slots: string[];
};

type PickupCalendarManagerProps = {
  days: AdminPickupDay[];
  blockedSlots: string[];
  occupiedSlots: string[];
};

type SelectedSlot = {
  pickupDate: string;
  pickupTime: string;
  dayLabel: string;
  isBlocked: boolean;
};

export function PickupCalendarManager({ days, blockedSlots, occupiedSlots }: PickupCalendarManagerProps) {
  const [blockedSet, setBlockedSet] = useState(() => new Set(blockedSlots));
  const occupiedSet = new Set(occupiedSlots);
  const [message, setMessage] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
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
        setSelectedSlot(null);
      }
    });
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[2rem] border border-[#c8ba7e]/20 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-[#4e5026]">Manage pickup availability</h2>
        <p className="mt-2 text-sm leading-6 text-[#49392c]/65">
          Select any available or unavailable slot, then confirm whether you want to block or unblock it.
        </p>
        {message ? (
          <p className="mt-4 rounded-2xl bg-[#eef2df] px-4 py-3 text-sm font-black text-[#4e5026]">
            {message}
          </p>
        ) : null}
      </div>

      {days.map((day) => (
          <section key={day.value} className="rounded-[2rem] border border-[#c8ba7e]/20 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#cb6843]">Pickup day</p>
              <h3 className="mt-1 text-xl font-black text-[#4e5026]">{day.label}</h3>
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
                    onClick={() => setSelectedSlot({ pickupDate: day.value, pickupTime: slot, dayLabel: day.label, isBlocked })}
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
        ))}

      {selectedSlot ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#49392c]/45 px-4 py-6">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#cb6843]">Confirm availability</p>
            <h3 className="mt-2 text-2xl font-black text-[#4e5026]">
              {selectedSlot.dayLabel} at {formatSlotLabel(selectedSlot.pickupTime)}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#49392c]/65">
              This slot is currently {selectedSlot.isBlocked ? "unavailable" : "available"}.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  selectedSlot.isBlocked
                    ? runSlotAction(unblockPickupSlot, selectedSlot.pickupDate, selectedSlot.pickupTime, false)
                    : runSlotAction(blockPickupSlot, selectedSlot.pickupDate, selectedSlot.pickupTime, true)
                }
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#4e5026] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isPending ? "Saving..." : selectedSlot.isBlocked ? "Unblock Slot" : "Block Slot"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#c8ba7e]/40 bg-white px-5 text-sm font-black text-[#4e5026]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
