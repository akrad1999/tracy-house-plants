"use client";

import { useEffect, useRef } from "react";
import { recordCheckoutSuccessView } from "@/app/account/orders/[orderId]/schedule/actions";

type RecordCheckoutViewProps = {
  orderId: string;
};

export function RecordCheckoutView({ orderId }: RecordCheckoutViewProps) {
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    if (hasRecordedRef.current) return;
    hasRecordedRef.current = true;
    void recordCheckoutSuccessView(orderId);
  }, [orderId]);

  return null;
}
