import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithPassword = vi.fn();
const redirect = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { signInWithPassword },
  })),
}));

vi.mock("next/navigation", () => ({ redirect }));

const { signIn } = await import("./actions");

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

beforeEach(() => {
  signInWithPassword.mockReset();
  redirect.mockReset();
});

describe("signIn", () => {
  it("redirects home on valid credentials", async () => {
    signInWithPassword.mockResolvedValue({ error: null });

    await signIn(undefined, formData({ email: "author@example.com", password: "hunter2" }));

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "author@example.com",
      password: "hunter2",
    });
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("returns an error message when Supabase rejects the credentials", async () => {
    signInWithPassword.mockResolvedValue({ error: { message: "Invalid login credentials" } });

    const result = await signIn(
      undefined,
      formData({ email: "author@example.com", password: "wrong" }),
    );

    expect(result).toEqual({ error: "Invalid email or password." });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("rejects empty fields without calling Supabase", async () => {
    const result = await signIn(undefined, formData({ email: "", password: "" }));

    expect(result?.error).toBeTruthy();
    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
