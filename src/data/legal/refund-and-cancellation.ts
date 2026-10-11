import type { LegalDoc } from "@/lib/legal";

import { legal } from "./shared";

const { policy } = legal;

export const refundAndCancellation: LegalDoc = {
  slug: "refund-and-cancellation",
  title: "Refund and Cancellation Policy",
  description:
    "How cancellations, rescheduling and refunds work for The Hooker Lab coaching, workshops and online programme, including your rights under New Zealand consumer law.",
  intro: [
    `This policy explains how cancellations, rescheduling and refunds work for the Services provided by ${legal.operatorLine}. It forms part of our Terms and Conditions.`,
    `Nothing in this policy limits your rights under the Consumer Guarantees Act 1993 or the Fair Trading Act 1986.`,
  ],
  sections: [
    {
      id: "about",
      title: "About this policy",
      clauses: [
        `This policy applies to every booking for individual coaching, small group coaching, school and club coaching, provincial and union development, workshops and the Online Programme.`,
        `Words used in this policy have the same meaning as in our Terms and Conditions. A "working day" means a day other than a Saturday, a Sunday or a public holiday in ${legal.country}.`,
        `Where a written quote or booking confirmation sets out different cancellation terms for a particular booking, those terms apply to that booking.`,
      ],
    },
    {
      id: "individual",
      title: "Cancelling an individual or small group session",
      clauses: [
        `If you give us at least ${policy.individualNoticeHours} hours' notice before the start of the Session, you will receive a full refund or, if you prefer, a credit or a new time.`,
        `If you give us less than ${policy.individualNoticeHours} hours' notice, we may charge up to the full Session fee, because the time was reserved for you and could not be offered to anyone else.`,
        `Notice must be given by email or message to ${legal.email} or ${legal.whatsapp}. The notice period is counted from the time we receive your message.`,
        `We may waive a late cancellation charge in a genuine emergency, such as illness, injury or a family emergency, at our discretion.`,
      ],
    },
    {
      id: "group",
      title: "Cancelling a workshop, school, club, academy or union booking",
      clauses: [
        `If you give us at least ${policy.groupNoticeDays} days' notice before the start of the booking, you will receive a full refund of the fees you have paid, less any non-refundable costs we have already incurred and told you about in writing.`,
        `If you give us less than ${policy.groupNoticeDays} days' notice, we may charge a cancellation fee that reflects the time reserved and the costs incurred, up to the full fee. We will tell you how that fee is worked out before we confirm the booking.`,
        `If a deposit is required, it will be stated in the quote. A deposit is treated as part payment and is refunded in line with the clauses above, unless the quote says it is non-refundable.`,
        `If fewer Participants attend than were booked, the fee is as quoted for the booking, unless we agree otherwise in writing before the Session.`,
      ],
    },
    {
      id: "reschedule",
      title: "Rescheduling",
      clauses: [
        `You may reschedule a Session at no charge if you give us at least ${policy.individualNoticeHours} hours' notice for an individual or small group Session, or at least ${policy.groupNoticeDays} days' notice for a workshop or an organisation booking, subject to our availability.`,
        `A rescheduled Session must take place within ${policy.rescheduleWindowDays} days of the original date, unless we agree otherwise. If we cannot find a time that suits both of us within that period, we will refund the fee for that Session.`,
        `Rescheduling requests made with less notice are treated as late cancellations, but we will consider them fairly.`,
      ],
    },
    {
      id: "noshow",
      title: "Late arrivals and no-shows",
      clauses: [
        `If a Participant arrives late, the Session still finishes at its scheduled time. There is no reduction in the fee or refund for time missed.`,
        `If a Participant does not attend and we have not been given notice, the full fee is payable and no refund or credit is given.`,
      ],
    },
    {
      id: "ours",
      title: "If we cancel or change a session",
      clauses: [
        `We may need to cancel or reschedule a Session because of illness, injury, travel disruption, venue unavailability, unsafe conditions or other circumstances beyond our control.`,
        {
          text: `If we cancel a Session, we will tell you as soon as we reasonably can and offer you the choice of:`,
          items: [
            `a new time at no extra cost`,
            `a credit towards a future Session`,
            `a full refund of the fee for the cancelled Session`,
          ],
        },
        `If we change the time or location of a Session and the new arrangements do not suit you, you may cancel and receive a full refund for the affected Session.`,
        `Except where the law requires, we are not responsible for your other costs, such as travel or accommodation, if a Session is cancelled or changed.`,
      ],
    },
    {
      id: "weather",
      title: "Weather, venue and safety",
      clauses: [
        `Outdoor Sessions normally go ahead in light rain. We may stop, move or reschedule a Session in conditions we judge to be unsafe, such as lightning, heavy rain, extreme heat or cold, or unsafe ground. The coach's decision is final.`,
        `If we cancel a Session before it begins because of weather or an unsafe venue, we will offer a new time, a credit or a refund, as set out above.`,
        `If a Session is stopped part way for safety reasons after at least half of its scheduled time has been delivered, it is treated as delivered. If less than half has been delivered, we will offer a new time or a credit for the remaining time.`,
      ],
    },
    {
      id: "illness",
      title: "Injury, illness and medical reasons",
      clauses: [
        `If a Participant is injured or unwell, please tell us as soon as possible. We will consider a new time or a credit instead of charging the Session fee.`,
        `For a refund outside the notice periods above, we may reasonably ask for evidence, such as a medical certificate.`,
        `Participants must not attend a Session if they are contagious.`,
      ],
    },
    {
      id: "blocks",
      title: "Block bookings and multiple sessions",
      clauses: [
        `Sessions bought as a block or package may be used within the validity period stated in your booking confirmation.`,
        `If you cancel a block booking, we will refund the unused Sessions, calculated at our standard single Session rate, less any discount you received on Sessions already used.`,
        `Sessions that are not used within the validity period expire, and no refund is given for them, except where the law requires otherwise.`,
      ],
    },
    {
      id: "online",
      title: "Online Programme",
      clauses: [
        `The Online Programme is in development. Refund terms for it will be published on its purchase page before it is offered for sale, and will apply together with this policy.`,
        `Whatever those terms say, if the Online Programme is faulty, does not match its description, or cannot be accessed, you have the remedies that the Consumer Guarantees Act 1993 gives you, which may include repair, replacement or a refund.`,
        `The law does not require a refund if you simply change your mind about digital content. If we offer a change-of-mind refund period, it will be stated clearly at the time of purchase and we will honour it.`,
        `If a subscription is offered, you may cancel at any time and cancellation takes effect at the end of the current billing period. We do not refund part-used periods unless the purchase page says so or the law requires it.`,
      ],
    },
    {
      id: "rights",
      title: "Your rights under consumer law",
      clauses: [
        `Under the Consumer Guarantees Act 1993, services must be provided with reasonable care and skill, must be fit for any particular purpose you have made known to us, and must be provided within a reasonable time.`,
        `If a service does not meet these guarantees, you may be entitled to have the problem fixed, to a reduction in price, or to cancel the service and receive a refund, depending on how serious the problem is.`,
        `If you acquire Services for the purposes of a business, clause 13 of our Terms and Conditions, which deals with consumer guarantees and liability, applies.`,
        `This policy does not apply to the extent that it is inconsistent with the law.`,
      ],
    },
    {
      id: "request",
      title: "How to request a cancellation or refund",
      clauses: [
        {
          text: `Please email ${legal.email}, or message ${legal.whatsapp}, and include:`,
          items: [
            `your name and the name of the Participant`,
            `the date and time of the booking`,
            `the reason, if you wish to give one`,
            `whether you would like a refund, a credit or a new time`,
          ],
        },
        `We will respond as soon as we reasonably can and will explain our decision in writing.`,
      ],
    },
    {
      id: "payment",
      title: "How refunds are paid",
      clauses: [
        `Refunds are paid to the original payment method. If that is not possible, we will pay by bank transfer to an account you give us.`,
        `We process approved refunds within ${policy.refundWorkingDays} working days. Your bank or payment provider may need extra time to show the refund in your account.`,
        `Credits are non-transferable, are valid for the period stated when the credit is issued, and cannot be exchanged for cash, except where the law requires.`,
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      clauses: [
        `We may update this policy from time to time. The updated version will be published on this page with a new "last updated" date.`,
        `For a booking that is already confirmed, the policy in force when you booked continues to apply, unless the law requires otherwise or you agree to the change.`,
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      clauses: [
        `${legal.operatorLine}. Email: ${legal.email}. WhatsApp: ${legal.whatsapp}.`,
      ],
    },
  ],
};