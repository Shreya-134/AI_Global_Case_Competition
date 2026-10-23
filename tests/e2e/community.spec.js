import { test, expect } from "@playwright/test";

test("Community supports combined filters, replies, saves, and local demo posts", async ({
  page,
}) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") pageErrors.push(message.text());
  });
  await page.goto("/community");

  await expect(
    page.getByRole("heading", { name: "Community Board" }),
  ).toBeVisible();
  await expect(page.locator(".discussion-card")).toHaveCount(4);

  await page.getByRole("button", { name: /Events & Meetups/ }).click();
  await expect(page.locator(".discussion-card")).toHaveCount(1);
  await expect(
    page.getByText("Anyone going to the LA Product & AI Networking Night?"),
  ).toBeVisible();

  await page.getByLabel("Community group").selectOption("Career Changers");
  await expect(page.getByText("No conversations found")).toBeVisible();
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(
    page.getByText(
      "Moving into entertainment analytics from a non-tech background",
    ),
  ).toBeVisible();

  await page.getByLabel("Community group").selectOption("All groups");
  await page.getByLabel("Search conversations").fill("Internships");
  await expect(page.locator(".discussion-card")).toHaveCount(1);
  await expect(
    page.getByText("Summer 2027 internship leads — product analytics"),
  ).toBeVisible();
  await page.getByLabel("Search conversations").fill("professionals");
  await expect(page.locator(".discussion-card")).toHaveCount(1);
  await expect(page.getByText("Sophia Chen")).toBeVisible();
  await page.getByLabel("Clear search").click();

  await page
    .locator(".discussion-summary")
    .filter({ hasText: "Sophia Chen" })
    .click();
  await page.getByLabel("Add a reply").fill("   ");
  await page.getByRole("button", { name: "Post Demo Reply" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Write a reply before posting.",
  );
  await page.getByLabel("Add a reply").fill("I would love to join!");
  await page.getByRole("button", { name: "Post Demo Reply" }).click();
  await expect(page.getByText("13 replies")).toBeVisible();
  await expect(page.getByText("You · Just now")).toBeVisible();

  await page.getByRole("button", { name: "Save discussion" }).click();
  await expect(
    page.getByRole("button", { name: "Saved to demo list" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .locator(".discussion-summary")
    .filter({ hasText: "Sophia Chen" })
    .click();
  await expect(page.getByLabel("Add a reply")).toHaveCount(0);
  await page
    .locator(".discussion-summary")
    .filter({ hasText: "Sophia Chen" })
    .click();
  await expect(page.getByText("I would love to join!")).toBeVisible();

  await page.getByRole("button", { name: "Start a Discussion" }).click();
  await page.getByRole("button", { name: "Publish Demo Post" }).click();
  await expect(page.getByLabel("Discussion title")).toBeFocused();
  await page.getByLabel("Discussion title").fill("Demo portfolio review");
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("Career Opportunities");
  await page
    .getByRole("textbox", { name: /^Message/ })
    .fill("Would anyone like to review a project portfolio together?");
  await page.getByRole("button", { name: "Publish Demo Post" }).click();
  await expect(page.getByText("Demo portfolio review")).toBeVisible();
  await expect(page.getByText("You (Demo)")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Demo portfolio review")).toBeVisible();
  await page
    .locator(".discussion-summary")
    .filter({ hasText: "Sophia Chen" })
    .click();
  await expect(page.getByText("I would love to join!")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Saved to demo list" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Saved to demo list" }).click();
  await page.reload();
  await page
    .locator(".discussion-summary")
    .filter({ hasText: "Sophia Chen" })
    .click();
  await expect(
    page.getByRole("button", { name: "Save discussion" }),
  ).toHaveAttribute("aria-pressed", "false");
  expect(pageErrors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("Community remains readable without horizontal overflow at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto("/");
  await page.getByRole("link", { name: "Open the Community board" }).click();
  await expect(
    page.getByRole("heading", { name: "Community Board" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
