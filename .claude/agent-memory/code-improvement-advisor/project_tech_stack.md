---
name: Project Tech Stack and Architecture
description: Core tech choices and architectural patterns observed in app-ui — relevant when suggesting Next.js, auth, or UI improvements
type: project
---

Next.js (App Router, standalone output) + TypeScript + Tailwind CSS + shadcn/ui. Toast notifications via sonner. Icons via lucide-react.

Auth is handled by a custom AuthProvider (contexts/auth-context.tsx) that wraps the app. Supports three flows: SSO (fetchLoginURL redirect), OTP-based sign-in (admin + member roles), and OTP-based signup/org-retrieval. Tokens are stored in localStorage. Return URL is stored in sessionStorage under key "return_url".

The API is proxied via Next.js rewrites in next.config.ts — hardcoded to localhost:10000 with a TODO comment about using an env var.

**Why:** Relevant for evaluating config hygiene, auth patterns, and page-level routing decisions.
**How to apply:** When reviewing auth-related code, note that the callback pattern (successTask/errorTask) is the established convention in this codebase, not a smell. When reviewing next.config.ts, the missing env var usage is a known gap.
