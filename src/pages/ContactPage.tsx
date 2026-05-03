import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Mail } from "lucide-react";

function ContactCard({
  title,
  subject,
  children,
}: {
  title: string;
  subject: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
      <h2
        className="text-base font-semibold text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
      <a
        href={`mailto:support@dropreveal.com?subject=${encodeURIComponent(subject)}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <Mail className="h-4 w-4" />
        support@dropreveal.com
      </a>
    </div>
  );
}

const ContactPage = () => (
  <StaticPageLayout
    title="Contact & Support"
    subtitle="We're a small team that genuinely cares about your experience."
  >
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm">
        <p className="font-medium text-foreground">Response time</p>
        <p className="mt-1 text-muted-foreground">
          We respond to all emails within 24 hours on business days.
        </p>
        <a
          href="mailto:support@dropreveal.com"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <Mail className="h-4 w-4" />
          support@dropreveal.com
        </a>
      </div>

      <ContactCard title="Creator support" subject="Creator Help">
        <p>
          Setting up your profile? Having trouble attaching a resource? We'll help you get it
          working.
        </p>
        <p>Email us with the subject line <strong className="text-foreground">"Creator Help"</strong> and describe your issue. Include your profile handle if you have one.</p>
      </ContactCard>

      <ContactCard title="Report a problem" subject="Bug Report">
        <p>If you've found a broken link, a missing resource, or a technical bug, please let us know:</p>
        <ul className="space-y-1.5">
          {[
            "Go to the relevant reel card",
            "Note the creator handle and reel title",
            `Email us with the subject "Bug Report"`,
          ].map((s) => (
            <li key={s} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
              {s}
            </li>
          ))}
        </ul>
      </ContactCard>

      <ContactCard title="Content removal requests" subject="Content Removal Request">
        <p>
          If you believe content on DropReveal infringes your intellectual property or violates
          our Terms, please contact us with:
        </p>
        <ul className="space-y-1.5">
          {[
            "Your name and contact information",
            "A description of the content in question",
            "The URL of the specific reel card or creator profile",
            "A statement explaining the nature of your complaint",
          ].map((s) => (
            <li key={s} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
              {s}
            </li>
          ))}
        </ul>
        <p>We review all requests within 48 hours.</p>
      </ContactCard>

      <ContactCard title="Business & partnership enquiries" subject="Partnership">
        <p>
          Interested in partnering with us, featuring DropReveal, or exploring enterprise plans?
          Reach out with the subject <strong className="text-foreground">"Partnership"</strong>.
        </p>
      </ContactCard>

      <ContactCard title="Feedback" subject="Feedback">
        <p>
          Have an idea that would make DropReveal better? We genuinely read every piece of
          feedback. Use the subject <strong className="text-foreground">"Feedback"</strong>.
        </p>
      </ContactCard>
    </div>
  </StaticPageLayout>
);

export default ContactPage;
