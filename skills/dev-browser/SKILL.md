# Dev Browser - Visual Verification

## Purpose
Browser automation with persistent page state for visual verification, testing, and debugging. Use to verify frontend changes, take screenshots, and interact with web UIs.

## When to Invoke
- "Verify in browser"
- "Take a screenshot of [page]"
- "Navigate to [url]"
- "Click on [element]"
- "Test the [feature] in browser"
- "Check if [UI element] works"
- Frontend stories with visual acceptance criteria

---

## Setup

### Install Dependencies
```bash
npm install puppeteer-core
# or
npm install puppeteer  # includes Chromium
```

### Start Browser
```bash
# Fresh profile (no cookies/logins)
node scripts/dev-browser/start.js

# With your Chrome profile (keeps logins)
node scripts/dev-browser/start.js --profile
```

This starts Chrome on port 9222 with DevTools Protocol enabled.

---

## Core Operations

### Navigate to URL
```javascript
const puppeteer = require('puppeteer-core');

async function navigate(url) {
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222'
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  return page;
}
```

### Take Screenshot
```javascript
// Full page
await page.screenshot({ path: 'tmp/screenshot.png' });

// Full page (scrollable)
await page.screenshot({ path: 'tmp/full.png', fullPage: true });

// Specific element
const element = await page.$('.my-component');
await element.screenshot({ path: 'tmp/component.png' });
```

### Click Elements
```javascript
// By selector
await page.click('button.submit');

// By text
await page.click('text=Sign In');

// Wait and click
await page.waitForSelector('.modal-button');
await page.click('.modal-button');
```

### Fill Forms
```javascript
// Type in input
await page.type('input[name="email"]', 'test@example.com');

// Clear and type
await page.$eval('input[name="email"]', el => el.value = '');
await page.type('input[name="email"]', 'new@example.com');

// Select dropdown
await page.select('select[name="country"]', 'UK');
```

### Get Page State
```javascript
// Current URL
const url = page.url();

// Page title
const title = await page.title();

// Text content
const text = await page.textContent('.message');

// Check element exists
const exists = await page.$('.success-message') !== null;
```

---

## Verification Patterns

### Verify Element Visible
```javascript
async function verifyVisible(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { visible: true, timeout });
    console.log(`✅ ${selector} is visible`);
    return true;
  } catch {
    console.log(`❌ ${selector} not visible`);
    return false;
  }
}
```

### Verify Text Content
```javascript
async function verifyText(page, selector, expectedText) {
  const text = await page.textContent(selector);
  if (text.includes(expectedText)) {
    console.log(`✅ Found "${expectedText}"`);
    return true;
  }
  console.log(`❌ Expected "${expectedText}", got "${text}"`);
  return false;
}
```

### Verify Form Submission
```javascript
async function testFormSubmission(page) {
  // Fill form
  await page.type('#email', 'test@example.com');
  await page.type('#password', 'password123');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Wait for navigation or response
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  // Verify success
  const url = page.url();
  if (url.includes('/dashboard')) {
    console.log('✅ Login successful');
    return true;
  }
  console.log('❌ Login failed');
  return false;
}
```

### Screenshot on Failure
```javascript
async function verifyWithScreenshot(page, selector, name) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    console.log(`✅ ${name} passed`);
  } catch {
    await page.screenshot({ path: `tmp/fail-${name}.png` });
    console.log(`❌ ${name} failed - screenshot saved`);
    throw new Error(`Verification failed: ${name}`);
  }
}
```

---

## Element Discovery

### Get Accessibility Tree
For unknown page layouts, get the accessibility tree to find elements:

```javascript
const snapshot = await page.accessibility.snapshot();
console.log(JSON.stringify(snapshot, null, 2));
```

Returns structure like:
```yaml
- banner:
  - link "Logo" [ref=e1]
- navigation:
  - link "Home" [ref=e2]
  - link "About" [ref=e3]
- main:
  - heading "Welcome"
  - button "Get Started" [ref=e5]
```

### Query Selectors
```javascript
// Find all buttons
const buttons = await page.$$('button');

// Find by aria-label
const closeBtn = await page.$('[aria-label="Close"]');

// Find by data attribute
const card = await page.$('[data-testid="user-card"]');
```

---

## Script Templates

### Full Page Verification
```javascript
// scripts/verify-page.js
const puppeteer = require('puppeteer-core');

async function verify() {
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  // Verify key elements
  const checks = [
    { selector: 'header', name: 'Header visible' },
    { selector: 'nav', name: 'Navigation visible' },
    { selector: 'main', name: 'Main content visible' },
    { selector: 'footer', name: 'Footer visible' },
  ];
  
  for (const check of checks) {
    const exists = await page.$(check.selector);
    console.log(exists ? `✅ ${check.name}` : `❌ ${check.name}`);
  }
  
  // Take screenshot
  await page.screenshot({ path: 'tmp/page-verify.png', fullPage: true });
  
  await browser.close();
}

verify().catch(console.error);
```

### Form Test Script
```javascript
// scripts/test-login.js
const puppeteer = require('puppeteer-core');

async function testLogin() {
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login');
  
  // Test invalid login
  await page.type('input[name="email"]', 'wrong@test.com');
  await page.type('input[name="password"]', 'wrongpass');
  await page.click('button[type="submit"]');
  
  await page.waitForSelector('.error-message');
  const errorText = await page.textContent('.error-message');
  console.log(errorText.includes('Invalid') ? '✅ Error shown' : '❌ No error');
  
  // Take screenshot
  await page.screenshot({ path: 'tmp/login-error.png' });
  
  await browser.close();
}

testLogin().catch(console.error);
```

---

## Best Practices

### 1. Local First
When verifying local development:
```javascript
// Always check if dev server is running
await page.goto('http://localhost:3000').catch(err => {
  console.error('Dev server not running. Start with: npm run dev');
  process.exit(1);
});
```

### 2. Read Source for Selectors
For projects you have access to, read the source code to get exact selectors:
```bash
# Find all data-testid attributes
grep -r "data-testid" src/
```

### 3. Wait for Hydration
React apps need hydration time:
```javascript
await page.waitForFunction(() => {
  return document.querySelector('[data-hydrated="true"]');
});
```

### 4. Screenshot Everything
When debugging, screenshot liberally:
```javascript
await page.screenshot({ path: `tmp/step-${stepNumber}.png` });
```

### 5. Handle Loading States
```javascript
// Wait for loading spinner to disappear
await page.waitForSelector('.loading-spinner', { hidden: true });

// Wait for specific content to appear
await page.waitForSelector('[data-loaded="true"]');
```

---

## Output

When verifying, provide clear pass/fail:

```markdown
## Browser Verification: [Feature]

**URL**: http://localhost:3000/[path]

### Checks
✅ Page loaded successfully
✅ Header component visible
✅ Form fields present
✅ Submit button clickable
✅ Error message displays on invalid input
✅ Success redirect works

### Screenshots
- `tmp/page-load.png` - Initial state
- `tmp/form-filled.png` - Form with data
- `tmp/success.png` - After submission

### Result: PASS ✅
```
