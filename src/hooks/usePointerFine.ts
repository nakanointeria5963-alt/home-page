"use client";

import { useEffect, useState } from "react";

export default function usePointerFine() {
  const [isFine, setIsFine] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    setIsFine(query.matches);

    const handleChange = (event: MediaQueryListEvent) => setIsFine(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return isFine;
}
