"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { contact } from "@/data/contact";
import {
  MESSAGE_MAX,
  emptyEnquiry,
  requiresOrganisation,
  submitEnquiry,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryValues,
} from "@/lib/enquiry";
import {
  CheckField,
  Chips,
  Field,
  FieldError,
  Reveal,
  SelectControl,
  controlClass,
  describedBy,
} from "@/components/ui/FormFields";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Email is the only way to reply, so the contact method is always email */
const initialValues: EnquiryValues = { ...emptyEnquiry, contactMethod: "email" };

const fieldOrder: (keyof EnquiryValues)[] = [
  "enquiryType",
  "name",
  "email",
  "role",
  "organisation",
  "message",
  "consentContact",
];

const labelOf = (list: { id: string; label: string }[], id: string) =>
  list.find((item) => item.id === id)?.label;

function SectionTitle({
  id,
  number,
  title,
  hint,
  action,
}: {
  id: string;
  number: string;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-lg text-accent">{number}</span>
          <h3 id={id} className="text-2xl leading-none md:text-3xl">
            {title}
          </h3>
        </div>
        {hint && (
          <p className="mt-2 text-base font-medium text-ink/70 md:text-lg">
            {hint}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function Divider() {
  return <div aria-hidden="true" className="h-px bg-ink/10" />;
}

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const [values, setValues] = useState<EnquiryValues>(initialValues);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [detailsOpen, setDetailsOpen] = useState(false);

  /* Details are open by default on larger screens */
  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) setDetailsOpen(true);
  }, []);

  const set = <K extends keyof EnquiryValues>(
    key: K,
    value: EnquiryValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /* Conditional fields */
  const isOrgRole = requiresOrganisation(values.role);
  const showOrganisation = isOrgRole || values.role === "coach";
  const showLevel = values.role === "player" || values.role === "parent";
  const showGroupSize = contact.groupTypes.includes(values.enquiryType);

  const errorList = fieldOrder.filter((key) => errors[key]);

  const focusField = (key: string) => {
    const el = document.getElementById(`enq-${key}`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    el?.focus({ preventScroll: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const found = validateEnquiry(values);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    /* Honeypot: pretend it worked, send nothing */
    if (values.website) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    try {
      await submitEnquiry(values);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setStatus("idle");
  };

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-ct-pill]",
          { autoAlpha: 0, x: -20 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-ct-pill]", start: "top 90%" },
          }
        );
        gsap.fromTo(
          "[data-ct-word]",
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.14,
            scrollTrigger: { trigger: "[data-ct-heading]", start: "top 88%" },
          }
        );
        gsap.fromTo(
          "[data-ct-intro]",
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-ct-intro]", start: "top 90%" },
          }
        );
        gsap.fromTo(
          "[data-ct-card]",
          { autoAlpha: 0, y: 48 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: { trigger: "[data-ct-card]", start: "top 92%" },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  const firstName = values.name.trim().split(" ")[0];

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="relative bg-white py-16 text-ink md:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Header and form share one centred column */}
        <div className="mx-auto max-w-4xl">
          <span
            data-ct-pill
            className="inline-block rounded-full bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-bone"
          >
            {contact.eyebrow}
          </span>

          <h2
            id="contact-heading"
            data-ct-heading
            className="mt-6 flex items-baseline gap-[0.28em] whitespace-nowrap text-[clamp(1.75rem,4.2vw,3rem)] leading-none"
          >
            {contact.headline.map((word, i) => (
              <span key={word} className="block overflow-hidden py-[0.08em]">
                <span
                  data-ct-word
                  className={cn("block", i === 1 && "text-accent")}
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>

          <div data-ct-intro>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-ink/75 md:mt-6 md:text-xl">
              {contact.intro}
            </p>
            <p className="mt-3 text-base font-medium text-ink/65 md:text-lg">
              {contact.emailNote}{" "}
              <a
                href={`mailto:${contact.email}`}
                className="font-semibold text-ink underline underline-offset-4 transition-colors duration-300 hover:text-accent focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {contact.email}
              </a>
            </p>
          </div>

          {/* Form card */}
          <div
            data-ct-card
            className="mt-10 rounded-3xl border border-ink/10 bg-paper p-5 md:mt-14 md:p-10"
          >
            <AnimatePresence mode="wait" initial={false}>
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <h3
                    ref={successRef}
                    tabIndex={-1}
                    className="text-3xl leading-none outline-none md:text-5xl"
                  >
                    {contact.success.title}{" "}
                    <span className="text-accent">
                      {firstName || "friend"}.
                    </span>
                  </h3>
                  <p className="mt-4 max-w-xl text-lg font-medium leading-relaxed text-ink/75 md:text-xl">
                    {contact.success.text}
                  </p>

                  <dl className="mt-8 divide-y divide-ink/10 rounded-2xl border border-ink/15 bg-white">
                    {[
                      {
                        label: contact.success.summaryAbout,
                        value: labelOf(contact.enquiryTypes, values.enquiryType),
                      },
                      {
                        label: contact.success.summaryFrom,
                        value: labelOf(contact.roles, values.role),
                      },
                      {
                        label: contact.success.summaryReply,
                        value: values.email,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="grid gap-1 p-4 sm:grid-cols-[8rem_1fr] sm:gap-6 md:p-5"
                      >
                        <dt className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/60">
                          {row.label}
                        </dt>
                        <dd className="break-all text-lg font-semibold">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-8 rounded-full border border-ink/25 bg-white px-7 py-3.5 text-base font-semibold transition-colors duration-300 hover:border-ink hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {contact.actions.another}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div>
                    <h3 className="text-3xl leading-none md:text-4xl">
                      {contact.form.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-base font-medium leading-snug text-ink/70 md:text-lg">
                      {contact.form.hint}
                    </p>
                  </div>

                  {errorList.length > 0 && (
                    <div
                      ref={summaryRef}
                      role="alert"
                      tabIndex={-1}
                      className="mt-6 rounded-2xl border border-accent bg-white p-4 outline-none md:p-5"
                    >
                      <p className="text-base font-semibold text-accent">
                        Please check{" "}
                        {errorList.length === 1
                          ? "this field"
                          : `these ${errorList.length} fields`}{" "}
                        before sending:
                      </p>
                      <ul className="mt-2 space-y-1">
                        {errorList.map((key) => (
                          <li key={key}>
                            <button
                              type="button"
                              onClick={() => focusField(key)}
                              className="text-left text-[15px] font-semibold underline-offset-4 hover:text-accent hover:underline"
                            >
                              {errors[key]}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-10 grid gap-10 md:mt-12 md:gap-12">
                    {/* 01 Enquiry type */}
                    <div>
                      <SectionTitle
                        id="enq-type-title"
                        number="01"
                        title={contact.form.typeTitle}
                      />
                      <div
                        id="enq-enquiryType"
                        role="radiogroup"
                        aria-labelledby="enq-type-title"
                        aria-describedby={
                          errors.enquiryType
                            ? "enq-enquiryType-error"
                            : undefined
                        }
                        tabIndex={-1}
                        className="mt-6 outline-none"
                      >
                        <Chips
                          options={contact.enquiryTypes}
                          role="radio"
                          isActive={(id) => values.enquiryType === id}
                          onSelect={(id) => set("enquiryType", id)}
                        />
                      </div>
                      <FieldError
                        id="enq-enquiryType"
                        message={errors.enquiryType}
                      />
                    </div>

                    <Divider />

                    {/* 02 About you */}
                    <div>
                      <SectionTitle
                        id="enq-about-title"
                        number="02"
                        title={contact.form.aboutTitle}
                      />

                      <div className="mt-6 grid gap-x-5 gap-y-6 sm:grid-cols-2">
                        <Field
                          id="enq-name"
                          label={contact.fields.name}
                          error={errors.name}
                        >
                          <input
                            id="enq-name"
                            type="text"
                            autoComplete="name"
                            value={values.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder={contact.fields.namePlaceholder}
                            aria-invalid={errors.name ? true : undefined}
                            aria-describedby={describedBy(
                              "enq-name",
                              undefined,
                              errors.name
                            )}
                            className={controlClass(Boolean(errors.name))}
                          />
                        </Field>

                        <Field
                          id="enq-email"
                          label={contact.fields.email}
                          
                          error={errors.email}
                        >
                          <input
                            id="enq-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            value={values.email}
                            onChange={(e) => set("email", e.target.value)}
                            placeholder={contact.fields.emailPlaceholder}
                            aria-invalid={errors.email ? true : undefined}
                            aria-describedby={describedBy(
                              "enq-email",
                              "hint",
                              errors.email
                            )}
                            className={controlClass(Boolean(errors.email))}
                          />
                        </Field>

                        <Field
                          id="enq-role"
                          label={contact.fields.role}
                          hint={
                            values.role === "player"
                              ? contact.fields.rolePlayerHint
                              : undefined
                          }
                          error={errors.role}
                          className="sm:col-span-2"
                        >
                          <SelectControl
                            id="enq-role"
                            value={values.role}
                            onChange={(v) => set("role", v)}
                            options={contact.roles}
                            placeholder={contact.fields.rolePlaceholder}
                            invalid={Boolean(errors.role)}
                            describedById={describedBy(
                              "enq-role",
                              values.role === "player" ? "hint" : undefined,
                              errors.role
                            )}
                          />
                        </Field>

                        <Reveal
                          show={showOrganisation}
                          className="sm:col-span-2"
                        >
                          <Field
                            id="enq-organisation"
                            label={contact.fields.organisation}
                            optional={!isOrgRole}
                            error={errors.organisation}
                          >
                            <input
                              id="enq-organisation"
                              type="text"
                              autoComplete="organization"
                              value={values.organisation}
                              onChange={(e) =>
                                set("organisation", e.target.value)
                              }
                              placeholder={
                                contact.fields.organisationPlaceholder
                              }
                              aria-invalid={
                                errors.organisation ? true : undefined
                              }
                              aria-describedby={describedBy(
                                "enq-organisation",
                                undefined,
                                errors.organisation
                              )}
                              className={controlClass(
                                Boolean(errors.organisation)
                              )}
                            />
                          </Field>
                        </Reveal>
                      </div>
                    </div>

                    <Divider />

                    {/* 03 More details */}
                    <div>
                      <SectionTitle
                        id="enq-details-title"
                        number="03"
                        title={contact.form.detailsTitle}
                        hint={contact.form.detailsHint}
                        action={
                          <button
                            type="button"
                            aria-expanded={detailsOpen}
                            aria-controls="enq-details"
                            onClick={() => setDetailsOpen((v) => !v)}
                            className="shrink-0 rounded-full border border-ink/20 bg-white px-4 py-2 text-sm font-semibold transition-colors duration-300 hover:border-ink hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          >
                            {detailsOpen
                              ? contact.form.detailsClose
                              : contact.form.detailsOpen}
                          </button>
                        }
                      />

                      <div
                        id="enq-details"
                        inert={!detailsOpen}
                        className={cn(
                          "grid transition-[grid-template-rows] duration-500 ease-out",
                          detailsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="-m-1 p-1">
                            <div className="grid gap-x-5 gap-y-6 pt-6 sm:grid-cols-2">
                              <Field
                                id="enq-ageGroup"
                                label={contact.fields.ageGroup}
                                optional
                              >
                                <SelectControl
                                  id="enq-ageGroup"
                                  value={values.ageGroup}
                                  onChange={(v) => set("ageGroup", v)}
                                  options={contact.ageGroups}
                                  placeholder={contact.fields.choose}
                                />
                              </Field>

                              <Field
                                id="enq-timing"
                                label={contact.fields.timing}
                                optional
                              >
                                <SelectControl
                                  id="enq-timing"
                                  value={values.timing}
                                  onChange={(v) => set("timing", v)}
                                  options={contact.timings}
                                  placeholder={contact.fields.choose}
                                />
                              </Field>

                              <Field
                                id="enq-location"
                                label={contact.fields.location}
                                optional
                              >
                                <input
                                  id="enq-location"
                                  type="text"
                                  autoComplete="address-level2"
                                  value={values.location}
                                  onChange={(e) =>
                                    set("location", e.target.value)
                                  }
                                  placeholder={
                                    contact.fields.locationPlaceholder
                                  }
                                  className={controlClass()}
                                />
                              </Field>

                              {showLevel && (
                                <Field
                                  id="enq-level"
                                  label={contact.fields.level}
                                  optional
                                >
                                  <SelectControl
                                    id="enq-level"
                                    value={values.level}
                                    onChange={(v) => set("level", v)}
                                    options={contact.levels}
                                    placeholder={contact.fields.choose}
                                  />
                                </Field>
                              )}

                              {showGroupSize && (
                                <Field
                                  id="enq-groupSize"
                                  label={contact.fields.groupSize}
                                  optional
                                >
                                  <SelectControl
                                    id="enq-groupSize"
                                    value={values.groupSize}
                                    onChange={(v) => set("groupSize", v)}
                                    options={contact.groupSizes}
                                    placeholder={contact.fields.choose}
                                  />
                                </Field>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* 04 Message */}
                    <div>
                      <SectionTitle
                        id="enq-message-title"
                        number="04"
                        title={contact.form.messageTitle}
                      />

                      <Field
                        id="enq-message"
                        label={contact.fields.message}
                        hint={contact.fields.messageHint}
                        error={errors.message}
                        aside={
                          <span className="text-sm font-medium text-ink/55">
                            {values.message.length}/{MESSAGE_MAX}
                          </span>
                        }
                        className="mt-6"
                      >
                        <textarea
                          id="enq-message"
                          rows={6}
                          maxLength={MESSAGE_MAX}
                          value={values.message}
                          onChange={(e) => set("message", e.target.value)}
                          placeholder={contact.fields.messagePlaceholder}
                          aria-invalid={errors.message ? true : undefined}
                          aria-describedby={describedBy(
                            "enq-message",
                            "hint",
                            errors.message
                          )}
                          className={cn(
                            controlClass(Boolean(errors.message)),
                            "min-h-40 resize-y"
                          )}
                        />
                      </Field>
                    </div>

                    <Divider />

                    {/* Consent and send */}
                    <div className="grid gap-5">
                      <CheckField
                        id="enq-consentContact"
                        checked={values.consentContact}
                        onChange={(v) => set("consentContact", v)}
                        label={contact.fields.consent}
                        error={errors.consentContact}
                      />

                      {status === "error" && (
                        <div
                          role="alert"
                          className="rounded-2xl border border-accent bg-white p-4 md:p-5"
                        >
                          <p className="text-base font-semibold text-accent">
                            {contact.error.text}
                          </p>
                          <p className="mt-1.5 text-base font-medium">
                            <a
                              href={`mailto:${contact.email}`}
                              className="underline underline-offset-4 hover:text-accent"
                            >
                              {contact.email}
                            </a>
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                        <button
                          type="submit"
                          disabled={status === "submitting"}
                          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-accent px-9 py-4 text-base font-semibold text-bone transition-opacity duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 translate-y-full rounded-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
                          />
                          <span className="relative">
                            {status === "submitting"
                              ? contact.actions.sending
                              : contact.actions.send}
                          </span>
                        </button>

                        <p className="max-w-sm text-[15px] font-medium leading-snug text-ink/65">
                          {contact.fields.privacy}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Honeypot: hidden from people, tempting for bots */}
                  <div
                    aria-hidden="true"
                    className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden"
                  >
                    <label htmlFor="enq-website">Website</label>
                    <input
                      id="enq-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={values.website}
                      onChange={(e) => set("website", e.target.value)}
                    />
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}