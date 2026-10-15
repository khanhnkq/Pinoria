# Chrome Web Store Listing — Pinoria

> Last Updated: 2026-10-15  
> Version: 0.3.3  
> Target Platforms: Chrome Web Store (Manifest V3)  
> Policy Compliance: Yellow Argon (Keyword Stuffing) Resolved — "Pinterest" count strictly limited (Summary: 1, Description: 3).

---

## 1. Store Listing Metadata (English - Default)

### Extension Name [REQUIRED]

`Pinoria - Better Pinterest Video & Image Downloader`  
_(51/75 characters. Cấu trúc chuẩn chính sách Google: [Brand] - [Descriptor] [Keyword])._

### Short Description [REQUIRED]

`Download videos with sound, original HD images, and full boards. Clean, fast, and smart media downloader for Pinterest.`  
_(115/132 characters. Từ "Pinterest" xuất hiện ĐÚNG 1 LẦN, hoàn toàn triệt tiêu lỗi Yellow Argon)._

### Detailed Description [REQUIRED]

_(Plain text format, Chrome Web Store tự động loại bỏ Markdown khi paste vào Developer Dashboard)_
> ⚠️ **LƯU Ý POLICE AUDIT:** Từ khóa "Pinterest" trong đoạn văn dưới đây chỉ xuất hiện **ĐÚNG 3 LẦN** (1 lần ở câu mở đầu, 1 lần ở phần host permissions, 1 lần ở disclaimer). Mọi chỗ khác đã được thay thế tự nhiên bằng: *Pins, boards, the platform, the site, media*.

```text
Pinoria is a fast, smart, and clean media downloader crafted for creators, designers, and collectors. Save high-resolution images, animated GIFs, and 1080p videos with original audio directly into neatly organized local folders while browsing Pinterest.

Whether you need a single pin or want to archive an entire board, Pinoria provides a seamless, native-feeling experience without intrusive ads or external redirects.

🔥 KEY FEATURES:
• Smart 1-Click Quick Download: Hover over any Pin on your home feed, search results, or profile to instantly save high-quality media.
• Full MP4 Video Saver with Audio: Extract videos with crystal-clear sound and original resolution.
• Batch Board Downloader: Automatically scan and download entire boards or sections with sequential file numbering.
• Clean & Organized Storage: Automatically routes images to "Images", videos to "Videos", and animated GIFs to "GIFs".
• Multi-Folder Color Shortcuts: Organize your downloads into up to 6 custom color-coded folders (Wallpapers, References, Moodboards).
• 100% Private & Local-First: No account required, no telemetry, and zero tracking. All media processing runs directly on your machine.
• Native Platform Aesthetic: Buttons and indicators mirror the site's official design system for a fluid browsing experience.

💡 HOW TO USE:
1. Install Pinoria and pin its icon to your Chrome toolbar.
2. Browse your favorite boards and feed as usual.
3. Hover over any video or image to reveal the download button.
4. Click to download individual items, or use the "Download Board" button on any board page.

PERMISSIONS EXPLAINED:
• "downloads": Saves media files directly into your computer's Downloads directory.
• "offscreen": Processes and muxes video/audio streams into clean MP4 files locally using browser Web APIs.
• "storage": Saves your custom folder paths and color-coded shortcuts locally.
• Host permissions (*.pinterest.com, *.pinimg.com): Allows the extension to extract media elements from the page and download assets from the official CDN.

PRIVACY & SECURITY:
Pinoria respects your privacy completely:
• No user tracking or analytics.
• No account creation or login required.
• No data ever leaves your device.

DISCLAIMER:
Pinoria is an independent open-source tool and is not affiliated with, sponsored by, or endorsed by Pinterest, Inc.

SUPPORT & ISSUES:
GitHub: https://github.com/khanhnkq/Pinoria
Version 0.3.3 — Native hover quick-download, multi-folder color tagging, automatic format sorting, and full board scanner.
```

### Category [REQUIRED]

`Photos` _(hoặc `Productivity`)_

### Single Purpose Statement [REQUIRED for Developer Dashboard Review]

`"Enables users to download and organize images, GIFs, and videos from Pinterest locally into categorized folders."`

---

## 2. Multi-Language Listings (Đã chuẩn hóa tần suất từ khóa)

> Để tránh bị quét ở các ngôn ngữ khác, từ "Pinterest" cũng được giới hạn tối đa 1-2 lần ở mỗi ngôn ngữ:

### Tiếng Tây Ban Nha (Spanish - es)
- **Name:** `Pinoria - Descargar videos e imágenes de Pinterest`
- **Short Description:** `Descarga videos con audio, imágenes en alta calidad y tableros completos. Rápido, limpio y fácil de usar en Pinterest.`
- **Intro:** `Pinoria es el mejor descargador para guardar videos en MP4 con sonido, imágenes originales y tableros enteros con un solo clic.`

### Tiếng Bồ Đào Nha (Portuguese - pt_BR)
- **Name:** `Pinoria - Baixar vídeos e fotos do Pinterest`
- **Short Description:** `Baixe vídeos com áudio, fotos em alta resolução e pastas completas. Rápido, leve e organizado para Pinterest.`
- **Intro:** `Pinoria é a forma mais fácil e rápida de baixar vídeos com som e fotos em alta qualidade diretamente para o seu computador.`

### Tiếng Việt (Vietnamese - vi)
- **Name:** `Pinoria - Tải video & ảnh Pinterest chất lượng cao`
- **Short Description:** `Tải video có âm thanh, ảnh gốc HD và toàn bộ Board nhanh chóng. Giao diện sạch sẽ, an toàn và bảo mật cho Pinterest.`
- **Intro:** `Pinoria là tiện ích tải video kèm âm thanh, ảnh độ phân giải gốc và tải trọn vẹn cả bảng trực tiếp trên trình duyệt.`

---

## 3. Permissions Justification (Giải trình quyền hạn cho Google Review)

| Permission | Type | Plain-English Justification (Copy nguyên văn gửi Google) |
| :--- | :--- | :--- |
| `downloads` | permissions | Required to save downloaded images, animated GIFs, and muxed MP4 videos directly to the user's local Downloads folder. |
| `offscreen` | permissions | Used to run audio/video stream muxing and blob processing locally in an offscreen document using native browser Web APIs that are unavailable in service workers. |
| `storage` | permissions | Used exclusively to persist user download configurations, such as custom folder destination paths and color-coded tags, locally on the device. |
| `https://*.pinterest.com/*` | host_permissions | Allows content scripts to display hover download buttons and board scanner controls directly on the target website. |
| `https://*.pinimg.com/*` | host_permissions | Required to fetch and verify original full-resolution media streams and images from the official media CDN. |

---

## 4. Privacy & Data Use Disclosure

### Data Collection Form
- **Does the extension collect user data?** ❌ **NO**
- Tất cả các mục dữ liệu: Chọn **"Not Collected"**.

### Privacy Policy URL [REQUIRED]
- URL: `https://github.com/khanhnkq/Pinoria/blob/main/PRIVACY_POLICY.md`
