import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Tuiyabelong rental property management.',
};

export default function PrivacyPage() {
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
          <h1 className="mt-3 text-heading-xl font-medium text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm text-[#797d86]">Effective date: 8 October 2026</p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#c9cbcf]">
            <Section title="1. Overview">
              <p>
                Tuiyabelong (&quot;we&quot;, &quot;us&quot;) respects your privacy. This Privacy Policy
                explains what personal data we collect, why we collect it, how we store and protect it,
                and the rights you have under the Kenyan Data Protection Act, 2019.
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-white">Account data:</strong> name, email address, phone number,
                  and password (stored in an encrypted form).
                </li>
                <li>
                  <strong className="text-white">Property data:</strong> property, unit, and room details
                  you enter, tenant assignments, rent amounts, and lease information.
                </li>
                <li>
                  <strong className="text-white">Payment records:</strong> payment references and amounts
                  so you can track rent and dues. Tuiyabelong does not store card numbers or M-Pesa PINs.
                </li>
                <li>
                  <strong className="text-white">Usage data:</strong> pages visited and basic device
                  information, used only to keep the platform secure and improve performance.
                </li>
                <li>
                  <strong className="text-white">Communication:</strong> messages sent through the in-platform messaging system.
                </li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Data">
              <ul className="list-disc space-y-1 pl-5">
                <li>To provide and maintain the Platform and its features.</li>
                <li>To facilitate landlord-tenant relationships on the Platform.</li>
                <li>To keep the Platform secure and prevent fraud or abuse.</li>
                <li>To comply with legal obligations.</li>
              </ul>
              <p>We do not sell your personal data to third parties.</p>
            </Section>

            <Section title="4. Cookies and Preferences">
              <p>
                We use a small number of cookies to keep you signed in and the platform secure. When you
                first visit, we ask for your consent to non-essential categories (preferences, analytics,
                and marketing) through our cookie banner. You can change your choices at any time using
                the &quot;Cookie preferences&quot; link in the site footer.
              </p>
            </Section>

            <Section title="5. Data Storage and Security">
              <p>
                Your data is stored on secure, encrypted cloud infrastructure (Neon Postgres) and
                protected by industry-standard measures, including role-based access control, HTTPS, and
                security headers that guard against attacks such as clickjacking. Financial summary data
                (payments, revenue, taxes) is only visible to administrators and landlords, never on
                public pages.
              </p>
            </Section>

            <Section title="6. Data Retention">
              <p>
                We retain your account data for as long as your account is active. You may request
                deletion of your account, after which personal data is removed or anonymised where
                retention is legally required.
              </p>
            </Section>

            <Section title="7. Your Rights">
              <p>
                Under the Kenyan Data Protection Act you have the right to access, correct, and request
                deletion of your personal data, and to lodge a complaint with the Office of the Data
                Protection Commissioner (ODPC). To exercise these rights, contact us using the details
                below.
              </p>
            </Section>

            <Section title="8. Children">
              <p>
                The Platform is not directed at children under 18. We do not knowingly collect personal
                data from children.
              </p>
            </Section>

            <Section title="9. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. Material changes will be reflected
                here with an updated effective date. Continued use of the Platform after changes
                constitutes acceptance.
              </p>
            </Section>

            <Section title="10. Contact">
              <div className="space-y-1">
                <p><strong className="text-white">Platform:</strong> Tuiyabelong</p>
                <p><strong className="text-white">Developer:</strong> Daniel Manyasa</p>
                <p><strong className="text-white">Domain:</strong> www.tuiyabelong.com</p>
              </div>
            </Section>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/terms" className="rounded-full bg-[#00e599] px-5 py-2.5 text-sm font-medium text-black hover:bg-[#00cc88]">
              Read Terms of Service
            </Link>
            <Link href="/register" className="rounded-full border border-[#303236] px-5 py-2.5 text-sm font-medium text-[#c9cbcf] hover:bg-[#18191b]">
              Create account
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#18191b] py-6">
        <div className="container text-center text-xs text-[#61646b]">
          <p>&copy; 2026 Tuiyabelong</p>
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