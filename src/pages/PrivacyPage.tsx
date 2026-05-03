import { StaticPageLayout } from "@/components/StaticPageLayout";

const SECTIONS = [
  {
    title: "1. Who we are",
    body: `DropReveal ("we", "our", or "us") is a platform that lets content creators share resources — prompts, workbooks, links, and more — with their audience in one place. Our website is www.dropreveal.com.`,
  },
  {
    title: "2. What information we collect",
    intro: "We collect the following types of information:",
    bullets: [
      "Account information: When creators sign up, we collect their name, email address, and profile details.",
      "Usage data: Pages visited, reels viewed, buttons clicked, and time spent on the platform.",
      "Device & technical data: IP address, browser type, operating system, and referring URLs.",
      "Cookies: We use cookies to remember your preferences and keep you logged in.",
      "Content uploaded by creators: Prompts, file attachments, links, and reel metadata.",
    ],
    footer: "We do not collect payment card details directly — payments (if any) are handled by third-party processors.",
  },
  {
    title: "3. How we use your information",
    intro: "We use your data to:",
    bullets: [
      "Operate and improve the platform",
      "Personalise your experience on creator profile pages",
      "Send service-related emails (account setup, important updates)",
      "Analyse usage trends to improve features",
      "Prevent fraud and ensure platform security",
    ],
    footer: "We will never sell your personal data to third parties.",
  },
  {
    title: "4. Sharing your information",
    intro: "We may share your data with:",
    bullets: [
      "Service providers: Hosting, analytics, and email providers who help us run the platform.",
      "Legal authorities: If required by law or to protect our rights.",
    ],
    footer: "We do not share your data with advertisers.",
  },
  {
    title: "5. Cookies",
    body: "We use essential cookies to keep you logged in and functional cookies to remember preferences. You can control cookies via your browser settings. Note that disabling cookies may affect some features of DropReveal.",
  },
  {
    title: "6. Data retention",
    body: "We retain your data for as long as your account is active. If you delete your account, we remove your personal data within 30 days, except where retention is required by law.",
  },
  {
    title: "7. Your rights",
    intro: "Depending on your location, you may have the right to:",
    bullets: [
      "Access the personal data we hold about you",
      "Request correction of inaccurate data",
      "Request deletion of your data",
      "Object to or restrict how we process your data",
      "Port your data to another service",
    ],
    footer: "To exercise any of these rights, email us at support@dropreveal.com.",
  },
  {
    title: "8. Children's privacy",
    body: "DropReveal is not intended for users under the age of 13. We do not knowingly collect data from children.",
  },
  {
    title: "9. Changes to this policy",
    body: "We may update this policy from time to time. We will notify you of significant changes via email or a notice on the platform.",
  },
  {
    title: "10. Contact us",
    body: "For privacy-related questions, contact us at: support@dropreveal.com",
  },
];

const PrivacyPage = () => (
  <StaticPageLayout title="Privacy Policy" subtitle="Last updated: May 1, 2025">
    <div className="space-y-1 mb-8 text-sm text-muted-foreground leading-relaxed">
      <p>
        Welcome to DropReveal. Your privacy matters to us. This policy explains what information
        we collect, how we use it, and what rights you have over it.
      </p>
    </div>

    <div className="space-y-8">
      {SECTIONS.map(({ title, body, intro, bullets, footer }) => (
        <section key={title} className="space-y-3">
          <h2
            className="text-base font-semibold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
          {intro && <p className="text-sm text-muted-foreground">{intro}</p>}
          {body && (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {body}
            </p>
          )}
          {bullets && (
            <ul className="space-y-1.5">
              {bullets.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                  {b}
                </li>
              ))}
            </ul>
          )}
          {footer && (
            <p className="text-sm text-muted-foreground leading-relaxed italic">{footer}</p>
          )}
        </section>
      ))}
    </div>
  </StaticPageLayout>
);

export default PrivacyPage;
