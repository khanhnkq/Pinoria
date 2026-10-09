# Pinoria — Private & Local-first Pinterest Downloader

**Pinoria** là một Chrome Extension (Manifest V3) chạy hoàn toàn cục bộ, bảo mật và miễn phí, giúp bạn tải ảnh, video (kèm âm thanh), ảnh động (GIF) chất lượng cao trên Pinterest. Extension được thiết kế tích hợp mượt mà vào giao diện của Pinterest như một tính năng có sẵn (native).

---

## 🌟 Tính năng nổi bật

- **Tải nhanh 1-Click (Quick Download):** 
  - Chỉ cần rê chuột (hover) hoặc dùng bàn phím để focus vào bất kỳ Pin nào trên trang chủ, trang tìm kiếm hoặc trang bảng, các nút tải tiện lợi sẽ hiển thị.
  - Tải tức thì ảnh chất lượng gốc, ảnh động GIF hoặc video MP4 gốc (đã tự động gộp/mux đường hình và đường tiếng từ CDN của Pinterest qua offscreen document).

- **Tải toàn bộ Board / Section (Quét & Tải hàng loạt):**
  - Tích hợp nút **"Tải board"** hoặc **"Tải section"** màu đỏ ngay cạnh ô tìm kiếm của Board/Section.
  - Bộ quét (scanner) tự động cuộn trang theo lô (batch), tự động nhận diện và bỏ qua các Pin bị trùng lặp, dừng thông minh khi người dùng tương tác (rê chuột, cuộn bằng tay) hoặc khi cuộn hết trang.
  - Tiến trình quét và tải được cập nhật trực quan trên nút (Ví dụ: `Đang quét...`, `Đang tải 12/50`).

- **Phân loại thư mục lưu trữ thông minh:**
  - Nhấp vào biểu tượng Pinoria trên thanh công cụ trình duyệt để cấu hình lên đến **6 thư mục tải xuống** khác nhau (nằm trong thư mục `Downloads/` của máy tính, ví dụ: `Downloads/Pinterest/Art`, `Downloads/Pinterest/Design`).
  - Mỗi thư mục lưu trữ sẽ tương ứng với một nút tải có **mã màu riêng** hiển thị khi hover trên Pin. Bạn chỉ cần nhấp vào màu tương ứng để lưu Pin vào đúng thư mục đó.
  - Tự động phân loại định dạng tập tin bên trong từng thư mục: Ảnh được lưu vào subfolder `Ảnh`, video vào subfolder `Video`, và ảnh động vào subfolder `GIF`.

- **An toàn, Riêng tư & Cục bộ:**
  - Không cần tạo tài khoản, không theo dõi hành vi người dùng, không có analytics.
  - Mọi thao tác tải và xử lý media được thực hiện trực tiếp trong trình duyệt của bạn (local-first), không đi qua bất kỳ máy chủ trung gian nào.

---

## 📦 Hướng dẫn cài đặt cho người dùng (Bản Release)

Để cài đặt và sử dụng Pinoria ngay lập tức, bạn có thể sử dụng bản đóng gói sẵn (Release) theo các bước dưới đây:

### Bước 1: Tải bản Release
- Truy cập vào trang Releases của dự án trên GitHub: [GitHub Releases](https://github.com/khanhnkq/Pinoria/releases).
- Tìm phiên bản mới nhất và tải xuống tệp tin nén `pinoria-v0.3.0.zip` tại phần **Assets**.
- *(Hoặc bạn cũng có thể tải trực tiếp file từ thư mục [releases/pinoria-v0.3.0.zip](releases/pinoria-v0.3.0.zip) trong mã nguồn dự án).*

### Bước 2: Giải nén tập tin
- Giải nén tệp tin `pinoria-v0.3.0.zip` vừa tải về. 
- Bạn sẽ thu được một thư mục có tên là `pinoria` chứa các tệp đã biên dịch chạy trực tiếp (trong đó có tệp `manifest.json`).

### Bước 3: Cài đặt vào trình duyệt Chromium (Chrome, Edge, Brave, Cốc Cốc,...)
1. Mở trình duyệt và truy cập vào trang quản lý tiện ích mở rộng bằng cách nhập địa chỉ: `chrome://extensions/`
2. Bật **"Chế độ dành cho nhà phát triển"** (Developer mode) ở góc trên bên phải màn hình.
3. Nhấp vào nút **"Tải tiện ích đã giải nén"** (Load unpacked) ở góc trên bên trái.
4. Chọn thư mục `pinoria` mà bạn vừa giải nén ở **Bước 2** (hãy chắc chắn chọn đúng thư mục chứa trực tiếp file `manifest.json`).

Sau khi cài đặt thành công, biểu tượng Pinoria sẽ xuất hiện trên thanh công cụ của trình duyệt. Bạn hãy ghim (pin) extension này để dễ dàng thao tác cấu hình.

---

## 🛠️ Hướng dẫn sử dụng

### 1. Cấu hình thư mục và Mã màu
- Nhấp vào biểu tượng Pinoria trên thanh công cụ.
- Tạo hoặc chỉnh sửa các thư mục con tùy ý (đường dẫn tương đối bên trong thư mục `Downloads/`, ví dụ: `Pinterest/Wallpaper`).
- Chọn màu sắc đại diện cho từng thư mục (có tối đa 6 thư mục tương đương với 6 mã màu khác nhau).
- Nhấp **Lưu cài đặt**. Extension sẽ tự động cập nhật giao diện trên các tab Pinterest đang mở.

### 2. Tải nhanh từng Pin
- Truy cập Pinterest và rê chuột vào Pin bất kỳ.
- Bạn sẽ thấy các chấm tròn có màu tương ứng với các thư mục bạn đã cấu hình xuất hiện ở góc Pin.
- Nhấp vào màu mong muốn để tải ngay Pin đó vào thư mục tương ứng.

### 3. Tải toàn bộ Board / Section
- Vào trang cá nhân hoặc Board bất kỳ trên Pinterest.
- Ở bên phải thanh tìm kiếm của board đó, bạn sẽ thấy nút màu đỏ **Tải board** (hoặc **Tải section**).
- Nhấp vào nút này, hệ thống sẽ tự động quét toàn bộ board và tải xuống tuần tự các Pin vào thư mục mặc định đầu tiên của bạn.

---

## 💻 Hướng dẫn phát triển (Dành cho Lập trình viên)

Dự án được xây dựng trên nền tảng **TypeScript**, sử dụng **Vite** và **@crxjs/vite-plugin** để biên dịch Extension Manifest V3.

### Yêu cầu hệ thống
- **Node.js** >= `22.12.0`

### Các câu lệnh kiểm tra và biên dịch
- **Chạy môi trường phát triển (Dev Mode):**
  ```bash
  npm run dev
  ```
  *Lưu ý: Bạn có thể load thư mục `dist` vào Chrome ở chế độ dev. Vite sẽ tự động hot-reload khi bạn sửa code.*

- **Biên dịch bản Production:**
  ```bash
  npm run build
  ```
  *Sản phẩm đầu ra sẽ nằm trong thư mục `dist/`.*

- **Chạy toàn bộ quy trình kiểm tra (Lint, Typecheck, Test, Build):**
  ```bash
  npm run check
  ```

- **Chạy Unit Test với Vitest:**
  ```bash
  npm run test
  ```

---

## 🔒 Quyền hạn yêu cầu (Permissions)

Extension chỉ sử dụng các quyền tối thiểu để hoạt động cục bộ:
- `downloads`: Để lưu trữ file trực tiếp vào máy tính của bạn.
- `storage`: Để lưu các cấu hình thư mục lưu trữ và mã màu của bạn.
- Quyền truy cập các Host: `https://*.pinterest.com/*` và `https://*.pinimg.com/*` để quét ảnh/video và tải file từ CDN Pinterest.
