import { test, expect } from "@playwright/test";

test("public demo credentials validate and log out without creating a saved profile", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Use demo account" }).click();
  await expect(page.getByLabel("Email address")).toHaveValue(
    "demo@msbahub.example",
  );
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "demo password does not match",
  );
  await page.getByRole("button", { name: "Use demo account" }).click();
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Signed in successfully",
  );
  await expect(
    page.getByRole("heading", { name: "You’re ready, Alex Morgan." }),
  ).toBeVisible();
  await expect(page.getByText("6 hours", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Log out of demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  await page.getByLabel("Email address").fill("demo@msbahub.example");
  await page.getByLabel("Password", { exact: true }).fill("still-wrong");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "demo password does not match",
  );
});

test("complete onboarding, preserve a draft, edit, save, and return through demo login", async ({
  page,
}) => {
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Create a profile" }).click();
  await page.getByLabel("Preferred name").fill("Alex");
  await page.getByLabel("Email address").fill("alex@example.com");
  await page.getByRole("button", { name: "Create demo profile" }).click();
  await page.getByRole("button", { name: "Python", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Python", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Data analyst", exact: true }).click();
  await page.getByRole("button", { name: "Technology", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Weekly networking target").fill("6");
  await page.getByRole("button", { name: "Online", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Choose at least one");
  await page.getByRole("button", { name: "Mon evening", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Review and finish" }),
  ).toBeVisible();
  await expect(
    page.getByText("Private by default", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Career direction" }).click();
  await expect(
    page.getByRole("button", { name: "Data analyst", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  for (let step = 0; step < 3; step++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Save profile and continue" }).click();
  await expect(
    page.getByRole("heading", { name: "You’re ready, Alex." }),
  ).toBeVisible();
  await expect(page.getByText("6 hours", { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill("sample-password");
  await page.getByLabel("Email address").fill("other@example.com");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "No matching demo profile",
  );
  await page.getByLabel("Email address").fill("alex@example.com");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "You’re ready, Alex." }),
  ).toBeVisible();
  expect(failures).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("signup fits the viewport and supports keyboard entry", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.locator("aside")).toHaveCount(0);
  await page.getByLabel("Email address").focus();
  await page.keyboard.type("jordan@example.com");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("signup.png"),
    fullPage: true,
  });
});
