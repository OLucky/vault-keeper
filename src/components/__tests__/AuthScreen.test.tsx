import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthScreen } from "../AuthScreen/AuthScreen";
import { useAuthStore } from "../../stores/authStore";

describe("AuthScreen", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_APP_PASSWORD", "test-password");
    useAuthStore.setState({ isAuthenticated: false });
  });

  it("renders password input and Unlock button", () => {
    render(<AuthScreen />);

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unlock" })).toBeInTheDocument();
  });

  it("shows error message when wrong password is submitted via button click", async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Unlock" }));

    expect(screen.getByText("Incorrect password. Try again.")).toBeInTheDocument();
  });

  it("shows error message when wrong password is submitted via Enter key", async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.type(screen.getByLabelText("Password"), "wrong-password{Enter}");

    expect(screen.getByText("Incorrect password. Try again.")).toBeInTheDocument();
  });

  it("clears error message when user starts typing after an error", async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Unlock" }));

    expect(screen.getByText("Incorrect password. Try again.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Password"), "a");

    expect(screen.queryByText("Incorrect password. Try again.")).not.toBeInTheDocument();
  });

  it("does not show error message initially", () => {
    render(<AuthScreen />);

    expect(screen.queryByText("Incorrect password. Try again.")).not.toBeInTheDocument();
  });
});
