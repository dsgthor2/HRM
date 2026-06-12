"use client";
import AppShell from "@/components/layout/AppShell";
import UnifiedLetterGenerator from "@/components/letters/UnifiedLetterGenerator";
import { useRouter } from "next/navigation";

export default function IncrementLetterPage() {
  const router = useRouter();

  return (
    <AppShell title="Increment & Appraisal Hub">
      <div className="max-w-7xl mx-auto">
        <UnifiedLetterGenerator 
          initialType="INCREMENT" 
          onBack={() => router.push("/hrm/emp-documents")} 
        />
      </div>
    </AppShell>
  );
}
