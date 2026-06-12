"use client";
import AppShell from "@/components/layout/AppShell";
import UnifiedLetterGenerator from "@/components/letters/UnifiedLetterGenerator";
import { useRouter } from "next/navigation";

export default function ExitLetterPage() {
  const router = useRouter();

  return (
    <AppShell title="Exit & Separation Hub">
      <div className="max-w-7xl mx-auto">
        <UnifiedLetterGenerator 
          initialType="EXIT" 
          onBack={() => router.push("/hrm/emp-documents")} 
        />
      </div>
    </AppShell>
  );
}
