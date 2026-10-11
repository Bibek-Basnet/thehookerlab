import type { LegalDoc } from "@/lib/legal";

import { legal } from "./shared";

export const termsAndConditions: LegalDoc = {
  slug: "terms-and-conditions",
  title: "Terms and Conditions",
  description:
    "The terms that apply to using the The Hooker Lab website and to its coaching, workshops and online programme in New Zealand.",
  intro: [
    `These Terms and Conditions apply to your use of ${legal.website} and to the coaching, workshops and other services provided by ${legal.operatorLine}. Please read them carefully before you send an enquiry or make a booking.`,
    `They should be read together with our Privacy Policy and our Refund and Cancellation Policy, which form part of these terms.`,
  ],
  sections: [
    {
      id: "about",
      title: "About these terms",
      clauses: [
        `These terms apply to your use of ${legal.website} (the "Website") and to all services provided by ${legal.operatorLine} ("${legal.brand}", "we", "us" or "our").`,
        `By using the Website, sending an enquiry or making a booking, you agree to these terms. If you do not agree, please do not use the Website or our services.`,
        `If you make a booking on behalf of another person or an organisation, such as a child, a team, a school or a club, you confirm that you have authority to do so and to accept these terms on their behalf.`,
        `If we give you a written quote, booking confirmation or agreement for a particular service, that document also applies. If it conflicts with these terms, it prevails to the extent of the conflict.`,
      ],
    },
    {
      id: "definitions",
      title: "Definitions",
      clauses: [
        {
          text: `In these terms:`,
          items: [
            `"Services" means individual hooker coaching, small group coaching, school and club coaching, provincial and union development, hooker workshops, the Online Programme and any related coaching or education we provide`,
            `"Participant" means a person who receives coaching or takes part in a Session`,
            `"Client" means the person or organisation that books or pays for Services, who may be a Participant, a parent or guardian, a school, a club, an academy, a provincial union or another organisation`,
            `"Session" means an individual session, a group session, a workshop or any other scheduled coaching activity`,
            `"Online Programme" means our digital coaching programme, including drills, resources and education, if and when it is made available`,
          ],
        },
      ],
    },
    {
      id: "services",
      title: "Our services",
      clauses: [
        `We provide specialist rugby hooker coaching and related Services. Descriptions on the Website are general. The content, length, location and format of a Session are confirmed when you book.`,
        `We will provide the Services with reasonable care and skill.`,
        `We tailor Services to the age, experience and needs of the Participants. We do not guarantee any particular result, because results depend on many factors, including each Participant's effort, ability and circumstances.`,
        `Services are subject to our availability. We may decline an enquiry or booking.`,
      ],
    },
    {
      id: "bookings",
      title: "Enquiries and bookings",
      clauses: [
        `Sending an enquiry is not a booking and does not create a contract.`,
        `A booking is confirmed only when we confirm it in writing, by email or message, with the date, time, location and fee.`,
        `You must give us accurate and complete information when you enquire or book, and you are responsible for keeping it up to date.`,
        `For group bookings, the Client is responsible for the number of Participants, access to the venue and the supervision and arrangements agreed with us in writing.`,
        `We may decline or cancel a booking if information is inaccurate, if it is unsafe to proceed, or if we are unable to provide the Services.`,
      ],
    },
    {
      id: "fees",
      title: "Fees and payment",
      clauses: [
        `Fees are as quoted in writing or shown on the Website. Prices are in New Zealand dollars unless stated otherwise, and we will tell you whether a quoted price includes GST.`,
        `Payment terms, including the due date and accepted payment methods, are set out in the quote or invoice. We may require payment, or a deposit, in advance.`,
        `If a payment is overdue, we may suspend the Services until it is paid and, to the extent the law allows, recover the reasonable costs of collecting it.`,
        `We may change our fees for future bookings. A confirmed booking keeps the fee agreed at the time of booking.`,
        `Cancellations, rescheduling and refunds are governed by our Refund and Cancellation Policy.`,
      ],
    },
    {
      id: "safety",
      title: "Participation, health and safety",
      clauses: [
        `Rugby and rugby training involve physical contact and exertion, and carry a risk of injury. Participants take part knowing and accepting those risks.`,
        `Before a Session, the Client must tell us about any injury, medical condition, allergy or other matter that could affect safe participation. We may modify a Session or decline to include a Participant if we believe it is not safe.`,
        {
          text: `Participants must:`,
          items: [
            `follow the coach's instructions and safety rules`,
            `wear suitable clothing and footwear, and a mouthguard where appropriate`,
            `stay hydrated and stop and tell the coach straight away if they feel unwell or in pain`,
            `not attend a Session if they are contagious`,
          ],
        },
        `Where a Session takes place at a school, club or other venue arranged by the Client, the Client is responsible for making sure the venue is safe and suitable, that appropriate supervision and first aid are available, and that its obligations under the Health and Safety at Work Act 2015 are met.`,
        `We may stop, change or end a Session at any time if we believe it is unsafe, including because of weather, the venue, injury or behaviour.`,
        `In an emergency, we will take reasonable steps to get medical help and to contact the emergency contact provided. The Client agrees that we may seek emergency medical treatment for a Participant.`,
        `Our coaching is not medical, physiotherapy or rehabilitation advice. Participants with any concern about their health should consult a doctor before taking part.`,
      ],
    },
    {
      id: "children",
      title: "Participants under 18",
      clauses: [
        `A Participant under 18 must have the consent of a parent or guardian. Unless we agree otherwise, the parent or guardian is the Client.`,
        `We follow reasonable child safeguarding practices, including holding Sessions in open, visible or supervised environments and communicating with a parent or guardian about arrangements for Participants under 18.`,
        `Parents and guardians are responsible for transport to and from Sessions and for supervising a Participant before and after a Session.`,
      ],
    },
    {
      id: "conduct",
      title: "Conduct",
      clauses: [
        `We expect everyone involved in our Services to behave respectfully towards coaches, other Participants and venue staff.`,
        `We may refuse to continue, or end, a Participant's involvement if their behaviour, or the behaviour of a parent, guardian or representative, is abusive, unsafe or discriminatory. In that case, fees for Sessions already delivered remain payable.`,
        `Please ask us before taking photographs or video of Sessions, particularly where other Participants are present.`,
      ],
    },
    {
      id: "media",
      title: "Photographs, video and testimonials",
      clauses: [
        `We may record Sessions, including by photograph or video, for coaching analysis and feedback to the Participant.`,
        `We will not publish photographs or video in which a Participant can be identified on our Website, social media or marketing material without consent. For Participants under 18, we will ask a parent or guardian.`,
        `Consent can be withdrawn for future use at any time by contacting us. We will remove the material from our own channels within a reasonable time, but we cannot control copies that others have already made or shared.`,
        `We will publish a testimonial, or use a person's name or image with it, only with their permission.`,
      ],
    },
    {
      id: "online",
      title: "Online Programme",
      clauses: [
        `The Online Programme is in development and may not currently be available. References to it on the Website are not an offer to sell it until we make it available for purchase.`,
        `When it is available, access to the Online Programme is a personal, non-transferable licence for your own use, unless we agree otherwise in writing. You must not share your login, or copy, record, distribute, resell or upload any of its content.`,
        `You are responsible for keeping your login details secure and for telling us promptly if you suspect they have been used without your permission.`,
        `We may update, add or remove content and may occasionally suspend access for maintenance. We do not promise that access will be uninterrupted.`,
        `You are responsible for the internet connection and device needed to use the Online Programme.`,
        `The Online Programme is for general coaching and education. Individual results vary.`,
        `Refunds for the Online Programme are covered by our Refund and Cancellation Policy.`,
      ],
    },
    {
      id: "ip",
      title: "Intellectual property",
      clauses: [
        `All content on the Website and in our Services, including text, drills, programmes, videos, images, logos and the name ${legal.brand}, is owned by us or our licensors and is protected by copyright and trade mark law.`,
        `You may view and print Website content for your own personal, non-commercial use. You must not copy, adapt, distribute or use it commercially without our written permission.`,
        `Coaching materials we give to a Client are for the Participants' own use. They must not be shared, resold, or used to run another coaching programme.`,
        `If you give us feedback or suggestions, we may use them without any obligation to you.`,
      ],
    },
    {
      id: "website",
      title: "Use of the Website",
      clauses: [
        {
          text: `You must not use the Website to:`,
          items: [
            `break any law or the rights of others`,
            `attempt to gain unauthorised access to, disrupt or damage the Website or its systems`,
            `scrape or copy the Website using automated tools`,
            `send spam, false enquiries or malicious material`,
            `pretend to be another person`,
          ],
        },
        `We try to keep the Website accurate and up to date but do not promise that it is complete or error free. We may change or suspend the Website at any time.`,
        `The Website may link to third-party websites. We do not control them and are not responsible for their content or privacy practices.`,
      ],
    },
    {
      id: "liability",
      title: "Consumer guarantees and our liability",
      clauses: [
        `If you are a consumer, the Consumer Guarantees Act 1993 and the Fair Trading Act 1986 give you rights that cannot be excluded. Nothing in these terms limits or excludes those rights.`,
        `If you acquire Services for the purposes of a business, such as a school, club, academy or union operating in trade, you and we agree that, to the extent the law allows, the Consumer Guarantees Act 1993 does not apply, and that this is fair and reasonable.`,
        `Subject to the clauses above, and to the extent the law allows, we are not liable for indirect or consequential loss, or for loss of profit, opportunity or goodwill.`,
        `Subject to the clauses above, and to the extent the law allows, our total liability in connection with a Service is limited to the fees you paid for that Service. This does not limit liability that cannot lawfully be limited.`,
        `In New Zealand, the accident compensation scheme generally covers personal injury and may restrict the right to sue for compensation. Nothing in these terms affects any entitlement under the Accident Compensation Act 2001.`,
        `We are not responsible for loss of, or damage to, personal belongings brought to a Session.`,
      ],
    },
    {
      id: "events",
      title: "Events beyond our control",
      clauses: [
        `We are not liable for any delay or failure to provide Services caused by events beyond our reasonable control, including severe weather, natural disasters, epidemics, government restrictions, venue closure, power or internet failure, and illness or injury.`,
        `If that happens, we will offer a reschedule, credit or refund as set out in our Refund and Cancellation Policy.`,
      ],
    },
    {
      id: "privacy",
      title: "Privacy",
      clauses: [
        `We collect, use and protect personal information in line with our Privacy Policy, which is available on the Website.`,
      ],
    },
    {
      id: "termination",
      title: "Suspension and ending of services",
      clauses: [
        `We may suspend or end Services, or access to the Online Programme, if you breach these terms, behave unsafely, or fail to pay on time.`,
        `You may end an ongoing arrangement by giving us notice in line with our Refund and Cancellation Policy.`,
        `Any clause that by its nature should continue after Services end, including those on intellectual property, liability and payment, continues to apply.`,
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      clauses: [
        `We may update these terms from time to time. The updated version will be published on this page with a new "last updated" date.`,
        `For a booking that is already confirmed, the terms in force when you booked continue to apply, unless the law requires otherwise or you agree to the change.`,
      ],
    },
    {
      id: "disputes",
      title: "Disputes",
      clauses: [
        `If you have a complaint or dispute, please contact us first so that we can try to resolve it in good faith.`,
        `If we cannot resolve it, either of us may use mediation or any other dispute resolution process available under New Zealand law, including the Disputes Tribunal where it applies.`,
      ],
    },
    {
      id: "law",
      title: "Governing law",
      clauses: [
        `These terms are governed by the laws of ${legal.country}. Each of us submits to the non-exclusive jurisdiction of the courts of ${legal.country}.`,
      ],
    },
    {
      id: "general",
      title: "General",
      clauses: [
        `These terms, together with any quote or booking confirmation and our Privacy Policy and Refund and Cancellation Policy, are the entire agreement between us about the Services.`,
        `If any part of these terms is found to be invalid or unenforceable, the rest continues to apply.`,
        `If we do not enforce a right straight away, that does not mean we have given it up.`,
        `You may not transfer your rights or obligations under these terms without our written consent. We may transfer ours to a successor to our business.`,
        `Nothing in these terms makes either of us the partner, employee or agent of the other.`,
        `We may give notices to you by email at the address you gave us. You may give notices to us by email at ${legal.email}. Electronic communications satisfy any requirement for writing, to the extent the law allows.`,
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      clauses: [
        `${legal.operatorLine}. Email: ${legal.email}. WhatsApp: ${legal.whatsapp}. Website: ${legal.website}.`,
      ],
    },
  ],
};