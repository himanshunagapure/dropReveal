export interface Reel {
  id: string;
  reel_link: string;
  prompt: string;
  clothes_link?: string;
  title: string;
  thumbnail: string;
}

export const mockReels: Reel[] = [
  {
    id: "1",
    reel_link: "https://www.instagram.com/reel/example1",
    prompt: "A cinematic portrait shot in golden hour light, wearing a terracotta linen blazer over a white cotton tee. Background: sun-drenched Italian piazza with warm stone walls. Edit style: film grain, slightly desaturated highlights, warm shadows. Camera angle: medium close-up, shallow depth of field.",
    clothes_link: "https://www.amazon.in/s?k=terracotta+linen+blazer",
    title: "Golden Hour in Florence",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=700&fit=crop"
  },
  {
    id: "2",
    reel_link: "https://www.instagram.com/reel/example2",
    prompt: "Moody street style look: oversized black trench coat, chunky silver jewelry, combat boots. Setting: rain-slicked Tokyo alley with neon reflections. Edit: high contrast, teal shadows, lifted blacks. Slow-mo walk with umbrella.",
    clothes_link: "https://www.myntra.com/trench-coats",
    title: "Tokyo After Dark",
    thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=700&fit=crop"
  },
  {
    id: "3",
    reel_link: "https://www.instagram.com/reel/example3",
    prompt: "Dreamy pastel outfit transition reel. Start in casual athleisure → jump cut → lavender co-ord set with pearl accessories. Background: cherry blossom park. Music sync on beat drop. Edit: soft bloom, pastel color grade, airy feel.",
    title: "Blossom Season Fit",
    thumbnail: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=700&fit=crop"
  },
  {
    id: "4",
    reel_link: "https://www.instagram.com/reel/example4",
    prompt: "Power suit moment: tailored charcoal suit, open collar white shirt, minimalist watch. Location: modern glass building rooftop at sunset. Camera: orbit shot, slow zoom pull. Edit: cinematic widescreen bars, desaturated with warm accent on skin tones.",
    clothes_link: "https://www.amazon.in/s?k=charcoal+tailored+suit",
    title: "Boardroom to Rooftop",
    thumbnail: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=700&fit=crop"
  },
  {
    id: "5",
    reel_link: "https://www.instagram.com/reel/example5",
    prompt: "Bohemian desert shoot: flowing maxi dress in burnt sienna, layered gold necklaces, straw hat. Location: Rajasthan sand dunes at magic hour. Drone pullback shot → close-up twirl. Edit: warm earth tones, slight vignette, grain texture.",
    clothes_link: "https://www.myntra.com/maxi-dresses",
    title: "Desert Goddess Edit",
    thumbnail: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=700&fit=crop"
  },
  {
    id: "6",
    reel_link: "https://www.instagram.com/reel/example6",
    prompt: "Minimalist Scandinavian look: cream knit sweater, wide-leg trousers, white sneakers. Setting: concrete architecture with clean lines. Static pose → subtle wind movement. Edit: muted, almost monochrome with slight warmth. Very clean, editorial feel.",
    title: "Nordic Clean",
    thumbnail: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=700&fit=crop"
  },
  {
    id: "7",
    reel_link: "https://www.instagram.com/reel/example7",
    prompt: "Y2K inspired look: low-rise cargo pants, cropped baby tee, butterfly clips, platform sneakers. Setting: retro arcade with colorful lights. Quick cuts synced to upbeat track. Edit: slightly overexposed, vivid colors, nostalgic filter.",
    clothes_link: "https://www.amazon.in/s?k=y2k+cargo+pants",
    title: "2000s Called Back",
    thumbnail: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=700&fit=crop"
  },
  {
    id: "8",
    reel_link: "https://www.instagram.com/reel/example8",
    prompt: "Ethnic fusion: indigo hand-block print kurta with distressed denim, kolhapuri chappals, oxidized silver jhumkas. Location: Jaipur haveli courtyard. Camera: slow pan across arches, then subject reveal. Edit: rich blues and golds, filmic tone curve.",
    clothes_link: "https://www.myntra.com/kurtas",
    title: "Heritage Remix",
    thumbnail: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=700&fit=crop"
  },
];
