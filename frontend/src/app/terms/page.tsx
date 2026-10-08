import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Tuiyabelong rental property management.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black bg-pattern text-white">
      <header className="border-b border-[#18191b]">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00e599]">
                <span className="text-sm font-bold text-black">t</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">Tuiyabelong</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-3 text-heading-xl font-medium text-white">Terms of Service</h1>
          <p className="mt-2 text-sm text-[#797d86]">Effective date: 8 October 2026</p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#c9cbcf]">
            <Section title="1. Acceptance of Terms">
              <p>
                By creating an account or using Tuiyabelong (&quot;the Platform&quot;), you agree to be
                bound by these Terms of Service and our Privacy Policy. If you do not agree, please do
                not use the Platform. Registration requires that you accept these terms.
              </p>
            </Section>

            <Section title="2. The Service">
              <p>
                Tuiyabelong is a rental property management platform that helps landlords and tenants in
                Kenya manage properties, units, rent payments, maintenance requests, utilities, and
                communications. The Platform is provided as a hosted service over the Internet and may be
                updated from time to time.
              </p>
            </Section>

            <Section title="3. Accounts">
              <p>
                You must provide accurate information when creating an account and keep your login
                credentials confidential. You are responsible for all activity that occurs under your
                account. Accounts are intended for individual use; sharing credentials is not permitted.
              </p>
            </Section>

            <Section title="4. Acceptable Use">
              <ul className="list-disc space-y-1 pl-5">
                <li>You may not attempt to gain unauthorised access to other accounts or systems.</li>
                <li>You may not probe, scan or test the vulnerability of the Platform without authorisation.</li>
                <li>You may not use the Platform to store or transmit unlawful content.</li>
                <li>You may not reverse engineer, copy or resell the Platform.</li>
              </ul>
            </Section>

            <Section title="5. Payments">
              <p>
                Payment information may be processed via mobile money such as M-Pesa. You are responsible
                for ensuring payment references are correct. Tuiyabelong records payments but is not a
                bank or licensed payment provider; settlement of rent dues remains an obligation between
                the tenant and landlord.
              </p>
            </Section>

            <Section title="6. Data and Privacy">
              <p>
                Your use of the Platform is subject to our <Link href="/privacy" className="text-[#00e599] underline underline-offset-2">Privacy Policy</Link>,
                which explains how we collect, use, and protect your personal data, including how you can
                exercise your rights under the Kenyan Data Protection Act.
              </p>
            </Section>

            <Section title="7. Intellectual Property">
              <p>
                The Platform, including its design, logo, and software, is owned by Tuiyabelong and
                licensed to you, not sold. You may not use the Tuiyabelong name or branding without
                written permission.
              </p>
            </Section>

            <Section title="8. Termination">
              <p>
                You may close your account at any time. Landlords and administrators may remove tenant
                accounts in line with their records. We may suspend or terminate access for users who
                violate these terms or applicable law.
              </p>
            </Section>

            <Section title="9. Disclaimer of Warranties">
              <p>
                The Platform is provided &quot;as is&quot; and &quot;as available&quot;. While we work to
                keep the service reliable and secure, we do not warrant that it will be uninterrupted,
                error-free, or completely free of security risks.
              </p>
            </Section>

            <Section title="10. Limitation of Liability">
              <p>
                To the maximum extent permitted by law, Tuiyabelong shall not be liable for any indirect,
                incidental, or consequential damages arising from your use of the Platform, including loss
                of data, revenue, or goodwill.
              </p>
            </Section>

            <Section title="11. Governing Law">
              <p>
                These Terms are governed by the laws of the Republic of Kenya. Any disputes shall be
                subject to the jurisdiction of the courts of Kenya.
              </p>
            </Section>

            <Section title="12. Contact">
              <p>
                For questions about these Terms, contact the Platform administrator at
                the details provided on our Privacy Policy page.
              </p>
            </Section>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-full bg-[#00e599] px-5 py-2.5 text-sm font-medium text-black hover:bg-[#00cc88]">
              Create account
            </Link>
            <Link href="/login" className="rounded-full border border-[#303236] px-5 py-2.5 text-sm font-medium text-[#c9cbcf] hover:bg-[#18191b]">
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#18191b] py-6">
        <div className="container text-center text-xs text-[#61646b]">
          <p>&copy; 2026 Tuiyabelong. Developed and managed by Daniel Manyasa.</p>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-medium text-white">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}