"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface PracticeInfo {
  $id: string;
  practiceName: string;
  // add other fields as needed
}

const PracticeContext = createContext<{
  practice: PracticeInfo | null;
  setPractice: (practice: PracticeInfo | null) => void;
}>({
  practice: null,
  setPractice: () => {},
});

export const PracticeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [practice, setPracticeState] = useState<PracticeInfo | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("practice") : null;
    if (stored) {
      setPracticeState(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage on change
  const setPractice = (practice: PracticeInfo | null) => {
    setPracticeState(practice);
    if (typeof window !== "undefined") {
      if (practice) {
        localStorage.setItem("practice", JSON.stringify(practice));
      } else {
        localStorage.removeItem("practice");
      }
    }
  };

  return (
    <PracticeContext.Provider value={{ practice, setPractice }}>
      {children}
    </PracticeContext.Provider>
  );
};

export const usePractice = () => useContext(PracticeContext);
