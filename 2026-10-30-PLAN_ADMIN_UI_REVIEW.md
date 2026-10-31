# Plan rà soát & sửa trang Admin (CareConnect Web)

> Ngày: **2026-10-30** · Bản **v2** (đã cập nhật theo góp ý của chủ dự án) · Trạng thái: **đã thực hiện 2026-10-30** (xem §7).
> Nguồn đã đọc: `BE/AGENTS.md`, `BE/ProviderService/README.md` + `AGENTS.md`, `BE/IdentityService/README.md`,
> `BE/docs/2026-10-28-FULLSTACK_GAP_ANALYSIS.md` (quyết định D15–D30), `FE-careconnect/AGENTS.md`, `FE-careconnect/ARCHITECTURE.md`,
> toàn bộ `FE-careconnect/app/features/admin/**`, i18n `app/shared/i18n/admin/**`, các controller/DTO BE liên quan.
> Viết tắt: `FE/` = `FE-careconnect/app/`, `PV` = ProviderService, `ID` = IdentityService, `BK` = BookingService.

---

## 0. Quyết định đã chốt (v2)

| #    | Góp ý                                                                                                                                                                                  | Ảnh hưởng tới plan                                                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Ý là **đổi mật khẩu**, không phải đổi tài khoản: tạo user ở trang admin phải có phần **đặt / đổi mật khẩu bằng UI, gửi OTP về email**, để việc ghép tài khoản cho trung tâm thuận tiện | U-03 viết lại: tạo tài khoản → gửi OTP → đặt mật khẩu → ghép vào trung tâm                                                                                        |
| D-02 | **Quản lý lịch đặt không có vấn đề.** Vấn đề ở **Quản lý dịch vụ**: danh mục trong form tạo dịch vụ phải ngắn, súc tích, select không có quá nhiều lựa chọn                            | U-06 đổi đối tượng: từ Lịch đặt sang form Dịch vụ. Bỏ các đề xuất mở rộng màn Lịch đặt (chỉ giữ việc thay ID bằng tên — U-05)                                     |
| D-03 | **Trạng thái làm việc** = tài khoản còn hoạt động không + nhân viên còn làm cho trung tâm không. **Không** cập nhật theo check-in / check-out                                          | U-07: chỉ dùng trạng thái tài khoản (ID) + trạng thái hồ sơ (PV); bỏ "lịch hôm nay", bỏ "đang trong ca"                                                           |
| D-04 | Trung tâm **được hoạt động khuya / qua đêm**, tùy giờ làm việc từng trung tâm, không áp đặt                                                                                            | U-10: giờ đóng < giờ mở là hợp lệ (qua đêm), chỉ hiện chú thích, không báo lỗi                                                                                    |
| D-05 | **Không thêm API mới, không sửa BE**                                                                                                                                                   | Bỏ toàn bộ đề xuất BE. Chỉ sửa trong `FE-careconnect/`. Mọi chức năng dùng API **đang có**. Chức năng nào bắt buộc phải có BE mới → ghi rõ "ngoài phạm vi" (§0.2) |
| D-06 | Chi tiết trung tâm làm **trang riêng**                                                                                                                                                 | `/admin/centers/:id` thay cho overlay hiện tại                                                                                                                    |

### 0.1 Phạm vi sửa: chỉ FE

| Ký hiệu              | Ý nghĩa                                                                                                                                                                                            | Repo bị sửa       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 🟢 **FE**            | Sửa code FE, dùng API đang có, không đổi contract                                                                                                                                                  | `FE-careconnect/` |
| 🟡 **FE + snapshot** | API / tham số / trường **BE đã có và đang chạy**, chỉ là file `openapi/openapi.yaml` của FE chưa khai báo → bổ sung khai báo + `pnpm api:generate`. **Không sửa dòng code BE nào, không thêm API** | `FE-careconnect/` |

> 🟡 không vi phạm D-05: `openapi/openapi.yaml` là **bản chụp hợp đồng nằm trong repo FE** (`FE-careconnect/AGENTS.md` §
> Data and API rules). Khai báo thêm tham số BE đã hỗ trợ sẵn chỉ giúp FE gọi đúng API hiện có.

### 0.2 Ngoài phạm vi (cần BE nên **không làm** trong plan này)

| Việc                                                              | Vì sao cần BE                     | Cách FE xử lý trong phạm vi                                                           |
| ----------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| Chuyển một tài khoản quản lý từ trung tâm A sang B                | ID chưa có API đổi `center_id`    | Tạo tài khoản quản lý mới cho trung tâm B (UI hướng dẫn rõ)                           |
| Gỡ hẳn quyền của quản lý cũ khi thay người                        | Cần đồng bộ `center_id` ID ↔ PV   | Khi đổi người, đề nghị **khóa tài khoản quản lý cũ** (API khóa đã có)                 |
| Avatar cho tài khoản khách / quản lý / admin                      | ID không có trường ảnh            | Giữ chữ viết tắt                                                                      |
| Upload ảnh hồ sơ người bệnh                                       | CareRecipient không có upload ảnh | Không làm                                                                             |
| Thẻ công khai cho khách tự chọn ảnh mới nhất                      | PV chọn sẵn ảnh đầu tiên          | FE đảm bảo mỗi caregiver **chỉ còn 1 ảnh đại diện** (U-11) nên ảnh đầu tiên = ảnh mới |
| Tên trung tâm / caregiver / dịch vụ có sẵn trong dữ liệu lịch đặt | BK chỉ trả ID                     | FE tra tên qua API PV / Catalog đang có (U-05)                                        |
| Vai trò tùy chỉnh mở được cổng / quyền ở các service khác         | Chưa có permission catalog        | Giải thích rõ trên UI (U-09)                                                          |

---

## 1. Tóm tắt

| #    | Vấn đề                                                                           | Hướng xử lý                                                                                  | Phạm vi |
| ---- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------- |
| U-01 | Còn nhắc "giấy phép kinh doanh" ở quản lý trung tâm                              | Xóa mọi chuỗi / cột / key liên quan                                                          | 🟢      |
| U-02 | Bảng / chi tiết hiện UUID, mã kỹ thuật                                           | Quy tắc "không hiện UUID", sửa từng vị trí                                                   | 🟢      |
| U-03 | Tạo tài khoản ở admin chưa đặt được mật khẩu; ghép quản lý cho trung tâm rắc rối | Đặt mật khẩu bằng OTP gửi email ngay trong admin; khối "Người quản lý" trong trang trung tâm | 🟡      |
| U-04 | Nhãn menu / tiêu đề / phụ đề dài dòng                                            | Rút gọn nhãn                                                                                 | 🟢      |
| U-05 | Chỗ hiện ID thay vì tên (vd chi tiết lịch đặt)                                   | Tra tên qua API đang có                                                                      | 🟢      |
| U-06 | Danh mục trong form tạo dịch vụ dài, quá nhiều lựa chọn                          | Bộ danh mục cố định 6 mục ngắn, bỏ ô tự thêm, gộp danh mục cũ                                | 🟢      |
| U-07 | Chi tiết trung tâm chưa có nhân sự                                               | Trang chi tiết có tab Nhân sự: số lượng + trạng thái làm việc                                | 🟡      |
| U-08 | Duyệt trung tâm bị đá sang form sửa                                              | Panel "Thẩm định" với checklist + nút Duyệt / Từ chối                                        | 🟢      |
| U-09 | Vai trò & quyền không mô tả dùng để làm gì                                       | Mô tả từng vai trò / quyền, ma trận, cảnh báo vai trò tùy chỉnh                              | 🟢      |
| U-10 | Lỗi khi gọi POST/PUT không phân loại                                             | Khung lỗi 3 tầng: validation / nghiệp vụ / hệ thống; ngày giờ chỉ nhắc                       | 🟢      |
| U-11 | Up avatar / ảnh không cập nhật ngay ở danh sách & nơi dùng ảnh                   | Một quy tắc chọn ảnh, một helper làm mới cache, xem trước tức thì, `Avatar` dùng chung       | 🟢      |

§3 liệt kê **vấn đề bổ sung** (A-xx). Nặng nhất: **A-02** tìm/lọc/KPI trang Tài khoản chỉ chạy trên **một trang
20 dòng**; **A-06** admin gán được vai trò Người chăm sóc / Quản lý qua dropdown chung → lệch dữ liệu; **A-12** thay quản lý
nhưng tài khoản cũ vẫn còn quyền.

---

## 2. Nguyên tắc chung cho mọi màn admin

1. **Không hiển thị UUID.** UUID chỉ nằm trong URL / `key` / request. Không tra được tên → "Không xác định" (không
   fallback về UUID). **Mã nghiệp vụ** người dùng đọc được (vd `#BK-20261030-0012`) được giữ.
2. **Không hiển thị mã kỹ thuật** (`CENTER_MANAGER`, `user:manage`, `eventType`, `lastError` thô, mã lỗi số). Mọi chữ qua
   i18n (`FE-careconnect/AGENTS.md` § Localization).
3. **Nhãn ngắn**: menu 1–2 từ, tiêu đề trang ≤ 4 từ, phụ đề ≤ 1 dòng hoặc bỏ; select ≤ ~8 lựa chọn.
4. **Một hành động – một chỗ**: không vừa tab vừa dropdown cùng lọc; không khối chữ trang trí.
5. **Lỗi 3 tầng** (U-10): validation dưới ô; nghiệp vụ & hệ thống ở cuối form, cạnh nút gửi.
6. Dùng primitive `FE/shared/ui/` (`Button`, `FormField`, `Modal`/`ConfirmDialog`, `Toast`, `StatusBadge`, `Pagination`,
   `state-panels`) thay vì class Tailwind tự viết ở từng trang.

---

## 3. Chi tiết từng vấn đề

### U-01 — Bỏ "giấy phép kinh doanh" ở quản lý trung tâm · 🟢

**Hiện trạng** — PV `CenterResponse` chỉ có tên, email, SĐT, địa chỉ, giờ hoạt động, trạng thái, lý do, quản lý, version,
thời điểm; **không có** GPKD / GPHĐ / phân hạng. FE còn:

- `FE/shared/i18n/admin/centers-resources.ts`: placeholder tìm kiếm thật đang dùng `'Tìm tên trung tâm, mã đối tác, GPKD hoặc
người đại diện'`; các key `businessLicense`, `operationLicense`, `accreditation(s)`, `representative`,
  `steps.first: 'Tiếp nhận hồ sơ & GPKD'`, `steps.*`, `process*`, `regions`, `notes`, `metricHints`, `nurses`… (copy trang mẫu cũ).
- Cột bảng có key `legal`.

**Việc cần làm**

- [ ] Placeholder → "Tìm theo tên hoặc địa chỉ".
- [ ] Đổi key cột `legal` → `contact`.
- [ ] Xóa key không dùng trong `centers-resources.ts` (vi + en cùng lúc; grep `admin.centersPage.` trước khi xóa).
- [ ] `features/admin/quality/*` (trang preview ẩn khỏi menu — D26) giữ nguyên.

**AC:** grep `GPKD|GPHĐ|giấy phép|license` trong `features/admin/centers` và `centers-resources.ts` = 0.

---

### U-02 — Không hiện ID trên các bảng admin · 🟢

| Vị trí                                                                    | Đang hiện                                                | Thay bằng                                                                                      |
| ------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `features/admin/services/components/catalog-table.tsx:65`                 | `item.id` dưới tên dịch vụ                               | Bỏ                                                                                             |
| `features/admin/bookings/admin-booking-detail-page.tsx:91`                | `data.centerId` (font-mono)                              | Tên trung tâm (U-05)                                                                           |
| `features/admin/caregiver-queue/components/pending-caregiver-card.tsx:22` | `centerName ?? centerId`                                 | `centerName ?? 'Không xác định'`                                                               |
| `features/admin/incidents/components/incident-row.tsx:38`                 | `subjectId`, `eventType` thô, `lastError` thô            | Nhãn loại sự kiện (i18n) + đối tượng đọc được; `lastError` thu vào "Chi tiết kỹ thuật" thu gọn |
| `features/admin/identity/roles-page.tsx`                                  | `roleName (roleCode)`, `<small>{permissionCode}</small>` | Tên + mô tả (U-09)                                                                             |
| `features/admin/identity/account-detail-page.tsx:242`                     | role code thô                                            | Nhãn vai trò                                                                                   |
| `features/admin/identity/accounts-page.tsx:59`                            | tìm kiếm khớp cả `user.id`                               | Bỏ `id` khỏi tập tìm kiếm                                                                      |

- [ ] Sửa từng vị trí. Thêm quy tắc "Admin/Manager UI không render UUID" vào `FE-careconnect/AGENTS.md` § Quality rules.

**AC:** đi hết menu admin, không thấy chuỗi dạng `xxxxxxxx-xxxx-…`.

---

### U-03 — Tạo tài khoản + đặt mật khẩu bằng OTP + ghép quản lý cho trung tâm · 🟡

#### Hiện trạng

- Tài khoản do admin tạo (`POST /users`) **chưa có mật khẩu** (ID: "Tài khoản provision chưa có password; người nhận dùng
  forgot/reset password với OTP để tự đặt"). Nhưng trang admin **không có nút nào** cho việc này: admin phải tự bảo người
  dùng ra trang đăng nhập → "Quên mật khẩu" → nhập lại email. Toast sau khi tạo chỉ báo "Đã tạo".
- Ghép quản lý cho trung tâm cần ≥ 6 bước qua 2 trang: tạo trung tâm → sang Tài khoản tạo quản lý chọn trung tâm → quay lại
  trung tâm → Sửa → chọn quản lý → Lưu → đổi trạng thái. (Không gán được lúc tạo trung tâm vì quản lý phải thuộc đúng
  `center_id` — H-12.)
- `CenterManagerSelect` chỉ liệt kê quản lý đã có `centerId` = trung tâm này; rỗng thì chỉ có link sang trang Tài khoản (mất
  ngữ cảnh). `useCenterManagers` tải 5 × 100 user rồi lọc client vì snapshot chưa khai báo tham số lọc của `GET /users`
  (BE **đã hỗ trợ** `role`, `status`, `centerId`, `keyword` — `ID/service/Impl/UserServiceImpl.java:220`).

#### API dùng (đều đã có — không sửa BE)

| Bước                                | API                                                         | Ghi chú                                                                            |
| ----------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Tạo tài khoản                       | `POST /v1/users` (`provisionUser`)                          | `roleCode`, `centerId` (bắt buộc với quản lý)                                      |
| Gửi OTP đặt mật khẩu về email       | `POST /v1/auth/forgot-password` (`requestPasswordReset`)    | Public + CSRF; OTP gửi về **email của chủ tài khoản**; luôn trả message trung tính |
| Đặt mật khẩu bằng OTP               | `POST /v1/auth/reset-password` (`resetPassword`)            | `email`, `otpCode`, `newPassword`; OTP dùng 1 lần, mật khẩu theo `@StrongPassword` |
| Ghép quản lý vào trung tâm          | `PUT /v1/care-centers/{id}`                                 | `managerUserId` + `version`                                                        |
| Lọc tài khoản quản lý của trung tâm | `GET /v1/users?role=CENTER_MANAGER&status=ACTIVE&centerId=` | 🟡 chỉ khai báo tham số vào snapshot                                               |
| Khóa tài khoản quản lý cũ           | `PATCH /v1/users/{id}/status` `{status, reason}`            | 🟡 khai báo trường `reason` vào snapshot                                           |

FE đã có wrapper `features/shared/auth/password-recovery-api.ts` (`sendPasswordResetCode`, `confirmPasswordReset`,
`passwordRecoveryErrorKey`) → **chuyển lên `entities/identity/`** để cả trang Quên mật khẩu và trang Admin dùng chung
(quy tắc feature không import nội bộ feature khác).

#### Đề xuất 1 — Khối "Mật khẩu" (dùng chung ở 3 nơi)

Xuất hiện ở: **(a)** bước cuối của modal "Tạo tài khoản", **(b)** trang chi tiết tài khoản, **(c)** modal "Tạo tài khoản quản
lý" trong trang trung tâm.

```
┌ Mật khẩu ───────────────────────────────────────────────────────┐
│ Tài khoản chưa có mật khẩu.                                     │
│ [Gửi mã OTP tới a@center.vn]          (gửi lại sau 00:58)        │
│                                                                 │
│ Cách 1 — Người dùng tự đặt: họ mở email, vào link               │
│          /forgot-password?email=a@center.vn, nhập OTP + mật khẩu │
│ Cách 2 — Đặt cùng người dùng: nhập mã OTP họ nhận được          │
│   Mã OTP        [______]                                        │
│   Mật khẩu mới  [__________]  (≥ 8 ký tự, hoa, thường, số, ký tự đặc biệt) │
│   Nhập lại      [__________]                                    │
│                                        [Đặt mật khẩu]            │
└─────────────────────────────────────────────────────────────────┘
```

- **"Gửi mã OTP"** gọi `requestPasswordReset({ email })`. Thành công → toast "Đã gửi mã tới <email>", đếm ngược trước khi
  cho gửi lại; lỗi gửi lại quá sớm → báo thời gian chờ (lỗi nghiệp vụ, U-10); Brevo lỗi (`EMAIL_DELIVERY_FAILED`) → lỗi
  hệ thống có "Thử lại".
- Modal "Tạo tài khoản": checkbox **"Gửi mã đặt mật khẩu ngay sau khi tạo"** (mặc định bật) → tạo xong tự gọi gửi OTP, rồi
  chuyển sang khối Mật khẩu (không đóng modal), có nút "Để sau".
- **Cách 2** dành cho lúc admin đang gọi điện / ngồi cùng người dùng: OTP **vẫn chỉ đến email của chủ tài khoản**, admin
  không đặt được mật khẩu nếu không có mã từ hộp thư người đó — đúng thiết kế bảo mật của ID, không cần BE mới.
- Validation dưới ô (U-10): OTP 6 số; mật khẩu theo luật `@StrongPassword` (≥ 8 ký tự, chữ thường, chữ hoa, số, ký tự đặc
  biệt, ≤ 72 byte); "Nhập lại" khớp. Lỗi BE: 1059–1063, 1072 (OTP sai / hết hạn / quá số lần) → dưới ô OTP; 1074 → dưới ô
  mật khẩu (dùng lại `passwordRecoveryErrorKey`).
- Thành công → toast "Đã đặt mật khẩu. <Tên> có thể đăng nhập bằng email này."; xóa ô mật khẩu khỏi state ngay (không giữ,
  không ghi log, không lưu trình duyệt).
- Trang chi tiết tài khoản: khối này luôn có (kể cả tài khoản đã có mật khẩu) với nhãn **"Đổi mật khẩu bằng OTP"** — hỗ trợ
  khi người dùng quên mật khẩu. Ghi chú: đặt lại mật khẩu sẽ **đăng xuất mọi phiên** của người đó (ID tăng `authz_version`).
- Trang `/forgot-password`: đọc `?email=` để điền sẵn email (Cách 1).
- ⚠️ Giới hạn đã biết (không sửa được ở FE): `UserResponse` không cho biết tài khoản đã có mật khẩu chưa → khối hiển thị cùng
  một nội dung, chỉ đổi nhãn theo ngữ cảnh ("Đặt mật khẩu" ngay sau khi tạo / "Đổi mật khẩu bằng OTP" ở chi tiết).

#### Đề xuất 2 — Khối "Người quản lý" trong trang trung tâm

```
┌ Người quản lý ─────────────────────────────────────────────┐
│ (chưa có)  Trung tâm cần người quản lý trước khi kích hoạt. │
│ [+ Tạo tài khoản quản lý]   [Chọn tài khoản có sẵn ▾]        │
└─────────────────────────────────────────────────────────────┘
┌ Người quản lý ─────────────────────────────────────────────┐
│ Nguyễn Văn A · a@center.vn · 0901…  ● Đang hoạt động         │
│ [Đổi người quản lý] [Đổi mật khẩu bằng OTP] [Xem tài khoản]  │
└─────────────────────────────────────────────────────────────┘
```

- **Tạo tài khoản quản lý** (modal 3 bước, không rời trang):
  1. Thông tin: email, họ tên, SĐT → `POST /users` (`CENTER_MANAGER`, `centerId` = trung tâm đang mở, không cho chọn).
  2. Ghép: tự gọi `PUT /care-centers/{id}` với `managerUserId` + `version`. Lỗi → giữ `userId` trong modal, nút "Thử ghép
     lại" (không tạo trùng tài khoản) — cùng mẫu form tạo caregiver của manager (`ARCHITECTURE.md`).
  3. Mật khẩu: khối "Mật khẩu" ở trên (OTP gửi ngay).
- **Chọn tài khoản có sẵn**: chỉ quản lý `ACTIVE` có `centerId` = trung tâm này (lọc phía server sau khi khai báo snapshot).
  Danh sách rỗng → nút "Tạo tài khoản quản lý" ngay đó (không đưa sang trang khác).
- **Đổi người quản lý**: dialog chọn người mới + checkbox (mặc định bật) "Khóa tài khoản quản lý cũ" kèm ô lý do — vì thay
  quản lý ở PV không gỡ `center_id` ở ID, quản lý cũ vẫn còn quyền (A-12).
- Quản lý muốn chuyển sang trung tâm khác → UI giải thích "Mỗi tài khoản quản lý gắn với một trung tâm. Hãy tạo tài khoản
  mới cho trung tâm này" (ngoài phạm vi §0.2).
- Trang **chi tiết tài khoản**: hiện "Trung tâm: <tên>" cho quản lý / người chăm sóc; dropdown gán vai trò **ẩn** Người chăm
  sóc (tạo kèm hồ sơ PV ở cổng Quản lý trung tâm) và Quản lý trung tâm (chỉ gán qua trang Trung tâm) — A-06.
- Trang **Tài khoản**, tạo quản lý xong: nút "Mở trung tâm <tên> để ghép làm người quản lý".

**AC**

- Từ trung tâm PENDING chưa có quản lý: admin tạo tài khoản quản lý, ghép vào trung tâm, gửi OTP và (cùng người dùng) đặt
  mật khẩu, rồi duyệt trung tâm — **không rời trang chi tiết trung tâm**.
- Tạo bất kỳ tài khoản nào ở `/admin/accounts` đều có đường đặt mật khẩu bằng OTP ngay trong modal.

---

### U-04 — Rút gọn nhãn menu, tiêu đề · 🟢

**Menu (`FE/shared/i18n/admin/layout-resources.ts`)**

| Hiện tại             | Đề xuất                                      |
| -------------------- | -------------------------------------------- |
| Bảng điều khiển      | Tổng quan                                    |
| Dịch vụ & Bảng giá   | Dịch vụ                                      |
| Quản lý Trung tâm    | Trung tâm                                    |
| Quản lý Lịch đặt     | Lịch đặt                                     |
| Quản lý Điều dưỡng   | Người chăm sóc _(thuật ngữ sản phẩm — A-10)_ |
| Quản lý Khách hàng   | Khách hàng                                   |
| Đánh giá & Khiếu nại | Khiếu nại                                    |
| Vai trò và quyền     | Phân quyền                                   |
| Sự cố đồng bộ        | Sự cố                                        |

Nhóm "Tổng quan" chỉ 1 mục → bỏ tiêu đề nhóm; còn 3 nhóm **Vận hành / Khách hàng / Hệ thống**.

**Tiêu đề + phụ đề** — ≤ 4 từ, phụ đề 1 dòng hoặc bỏ:

- "Quản lý Trung tâm Chăm sóc Đối tác" → "Trung tâm"; phụ đề → "Duyệt và theo dõi trạng thái trung tâm."
- Lịch đặt: phụ đề → "Tất cả lịch đặt trên nền tảng."
- Dịch vụ: phụ đề → "Danh mục dịch vụ chuẩn và giá theo trung tâm."
- Tổng quan: bỏ "…và doanh thu" (chưa có số thật).

---

### U-05 — Thay ID bằng tên (vd chi tiết lịch đặt) · 🟢

> Theo D-02, màn Lịch đặt **không cần thêm chức năng**; chỉ sửa chỗ đang hiện ID / thiếu tên.

**Hiện trạng** — BK chỉ trả `centerId`, `caregiverId`; `BookingItemResponse.serviceName` luôn null. Chi tiết lịch đặt hiện
UUID trung tâm; danh sách buổi hiện "Đã phân công" thay vì tên vì trang admin không truyền `caregiverName`.

**Việc cần làm (API đang có, ADMIN được gọi)**

- [ ] `entities/provider`: `useCenterName(centerId)` (`GET /care-centers/{id}`, cache `providerKeys.center`),
      `useCaregiverName(caregiverId)` (`GET /caregivers/{id}`, cache `providerKeys.caregiver`).
- [ ] Chi tiết lịch đặt: tên trung tâm (link sang `/admin/centers/:id`), truyền `caregiverName` cho `BookingOccurrenceList`.
- [ ] Danh sách lịch đặt: thêm tên trung tâm vào dòng (gom `centerId` duy nhất của trang, `useQueries`, có cache).
- [ ] Các màn khác dùng cùng hook khi gặp ID: hàng chờ duyệt caregiver, sự cố (đối tượng của sự kiện).

**AC:** màn Lịch đặt (list + detail) không còn UUID; buổi có caregiver hiện họ tên.

---

### U-06 — Danh mục trong form tạo dịch vụ: ngắn, súc tích, ít lựa chọn · 🟢

**Hiện trạng** (`features/admin/services/components/category-select.tsx`, `service-category.constants.ts`,
`catalog-item-form.ts`)

- Select gộp **8 danh mục chuẩn** dài ("Chăm sóc sau tai biến & đột quỵ", "Chăm sóc bệnh mạn tính & sa sút trí tuệ",
  "Điều dưỡng & kỹ thuật y tế"…) **+ mọi danh mục đã có trong DB** (nhóm "Danh mục đang sử dụng") **+ "+ Thêm danh mục mới…"**
  (ô tự nhập). Mỗi lần ai đó gõ một danh mục mới, select dài thêm → không kiểm soát, dễ trùng nghĩa ("Người già" vs
  "Chăm sóc người cao tuổi").
- Danh mục là chuỗi tự do `CatalogItemRequest.category` (≤ 255 ký tự), không có bảng danh mục ở BE.

**Đề xuất — bộ danh mục cố định 6 mục (chỉ FE)**

| Key              | Nhãn (vi)          | Nhãn (en)       | Gộp từ danh mục cũ                                          |
| ---------------- | ------------------ | --------------- | ----------------------------------------------------------- |
| `elderly`        | Người cao tuổi     | Elderly care    | Chăm sóc người cao tuổi                                     |
| `postSurgery`    | Sau phẫu thuật     | Post-surgery    | Chăm sóc hậu phẫu                                           |
| `rehabilitation` | Phục hồi chức năng | Rehabilitation  | Vật lý trị liệu & phục hồi; Chăm sóc sau tai biến & đột quỵ |
| `chronic`        | Bệnh mạn tính      | Chronic illness | Chăm sóc bệnh mạn tính & sa sút trí tuệ; Chăm sóc giảm nhẹ  |
| `nursing`        | Điều dưỡng y tế    | Medical nursing | Điều dưỡng & kỹ thuật y tế                                  |
| `motherBaby`     | Mẹ và bé           | Mother & baby   | Chăm sóc mẹ và bé sau sinh                                  |

_(Bộ 6 mục là đề xuất — anh/chị chỉnh tên / số lượng trước khi làm.)_

- [ ] `service-category.constants.ts`: chỉ còn 6 mục; `value` lưu DB = nhãn tiếng Việt ngắn ở trên (ổn định, không đổi theo
      ngôn ngữ); select hiển thị nhãn i18n.
- [ ] **Bỏ** nhóm "Danh mục đang sử dụng" và lựa chọn "+ Thêm danh mục mới…" khỏi form tạo.
- [ ] **Danh mục cũ trong DB** (không sửa BE / không migrate): bảng `LEGACY_CATEGORY_MAP` ánh xạ giá trị cũ → key mới (cột
      "Gộp từ" ở trên). Bảng dịch vụ, bộ lọc danh mục (admin + trang Dịch vụ của khách) hiển thị và lọc theo nhóm mới.
      Mở form sửa một dịch vụ có danh mục cũ → select chọn sẵn nhóm tương ứng; giá trị lạ không ánh xạ được → hiện
      "Khác (giá trị cũ: …)" và yêu cầu chọn lại một trong 6 mục (nhắc dưới ô, không chặn mở form). Lưu → ghi giá trị mới qua
      `PUT /catalog-items/{id}` đang có (đây là sửa **dữ liệu** bằng API sẵn có, không sửa code BE).
- [ ] Bộ lọc danh mục ở trang Dịch vụ: chỉ 6 nhóm + "Tất cả".
- [ ] Rút gọn copy form: bỏ "Nhóm danh mục" → "Danh mục"; bỏ placeholder dài của mô tả.

**AC:** select danh mục trong form tạo dịch vụ có đúng 6 lựa chọn ngắn; dịch vụ cũ vẫn hiện đúng nhóm; không còn ô "Thêm
danh mục mới".

---

### U-07 — Trang chi tiết trung tâm: nhân sự & trạng thái làm việc · 🟡

**Hiện trạng** — chi tiết trung tâm là overlay chỉ có liên hệ + quản lý + đổi trạng thái + ảnh; nhân sự nằm ở
`/admin/centers/:id/caregivers` (chỉ phục vụ duyệt hồ sơ / chứng chỉ).

**Đề xuất** — trang riêng **`/admin/centers/:id`** (D-06), có tab:

| Tab       | Nội dung                                                                                         | API (đang có)                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Tổng quan | Liên hệ, giờ hoạt động, trạng thái + lý do, **Người quản lý** (U-03), panel **Thẩm định** (U-08) | `GET /care-centers/{id}`                                                                             |
| Nhân sự   | KPI + bảng nhân viên (dưới)                                                                      | `GET /caregivers/centers/{centerId}?status=&verification=`; `GET /users?role=CAREGIVER&centerId=` 🟡 |
| Hoạt động | Lịch đặt theo trạng thái, khiếu nại, điểm đánh giá, top caregiver                                | `GET /statistics/centers?centerId=` (ADMIN được truyền `centerId`)                                   |
| Hình ảnh  | `ProviderMediaPanel` (U-11)                                                                      | `/provider-media/CARE_CENTER/{id}`                                                                   |

**Trạng thái làm việc (D-03)** = ghép **2 nguồn**, không dựa vào check-in / check-out:

| Tài khoản (ID `status`) | Hồ sơ tại trung tâm (PV `caregiverStatus`) | Hiển thị                                    |
| ----------------------- | ------------------------------------------ | ------------------------------------------- |
| ACTIVE                  | ACTIVE                                     | ● **Đang làm việc**                         |
| ACTIVE                  | INACTIVE                                   | ○ **Tạm nghỉ**                              |
| bất kỳ                  | SUSPENDED                                  | ⊘ **Đình chỉ**                              |
| bất kỳ                  | ARCHIVED                                   | — **Đã nghỉ việc** (ẩn mặc định, có bộ lọc) |
| LOCKED                  | ACTIVE / INACTIVE                          | 🔒 **Tài khoản bị khóa**                    |

- KPI: Tổng nhân viên · Đang làm việc · Tạm nghỉ · Đình chỉ · Tài khoản bị khóa · Chờ xác minh hồ sơ.
- Bảng: avatar (U-11), họ tên, trạng thái làm việc (bảng trên), xác minh hồ sơ, kinh nghiệm, đánh giá. Hành động: "Duyệt hồ
  sơ" → trang `/admin/centers/:id/caregivers` hiện có.
- Ghép 2 nguồn theo `userId`: hồ sơ PV có `userId`; tài khoản ID lấy bằng `GET /users?role=CAREGIVER&centerId=` (🟡 khai báo
  tham số vào snapshot; BE đã có). KPI đếm bằng `size=1` + `totalElements` cho từng trạng thái PV; số "tài khoản bị khóa"
  đếm bằng `GET /users?role=CAREGIVER&centerId=&status=LOCKED&size=1`.
- **Không** có "lịch hôm nay", "đang trong ca" (D-03).

**Việc cần làm**

- [ ] Route mới `routes/admin/center-detail.tsx` (`/admin/centers/:id`); danh sách trung tâm điều hướng sang trang này thay
      vì mở overlay; bỏ `?center=` trong URL (giữ redirect từ link cũ `?center=<id>` → `/admin/centers/<id>`).
- [ ] Trung tâm đã lưu trữ (PV trả 404) → trang hiện trạng thái "Đã lưu trữ, chỉ tra cứu" thay vì lỗi.

---

### U-08 — Duyệt trung tâm thân thiện · 🟢

**Hiện trạng** (`admin-centers-live-page.tsx` `CenterDetails`)

- Đổi trạng thái bằng **dropdown** + ô lý do + "Cập nhật" — admin phải biết PENDING → ACTIVE là duyệt.
- Thiếu quản lý: nút "Gán quản lý" **mở form Sửa trung tâm**. Duyệt khi thiếu quản lý → BE 4120, FE báo chung chung.

**Đề xuất — panel "Thẩm định" khi `PENDING`**

```
Thẩm định trung tâm
 ✓ Thông tin liên hệ (email, SĐT, địa chỉ)
 ✓ Giờ hoạt động
 ✗ Người quản lý — [Tạo tài khoản quản lý] [Chọn có sẵn]   ← xử lý tại chỗ (U-03)
 ○ Ảnh trung tâm (không bắt buộc)
 [ Từ chối ]                              [ Duyệt & kích hoạt ]
```

- "Duyệt & kích hoạt" luôn bấm được; thiếu mục bắt buộc → không gọi API, cuộn tới mục thiếu và báo ngay dưới mục đó (không
  khóa nút, không chuyển form).
- "Từ chối" → dialog lý do bắt buộc (gợi ý nhanh + ô tự nhập, ≤ 500 ký tự — 4112).
- `ACTIVE`: 2 nút "Tạm khóa" / "Ngừng hoạt động", dialog nêu hệ quả (khóa tài khoản trung tâm, hủy buổi sắp tới, hoàn 100 %)
  - số lịch đặt bị ảnh hưởng (tab Hoạt động). `SUSPENDED` / `INACTIVE`: nút "Mở lại".
- Danh sách trung tâm: tab "Chờ duyệt" có badge số lượng; dòng PENDING có nút "Thẩm định".
- Thành công → toast + cập nhật trạng thái tại chỗ.
- Lưu trữ: vào menu "Thêm" (⋯); lỗi 4121 → "Trung tâm còn lịch chưa kết thúc".

---

### U-09 — Mô tả vai trò & quyền · 🟢

**Hiện trạng** — `/admin/roles` chỉ hiện `roleName (roleCode)`, mô tả DB (thường trống), checkbox `permissionName` +
`permissionCode`. Không nói vai trò vào cổng nào, thấy dữ liệu gì.

- [ ] i18n `admin.identity.roleInfo.<ROLE>`: **Dùng cho ai · Cổng truy cập · Làm được gì · Phạm vi dữ liệu** (theo bảng Roles
      `BE/AGENTS.md` §1):
  - Quản trị viên — cổng Admin; trung tâm, tài khoản, danh mục dịch vụ, khiếu nại cấp cao, sự cố; toàn hệ thống.
  - Quản lý trung tâm — cổng Trung tâm; người chăm sóc, dịch vụ & giá, lịch đặt, phân công, khiếu nại cấp 1; **chỉ trung tâm
    của mình**.
  - Người chăm sóc — app mobile / cổng Caregiver; buổi được giao, cập nhật ca, báo cáo; **chỉ buổi được giao**.
  - Khách hàng — cổng Khách hàng; đặt lịch, hồ sơ người bệnh, đánh giá; **chỉ dữ liệu của mình**.
- [ ] i18n `admin.identity.permissionInfo.<code>` cho 5 quyền (`user:read`, `user:manage`, `manager:create`,
      `caregiver:create`, `role:manage`) theo bảng Permission catalog `BE/AGENTS.md` §5; checkbox hiện tên + mô tả, không hiện mã.
- [ ] Ma trận "Vai trò × Quyền" (chỉ đọc) đầu trang.
- [ ] Cảnh báo vai trò tùy chỉnh: chỉ mang 5 quyền quản trị tài khoản, **không mở được cổng nào** (A-18).

---

### U-10 — Phân loại lỗi khi gọi POST/PUT/PATCH/DELETE · 🟢

**Hiện trạng**

- `FE/shared/api/error-details.ts` `apiRequestErrorKey` chỉ map theo **HTTP status** → mọi 400 thành "Dữ liệu không hợp lệ",
  không biết ô nào sai.
- BE chỉ trả **mã validation đầu tiên** (`GlobalExceptionHandler.handlingValidation` lấy `getFirst()`) → FE phải tự kiểm đủ ô.
- Accounts / AccountDetail / Roles dồn mọi lỗi vào **một banner trên đầu** (`role='status'`); CenterForm dùng `required` HTML +
  một `<p>` chung; duyệt caregiver dùng **một ô lý do chung** cho hồ sơ và mọi chứng chỉ.
- Mẫu tốt sẵn có: `features/admin/services/components/catalog-item-dialog.tsx` (3101–3103 xuống từng ô, `aria-invalid`,
  focus ô lỗi đầu) — làm chuẩn.

**Thiết kế 3 tầng**

| Tầng           | Ví dụ mã                                                                                                                                                                                                                                                       | Hiển thị                                                                                                     | Hành vi                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| **Validation** | 4102 tên, 4104/4105 email, 4106 địa chỉ, 4108 SĐT, 4111 lý do (trung tâm); 1011/1015 email, 1014 SĐT, 1108/1109 mã/tên vai trò, 1059–1063/1072 OTP, 1074 mật khẩu yếu (tài khoản); 3101–3103 (dịch vụ)                                                         | Ngay dưới ô, `aria-invalid` + `aria-describedby`, focus + cuộn tới ô lỗi đầu                                 | Lỗi của ô mất khi người dùng sửa ô đó |
| **Nghiệp vụ**  | 4101/1003 email trùng*, 4114 version, 4115 đã lưu trữ, 4118 quản lý đã thuộc trung tâm khác, 4120 thiếu quản lý, 4121 còn lịch, 4122 sai chuyển trạng thái, 4503 lệch trung tâm, 1100 thiếu trung tâm, 1104 admin cuối, 1118 thiếu lý do khóa, gửi OTP quá sớm | Khối cảnh báo **cuối form, cạnh nút gửi**, câu có hướng xử lý ("Tải lại", "Tạo tài khoản cho trung tâm này") | Giữ dữ liệu đã nhập                   |
| **Hệ thống**   | 5xx, 503 (4500, 4700–4702, gửi email lỗi), mất mạng, timeout                                                                                                                                                                                                   | Khối lỗi cuối form + "Thử lại"                                                                               | Giữ dữ liệu; không đóng modal         |

\* Email trùng hiện **dưới ô email** dù là 409, vì người dùng sửa ở đó.

**Hiện thực**

- [ ] `FE/shared/api/api-error.ts`: `classifyApiError(error, map)` → `{ kind: 'field', field, key } | { kind: 'business', key }
| { kind: 'system', key, retryable }`; `map` = bảng `code → { field?, key }` riêng mỗi form.
- [ ] `FE/shared/ui/form-alert.tsx`: khối thông báo cuối form (tone `warning` | `error`, nút hành động tùy chọn).
- [ ] `FE/shared/lib/use-form-errors.ts`: `fieldErrors`, `setFromApi(error)`, `clear(field)`, `focusFirst()`.
- [ ] Bảng mã theo feature: `centers/center-errors.ts` (mở rộng), `identity/identity-errors.ts`, mật khẩu dùng
      `passwordRecoveryErrorKey`, sự cố, duyệt caregiver.
- [ ] **Validation client đủ mọi ô trước khi gửi**, cùng luật BE: tên ≤ 255, địa chỉ ≤ 2000, email đúng dạng, SĐT trung tâm
      10–15 số (PV) / tài khoản 10–11 số (ID) — A-08, lý do ≤ 500, mật khẩu `@StrongPassword`. Form đặt `noValidate`, bỏ
      `required` HTML.
- [ ] Toast thành công cho mọi thao tác ghi.

**Ngày giờ — chỉ nhắc, không chặn**

- Không dùng `min`/`max` khóa lựa chọn, không tự sửa giá trị đã chọn, không `disabled` nút gửi vì ngày giờ.
- Kiểm khi blur và khi bấm gửi; sai → câu dưới ô, không gọi API; sửa ô → lỗi tự mất.
- **Giờ hoạt động trung tâm (D-04):** mọi cặp giờ đều hợp lệ:
  - Giờ đóng **sau** giờ mở → bình thường.
  - Giờ đóng **trước** giờ mở → hợp lệ, hiện chú thích (không phải lỗi) "Hoạt động qua đêm, đóng cửa lúc 06:00 hôm sau".
  - Giờ đóng **bằng** giờ mở → hợp lệ, chú thích "Hoạt động 24 giờ".
  - Chỉ báo lỗi khi **nhập một trong hai ô** (thiếu ô còn lại) → câu nhắc dưới ô thiếu.
  - Lưu như cũ `HH:mm - HH:mm` (PV chỉ lưu chuỗi, không kiểm thứ tự). Bỏ điều kiện `closesAt <= opensAt` hiện có trong
    `CenterForm.submit`. Hiển thị ở chi tiết / danh sách kèm nhãn "qua đêm" / "24 giờ" khi đúng.
- Áp dụng cho mọi form ngày giờ admin khác.

**Kiểm kê mutation cần đưa vào khung mới**

| Màn              | Mutation                                                                         | Hiện trạng lỗi                                             |
| ---------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Trung tâm        | tạo / sửa                                                                        | 1 dòng chung, `required` HTML, chặn giờ qua đêm            |
| Trung tâm        | đổi trạng thái, lưu trữ, ghép quản lý                                            | 1 dòng chung (có map 4118/4120/4500–4503)                  |
| Tài khoản        | tạo, **gửi OTP, đặt mật khẩu** (mới)                                             | banner đầu modal dùng chung                                |
| Chi tiết TK      | sửa hồ sơ, khóa/mở, vô hiệu hóa, gán/gỡ vai trò, **đổi mật khẩu bằng OTP** (mới) | banner đầu trang; **khóa không gửi lý do** (BE đòi — 1118) |
| Phân quyền       | tạo vai trò, lưu quyền                                                           | banner đầu trang                                           |
| Duyệt caregiver  | duyệt/từ chối hồ sơ + chứng chỉ                                                  | một ô lý do chung, lỗi chung                               |
| Dịch vụ          | tạo/sửa/xóa                                                                      | đã đúng chuẩn — chuyển sang helper chung                   |
| Lịch đặt         | hủy                                                                              | `BookingReasonDialog` ổn — chỉ đổi sang `FormAlert`        |
| Sự cố, Khiếu nại | requeue / đánh dấu xử lý / quyết định                                            | rà khi làm                                                 |

---

### U-11 — Up avatar / ảnh phải hiển thị ngay ở mọi nơi dùng ảnh đó · 🟢

**Yêu cầu:** upload xong, ảnh mới hiện ngay (không F5) ở chính màn đó, header, **danh sách quản lý**, thẻ cho khách và mọi chỗ
hiển thị đối tượng đó.

**Phạm vi (theo D-05):** ảnh có upload trong hệ thống hiện tại — **avatar người chăm sóc** (`CAREGIVER_PROFILE`), **ảnh trung
tâm** (`CARE_CENTER`), ảnh chứng chỉ. Tài khoản khách / quản lý / admin và hồ sơ người bệnh **không có upload** (§0.2).

**Kiểm kê**

| Đối tượng             | Nơi upload                                                               | Nơi hiển thị                                                                                                                             | Cập nhật ngay?                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Avatar người chăm sóc | `/caregiver/profile` (`caregiver-provider-pages.tsx:62` `replaceAvatar`) | Hồ sơ, topbar caregiver, chi tiết caregiver (quản lý), đăng ký ca, thẻ khách (catalog / tìm kiếm / công khai), thẻ caregiver ở trang cọc | **Một phần** — chỉ làm mới `media` + `catalog`; không làm mới `publicCaregiver`, `service-caregivers`, `caregiver(id)`, `caregivers(centerId)`, `pending-caregivers` |
| Ảnh trung tâm         | Admin `ProviderMediaPanel`                                               | Chi tiết trung tâm, thẻ trung tâm cho khách                                                                                              | **Không** — chỉ làm mới `media` + `catalog` (catalog là caregiver)                                                                                                   |
| Ảnh chứng chỉ         | Caregiver                                                                | Danh sách / duyệt chứng chỉ                                                                                                              | Có                                                                                                                                                                   |

**Nguyên nhân gốc**

1. PV trả ảnh theo `displayOrder` tăng dần, thẻ công khai lấy ảnh **đầu tiên** (cũ nhất). `replaceAvatar` "upload mới rồi xóa
   cũ": giữa hai bước, hoặc khi xóa lỗi, mọi nơi vẫn hiện **ảnh cũ** và còn 2 ảnh.
2. Làm mới cache thiếu, mỗi màn tự gọi vài key.
3. Không xem trước tức thì.
4. Danh sách quản lý không có avatar (`CaregiverResponse` không có `avatarUrl`).
5. Hai quy tắc chọn ảnh khác nhau (`[0]` vs `find(IMAGE)`).
6. Presigned URL hết hạn → `<img>` trống, không tải lại.

**Đề xuất (chỉ FE)**

- [ ] **Bất biến "một ảnh đại diện"**: luồng thay avatar = upload ảnh mới → xóa **mọi** ảnh cũ của `CAREGIVER_PROFILE` (thử lại
      tối đa 2 lần nếu lỗi). Khi chỉ còn 1 ảnh thì ảnh BE chọn cho thẻ công khai (ảnh đầu) cũng là ảnh mới — không cần sửa BE.
      Xóa vẫn lỗi → báo "Chưa gỡ được ảnh cũ, thử lại" (lỗi hệ thống, có nút thử lại).
- [ ] `entities/provider/provider-avatar.ts`: một hàm `pickAvatar(media)` = ảnh `IMAGE` có `displayOrder` **lớn nhất** (mới
      nhất) — dùng ở mọi nơi FE thay `[0]` / `find`, để ngay cả khi tạm còn 2 ảnh, FE vẫn hiện ảnh mới.
- [ ] `entities/provider/invalidate-provider-media.ts`: `invalidateOwnerMedia(queryClient, ownerType, ownerId, { centerId? })`:
  - `CAREGIVER_PROFILE` → `media`, `caregiver(id)`, `caregivers(centerId)`, `myProfile`, `publicCaregiver(id)`, tiền tố
    `['provider','service-caregivers']`, `catalog`, tiền tố `['provider','pending-caregivers']`.
  - `CARE_CENTER` → `media`, `center(id)`, `centers`, `publicCenters`, `publicCenter(id)`.
  - `ProviderMediaPanel`, `replaceAvatar` và mọi chỗ upload / xóa ảnh chỉ gọi helper này.
- [ ] **Xem trước tức thì**: chọn file → hiện ngay bằng `URL.createObjectURL` + trạng thái "Đang tải lên…"; thành công →
      `setQueryData` chèn ảnh mới vào cache media rồi invalidate; lỗi → trả ảnh cũ + báo lỗi (sai định dạng / quá 5 MB = dưới
      nút chọn ảnh; Media lỗi = lỗi hệ thống có "Thử lại"); `revokeObjectURL` khi xong.
- [ ] `shared/ui/avatar.tsx`: ảnh tròn + fallback chữ viết tắt; `onError` (URL hết hạn) → refetch media một lần rồi fallback.
      Thay `<img>` avatar tự viết ở hồ sơ caregiver, topbar, chi tiết quản lý, đăng ký ca, `portal-account-menu`, thẻ khách.
- [ ] Avatar trong **danh sách quản lý**: list caregiver (quản lý), tab Nhân sự (U-07), hàng chờ duyệt, trang duyệt caregiver;
      thumbnail ở danh sách trung tâm admin. Nguồn ảnh (API đang có):
  - Caregiver đã xác minh & đang hoạt động: lấy `avatarUrl` từ `GET /caregivers?centerId=` (thẻ đã có ảnh, 1 request / trang).
  - Còn lại (chờ duyệt, tạm nghỉ…): `GET /provider-media/CAREGIVER_PROFILE/{id}` từng dòng, có cache (trang ≤ 20 dòng).
- [ ] Màn khác đang mở (admin xem danh sách lúc caregiver đổi ảnh): refetch khi focus lại cửa sổ (mặc định TanStack Query) —
      không cần realtime; ghi vào `ARCHITECTURE.md`.

**AC**

- Caregiver đổi avatar → ảnh mới hiện **ngay khi chọn file**, giữ sau khi upload; mở danh sách caregiver (quản lý), tab Nhân sự
  (admin), thẻ caregiver (khách) → ảnh mới, không F5.
- Sau khi thay, hồ sơ chỉ còn 1 ảnh đại diện.
- Admin thêm ảnh trung tâm → thumbnail danh sách trung tâm và thẻ trung tâm cho khách đổi ngay.

---

## 4. Vấn đề bổ sung phát hiện khi rà soát (đều 🟢 / 🟡)

| Mã   | Mức                 | Vấn đề                                                                                                                       | Đề xuất                                                                                                                         |
| ---- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| A-01 | Trung bình          | 2 file trang trung tâm (`admin-centers-live-page.tsx` 500 dòng + `admin-centers-restored-page.tsx`) + alias; style khác nhau | Gộp: `centers-page.tsx`, `center-detail-page.tsx`, `components/*` (< 300 dòng/file)                                             |
| A-02 | **Cao**             | Tài khoản: tìm, lọc vai trò/trạng thái và 4 KPI chỉ tính **trên trang hiện tại** (20 dòng)                                   | 🟡 khai báo tham số `role,status,centerId,keyword,sort` của `GET /users` và `GET /users/statistics` (BE đã có); lọc phía server |
| A-03 | Thấp                | Khối "Quy chuẩn an toàn tài khoản đối tác" chỉ là chữ trang trí                                                              | Bỏ                                                                                                                              |
| A-04 | Thấp                | Trang trung tâm có cả tab lẫn dropdown trạng thái; tiêu đề bảng luôn "Tất cả"                                                | Giữ tab, bỏ dropdown                                                                                                            |
| A-05 | Trung bình          | Chi tiết TK thiếu trung tâm, ngày tạo, lý do khóa; vai trò dạng mã; "Xóa" thực chất là vô hiệu hóa                           | 🟡 khai báo `statusReason` + body `{status, reason}`; đổi "Xóa" → "Vô hiệu hóa"; khóa có dialog lý do                           |
| A-06 | **Cao**             | Admin gán được Người chăm sóc (không có hồ sơ PV) / Quản lý (không có trung tâm → 1100) qua dropdown chung                   | Lọc dropdown; quản lý chỉ qua trang trung tâm (U-03)                                                                            |
| A-07 | Trung bình          | Duyệt caregiver: một ô lý do chung; duyệt không xác nhận                                                                     | Lý do trong dialog Từ chối riêng từng đối tượng                                                                                 |
| A-08 | Trung bình          | Luật SĐT lệch: trung tâm 10–15 số, tài khoản 10–11; form trung tâm không kiểm SĐT                                            | Hai luật riêng, kiểm phía client                                                                                                |
| A-09 | Trung bình          | 3–4 kiểu input/button/modal; modal "Tạo tài khoản" tự làm (không bẫy focus, không Escape)                                    | Dùng `shared/ui`                                                                                                                |
| A-10 | Thấp                | Thuật ngữ lẫn lộn: Điều dưỡng / Caregiver / Người chăm sóc; role / vai trò; Booking / Lịch đặt                               | Bảng thuật ngữ thống nhất                                                                                                       |
| A-12 | **Cao** (nghiệp vụ) | Thay quản lý ở PV không gỡ quyền quản lý cũ ở ID                                                                             | Dialog "Đổi người quản lý" đề nghị khóa tài khoản cũ (U-03)                                                                     |
| A-13 | Thấp                | Đổi trạng thái / lưu trung tâm không có phản hồi; nút Lưu trữ đỏ luôn hiện                                                   | Toast; Lưu trữ vào menu ⋯                                                                                                       |
| A-14 | Thấp                | `adminLayout.manager: 'Minh Hoàng'` là tên fallback ở topbar                                                                 | Fallback "Quản trị viên"                                                                                                        |
| A-15 | Trung bình          | Tổng quan còn 2 khối biểu đồ **mẫu** dưới số thật                                                                            | Ẩn khối mẫu (giống D26)                                                                                                         |
| A-16 | Thấp                | Sự cố hiện `eventType`, `lastError` nguyên văn                                                                               | Nhãn i18n; lỗi kỹ thuật thu gọn                                                                                                 |
| A-17 | Thấp                | Xuất CSV trung tâm chỉ xuất trang hiện tại, không ghi rõ                                                                     | Ghi "Xuất trang hiện tại" hoặc tải hết các trang                                                                                |
| A-18 | Trung bình          | Vai trò tùy chỉnh không mở được cổng nào                                                                                     | Giải thích trên UI (U-09)                                                                                                       |

_(A-11 của bản v1 — mở rộng màn Lịch đặt — đã bỏ theo D-02.)_

---

## 5. Kế hoạch triển khai (chỉ FE)

Mỗi đợt kết thúc bằng `pnpm check` + kiểm tay trên trình duyệt (vi/en). Đợt có 🟡: cập nhật `openapi/openapi.yaml`, chạy
`pnpm api:validate && pnpm api:generate`, commit snapshot + code sinh cùng lúc. Cập nhật `ARCHITECTURE.md` (đoạn Admin) khi đổi
route / luồng.

| Đợt                              | Nội dung                                                                                                                                                                                                                                             | Mã                                                         | Cỡ  |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --- |
| **A — Dọn nhanh**                | Bỏ GPKD & copy mẫu; bỏ UUID / mã kỹ thuật; rút nhãn menu / tiêu đề; bỏ khối trang trí; fallback tên topbar; ẩn biểu đồ mẫu; thuật ngữ                                                                                                                | U-01, U-02, U-04, A-03, A-10, A-14, A-15, A-16             | S–M |
| **B — Khung lỗi**                | `api-error.ts`, `form-alert.tsx`, `use-form-errors.ts`; bảng mã; validation client đủ ô; ngày giờ chỉ nhắc + giờ qua đêm; toast                                                                                                                      | U-10, A-07, A-08, A-09                                     | M   |
| **C — Dịch vụ**                  | 6 danh mục cố định, bỏ "Thêm danh mục", ánh xạ danh mục cũ, bộ lọc                                                                                                                                                                                   | U-06                                                       | S   |
| **D — Tài khoản & mật khẩu**     | 🟡 snapshot `/users` lọc + `/users/statistics` + `reason`; lọc phía server, KPI thật; khối Mật khẩu (OTP); chi tiết TK đủ thông tin, khóa có lý do, lọc dropdown vai trò; chuyển wrapper mật khẩu lên `entities/identity`; `/forgot-password?email=` | U-03 (phần mật khẩu), A-02, A-05, A-06                     | M   |
| **E — Ảnh cập nhật ngay**        | Một ảnh đại diện, `pickAvatar`, `invalidateOwnerMedia`, xem trước, `Avatar`, avatar trong danh sách                                                                                                                                                  | U-11                                                       | M   |
| **F — Trung tâm**                | Trang `/admin/centers/:id` + tab; khối Người quản lý; panel Thẩm định; nút trạng thái; gộp file; tab thay dropdown                                                                                                                                   | U-03 (phần ghép), U-07, U-08, A-01, A-04, A-12, A-13, A-17 | L   |
| **G — Tên thay ID & Phân quyền** | `useCenterName` / `useCaregiverName` cho Lịch đặt & các màn khác; mô tả vai trò / quyền, ma trận                                                                                                                                                     | U-05, U-09, A-18                                           | S–M |

Thứ tự: **A → B → C → D → E → F → G**. B trước để mọi form mới dùng khung lỗi; D và E trước F vì trang trung tâm dùng khối Mật
khẩu, lọc `/users` và `Avatar`.

### File chính dự kiến chạm (chỉ `FE-careconnect/`)

```
openapi/openapi.yaml                                  (🟡 tham số lọc GET /users, GET /users/statistics, reason khi khóa)
app/shared/api/api-error.ts                           (mới — U-10)
app/shared/ui/form-alert.tsx, avatar.tsx              (mới — U-10, U-11)
app/shared/lib/use-form-errors.ts                     (mới — U-10)
app/shared/i18n/admin/*.ts                            (U-01, U-04, U-06, U-09, nhãn lỗi, mật khẩu)
app/entities/identity/password-reset-api.ts           (chuyển từ features/shared/auth/password-recovery-api.ts — U-03)
app/entities/identity/password-reset-panel.tsx        (mới — khối Mật khẩu, U-03)
app/entities/provider/                                (useCenterName, useCaregiverName, provider-avatar.ts,
                                                       invalidate-provider-media.ts, provider-media-panel.tsx)
app/features/admin/layout/admin-navigation.constants.ts
app/features/admin/centers/**                         (gộp, trang chi tiết, người quản lý, thẩm định, nhân sự)
app/routes.ts, app/routes/admin/center-detail.tsx     (mới)
app/features/admin/identity/**                        (accounts, account-detail, roles)
app/features/admin/services/**                        (category-select, service-category.constants, catalog-table, bộ lọc)
app/features/admin/bookings/**                        (chỉ thay ID bằng tên)
app/features/admin/caregiver-queue/**, incidents/**
app/features/shared/auth/password-recovery-page.tsx   (đọc ?email=)
app/features/caregiver/provider/caregiver-provider-pages.tsx, caregiver/layout/components/caregiver-topbar.tsx
app/features/center-manager/caregivers/**, center-manager/work-shifts/manager-work-shifts-page.tsx
app/features/customer/services/**                     (bộ lọc danh mục theo 6 nhóm)
app/features/shared/auth/portal-account-menu.tsx
ARCHITECTURE.md, AGENTS.md
```

Không có file nào trong `BE/` bị sửa.

---

## 6. Kiểm thử & tiêu chí hoàn thành

- **Unit:** `classifyApiError` (từng tầng, mã lạ, lỗi mạng); map mã → ô của từng form; luật giờ hoạt động (thường / qua đêm /
  24 giờ / thiếu một ô); `pickAvatar`; ánh xạ danh mục cũ → 6 nhóm; luật mật khẩu.
- **Component (Vitest + Testing Library + MSW sinh từ Orval):**
  - Form trung tâm: gửi rỗng → lỗi dưới từng ô, focus ô đầu; 4101 → dưới email; 4114 → khối nghiệp vụ "Tải lại"; 503 → khối
    hệ thống "Thử lại"; dữ liệu còn nguyên. Giờ 22:00–06:00 → lưu được, có chú thích "qua đêm".
  - Tạo tài khoản: bật "Gửi mã ngay" → gọi `POST /users` rồi `POST /auth/forgot-password`; nhập OTP + mật khẩu → gọi
    `POST /auth/reset-password`; OTP sai (1063) → lỗi dưới ô OTP; mật khẩu yếu → lỗi dưới ô mật khẩu, không gọi API.
  - Ghép quản lý: tạo trong trang trung tâm → `POST /users` rồi `PUT /care-centers/{id}`; bước ghép lỗi → "Thử ghép lại" không
    gọi lại `POST /users`.
  - Thẩm định: thiếu quản lý → bấm Duyệt cuộn tới mục quản lý, không gọi API.
  - Nhân sự: tài khoản LOCKED + hồ sơ ACTIVE → "Tài khoản bị khóa"; hồ sơ INACTIVE → "Tạm nghỉ".
  - Dịch vụ: select có đúng 6 lựa chọn; dịch vụ có danh mục cũ hiện đúng nhóm.
  - Avatar: chọn file → object URL hiện ngay; upload thành công → xóa ảnh cũ + invalidate các query liên quan; `<img>` lỗi →
    refetch một lần rồi fallback.
  - Không có chuỗi UUID (regex) trong DOM các màn admin.
- **Thủ công:** đi hết menu admin, console sạch; luồng "tạo trung tâm → tạo quản lý → gửi OTP → đặt mật khẩu → duyệt" không rời
  trang chi tiết trung tâm; đăng nhập được bằng tài khoản vừa đặt mật khẩu.
- **Hoàn thành khi:** `pnpm check` xanh; không còn UUID / mã kỹ thuật trên màn admin; mọi form ghi có đủ 3 tầng lỗi; không
  file BE nào thay đổi; `ARCHITECTURE.md` cập nhật đoạn Admin.

---

## 7. Kết quả thực hiện (2026-10-30)

Tất cả đợt A → G đã làm, chỉ trong `FE-careconnect/` (không file `BE/` nào thay đổi). Snapshot OpenAPI chỉ khai báo thêm
tham số đã có ở BE: lọc `GET /users`, `GET /users/statistics`, `reason` khi khóa, `statusReason`.

| Đợt | Kết quả                                                                                                                                                                                                                                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Menu / tiêu đề rút gọn; bỏ GPKD và copy mẫu; bỏ UUID ở dịch vụ, hàng chờ duyệt, lịch đặt, sự cố; sự cố có nhãn loại sự kiện + tên trung tâm, lỗi kỹ thuật thu gọn; Tổng quan bỏ biểu đồ mẫu; fallback tên topbar                                                                                                       |
| B   | `shared/api/api-error.ts`, `shared/lib/use-form-errors.ts`, `shared/ui/form-alert.tsx`; mọi form mới dùng 3 tầng lỗi                                                                                                                                                                                                   |
| C   | 6 danh mục dịch vụ cố định, bỏ "Thêm danh mục mới", danh mục cũ tự quy về nhóm; bộ lọc khách hàng cũng theo 6 nhóm                                                                                                                                                                                                     |
| D   | Tài khoản: tìm/lọc/phân trang phía server, số liệu toàn hệ thống, cột trung tâm; tạo tài khoản → gửi OTP → đặt mật khẩu ngay trong hộp thoại; chi tiết có trung tâm, lý do khóa, khóa bắt buộc lý do, đổi mật khẩu bằng OTP, không gán Quản lý / Người chăm sóc qua dropdown; Phân quyền mô tả vai trò + ma trận quyền |
| E   | Một ảnh đại diện cho người chăm sóc, xem trước ngay khi chọn file, làm mới mọi cache liên quan, `shared/ui/avatar.tsx`, avatar trong danh sách quản lý                                                                                                                                                                 |
| F   | Trang `/admin/centers/:id` (Tổng quan / Nhân sự / Hoạt động / Hình ảnh), thẩm định bằng checklist, ghép / tạo / đổi người quản lý tại chỗ (kèm khóa tài khoản cũ), trạng thái làm việc theo tài khoản + hồ sơ, giờ qua đêm / 24 giờ hợp lệ; lý do từ chối hồ sơ / chứng chỉ hỏi riêng từng lần                         |
| G   | Lịch đặt hiện tên trung tâm và tên người chăm sóc                                                                                                                                                                                                                                                                      |

Lệch so với plan: `pickAvatar` chọn ảnh **mới nhất** như plan, đồng thời luồng đổi ảnh gỡ hết ảnh cũ để thẻ công khai của
ProviderService (chọn ảnh đầu) cũng thấy ảnh mới; xem trước dùng object URL.

Kiểm chứng: `pnpm lint`, `pnpm typecheck`, `prettier --check` sạch; `vitest` 78 file / 314 test pass; `pnpm build` ok;
chạy trình duyệt thật với tài khoản admin dev ở 1440px và 390px cho Tổng quan, Tài khoản, Chi tiết tài khoản, Trung tâm,
Chi tiết trung tâm (thẩm định, nhân sự, hoạt động), Dịch vụ, Phân quyền, Lịch đặt, Sự cố — không còn UUID trong nội dung.

Còn lại / ngoài phạm vi: các mục §0.2 cần BE; dữ liệu mẫu có 3 trung tâm trỏ tới tài khoản quản lý không tồn tại (hiện
"Không xác định"); MediaService dev đôi lúc trả 504 khi tải ảnh trung tâm (giao diện rơi về biểu tượng); trang Dịch vụ vẫn
còn các khối mẫu "Phụ phí & quy chuẩn ca trực" / "Phân bổ hình thức đặt ca" chưa nằm trong plan.

---

# Phần 2 — Plan nhỏ: các vấn đề lặt vặt trang Admin (2026-10-31)

> Trạng thái: **đã chốt quyết định D-07 → D-10, chờ thực hiện** — chưa sửa code. Vẫn theo D-05 (không sửa BE, không thêm API); mục nào cần BE ghi rõ ở cột
> Phạm vi. Nguồn khảo sát thêm: `BookingService` (`BookingServiceImpl.markDepositPaid`, `util/BookingSpecifications`,
> `OccurrenceGeneratorImpl`), `PaymentService` (`PaymentOutboxServiceImpl`, `PaymentServiceImpl`), `CareCatalogService`
> (`PricePlan`, `PricingUnit`), `MediaService` (`MediaPurpose`), `IdentityService` (`UserResponse`), lịch sử git của
> `scripts/payment-demo.mjs`, `features/admin/services/components/pricing-guidelines.tsx`.

### Quyết định đã chốt (2026-10-31)

| #    | Câu hỏi                       | Quyết định                                                                                                                                        |
| ---- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-07 | Q-10 — ảnh tài khoản          | **Không sửa BE.** Giải thích rõ vì sao trung tâm / người chăm sóc có ảnh mà tài khoản thì không (V-05); FE chỉ làm phần dùng được với API hiện có |
| D-08 | Q-11 — khối mẫu trang Dịch vụ | **Xóa** toàn bộ khối số liệu mẫu (phụ phí, phân bổ đặt ca, tiêu chuẩn giám sát, chính sách giá) và **làm lại phần hiển thị theo gói giá** (V-02)  |
| D-09 | Q-12 — phạm vi toast          | **Làm cho admin trước**; ổn thì áp dụng cho các vai trò khác ở đợt sau                                                                            |
| D-10 | Q-13 — mã giao dịch           | **Không hiển thị mã giao dịch cho bất kỳ ai** (kể cả admin), nhất là khi đang có dữ liệu demo; thay bằng câu dễ hiểu                              |

## 8. Tóm tắt

| #    | Vấn đề                                                                    | Kết luận khảo sát                                                                                                                                                                                                                                                                                                        | Hướng xử lý                                                                                                                                                                      | Phạm vi                |
| ---- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| V-01 | Thiếu toast báo kết quả thao tác ở admin                                  | Dự án **chưa cài `sonner`**; `shared/ui/toast.tsx` chỉ có `ToastBanner` (không dùng ở đâu); mỗi trang tự hiện dòng "Đã lưu" hoặc không báo gì                                                                                                                                                                            | Cài `sonner`, dựng `Toaster` theo token màu dự án ở **góc dưới bên phải**; toast thành công cho mọi thao tác ghi và toast lỗi hệ thống; câu chữ đúng nav item + hành động        | 🟢 FE (+ 1 dependency) |
| V-02 | Tab "Phụ phí & quy chuẩn ca trực" và các khối giá ở trang Dịch vụ         | **BE không có nghiệp vụ phụ phí** (không entity, field hay API ở Catalog / Booking / Payment). Giá chỉ là `PricePlan` (`HOUR` / `DAY` / `SHIFT` + `basePrice`). BE còn **không cho đặt ca qua đêm** (`OVERNIGHT_NOT_SUPPORTED` 5207)                                                                                     | (D-08) **Xóa** các khối mẫu; tab đổi thành **"Gói giá"** hiển thị gói giá thật của các trung tâm, ghi rõ "chưa hỗ trợ phụ phí"                                                   | 🟢 FE                  |
| V-03 | Lịch đặt admin chỉ là danh sách, không lọc trung tâm, không xem dạng lịch | BE `GET /bookings` (ADMIN) đã lọc `centerId`, `from`/`to` (khoảng ngày **giao** với kỳ lọc), `status`, `keyword`, `caregiverId`; snapshot FE đã khai báo sẵn                                                                                                                                                             | Thêm lọc trung tâm + khoảng ngày; 2 chế độ **Danh sách / Lịch tháng**; xem chi tiết từ lịch; tab "Lịch đặt" trong chi tiết trung tâm                                             | 🟢 FE                  |
| V-04 | `paymentReference=DEMOF0CA712D10EB4DEB` hiện trong lịch sử lịch đặt       | Là **mã giao dịch thanh toán cọc** PaymentService gửi khi xác nhận cọc; Booking ghi vào `reason` của lịch sử dạng `paymentReference=<mã>`. Tiền tố `DEMO` là **dữ liệu thử** do stub `scripts/payment-demo.mjs` (đã gỡ ở Đợt 1c) sinh ra: `DEMO` + 16 ký tự đầu của id payment. Giao dịch thật là `vnp_TxnRef` của VNPay | (D-10) **Ẩn mã với mọi người**; dòng lịch sử đó chỉ ghi "Đã nhận tiền cọc qua cổng thanh toán." Dữ liệu ở BE giữ nguyên để đối soát                                              | 🟢 FE                  |
| V-05 | Ảnh tài khoản ở nav Tài khoản                                             | Identity **không có trường ảnh** cho user; trang hồ sơ khách **không có chức năng đổi ảnh**; admin **không thể** thêm ảnh cho user; MediaService chỉ cho token SERVICE gọi                                                                                                                                               | (D-07) Không sửa BE. Không có quyền nào "cấm khách" — **không có nơi lưu ảnh tài khoản** (V-05). FE: tài khoản người chăm sóc hiện ảnh hồ sơ PV; tài khoản khác giữ chữ viết tắt | 🟢 FE                  |

## 9. Chi tiết

### V-01 — Toast thông báo kết quả (sonner)

**Hiện trạng**

- Không có hệ thống toast. Phản hồi thành công rời rạc: chi tiết tài khoản có dòng "Đã lưu thay đổi", trang trung tâm có
  khối xanh, trang Dịch vụ / Lịch đặt / Sự cố / Phân quyền chỉ đóng hộp thoại, không báo gì.
- Lỗi hệ thống hiện ở cuối form (`FormAlert`, U-10) — đúng chỗ nhưng dễ bị bỏ qua khi form dài, và thao tác không có form
  (nút Gửi lại ở Sự cố, nút Gỡ vai trò…) gần như không có chỗ báo.

**Quyết định thiết kế**

- **Thư viện:** `sonner` (nhẹ, hỗ trợ React 19, không cần provider riêng). Thêm bằng `pnpm add sonner`; không có install
  script nên không phải sửa `allowBuilds`.
- **Vị trí: dưới góc phải** (desktop). Góc trên phải là topbar có chuông thông báo và menu tài khoản, toast sẽ che chúng;
  các nút chính của mỗi trang (Thêm…, Tạo…) cũng ở góc trên phải. Dưới góc phải không che nội dung đang làm và là vị trí
  quen thuộc của trang quản trị. Màn < 640px: sonner tự trải ngang đáy màn hình.
- **Màu đồng nhất token `app.css`** — `toastOptions.unstyled` + `classNames`, không dùng màu mặc định của sonner:

  | Loại               | Nền / chữ / viền                                                        | Icon           |
  | ------------------ | ----------------------------------------------------------------------- | -------------- |
  | Thành công         | `bg-success-container text-on-success-container border-outline-variant` | `check_circle` |
  | Lỗi hệ thống       | `bg-error-container text-on-error-container border-error/30`            | `error`        |
  | Cảnh báo (khi cần) | `bg-warning-container text-on-warning-container border-warning/30`      | `warning`      |

  Bo `rounded-xl`, bóng có offset (`shadow-md`), chữ `text-sm`, font Plus Jakarta Sans, nút đóng có `aria-label` i18n.
  Thành công tự ẩn sau 4 giây; lỗi hệ thống 8 giây và có nút **Thử lại** khi thao tác lặp lại được.

- **Chia việc giữa toast và form** (giữ U-10):
  - Lỗi validation → **chỉ** dưới ô, không toast.
  - Lỗi nghiệp vụ (409, trạng thái, quyền…) → **chỉ** ở cuối form vì người dùng cần sửa tại đó.
  - Lỗi hệ thống (5xx, 503, mất mạng, timeout) → **toast lỗi**, giữ nguyên dữ liệu form; bỏ `FormAlert` hệ thống trùng lặp.
  - Thành công → **toast thành công**, bỏ các dòng "Đã lưu…" rải rác.
- **Câu chữ đúng nav item + hành động.** FE **không** hiển thị `message` của BE (quy tắc `FE-careconnect/AGENTS.md`); mỗi
  hành động có key i18n riêng `admin.toast.<navItem>.<action>` (vi + en), kèm tên đối tượng khi biết. Helper
  `shared/ui/app-toast.ts`: `toastSuccess(message)`, `toastSystemError(error, { message, retry })` — dùng `classifyApiError`,
  chỉ toast khi `kind === 'system'`.

**Bảng câu thông báo theo nav item** (đề xuất)

| Nav item       | Hành động có toast thành công                                                                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dịch vụ        | Tạo ("Đã tạo dịch vụ “{{name}}”.") · Sửa ("Đã cập nhật dịch vụ “{{name}}”.") · Xóa ("Đã xóa dịch vụ “{{name}}”.")                                                                                                        |
| Trung tâm      | Tạo · Sửa thông tin · Duyệt ("Đã duyệt và kích hoạt {{name}}.") · Từ chối · Tạm khóa · Ngừng hoạt động · Mở lại · Lưu trữ · Tạo tài khoản quản lý · Ghép / đổi người quản lý · Khóa tài khoản quản lý cũ · Tải / xóa ảnh |
| Lịch đặt       | Hủy thay nền tảng ("Đã hủy lịch #{{code}} và hoàn 100% cho khách.")                                                                                                                                                      |
| Người chăm sóc | Duyệt / từ chối hồ sơ · Duyệt / từ chối chứng chỉ                                                                                                                                                                        |
| Khiếu nại      | Ra quyết định cấp cao                                                                                                                                                                                                    |
| Tài khoản      | Tạo tài khoản · Lưu hồ sơ · Khóa / mở khóa · Vô hiệu hóa · Gán / gỡ vai trò · Gửi mã OTP · Đặt mật khẩu                                                                                                                  |
| Phân quyền     | Tạo vai trò · Lưu quyền                                                                                                                                                                                                  |
| Sự cố          | Gửi lại · Đánh dấu đã xử lý tay                                                                                                                                                                                          |

Toast lỗi hệ thống dùng một mẫu câu theo nav item: "Chưa {{action}} được vì hệ thống đang gặp sự cố. Dữ liệu bạn nhập vẫn
được giữ, hãy thử lại." (`{{action}}` lấy từ cùng bảng: "tạo dịch vụ", "duyệt trung tâm"…).

**Việc cần làm**

- [ ] `pnpm add sonner`; `shared/ui/toaster.tsx` (Toaster đã style theo token) gắn vào `features/admin/layout/admin-layout.tsx`.
- [ ] `shared/ui/app-toast.ts` + i18n `shared/i18n/admin/toast-resources.ts` (vi/en cùng cấu trúc).
- [ ] Gắn vào `onSuccess` / `onError` của các mutation trong bảng; bỏ dòng "Đã lưu…" và `FormAlert` hệ thống trùng.
- [ ] Xóa `ToastBanner` không còn dùng.

**AC:** tạo dịch vụ → toast xanh "Đã tạo dịch vụ “…”." ở góc dưới phải; BE Catalog lỗi 503 khi lưu → toast đỏ có nút
Thử lại, form giữ nguyên dữ liệu; lỗi nhập liệu không sinh toast.

---

### V-02 — Phụ phí ở trang Dịch vụ

**Khảo sát BE**

- Tìm `surcharge` / phụ phí / ca đêm / ngày lễ trong toàn bộ BE: **không có** entity, cột, DTO, API hay quy tắc tính giá.
- Giá = `PricePlan` của CareCatalog: `pricingUnit` ∈ {`HOUR`, `DAY`, `SHIFT`}, `durationMinutes`, `basePrice`, `isActive`.
  Booking lấy giá từ báo giá Catalog và **chụp** vào `BookingItem` (`unitPrice`, `totalPrice`), không cộng phụ phí.
- `OccurrenceGeneratorImpl` từ chối giờ kết thúc ≤ giờ bắt đầu (`OVERNIGHT_NOT_SUPPORTED` 5207) → hệ thống **không đặt được
  buổi qua đêm**, nên "Ca đêm 22:00–06:00 +30%" mâu thuẫn trực tiếp với nghiệp vụ.

**Hiện trạng FE (viết cứng)** — `features/admin/services/components/pricing-guidelines.tsx`:

- Tab "Phụ phí & quy chuẩn ca trực": 3 thẻ +30% / +100% / +20%.
- Khối "Phân bổ hình thức đặt ca" (số 6.300, "Ca 4 giờ 45% · Ca 8 giờ 30% · Lưu trú 25%"), "Quy chuẩn phụ phí ca đặc biệt",
  "Tiêu chuẩn giám sát y khoa", "Chính sách quản lý giá dịch vụ" — đều là chữ / số mẫu.

**Đề xuất (D-08: xóa khối mẫu, làm lại theo gói giá)**

- [ ] Xóa `SurchargePreview`, `PricingGuidelines` và các key i18n `surcharge*`, `allocation*`, `policy*`, chuỗi tiêu chuẩn giám
      sát trong `services-resources.ts`.
- [ ] Tab thứ ba đổi tên **"Gói giá"** (`?tab=plans`), dữ liệu thật, chỉ đọc (admin không sửa giá — quy tắc Catalog):
  - Bộ lọc: Trung tâm (tất cả trung tâm đang hoạt động / một trung tâm), Dịch vụ chuẩn, Đơn vị tính (Theo giờ / Theo ngày /
    Theo ca), Trạng thái gói (đang áp dụng / tạm dừng).
  - Bảng: Dịch vụ · Trung tâm · Tên gói · Đơn vị tính · Thời lượng (gói theo ca) · Giá · Trạng thái; sắp theo dịch vụ rồi
    giá tăng dần.
  - Tóm tắt phía trên (không dùng ô số to): mỗi dịch vụ chuẩn — số trung tâm cung cấp, giá thấp nhất – cao nhất theo từng
    đơn vị tính, để admin so giá giữa các trung tâm mà không phải mở từng nơi.
  - Nguồn: `GET /center-services` theo từng trung tâm + `GET /price-plans/center-offering/{id}` (đang dùng ở tab "Bảng giá
    theo trung tâm"); tab cũ đó gộp vào tab này (B-04).
  - Ghi chú cố định một dòng: "Nền tảng chưa hỗ trợ phụ phí (ca đêm, ngày lễ…). Giá khách trả là giá gói của trung tâm;
    mỗi buổi phải kết thúc trong cùng ngày."
- [ ] Trạng thái rỗng / lỗi / đang tải đầy đủ; số tiền định dạng `Intl` VND.

---

### V-03 — Lịch đặt: xem tất cả & theo trung tâm, dạng lịch

**API (đã có, ADMIN được gọi)**

- `GET /bookings?centerId=&status=&from=&to=&keyword=&caregiverId=&sort=&page=&size=` — `from`/`to` lọc lịch đặt có khoảng
  `[startDate, endDate]` **giao** với kỳ chọn (`BookingSpecifications`) → đúng nhu cầu xem theo tháng.
- `GET /bookings/{id}` và `GET /bookings/{id}/occurrences` cho chi tiết từng buổi.
- Không có API cho admin liệt kê **buổi** theo trung tâm (`GET /booking-occurrences` chỉ cho CAREGIVER) → lịch tháng dựng từ
  quy tắc lặp của lịch đặt (`scheduleType` ONE_TIME / DAILY / WEEKLY, `startDate`, `endDate`, `daysOfWeek`, `startTime`,
  `endTime` — đều có trong `BookingSummaryRecord`).

**Đề xuất**

- [ ] Thanh lọc: **Trung tâm** (Tất cả / chọn một — danh sách từ `fetchCenters`), Trạng thái, Từ ngày – Đến ngày, ô tìm mã;
      tất cả nằm trong URL search params.
- [ ] Chuyển chế độ **Danh sách | Lịch tháng** (`?view=calendar&month=2026-11`):
  - Danh sách: như hiện tại, thêm khoảng ngày, giờ, số buổi.
  - Lịch tháng: lưới 7 cột; mỗi ngày liệt kê các buổi dự kiến (giờ + mã lịch + người bệnh), màu theo trạng thái lịch đặt;
    lịch đã hủy / hết hạn mờ đi; ghi chú "Buổi dựng theo lịch lặp; trạng thái từng buổi xem trong chi tiết". Bấm một buổi →
    `/admin/bookings/:id`, nút quay lại về đúng tháng đang xem.
  - Dữ liệu: `from` = đầu tháng, `to` = cuối tháng, `size=100`, đọc tiếp các trang; quá ngưỡng thì nhắc "Hãy lọc theo
    trung tâm".
- [ ] Trang chi tiết trung tâm thêm tab **"Lịch đặt"** dùng lại cùng component với `centerId` cố định.
- [ ] "Đến ngày" trước "Từ ngày" → nhắc dưới ô, không chặn chọn (U-10).

---

### V-04 — `paymentReference=DEMO…` là gì

**Nguồn gốc (đã truy vết)**

1. Khi tiền cọc được xác nhận, PaymentService gọi Booking `POST /bookings/{id}/deposit-paid` kèm `paymentReference` = mã tham
   chiếu của lần thanh toán (`PaymentAttempt.reference`; với VNPay là `vnp_TxnRef`).
2. Booking ghi mã đó vào **lý do** của sự kiện `AWAITING_DEPOSIT → CONFIRMED` dạng `paymentReference=<mã>`
   (`BookingServiceImpl.PAYMENT_REFERENCE_PREFIX`).
3. FE `entities/booking/booking-history-list.tsx` in nguyên `reason` → người dùng thấy chuỗi kỹ thuật.
4. Mã tiền tố **`DEMO`** do stub thanh toán thử `scripts/payment-demo.mjs` sinh (`DEMO` + 16 ký tự đầu của id payment) trước
   khi nối PaymentService thật (Đợt 1c, 2026-10-30) → **dữ liệu thử**, không có giao dịch tiền thật.

**Ý nghĩa:** khóa để đối soát với cổng thanh toán (tra giao dịch trên VNPay merchant, xử lý khiếu nại "đã trả mà chưa
xác nhận"). Dữ liệu ở BE **giữ nguyên**; chỉ không đưa lên giao diện (D-10).

**Đề xuất (D-10: không hiển thị mã cho ai)**

- [ ] `entities/booking/booking-history-reason.ts`: `reason` bắt đầu bằng `paymentReference=` → thay cả dòng bằng câu
      "Đã nhận tiền cọc qua cổng thanh toán." (i18n), **không** in mã, kể cả mã `DEMO…`; áp dụng cho mọi portal dùng
      `BookingHistoryList` (khách, quản lý, admin).
- [ ] Rà các chỗ khác có thể in chuỗi kỹ thuật dạng `key=value` từ BE → cùng helper, chỉ cho qua lý do người dùng tự nhập.
- [ ] Test: lịch sử có `paymentReference=DEMO…` và `paymentReference=<vnp_TxnRef>` đều chỉ hiện câu chung; lý do hủy do
      khách nhập vẫn hiện nguyên.

---

### V-05 — Ảnh trong nav Tài khoản

| Câu hỏi                                                          | Trả lời                                                                         | Bằng chứng                                                                                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Admin upload ảnh cho tài khoản được chưa?                        | **Chưa, và không làm được nếu không sửa BE**                                    | `UserResponse` của Identity không có trường ảnh; không API nào nhận ảnh cho user                                                   |
| Khách upload ảnh ở trang của họ thì nav Tài khoản có thấy không? | **Khách hiện không upload được ảnh đại diện**                                   | `features/customer/my-profile` không có ô upload; key `customer.profile.changeAvatar` có trong i18n nhưng không component nào dùng |
| Ảnh hồ sơ người bệnh?                                            | Không liên quan tài khoản; contract chỉ có `avatarUrl` dạng chuỗi, không upload | `CareRecipientRecord.avatarUrl`                                                                                                    |
| Đã có ảnh nào của người dùng?                                    | **Có — ảnh hồ sơ người chăm sóc** (ProviderService `CAREGIVER_PROFILE`)         | Đã dùng ở U-11                                                                                                                     |
| MediaService sẵn sàng chưa?                                      | Có purpose `USER_AVATAR` (jpg/png/webp ≤ 5 MB), chưa service nào lưu tham chiếu | `MediaService/.../MediaPurpose.java`                                                                                               |

**Vì sao trung tâm và người chăm sóc upload được ảnh, còn tài khoản thì không? (D-07)**

Không phải do phân quyền "cấm khách". Nguyên nhân là **không có service nào nhận và lưu ảnh cho tài khoản**:

| Lớp                                                              | Thực tế trong code                                                                                                                                                                      | Hệ quả                                                                                                                     |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| MediaService (`/api/v1/media`)                                   | Mọi endpoint `@PreAuthorize("hasRole('SERVICE')")` — chỉ service khác gọi bằng token máy; **trình duyệt không gọi trực tiếp được** (với mọi vai trò, kể cả admin)                       | FE không thể tự upload file rồi gắn vào tài khoản                                                                          |
| ProviderService (`/api/v1/provider-media/{ownerType}/{ownerId}`) | Cửa upload duy nhất của web. `ownerType` chỉ có `CARE_CENTER`, `CAREGIVER_PROFILE`, `CERTIFICATE`; POST/DELETE cho `ADMIN`, `CENTER_MANAGER`, `CAREGIVER` (khách chỉ GET ảnh công khai) | Ảnh trung tâm, ảnh hồ sơ người chăm sóc, file chứng chỉ có chỗ lưu (`provider_media`); **tài khoản không phải owner type** |
| IdentityService (`users`)                                        | Không có cột ảnh, không gọi Media, `UserResponse` không có ảnh                                                                                                                          | Không có chỗ lưu `mediaFileId` của ảnh tài khoản                                                                           |
| CareRecipientService                                             | Không gọi Media; `avatarUrl` chỉ là chuỗi                                                                                                                                               | Ảnh người bệnh cũng chưa upload được                                                                                       |
| MediaService `MediaPurpose`                                      | Đã khai báo sẵn `USER_AVATAR`, `CARE_RECIPIENT_AVATAR`                                                                                                                                  | Hạ tầng lưu file sẵn sàng; chỉ thiếu service nghiệp vụ dùng tới                                                            |

→ Khách hàng, quản lý trung tâm và admin **không có đường upload ảnh tài khoản** trong hệ thống hiện tại. Người chăm sóc có
ảnh vì ảnh thuộc **hồ sơ chuyên môn** (ProviderService), không thuộc tài khoản đăng nhập. Không có cách làm đúng bằng FE
thuần: mượn `provider-media` cho tài khoản là sai mô hình dữ liệu (owner type không tồn tại, khách bị chặn POST) nên **không
đề xuất**.

**Đề xuất trong phạm vi D-07 (chỉ FE)**

- [ ] Danh sách & chi tiết tài khoản: tài khoản `CAREGIVER` hiện **ảnh hồ sơ người chăm sóc** (`GET /caregivers/by-user/{userId}`
      → `CaregiverAvatar`), cập nhật ngay nhờ `invalidateOwnerMedia` (U-11); vai trò khác giữ chữ viết tắt.
- [ ] Chi tiết tài khoản người chăm sóc có link "Xem hồ sơ người chăm sóc" để admin biết ảnh được quản lý ở đâu.
- [ ] Gỡ key i18n không dùng `customer.profile.changeAvatar` để không ai tưởng chức năng đã có.
- [ ] Ghi vào `ARCHITECTURE.md`: "Tài khoản chưa có ảnh đại diện; cần IdentityService lưu `USER_AVATAR`" cho đợt BE sau (làm
      theo cách ProviderService gọi Media: upload qua Feign token SERVICE, lưu `media_file_id`, trả URL có hạn).

## 10. Vấn đề phụ phát hiện thêm

| Mã   | Vấn đề                                                                                 | Đề xuất                                                                                       |
| ---- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| B-01 | Giờ trung tâm cho phép qua đêm (D-04) nhưng Booking không đặt được buổi qua đêm (5207) | Ghi chú ở trang trung tâm khi giờ qua đêm: "Khách chỉ đặt được buổi kết thúc trong cùng ngày" |
| B-02 | `ToastBanner` trong `shared/ui/toast.tsx` không được dùng ở đâu                        | Thay bằng sonner (V-01)                                                                       |
| B-03 | Lịch sử lịch đặt in `eventType` thô khi gặp loại lạ (`booking-history-list.tsx`)       | Fallback "Cập nhật lịch đặt"                                                                  |
| B-04 | Tab "Bảng giá theo trung tâm" chỉ xem một trung tâm mỗi lần, không có tổng quan        | Gộp vào tab "Đơn vị & gói giá" (V-02)                                                         |

## 11. Câu hỏi đã chốt

Q-10 → D-07, Q-11 → D-08, Q-12 → D-09, Q-13 → D-10 (bảng "Quyết định đã chốt" đầu Phần 2).

## 12. Kế hoạch triển khai Phần 2 (chỉ FE)

| Đợt | Nội dung                                                                                                                                     | Mã         | Cỡ  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --- |
| H   | Cài sonner, `Toaster` theo token, `app-toast.ts`, i18n toast; gắn vào mọi thao tác ghi của 8 nav item; bỏ thông báo trùng                    | V-01, B-02 | M   |
| I   | Lịch sử: ẩn mã giao dịch với mọi người, thay bằng câu chung; fallback `eventType`                                                            | V-04, B-03 | S   |
| J   | Lịch đặt: lọc trung tâm + ngày, chế độ Lịch tháng, tab Lịch đặt ở chi tiết trung tâm                                                         | V-03       | M   |
| K   | Dịch vụ: xóa khối mẫu; tab "Gói giá" dữ liệu thật (gộp tab bảng giá theo trung tâm), ghi chú chưa có phụ phí                                 | V-02, B-04 | M   |
| L   | Tài khoản: ảnh người chăm sóc trong danh sách / chi tiết, link hồ sơ; gỡ i18n không dùng; ghi chú qua đêm ở trung tâm; ghi `ARCHITECTURE.md` | V-05, B-01 | S   |

Thứ tự **H → I → J → K → L** (toast trước để các đợt sau dùng luôn).

**File dự kiến chạm:** `package.json` / `pnpm-lock.yaml` (sonner), `app/shared/ui/toaster.tsx`, `app/shared/ui/app-toast.ts`,
`app/shared/i18n/admin/toast-resources.ts`, `app/features/admin/layout/admin-layout.tsx`, các component có mutation trong
`features/admin/**` và `entities/identity/**`, `features/admin/bookings/**` (+ `components/booking-calendar.tsx`),
`features/admin/centers/center-detail-page.tsx`, `entities/booking/booking-history-list.tsx` (+ `booking-history-reason.ts`),
`features/admin/services/components/pricing-guidelines.tsx`, `features/admin/identity/**`,
`shared/i18n/customer/profile-resources.ts`, `ARCHITECTURE.md`. Không file `BE/` nào.

**Kiểm thử:** test component cho toast (thành công / lỗi hệ thống / không toast khi lỗi validation), lịch tháng (dựng buổi
từ `DAILY` / `WEEKLY` / `ONE_TIME`, bấm buổi mở chi tiết, lọc trung tâm gửi `centerId`), `paymentReference` không còn hiện mã ở
mọi portal, tab "Gói giá"; `pnpm check`; chạy trình duyệt thật 1440px + 390px như Phần 1.

### 12.1 Kết quả Phần 2 (2026-10-31) — đã làm, chỉ FE

| Đợt | Trạng thái | Đã làm                                                                                                                                                                                                                                                                                                                                                           |
| --- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H   | ✅         | `shared/ui/toaster.tsx`, `app-toast.ts`, `use-action-toast.ts`; toast góc dưới phải theo token, gắn trong `AdminLayout`. Thành công → toast; lỗi hệ thống → toast có "Thử lại", giữ form; lỗi nghiệp vụ vẫn ở cuối form, validation dưới ô. Bỏ các dòng "Đã lưu" trùng.                                                                                          |
| I   | ✅         | `entities/booking/booking-history-reason.ts`: `paymentReference=…` → "Đã nhận tiền cọc", chuỗi máy khác bị ẩn; `eventType` lạ → "Cập nhật khác". Áp dụng mọi portal.                                                                                                                                                                                             |
| J   | ✅         | `entities/booking/bookings-browser.tsx`: lọc trung tâm / trạng thái / mã / khoảng ngày (ngược thì báo dưới ô, không gửi), chế độ Lịch tháng (dựng buổi ONE_TIME / DAILY / WEEKLY, bấm mở chi tiết; mobile thành agenda). Tab "Lịch đặt" trong chi tiết trung tâm.                                                                                                |
| K   | ✅         | Xóa `center-pricing-panel`, `offering-price-plans`, `pricing-guidelines` (khối mẫu, phụ phí giả). Tab "Gói giá": so sánh gói của mọi trung tâm đang hoạt động theo dịch vụ chuẩn — khoảng giá theo đơn vị, nhãn "Thấp nhất" khi có so sánh thật, lọc trung tâm / dịch vụ / đơn vị / chỉ gói đang bán (giữ trên URL), mobile dạng danh sách. Link cũ `?tab=center | surcharge` tự sang "Gói giá". |
| L   | ✅         | Tài khoản CAREGIVER hiện ảnh người chăm sóc (danh sách + chi tiết) và link "Xem hồ sơ người chăm sóc"; tài khoản khác giữ chữ viết tắt (Identity không có ảnh). Gỡ `customer.profile.avatarAlt/changeAvatar`. Ghi chú qua đêm ở chi tiết trung tâm và form. Cập nhật `ARCHITECTURE.md`.                                                                          |

**Kiểm tra:** prettier, eslint, typecheck, vitest 81 file / 337 test, `node --test` 3/3, build đều qua. Đã chụp trình duyệt
thật 1440px + 390px: Gói giá, Lịch tháng (lưới + agenda), Tài khoản — sửa thêm sau khi xem: nút đơn vị tính xuống dòng và
bảng tràn ngang trên mobile, nhãn "Thấp nhất" khi chỉ có một gói, dòng buổi trên mobile lặp giờ và hiện mã thay vì tên.
