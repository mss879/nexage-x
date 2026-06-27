"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import MenuOverlay from "./MenuOverlay";

interface MenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenu(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error("useMenu must be used within <MenuProvider>");
  }
  return ctx;
}

export default function MenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);

  return (
    <MenuContext.Provider value={value}>
      {children}
      <MenuOverlay open={isOpen} onClose={close} />
    </MenuContext.Provider>
  );
}
