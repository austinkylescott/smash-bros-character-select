/**
 * Who the server takes sign-ins from: Clerk, whose tokens for Convex come from its JWT template
 * named "convex". Each deployment sets CLERK_FRONTEND_API_URL to its Clerk instance's Frontend API.
 */
import type { AuthConfig } from "convex/server";

export default {
  providers: [{ domain: process.env.CLERK_FRONTEND_API_URL!, applicationID: "convex" }],
} satisfies AuthConfig;
