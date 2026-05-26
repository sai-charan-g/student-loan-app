/**
 * Dead Lead Detection Constants
 *
 * These are the heuristics used to identify invalid, fake, or junk applications.
 * Each rule has a confidence level and a description of why it matters.
 *
 * In production, these would be continuously updated based on observed patterns.
 */

// Disposable / temporary email providers commonly used for fake signups
export const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.info',
  'grr.la',
  'guerrillamail.de',
  'tempmail.com',
  'throwaway.email',
  'temp-mail.org',
  'fakeinbox.com',
  'sharklasers.com',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'yopmail.com',
  'yopmail.fr',
  'trashmail.com',
  'trashmail.me',
  'trashmail.net',
  'dispostable.com',
  'maildrop.cc',
  'mailnesia.com',
  'tempail.com',
  'tempr.email',
  'discard.email',
  'discardmail.com',
  'getairmail.com',
  'getnada.com',
  'binkmail.com',
  'safetymail.info',
  'mailcatch.com',
  '10minutemail.com',
  'tempinbox.com',
  'mohmal.com',
  'burpcollaborator.net',
  'temp.email',
  'emailondeck.com',
  'mintemail.com',
];

// Minimum form completion time in seconds — anything faster is likely a bot
export const MIN_FORM_COMPLETION_SECONDS = 30;

// Maximum loan amount thresholds by education level (in INR)
export const MAX_LOAN_THRESHOLDS: Record<string, number> = {
  undergraduate: 10000000, // ₹1 Crore
  postgraduate: 20000000, // ₹2 Crore
  doctorate: 15000000, // ₹1.5 Crore
  diploma: 5000000, // ₹50 Lakhs
  default: 30000000, // ₹3 Crore absolute max
};

// Age constraints
export const MIN_AGE = 16;
export const MAX_AGE = 55;
