import React from "react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen, within } from "../../../../tests/test-utils";
import {
  makeBedrockResponse,
  makeEntity,
  makeGuardrailInformation,
  makeMaskedCounts,
} from "@/components/view_logs/GuardrailViewer/__tests__/fixtures";
import GuardrailViewer from "@/components/view_logs/GuardrailViewer/GuardrailViewer";

describe("GuardrailViewer", () => {
  it("shows header title, passed count, and total overhead", () => {
    const data = makeGuardrailInformation({ duration: 0.123, guardrail_status: "success" });
    renderWithProviders(<GuardrailViewer data={data} />);

    // New header text
    expect(screen.getByText("Guardrails & Policy Compliance")).toBeInTheDocument();
    // "1 guardrail evaluated"
    expect(screen.getByText(/1 guardrail evaluated/)).toBeInTheDocument();
    // Passed count
    expect(screen.getByText(/1 Passed/)).toBeInTheDocument();
    // Total overhead in ms
    expect(screen.getByText(/Total: 123ms overhead/)).toBeInTheDocument();
  });

  it("shows evaluation card with guardrail name, mode, and PASSED status", () => {
    const data = makeGuardrailInformation({
      guardrail_name: "pii-rail",
      guardrail_mode: "pre_call",
      guardrail_status: "success",
      duration: 0.045,
    });
    renderWithProviders(<GuardrailViewer data={data} />);

    // Guardrail name in evaluation card
    expect(screen.getByText("pii-rail")).toBeInTheDocument();
    // Mode formatted as uppercase with dashes
    expect(screen.getByText("PRE-CALL")).toBeInTheDocument();
    // PASSED badge (appears in evaluation card + lifecycle timeline)
    expect(screen.getAllByText("PASSED").length).toBeGreaterThanOrEqual(1);
    // Duration in ms
    expect(screen.getByText("45ms")).toBeInTheDocument();
  });

  it("shows FAILED status for non-success guardrails", () => {
    const data = makeGuardrailInformation({ guardrail_status: "fail" });
    renderWithProviders(<GuardrailViewer data={data} />);

    // FAILED appears in evaluation card + lifecycle timeline
    expect(screen.getAllByText("FAILED").length).toBeGreaterThanOrEqual(1);
  });

  it("shows masked entity chips when evaluation card is expanded", async () => {
    const user = userEvent.setup();
    const data = makeGuardrailInformation({
      masked_entity_count: { EMAIL_ADDRESS: 2, PHONE_NUMBER: 1 },
    });
    renderWithProviders(<GuardrailViewer data={data} />);

    // Card is collapsed by default; click to expand
    const cardHeader = screen.getByText("pii-rail").closest("div[class*='cursor-pointer']")!;
    await user.click(cardHeader);

    // After expanding, masked entity chips should appear
    expect(screen.getByText("EMAIL_ADDRESS: 2")).toBeInTheDocument();
    expect(screen.getByText("PHONE_NUMBER: 1")).toBeInTheDocument();
  });

  it("hides masked entity section when count is zero/empty", async () => {
    const user = userEvent.setup();
    const data = makeGuardrailInformation({ masked_entity_count: {} });
    renderWithProviders(<GuardrailViewer data={data} />);

    // Expand the card
    const cardHeader = screen.getByText("pii-rail").closest("div[class*='cursor-pointer']")!;
    await user.click(cardHeader);

    expect(screen.queryByText(/Masked Entities/)).not.toBeInTheDocument();
  });

  it("toggles evaluation card expanded/collapsed on click", async () => {
    const user = userEvent.setup();
    const data = makeGuardrailInformation({
      masked_entity_count: { EMAIL_ADDRESS: 3 },
    });
    renderWithProviders(<GuardrailViewer data={data} />);

    const cardHeader = screen.getByText("pii-rail").closest("div[class*='cursor-pointer']")!;

    // Initially collapsed — no masked entities visible
    expect(screen.queryByText("EMAIL_ADDRESS: 3")).not.toBeInTheDocument();

    // Click to expand
    await user.click(cardHeader);
    expect(screen.getByText("EMAIL_ADDRESS: 3")).toBeInTheDocument();

    // Click to collapse
    await user.click(cardHeader);
    expect(screen.queryByText("EMAIL_ADDRESS: 3")).not.toBeInTheDocument();
  });

  it("renders presidio entities inside expanded card when provider is presidio", async () => {
    const user = userEvent.setup();
    const data = makeGuardrailInformation({
      guardrail_provider: "presidio",
      guardrail_response: [makeEntity(), makeEntity()],
    });
    renderWithProviders(<GuardrailViewer data={data} />);

    // Expand the card
    const cardHeader = screen.getByText("pii-rail").closest("div[class*='cursor-pointer']")!;
    await user.click(cardHeader);

    // Presidio renders entity details — look for entity type text
    expect(screen.getAllByText(/EMAIL_ADDRESS/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders bedrock details inside expanded card when provider is bedrock", async () => {
    const user = userEvent.setup();
    const data = makeGuardrailInformation({
      guardrail_provider: "bedrock",
      guardrail_response: makeBedrockResponse({ action: "GUARDRAIL_INTERVENED" }),
    });
    renderWithProviders(<GuardrailViewer data={data} />);

    // Expand the card
    const cardHeader = screen.getByText("pii-rail").closest("div[class*='cursor-pointer']")!;
    await user.click(cardHeader);

    // Bedrock details should render — look for action text
    expect(screen.getByText("GUARDRAIL_INTERVENED")).toBeInTheDocument();
  });

  it("renders generic raw response for unknown provider when expanded", async () => {
    const user = userEvent.setup();
    const data = makeGuardrailInformation({
      guardrail_provider: "custom_provider",
      guardrail_response: { some_key: "some_value" },
    });
    renderWithProviders(<GuardrailViewer data={data} />);

    // Expand the card
    const cardHeader = screen.getByText("pii-rail").closest("div[class*='cursor-pointer']")!;
    await user.click(cardHeader);

    // Generic provider shows "Raw Guardrail Response" collapsible
    expect(screen.getByText("Raw Guardrail Response")).toBeInTheDocument();
  });

  it("defaults to presidio provider when guardrail_provider is undefined", async () => {
    const user = userEvent.setup();
    const data = makeGuardrailInformation({
      guardrail_provider: undefined,
      guardrail_response: [makeEntity()],
    });
    renderWithProviders(<GuardrailViewer data={data} />);

    // Expand
    const cardHeader = screen.getByText("pii-rail").closest("div[class*='cursor-pointer']")!;
    await user.click(cardHeader);

    // Presidio entities should render (default provider)
    expect(screen.getAllByText(/EMAIL_ADDRESS/).length).toBeGreaterThanOrEqual(1);
    // Generic "Raw Guardrail Response" should NOT appear
    expect(screen.queryByText("Raw Guardrail Response")).not.toBeInTheDocument();
  });

  it("renders multiple guardrail entries as separate evaluation cards", () => {
    const entries = [
      makeGuardrailInformation({ guardrail_name: "pii-rail", guardrail_mode: "pre_call" }),
      makeGuardrailInformation({ guardrail_name: "toxicity-rail", guardrail_mode: "post_call", guardrail_status: "fail" }),
    ];
    renderWithProviders(<GuardrailViewer data={entries} />);

    expect(screen.getByText("pii-rail")).toBeInTheDocument();
    expect(screen.getByText("toxicity-rail")).toBeInTheDocument();
    expect(screen.getByText(/2 guardrails evaluated/)).toBeInTheDocument();
    expect(screen.getByText(/1 Passed/)).toBeInTheDocument();
  });

  it("shows risk score when present", () => {
    const data = makeGuardrailInformation({ risk_score: 3 });
    renderWithProviders(<GuardrailViewer data={data} />);

    expect(screen.getByText(/Risk 3\/10/)).toBeInTheDocument();
  });

  it("shows request lifecycle section with timeline entries", () => {
    const data = makeGuardrailInformation({ guardrail_mode: "pre_call" });
    renderWithProviders(<GuardrailViewer data={data} />);

    expect(screen.getByText("Request Lifecycle")).toBeInTheDocument();
    expect(screen.getByText("Request received")).toBeInTheDocument();
    expect(screen.getByText("Response returned")).toBeInTheDocument();
    expect(screen.getByText(/Pre-call guardrail: pii-rail/)).toBeInTheDocument();
  });

  it("returns null when data is empty", () => {
    const { container } = renderWithProviders(<GuardrailViewer data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders export button", () => {
    const data = makeGuardrailInformation();
    renderWithProviders(<GuardrailViewer data={data} />);
    expect(screen.getByText("Export Compliance Log")).toBeInTheDocument();
  });

  it("displays policy template name when available", () => {
    const data = makeGuardrailInformation({
      policy_template: "HIPAA Compliance",
      guardrail_name: "pii-rail",
    });
    renderWithProviders(<GuardrailViewer data={data} />);

    // Policy template is used as display name in the evaluation card
    expect(screen.getByText("HIPAA Compliance")).toBeInTheDocument();
  });
});
