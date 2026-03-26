import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "../authStore";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false });
    vi.stubEnv("VITE_APP_PASSWORD", "test-password");
  });

  it("has isAuthenticated as false initially", () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  describe("authenticate", () => {
    it("returns true and sets isAuthenticated to true when password matches", () => {
      const result = useAuthStore.getState().authenticate("test-password");

      expect(result).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("returns false and keeps isAuthenticated as false when password is wrong", () => {
      const result = useAuthStore.getState().authenticate("wrong-password");

      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
