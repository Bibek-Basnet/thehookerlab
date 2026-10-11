import type { LegalDoc, LegalSlug } from "@/lib/legal";

import { privacyPolicy } from "./privacy-policy";
import { refundAndCancellation } from "./refund-and-cancellation";
import { termsAndConditions } from "./terms-and-conditions";

export const legalDocuments: Record<LegalSlug, LegalDoc> = {
  "privacy-policy": privacyPolicy,
  "terms-and-conditions": termsAndConditions,
  "refund-and-cancellation": refundAndCancellation,
};