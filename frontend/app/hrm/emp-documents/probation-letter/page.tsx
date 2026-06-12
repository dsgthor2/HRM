"use client";
import AppShell from "@/components/layout/AppShell";
import UnifiedLetterGenerator from "@/components/letters/UnifiedLetterGenerator";
import { useRouter } from "next/navigation";

export default function ProbationLetterPage() {
  const router = useRouter();

  return (
    <AppShell title="Probation Hub">
      <div className="max-w-7xl mx-auto">
        <UnifiedLetterGenerator 
          initialType="PROBATION" 
          onBack={() => router.push("/hrm/emp-documents")} 
        />
      </div>
    </AppShell>
  );
}
