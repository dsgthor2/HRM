import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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

        <h1 className="text-4xl font-black text-navy uppercase tracking-tight mb-4">Terms of Service</h1>
        <div className="h-1.5 w-20 bg-blue-600 rounded-full mb-8" />
        
        <p className="text-slate-500 mb-8 font-medium">Effective Date: June 13, 2026</p>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-navy mb-4">1. Legally Binding Agreement</h2>
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement between DefenseBlu Private Limited ("DefenseBlu") and the entity, organization, or individual ("Client", "User", "You") accessing our Enterprise Solutions, Cybersecurity Platforms, AI Research APIs, Utility Applications, or Website Maintenance Services. By accessing our infrastructure or commissioning custom builds, you unequivocally agree to be bound by these Terms. If you do not possess the legal authority to bind your organization, you must cease use immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-4">2. Permitted Use and Strict Prohibitions</h2>
            <p className="mb-3">DefenseBlu grants you a limited, non-exclusive, non-transferable, and revocable license to access our services solely for your internal business operations. You are strictly prohibited from, and represent that you will not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code, AI model weights, or underlying cryptographic architecture of any DefenseBlu software.</li>
              <li>Deploy automated scripts, scrapers, or bots against our infrastructure without explicit written authorization.</li>
              <li>Utilize our platforms to conduct unauthorized penetration testing, denial-of-service (DoS) attacks, or any activity that compromises our Threat Mitigation systems.</li>
              <li>Use our services or AI research outputs to develop competitive products.</li>
            </ul>
            <p className="mt-3 text-red-600 font-medium">Violation of these provisions will result in immediate termination without refund and pursuit of maximum legal damages.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-4">3. Intellectual Property and Research Rights</h2>
            <p>
              All intellectual property, including but not limited to AI algorithms, Threat Mitigation heuristic models, compiled binaries, source code of Custom Builds (unless specifically assigned in a separate Statement of Work), academic publications, and books remain the sole and exclusive property of DefenseBlu. The Client retains full ownership of all raw data uploaded to the system; however, the Client grants DefenseBlu a worldwide, royalty-free license to host, process, and securely transmit this data for the sole purpose of rendering the contracted services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-4">4. Enterprise Service Level and Disclaimers</h2>
            <p>
              While our custom "App Doctor" and Site Reliability Engineering (SRE) teams strive for 99.99% uptime, our services, particularly experimental AI Research modules and Beta Utility Apps, are provided on an "AS IS" and "AS AVAILABLE" basis. DefenseBlu expressly disclaims all warranties, whether express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that our security measures are entirely impervious to zero-day exploits, though our mitigation protocols are state-of-the-art.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-4">5. Limitation of Liability and Indemnification</h2>
            <p>
              To the maximum extent permitted by applicable law, DefenseBlu shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business interruption, arising out of or related to your use of our services. In no event shall DefenseBlu's aggregate cumulative liability exceed the total amounts paid by you to DefenseBlu in the three (3) months preceding the incident. You agree to defend, indemnify, and hold harmless DefenseBlu from any claims, damages, or expenses arising from your violation of these Terms or your misuse of the services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-4">6. Termination and Data Retention</h2>
            <p>
              DefenseBlu reserves the unilateral right to suspend or terminate your access immediately, without prior notice, if we detect anomalous, malicious, or contract-breaching activity. Upon termination, your right to use the services ceases instantly. We will retain cryptographic logs and necessary telemetric data for legal, security, and audit purposes in accordance with our retention schedule, after which data is cryptographically destroyed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy mb-4">7. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any dispute, controversy, or claim arising out of or relating to these Terms, including the breach, termination, or validity thereof, shall be resolved exclusively through binding arbitration in Tirupati, Andhra Pradesh, India, or another jurisdiction solely at DefenseBlu's discretion.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
