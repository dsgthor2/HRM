import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-slate-50 py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-4xl font-black text-navy uppercase tracking-tight mb-4">Privacy Policy</h1>
        <div className="h-1.5 w-20 bg-blue-600 rounded-full mb-8" />
        
        <p className="text-slate-500 mb-8 font-medium">Last Updated: June 13, 2026</p>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-navy mb-4">1. Introduction and Scope</h2>
            <p>
              DefenseBlu Private Limited ("DefenseBlu," "we," "us," or "our") is committed to maintaining the highest standards of data privacy and security. This Privacy Policy governs the collection, processing, storage, and protection of personal and corporate data across our Enterprise Solutions, Cybersecurity Platforms, Artificial Intelligence (AI) Research initiatives, Utility Applications, and digital infrastructure. By accessing or utilizing any DefenseBlu services, you expressly consent to the data practices described in this comprehensive policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-4">2. Information We Collect</h2>
            <p className="mb-3">We collect information strictly necessary to deliver enterprise-grade services, ensure cryptographic security, and advance our technological research. This includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity & Contact Data:</strong> Names, email addresses, corporate affiliations, and physical addresses (e.g., Global Operations data) required for account provisioning and strict Role-Based Access Control (RBAC).</li>
              <li><strong>Technical & Telemetry Data:</strong> IP addresses, browser fingerprints, cryptographic nonces, authentication tokens, and highly granular network logs utilized exclusively by our Threat Mitigation and App Doctor daemons to prevent unauthorized access and DDoS attacks.</li>
              <li><strong>System & Application Data:</strong> Content, configurations, and metadata uploaded to our Custom Client-Requested Builds or Utility Applications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-4">3. How We Utilize Your Data</h2>
            <p className="mb-3">DefenseBlu strictly prohibits the sale or unauthorized monetization of your personal data. Data is processed exclusively for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Delivery & Operations:</strong> To provision, maintain, and execute the enterprise services, APIs, and custom applications you have contracted.</li>
              <li><strong>AI Research & Engineering:</strong> Anonymized, aggregated, and strictly de-identified telemetry may be utilized to train proprietary AI models and publish academic research, ensuring zero risk of individual identification.</li>
              <li><strong>Security & Threat Mitigation:</strong> To actively monitor for, preempt, and neutralize malicious cyber threats, unauthorized intrusions, or anomalous platform behavior.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-4">4. Enterprise-Grade Data Security</h2>
            <p>
              Security is not an afterthought at DefenseBlu; it is our foundation. We implement state-of-the-art cryptographic standards, including AES-256 encryption at rest and TLS 1.3 in transit. Our infrastructure operates on a Zero-Trust Architecture (ZTA), meaning lateral movement is cryptographically restricted. Furthermore, our proprietary "App Doctor" systems continuously monitor application health and memory limits, actively preventing data leakage from buffer overflows or connection pool exhaustion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-4">5. Third-Party Disclosure & Vendor Risk Management</h2>
            <p>
              We do not sell, rent, or trade your data. We only share information with strictly vetted, enterprise-tier infrastructure providers (e.g., Cloudflare, specialized database hosts) under legally binding Data Processing Agreements (DPAs) and Non-Disclosure Agreements (NDAs). Disclosure to law enforcement will only occur upon receipt of a verified, legally binding subpoena or court order, and we will attempt to notify you unless legally prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-4">6. Your Rights and Controls</h2>
            <p>
              Depending on your jurisdiction (e.g., GDPR, CCPA, DPDPA), you possess the right to access, rectify, port, or erase your personal data. You may also object to specific processing vectors. To exercise these rights or request a comprehensive cryptographic data audit, please contact our Data Protection Officer at <strong>gupthaa@defenseblu.com</strong>. We commit to fulfilling authenticated requests within 30 days.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
