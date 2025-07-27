"use client";
import { useEffect } from "react";
import { usePractice } from "@/components/PracticeContext";

export default function SetPracticeContext({ practice }: { practice: any }) {
  const { setPractice } = usePractice();
  useEffect(() => {
    setPractice(practice);
  }, [practice, setPractice]);
  return null;
}
