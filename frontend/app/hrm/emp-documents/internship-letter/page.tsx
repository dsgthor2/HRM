"use client";
import AppShell from "@/components/layout/AppShell";
import UnifiedLetterGenerator from "@/components/letters/UnifiedLetterGenerator";
import { useRouter } from "next/navigation";

export default function InternshipLetterPage() {
  const router = useRouter();

  return (
    <AppShell title="Internship Letter Hub">
      <div className="max-w-7xl mx-auto">
        <UnifiedLetterGenerator 
          initialType="INTERNSHIP" 
          onBack={() => router.push("/hrm/emp-documents")} 
        />
      </div>
    </AppShell>
  );
}
