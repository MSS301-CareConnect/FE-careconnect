# CareConnect UI redesign 2026-11 — "Soft Bento" (kế hoạch tổng thể)

Tài liệu bàn giao cho mọi phiên làm lại giao diện. Đọc file này + `AGENTS.md` + `docs/ARCHITECTURE.md` trước khi
sửa trang nào. Cập nhật mục **Tiến độ** ở cuối mỗi khi xong một trang.

## 1. Nguồn cảm hứng (video mẫu)

Video mẫu (TikTok "Dashboard V22", paulcodes, 5 giây) là một dashboard React + `framer-motion` + `lucide-react`.
Những gì rút ra được:

| Yếu tố          | Trong video                                                                                                                                                       | Áp dụng cho CareConnect                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Nền trang       | Gradient rất nhạt mint (trái-trên) → đào/kem (phải-dưới)                                                                                                          | Lớp `.cc-mesh` (radial gradients) trên `--color-background`                         |
| Khối nhấn       | Card xanh rêu rất đậm (`#0c2b25`) bo 24 px, chữ trắng                                                                                                             | Token `forest-*`, dùng cho hero, band tin cậy, sidebar                              |
| Card            | Trắng, bo 20–24 px, bóng mềm, hover nhấc lên `y: -4/-5`                                                                                                           | `rounded-3xl`, `--shadow-soft`, `motion` `whileHover`                               |
| Điểm nhấn màu   | Cam đào cho nút CTA ("Add member"), cột biểu đồ đào                                                                                                               | Token `peach-*` — chỉ cho CTA chính và điểm dữ liệu nhấn                            |
| Màu phụ         | Mint/teal cho trạng thái active, thanh tiến độ                                                                                                                    | Token `mint-*`                                                                      |
| Chữ             | Sans đậm + **một từ nghiêng serif** ("Work's always _better_ together")                                                                                           | Be Vietnam Pro + `Fraunces` italic (hỗ trợ tiếng Việt) qua class `.cc-accent-serif` |
| Sidebar         | Viên thuốc dọc màu tối, icon tròn; mục active = vòng tròn mint + tooltip nhỏ                                                                                      | Áp dụng cho shell Caregiver / Center Manager / Admin (giai đoạn 3)                  |
| Segmented / tab | Pill tối cho lựa chọn đang chọn ("Weekly · Monthly", "Overview · Shared · Comments")                                                                              | Indicator trượt bằng `layoutId` của `motion`                                        |
| Lịch            | Dải ngày trong tuần, ngày hiện tại = pill tối                                                                                                                     | Mini week strip trong preview / dashboard                                           |
| Chuyển động     | Card hiện lần lượt (fade + blur + trượt lên, stagger), số đếm tăng dần, chữ hiện từng ký tự, cột biểu đồ mọc lên, chuyển trang = card cũ mờ đi, card mới hiện lên | `Reveal`, `Stagger`, `CountUp`, `AnimatePresence` cho tab/trang                     |

Không sao chép nội dung video (tên người, ảnh, số liệu); chỉ lấy ngôn ngữ thiết kế.

## 2. Nguyên tắc

1. **Đồng bộ với hệ thống hiện có**: giữ Tailwind 4 token trong `app/app.css`, Material Symbols (không thêm
   lucide để không trộn 2 bộ icon), Be Vietnam Pro, i18n vi/en, `shared/ui/*` primitives. Token mới _bổ sung_, không
   đổi tên token cũ, để các trang chưa làm lại vẫn chạy.
2. **Không bịa dữ liệu**: số liệu marketing chỉ là sự thật của sản phẩm (3 cách đặt lịch, báo cáo trong 24 giờ,
   hoàn 100 % khi trung tâm hủy…). Preview UI minh họa dùng nhãn chung, không tên người/khách giả.
3. **Chuyển động có mục đích**: 200–600 ms, một easing (`[0.22, 1, 0.36, 1]`), stagger 60–80 ms. Mọi animation
   tôn trọng `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` ở `AppProviders` + CSS media query).
4. **Khả năng truy cập**: tab dùng role `tablist/tab/tabpanel` + phím mũi tên; số đếm có giá trị thật cho screen
   reader; tương phản AA (chữ trên peach dùng `forest-900`, chữ peach trên trắng dùng `peach-700`).
5. **Hiệu năng**: chỉ `motion` (≈ 30 kB gz, tree-shake). Animation dùng `transform/opacity/filter`. Ảnh hero
   `fetchPriority=high`, ảnh dưới màn hình `loading=lazy`.

## 3. Thư viện

| Thư viện                                 | Vai trò                                                                               | Ghi chú                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| `motion` (^12, kế nhiệm `framer-motion`) | `motion.*`, `AnimatePresence`, `layoutId`, `whileInView`, `useInView`, `MotionConfig` | Import từ `motion/react`. Đã cài 2026-11-09 |
| `sonner` (sẵn có)                        | Toast                                                                                 | Giữ nguyên                                  |
| Material Symbols (sẵn có)                | Icon                                                                                  | Giữ nguyên, `Icon` component                |
| Google Fonts `Fraunces` italic           | Từ nhấn serif                                                                         | Thêm vào `@import` đầu `app.css`            |

Không thêm thư viện chart: biểu đồ nhỏ vẽ bằng div + `motion` (giống quy ước Wallet).

## 4. Design tokens (thêm vào `@theme` trong `app/app.css`)

```css
--font-accent: 'Fraunces', ui-serif, Georgia, serif;

/* Deep forest — khối nhấn tối */
--color-forest-950: #071d18;
--color-forest-900: #0c2b25;
--color-forest-800: #123b33;
--color-forest-700: #1b4d42;
--color-forest-600: #256152;

/* Mint — active, tiến độ, highlight */
--color-mint-50: #effaf5;
--color-mint-100: #d7f3e7;
--color-mint-200: #b4e7d3;
--color-mint-300: #84d6b9;
--color-mint-400: #4fbf9b;
--color-mint-500: #2ea482;

/* Peach — CTA chính, dữ liệu nhấn */
--color-peach-50: #fff5ee;
--color-peach-100: #ffe6d5;
--color-peach-200: #ffcdb0;
--color-peach-300: #fdb088;
--color-peach-400: #f6925f;
--color-peach-700: #a8481b;

--radius-bento: 1.5rem;
--shadow-soft: 0 18px 40px -22px rgb(12 43 37 / 0.28), 0 2px 6px rgb(12 43 37 / 0.05);
--shadow-float: 0 24px 60px -24px rgb(12 43 37 / 0.35);
```

Utility class (cuối `app.css`):

- `.cc-mesh` — nền gradient mint/đào của trang.
- `.cc-glass` — card kính: `bg-white/70`, `backdrop-blur`, viền trắng mờ.
- `.cc-accent-serif` — `font-family: var(--font-accent); font-style: italic; font-weight: 500`.
- `.cc-grain` (tùy chọn) — không dùng ở giai đoạn 1.

## 5. Primitive chuyển động — `app/shared/ui/motion.tsx`

| Export                                    | Dùng cho                                                                                                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `easeSoft`                                | Easing chung `[0.22, 1, 0.36, 1]`                                                                                                                                                                |
| `Reveal`                                  | Bọc một khối: fade + blur 6 px + trượt lên 16 px khi vào viewport (một lần)                                                                                                                      |
| `staggerVariants(gap)` + `revealVariants` | Gắn vào `motion.ul`/`motion.li` (hoặc bất kỳ `motion.*`) để danh sách hiện lần lượt: cha `initial='hidden' whileInView='shown' variants={staggerVariants(0.1)}`, con `variants={revealVariants}` |
| Hover lift                                | Chưa tách primitive: `whileHover={{ y: -4 }}` + spring (stiffness 320, damping 24) — tách khi có nơi dùng thứ hai                                                                                |
| `CountUp`                                 | Số đếm tăng khi vào viewport; giá trị thật trong `sr-only`                                                                                                                                       |

Tab có indicator trượt: dùng `motion.span layoutId="…"` trong component tab của trang; khi cần dùng chung ≥ 2 nơi
thì nâng cấp `shared/ui/tabs.tsx` và `segmented-control.tsx` sang `layoutId` (giai đoạn 2).

Chuyển trang: `CustomerLayout` đang dùng `.cc-fade-up` theo `location.pathname`; giai đoạn 2 thay bằng
`AnimatePresence mode="wait"` + `motion.div` (fade + blur nhẹ) cho cả 4 portal.

## 6. Kế hoạch theo giai đoạn

### Giai đoạn 1 — Nền tảng + Landing (`/`, `/customer`) — **phiên 2026-11-09**

- Token, font, utility, `motion` primitives, `MotionConfig` ở `AppProviders`.
- `features/home` tách thành các section trong `components/`:
  1. **Hero bento**: card forest bo lớn bên trái (eyebrow, tiêu đề có từ nghiêng serif, mô tả, CTA peach + CTA kính,
     3 số liệu `CountUp`), bên phải ảnh bo lớn với 3 chip kính nổi (người chăm sóc đã xác minh, buổi kế tiếp, tiến độ
     buổi chăm sóc) trôi nhẹ.
  2. _(Khách hàng đã đăng nhập)_ `CustomerDashboard` giữ nguyên dữ liệu.
  3. **Cách hoạt động** = tab tương tác 3 bước (tìm → xem hồ sơ → đặt lịch): danh sách bước bên trái với indicator
     trượt và thanh tiến độ tự chạy, bên phải preview UI minh họa chuyển bằng `AnimatePresence`.
  4. **Lý do (bento grid)**: ảnh gia đình + 3 card tương tác (hồ sơ rõ ràng với pill chứng chỉ; đặt lịch linh hoạt
     với segmented Giờ/Ngày/Ca đổi biểu đồ cột; theo dõi dễ dàng với dải tuần + thanh tiến độ).
  5. **Tin cậy**: band forest với 3 cam kết + CTA kết trang.

### Giai đoạn 2 — Shell & primitives dùng chung

- `CustomerHeader`: nền kính trên `.cc-mesh`, nav active = pill (layoutId), nút "Đặt lịch" peach.
- `SiteFooter`: đổi `brand-900` → `forest-900`, bo góc trên lớn.
- `shared/ui/tabs.tsx`, `segmented-control.tsx`: indicator `layoutId` + nội dung `AnimatePresence`.
- `Modal`, `Drawer`: vào/ra bằng `motion` (scale 0.96 + blur), backdrop mờ dần.
- `Button`: thêm variant `accent` (peach) và `dark` (forest); `whileTap`.
- `PageHeader`: biến thể có nền forest cho trang tổng quan.
- Chuyển trang `AnimatePresence` ở 4 layout.

### Giai đoạn 3 — Portal Customer

Danh sách người chăm sóc / dịch vụ / trung tâm (card bento, hover lift, stagger), chi tiết người chăm sóc (hero forest
như "Hannah Brooks" trong video: banner tối + avatar + 4 ô số liệu), form đặt lịch (stepper kính), danh sách & chi tiết
lịch đặt, thanh toán, ví, hồ sơ người thân, tài khoản.

### Giai đoạn 4 — Portal vận hành (Center Manager, Admin, Caregiver web)

Sidebar viên thuốc tối như video (icon tròn, active mint, tooltip), dashboard bento (thẻ số `CountUp`, biểu đồ cột
mọc lên, dải lịch tuần, danh sách thông báo dạng tab Overview/Shared), bảng giữ `DataTableShell` nhưng bọc card mới.

### Giai đoạn 5 — Đánh bóng

Kiểm tra reduced motion, điện thoại 375 px, dark mode (chưa có — quyết định sau), Lighthouse, console sạch.

## 7. Quy tắc khi làm một trang trong phiên khác

1. Đọc mục 4–5, dùng token + primitive sẵn có; thiếu thì thêm vào `shared/ui/motion.tsx` / `app.css` và ghi lại ở đây.
2. Không đổi logic dữ liệu, query, route; chỉ đổi trình bày. Giữ nguyên copy hiện có, thêm key mới vào cả vi và en.
3. Cập nhật test của trang nếu cấu trúc (role, region) đổi; chạy `pnpm vitest run <thư mục>` + `pnpm typecheck` +
   `pnpm lint`; không chạy `pnpm prettier --write` toàn repo (chỉ `pnpm exec prettier --write <file>`).
4. Kiểm tra trên trình duyệt ở 1440 px và 375 px.
5. Không commit (chủ dự án tự commit); đề xuất commit message.

## 7b. Lưu ý đã gặp

- Ảnh ngang trong khung dọc: dùng `object-[100%_center]` (người ở nửa phải ảnh) và để thẻ nổi ở góc dưới, không che mặt.
- Thẻ nửa chiều rộng: tên thứ dùng `weekday: 'narrow'` (T2…CN), tiêu đề thẻ xếp icon lên trên (`CardHeading stacked`).
- Chữ menu/nút trong header luôn `whitespace-nowrap`; header co lại không hẹp hơn 1180 px vì menu khách hàng có 5 mục.
- Phần tử có hiệu ứng thoát (`AnimatePresence`) vẫn còn trong DOM một lúc: test phải `await waitFor(...)` khi kiểm tra đã đóng.
- Chữ trang trí khổ lớn trong khối `overflow-hidden` có thể bị cuộn ngang khi focus: dùng SVG `textLength` hoặc `overflow-clip`.
- Thanh chỉ mục `HomeSectionRail` (landing, `features/home/components/home-section-rail.tsx`): khung nổi ở giữa mép
  phải, hiện suốt trang, không nền, không rãnh kéo. Các phần xếp chồng; phần đang xem nổi forest và bật ra; trôi nhẹ theo
  tốc độ cuộn (`useVelocity` → spring, ±18 px) rồi về giữa; rê/focus thì xòe hiện tên, bấm thì cuộn tới. Ẩn thanh cuộn
  gốc từ `lg` (`html.cc-rail-page`). Section cần `id` + `scroll-mt-24`. Tách ra `shared/ui` khi có trang dài thứ hai.
- Phần tử `fixed` đặt bên trong nội dung trang bị lệch (lớp chuyển trang `cc-fade-up` của layout thành containing
  block): render qua `createPortal(..., document.body)`.
- Test lỗi có sẵn, không do redesign: `admin-bookings.test.tsx` ("cancel a running booking") và `booking-requests-list.test.tsx` ("declines with a reason") — không tìm thấy nhãn "Lý do".

## 8. Tiến độ

| Giai đoạn             | Trạng thái                                 | Ghi chú                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Nền tảng + Landing | **Xong 2026-11-09** (chưa commit)          | `motion` 12.43, token/utility trong `app.css`, `shared/ui/motion.tsx` (`easeSoft`, `Reveal`, `revealVariants`, `staggerVariants`, `CountUp`), `MotionConfig` ở `AppProviders`, stub IntersectionObserver trong `test/setup.ts`. Landing: `features/home/components/home-hero.tsx`, `home-process.tsx` (+ `home-previews.tsx`, `use-current-week.ts`), `home-reasons.tsx`, `home-trust.tsx`, `home-styles.ts` (class nút peach/kính/forest dùng lại được). Test 5/5, kiểm tra 1440 px + 375 px, console sạch                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2. Shell & primitives | **Một phần xong 2026-11-09** (chưa commit) | Header `customer-header.tsx`: đầu trang rộng 1280 px trong suốt, cuộn > 20 px co thành viên thuốc trắng 1180 px nổi + bóng + thanh tiến độ cuộn, trượt xuống khi tải (theo header dự án EXE/UML của chủ dự án); mục đang chọn là pill forest `layoutId`; menu tài khoản vào/ra bằng `AnimatePresence`. `LanguageSwitch` thành pill trượt (dùng chung mọi portal, có `tone="dark"`). `CenterSelector` bo tròn kính. Footer `site-footer.tsx` tràn viền, chỉ bo góc trên, chữ chìm "CareConnect" bằng SVG (không tràn ngang). Thanh dưới điện thoại `customer-bottom-nav.tsx` = viên thuốc nổi, mục chọn nền mint trượt, nút Đặt lịch tròn nổi giữa. Nền `.cc-mesh` chuyển lên `CustomerLayout`. Trợ lý AI (`features/shared/ai-chat`): nút mở forest + chấm trực tuyến, khung mở/đóng thu phóng từ góc, header forest, bong bóng có avatar, composer viên thuốc. Còn lại: `tabs.tsx`, `segmented-control.tsx`, `Modal`/`Drawer`, `Button` variant, chuyển trang `AnimatePresence`, shell 3 portal kia |
| 3. Portal Customer    | Chưa                                       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 4. Portal vận hành    | Chưa                                       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 5. Đánh bóng          | Chưa                                       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
