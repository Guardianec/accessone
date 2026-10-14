import { test, expect, type Page } from '@playwright/test';
const press = async (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true }).click();
const choose = async (page: Page, label: string, value: string) =>
  page
    .getByRole('group', { name: label, exact: true })
    .getByRole('button', { name: value, exact: true })
    .click();
const select = async (page: Page, label: string, value: string) =>
  page.getByLabel(label, { exact: true }).selectOption(value);
test('complete flow, real local counters, no form transmission, refresh and reset', async ({
  page,
}) => {
  const errors: string[] = [];
  const transmissions: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (
      ['fetch', 'xhr', 'websocket', 'eventsource', 'ping'].includes(
        r.resourceType(),
      ) ||
      r.method() !== 'GET'
    )
      transmissions.push(`${r.method()} ${r.url()}`);
  });
  await page.goto('/?debug=1&fast=1');
  await press(page, 'Begin setup');
  await press(page, 'Let’s get started');
  for (const provider of [
    'Google',
    'Apple',
    'Microsoft',
    'GitHub',
    'Discord',
  ]) {
    await press(page, provider);
    await expect(
      page.getByText(`${provider} is unavailable`, { exact: true }),
    ).toBeVisible();
  }
  await press(page, 'Continue manually');
  await press(page, 'Continue');
  await expect(page.getByRole('alert')).toContainText('entropy');
  await page
    .getByLabel('Preferred nickname', { exact: true })
    .fill('PotatoPilot');
  await select(page, 'Approximate age category', 'Time is a social construct');
  await choose(page, 'Dominant hand', 'Depends what I’m holding');
  await press(page, 'Continue');
  await select(page, 'Favorite color', 'Green');
  await select(page, 'Preferred food category', 'Pizza');
  await select(page, 'Favorite season', 'Autumn');
  await select(page, 'Cat or dog?', 'Whichever pays rent');
  for (const [q, v] of [
    ['Your natural schedule', 'Barely a person'],
    ['Preferred operating fluid', 'Coffee'],
    ['Browser tabs currently open', '6–15'],
    ['How many are actually necessary?', 'All of them'],
    ['Alarms required to wake up', '2'],
    ['How often do you say “I’ll do it tomorrow”?', 'Daily'],
    ['How trustworthy are pigeons?', 'Under investigation'],
    ['Is cereal soup?', 'I need legal counsel'],
  ])
    await choose(page, q, v);
  await press(page, 'Save profile');
  await select(page, 'Approximate timezone', 'UTC+02:00');
  await select(page, 'Interface language', 'English');
  await select(page, 'Country / region', 'Prefer not to specify');
  await select(page, 'Urban environment preference', 'Cave with Wi-Fi');
  await choose(page, 'Preferred number of digits in a postal code', '5');
  await press(page, 'Continue');
  await page
    .getByLabel('I have reviewed and accept the terms of access.')
    .check();
  await press(page, 'Accept & continue');
  await page
    .getByLabel('I acknowledge that I have read the Privacy Summary.')
    .check();
  await expect(page.getByText(/Statistical anomaly/)).toBeVisible();
  await page
    .getByLabel('I acknowledge that I probably did not actually read it.')
    .check();
  await press(page, 'Continue');
  await press(page, 'Configure preferences');
  await expect(
    page.getByRole('checkbox', { name: 'Analytics', exact: true }),
  ).toBeDisabled();
  await press(page, 'Reject unnecessary cookies');
  await page.getByLabel('I am not a robot.').click();
  await press(page, 'Sleeping');
  await press(page, 'Verify selection');
  await choose(
    page,
    'Which object is most likely plotting against you?',
    'Printer',
  );
  await press(page, 'Move Triangle up');
  await press(page, 'Confirm assessment');
  await page.getByLabel('Enter the six-digit code').fill('123456');
  await press(page, 'Verify code');
  await expect(page.getByRole('alert')).toContainText('mismatch');
  await page.getByLabel('Enter the six-digit code').fill('482731');
  await press(page, 'Verify code');
  await page.getByLabel('Enter the six-digit code').fill('196204');
  await press(page, 'Verify code');
  await press(page, 'Start calibration');
  for (let i = 0; i < 3; i++) await press(page, 'Register interaction');
  await press(page, 'Circle: activate to place in square');
  for (let i = 0; i < 3; i++) await press(page, `Click registered: ${i} / 3`);
  await choose(
    page,
    'Which statement sounds most human?',
    'I sometimes walk into rooms and forget why.',
  );
  await press(page, 'Continue');
  for (let i = 0; i < 36; i++) {
    await choose(page, 'How much do you agree?', 'Agree');
    await press(page, i === 35 ? 'Complete assessment' : 'Next question');
  }
  await expect(
    page.getByText('Your setup is 93% complete.', { exact: false }),
  ).toBeVisible();
  await press(page, 'Resolve requirement');
  await select(page, 'Choose a fictional first Wi-Fi network', 'Linksys');
  await choose(
    page,
    'Which childhood object would betray you first?',
    'Teddy bear',
  );
  await choose(page, 'Preferred emergency snack', 'Cheese');
  await select(
    page,
    'Your plan when the Wi-Fi stops working',
    'Stare at the router',
  );
  await press(page, 'Continue');
  await choose(page, 'Which button looks more clickable?', 'A — Continue');
  await choose(page, 'Preferred corner radius', '10px');
  await choose(page, 'Preferred shade of gray', 'Politely graphite');
  await choose(page, 'Preferred checkbox animation', 'Quietly checked');
  await press(page, 'Apply precise preferences');
  await page
    .getByLabel('I confirm that the information above is mostly accurate.')
    .check();
  await press(page, 'Approve final review');
  await page.getByLabel('I confirm that I completed the verification.').check();
  await page
    .getByLabel('I confirm my confirmation of the completed verification.')
    .check();
  await choose(
    page,
    'How meaningful did the verification feel?',
    'I have lost perspective',
  );
  await press(page, 'Verify verification');
  await page
    .getByLabel(
      'I am ready to finalize this account, whatever that means at this point.',
    )
    .check();
  await press(page, 'Finalize Account');
  await expect(
    page.getByRole('heading', { name: 'bro you really did all that 💀' }),
  ).toBeVisible();
  await press(page, '🎉 Nothing');
  await expect(page.getByText(/advanced science/)).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Provider Collector', exact: true }),
  ).toBeVisible();
  const saved = await page.evaluate(() =>
    sessionStorage.getItem('accessone.session.v1'),
  );
  expect(saved).not.toContain('PotatoPilot');
  expect(saved).not.toContain('answers');
  const state = JSON.parse(saved!);
  expect(state.captchas).toBe(2);
  expect(state.lies).toBe(4);
  expect(state.providers).toHaveLength(5);
  expect(
    state.questionIds.filter((q: string) => q.startsWith('personality-')),
  ).toHaveLength(36);
  expect(state.clicks).toBeGreaterThan(65);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'bro you really did all that 💀' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(transmissions).toEqual([]);
  await press(page, 'Restart this terrible experience');
  await expect(
    page.getByRole('heading', { name: 'Your personal access. One place.' }),
  ).toBeVisible();
});
test('mobile layout, resume, cancel modal and keyboard escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({
    path: 'docs/mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await press(page, 'Begin setup');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'A little setup. A better start.' }),
  ).toBeVisible();
  await press(page, 'Cancel setup');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await press(page, 'Cancel setup');
  await press(page, 'Escape while you still can');
  await expect(
    page.getByRole('heading', { name: 'Your personal access. One place.' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test('all stages fit mobile and desktop; no credentials or permission APIs', async ({
  page,
}) => {
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const stage of [
      'welcome',
      'providers',
      'profile',
      'regional',
      'terms',
      'privacy',
      'cookies',
      'captcha',
      'captcha-two',
      'two-factor',
      'device',
      'browser',
      'human',
      'personality',
      'additional',
      'security',
      'preferences',
      'final-review',
      'dependency',
      'confirmation',
      'processing',
      'reveal',
    ]) {
      await page.goto(`/?debug=1&stage=${stage}`);
      await expect(page.locator('main')).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${stage} at ${width}px`,
      ).toBe(true);
      expect(
        await page
          .locator('input[type=password], input[type=email], input[type=tel]')
          .count(),
      ).toBe(0);
      if (width === 1440 && stage === 'welcome')
        await page.screenshot({
          path: 'docs/desktop.png',
          fullPage: true,
          animations: 'disabled',
        });
      if (width === 1440 && stage === 'providers')
        await page.screenshot({
          path: 'docs/providers.png',
          fullPage: true,
          animations: 'disabled',
        });
    }
  }
});
test('production-length processing completes with reduced motion and no data transmissions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?debug=1&stage=processing');
  const events: string[] = [];
  page.on('request', (r) => {
    if (
      new URL(r.url()).origin !== new URL(page.url()).origin ||
      r.method() !== 'GET' ||
      ['fetch', 'xhr', 'ping', 'eventsource'].includes(r.resourceType())
    )
      events.push(r.url());
  });
  const started = Date.now();
  await expect(
    page.getByRole('heading', { name: 'bro you really did all that 💀' }),
  ).toBeVisible({ timeout: 35000 });
  expect(Date.now() - started).toBeGreaterThan(28000);
  expect(events).toEqual([]);
  await page.screenshot({
    path: 'docs/reveal.png',
    fullPage: true,
    animations: 'disabled',
  });
});
