const SERVICES = [
  'notarial',
  'legal-advisory',
  'contract',
  'company-reg',
  'property',
  'power-of-attorney',
  'due-diligence',
  'court-docs',
  'other'
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Digits with optional leading +, spaces, dashes or brackets; 9 to 15 digits in total
const PHONE_RE = /^\+?[\d\s\-()]+$/;

function clean(value, max = 500) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function isEmail(value) {
  return EMAIL_RE.test(value) && value.length <= 254;
}

function isPhone(value) {
  const digits = value.replace(/\D/g, '');
  return PHONE_RE.test(value) && digits.length >= 9 && digits.length <= 15;
}

function validateContact(body = {}) {
  const data = {
    first_name: clean(body.first_name, 80),
    last_name: clean(body.last_name, 80),
    email: clean(body.email, 254),
    phone: clean(body.phone, 30),
    service: clean(body.service_inquiry, 40),
    message: clean(body.message, 2000)
  };
  const errors = {};

  if (!data.first_name) errors.first_name = 'Please enter your first name.';
  if (!data.last_name) errors.last_name = 'Please enter your last name.';
  if (!data.email) errors.email = 'Please enter your email address.';
  else if (!isEmail(data.email)) errors.email = 'Please enter a valid email address.';
  if (data.phone && !isPhone(data.phone)) errors.phone = 'Please enter a valid phone number.';
  if (data.service && !SERVICES.includes(data.service)) {
    errors.service_inquiry = 'Please choose a service from the list.';
  }
  if (!data.message) errors.message = 'Please enter your message.';
  else if (data.message.length < 10)
    errors.message = 'Please tell us a little more (at least 10 characters).';
  if (!hasConsent(body)) errors.consent = CONSENT_ERROR;

  return { data, errors, valid: Object.keys(errors).length === 0 };
}

const CONSENT_ERROR = 'Please agree to the privacy policy so we can process your request.';

function hasConsent(body) {
  return body.consent === 'yes' || body.consent === true;
}

// Honeypot: the hidden "website" field is only ever filled in by bots
function isSpam(body = {}) {
  return typeof body.website === 'string' && body.website.trim() !== '';
}

module.exports = { SERVICES, clean, isEmail, isPhone, hasConsent, isSpam, validateContact };
