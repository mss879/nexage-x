import React from "react";
import InvoiceTabs from "./InvoiceTabs";

/** Everything under Finance → Invoices shares the two tabs: make a new one, or look at the ones you've made. */
export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <InvoiceTabs />
      {children}
    </div>
  );
}
