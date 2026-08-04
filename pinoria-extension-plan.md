# Pinoria — Kế hoạch đầy đủ

## Mục tiêu

Xây Chrome Extension Manifest V3 dùng cá nhân, miễn phí và chạy cục bộ để tải Pin ảnh/video/GIF ngay trên feed hoặc tải chọn lọc toàn bộ board/section, với giao diện hòa vào Pinterest như một tính năng native.

## Phạm vi đã chốt

- Một nút tải khi hover/focus trên Pin ở Home, Search, Board và Section; hỗ trợ ảnh, GIF, video có âm thanh và carousel nhiều tài nguyên.
- Quét feed vô hạn, board riêng tư mà tài khoản hiện tại xem được, xem trước, tìm kiếm/lọc theo loại, chọn tất cả/bỏ chọn và tải lại mục lỗi.
- Tải riêng từng file, ZIP giữ cấu trúc `board/section/pin`, hoặc PDF gồm ảnh; video/GIF trong PDF dùng thumbnail kèm URL nguồn.
- Ưu tiên chất lượng gốc có thể xác minh; nếu không có thì chọn biến thể lớn nhất thực sự tải được, không ghi nhãn “original” sai.
- Không tài khoản Pinoria, không thanh toán, quota, analytics, máy chủ trung gian hay quyền cookies; dữ liệu tác vụ chỉ nằm trong trình duyệt.

## Kiến trúc

- TypeScript + Vite, Vitest; `@zip.js/zip.js` cho ZIP và `pdf-lib` cho PDF.
- `content/`: nhận diện Pin và section, chèn nút, đọc media từ DOM/dữ liệu trang, điều khiển cuộn có giới hạn.
- `background/`: xác thực message/URL, tải ảnh/video bằng `chrome.downloads` và điều phối bộ xử lý media nền.
- `content/board-download/`: quét board/section rồi tải tuần tự ngay trong trang Pinterest; tiến độ hiển thị trên nút native cạnh tiêu đề board.
- `core/`: mô hình `PinAsset`, resolver ảnh/video/GIF/carousel, đặt tên, chống trùng, retry và exporter.
- Chỉ xin `downloads`, `storage`, `activeTab` và host `https://*.pinterest.com/*`, `https://*.pinimg.com/*`.

## Giao diện native Pinterest

- Nút tải là icon tròn cùng kích thước/nhịp với cụm Share/More, đặt cạnh control native và không cạnh tranh với nút Save; chỉ hiện khi hover hoặc keyboard focus.
- Đọc `font-family`, chiều cao, radius, màu surface/text và shadow từ control Pinterest lân cận bằng `getComputedStyle`; dùng token fallback Pinterest khi DOM thay đổi.
- Trang quản lý dùng header trắng sticky, search pill, filter chip, card bo tròn/masonry, nền trung tính và nút chính đỏ; không gradient, glassmorphism hay hiệu ứng trang trí khác hệ.
- Trạng thái phản hồi trong 100 ms: download → spinner → check; lỗi dùng tooltip/toast ngắn, tiến độ dài dùng progress bar; chỉ animate `opacity/transform` và tôn trọng reduced motion.
- Shadow DOM cô lập CSS khỏi Pinterest nhưng đồng bộ token theme; mọi control có focus ring, `aria-label`, contrast WCAG AA và vùng bấm tối thiểu 40×40 px.

## Công việc

- [x] 1. Khởi tạo MV3 TypeScript/Vite, manifest, icon, ESLint/Vitest và cấu trúc `content/background/core` → Đã kiểm tra lint/typecheck/test/build và `dist/` đủ entry.
- [x] 2. Tạo `PinAsset` cùng extractor fixture cho ảnh, GIF, video/audio, carousel, board và section; cô lập selector khỏi class CSS biến động → Đã kiểm tra: 11 test extractor đạt, quảng cáo/thumbnail ngoài Pin và Pin không có media bị loại đúng lý do.
- [x] 3. Làm nút hover/focus idempotent bằng token lấy từ control Pinterest, `MutationObserver` cho feed vô hạn, trạng thái download/spinner/check/error và chặn click xuyên → Đã kiểm tra: 7 test control + 3 test tải nhanh đạt, Shadow DOM/a11y/reduced-motion hoạt động; visual diff trên Pinterest thật cần xác nhận thủ công vì workspace không có Chromium.
- [x] 4. Viết media resolver chọn URL ảnh lớn nhất đã xác minh, GIF động và MP4 có audio; fallback rõ ràng khi thiếu bản gốc → Đã triển khai: xác minh Pinterest CDN bằng HEAD/ranged GET và MIME/magic bytes, ưu tiên `originals` rồi rơi về biến thể lớn nhất, giữ GIF, tải MP4 muxed trực tiếp, bắt HLS ẩn sau URL `blob:` ngay từ `document_start`, chấp nhận playlist HLS trên allowlist mà không dùng probe CDN không tương thích, chờ offscreen listener sẵn sàng, tự thay offscreen document cũ không phản hồi, ghép tuần tự bằng Mediabunny ra OPFS stream 4 MB (fallback RAM), giảm cache input, tự thu hồi Blob/file tạm và đóng offscreen khi idle; service worker giữ Downloads API. 47 test/lint/typecheck/build đạt. Cần reload extension và tải lại tab Pinterest để thử media thật trên Chrome.
- [x] 5. Xây scanner board/section tự cuộn theo batch, chống trùng Pin ID, báo số lượng/tiến độ, hỗ trợ dừng và không cuộn khi người dùng đang tương tác → Scanner giữ kết quả xuyên feed ảo, cuộn theo batch 400 ms, chống trùng toàn phiên, pause khi pointer/touch/wheel/keyboard hoặc tab ẩn, resume sau khoảng yên, tự hoàn tất sau 4 batch ở đáy không có Pin mới và timeout an toàn 10 phút.
- [x] 6. Chèn nút đỏ “Tải board” ngay bên phải ô “Search this board” theo giao diện Pinterest → Bấm một lần sẽ tự quét rồi tải tuần tự toàn bộ Pin ngay trên trang, không mở tab/overlay; nút hiển thị tiến độ `Đang quét` và `Đang tải x/y`. Có selector và fallback theo cấu trúc hàng tìm kiếm; route ngoài board tự gỡ nút, subscription/observer/timer đều cleanup. 58 test/lint/typecheck/build đạt.
- [x] 6.1. Thêm popup cài đặt thư mục tải xuống → Bấm biểu tượng Pinoria để đổi thư mục con bên trong Downloads (mặc định `Downloads/Pinoria`), hỗ trợ đường dẫn lồng như `Pinterest/Kim Ji Won`, chuẩn hóa ký tự/path traversal trước khi gửi sang `chrome.downloads`. 62 test/lint/typecheck/build đạt.
- [x] 6.2. Phân loại tải theo folder và màu → Popup cho tạo tối đa 6 đường dẫn con, chọn màu riêng và lưu tức thời vào extension; mỗi Pin hiển thị một nút tải cho từng màu, bấm màu nào sẽ tải thẳng vào `Downloads/<folder>` tương ứng. Cài đặt cũ tự chuyển thành target đầu tiên, thay đổi được đồng bộ trực tiếp tới các tab Pinterest đang mở; tải toàn board dùng target đầu tiên làm folder mặc định.
- [x] 6.3. Tự động phân loại theo media → Bên trong mỗi folder màu, Pinoria tự đưa ảnh vào `Ảnh`, video vào `Video` và ảnh động vào `GIF` dựa trên định dạng đã xác minh từ Pinterest CDN.
- [ ] 7. Làm hàng đợi tải giới hạn đồng thời, retry/backoff, cancel, bỏ qua file trùng và tên thư mục an toàn theo board/section/pin → Kiểm tra: lỗi mạng tạm thời được thử lại, hủy dừng file mới và không tạo bản sao ngoài ý muốn.
- [ ] 8. Thêm exporter ZIP dạng streaming và PDF phân trang/nén ảnh; video/GIF trong PDF có thumbnail, loại media và link nguồn → Kiểm tra: ZIP giải nén đúng cây thư mục; PDF mở được và không vượt bộ nhớ trên board lớn thử nghiệm.
- [ ] 9. Hoàn thiện cài đặt dùng cá nhân: thư mục/tên file, hỏi vị trí lưu, mức đồng thời, tự cuộn, đồng bộ light/dark, accessibility và README Load unpacked → Kiểm tra: profile Chromium sạch cài và sử dụng được mà không đăng nhập dịch vụ Pinoria.
- [ ] 10. Chạy unit/integration, accessibility audit, visual regression và kiểm thử thật trên Home/Search/Board/Section, public/private, đủ loại media, board lớn và mạng lỗi → Kiểm tra: test/lint/build xanh, UI không lệch theme Pinterest, không lỗi console, không request ngoài Pinterest CDN và không xin quyền thừa.

## Hoàn tất khi

- [ ] Tải nhanh một Pin bất kỳ từ feed bằng một lần bấm với chất lượng tốt nhất có thể xác minh.
- [ ] Quét, xem trước, chọn và xuất board/section thành file gốc, ZIP hoặc PDF; có tiến độ, hủy, retry và phục hồi job.
- [ ] Ảnh, GIF, video có âm thanh và carousel hoạt động; loại không hỗ trợ được báo rõ, không âm thầm tải thumbnail sai.
- [ ] Nút tải và trang quản lý trông/hoạt động nhất quán với Pinterest ở light/dark, zoom 80–200%, chuột và bàn phím.
- [ ] Toàn bộ xử lý cục bộ, không tài khoản/quota/analytics và chỉ truy cập nội dung Pinterest người dùng đã nhìn thấy.

## Thứ tự bàn giao

1. Tải nhanh từng Pin → 2. Resolver đủ loại media → 3. Scanner + tải board trực tiếp → 4. ZIP/PDF → 5. Độ bền và kiểm thử toàn diện.
