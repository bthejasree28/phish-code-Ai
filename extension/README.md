# PhishCode AI - Gmail & Web Phishing Detector (Manifest V3)

PhishCode AI is a privacy-first, lightweight cybersecurity Chrome Extension built for Google Chrome using Manifest V3.

It provides dual layers of protection:
1. **In-Gmail Real-Time Phishing Detector (`mail.google.com`)**: Automatically detects opened emails, analyzes sender display names and email domains, inspects subject and message text, checks destination URLs and link redirects, and injects clear security badges (SAFE-LOOKING, SUSPICIOUS, HIGH RISK) directly inside Gmail.
2. **Active Tab Web Address Scanner**: Click the extension icon on your browser toolbar to scan the current webpage URL for brand typosquatting, raw IP hosts, deceptive subdomains, and malicious TLDs.

---

## Extension File Structure

Ensure your unzipped folder contains all of these files:

```
extension/
├── manifest.json       # Manifest V3 extension configuration (Gmail + activeTab)
├── content.js          # In-Gmail email, sender, link, and DOM heuristic analyzer
├── content.css         # Styling for in-Gmail PhishCode AI security badge card
├── popup.html          # Toolbar popup UI with Web Scanner & Gmail Shield tabs
├── popup.css           # Modern theme styling matching PhishCode AI
├── popup.js            # Active tab scanner and popup interaction logic
├── README.md           # This installation and testing documentation
└── icons/
    ├── icon16.png      # 16x16 icon
    ├── icon32.png      # 32x32 icon
    ├── icon48.png      # 48x48 icon
    └── icon128.png     # 128x128 icon
```

---

## How to Install in Google Chrome (Windows Instructions)

1. **Extract the ZIP Archive**
   - In your Windows Downloads folder, right-click `phishcode-ai-chrome-extension.zip`.
   - Select **Extract All...** and click **Extract**.
   - Ensure the extracted folder directly contains `manifest.json`, `content.js`, `content.css`, `popup.html`, `popup.js`, `popup.css`, `icons`, and `README.md`.

2. **Open Extensions in Chrome**
   - Launch Google Chrome.
   - In the address bar, type `chrome://extensions` and press **Enter**.
   - (Alternatively, click the 3 vertical dots in the top-right corner -> **Extensions** -> **Manage Extensions**).

3. **Turn ON Developer Mode**
   - In the upper right corner of the Extensions manager, toggle the switch labeled **Developer mode** to **ON**.

4. **Load the Unpacked Extension**
   - In the upper left corner, click the **Load unpacked** button.
   - Select the extracted extension folder (the folder containing `manifest.json`).
   - Click **Select Folder**.

5. **Pin PhishCode AI to Your Toolbar**
   - Click the puzzle piece icon (Extensions menu) next to the Chrome address bar.
   - Find **PhishCode AI - Gmail & Web Phishing Detector** and click the **Pin** icon.

---

## How to Update an Existing Installed Version

If you previously installed an older version of PhishCode AI in Chrome:
1. Extract the new ZIP file over your existing folder, or select the new extracted folder.
2. Open `chrome://extensions` in Google Chrome.
3. Locate **PhishCode AI** in the extensions list.
4. Click the circular **Reload** (refresh) icon on the PhishCode AI card.
5. If Gmail was already open in a tab, refresh the Gmail tab (`Ctrl + R` or `F5`) so the updated content script initializes.

---

## How to Test in Gmail (`mail.google.com`)

1. Open **[https://mail.google.com](https://mail.google.com)** in Google Chrome.
2. Click and open any email message in your inbox or spam folder.
3. Notice the **PhishCode AI Security Card** injected right above the email body:
   - **SAFE-LOOKING (Green):** Verified standard message hygiene, genuine corporate domains, and clean links.
   - **SUSPICIOUS (Amber):** Generic salutations, time-sensitive pressure, or unverified link targets.
   - **HIGH RISK (Red):** Brand impersonation (e.g., claiming to be PayPal or Google from an unauthorized domain), credential/password/OTP requests, or shortened/malicious hyperlinks.
4. Click **View Details** on the card to inspect extracted sender address, subject line, and inspected link destinations.

---

## Privacy & Zero-Data-Collection Guarantee

- **100% Client-Side Evaluation:** All email text, sender addresses, and links are evaluated locally in your browser memory.
- **Zero External Transmissions:** Email contents are **never** transmitted to any external servers or APIs.
- **No Password or Cookie Collection:** The extension does not collect, read, or store cookies, passwords, or unrelated personal information.
