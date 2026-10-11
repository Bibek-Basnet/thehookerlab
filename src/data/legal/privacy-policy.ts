import type { LegalDoc } from "@/lib/legal";

import { legal } from "./shared";

export const privacyPolicy: LegalDoc = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  description:
    "How The Hooker Lab collects, uses, stores, shares and protects personal information under the New Zealand Privacy Act 2020.",
  intro: [
    `This Privacy Policy explains how ${legal.operatorLine} collects, uses, stores, shares and protects personal information. It applies to ${legal.website}, to enquiries you send us, and to the coaching, workshops and other services we provide.`,
    `We have set it out in numbered clauses so that you can find what you need easily. If anything is unclear, please contact us using the details at the end of this policy.`,
  ],
  sections: [
    {
      id: "about",
      title: "About this policy",
      clauses: [
        `This Privacy Policy explains how ${legal.operatorLine} ("${legal.brand}", "we", "us" or "our") collects, uses, stores, shares and protects personal information when you visit ${legal.website}, send us an enquiry, or take part in our coaching, workshops and online programme.`,
        `We comply with the Privacy Act 2020 of New Zealand and the Information Privacy Principles set out in that Act.`,
        `In this policy, "personal information" means information about an identifiable individual.`,
        `By using our website or giving us your personal information, you acknowledge that you have read and understood this policy. If you do not agree with it, please do not use the website or send us personal information.`,
      ],
    },
    {
      id: "responsibility",
      title: "Who is responsible for your information",
      clauses: [
        `${legal.brand} is the agency that collects and holds personal information through this website and our services.`,
        `Our privacy officer is ${legal.operator}. You can contact our privacy officer at ${legal.email}.`,
      ],
    },
    {
      id: "collect",
      title: "Information we collect",
      clauses: [
        {
          text: `When you send an enquiry through our website form, we collect the information you choose to give us, which may include:`,
          items: [
            `your name and email address`,
            `your phone or WhatsApp number (required only if you ask us to reply by phone or WhatsApp)`,
            `who you are, for example a player, parent or guardian, coach, school, club, academy or provincial union`,
            `the name of your school, club or organisation`,
            `how you would like us to reply`,
            `the type of service you are enquiring about and, for workshops, the focus areas you are interested in`,
            `the age group, playing level and size of the player or group`,
            `where you are based and when you would like to start`,
            `the message you write to us`,
          ],
        },
        `We also record your consent choices, including whether you agree to be contacted about your enquiry and whether you would like updates about the online programme, together with the page the enquiry was sent from and the date and time it was submitted.`,
        `If you contact us by email, WhatsApp, phone or social media, such as Instagram, we collect the information you send us, including your contact details and the content of your messages.`,
        {
          text: `If you book a service, we may also collect information needed to deliver it safely and effectively, such as:`,
          items: [
            `the names and ages of participants and the contact details of a parent or guardian`,
            `an emergency contact`,
            `injuries, medical conditions or other health information that you choose to tell us about because it affects safe participation`,
            `coaching notes, progress information and feedback`,
            `booking, invoice and payment records`,
          ],
        },
        `Our website does not currently take card payments. If we introduce online payments, card details will be handled by our payment provider and will not be stored by us.`,
        `When you visit our website, we and our service providers may automatically collect technical information such as your IP address, browser type, device type, the pages you view and the time of your visit.`,
        `You do not have to give us your personal information. However, if you choose not to, we may not be able to reply to your enquiry or provide our services.`,
      ],
    },
    {
      id: "children",
      title: "Children and young people",
      clauses: [
        `Many of our participants are under 18. We ask a parent or guardian to send an enquiry for, and to give consent on behalf of, any player under 18.`,
        `We collect information about a child from their parent or guardian, or with the knowledge and agreement of their parent or guardian, unless that is not reasonably practicable.`,
        `We do not knowingly collect personal information directly from a child through this website. If we learn that we have done so without the involvement of a parent or guardian, we will take reasonable steps to delete it or to obtain appropriate consent.`,
        `A parent or guardian may ask to access, correct or delete the information we hold about their child, as described in the section headed Your rights.`,
      ],
    },
    {
      id: "use",
      title: "Why we collect and how we use information",
      clauses: [
        {
          text: `We collect and use personal information to:`,
          items: [
            `reply to your enquiry and talk with you about your needs`,
            `arrange, deliver and tailor coaching, workshops, sessions and the online programme`,
            `confirm bookings, send reminders and manage scheduling, changes and cancellations`,
            `prepare quotes and invoices, process payments and manage refunds`,
            `keep participants safe, including responding to an injury or emergency`,
            `give feedback on development to the participant, their parent or guardian, or their school, club or union where appropriate`,
            `operate, secure and improve our website and services`,
            `send you updates about the online programme or other services, only where you have agreed to receive them`,
            `protect our website and business from spam, abuse and fraud`,
            `meet our legal, tax and record-keeping obligations`,
          ],
        },
        `We use personal information only for the purposes for which we collected it, for directly related purposes, or as otherwise permitted by the Privacy Act 2020.`,
        `We do not sell personal information.`,
        `We do not use personal information to make automated decisions that significantly affect you.`,
      ],
    },
    {
      id: "sharing",
      title: "Sharing and disclosure",
      clauses: [
        {
          text: `We may share personal information with trusted service providers who help us run our website and business, such as providers of:`,
          items: [
            `website hosting and security`,
            `email delivery and enquiry management, including the admin system we use to receive and manage enquiries`,
            `scheduling, accounting and payment processing`,
            `website analytics`,
          ],
        },
        `We give these providers only the information they need to perform their services, and we require them to protect it and to use it only for our purposes.`,
        `If you book through a school, club, academy or provincial union, we may share information about attendance, progress and feedback with that organisation where it is relevant to the coaching and where a parent or guardian is aware of it.`,
        `We may disclose personal information where the law requires or permits us to, including to a court, regulator or the police, or where we reasonably believe it is necessary to prevent or lessen a serious threat to a person's life or health.`,
        `If our business is sold or restructured, personal information may be transferred to the new owner, who will be required to handle it in line with this policy.`,
        `We will not publish photographs or video in which a participant can be identified without consent, as set out in our Terms and Conditions.`,
      ],
    },
    {
      id: "overseas",
      title: "Storing information overseas",
      clauses: [
        `Some of our service providers store or process information on servers outside ${legal.country}. Where that happens, we take reasonable steps to ensure the information is protected by safeguards comparable to those in the Privacy Act 2020.`,
      ],
    },
    {
      id: "security",
      title: "Security and retention",
      clauses: [
        {
          text: `We take reasonable steps to protect personal information from loss, misuse and unauthorised access, including:`,
          items: [
            `using secure, encrypted connections (HTTPS) on our website`,
            `limiting access to personal information to people who need it`,
            `using reputable hosting and software providers`,
            `using spam protection on our enquiry form`,
          ],
        },
        `No method of transmission over the internet or electronic storage is completely secure, so we cannot guarantee absolute security.`,
        {
          text: `We keep personal information only for as long as we need it for the purposes described in this policy, or as the law requires. In general:`,
          items: [
            `enquiries that do not lead to a booking are kept for up to ${legal.policy.enquiryRetentionMonths} months after our last contact with you`,
            `coaching and participation records are kept while the participant is active with us and for a reasonable period afterwards`,
            `financial and tax records are kept for seven years, as required by New Zealand law`,
          ],
        },
        `When we no longer need personal information, we delete it or remove the details that identify you.`,
        `If a privacy breach occurs that is likely to cause serious harm, we will notify the affected individuals and the Office of the Privacy Commissioner as required by the Privacy Act 2020.`,
      ],
    },
    {
      id: "cookies",
      title: "Cookies and similar technologies",
      clauses: [
        `Our website may use cookies and similar technologies, such as local storage, to make the website work, to remember your preferences and to understand how the website is used.`,
        `You can control cookies through your browser settings. If you block essential cookies, parts of the website, including the enquiry form, may not work properly.`,
        `If we add analytics or marketing tools that use cookies, we will update this policy and, where appropriate, ask for your consent.`,
      ],
    },
    {
      id: "marketing",
      title: "Marketing and communications",
      clauses: [
        `We will send you marketing messages, such as updates about the online programme, only if you have agreed to receive them, in line with the Unsolicited Electronic Messages Act 2007.`,
        `Every marketing message will include a way to unsubscribe, and you can also opt out at any time by emailing ${legal.email}.`,
        `We may still send you service messages that are necessary to respond to your enquiry or to manage a booking, such as replies, confirmations, reminders and changes. These are not marketing messages.`,
      ],
    },
    {
      id: "rights",
      title: "Your rights",
      clauses: [
        {
          text: `Under the Privacy Act 2020 you have the right to:`,
          items: [
            `ask whether we hold personal information about you`,
            `access the personal information we hold about you`,
            `ask us to correct personal information that is wrong or out of date`,
          ],
        },
        `We will respond to your request within 20 working days of receiving it. We may need to confirm your identity before we release or change information.`,
        `We may refuse a request, in whole or in part, where the Privacy Act 2020 allows us to. If we do, we will explain why.`,
        `We do not usually charge for access requests. If the law allows us to charge, we will tell you before we do.`,
        `You can withdraw your consent to optional uses of your information, such as marketing messages, at any time.`,
        `A parent or guardian may make a request on behalf of a child.`,
        `To make a request, contact our privacy officer using the details at the end of this policy.`,
      ],
    },
    {
      id: "links",
      title: "Links to other websites",
      clauses: [
        `Our website may link to other websites and services, such as Instagram and WhatsApp. We are not responsible for the privacy practices of those third parties, and we encourage you to read their privacy policies.`,
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      clauses: [
        `We may update this policy from time to time. The updated version will be published on this page with a new "last updated" date.`,
        `If we make a significant change, we will take reasonable steps to bring it to your attention.`,
      ],
    },
    {
      id: "contact",
      title: "Complaints and contact details",
      clauses: [
        `If you have a question or concern about how we handle your personal information, please contact us first so that we can try to resolve it.`,
        `Privacy officer: ${legal.operator}, ${legal.brand}. Email: ${legal.email}. WhatsApp: ${legal.whatsapp}.`,
        `If you are not satisfied with our response, you may complain to the Office of the Privacy Commissioner at www.privacy.org.nz.`,
      ],
    },
  ],
};