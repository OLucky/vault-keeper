import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "../ConfirmDialog/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renders nothing when isOpen is false", () => {
    render(
      <ConfirmDialog
        title="Delete Item"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isOpen={false}
      />,
    );

    expect(screen.queryByText("Delete Item")).not.toBeInTheDocument();
    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  it("renders title and message when open", () => {
    render(
      <ConfirmDialog
        title="Delete Item"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isOpen={true}
      />,
    );

    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        title="Clear Log"
        message="Are you sure?"
        confirmLabel="Clear"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        isOpen={true}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        title="Delete Item"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
        isOpen={true}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("onConfirm is not called when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        isOpen={true}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onConfirm).not.toHaveBeenCalled();
  });
});
