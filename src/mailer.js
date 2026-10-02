const nodemailer = require('nodemailer');
const config = require('./config');

const SERVICE_NAMES = {
  notarial: 'Notarial Services',
  'legal-advisory': 'Legal Consultation & Advisory',
  contract: 'Contract Drafting & Review',
  'company-reg': 'Company Registration',
  property: 'Property & Land Transaction',
  'power-of-attorney': 'Power of Attorney',
  'due-diligence': 'Legal Due Diligence',
  'court-docs': 'Court Document Preparation',
  other: 'Other'
};

const SIGNATURE = `
Rutabanks Notary and Legal Services Ltd
Kigali, Rwanda · +250 788 308 526
"Precision in Law. Trust in Service."`;

function createTransport(mail = config.mail) {
  if (mail.host) {
    return nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.secure,
      auth: mail.user ? { user: mail.user, pass: mail.pass } : undefined
    });
  }
  // Development: build the message but print it instead of sending
  return nodemailer.createTransport({ jsonTransport: true });
}

function createMailer({ transport = createTransport(), mail = config.mail, log = console } = {}) {
  async function send(message) {
    try {
      const info = await transport.sendMail({ from: mail.from, ...message });
      if (!mail.host && log)
        log.info(`[mail] (not sent, no SMTP_HOST) to ${message.to}: ${message.subject}`);
      return info;
    } catch (err) {
      // A failed email must never lose the visitor's request, which is already saved
      if (log) log.error('[mail] failed to send:', err.message);
      return null;
    }
  }

  function serviceName(code) {
    return SERVICE_NAMES[code] || 'Not specified';
  }

  return {
    newMessage(msg) {
      const jobs = [
        send({
          to: mail.firmEmail,
          replyTo: msg.email,
          subject: `New website message from ${msg.first_name} ${msg.last_name}`,
          text: [
            `Name: ${msg.first_name} ${msg.last_name}`,
            `Email: ${msg.email}`,
            `Phone: ${msg.phone || '-'}`,
            `Service: ${serviceName(msg.service)}`,
            '',
            msg.message
          ].join('\n')
        }),
        send({
          to: msg.email,
          subject: 'We have received your message',
          text: `Dear ${msg.first_name},\n\nThank you for contacting us. We have received your message and will get back to you within one business day.\n${SIGNATURE}`
        })
      ];
      return Promise.all(jobs);
    },

    newAppointment(appt) {
      const when = `${appt.date} at ${appt.time}`;
      const jobs = [
        send({
          to: mail.firmEmail,
          replyTo: appt.email || undefined,
          subject: `New appointment request: ${when}`,
          text: [
            `Name: ${appt.full_name}`,
            `Phone: ${appt.phone}`,
            `Email: ${appt.email || '-'}`,
            `Service: ${serviceName(appt.service)}`,
            `Requested: ${when}`,
            '',
            appt.notes || '(no notes)'
          ].join('\n')
        })
      ];
      if (appt.email) {
        jobs.push(
          send({
            to: appt.email,
            subject: 'Your appointment request',
            text: `Dear ${appt.full_name},\n\nWe have received your request for an appointment on ${when} (${serviceName(appt.service)}). This is not yet confirmed: we will call you on ${appt.phone} within one business day to confirm.\n${SIGNATURE}`
          })
        );
      }
      return Promise.all(jobs);
    },

    // Tells the client when the firm confirms or cancels their appointment
    appointmentStatusChanged(appt) {
      if (!appt.email || !['confirmed', 'cancelled'].includes(appt.status)) {
        return Promise.resolve([]);
      }
      const when = `${appt.date} at ${appt.time}`;
      const text =
        appt.status === 'confirmed'
          ? `Dear ${appt.full_name},\n\nYour appointment on ${when} (${serviceName(appt.service)}) is confirmed. Please bring a valid ID and the original documents related to your matter.\n\nIf you can no longer come, please call us so we can offer the time to someone else.\n${SIGNATURE}`
          : `Dear ${appt.full_name},\n\nUnfortunately your appointment on ${when} has been cancelled. Please call us or book a new time on our website.\n${SIGNATURE}`;
      return Promise.all([
        send({
          to: appt.email,
          subject:
            appt.status === 'confirmed'
              ? `Appointment confirmed: ${when}`
              : `Appointment cancelled: ${when}`,
          text
        })
      ]);
    }
  };
}

module.exports = { createMailer, createTransport, SERVICE_NAMES };
