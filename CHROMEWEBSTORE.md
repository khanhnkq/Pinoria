# Chrome Web Store Listing — Pinoria

> Last Updated: 2026-10-07  
> Version: 0.3.0  
> Target Platforms: Chrome Web Store (Manifest V3)

---

## 1. Store Listing Metadata

### Extension Name [REQUIRED]

`Pinoria - Media Downloader for Pinterest`  
_(Max 75 characters. Đặt tên "Pinoria" làm thương hiệu chính, kèm mô tả chức năng "Media Downloader for Pinterest" hoàn toàn hợp lệ theo chính sách của Google)._

### Short Description [REQUIRED]

`Download high-quality images, animated GIFs, and videos directly from Pinterest with customizable folders and clean native UI.`  
_(127 characters. Tối đa 132 ký tự)._

### Detailed Description [REQUIRED]

_(Plain text format, Chrome Web Store tự động loại bỏ Markdown)_

```text
Pinoria is a fast, local-first media downloader and organizer crafted specifically for Pinterest. Designed with a clean native look, Pinoria blends seamlessly into your Pinterest feed without disrupting your browsing experience.

KEY FEATURES
• 1-Click Quick Download: Hover over any Pin on Home, Search, or Boards to instantly download original high-resolution images, animated GIFs, or full MP4 videos with audio.
• Batch Board & Section Downloader: Automatically scan and download entire Pinterest boards or sections sequentially right on the page without opening extra tabs.
• Multi-Folder Organization: Configure up to 6 custom destination folders (e.g., Wallpaper, Reference, Art) with individual color tags directly from the popup settings.
• Automatic Media Sorting: Automatically routes images to an "Images" subfolder, videos to "Videos", and animated GIFs to "GIFs" inside your selected target directory.
• 100% Private & Local-First: Zero telemetry, zero external servers, and zero cloud uploads. All video muxing, stream assembly, and file downloads execute strictly offline on your own machine.
• Native Pinterest Aesthetic: Buttons and progress indicators mirror Pinterest's official design system for a fluid, natural feel.

HOW TO USE
1. Install Pinoria and pin its icon to your Chrome toolbar.
2. Open the extension popup to set up your destination folders and color shortcuts (optional).
3. Browse Pinterest as usual. Hover over any Pin to see the quick download button.
4. Click to download individual Pins, or use the "Download Board" button on any board page to export the entire collection.

PERMISSIONS EXPLAINED
• "downloads": Saves media files directly into your computer's Downloads directory.
• "offscreen": Processes and muxes video/audio streams into clean MP4 files locally using browser Web APIs.
• "storage": Saves your custom folder paths and color-coded shortcuts locally.
• "activeTab": Interacts with the active Pinterest tab when clicking the extension icon.
• Host permissions (*.pinterest.com, *.pinimg.com): Allows the extension to extract media elements and download assets directly from Pinterest CDN.

PRIVACY & SECURITY
Pinoria respects your privacy completely:
• No user tracking or analytics.
• No account creation or login required.
• No data ever leaves your device.

SUPPORT & ISSUES
Found a bug or have a suggestion?
GitHub: https://github.com/khanhnkq/Pinoria

Version 0.3.0 — Native hover quick-download, multi-folder color tagging, automatic format sorting, and full board scanner.
```

### Category [REQUIRED]

`Photos` _(hoặc `Productivity`)_

### Single Purpose Statement [REQUIRED for Developer Dashboard Review]

`"Enables users to download and organize images, GIFs, and videos from Pinterest locally into categorized folders."`

---

## 2. Graphics & Assets Checklist

| Asset                          | Dimensions                 | Format   | Status      | File Path                                                       |
| ------------------------------ | -------------------------- | -------- | ----------- | --------------------------------------------------------------- |
| **Store Icon** [REQUIRED]      | 128×128 px                 | PNG      | ✅ Ready    | `/Users/nguyenkimquockhanh/Desktop/Pinoria_Icon_128x128.png`    |
| **Screenshot 1** [REQUIRED]    | 1280×800 px                | PNG      | ✅ Ready    | `/Users/nguyenkimquockhanh/Desktop/Pinoria_Screenshot_1_1280x800.png` |
| **Screenshot 2** [RECOMMENDED] | 1280×800 px                | PNG      | ✅ Ready    | `/Users/nguyenkimquockhanh/Desktop/Pinoria_Screenshot_2_1280x800.png` |
| **Small Promo Tile**           | 440×280 px                 | PNG/JPEG | ⬜ Tùy chọn | Banner quảng bá hiển thị trên trang chủ store                   |

---

## 3. Permissions Justification (Giải trình quyền hạn cho Google Review)

_Điền vào form "Permissions justification" trên Developer Dashboard:_

| Permission                  | Type             | Plain-English Justification (Copy nguyên văn gửi Google)                                                                                                          |
| --------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `downloads`                 | permissions      | Required to save downloaded images, animated GIFs, and muxed MP4 videos directly to the user's local Downloads folder.                                            |
| `offscreen`                 | permissions      | Used to run audio/video stream muxing and blob processing locally in an offscreen document using native browser Web APIs that are unavailable in service workers. |
| `storage`                   | permissions      | Used exclusively to persist user download configurations, such as custom folder destination paths and color-coded tags, locally on the device.                    |
| `activeTab`                 | permissions      | Grants temporary access to the active Pinterest tab when the user clicks the extension action or quick download controls.                                         |
| `https://*.pinterest.com/*` | host_permissions | Allows content scripts to display hover download buttons and board scanner controls directly on Pinterest pages.                                                  |
| `https://*.pinimg.com/*`    | host_permissions | Required to fetch and verify original full-resolution media streams and images from Pinterest's official media CDN.                                               |

---

## 4. Privacy & Data Use Disclosure

### Data Collection Form

- **Does the extension collect user data?** ❌ **NO**
- Tất cả các mục dữ liệu: Chọn **"Not Collected"**.

### Data Use Certification

- [x] Extension does not sell user data to third parties.
- [x] Extension does not use or transfer data for purposes unrelated to the item's single purpose.
- [x] Extension does not use or transfer user data for creditworthiness or lending purposes.

### Privacy Policy URL [REQUIRED]

- URL: `https://github.com/khanhnkq/Pinoria/blob/main/PRIVACY_POLICY.md`

---

## 5. Distribution Settings

- **Visibility:** Public
- **Regions:** All regions
- **Pricing:** Free
