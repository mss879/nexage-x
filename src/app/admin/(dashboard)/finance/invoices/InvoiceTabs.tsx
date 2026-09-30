"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { FilePlus2, Files } from "lucide-react";
import { TabBar } from "@/components/admin/ui";

const NEW = "/admin/finance/invoices/new";
const LIST = "/admin/finance/invoices";

export default function InvoiceTabs() {
  const pathname = usePathname();
  const creating = pathname === NEW;

  return (
    <TabBar
      ariaLabel="Invoices"
      tabs={[
        { href: NEW, label: "Create invoice", icon: FilePlus2, active: creating },
        // An invoice that has been saved is a past invoice — opening one keeps this tab lit
        { href: LIST, label: "Past invoices", icon: Files, active: !creating },
      ]}
    />
  );
}
