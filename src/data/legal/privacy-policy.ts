import type { LegalDoc } from "@/lib/legal";

import { legal } from "./shared";

export const privacyPolicy: LegalDoc = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  layout: "plain",
  description:
    "How The Hooker Lab collects, uses, stores, shares and protects personal information under the New Zealand Privacy Act 2020.",
  intro: [
    `The Hooker Lab Limited ("The Hooker Lab", "we", "us" or "our"), is committed to protecting your privacy and handling personal information in accordance with the Privacy Act 2020.`,
    `This Privacy Policy explains what information we collect, how we use it, who we share it with, and your rights.`,
    `Words used in this policy have the same meaning as in our Terms and Conditions.`,
  ],
  sections: [
    {
      id: "collect",
      title: "What information we collect",
      clauses: [
        {
          text: `We may collect:`,
          items: [
            `your name, email address, phone number and postal address;`,
            `the name, age and emergency contact details of Participants;`,
            `information provided in enquiries, bookings and communications with us;`,
            `payment and invoicing information;`,
            `health, injury, allergy or medical information that is relevant to safe participation in our Services;`,
            `a record of Services provided to you, including coaching notes relating to your participation;`,
            `photographs and video recordings where you have consented or where they are reasonably required for coaching analysis and feedback;`,
            `information about your use of our Website, including technical information such as IP address, browser type and pages visited;`,
            `account and login details for the Online Programme, if offered.`,
          ],
        },
      ],
    },
    {
      id: "how-we-collect",
      title: "How we collect information",
      clauses: [
        {
          text: `We collect information when you:`,
          items: [
            `submit an enquiry through our Website;`,
            `make a booking;`,
            `contact us by email, phone, WhatsApp or social media;`,
            `participate in a coaching session, workshop or programme;`,
            `provide health or safety information;`,
            `subscribe to updates or marketing communications; or`,
            `use our Website or Online Programme.`,
          ],
        },
      ],
    },
    {
      id: "use",
      title: "Why we collect and use information",
      clauses: [
        {
          text: `We use personal information to:`,
          items: [
            `provide coaching, workshops and related services;`,
            `manage bookings and communicate with clients and participants;`,
            `process payments and issue invoices;`,
            `maintain health and safety during Sessions;`,
            `provide coaching feedback and performance analysis;`,
            `administer and improve our Website and Services;`,
            `respond to enquiries and requests;`,
            `comply with legal obligations;`,
            `send service-related communications; and`,
            `send marketing communications where permitted by law or where you have agreed to receive them.`,
          ],
        },
        `If you do not provide us with the relevant information, we may not be able to provide our services to you.`,
      ],
    },
    {
      id: "health",
      title: "Health information",
      clauses: [
        `Some information we collect may be health information, such as injuries, allergies or medical conditions.`,
        `We only collect this information where it is reasonably necessary to provide our Services safely. We take reasonable steps to protect this information and will only use it for purposes connected with the Participant's wellbeing and participation. This includes disclosing the information to a medical professional and/or the Participant’s emergency contact in the event of an accident.`,
      ],
    },
    {
      id: "parental-consent",
      title: "Parental Consent",
      clauses: [
        `Where a Participant is under 18 years of age, a parent or legal guardian must provide the personal information relating to that Participant and consent to The Hooker Lab collecting, using, storing and disclosing that information for the purposes described in this Privacy Policy.`,
        {
          text: `By registering or booking Services on behalf of a Participant under 18 years of age, the parent or guardian confirms that they:`,
          items: [
            `have authority to provide the Participant's personal information;`,
            `consent to The Hooker Lab collecting and using the Participant's personal information for the administration and delivery of the Services;`,
            `consent to The Hooker Lab collecting any health or medical information reasonably required to ensure the Participant's safe participation in the Services;`,
            `acknowledge that photographs and video recordings may be taken for coaching, training and performance analysis purposes; and`,
            `understand that any publication of photographs or video recordings in which the Participant can be identified will only occur with separate consent where required.`,
          ],
        },
        `Parents and guardians may request access to, or correction of, a Participant's personal information by contacting us using the details set out in this Privacy Policy.`,
      ],
    },
    {
      id: "media",
      title: "Photographs and video",
      clauses: [
        `We may take photographs or video recordings of Sessions for coaching analysis and feedback.`,
        `We will not publish photographs or videos in which a Participant can be identified on our Website, social media channels or marketing materials without appropriate consent. Where the Participant is under 18, consent will be obtained from a parent or guardian.`,
        `You may withdraw consent for future use at any time by contacting us.`,
      ],
    },
    {
      id: "disclosure",
      title: "Disclosure of information",
      clauses: [
        `We do not sell personal information.`,
        {
          text: `We may disclose personal information:`,
          items: [
            `to coaches, contractors or service providers who assist us in providing our Services;`,
            `to payment providers and professional advisers;`,
            `where required by law;`,
            `where necessary to protect someone's health or safety; or`,
            `with your consent.`,
          ],
        },
        `Any third-party service provider must only use the information for the purpose for which it was provided.`,
      ],
    },
    {
      id: "security",
      title: "Storage and security",
      clauses: [
        `We take reasonable steps to protect personal information against loss, misuse, unauthorised access, disclosure or alteration.`,
        `Information may be stored electronically using reputable cloud-based systems and service providers.`,
        `While we take reasonable security measures, no electronic transmission or storage system can be guaranteed to be completely secure.`,
      ],
    },
    {
      id: "cookies",
      title: "Website cookies and analytics",
      clauses: [
        `Our Website may use cookies and analytics tools to help us understand how visitors use the Website, improve functionality and enhance user experience.`,
        `You can adjust your browser settings to refuse cookies, although this may affect some Website functionality.`,
      ],
    },
    {
      id: "marketing",
      title: "Marketing communications",
      clauses: [
        `We may send you information about our Services, events and programmes.`,
        `You may unsubscribe from marketing communications at any time by following the unsubscribe instructions or contacting us.`,
      ],
    },
    {
      id: "access",
      title: "Access and correction",
      clauses: [
        `You may request access to your personal information and request correction of any information that is inaccurate, incomplete or out of date.`,
        `Requests can be made by contacting us using the details below.`,
      ],
    },
    {
      id: "retention",
      title: "Retention",
      clauses: [
        `We keep personal information only for as long as it is required for the purposes for which it was collected, or as required by law.`,
        `When information is no longer required, we will take reasonable steps to securely delete or anonymise it.`,
      ],
    },
    {
      id: "complaints",
      title: "Privacy complaints",
      clauses: [
        `If you have a privacy concern or complaint, please contact us first so that we can attempt to resolve the issue.`,
        `If you are not satisfied with our response, you may contact the Office of the Privacy Commissioner.`,
      ],
    },
    {
      id: "changes",
      title: "Changes to this Privacy Policy",
      clauses: [
        `We may update this Privacy Policy from time to time. The latest version will be published on our Website with the updated effective date.`,
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      clauses: [
        `The Hooker Lab`,
        `Operated by Kurt Eklund`,
        `Email: ${legal.email}`,
        `Website: ${legal.website}`,
      ],
    },
  ],
};
