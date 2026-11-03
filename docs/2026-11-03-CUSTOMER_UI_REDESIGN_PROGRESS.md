# Thiết kế lại khu Khách hàng (`/customer/*`) — tiến độ

Cập nhật: 2026-11-03 (Phase 1–5 + rà ảnh xong). Tài liệu bàn giao để phiên sau làm tiếp. Đọc kèm `AGENTS.md` và `docs/ARCHITECTURE.md`.

## 0. Quy tắc bắt buộc

- **Không commit, không push.** Chủ dự án tự commit; mình chỉ đề xuất commit message (cuối file).
- Chỉ đổi tầng giao diện / UX. **Giữ nguyên**: API, logic nghiệp vụ, quy tắc đặt lịch / giá / thanh toán, dữ liệu, i18n
  VI/EN, route và query params. Đổi route thì phải redirect route cũ. Gộp / ẩn tính năng nào thì ghi vào tổng kết.
- Mọi chữ hiển thị qua i18n (`app/shared/i18n`, thêm cả `vi` lẫn `en`); lint `project/no-hardcoded-ui-text` chặn chữ cứng.
  Không bao giờ in enum thô.
- Sau mỗi phase: `pnpm typecheck`, `pnpm lint`, `npx prettier --check app`, `npx vitest run`, rồi chụp màn hình bằng
  Playwright ở 1280 px và 375 px (mục 6).

## 1. Brief gốc (rút gọn)

Người dùng chính: con cái 30–50 tuổi đặt người chăm sóc cho cha mẹ, cần rõ ràng, đáng tin, ít thao tác.

**Design system**: primary xanh đậm `#0E5A3A` (thang 50–900), nền `#F7F7F4`, viền `#E6E8E3`, chữ `#1A1F1C` / `#5F6B66`;
màu trạng thái amber (chờ), blue (xác nhận), teal (đang chăm sóc), green (xong), red (hủy), gray. Font Be Vietnam Pro;
scale 30/24/20/18/16/14/13/12; heading 600–700, letter-spacing 0 → -0.01em, line-height ≥ 1.25; body 1.55. Lưới 4/8;
radius 8 / 12 / 16 / full; 2 mức shadow. Container 1200 px, padding 24 px (mobile 16 px).

**Motion**: 150–250 ms, `cubic-bezier(0.2,0.8,0.2,1)`, tôn trọng `prefers-reduced-motion` (chỉ giữ fade). Chuyển trang
fade + translateY 8 px chỉ ở vùng nội dung; progress bar 2 px; skeleton đúng hình dạng; danh sách stagger 30–40 ms
(tối đa ~8 item); nút hover / active `scale(0.98)` / loading; card click được nâng shadow + translateY(-2px); tabs có
indicator trượt; dropdown / modal fade + scale 0.96 → 1; drawer trượt phải (mobile: từ dưới); toast cho kết quả hành động.

**Văn phong**: xưng "bạn", mỗi trang 1 tiêu đề + 1 dòng mô tả, quy tắc phức tạp dùng chip / icon / tooltip. Thuật ngữ:
Người chăm sóc · Người thân / Người được chăm sóc · Lịch đặt · Buổi chăm sóc · Trung tâm (bỏ "Người bệnh").

**Responsive & a11y**: kiểm tra 375 / 768 / 1280 / 1440; vùng chạm ≥ 44 px; WCAG AA; aria-label cho icon button; focus
trap trong modal; thông báo lỗi gắn `aria-describedby`.

## 2. Đã xong

### Phase 1 — Design system + layout

- `app/app.css`: theme khách hàng **chỉ áp trong `.theme-customer`** (portal khác giữ nguyên): Be Vietnam Pro, màu nền /
  viền / chữ mới, thang `--color-brand-50…900`, `--shadow-card` / `--shadow-raised`, `--ease-out-soft`, các class motion
  `cc-fade-up`, `cc-stagger`, `cc-step-forward/back`, `cc-pop`, `cc-flash`, `cc-scale-in`, `cc-collapse` (height auto),
  `cc-skeleton`, `cc-route-progress`, `cc-lift`, `cc-check-draw`, `cc-no-scrollbar`, drawer / sheet. Reduced motion chỉ
  giữ fade. Ô nhập trong theme có line-height gọn, textarea tự giãn (`field-sizing: content`).
- `app/shared/lib/format.ts`: `useFormat()` → tiền "100.000 ₫", ngày luôn "20/05/1945" (EN cũng ngày trước tháng),
  giờ 24h, `dateTime` "08:00 · T6, 06/11/2026", `visitRange` "T6, 06/11/2026 · 08:00–10:00", `timeRange`, `duration`.
  `entities/booking/booking-format.ts` cũng chuyển sang dd/mm và 24h (áp cho mọi portal).
- Component mới trong `app/shared/ui/`: `choice-card` (RadioCard / CheckboxCard), `stepper`, `date-picker`
  (dd/mm/yyyy + lịch popover, khóa ngày ngoài min/max, có tooltip lý do), `time-select` (24h), `drawer` (phải /
  sheet dưới), `page-header` + `pageContainer`, `segmented-control`, `rating` (`Rating` hiện "Mới" khi chưa có đánh giá,
  `VerifiedBadge`), `skeleton`, `copy-button`, `search-input` (icon, nút xóa, debounce), `filter-chips`,
  `filter-menu-chip` (`FilterMenuChip` popover + `ActiveFilters`). `avatar` có màu nền suy từ tên + prop `alt`.
  `site-footer` gọn có hotline.
- Header mới (`features/customer/layout`): 64 px sticky; nav Trang chủ · Người chăm sóc · Dịch vụ · Lịch đặt (badge số
  lịch chờ thanh toán); nút "Đặt lịch"; chip trung tâm (1 trung tâm = nhãn tĩnh + tự chọn, >1 = dropdown, lỗi = dropdown
  để thử lại); chuông; menu avatar (Tài khoản, Người thân, Thanh toán, Lời mời, Ngôn ngữ, Đăng xuất). Mobile: bottom nav
  (Trang chủ, Tìm, Đặt lịch, Lịch đặt, Tài khoản). Footer ẩn ở `/customer/booking`. Progress bar khi chuyển route.
- Nhãn "Chờ phân người chăm sóc" → "Chờ phân công người chăm sóc". Mã nhóm dịch vụ dạng enum (`ELDERLY_CARE`…) được
  map về 6 nhóm trong `entities/care-catalog/service-category.ts` (thêm `SERVICE_CATEGORY_ICONS`).
- Sửa ô nhập bị cắt chữ: đổi `h-*` cố định thành `min-h-* py-*` ở hồ sơ cá nhân, tạo hồ sơ người thân, bộ lọc dịch
  vụ, ô tìm trung tâm.

### Phase 2 — Đặt lịch thành wizard 4 bước (`features/customer/booking`)

- Bước: Người được chăm sóc → Dịch vụ & người chăm sóc → Lịch chăm sóc → Xem lại & gửi; khối "Tóm tắt & báo giá"
  sticky (mobile: bottom bar + sheet). Payload gửi API **không đổi** (đã kiểm chứng trên stack thật cho cả 3 loại lịch).
- Prefill `?center`, `?service` (tick thật), `?caregiver`, `?patient` / `?patientId`; mở thẳng bước còn thiếu.
- Drawer tạo nhanh hồ sơ người thân; Drawer xem hồ sơ người chăm sóc; "Để trung tâm phân công" mặc định.
- Loại lịch bằng RadioCard kèm chip quy tắc (đặt trước, thanh toán); "Theo ca" bị khóa khi chưa chọn người chăm sóc,
  có nút quay về Bước 2. Theo ca: chip ngày + ô ca. Định kỳ: Hằng ngày / Hằng tuần, chip thứ, DatePicker, preview số
  buổi. Tự chọn: hàng buổi có nhân bản / xóa, lỗi trùng giờ / quá sớm ngay tại hàng.
- Bước 4: các khối có "Sửa"; **báo giá từng dịch vụ: Đơn giá · Số lượng · Thành tiền** (`quote-lines.tsx`, cũng hiện
  trong khối Tóm tắt); cọc + phần còn lại + hạn; timeline "Điều gì xảy ra tiếp theo"; checkbox chính sách hủy (Modal).
  Sau khi gửi: màn hình thành công có mã copy được.
- Chặn gửi 2 lần (ref), cảnh báo rời trang (`useBlocker` + `beforeunload`), nháp trong `sessionStorage`
  (**không lưu ghi chú** vì có thể chứa thông tin sức khỏe).
- Thay đổi hành vi có chủ đích: chỉ có 1 hồ sơ người thân thì tự chọn; báo giá chỉ gọi khi người dùng đã mở bước Lịch;
  lịch vi phạm thời gian đặt trước tối thiểu bị chặn ở client (trước đây để backend từ chối).

### Phase 3 — Trang chủ, Dịch vụ, Người chăm sóc

- `features/home`: hero gọn duy nhất (lời chào theo tên), dashboard khách hàng (`components/customer-dashboard.tsx`:
  Lịch sắp tới + nút "Thanh toán cọc" khi cần, lối tắt có số lịch chờ thanh toán, dịch vụ nổi bật có giá, người chăm sóc
  nổi bật), Cách hoạt động, khối niềm tin + hotline. Bỏ ảnh nền lớn thứ hai và `home-page.css`.
- Dịch vụ: tiêu đề "Dịch vụ chăm sóc tại nhà", PageHeader + `CenterContextLine` (chỉ hiện khi >1 trung tâm), 1 hàng
  lọc (tìm debounce + chip nhóm + sắp xếp; ≤ 6 dịch vụ chỉ giữ ô tìm), lưới 3/2/1, 1 dòng giá, phân trang ẩn khi 1 trang.
- Người chăm sóc: bỏ hero / sidebar / toggle list-grid; ô tìm + chip Giới tính / Kinh nghiệm / Sắp xếp + hàng "Đang lọc";
  thẻ mới có avatar chữ cái, "Mới", "Đặt lịch" (→ `/customer/booking?caregiver=…`).
- Chi tiết dịch vụ / người chăm sóc: breadcrumb thay nút "Quay lại", nhóm dịch vụ đã dịch, ngày dd/mm/yyyy, header
  người chăm sóc gọn.
- Sửa lỗi có từ trước: `useServiceCenter` và trang chi tiết dịch vụ dùng chung khóa cache `providerKeys.publicCenter`
  nhưng lưu dữ liệu khác dạng nên tên trung tâm trống → `useServiceCenter` dùng khóa con `[..., 'option']`.

Kiểm tra lần cuối Phase 1–3: typecheck / lint / prettier sạch, **358/358 test**, `pnpm build` thành công.

### Phase 4 — Lịch đặt + Thanh toán

- Component dùng chung mới: `shared/ui/tabs.tsx` (indicator trượt, badge, phím mũi tên / Home / End; phiên làm khu
  Caregiver cũng đã dùng — **giữ nguyên API**), `shared/ui/action-menu.tsx` (nút ⋯, mục `danger`),
  `shared/lib/use-clock.ts` (now cập nhật mỗi phút cho đếm ngược), `shared/lib/fold-text.ts` (bỏ dấu khi tìm).
  `Stepper` thêm `note` / `noteTone` (dòng hạn dưới bước, hỗ trợ `
`), đường nối tính theo số bước, và khi mọi bước
  `done` thì bản mobile hiện bước cuối.
- **Danh sách** (`features/customer/bookings`): BookingService chỉ lọc 1 trạng thái/lần nên đọc tối đa 500 lịch đặt
  (`fetchBookingCollection`, trang 100 × 5, key `bookingKeys.collection`) rồi gộp tab ở client (`booking-groups.ts`):
  Tất cả · Cần xử lý (chờ cọc + CONFIRMED có hóa đơn phần còn lại đang mở, lấy từ `GET /payments/me/outstanding`) ·
  Sắp tới · Đang diễn ra · Đã xong · Đã hủy (từ chối / hủy / hết hạn), badge số lượng. Tìm theo mã **hoặc tên người
  thân** (không dấu, debounce) + sắp xếp 1 hàng; phân trang client 10/trang. URL: `?tab=&q=&sort=&page=`; link cũ
  `?status=X` vẫn lọc đúng trạng thái đó (chip "Đang lọc"), sort cũ `createdAt,desc`… vẫn hiểu. Thẻ: avatar chữ cái,
  tên + StatusBadge, mã copy được, loại lịch, buổi kế tiếp nổi bật, tiến độ, tổng tiền, gợi ý theo trạng thái, CTA
  "Thanh toán cọc" (→ `/deposit`) / "Thanh toán phần còn lại" (→ chi tiết) / "Xem chi tiết"; cả thẻ bấm được. Khách
  chưa có lịch: EmptyState + "Đặt lịch".
- **Chi tiết**: PageHeader (breadcrumb, tên người được chăm sóc, badge, mã copy, loại lịch) + menu ⋯ "Hủy lịch đặt"
  (dialog cũ giữ nguyên: xem trước tiền hoàn, chính sách, lý do). Stepper vòng đời (`booking-lifecycle.ts`): Gửi yêu
  cầu → Trung tâm xác nhận → Phân công → Thanh toán → Đang chăm sóc → Hoàn tất; bước hiện tại ghi hạn + đếm ngược
  (màu cảnh báo khi < 6 giờ), bước chăm sóc ghi buổi đầu / số buổi đã xong; ẩn với lịch bị từ chối / hủy / hết hạn.
  Cột phải sticky: khối "Bước tiếp theo" + nút thanh toán (trước nằm cột trái), rồi người chăm sóc, lịch & địa chỉ,
  dịch vụ (đơn giá · đơn vị × số lượng), thanh toán. Cột trái: các buổi (có số lượng), chăm sóc sau (báo cáo, đánh
  giá, khiếu nại), lịch sử. Skeleton đúng hình dạng.
- **Thanh toán & hoàn tiền** (`features/customer/payments`): tabs `?tab=` Cần thanh toán (badge) · Lịch sử · Hoàn
  tiền. "Cần thanh toán" gộp lịch đặt chờ cọc (nút → trang cọc) và hóa đơn phần còn lại đang mở (nút VNPay). "Lịch
  sử" = giao dịch + toàn bộ hóa đơn phần còn lại (giữ danh sách cũ). Hàng giao dịch: mã lịch đặt + tên người thân
  (tra từ danh sách lịch đặt đã cache), thời gian, "Qua VNPay", số tiền, đã hoàn, StatusBadge có màu. Banner nợ quá hạn
  giữ nguyên.
- Thay đổi có chủ đích: bỏ ô chọn 9 trạng thái riêng lẻ (thay bằng tab gộp; `?status=` vẫn dùng được); tìm kiếm
  chạy ở client trên 500 lịch đặt gần nhất (có dòng báo khi bị cắt); thẻ **không** hiện tên dịch vụ / trung tâm vì
  `BookingSummaryRecord` không có các trường đó; khoản cọc trong "Cần thanh toán" hiện tổng lịch đặt (số tiền cọc
  chính xác hiện ở trang cọc / VNPay).
- Kiểm tra: test mới cho tab gộp, tìm không dấu, `?status=` cũ, CTA thanh toán, vòng đời / đếm ngược,
  `fetchBookingCollection`; ảnh Playwright 1280 / 375 cho danh sách, chi tiết (cả menu ⋯), thanh toán.

### Phase 5 — Khu Tài khoản, Hồ sơ người thân

- **Khung Tài khoản** (`routes/customer/account-layout.tsx` → `features/customer/layout/account-shell.tsx`): route
  layout không đổi URL bao quanh `/customer/my-profile`, `/customer/patient-profiles`, `/customer/patient-profiles/:id`,
  `/customer/payments`, `/customer/invitations`. Thanh bên desktop, tab ngang mobile; badge số lời mời đang chờ. Bỏ thẻ
  user và khối hotline lặp ở cột trái. `/customer/patient-profiles/new` vẫn ngoài khung (form dài có cột riêng).
- **Hồ sơ người thân (list)**: PageHeader + "Thêm hồ sơ"; banner lời mời đang chờ; tìm debounce (bỏ nút "Tìm kiếm") +
  chip trạng thái; lưới 2 cột; thẻ: avatar, tên, "81 tuổi · Nữ · Hoàn Kiếm, Hà Nội", quyền, "Xem hồ sơ" + "Đặt lịch"
  (`/customer/booking?patientId=`), menu ⋯ (Sửa → `?edit=basic`, Xóa → ConfirmDialog). Bỏ banner "Vì sao nên cập nhật
  hồ sơ" (nút "Xem tài liệu" không làm gì, các huy hiệu mã hóa / bảo mật không có cơ sở).
- **Chi tiết hồ sơ**: header (avatar, tên, tuổi · giới · nhóm máu, trạng thái, quyền, "Đặt lịch" + ⋯ Sửa / Xóa), thanh
  "Hồ sơ hoàn thiện x%" (10 mục người chăm sóc cần, không tính thuốc) với nút thêm mục còn thiếu. Tabs `?tab=`: Tổng quan
  · Y tế & thuốc · Sinh hoạt hằng ngày · Liên hệ khẩn cấp · Người quản lý. Bỏ toggle xem / sửa: mỗi khối có nút "Sửa"
  riêng mở **popup giữa màn hình, 2 cột** (theo yêu cầu chủ dự án: không dùng drawer bên phải, form dài chia hai bên để
  không phải cuộn; trên điện thoại 1 cột, thân popup tự cuộn). Trường trống gom thành nút "+ Thêm …". Thuốc và liên hệ
  dạng danh sách + menu ⋯ (thuốc: Sửa / Ngưng dùng / Xóa; liên hệ: Sửa / Đặt làm liên hệ chính / Xóa), thêm / sửa trong
  popup. Dị ứng hiện callout đỏ. "Mời người quản lý" là nút mở Modal. Callout 115 gọn, bấm để gọi. Vẫn gửi `version`
  khi PUT; 409 báo tải lại. `?mode=edit` cũ vẫn mở popup thông tin cơ bản.
- **Thông tin cá nhân**: mặc định xem (key–value), "Chỉnh sửa" → form; thanh Lưu / Hủy sticky chỉ khi có thay đổi;
  avatar giống header; lỗi dưới từng ô; toast khi lưu.
- **Bảo mật** (`?section=security`): đổi mật khẩu với hiện / ẩn, thanh độ mạnh 4 mức, checklist realtime theo đúng
  `validPassword`.
- **Lời mời**: thẻ (hồ sơ, quyền, quan hệ, hạn), Chấp nhận / Từ chối (ConfirmDialog), EmptyState; lời mời đang chờ
  được ghim đầu bảng chuông thông báo và cộng vào badge (`NotificationBell` thêm prop `pinned` / `pinnedCount`, portal
  khác không đổi).
- `Modal` thêm `dismissOnBackdrop` (form = false) và giới hạn chiều cao theo màn hình. Toaster (sonner) gắn vào
  `CustomerLayout`, trên điện thoại đặt cao hơn bottom nav.

### Rà ảnh: chọn tệp và trình xem ảnh

- `shared/ui/image-viewer.tsx`: `ImageViewer` (dialog toàn màn hình, phóng to / thu nhỏ bằng nút, lăn chuột, phím
  - / − / 0, nhấp đúp; kéo để di chuyển khi đã phóng to; mũi tên / nút trái phải cho bộ sưu tập; "Mở ảnh gốc"; Esc
    đóng) và `ViewableImage`. `Avatar` thêm `viewable`.
- `shared/ui/file-drop-zone.tsx`: bấm vào cả vùng (hoặc Enter / Space) mở hộp chọn tệp, kéo thả được, xem trước ảnh
  đã chọn (bấm để phóng to), bỏ từng tệp. `LocalFilePreview` ảnh bấm để xem phóng to.
- Áp dụng: `ProviderMediaPanel` (ảnh trung tâm / ảnh hồ sơ người chăm sóc / tệp chứng chỉ — admin, quản lý, người
  chăm sóc), ảnh chứng chỉ ở trang người chăm sóc của khách và trang quản lý trung tâm, avatar người chăm sóc (trang
  chi tiết, drawer đặt lịch, thẻ người chăm sóc được phân công), avatar quản lý xem người chăm sóc, logo trung tâm ở
  admin, avatar hồ sơ người thân. Chỗ tải avatar ở portal Caregiver và form chứng chỉ của họ đã mở hộp chọn tệp sẵn
  (không sửa file của phiên Caregiver, chỉ hưởng `LocalFilePreview` mới).
- Kiểm tra trên trình duyệt thật: trình xem với ảnh thật (phóng 150%, kéo, Esc) — sửa lỗi kéo bắt đầu ở vùng trống bị
  tính là bấm nền và đóng trình xem. Stack dev chỉ có 1 ảnh (logo trung tâm, chỉ admin xem) và không có tài khoản admin
  / quản lý / người chăm sóc, nên luồng tải tệp thật chưa chạy trên stack (đã có test). Trang admin duyệt chứng chỉ không
  hiển thị tệp nào (chỉ thông tin) — chưa thêm.

Kiểm tra lần cuối (Phase 1–5 + rà ảnh): typecheck / lint / prettier sạch, **376/376 test**, `pnpm build` thành công;
Playwright 1280 / 375 cho mọi trang khu Tài khoản, popup sửa, trình xem ảnh.

## 3. Còn lại

- Không còn việc của đợt thiết kế lại; dữ liệu test đã xóa (mục 4).
- Đã biết, chưa sửa (ngoài phạm vi UI): `GET /api/v1/notifications/stream` trả 500; đôi khi một request nghiệp vụ trả
  401 đúng lúc phiên đang làm mới token.
- `docs/ARCHITECTURE.md` đã cập nhật (header, khung Tài khoản, danh sách / chi tiết lịch đặt, thanh toán, hồ sơ người
  thân, các primitive mới).

## 4. Dữ liệu test trên stack dev — ĐÃ XÓA (2026-11-03)

Chủ dự án cho phép tạo tài khoản test và yêu cầu **xóa tài khoản cùng mọi dữ liệu liên quan khi xong**. **Đã xóa sau
khi xong Phase 5 + rà ảnh**: booking DB (1 booking, 1 buổi, 1 chi tiết, 1 lịch sử trạng thái, 1 thông báo BOOKING_CREATED
gửi quản lý trung tâm), care-recipient DB (1 hồ sơ, 1 người quản lý), identity DB (user, role, 2 dòng audit
SESSIONS_REVOKED); payment DB không có bản ghi. Đã kiểm tra lại: 0 dòng còn sót. Bảng dưới giữ lại để tra cứu.

| Dịch vụ       | Dữ liệu                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| Identity      | user `ui.redesign.customer@careconnect.test`, `user_id = ee9012a5-36d3-4976-b03e-baf22098d693`          |
| CareRecipient | hồ sơ "Bà Thử Giao Diện", `recipient_id = dae3a8df-be51-4303-9df4-49bfdb457613`                         |
| Booking       | `BK-20261103-AS6FX9`, `booking_id = fc9da54e-1f7f-4b55-beb4-cc85326d04f5` (PENDING_CENTER_CONFIRMATION) |
| Payment       | chưa có bản ghi (kiểm tra lại trước khi xóa)                                                            |

Mật khẩu hiện tại (đặt lại ở phiên Phase 4 bằng cách cập nhật hash BCrypt của đúng user này) nằm trong scratchpad của
phiên đó — phiên sau cũng sẽ mất; cứ đặt lại theo cách dưới (truyền SQL qua stdin để `$` trong hash không bị shell
nuốt). Tài khoản được seed bằng `BE/scripts/e2e/SeedCustomers.java` (BCrypt) qua `docker exec careconnect-identity-postgres-1
psql`. Mật khẩu chỉ nằm trong file scratchpad của phiên cũ (đã mất) — phiên mới muốn đăng nhập thì xóa user rồi seed lại
với mật khẩu mới (chạy Java với `-Dstdout.encoding=UTF-8`, nếu không tên tiếng Việt bị lỗi mã hóa).

Dọn dẹp (chạy SELECT trước để xem, rồi mới DELETE; mỗi DB một container `careconnect-<db>-postgres-1`):

```sql
-- booking DB: các bảng con có cột booking_id (booking_details, booking_events, booking_occurrences,
-- booking_status_history, care_reports, care_sessions, complaints, feedbacks, booking_outbox nếu có), rồi bookings
SELECT booking_id, booking_code FROM bookings WHERE customer_id = 'ee9012a5-36d3-4976-b03e-baf22098d693';
-- payment DB: booking_financials, occurrence_financials, payments, payment_transactions, refunds,
-- remaining_invoices, payment_outbox theo booking_id / customer_id
-- care-recipient DB: medications, emergency_contacts, recipient_managers, recipient_manager_invitations
-- theo recipient_id, rồi care_recipients
SELECT recipient_id, full_name FROM care_recipients WHERE created_by = 'ee9012a5-36d3-4976-b03e-baf22098d693';
-- identity DB: user_roles rồi users (và session / refresh token nếu bảng có user_id)
DELETE FROM user_roles WHERE user_id = 'ee9012a5-36d3-4976-b03e-baf22098d693';
DELETE FROM users WHERE user_id = 'ee9012a5-36d3-4976-b03e-baf22098d693';
```

## 5. Quyết định & giả định

- Hiệu ứng làm bằng CSS thuần, không thêm framer-motion.
- Theme mới chỉ trong `.theme-customer`; trang công khai `/` dùng cùng layout nên cũng có theme.
- Ngày luôn dd/mm/yyyy và giờ 24h kể cả tiếng Anh (en-GB); `formatCalendarDate` ghép từ parts để không phụ thuộc dấu
  phân cách của từng trình duyệt / Node ICU.
- `README.md` giữ ở gốc FE (trang giới thiệu repo). `ARCHITECTURE.md` và `2026-10-30-PLAN_ADMIN_UI_REVIEW.md` đã chuyển
  vào `docs/`; đường dẫn trong `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.claude/rules`, `.github`, `.agents` đã sửa.

## 6. Cách kiểm tra trên trình duyệt (Playwright)

Chromium tải về bị timeout; dùng Chrome đã cài (`channel: 'chrome'`). Cài Playwright **ngoài repo** (không thêm
dependency vào FE):

```bash
mkdir /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright@1
```

Script: đăng nhập ở `/login` (`#login-email`, `input[autocomplete="current-password"]`, `button[type=submit]`), rồi
`page.goto` từng trang và `page.screenshot({ fullPage: true })` ở viewport 1280×900 và 375×812, ghi lại console error và
response `/api/` ≥ 400. Luôn đăng nhập mới mỗi lần chạy (refresh token xoay vòng, storage state cũ hết hạn). Trên Git
Bash phải đặt `MSYS_NO_PATHCONV=1` để `/customer` không bị đổi thành đường dẫn Windows. Với input ẩn (`sr-only`) của
RadioCard / chip, bấm vào `label` thay vì input. Header sticky xuất hiện giữa ảnh full-page là hiệu ứng chụp, không phải lỗi.

## 7. Commit message đề xuất (chủ dự án tự commit)

```
feat(customer): redesign the customer portal and add an image viewer

- customer theme (.theme-customer), motion classes and shared UI kit
- 4-step booking wizard with per-service unit price/amount, success screen, draft and leave guard
- home dashboard, services and caregivers grids with one-row filters
- bookings grouped into status tabs, lifecycle stepper with deadlines, payments in tabs
- shared Tabs, ActionMenu, useClock; Stepper step notes
- account shell; family profiles list and tabbed detail with per-section dialogs; personal info, security, invitations
- ImageViewer / ViewableImage, FileDropZone, Avatar viewable; used by provider media, certificates and photos
- move ARCHITECTURE.md and the admin UI plan into docs/

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```
