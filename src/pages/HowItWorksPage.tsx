import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Mail } from "lucide-react";

const CREATOR_STEPS = [
  {
    step: "1",
    title: "Sign up",
    body: `Head to www.dropreveal.com and create your creator account. Set up your profile with your name, handle, and a short bio. Your profile URL will look like: dropreveal.com/your-handle`,
  },
  {
    step: "2",
    title: "Add your reels",
    body: `For each reel you've posted where you promised a resource, create a card on DropReveal. You'll need the reel ID or link from Instagram, TikTok, or YouTube Shorts, a short searchable title, and optionally a thumbnail or cover image.`,
  },
  {
    step: "3",
    title: "Attach your resources",
    body: null,
    resources: [
      "AI Prompt — paste your prompt text directly. Viewers click \u201cReveal Prompt\u201d to see it.",
      "Downloadable file — upload your workbook, PDF, checklist, or template. Viewers click to download.",
      "Shop / product links — add one or more links to products, Gumroad pages, Amazon listings, or your own store.",
      "Custom links — any other URL you want to share with your audience.",
    ],
  },
  {
    step: "4",
    title: "Share your profile",
    body: `Once your profile is live, update your reel captions and bio:\n\n"Comment PROMPT or visit dropreveal.com/your-handle to get it instantly!"\n\nThat's it. Viewers come to your profile, find the reel, and access the resource themselves.`,
  },
];

const WHAT_YOU_CAN_SHARE = [
  "AI & ChatGPT prompts",
  "Notion templates and Google Sheets",
  "PDF guides, eBooks, and workbooks",
  "Links to your Etsy, Gumroad, or Shopify store",
  "Affiliate product links",
  "Course or community links",
  "Any URL you want your audience to visit",
];

const TIPS = [
  "Use clear, searchable titles for your reel cards so viewers can find them quickly.",
  "Update your bio link to point to your DropReveal profile.",
  "Pin your DropReveal link in your reel comments for extra visibility.",
  "Add all your past reels — not just future ones. Viewers often go back to older content.",
];

const VIEWER_FAQS = [
  {
    q: "Is DropReveal free to use?",
    a: "Yes. Browsing creator profiles and accessing resources on DropReveal is completely free for viewers.",
  },
  {
    q: "Do I need an account to access resources?",
    a: "No. You can browse creator profiles and reveal resources without creating an account.",
  },
  {
    q: "How do I find the reel I'm looking for?",
    a: "Visit the creator's DropReveal profile and either scroll through their reels or use the search bar to look up by keyword or reel ID. The reel ID is usually the code at the end of the Instagram or TikTok URL.",
  },
  {
    q: "The creator said to comment but I found this profile — is this legit?",
    a: "Yes! Creators share their DropReveal profile as a faster, simpler alternative to the comment-and-DM method. Instead of waiting for a manual DM, you get the resource instantly here.",
  },
  {
    q: "What if the resource I'm looking for isn't on the creator's profile?",
    a: "The creator may not have added that reel yet. Try commenting on the original reel and letting the creator know you'd like it added to their DropReveal profile.",
  },
  {
    q: "Can I share the resources I download?",
    a: "Resources are shared for your personal use. Redistribution or reselling without the creator's permission is not allowed.",
  },
];

const CREATOR_FAQS = [
  {
    q: "Is DropReveal free for creators?",
    a: "We offer a free tier that lets you add a limited number of reel cards. Paid plans allow unlimited reels and additional features.",
  },
  {
    q: "Which platforms are supported?",
    a: "You can link reels from Instagram, TikTok, and YouTube Shorts. We're working on adding more platforms.",
  },
  {
    q: "Can I add resources to old reels I've already posted?",
    a: "Absolutely. You can add any of your past reels to DropReveal at any time. Viewers who discover your profile will be able to access resources for older content too.",
  },
  {
    q: "What file types can I upload?",
    a: "You can upload PDFs, Excel/Google Sheets exports (.xlsx), Word documents (.docx), images (.jpg, .png), and zip files. Maximum file size is 50 MB per upload.",
  },
  {
    q: "What happens if I delete a reel on Instagram or TikTok?",
    a: "Your DropReveal card will still exist and resources will still be accessible. The original reel preview may not load, but the content you attached will remain available.",
  },
  {
    q: "Can I password-protect certain resources?",
    a: "This is a feature we're actively building. For now, all resources on a public profile are accessible to anyone who visits your page.",
  },
  {
    q: "I'm not tech-savvy. Is this hard to set up?",
    a: "Not at all. Most creators have their profile live within 15 minutes. If you get stuck, email us at support@dropreveal.com and we'll walk you through it personally.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-border/50 py-4 last:border-0">
      <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        {q}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{a}</p>
    </div>
  );
}

const HowItWorksPage = () => (
  <StaticPageLayout
    title="How it works"
    subtitle="No more manually DMing everyone who comments. Here's how to set up your DropReveal profile."
  >
    <div className="space-y-12 text-sm">

      {/* Creator steps */}
      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          For creators
        </h2>
        <ol className="space-y-5">
          {CREATOR_STEPS.map(({ step, title, body, resources }) => (
            <li key={step} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {step}
              </div>
              <div className="flex-1 space-y-2 pt-0.5">
                <p className="font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                  {title}
                </p>
                {body && (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{body}</p>
                )}
                {resources && (
                  <ul className="space-y-1.5 text-muted-foreground">
                    {resources.map((r) => (
                      <li key={r} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* What you can share */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          What can I share?
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {WHAT_YOU_CAN_SHARE.map((item) => (
            <li key={item} className="flex gap-2 text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Tips */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Tips for best results
        </h2>
        <ul className="space-y-2">
          {TIPS.map((tip) => (
            <li key={tip} className="flex gap-2 text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* Need help */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 flex items-start gap-3">
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Need help?</p>
          <p className="text-muted-foreground">
            We're happy to help you get set up. Email us and we'll walk you through it.
          </p>
        </div>
        <a
          href="mailto:support@dropreveal.com"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Mail className="h-4 w-4" />
          Email us
        </a>
      </div>

      {/* FAQ — Viewers */}
      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: "var(--font-display)" }}>
          FAQ — Viewers
        </h2>
        {VIEWER_FAQS.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </section>

      {/* FAQ — Creators */}
      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: "var(--font-display)" }}>
          FAQ — Creators
        </h2>
        {CREATOR_FAQS.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </section>
    </div>
  </StaticPageLayout>
);

export default HowItWorksPage;
