import { StaticPageLayout } from "@/components/StaticPageLayout";

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: "By creating an account or using DropReveal in any way, you confirm that you are at least 13 years old and agree to be bound by these Terms and our Privacy Policy.",
  },
  {
    title: "2. What DropReveal does",
      body: "DropReveal is a platform that allows content creators (\u201cCreators\u201d) to link their social media reels to resources such as AI prompts, downloadable workbooks, and product links. Viewers (\u201cUsers\u201d) can access these resources on a Creator\u2019s profile page.",
  },
  {
    title: "3. Creator responsibilities",
    intro: "As a Creator, you agree that:",
    bullets: [
      "All content you upload (prompts, files, links) is owned by you or you have the rights to share it.",
      "You will not upload illegal, harmful, misleading, or infringing content.",
      "You are responsible for the accuracy of resources linked to your reels.",
      "You will not use the platform to spam, scam, or mislead your audience.",
      "You will not share content that violates the intellectual property rights of others.",
    ],
  },
  {
    title: "4. User responsibilities",
    intro: "As a User, you agree that:",
    bullets: [
      "You will not misuse, reproduce, or redistribute Creator content without permission.",
      "You will not attempt to reverse-engineer or scrape the platform.",
      "You will use downloaded resources (workbooks, prompts) for personal use only unless the Creator states otherwise.",
    ],
  },
  {
    title: "5. Intellectual property",
    body: "All platform design, code, and branding belong to DropReveal. Creator content remains the property of the Creator. We do not claim ownership of anything you upload.",
  },
  {
    title: "6. Prohibited activities",
    intro: "The following are strictly prohibited:",
    bullets: [
      "Uploading malware, viruses, or malicious files",
      "Impersonating another Creator or individual",
      "Using the platform for unlawful purposes",
      "Attempting to gain unauthorised access to the platform or other accounts",
      "Posting content that is defamatory, obscene, or harmful",
    ],
  },
  {
    title: "7. Termination",
    body: "We reserve the right to suspend or terminate accounts that violate these Terms, without notice. You may also delete your account at any time by contacting support@dropreveal.com.",
  },
  {
    title: "8. Disclaimer of warranties",
    body: "DropReveal is provided \u201cas is\u201d without warranties of any kind. We do not guarantee that the platform will be uninterrupted, error-free, or that content shared by Creators is accurate or reliable.",
  },
  {
    title: "9. Limitation of liability",
    body: "To the maximum extent permitted by law, DropReveal shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
  },
  {
    title: "10. Changes to terms",
    body: "We may update these Terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the updated Terms.",
  },
  {
    title: "11. Contact",
    body: "For questions about these Terms, contact us at: support@dropreveal.com",
  },
];

const TermsPage = () => (
  <StaticPageLayout title="Terms of Service" subtitle="Last updated: May 1, 2025">
    <div className="mb-8 text-sm text-muted-foreground leading-relaxed">
      <p>
        These Terms of Service ("Terms") govern your use of DropReveal. By accessing or using our
        platform, you agree to these Terms. Please read them carefully.
      </p>
    </div>

    <div className="space-y-8">
      {SECTIONS.map(({ title, body, intro, bullets }) => (
        <section key={title} className="space-y-3">
          <h2
            className="text-base font-semibold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
          {intro && <p className="text-sm text-muted-foreground">{intro}</p>}
          {body && (
            <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
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
        </section>
      ))}
    </div>
  </StaticPageLayout>
);

export default TermsPage;
