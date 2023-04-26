import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
await page.goto('http://127.0.0.1:8080/');
await page.locator('html').click();
await page.getByRole('link', { name: 'Login' }).click();
await page.getByLabel('Username or email').fill('amy');
await page.getByLabel('Password').click();
await page.getByLabel('Password').fill('amy');
await page.getByRole('button', { name: 'Sign In' }).click();
await page.getByRole('link', { name: 'Start Game' }).click();
await page.getByRole('button', { name: 'New Game' }).click();
await page.getByRole('button', { name: 'Draw Card' }).click();
await page.getByRole('link', { name: 'Logout' }).click();
//
await page.getByRole('link', { name: 'Login' }).click();
await page.locator('#reset-login').click();
await page.getByLabel('Username or email').fill('bob');
await page.getByLabel('Password').click();
await page.getByLabel('Password').fill('bob');
await page.getByRole('button', { name: 'Sign In' }).click();
await page.getByRole('link', { name: 'Start Game' }).click();
await page.getByRole('button', { name: 'Draw Card' }).click();
await page.getByRole('link', { name: 'Logout' }).click();
//
await page.getByRole('link', { name: 'Login' }).click();
await page.locator('#reset-login').click();
await page.getByLabel('Username or email').fill('amy');
await page.getByLabel('Password').click();
await page.getByLabel('Password').fill('amy');
await page.getByRole('button', { name: 'Sign In' }).click();
await page.getByRole('link', { name: 'Start Game' }).click();
await page.getByRole('button', { name: 'Draw Card' }).click();
await page.getByRole('link', { name: 'Logout' }).click();
//
await page.getByRole('link', { name: 'Login' }).click();
await page.locator('#reset-login').click();
await page.getByLabel('Username or email').fill('bob');
await page.getByLabel('Password').click();
await page.getByLabel('Password').fill('bob');
await page.getByRole('button', { name: 'Sign In' }).click();
await page.getByRole('link', { name: 'Start Game' }).click();
await page.getByRole('button', { name: 'Draw Card' }).click();
await page.getByRole('link', { name: 'Logout' }).click();
await page.getByRole('link', { name: 'Login' }).click();
//


});