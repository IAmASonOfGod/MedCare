import dynamic from "next/dynamic";
import React from "react";

const PasskeyModal = dynamic(() => import("@/components/passkeyModal"), {
  ssr: false,
});

export default function AdminPasskeyPage() {
  return <PasskeyModal />;
}
