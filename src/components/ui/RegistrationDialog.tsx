"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, X } from "@phosphor-icons/react";

import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { online, registerSteps, type Step } from "@/data/online";
import { submitRegistration } from "@/lib/registration";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d\s-]{6,20}$/;

const REVIEW_INDEX = registerSteps.length;
const TOTAL = registerSteps.length + 1;

const questionClass =
  "block font-display text-2xl font-bold uppercase leading-[1.05] md:text-3xl";
const helperClass = "mt-2 text-base font-medium leading-snug text-ink/65";
const inputClass =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-4 text-lg text-ink placeholder:text-ink/40 transition-colors duration-200 focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/15 aria-[invalid=true]:border-accent";
const primaryButton =
  "inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 text-base font-semibold text-bone transition-colors duration-300 hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60";

type ChoiceStep = Extract<Step, { options: readonly string[] }>;
type Answers = Record<string, string | string[]>;
type Status = "idle" | "submitting" | "success" | "error";

const asString = (v: string | string[] | undefined) =>
  typeof v === "string" ? v : "";
const asArray = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v : [];

const initialAnswers: Answers = Object.fromEntries(
  registerSteps.map((s) => [s.id, s.kind === "multi" ? [] : ""])
);

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -24 }),
};

function validateStep(step: Step, value: string | string[]): string | null {
  if (step.kind === "multi") {
    return asArray(value).length ? null : "Please choose at least one option.";
  }

  const text = asString(value).trim();

  switch (step.kind) {
    case "choice":
      return text ? null : "Please choose an option.";
    case "email":
      if (!text) return "Please enter your email address.";
      return EMAIL_RE.test(text) ? null : "Please enter a valid email address.";
    case "tel":
      if (!text) return step.optional ? null : "Please enter a phone number.";
      return PHONE_RE.test(text) ? null : "Please enter a valid phone number.";
    case "textarea":
      if (!text) return step.optional ? null : "Please answer to continue.";
      return step.maxLength && text.length > step.maxLength
        ? `Please keep this under ${step.maxLength} characters.`
        : null;
    default:
      if (!text) return step.optional ? null : "Please answer to continue.";
      return text.length < 2 ? "Please enter at least 2 characters." : null;
  }
}

function display(value: string | string[] | undefined) {
  const text = Array.isArray(value) ? value.join(", ") : (value ?? "").trim();
  return text || online.register.notProvided;
}

function RegistrationForm({
  titleId,
  onSuccess,
  onClose,
}: {
  titleId: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const uid = useId();
  const reduceMotion = useReducedMotion();
  const stepRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [error, setError] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);
  const [company, setCompany] = useState(""); // honeypot
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const { register } = online;
  const isReview = index === REVIEW_INDEX;
  const step = isReview ? null : registerSteps[index];

  const inputId = `${uid}-input`;
  const helpId = `${uid}-help`;
  const errorId = `${uid}-error`;
  const privacyId = `${uid}-privacy`;
  const companyId = `${uid}-company`;

  const focusFirst = () =>
    stepRef.current?.querySelector<HTMLElement>("[data-step-focus]")?.focus();

  const go = (to: number, dir: 1 | -1) => {
    setDirection(dir);
    setIndex(to);
    setError(null);
  };

  const setAnswer = (id: string, value: string | string[]) => {
    setAnswers((a) => ({ ...a, [id]: value }));
    setError(null);
  };

  const toggleOption = (s: ChoiceStep, option: string) => {
    if (s.kind === "multi") {
      const current = asArray(answers[s.id]);
      setAnswer(
        s.id,
        current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option]
      );
    } else {
      setAnswer(s.id, option);
    }
  };

  const advance = () => {
    if (editing) {
      setEditing(false);
      go(REVIEW_INDEX, 1);
    } else {
      go(index + 1, 1);
    }
  };

  const next = () => {
    if (!step) return;
    const message = validateStep(step, answers[step.id]);
    if (message) {
      setError(message);
      requestAnimationFrame(focusFirst);
      return;
    }
    advance();
  };

  const skip = () => {
    if (!step) return;
    setAnswer(step.id, "");
    advance();
  };

  const back = () => {
    setEditing(false);
    go(Math.max(index - 1, 0), -1);
  };

  const edit = (stepIndex: number) => {
    setEditing(true);
    go(stepIndex, -1);
  };

  const submit = async () => {
    if (status === "submitting") return;

    if (!privacy) {
      setPrivacyError(true);
      requestAnimationFrame(focusFirst);
      return;
    }

    /* Honeypot: bots fill the hidden field, people never see it */
    if (company) {
      setStatus("success");
      return;
    }

    try {
      setStatus("submitting");
      await submitRegistration({
        role: asString(answers.role),
        level: asString(answers.level),
        experience: asString(answers.experience),
        focusAreas: asArray(answers.focus),
        goal: asString(answers.goal).trim() || undefined,
        name: asString(answers.name).trim(),
        email: asString(answers.email).trim(),
        phone: asString(answers.phone).trim() || undefined,
        location: asString(answers.location).trim(),
        privacyAccepted: true,
        acceptedAt: new Date().toISOString(),
        source: "online-programme",
      });
      onSuccess();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isReview) void submit();
    else next();
  };

  const transition = { duration: reduceMotion ? 0 : 0.28, ease: EASE };
  const submitting = status === "submitting";

  return (
    <div>
      <h2 id={titleId} className="pr-12 text-xl leading-tight md:text-2xl">
        {register.title}
      </h2>

      {status !== "success" && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/60">
            <span>
              Step {index + 1} of {TOTAL}
            </span>
            {step?.optional && <span>Optional</span>}
            {isReview && <span>Review</span>}
          </div>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-ink/10">
            <motion.div
              initial={false}
              animate={{ scaleX: (index + 1) / TOTAL }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
              className="h-full origin-left rounded-full bg-ink"
            />
          </div>
        </div>
      )}

      <div className="mt-7">
        <AnimatePresence
          mode="wait"
          initial={false}
          custom={reduceMotion ? 0 : direction}
        >
          {status === "success" ? (
            <motion.div
              key="success"
              role="status"
              custom={0}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="py-4"
            >
              <span className="grid size-12 place-items-center rounded-full bg-ink text-bone">
                <Check size={22} weight="bold" />
              </span>
              <p className="mt-5 font-display text-3xl font-bold uppercase leading-none md:text-4xl">
                {register.successTitle}
              </p>
              <p className="mt-3 text-base font-medium leading-relaxed text-ink/75 md:text-[1.0625rem]">
                {register.successText}
              </p>
              <button
                type="button"
                onClick={onClose}
                className={cn(primaryButton, "mt-7")}
              >
                {register.successClose}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={index}
              ref={stepRef}
              custom={reduceMotion ? 0 : direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              onAnimationComplete={(definition) => {
                if (definition === "center") focusFirst();
              }}
            >
              <form noValidate onSubmit={onFormSubmit}>
                {/* Question steps */}
                {step &&
                  (step.kind === "choice" || step.kind === "multi" ? (
                    <fieldset
                      aria-describedby={step.helper ? helpId : undefined}
                    >
                      <legend className={questionClass}>{step.question}</legend>
                      {step.helper && (
                        <p id={helpId} className={helperClass}>
                          {step.helper}
                        </p>
                      )}
                      <div
                        className={cn(
                          "mt-5 grid gap-2.5",
                          step.kind === "multi" && "sm:grid-cols-2"
                        )}
                      >
                        {step.options.map((option, i) => {
                          const multi = step.kind === "multi";
                          const checked = multi
                            ? asArray(answers[step.id]).includes(option)
                            : answers[step.id] === option;

                          return (
                            <label
                              key={option}
                              className="block cursor-pointer"
                            >
                              <input
                                type={multi ? "checkbox" : "radio"}
                                name={`${uid}-${step.id}`}
                                value={option}
                                checked={checked}
                                onChange={() => toggleOption(step, option)}
                                data-step-focus={i === 0 ? "" : undefined}
                                className="peer sr-only"
                              />
                              <span className="flex items-center justify-between gap-3 rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-base font-medium transition-colors duration-200 hover:border-ink/40 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bone peer-focus-visible:ring-2 peer-focus-visible:ring-ink/40 peer-focus-visible:ring-offset-2 peer-checked:[&_svg]:opacity-100">
                                {option}
                                <Check
                                  size={16}
                                  weight="bold"
                                  aria-hidden="true"
                                  className="shrink-0 opacity-0 transition-opacity duration-200"
                                />
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  ) : (
                    <div>
                      <label htmlFor={inputId} className={questionClass}>
                        {step.question}
                      </label>
                      {step.helper && (
                        <p id={helpId} className={helperClass}>
                          {step.helper}
                        </p>
                      )}
                      <div className="mt-5">
                        {step.kind === "textarea" ? (
                          <>
                            <textarea
                              id={inputId}
                              rows={4}
                              maxLength={step.maxLength}
                              placeholder={step.placeholder}
                              value={asString(answers[step.id])}
                              onChange={(e) =>
                                setAnswer(step.id, e.target.value)
                              }
                              data-step-focus=""
                              aria-invalid={error ? true : undefined}
                              aria-describedby={
                                [step.helper ? helpId : "", error ? errorId : ""]
                                  .filter(Boolean)
                                  .join(" ") || undefined
                              }
                              className={cn(inputClass, "resize-none")}
                            />
                            {step.maxLength && (
                              <p className="mt-2 text-right text-xs font-medium text-ink/50">
                                {asString(answers[step.id]).length}/
                                {step.maxLength}
                              </p>
                            )}
                          </>
                        ) : (
                          <input
                            id={inputId}
                            type={step.kind}
                            autoComplete={step.autoComplete}
                            placeholder={step.placeholder}
                            value={asString(answers[step.id])}
                            onChange={(e) => setAnswer(step.id, e.target.value)}
                            data-step-focus=""
                            aria-invalid={error ? true : undefined}
                            aria-describedby={
                              [step.helper ? helpId : "", error ? errorId : ""]
                                .filter(Boolean)
                                .join(" ") || undefined
                            }
                            className={inputClass}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                {step && error && (
                  <p
                    id={errorId}
                    role="alert"
                    className="mt-3 text-sm font-medium text-accent"
                  >
                    {error}
                  </p>
                )}

                {/* Review step */}
                {isReview && (
                  <div>
                    <h3 className={questionClass}>{register.reviewTitle}</h3>
                    <p className={helperClass}>{register.reviewHelper}</p>

                    <dl className="mt-5 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-paper px-4">
                      {registerSteps.map((s, i) => (
                        <div
                          key={s.id}
                          className="flex items-start justify-between gap-4 py-3"
                        >
                          <div className="min-w-0">
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/55">
                              {s.label}
                            </dt>
                            <dd className="mt-1 break-words text-base font-medium leading-snug">
                              {display(answers[s.id])}
                            </dd>
                          </div>
                          <button
                            type="button"
                            onClick={() => edit(i)}
                            className="shrink-0 text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                          >
                            {register.edit}
                            <span className="sr-only"> {s.label}</span>
                          </button>
                        </div>
                      ))}
                    </dl>

                    {/* Honeypot */}
                    <div aria-hidden="true" className="sr-only">
                      <label htmlFor={companyId}>Company</label>
                      <input
                        id={companyId}
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>

                    {/* Privacy policy: required */}
                    <div className="mt-5">
                      <label
                        htmlFor={privacyId}
                        className="flex cursor-pointer items-start gap-3 text-sm font-medium leading-snug text-ink/85"
                      >
                        <input
                          id={privacyId}
                          type="checkbox"
                          checked={privacy}
                          onChange={(e) => {
                            setPrivacy(e.target.checked);
                            if (e.target.checked) setPrivacyError(false);
                          }}
                          data-step-focus=""
                          aria-invalid={privacyError ? true : undefined}
                          aria-describedby={
                            privacyError ? `${privacyId}-error` : undefined
                          }
                          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-ink"
                        />
                        <span>
                          {register.privacyStart}
                          <Link
                            href={register.privacyHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-ink underline underline-offset-4"
                          >
                            {register.privacyLink}
                          </Link>
                          {register.privacyEnd}
                        </span>
                      </label>
                      {privacyError && (
                        <p
                          id={`${privacyId}-error`}
                          role="alert"
                          className="mt-2 text-sm font-medium text-accent"
                        >
                          {register.privacyError}
                        </p>
                      )}
                    </div>

                    {status === "error" && (
                      <p
                        role="alert"
                        className="mt-4 text-sm font-medium text-accent"
                      >
                        {register.error}
                      </p>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={back}
                    disabled={index === 0}
                    className={cn(
                      "inline-flex items-center gap-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink",
                      index === 0 && "invisible"
                    )}
                  >
                    <ArrowLeft size={16} weight="bold" />
                    {register.back}
                  </button>

                  <div className="flex items-center gap-4">
                    {step?.optional && (
                      <button
                        type="button"
                        onClick={skip}
                        className="text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                      >
                        {register.skip}
                      </button>
                    )}

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileTap={{ scale: 0.97 }}
                      className={primaryButton}
                    >
                      {isReview
                        ? submitting
                          ? `${register.submitting}...`
                          : register.submit
                        : editing
                          ? register.save
                          : register.next}
                      {!isReview && <ArrowRight size={16} weight="bold" />}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function RegistrationDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const submittedRef = useRef(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    if (!dialog || !panel) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (open && !dialog.open) {
      dialog.showModal();
      gsap.killTweensOf(panel);
      if (reduce) {
        gsap.set(panel, { autoAlpha: 1, y: 0 });
      } else {
        gsap.fromTo(
          panel,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }
        );
      }
      requestAnimationFrame(() =>
        dialog.querySelector<HTMLElement>("[data-step-focus]")?.focus()
      );
    } else if (!open && dialog.open) {
      gsap.killTweensOf(panel);

      const finish = () => {
        dialog.close();
        if (submittedRef.current) {
          submittedRef.current = false;
          setFormKey((k) => k + 1);
        }
      };

      if (reduce) finish();
      else
        gsap.to(panel, {
          autoAlpha: 0,
          y: 16,
          duration: 0.25,
          ease: "power2.in",
          onComplete: finish,
        });
    }
  }, [open]);

  useEffect(() => {
    const panel = panelRef.current;
    return () => {
      if (panel) gsap.killTweensOf(panel);
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      data-lenis-prevent
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-transparent p-0 text-ink backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
    >
      <div className="pointer-events-none flex min-h-full items-center justify-center p-4 md:p-6">
        <div
          ref={panelRef}
          className="pointer-events-auto relative w-full max-w-[36rem] rounded-3xl bg-white p-6 shadow-2xl md:p-8"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration form"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-ink/15 transition-colors duration-300 hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:right-5 md:top-5"
          >
            <X size={18} weight="bold" />
          </button>

          <RegistrationForm
            key={formKey}
            titleId={titleId}
            onSuccess={() => {
              submittedRef.current = true;
            }}
            onClose={onClose}
          />
        </div>
      </div>
    </dialog>
  );
}