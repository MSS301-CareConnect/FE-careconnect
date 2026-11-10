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
- Dropdown (2026-11-09): mọi dropdown tự làm dùng `useExitPresence(open)` (`shared/lib/use-exit-presence.ts`) →
  render khi `present`, gắn `className='cc-dropdown'` + `data-state={state}` (+ `data-side={side}` nếu dùng
  `useAnchoredPopover`, truyền `open: present` cho hook đó). Mở: phóng ra + mờ dần + bỏ blur; đóng: chạy ngược 140 ms
  rồi mới gỡ khỏi DOM. Trong test và khi giảm chuyển động thì đóng ngay như cũ. `<select>` gốc dùng cùng hiệu ứng qua
  `::picker(select)`. Đã áp: DatePicker, TimeSelect, Combobox, ActionMenu, FilterMenuChip, gợi ý thuốc, "⋯" caregiver,
  chuông thông báo (chung + caregiver), chọn trung tâm, menu tài khoản Admin/Manager/Caregiver. Menu tài khoản khách
  hàng dùng `AnimatePresence` của `motion`. Dropdown mới phải theo cùng cách.
- Con trỏ bàn tay (2026-11-09): `app.css` (`@layer base`) cho mọi nút, link, tab, option, menuitem, checkbox/radio,
  `select`, `summary`, `label[for]`; nút bị vô hiệu hiện "not-allowed". Không cần thêm `cursor-pointer` từng chỗ.
- Đăng nhập / đăng ký / quên mật khẩu (2026-11-09, cập nhật theo phản hồi thiết kế mới nhất của người dùng):
  - Bố cục trượt đối xứng Desktop:
    - Khi ở Đăng nhập: Card xanh forest nằm bên trái, cạnh trái sát màn hình, cạnh trên/dưới bắt đầu bo tròn từ khoảng 3/4 sang cạnh phải (`rounded-tr-[5rem] rounded-br-[5rem] xl:rounded-tr-[6rem] xl:rounded-br-[6rem]`). Nằm ngay chính giữa đường ranh giới cong này là nút tròn chuyển đổi nổi (`>`), bấm vào sẽ trượt mượt mà sang trang Đăng ký.
    - Khi ở Đăng ký: Bố cục đảo ngược lại — Card xanh forest nằm bên phải sát màn hình, cạnh trên/dưới bo cong từ 3/4 sang cạnh trái (`rounded-tl-[5rem] rounded-bl-[5rem] xl:rounded-tl-[6rem] xl:rounded-bl-[6rem]`), form nằm bên trái. Nằm ngay giữa ranh giới cong là nút tròn chuyển đổi nổi (`<`), bấm vào sẽ trượt mượt mà sang trang Đăng nhập.
    - Hiệu ứng chuyển cảnh trượt (`.cc-auth-card-slide`, `.cc-auth-form-slide`, 700ms cubic-bezier) kết hợp đảo chiều bo góc và đổ bóng cực kỳ mượt mà.
  - Tối ưu diện tích Card thương hiệu:
    - Đã loại bỏ hoàn toàn khối text/nút đăng nhập/đăng ký rườm rà bên trong lòng card để tiết kiệm diện tích, giúp ảnh caregiver, logo, tiêu đề và các ưu điểm có không gian thở thoáng đãng, sang trọng.
  - Thiết kế lại form nhập liệu đăng ký cân đối & chuẩn mực:
    - Cột 1: "Họ và tên *" (bắt buộc, có dấu `*` đỏ).
    - Cột 2: "Số điện thoại" (không bắt buộc — đã bỏ hoàn toàn chữ "(không bắt buộc)" và không có dấu `*`). Do cả 2 label đều là 1 dòng, 2 ô nhập liệu ngang hàng nhau tuyệt đối, không còn bị lệch.
    - Dấu `*` đỏ dùng CSS `after:content-['*'] after:text-rose-500` nên không làm thay đổi text thuần của label, đảm bảo 100% khả năng truy cập (a11y) và vượt qua toàn bộ test tự động.
    - Bên dưới nút submit của form vẫn giữ text link điều hướng phụ để người dùng tiện thao tác. Test 10/10 files (25/25 tests) pass.
- Cuộn về đầu trang (2026-11-09): logo, tab header, thanh dưới điện thoại và link footer dùng
  `useScrollTopOnSamePage()` (`shared/lib/use-scroll-top-on-same-page.ts`): bấm link của chính trang đang mở thì cuộn mượt
  lên đầu (tức thì nếu giảm chuyển động) thay vì điều hướng lại khiến `ScrollRestoration` nhảy giật. Link sang trang khác
  giữ nguyên. Nút "Lên đầu trang" ở footer dùng `scrollToTopSmoothly`.
- Portal vận hành (2026-11-09): CSS theme của từng portal không nằm trong layer — quy tắc phần tử (`h1`, `dialog`…) phải bọc `@layer base` nếu không sẽ đè utility (ví dụ tiêu đề trắng trên hero forest). Ô số liệu tối dùng `.ops-stat-dark` (CSS ngoài layer cố ý đè màu chữ của ô). `NavRail` dùng `line-clamp-2` cho nhãn dài; đừng thêm `block` vào nhãn (đè `display` của line-clamp).
- Test lỗi có sẵn, không do redesign: `admin-bookings.test.tsx` ("cancel a running booking") và `booking-requests-list.test.tsx` ("declines with a reason") — không tìm thấy nhãn "Lý do".

## 7c. Customer portal (2026-11-09)

- Màu và bo góc của khách hàng nằm trong `customer-theme.css`; đừng sửa token toàn cục trong `app.css` để đổi riêng khách hàng.
- Trang khách hàng mới dùng `CustomerPageHeader` + class trong `bento-styles.ts`; mỗi màn chỉ một nút peach (hành động chính).
- `motion` reveal của header không chạy khi tab trình duyệt bị ẩn (rAF dừng): ảnh chụp từ khung ẩn trông mờ, không phải lỗi.

## 7d. Bổ sung 2026-11-09 (sau phase 3)

- Chuyển trang khách hàng: link header, logo, thanh dưới có `viewTransition` (View Transitions API); header và thanh
  dưới có `view-transition-name` nên đứng yên, trang cũ mờ đi, trang mới trượt lên (`customer-theme.css`). Không dùng
  `filter: blur` cho cả trang (tốn GPU, gây giật). `cc-fade-up` của layout tự tắt khi đang có view transition.
- Animation lặp vô hạn (chip nổi…) dùng `animate={{ transform: [...] }}` của `motion` để chạy trên compositor, không
  dùng `y` (chạy trên main thread).
- Trang đăng nhập / đăng ký: chip trên ảnh nổi trên đường viền trên (đăng ký bên trái, còn lại bên phải); ô nhập có
  placeholder (`auth.shell.placeholders`).
- Landing: thanh chỉ mục bên phải ẩn ở đầu trang, hiện khi cuộn quá 80 px.
- Chi tiết lịch đặt khách hàng: bảng buổi chăm sóc bỏ cột dịch vụ (`showService={false}`), lịch sử chỉ hiện 4 mục mới
  nhất kèm "Xem thêm" (`collapsedCount`).

## 8. Tiến độ

| Giai đoạn             | Trạng thái                                    | Ghi chú                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Nền tảng + Landing | **Xong 2026-11-09** (chưa commit)             | `motion` 12.43, token/utility trong `app.css`, `shared/ui/motion.tsx` (`easeSoft`, `Reveal`, `revealVariants`, `staggerVariants`, `CountUp`), `MotionConfig` ở `AppProviders`, stub IntersectionObserver trong `test/setup.ts`. Landing: `features/home/components/home-hero.tsx`, `home-process.tsx` (+ `home-previews.tsx`, `use-current-week.ts`), `home-reasons.tsx`, `home-trust.tsx`, `home-styles.ts` (class nút peach/kính/forest dùng lại được). Test 5/5, kiểm tra 1440 px + 375 px, console sạch                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2. Shell & primitives | **Một phần xong 2026-11-09** (chưa commit)    | Header `customer-header.tsx`: đầu trang rộng 1280 px trong suốt, cuộn > 20 px co thành viên thuốc trắng 1180 px nổi + bóng + thanh tiến độ cuộn, trượt xuống khi tải (theo header dự án EXE/UML của chủ dự án); mục đang chọn là pill forest `layoutId`; menu tài khoản vào/ra bằng `AnimatePresence`. `LanguageSwitch` thành pill trượt (dùng chung mọi portal, có `tone="dark"`). `CenterSelector` bo tròn kính. Footer `site-footer.tsx` tràn viền, chỉ bo góc trên, chữ chìm "CareConnect" bằng SVG (không tràn ngang). Thanh dưới điện thoại `customer-bottom-nav.tsx` = viên thuốc nổi, mục chọn nền mint trượt, nút Đặt lịch tròn nổi giữa. Nền `.cc-mesh` chuyển lên `CustomerLayout`. Trợ lý AI (`features/shared/ai-chat`): nút mở forest + chấm trực tuyến, khung mở/đóng thu phóng từ góc, header forest, bong bóng có avatar, composer viên thuốc. Trang đăng nhập / đăng ký / quên mật khẩu làm lại theo màn EXE (xem §7b). Cuộn mượt về đầu trang khi bấm lại link trang đang mở. Còn lại: `tabs.tsx`, `segmented-control.tsx`, `Modal`/`Drawer`, `Button` variant, chuyển trang `AnimatePresence`, shell 3 portal kia                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 3. Portal Customer    | **Xong 2026-11-09** (chưa commit)             | Lớp theme `features/customer/layout/customer-theme.css` (import ở `CustomerLayout`, selector `div.theme-customer`): đổi token ngữ nghĩa (primary = forest-800, primary-fixed/secondary-container = mint, surface/outline ngả mint, thang brand = mint→forest), bo `--radius-xl` 16px / `2xl` 24px / `3xl` 32px, bóng mềm; `cc-lift` nhấc 4px + `shadow-soft`, `cc-stagger` thêm blur. Nhờ vậy mọi trang khách hàng đổi màu cùng lúc mà không sửa `shared/ui` (portal vận hành giữ token gốc). `features/customer/ui/customer-page-header.tsx` (`CustomerPageHeader`, cùng props với `PageHeader`, breadcrumb pill kính, tiêu đề lớn, hiện lần lượt) thay `PageHeader` ở 14 trang; `features/customer/ui/bento-styles.ts` (`peachPill`, `forestPill`, `whitePill`, `bentoCard`, `softChip`…). Làm lại: card người chăm sóc (dải mint + avatar nổi + nút Đặt lịch peach), chi tiết người chăm sóc (hero forest + 4 ô số liệu, card đặt lịch trắng nút peach), card dịch vụ / trung tâm (ảnh lồng trong card, chip kính), chi tiết trung tâm, khu tài khoản (sidebar kính, mục chọn forest trượt `layoutId`, tab viên thuốc trên điện thoại), card lịch đặt (buổi kế tiếp nền forest, thanh tiến độ mint→forest, viền peach khi cần xử lý), panel trạng thái + stepper vòng đời, form đặt lịch (stepper kính, nội dung trong card trắng, tổng tiền mint), nút thanh toán / đặt lịch chính chuyển peach (đặt cọc, cần thanh toán, chi tiết dịch vụ, hồ sơ người thân), nút `bg-primary` thành viên thuốc, tiêu đề section đậm forest. Test 35 file / 195 test (customer + shared + home) qua; lỗi lint còn lại có từ trước (`booking-cancel-dialog.tsx` chữ cứng). Phiên song song làm Caregiver / Center Manager: tránh sửa `features/customer/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 4. Portal vận hành    | **Xong cả 3 portal 2026-11-09** (chưa commit) | Dùng chung (file mới, không sửa primitive cũ): `shared/ui/nav-rail.tsx` (`NavRail`, `NavRailBrand`, `NavRailToggle` — viên thuốc forest nổi, icon tròn, mục chọn = vòng mint + pill trượt `layoutId`, thu gọn 76 px với tooltip render qua portal vào `<body>` vì rail cuộn và cắt nội dung, `mobile='drawer'`, `wide` 280 px, `dense` 44 px cho menu dài), `shared/ui/page-transition.tsx` (`PageTransition`: `AnimatePresence mode='wait'` + `useOutlet()`; `transitionEnd` bỏ filter để phần tử `fixed` không lệch), `shared/ui/pill-tabs.tsx` (`PillTabs`, cùng API `Tabs`), `shared/ui/bento-page-header.tsx` (`BentoPageHeader` — breadcrumb pill, eyebrow, `variant='hero'` forest có icon mint; `bentoContainer`, `bentoCard`, `bentoBackLink`, `bentoTabList`/`bentoTabClass` cho tablist viết tay), `shared/ui/ops-theme.css` (`.theme-ops` cho Manager + Admin: token forest/mint, `--shadow-xs/sm` mềm, bo lớn, phần tử mặc định trong `@layer base`, `ops-stagger`, ô số liệu đầu tối `.ops-stat-dark` + `.ops-stat-icon`/`.ops-stat-value`), `features/shared/layout/ops-topbar.tsx` (`OpsTopbar`: nền mờ dần, ngôn ngữ / chuông / tài khoản là pill trắng). **Caregiver**: token trong `caregiver-theme.css` (như `.theme-customer`), `cgCard` bo 24 px, `cgForestCard`, `cgForestAction`/`cgPeachAction`/`cgOutlineAction`/`cgGlassAction`, `cg-lift`; NavRail; thanh dưới viên thuốc nổi; `StickyActionBar` nổi cạnh nút AI; Hôm nay = bento (tên serif nghiêng qua `<Trans>` + `<accent>`, buổi kế tiếp hero forest + CTA peach, Tuần này có `CountUp` + cột theo ngày); Hồ sơ và Thu nhập có hero forest; tab = `PillTabs`. **Center Manager**: NavRail drawer + thu gọn (`careconnect.manager.sidebarCollapsed`), `BentoPageHeader` mọi trang (hero: Thống kê, Dịch vụ, Chính sách, Ví, Phản hồi), 4 hàng ô số liệu + doanh thu dạng bento `CountUp`, chi tiết người chăm sóc hero forest. **Admin**: NavRail `dense` drawer + thu gọn (`careconnect.admin.sidebarCollapsed`), `BentoPageHeader` mọi trang (hero: Tổng quan, Dịch vụ — nút thêm peach, Chính sách, Ví nền tảng, Khiếu nại), tab Trung tâm / chi tiết trung tâm / Dịch vụ = pill forest, ô số liệu Tài khoản / Dịch vụ / Doanh thu mẫu / Duyệt chứng chỉ dạng bento `CountUp`, đầu trang chi tiết trung tâm / tài khoản / lịch đặt là card trắng bo lớn + nút quay lại dạng pill. Test 235/237 (2 lỗi có sẵn ở §7b), typecheck + eslint + build sạch, xem 1440 px + 390 px với API giả. Khối dùng chung (2026-11-09, sau đó): `Modal` vào/ra bằng `shared/ui/dialog-motion.css` (phóng từ 96 % + blur, nền forest mờ có `backdrop-filter`, `data-state='closed'` chạy ngược 150 ms; nút đóng / Escape / nền đều đi đường đóng có hiệu ứng; `useExitPresence` giữ dialog khi cha đặt `open=false`; trong test và khi giảm chuyển động đóng ngay), bo 28 px, nút đóng tròn; `Drawer` thành thẻ nổi bo 28 px; `Button` thêm `accent` (peach) và `dark` (forest), nhấn co 0.97; `SegmentedControl` = track pill + pill forest trượt; `OperationalStatisticsPanel` / `ProviderStatusPanel` (ô đầu forest, `CountUp`, thanh kết quả và thanh trạng thái mọc ra); `WalletDashboard` (số dư là hero forest, nút rút tiền peach, ô số liệu hiện lần lượt, biểu đồ cột bo tròn mint/peach mọc lên); `ComplaintQueue` (lọc = tab pill, thẻ bento), `CenterBookingPolicyForm`, `BookingsBrowser`, trang thông báo. `useAnimatedNumber` không còn làm tròn số thập phân (điểm 4,8 trước hiện 5). Trang Ví của Manager/Admin dùng đầu trang thường để không chồng hai khối forest. Phiên customer đang sửa `booking-history-list`, `booking-visit-schedule`, `booking-visit-table` nên không đụng. `Tabs` gạch chân vẫn giữ cho customer |
| 5. Đánh bóng          | Chưa                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
