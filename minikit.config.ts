const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {



  accountAssociation: {
    header: "eyJmaWQiOjE2MTMxNzUsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgyNkQ3MGE0OTdiNkQyNjQ0QzQ3NGI0OWY2ZkNhNUNhZjNDYTBmMjM2In0",
    payload: "eyJkb21haW4iOiJtaW5pLWFwcC1xdWlja3N0YXJ0LXRlbXBsYXRlLXdvYWQudmVyY2VsLmFwcCJ9",
    signature: "0tkoV2iz7n3T5H+nnP0+vBZ4H5kbrAltWA1bzVOhaqtz5O2h3fT7/NPLlAU4UF5KYBsG8hnlk6sPMOEucVGdHhs="
  },
  miniapp: {
    version: "1",
    name: "QuickSplit",
    subtitle: "Split bills instantly on Base",
    description: "The fastest way to split bills and settle debts with friends using Base. Instant, cheap, and seamless.",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0052FF",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["social", "payments", "utility"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Split bills. Pay with Base.",
    ogTitle: "QuickSplit - Group Payments",
    ogDescription: "Split bills and settle debts instantly with friends on Base. No friction, just crypto.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;

