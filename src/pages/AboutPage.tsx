import { StaticPageLayout } from "@/components/StaticPageLayout";
import { Mail } from "lucide-react";

const AboutPage = () => (
  <StaticPageLayout title="About DropReveal" subtitle="We solved the comment chaos.">
    <div className="space-y-10 text-sm text-foreground leading-relaxed">

      <section className="space-y-3">
        <p className="text-base text-muted-foreground leading-relaxed">
          You've seen it everywhere. A creator posts a reel and says{" "}
          <em>"Comment PROMPT and I'll DM you."</em> Thousands of comments flood in. The creator
          is manually sending messages one by one — or using clunky automation tools that still
          break.
        </p>
        <p className="text-base text-muted-foreground leading-relaxed">
          There had to be a better way. That's why we built DropReveal.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          What is DropReveal?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          DropReveal is a dedicated platform where creators host all the resources they mention
          in their reels — AI prompts, downloadable workbooks, checklists, shop links, affiliate
          products, and more.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Instead of asking viewers to comment and wait, creators simply link their profile.
          Viewers scroll through reels, find the one they saw, and instantly access everything
          the creator mentioned. <strong className="text-foreground">One click. No waiting. No DMs.</strong>
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Built for creators, loved by viewers
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          We built DropReveal with two people in mind:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            The creator who is tired of manually managing hundreds of DM requests every week.
          </li>
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            The viewer who commented three days ago and still hasn't received the promised prompt.
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">DropReveal fixes both sides of that equation.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          How it works — in a nutshell
        </h2>
        <ul className="space-y-2 text-muted-foreground">
          {[
            "Creators sign up and add their reels with the associated resources.",
            "Each reel gets a dedicated card on the creator's profile page.",
            "Viewers visit the profile, search by keyword or reel ID, and instantly reveal prompts, download files, or visit linked shops.",
            "No more waiting. No more missed DMs.",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Our mission
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Our mission is simple: make creator-to-audience resource sharing effortless. We believe
          great content deserves great distribution — and that shouldn't require a DM inbox full
          of manual work.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Who's behind DropReveal?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          DropReveal was founded by someone who was genuinely frustrated watching creators struggle
          with the comment-and-DM cycle. We're a small, focused team that cares deeply about creator
          tools and audience experience.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          We're always improving. Have an idea or feedback?
        </p>
        <a
          href="mailto:support@dropreveal.com"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <Mail className="h-4 w-4" />
          support@dropreveal.com
        </a>
      </section>
    </div>
  </StaticPageLayout>
);

export default AboutPage;
