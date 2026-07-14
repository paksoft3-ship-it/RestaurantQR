"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { enquirySchema, type EnquiryInput } from "@/domain/schemas";
import {
  ENQUIRY_TYPES,
  RESTAURANT_TYPES,
  type EnquiryType,
  type RestaurantType,
} from "@/domain/enums";
import { submitEnquiry } from "./enquiry-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Field, Checkbox, Label } from "@/components/ui/input";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/toast";
import { titleCase, cn } from "@/lib/utils";

const ENQUIRY_TYPE_LABELS: Record<EnquiryType, string> = {
  quote: "Request a quote",
  demo: "Book a demo",
  "qr-product": "QR products",
  "nfc-product": "NFC products",
  "multi-location": "Multi-location / franchise",
  "existing-project": "Existing project",
  general: "General enquiry",
};

const restaurantTypeLabel = (t: RestaurantType): string => titleCase(t);

const PACKAGE_OPTIONS = ["Starter", "Growth", "Premium", "Not sure yet"] as const;

const QR_PRODUCT_OPTIONS = [
  "Table QR stands",
  "Window / poster QR",
  "Sticker QR",
  "Menu card QR",
] as const;

const NFC_PRODUCT_OPTIONS = [
  "NFC table tap stand",
  "NFC cards",
  "NFC stickers",
  "NFC keychain / wristband",
] as const;

const CONTACT_METHODS = ["email", "phone", "whatsapp"] as const;

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; reference: string; emailed: boolean }
  | { kind: "error"; message: string };

export function EnquiryForm() {
  const { toast } = useToast();
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof enquirySchema>, unknown, EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      restaurantName: "",
      contactPerson: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      restaurantType: undefined,
      enquiryType: "quote",
      packageInterest: "",
      featureInterest: [],
      productInterest: [],
      preferredContactMethod: "email",
      message: "",
      company: "",
      consent: false,
    },
  });

  const enquiryType = watch("enquiryType");
  const showPackage = enquiryType === "quote";
  const showProducts = enquiryType === "qr-product" || enquiryType === "nfc-product";
  const showMultiLocation = enquiryType === "multi-location";
  const showExistingNote = enquiryType === "existing-project";
  const productOptions = enquiryType === "nfc-product" ? NFC_PRODUCT_OPTIONS : QR_PRODUCT_OPTIONS;

  const onSubmit = handleSubmit(async (values) => {
    if (submitState.kind === "submitting") return; // duplicate-submission guard
    setSubmitState({ kind: "submitting" });
    try {
      const res = await submitEnquiry(values);
      if (res.ok) {
        setSubmitState({ kind: "success", reference: res.id ?? "", emailed: Boolean(res.emailed) });
        toast({
          title: "Enquiry received",
          description: "Thanks — our team has your enquiry and will be in touch.",
          intent: "success",
        });
      } else {
        setSubmitState({
          kind: "error",
          message: "We couldn't submit your enquiry. Please check your details and try again.",
        });
        toast({ title: "Something went wrong", description: "Please try again.", intent: "danger" });
      }
    } catch {
      setSubmitState({
        kind: "error",
        message:
          "We couldn't reach the submission service. Your details are still here — please retry.",
      });
    }
  });

  // Success view — values intentionally cleared from view; show reference + demo note.
  if (submitState.kind === "success") {
    return (
      <Card className="border-success/30">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <Icon name="CheckCircle2" className="size-7" aria-hidden />
          </span>
          <h2 className="font-heading text-h2 text-text-primary">Thanks — we&apos;ve got your enquiry</h2>
          <p className="max-w-md text-body text-text-secondary">
            Our team will review your enquiry and get back to you shortly.
          </p>
          {submitState.reference ? (
            <p className="rounded-[12px] bg-surface px-4 py-2 text-small text-text-secondary">
              Reference:{" "}
              <span className="font-semibold text-text-primary">{submitState.reference}</span>
            </p>
          ) : null}
          <Button type="button" variant="outline" onClick={() => setSubmitState({ kind: "idle" })}>
            Send another enquiry
          </Button>
        </div>
      </Card>
    );
  }

  const formError = submitState.kind === "error" ? submitState.message : null;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* Honeypot — visually hidden, off-screen, not announced, not tabbable. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="company">Company (leave this blank)</label>
        <input
          id="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("company")}
        />
      </div>

      {/* Section 1: Your details */}
      <Card>
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-surface-warm text-small font-bold text-primary">
              1
            </span>
            <h2 className="font-heading text-h3 text-text-primary">Your details</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Restaurant name"
              htmlFor="restaurantName"
              required
              error={errors.restaurantName?.message}
            >
              <Input
                id="restaurantName"
                placeholder="e.g. Luigi's Pizza"
                aria-invalid={errors.restaurantName ? true : undefined}
                {...register("restaurantName")}
              />
            </Field>

            <Field
              label="Contact person"
              htmlFor="contactPerson"
              required
              error={errors.contactPerson?.message}
            >
              <Input
                id="contactPerson"
                placeholder="First & last name"
                aria-invalid={errors.contactPerson ? true : undefined}
                {...register("contactPerson")}
              />
            </Field>

            <Field label="Email address" htmlFor="email" required error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="hello@restaurant.com"
                aria-invalid={errors.email ? true : undefined}
                {...register("email")}
              />
            </Field>

            <Field label="Phone number" htmlFor="phone" error={errors.phone?.message}>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="+1 555 123 4567"
                {...register("phone")}
              />
            </Field>

            <Field label="City" htmlFor="city" error={errors.city?.message}>
              <Input id="city" placeholder="City" {...register("city")} />
            </Field>

            <Field label="Country" htmlFor="country" error={errors.country?.message}>
              <Input id="country" placeholder="Country" {...register("country")} />
            </Field>

            <Field
              label="Restaurant type"
              htmlFor="restaurantType"
              error={errors.restaurantType?.message}
              className="sm:col-span-2"
            >
              <Select
                id="restaurantType"
                defaultValue=""
                {...register("restaurantType")}
              >
                <option value="">Select a type (optional)</option>
                {RESTAURANT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {restaurantTypeLabel(t)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      </Card>

      {/* Section 2: What you need */}
      <Card>
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-surface-warm text-small font-bold text-primary">
              2
            </span>
            <h2 className="font-heading text-h3 text-text-primary">What you need</h2>
          </div>

          <Field
            label="Enquiry type"
            htmlFor="enquiryType"
            required
            error={errors.enquiryType?.message}
          >
            <Select
              id="enquiryType"
              aria-invalid={errors.enquiryType ? true : undefined}
              {...register("enquiryType")}
            >
              {ENQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ENQUIRY_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </Field>

          {/* Conditional: quote → package interest */}
          {showPackage ? (
            <Field
              label="Package interest"
              htmlFor="packageInterest"
              hint="Which package are you leaning towards? You can change this later."
              error={errors.packageInterest?.message}
            >
              <Select id="packageInterest" defaultValue="" {...register("packageInterest")}>
                <option value="">Select a package (optional)</option>
                {PACKAGE_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}

          {/* Conditional: qr/nfc product → product interest checkboxes */}
          {showProducts ? (
            <Controller
              control={control}
              name="productInterest"
              render={({ field }) => {
                const selected = field.value ?? [];
                return (
                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 text-small font-semibold text-text-primary">
                      Product interest
                    </legend>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {productOptions.map((option) => {
                        const id = `product-${option.replace(/\s+/g, "-").toLowerCase()}`;
                        const checked = selected.includes(option);
                        return (
                          <label
                            key={option}
                            htmlFor={id}
                            className="flex items-center gap-2.5 rounded-[12px] border border-border bg-canvas p-3 text-small text-text-primary"
                          >
                            <Checkbox
                              id={id}
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...selected, option]);
                                } else {
                                  field.onChange(selected.filter((v) => v !== option));
                                }
                              }}
                            />
                            {option}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              }}
            />
          ) : null}

          {/* Conditional: multi-location → note */}
          {showMultiLocation ? (
            <p className="rounded-[12px] border border-info/20 bg-info/5 p-3 text-small text-text-secondary">
              <Icon name="Info" className="mr-1.5 inline size-4 align-text-bottom text-info" aria-hidden />
              Running multiple locations or a franchise? Add the number of locations, cities and
              countries in the message below and we&apos;ll tailor the proposal.
            </p>
          ) : null}

          {/* Conditional: existing project → note */}
          {showExistingNote ? (
            <p className="rounded-[12px] border border-info/20 bg-info/5 p-3 text-small text-text-secondary">
              <Icon name="Info" className="mr-1.5 inline size-4 align-text-bottom text-info" aria-hidden />
              Already have a project with us? Mention your restaurant name or reference in the
              message so we can route your request quickly.
            </p>
          ) : null}

          <Field
            label="Message"
            htmlFor="message"
            hint="Tell us about your menu, goals or any questions."
            error={errors.message?.message}
          >
            <Textarea
              id="message"
              rows={5}
              placeholder="What would you like to achieve?"
              aria-invalid={errors.message ? true : undefined}
              {...register("message")}
            />
          </Field>
        </div>
      </Card>

      {/* Section 3: How to reach you */}
      <Card>
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-surface-warm text-small font-bold text-primary">
              3
            </span>
            <h2 className="font-heading text-h3 text-text-primary">How should we reach you?</h2>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-small font-semibold text-text-primary">
              Preferred contact method
            </legend>
            <div className="flex flex-wrap gap-2">
              {CONTACT_METHODS.map((method) => (
                <label
                  key={method}
                  className="flex cursor-pointer items-center gap-2 rounded-[12px] border border-border bg-canvas px-4 py-2.5 text-small text-text-primary has-[:checked]:border-primary has-[:checked]:bg-surface-warm"
                >
                  <input
                    type="radio"
                    value={method}
                    className="accent-primary"
                    {...register("preferredContactMethod")}
                  />
                  {titleCase(method)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex items-start gap-3">
            <Controller
              control={control}
              name="consent"
              render={({ field }) => (
                <Checkbox
                  id="consent"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={errors.consent ? "consent-error" : undefined}
                />
              )}
            />
            <div>
              <Label htmlFor="consent" required>
                I agree to the privacy notice
              </Label>
              <p className="mt-1 text-small text-text-secondary">
                We&apos;ll use your details only to respond to this enquiry.
              </p>
              {errors.consent ? (
                <p id="consent-error" role="alert" className="mt-1 text-xs font-medium text-danger">
                  {errors.consent.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {/* Form-level error / not-configured */}
      {formError ? (
        <div
          role="alert"
          className={cn(
            "flex items-start gap-3 rounded-[12px] border p-4 text-small",
            submitState.kind === "error"
              ? "border-danger/30 bg-danger/5 text-text-primary"
              : "border-warning/30 bg-warning/5 text-text-primary",
          )}
        >
          <Icon
            name="AlertTriangle"
            className={cn(
              "mt-0.5 size-5 shrink-0",
              submitState.kind === "error" ? "text-danger" : "text-warning",
            )}
            aria-hidden
          />
          <div className="flex-1">
            <p className="font-semibold">
              {submitState.kind === "error" ? "We couldn't submit your enquiry" : "Delivery not configured"}
            </p>
            <p className="mt-0.5 text-text-secondary">{formError}</p>
          </div>
          {submitState.kind === "error" ? (
            <Button type="submit" variant="secondary" size="sm" disabled={isSubmitting}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <p className="text-small text-text-tertiary sm:mr-auto">
          No account is created. Your enquiry goes straight to our team.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || submitState.kind === "submitting"}
        >
          {isSubmitting || submitState.kind === "submitting" ? (
            <>
              <Icon name="Loader2" className="size-4 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            <>
              Submit enquiry
              <Icon name="ArrowRight" className="size-4" aria-hidden />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
