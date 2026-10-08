# Admin Guide

This guide is for staff at Rutabanks Notary and Legal Services Ltd who manage website messages and appointments.

## Signing in

1. Go to **`/admin`** on the website (for example `https://www.your-site.rw/admin`).
2. Enter your email and password, then click **Sign in**.
3. When you're done, click **Sign out** at the top right, especially on a shared computer.

You stay signed in for up to 8 hours. After 10 wrong attempts, sign-in is blocked for 15 minutes.

Forgotten your password? Ask the person who manages the website to reset it (see *Creating accounts* below).

## Overview

The first page shows two numbers:

- **Appointments waiting for confirmation**: new requests you still need to confirm.
- **New messages**: contact form messages nobody has read yet.

Click either box to go straight to that list.

## Appointments

Go to **Appointments** in the top menu.

- **Show** chooses *Upcoming* (today and later) or *Past*.
- **Status** shows only appointments with that status.

Each appointment shows the date and time, the client's name and phone number (click it to call), email, the service and any notes.

### What each status means

| Status | Meaning |
|---|---|
| **Pending** | The client asked for this time. Nobody has confirmed it yet. The time is held for them. |
| **Confirmed** | You have spoken to the client and the appointment will go ahead. |
| **Completed** | The appointment took place. |
| **Cancelled** | The appointment won't happen. The time becomes free for others to book. |

### Daily routine

1. Open **Appointments** and filter by **Pending**.
2. Call each client to check the time still suits them. The website promises a call **within one business day**.
3. Click **Confirm**. If the client gave an email address, they automatically get a confirmation email asking them to bring their ID and original documents.
4. After the meeting, click **Mark done**.

If a client can't come, click **Cancel** (you'll be asked to confirm). They get an email if they gave an address. **Reopen** puts a cancelled appointment back to pending, unless someone else has booked that time in the meantime.

## Messages

Go to **Messages** in the top menu.

- **Inbox** shows new and read messages, **Unread** only new ones, **Archived** the ones you've put away.
- Click the email address to reply, or the phone number to call.
- Click **Mark as read** once someone has handled it, and **Archive** when it's finished.

New messages and appointment requests are also emailed to the firm's address, so you can reply straight from your email.

## Privacy reminders

- Only use visitors' details to answer their request (see the website's Privacy Policy).
- The Privacy Policy promises that website enquiries are deleted after 12 months. Ask the website manager to remove old records.
- Never share your admin password, and sign out on shared computers.

## Creating accounts (for the website manager)

On the server, run:

```bash
npm run admin:create -- --email staff@example.com --name "Full Name"
```

and enter a password of at least 10 characters. Running the same command for an existing email resets that person's password and signs them out everywhere.
