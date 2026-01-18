const disposableEmailDomains = [
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "mailinator.com",
  "10minutemail.com",
  "throwaway.email",
  "fakeinbox.com",
  "trashmail.com",
  "mailnesia.com",
  "tempinbox.com",
  "dispostable.com",
  "maildrop.cc",
  "yopmail.com",
  "sharklasers.com",
  "getnada.com",
  "emailondeck.com",
  "tempr.email",
  "discard.email",
  "spamgourmet.com",
  "mytrashmail.com",
  "mailcatch.com",
  "getairmail.com",
  "burnermail.io",
  "temp.email",
  "mohmal.com",
];

// Allowed email providers (whitelist approach)
const allowedDomains = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "protonmail.com",
  "aol.com",
  "zoho.com",
];


export function isValidEmailFormat(email) {
  if (!email || typeof email !== "string") return false;
  const regex = /^[\w.+-]+@[\w.-]+\.\w{2,}$/;
  return regex.test(email.trim().toLowerCase());
}


export function isDisposableEmail(email) {
  if (!email) return true;
  const domain = email.split("@")[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain);
}


export function isAllowedEmailProvider(email, strictMode = false) {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase();

  if (strictMode) {
    return allowedDomains.includes(domain);
  }

  return !isDisposableEmail(email);
}


export function validateEmail(email, options = {}) {
  const { strictMode = false, allowedDomainsOnly = false } = options;

  if (!email || typeof email !== "string") {
    return { valid: false, reason: "Email is required" };
  }

  const cleanEmail = email.trim().toLowerCase();

  if (!isValidEmailFormat(cleanEmail)) {
    return { valid: false, reason: "Invalid email format" };
  }

  if (isDisposableEmail(cleanEmail)) {
    return {
      valid: false,
      reason: "Disposable email addresses are not allowed",
    };
  }

  if (allowedDomainsOnly && !isAllowedEmailProvider(cleanEmail, true)) {
    return {
      valid: false,
      reason: "Please use a major email provider (Gmail, Outlook, Yahoo, etc.)",
    };
  }

  return { valid: true };
}


export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return false;
  const domain = email.split("@")[1].toLowerCase();
  return domain === "gmail.com" || domain === "googlemail.com";
}
