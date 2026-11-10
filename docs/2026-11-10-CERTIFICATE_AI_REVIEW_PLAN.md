# 2026-11-10 — Kế hoạch & Tiến độ Frontend: Kết nối giao diện Duyệt chứng chỉ bằng AI

Tài liệu này ghi lại đầy đủ **kế hoạch triển khai**, **quyết định nghiệp vụ đã chốt**, **tiến độ hiện tại** ở phía Frontend (`FE-careconnect`) và **các quy tắc kiến trúc / code bắt buộc tuân thủ** theo [`FE-careconnect/AGENTS.md`](../AGENTS.md) và [`FE-careconnect/docs/ARCHITECTURE.md`](./ARCHITECTURE.md).

Đọc thêm:
- `BE/docs/2026-11-09-AI_CHAT_AND_CERTIFICATE_AI_CHECK.md` — thiết kế tổng thể phần BE (Phần B).
- `BE/ProviderService/schema/changes/2026-11-09_certificate_ai_check.sql` — schema mới cần đã áp vào DB trước khi test.

---

## 1. Quyết định nghiệp vụ đã chốt với Chủ dự án (2026-11-09)

| # | Câu hỏi | Quyết định |
|---|---|---|
| 1 | AI chạy khi nào? | **Tự động**, ngay sau khi Center Manager bấm xác nhận; không có toggle bật/tắt AI. |
| 2 | Ai xem kết quả AI đầy đủ (`aiRiskLevel`, `aiWarnings`, `aiExtracted`)? | **Chỉ ADMIN** (BE chỉ trả các trường này qua `CertificateMapper.toAdminResponse`). Caregiver và Center Manager chỉ nhận trạng thái AI (`aiCheckStatus`) — BE trả trường này cho mọi role. |
| 3 | Khi nào Admin bắt buộc nhập lý do khi duyệt? | Khi AI chưa trả về `LOW` hoặc `MEDIUM` (tức HIGH, UNDETERMINED, FAILED, đang QUEUED/PROCESSING) — lỗi BE `4256`. |
| 4 | Khi nào Center Manager không được xác nhận? | Khi caregiver **chưa tải ảnh** chứng chỉ — lỗi BE `4255`; khi chứng chỉ **đã hết hạn** — lỗi `4254` (BE kiểm tra hạn ở cả bước Manager lẫn Admin). FE hiển thị lỗi rõ nghĩa. |
| 5 | Caregiver sửa thông tin / đổi ảnh thì sao? | BE tự reset về `PENDING`, xóa kết quả AI cũ (`Certificate.restartReview()` — gọi ở `PUT /certificates/{id}`, upload ảnh và xóa ảnh trong `ProviderMediaServiceImpl`). FE invalidate query certificate sau mỗi lần sửa / upload / xóa ảnh. FE **chưa có giao diện** sửa chứng chỉ / thêm-xóa ảnh sau khi tạo → **đã chốt làm trong đợt này** (mục 11, Q2). |
| 9 | Caregiver được xóa chứng chỉ khi nào? | **Chỉ khi `PENDING` hoặc `REJECTED`** (chốt 2026-11-10, mục 11, Q1). BE cần thêm kiểm tra; FE ẩn nút xóa ở các trạng thái khác. |
| 6 | Admin có thể chạy lại AI không? | Có — `POST /certificates/{id}/ai-check`, chỉ được phép khi trạng thái là `CENTER_VERIFIED`. |
| 7 | Tần suất tự làm mới (auto-refresh) | 10 giây nếu danh sách có bất kỳ chứng chỉ nào đang `QUEUED` hoặc `PROCESSING`. |
| 8 | Mức thứ tự ưu tiên trên hàng chờ Admin | `HIGH` → `UNDETERMINED` → `MEDIUM` → `LOW` → chưa có AI; sau đó theo `centerVerifiedAt`. Sắp xếp do BE xử lý, FE không tự sort. |

---

## 2. Nguyên tắc kiến trúc bắt buộc tuân thủ

Khi triển khai code tại `FE-careconnect`, **bắt buộc** tuân thủ:

1. **Ranh giới thư mục & chiều phụ thuộc (`Source Boundaries`)**:
   - `routes → features → entities → shared` (và `providers → shared`).
   - Route module (`app/routes/`) chỉ điều phối URL, không chứa logic nghiệp vụ.
   - `entities/provider/` là điểm dùng chung cho tất cả ba role (caregiver, center-manager, admin); không được tạo logic certificate trùng lặp trong `features/`.
   - Không tạo barrel file (`index.ts`) gây vòng lặp phụ thuộc.

2. **OpenAPI Contract & Code Generation**:
   - Không sửa tay bất kỳ file nào trong `app/shared/api/generated/`.
   - Mọi thay đổi schema đi theo thứ tự: cập nhật `openapi/openapi.yaml` → chạy `pnpm api:validate` → chạy `pnpm api:generate`.
   - Tên `operationId` trong openapi đã được Orval sinh thành hàm API tương ứng; tuyệt đối không tự viết `fetch` tay.

3. **Đa ngôn ngữ (i18n)**:
   - Tuyệt đối không hardcode chuỗi tiếng Việt hoặc tiếng Anh trực tiếp trong JSX/TSX.
   - Mọi nhãn, lỗi, badge mới phải khai báo đầy đủ ở cả hai bộ ngôn ngữ: `certificate-review-resources.ts` (dùng chung cho dialog và manager) và `admin/certificates-resources.ts` (trang Admin) và `caregiver/me-resources.ts` (tab Caregiver).
   - Mã lỗi từ BE ánh xạ sang khóa i18n trong `certificateReview.errors.e<code>` qua `certificateReviewErrorKey` (`entities/provider/certificate-ai.ts`). Danh sách mã đầy đủ ở mục 7.

4. **UI token & component system**:
   - Dùng token màu dự án: `forest-900` (nền tối, card được chọn), `mint-50` (hover), `peach-*` (CTA), `rounded-2xl`, `shadow-[var(--shadow-card)]`, `shadow-[var(--shadow-soft)]`.
   - Reuse component từ `shared/ui/`: `Button`, `Modal`, `ModalColumns`, `StatusBadge`, `Skeleton`, `EmptyState`, `ErrorState`, `Pagination`, `FormField`, `Textarea`, `Select`, `BentoPageHeader`.
   - Animation: `ops-stagger` / `cg-stagger` class, `CountUp` từ `shared/ui/motion` cho số đếm Stat Cards. Mọi animation tôn trọng `prefers-reduced-motion`.

5. **Server State**:
   - Dùng TanStack Query (`useQuery`, `useMutation`); không fetch trong `useEffect`.
   - `queryKey` tuân theo bảng `providerKeys` đã có trong `entities/provider/provider-api.ts`.
   - Invalidate đúng key sau mutation: `providerKeys.certificateAudit` (admin queue + thống kê) và `providerKeys.certificates(caregiverId)` (canh giường caregiver).

6. **Quy tắc test & Git**:
   - Không tự `git commit` hay `git push`.
   - Chạy đủ `pnpm api:validate`, `pnpm typecheck`, `pnpm lint`, `pnpm test` xanh toàn bộ trước khi hoàn tất.

---

## 3. Phân quyền rõ ràng theo từng Role

### Role CAREGIVER — `/caregiver/profile?tab=certificates`

**Làm được:**
- Khai báo chứng chỉ mới (`POST /certificates/caregivers/{caregiverId}`).
- Tải ảnh / file lên chứng chỉ (`POST /provider-media/CERTIFICATE/{id}`), tối đa 5 ảnh.
- Xem trạng thái xét duyệt (`verificationStatus`): `PENDING`, `CENTER_VERIFIED`, `ADMIN_VERIFIED`, `REJECTED`.
- Xem lý do từ chối (`verificationReason`) nếu `REJECTED`.
- Xóa chứng chỉ (`DELETE /certificates/{id}?version=`). **Chỉ khi `PENDING` hoặc `REJECTED`** (chốt Q1, mục 11). ⚠️ BE hiện chưa kiểm tra trạng thái khi xóa — cần sửa theo mục 11.
- Sửa thông tin chứng chỉ (`PUT /certificates/{id}`) — BE tự reset về `PENDING`. BE đã có, FE **chưa có UI** (`saveCertificate` trong `provider-api.ts` chưa được dùng) → làm trong đợt này (chốt Q2, mục 11). Kèm thêm / xóa ảnh của chứng chỉ đã tạo (tối đa 5 file).

**Không thấy:**
- Kết quả AI (`aiRiskLevel`, `aiWarnings`, `aiExtracted`, `aiCheckedAt`) — BE không trả về cho role này.
- BE có trả `aiCheckStatus`, nhưng tab Caregiver **không hiển thị** nó: chỉ dùng nhãn trạng thái duyệt (`verificationStatus`), `CENTER_VERIFIED` đọc là "Chờ admin duyệt".

---

### Role CENTER_MANAGER — `/center-manager/caregivers/{caregiverId}`

**Làm được:**
- Xem danh sách chứng chỉ của caregiver thuộc trung tâm mình (`GET /certificates/caregivers/{id}`).
- Xem ảnh chứng chỉ (qua `CertificateFiles` component).
- Xác nhận duyệt sơ bộ (`PATCH /certificates/{id}/center-verification`, `approved: true`).
  - **Điều kiện bắt buộc:** caregiver phải tải ít nhất 1 ảnh, nếu không lỗi `4255`; chứng chỉ chưa hết hạn, nếu không lỗi `4254`; chứng chỉ đang `PENDING`, nếu không lỗi `4253`; gửi đúng `version`, nếu không lỗi `4251`.
- Từ chối với lý do (`approved: false`, lý do bắt buộc — thiếu thì BE trả `4205`).
- Xem trạng thái AI sau khi đã xác nhận: `aiCheckStatus` hiển thị dưới dạng thông báo nhẹ ("Đã gửi AI đối chiếu ảnh — chờ admin duyệt").

**Không thấy:**
- Chi tiết kết quả AI (`aiRiskLevel`, `aiWarnings`, `aiExtracted`).

---

### Role ADMIN — `/admin/certificates` và `/admin/centers/:id/caregivers`

**Làm được:**
- Xem toàn bộ hàng chờ duyệt (`GET /certificates/pending-audit?centerId&riskLevel&aiCheckStatus&page&size`, `size` ≤ 100) — chỉ chứng chỉ `CENTER_VERIFIED`, rủi ro cao lên đầu.
- Lọc theo trung tâm (`centerId` — BE có hỗ trợ dù docs BE chưa ghi), mức rủi ro, trạng thái AI (`aiCheckStatus=QUEUED` trả cả `PROCESSING`).
- Xem thống kê theo mức rủi ro (`GET /certificates/pending-audit/statistics?centerId`): `total`, `high`, `medium`, `low`, `undetermined`, `checking` (QUEUED + PROCESSING), `failed`.
- Mở dialog duyệt với đầy đủ thông tin: ảnh, bảng đối chiếu, danh sách cảnh báo AI, thông tin trung tâm.
- Chạy lại AI check (`POST /certificates/{id}/ai-check`).
- Phê duyệt (`approved: true`) hoặc từ chối (`approved: false`) qua `PATCH /certificates/{id}/verification`.
- Thu hồi chứng chỉ đã `ADMIN_VERIFIED` (revoke = `approved: false` từ trạng thái verified, bắt buộc lý do). Chứng chỉ `ADMIN_VERIFIED` không nằm trong hàng chờ `pending-audit`, nên thu hồi thực hiện từ `/admin/centers/:id/caregivers` (dùng `GET /certificates/caregivers/{id}`, admin nhận đủ kết quả AI).

**Điều kiện bắt buộc khi Admin duyệt:**
- Từ chối → luôn bắt nhập lý do.
- Duyệt chấp nhận khi AI là `HIGH`, `UNDETERMINED`, `FAILED`, hoặc đang `QUEUED`/`PROCESSING` → bắt nhập lý do (lỗi `4256`).
- Duyệt chấp nhận khi AI là `LOW` hoặc `MEDIUM` → không bắt buộc lý do.

---

## 4. Luồng đi hoàn chỉnh (End-to-End Flow)

```
[CAREGIVER] Khai báo thông tin chứng chỉ
     ↓ POST /certificates/caregivers/{id}
[CAREGIVER] Tải ảnh lên (bắt buộc ≥ 1)
     ↓ POST /provider-media/CERTIFICATE/{id}
[CENTER_MANAGER] Xem thông tin + ảnh, bấm Xác nhận
     ↓ PATCH /certificates/{id}/center-verification {approved: true}
     → BE: status = CENTER_VERIFIED, ai_check_status = QUEUED (tự động)
[BACKGROUND - Scheduler 15s] Scheduler quét QUEUED → PROCESSING (lease 3 phút)
     ↓ MediaService: lấy URL tải có hạn + content type của từng ảnh
     ↓ POST /api/v1/ai/certificate-checks (token SERVICE, ngoài transaction)
     → AI chỉ chép nội dung ảnh ra JSON; code AIService so sánh với thông tin khai báo
     → AI trả về: extracted, warnings, riskLevel
     → BE lưu: ai_check_status = COMPLETED, ai_risk_level, ai_warnings, ai_extracted
       (chỉ ghi nếu ai_check_id không đổi — caregiver sửa / admin chạy lại giữa chừng thì bỏ kết quả cũ)
     → Lỗi: thử lại sau 30s·2ⁿ (tối đa 30 phút), hết 5 lần hoặc AIService trả 400 → FAILED
[ADMIN] Mở hàng chờ, xem kết quả AI, đọc bảng đối chiếu
     ↓ GET /certificates/pending-audit
     ↓ GET /certificates/pending-audit/statistics
     ↓ [tuỳ chọn] POST /certificates/{id}/ai-check (chạy lại)
     ↓ PATCH /certificates/{id}/verification {approved, reason, version}
```

---

## 5. Tiến độ hiện tại (2026-11-09)

### 5.1. Đã hoàn thành (Backend + FE Entity layer)

**Backend** (`BE/docs/2026-11-09-AI_CHAT_AND_CERTIFICATE_AI_CHECK.md`):
- ProviderService: `CertificateController`, `CertificateServiceImpl`, `CertificateAiCheckScheduler`, schema SQL mới (`2026-11-09_certificate_ai_check.sql`). Unit test: 91/91 xanh.
- AIService: `CertificateCheckController`, `CertificateCheckServiceImpl`, `CertificateRiskServiceImpl`, `CertificatePrompts`. Unit test: 6/6 xanh.
  - Lưu ý: AIService còn `CertificateVerificationController` (`POST /api/v1/ai/certificate-verifications`, OCR + QR) — **không được ProviderService gọi**, trùng chức năng với `/certificate-checks`. **Chốt Q3: giữ lại, không xóa, không dùng** cho luồng duyệt (mục 11).
- ApiGateway: route `/api/v1/ai/**` với `LongRequestProxyHandler` (timeout 90s). Test: 24/24 xanh.

**Frontend — Entity layer đã có** (dùng chung cho tất cả role):
- [`entities/provider/certificate-ai.ts`](../app/entities/provider/certificate-ai.ts) — constants (`CERTIFICATE_FIELDS`, `RISK_LEVELS`, `RISK_TONES`), helpers (`isAiChecking`, `hasAiResult`, `needsApprovalReason`, `fieldResult`, `declaredValue`, `extractedValue`, `certificateReviewErrorKey`).
- [`entities/provider/certificate-ai-badge.tsx`](../app/entities/provider/certificate-ai-badge.tsx) — Badge hiển thị rủi ro hoặc trạng thái AI.
- [`entities/provider/certificate-review-dialog.tsx`](../app/entities/provider/certificate-review-dialog.tsx) — Dialog duyệt đầy đủ: ảnh, bảng đối chiếu, danh sách warnings, lý do, nút duyệt/từ chối/chạy lại AI.
- [`entities/provider/certificate-files.tsx`](../app/entities/provider/certificate-files.tsx) — Hiển thị ảnh chứng chỉ, dùng chung giữa Manager và Admin dialog.
- [`entities/provider/provider-api.ts`](../app/entities/provider/provider-api.ts) — Đã khai báo đủ: `fetchPendingCertificates`, `fetchPendingCertificateStatistics`, `startCertificateAiCheck`, `verifyCertificate`, `verifyCertificateByCenter`, `providerKeys.certificateAudit`, `providerKeys.pendingCertificates`, `providerKeys.pendingCertificateStatistics`.
- **i18n**: `certificate-review-resources.ts` (vi + en), `admin/certificates-resources.ts` (vi + en).
- **OpenAPI**: tất cả endpoint liên quan đã có trong `openapi/openapi.yaml` và `api:validate` đã pass.

**Frontend — Admin feature đã có**:
- [`features/admin/certificates/admin-certificates-page.tsx`](../app/features/admin/certificates/admin-certificates-page.tsx) — Trang hàng chờ duyệt Admin: Stat Cards, bộ lọc, bảng danh sách, auto-poll 10s, mở dialog qua `?certificate=<id>`.
- [`features/admin/certificates/components/certificate-stat-cards.tsx`](../app/features/admin/certificates/components/certificate-stat-cards.tsx) — 7 thẻ thống kê với `CountUp` animation.
- [`routes/admin/certificates.tsx`](../app/routes/admin/certificates.tsx) — Route đã được đăng ký.
- **Test**: [`__tests__/admin-certificates-page.test.tsx`](../app/features/admin/certificates/__tests__/admin-certificates-page.test.tsx) — 3 test case bao phủ: hiển thị danh sách + badge, bảng đối chiếu + validate lý do HIGH, chạy lại AI.

**Frontend — Center Manager đã có**:
- [`features/center-manager/caregivers/components/manager-certificates.tsx`](../app/features/center-manager/caregivers/components/manager-certificates.tsx) — Danh sách chứng chỉ, xem ảnh, nút Xác nhận / Từ chối (kèm lý do), hiển thị `aiCheckStatus` sau khi xác nhận.

**Frontend — Caregiver đã có**:
- [`features/caregiver/profile/components/certificates-tab.tsx`](../app/features/caregiver/profile/components/certificates-tab.tsx) — Grid chứng chỉ, badge trạng thái, xem ảnh, xóa.
- [`features/caregiver/profile/components/certificate-form.tsx`](../app/features/caregiver/profile/components/certificate-form.tsx) — Modal thêm chứng chỉ: 2 cột (ảnh preview + form), upload đa file, drag & drop.

---

## 6. Việc còn lại cần làm (Checklist triển khai)

### 6.1. Điều kiện tiên quyết (Owner thực hiện)

Phải hoàn thành trước khi test trên trình duyệt:

- [ ] Áp SQL migration: `ProviderService/schema/changes/2026-11-09_certificate_ai_check.sql` vào DB `CARECONNECT_PROVIDER`.
- [ ] Đăng ký service client `ai` trong IdentityService: `IdentityService/scripts/New-ServiceClient.ps1 ai`; đặt secret vào biến môi trường `AI_SERVICE_CLIENT_SECRET`.
- [ ] Cấu hình `AI_GROQ_API_KEY` và `AI_GROQ_VISION_MODEL` trong `BE/AIService/.env` (phải là mô hình **nhận ảnh** đang còn hoạt động trên Groq — kiểm tra tại console.groq.com/docs/models, ví dụ `meta-llama/llama-4-scout-17b-16e-instruct`). **Không** dùng `llama-3.2-11b-vision-preview` (Groq đã ngừng). Hiện `.env` chưa có biến này → AIService dùng `AI_GROQ_MODEL` (`qwen/qwen3.8-27b`); nếu model đó không nhận ảnh, mọi chứng chỉ sẽ ra `UNDETERMINED`/`FAILED`. **Chốt Q4: dùng `qwen/qwen3.8-27b`** → thêm dòng `AI_GROQ_VISION_MODEL=qwen/qwen3.8-27b` vào `BE/AIService/.env` (và để trống trong `.env.example`) cho tường minh. Bắt buộc chạy bước kiểm tra model nhận ảnh ngay dưới đây trước khi test E2E (mục 11, Q4).
- [ ] Kiểm tra model đọc được ảnh: tạo 1 chứng chỉ có ảnh rõ → Manager xác nhận → chờ ~30s → Admin thấy `aiCheckStatus = COMPLETED`, `aiExtracted` có tên / số chứng chỉ (không có cảnh báo `UNREADABLE`). Nếu ra `FAILED` hoặc toàn `UNREADABLE` → xem log AIService (lỗi 86xx) và đổi sang model vision khác.
- [ ] Rebuild Docker images: `docker compose up --build -d api-gateway provider-service ai-service`.

---

### 6.2. Danh sách file Frontend cần kiểm tra / bổ sung

| Nhóm | File cần kiểm tra / bổ sung | Nội dung chi tiết |
|---|---|---|
| **A. Caregiver — Tab Certificates** | [`features/caregiver/profile/components/certificates-tab.tsx`](../app/features/caregiver/profile/components/certificates-tab.tsx) | **Kiểm tra**: badge trạng thái `CENTER_VERIFIED` hiển thị đúng là "Chờ admin duyệt" (không lộ kết quả AI). Lý do từ chối (`verificationReason`) hiển thị rõ khi status `REJECTED`. Invalidate `providerKeys.certificates(caregiverId)` sau khi xóa ảnh hoặc sửa chứng chỉ để BE reset về `PENDING` phản ánh đúng lên UI. |
| **A. Caregiver — Form thêm chứng chỉ** | [`features/caregiver/profile/components/certificate-form.tsx`](../app/features/caregiver/profile/components/certificate-form.tsx) | **Kiểm tra**: file upload bắt buộc (FE validate `files.length > 0`). Toast thành công dùng key `caregiver.me.certificates.form.saved`. Upload thất bại giữ chừng → toast `uploadFailed` + nút Retry. Sau khi tạo thành công gọi `invalidateQueries({ queryKey: providerKeys.certificates(caregiverId) })`. |
| **B. Center Manager — Xác nhận chứng chỉ** | [`features/center-manager/caregivers/components/manager-certificates.tsx`](../app/features/center-manager/caregivers/components/manager-certificates.tsx) | **Đã có**: lỗi `4255` hiển thị inline alert qua `certificateReviewErrorKey` (dòng ~82); nhãn `certificateReview.managerAiStatuses.<status>`. **✅ Đã làm (2026-11-10)**: mọi mã trong `REVIEW_ERROR_CODES` (`4205`, `4250`, `4251`, `4253`, `4254`, `4255`) đều đi qua `certificateReviewErrorKey`; mã lạ mới rơi về `certificateConfirmError` (409) / thông báo theo HTTP status. Nút "Xác nhận" disabled khi mutation đang pending. |
| **C. Admin — Trang hàng chờ duyệt** | [`features/admin/certificates/admin-certificates-page.tsx`](../app/features/admin/certificates/admin-certificates-page.tsx) | **Kiểm tra**: auto-poll 10s chỉ kích hoạt khi `items.some(isAiChecking)`. URL param `?certificate=<id>` mở dialog khi load trang. Phân trang hoạt động đúng qua param `?page=`. Bộ lọc Risk + Center + trạng thái AI cập nhật URL không làm reload trang (replace). Nút "Bỏ lọc" xuất hiện đúng khi có filter. |
| **C. Admin — Stat Cards** | [`features/admin/certificates/components/certificate-stat-cards.tsx`](../app/features/admin/certificates/components/certificate-stat-cards.tsx) | **Kiểm tra**: 7 thẻ hiển thị đúng số đếm từ `fetchPendingCertificateStatistics`. Thẻ được chọn active (`forest-900`). `CountUp` animation chạy khi số thay đổi. `aria-pressed` đúng. |
| **C. Admin — Dialog duyệt** | [`entities/provider/certificate-review-dialog.tsx`](../app/entities/provider/certificate-review-dialog.tsx) | **Kiểm tra toàn bộ luồng**: (1) Hiển thị ảnh qua `CertificateFiles`. (2) Bảng đối chiếu 4 cột đủ 6 trường với badge Khớp/Không khớp/Không thấy. (3) Badge rủi ro AI (`CertificateAiBadge`) hiển thị đúng. (4) Danh sách warnings đủ, mapping đúng field. (5) Nút "Chạy lại AI" chỉ hiện khi `waiting && !checking`. (6) Nhập lý do bắt buộc khi: từ chối, hoặc duyệt mà AI chưa LOW/MEDIUM (`needsApprovalReason`). (7) Lỗi `4256` ánh xạ đúng thông báo. (8) Toast thành công sau duyệt / từ chối. (9) Revoke (thu hồi) từ trạng thái `ADMIN_VERIFIED`. |
| **D. i18n — Kiểm tra độ bao phủ** | [`shared/i18n/certificate-review-resources.ts`](../app/shared/i18n/certificate-review-resources.ts) | **Kiểm tra**: tất cả key trong `certificateReviewVi` và `certificateReviewEn` phủ đủ: `statuses`, `riskLevels`, `riskHints`, `aiStatuses`, `managerAiStatuses`, `fields`, `warnings`, `results`, `dialog.*`, `toast.*`, `errors.e4205`, `e4250`, `e4251`, `e4253`–`e4257`, `generic`. **✅ Đã làm (2026-11-10)**: thêm `4205`, `4250` vào `REVIEW_ERROR_CODES` trong [`entities/provider/certificate-ai.ts`](../app/entities/provider/certificate-ai.ts) và câu vi/en tương ứng; `e4254` sửa thành "không thể xác nhận hay duyệt" (dùng cho cả Manager). `4252` (ngày hết hạn trước ngày cấp) thuộc form caregiver — validate phía client đã chặn, chỉ cần map nếu làm form sửa (Q2). |
| **D. i18n — Admin certificates** | [`shared/i18n/admin/certificates-resources.ts`](../app/shared/i18n/admin/certificates-resources.ts) | **Kiểm tra**: key `stats.*` (7 thẻ), `columns.*` (6 cột), `warningCount`, `noWarning`, tất cả trạng thái empty/error/loading. |
| **D. i18n — Caregiver me** | [`shared/i18n/caregiver/me-resources.ts`](../app/shared/i18n/caregiver/me-resources.ts) | **Kiểm tra**: key `certificates.status.CENTER_VERIFIED` → "Trung tâm đã xác nhận", `certificates.rejectedReason`. |
| **E. Test — Admin certificates** | [`features/admin/certificates/__tests__/admin-certificates-page.test.tsx`](../app/features/admin/certificates/__tests__/admin-certificates-page.test.tsx) | **Bổ sung nếu thiếu**: test dialog revoke từ `ADMIN_VERIFIED`, test `UNDETERMINED` badge hiển thị đúng, test auto-poll bật khi có `QUEUED`, test bộ lọc URL param kết hợp. |
| **E. Test — Manager certificates** | Cần tạo: `features/center-manager/caregivers/__tests__/manager-certificates.test.tsx` | **Tạo mới**: test xác nhận thành công → `QUEUED` hiển thị, test lỗi `4255` / `4254` → thông báo đúng nghĩa, test từ chối → yêu cầu lý do. |

---

### 6.3. Luồng kiểm thử E2E thủ công (sau khi infrastructure sẵn sàng)

Thực hiện theo thứ tự trên trình duyệt thật với 3 tài khoản khác nhau:

#### Luồng chính (Happy path — LOW risk)

```
1. [CAREGIVER] Đăng nhập → /caregiver/profile?tab=certificates
   → Bấm "Thêm chứng chỉ"
   → Nhập tên: "Chứng chỉ Điều dưỡng cơ bản", đơn vị cấp: "Bệnh viện Bạch Mai",
     số: "12/QĐ-BV", ngày cấp, ngày hết hạn (tương lai)
   → Tải ảnh chứng chỉ rõ nét (JPG/PNG)
   → Bấm Lưu → Toast "Chứng chỉ đã được thêm. Đang chờ xem xét."
   → Chứng chỉ hiển thị badge "Chờ trung tâm xác nhận"

2. [CENTER_MANAGER] Đăng nhập → /center-manager/caregivers/{id}
   → Thấy chứng chỉ vừa tạo với ảnh
   → Thử bấm "Xác nhận" khi caregiver chưa có ảnh → thông báo lỗi đúng nghĩa (4255)
     (form caregiver bắt buộc ≥ 1 ảnh nên chỉ tái hiện được khi upload lỗi giữa chừng,
      hoặc tạo chứng chỉ không ảnh qua Swagger)
   → Bấm "Xác nhận" sau khi caregiver đã có ảnh → thành công
   → Chứng chỉ hiển thị "Đã gửi AI đối chiếu ảnh — chờ admin duyệt."

3. [ADMIN] Đăng nhập → /admin/certificates
   → Thấy chứng chỉ trong hàng chờ, badge "Chờ AI kiểm tra" (QUEUED)
   → Đợi ~15–30 giây → trang tự refresh → badge chuyển sang mức rủi ro (LOW/MEDIUM/HIGH)
   → Bấm "Xem & duyệt" → dialog mở, bảng đối chiếu đầy đủ
   → Nếu LOW: bấm "Duyệt chứng chỉ" ngay → toast "Đã duyệt"
   → Nếu HIGH: thử bấm "Duyệt chứng chỉ" không nhập lý do → lỗi "Nhập lý do để duyệt"
     → Nhập lý do → Bấm "Duyệt chứng chỉ" → toast "Đã duyệt"
```

#### Luồng kiểm tra lỗi (Error paths)

```
4. [ADMIN] Bấm "Chạy lại AI" trong dialog → badge chuyển về QUEUED → tự refresh → kết quả mới

5. [CAREGIVER] Sửa thông tin chứng chỉ đang CENTER_VERIFIED
   → BE reset về PENDING, xóa kết quả AI
   → FE invalidate → chứng chỉ hiển thị lại "Chờ trung tâm xác nhận"
   ⚠️ Chỉ test được trên giao diện sau khi làm Q2 (mục 11); trước đó test qua Swagger (PUT /certificates/{id}).
   → Tương tự với thêm / xóa ảnh trong dialog sửa → về "Chờ trung tâm xác nhận"

8. [CAREGIVER] Xóa chứng chỉ (sau khi làm Q1)
   → PENDING / REJECTED: nút "Xóa" hiện, xóa thành công
   → CENTER_VERIFIED / ADMIN_VERIFIED: không có nút "Xóa"; gọi thẳng API → BE trả 409 (4253)

6. [ADMIN] Bộ lọc: chọn "Rủi ro cao" → danh sách chỉ HIGH
   → URL thay đổi ?risk=HIGH
   → Bỏ lọc → về toàn bộ
   → Lọc theo trung tâm → kết hợp center + risk

7. [ADMIN] Thu hồi chứng chỉ đã ADMIN_VERIFIED
   → Mở dialog → nút "Thu hồi xác minh" → nhập lý do → xác nhận
   → Toast "Đã từ chối" → trạng thái thay đổi về REJECTED
```

---

## 7. Mã lỗi BE ánh xạ FE

Tất cả mã dưới đây nằm trong `REVIEW_ERROR_CODES` ([`certificate-ai.ts`](../app/entities/provider/certificate-ai.ts)) và được `certificateReviewErrorKey` dịch; mã khác → `certificateReview.errors.generic` (Admin) hoặc thông báo theo HTTP status (Manager).

| Mã lỗi BE | Tình huống | Key i18n FE | Hiển thị ở |
|---|---|---|---|
| `4205` | Từ chối mà không có lý do (FE đã chặn trước, đây là lưới an toàn) | `certificateReview.errors.e4205` | Dialog duyệt (Admin), Manager |
| `4250` | Chứng chỉ không tồn tại / đã bị xóa | `certificateReview.errors.e4250` | Dialog duyệt (Admin), Manager |
| `4251` | Phiên bản chứng chỉ lệch (đã sửa đồng thời) | `certificateReview.errors.e4251` | Dialog duyệt (Admin), Manager |
| `4253` | Trạng thái chứng chỉ không phù hợp để thực hiện hành động | `certificateReview.errors.e4253` | Dialog duyệt (Admin), Manager |
| `4254` | Chứng chỉ đã hết hạn (chặn cả Manager xác nhận lẫn Admin duyệt) | `certificateReview.errors.e4254` | Dialog duyệt (Admin), Manager |
| `4255` | Center Manager xác nhận nhưng chưa có ảnh | `certificateReview.errors.e4255` | Danh sách chứng chỉ (Manager) |
| `4256` | Admin duyệt khi AI chưa LOW/MEDIUM mà không nhập lý do | `certificateReview.errors.e4256` | Dialog duyệt (Admin) — inline form error |
| `4257` | Admin chạy lại AI nhưng chứng chỉ chưa CENTER_VERIFIED | `certificateReview.errors.e4257` | Dialog duyệt (Admin) |

Ghi chú:
- `4252` (ngày hết hạn trước ngày cấp) chỉ xảy ra ở form caregiver; FE đã validate trước (`expiryBeforeIssue`) nên không cần map riêng.
- `4703` / `4704` là lỗi **ProviderService gọi AIService** trong scheduler chạy nền — FE **không bao giờ** nhận. Scheduler ghi vào `ai_last_error`, thử lại với backoff; hết lượt → `aiCheckStatus = FAILED`, Admin thấy trạng thái "AI lỗi" và bấm "Chạy lại AI".

---

## 8. Thư mục & file tham chiếu (map nhanh)

```
app/
├── routes/
│   └── admin/
│       └── certificates.tsx                        ← Route stub (đã có)
├── features/
│   ├── admin/
│   │   └── certificates/
│   │       ├── admin-certificates-page.tsx          ← Trang hàng chờ ADMIN (đã có)
│   │       ├── components/
│   │       │   └── certificate-stat-cards.tsx       ← 7 Stat Cards (đã có)
│   │       └── __tests__/
│   │           └── admin-certificates-page.test.tsx ← 3 test cases (đã có, cần bổ sung)
│   ├── caregiver/
│   │   └── profile/
│   │       └── components/
│   │           ├── certificate-form.tsx             ← Thêm chứng chỉ + upload ảnh (đã có)
│   │           └── certificates-tab.tsx             ← Tab chứng chỉ Caregiver (đã có)
│   └── center-manager/
│       └── caregivers/
│           ├── components/
│           │   └── manager-certificates.tsx         ← Danh sách + xác nhận Manager (đã có)
│           └── __tests__/
│               └── manager-certificates.test.tsx    ← Cần tạo mới (thư mục __tests__ đã có)
├── entities/
│   └── provider/
│       ├── certificate-ai.ts                        ← Logic + helpers dùng chung (đã có)
│       ├── certificate-ai-badge.tsx                 ← Badge rủi ro / trạng thái (đã có)
│       ├── certificate-files.tsx                    ← Viewer ảnh dùng chung (đã có)
│       ├── certificate-review-dialog.tsx            ← Dialog duyệt Admin (đã có)
│       └── provider-api.ts                          ← Tất cả API certificate (đã có)
└── shared/
    ├── api/
    │   └── generated/                               ← Sinh bởi Orval, không sửa tay
    └── i18n/
        ├── certificate-review-resources.ts          ← i18n dùng chung (vi + en, đã có)
        ├── admin/
        │   └── certificates-resources.ts            ← i18n trang Admin (vi + en, đã có)
        └── caregiver/
            └── me-resources.ts                      ← i18n Caregiver profile (vi + en, đã có)
```

---

## 9. Rủi ro & lưu ý

| Rủi ro | Giảm thiểu |
|---|---|
| AI Groq timeout (>90s) | Gateway đã cấu hình `GATEWAY_AI_READ_TIMEOUT=90s`. Scheduler retry với backoff `30s × 2ⁿ` tối đa `PROVIDER_AI_CHECK_MAX_ATTEMPTS`. Dialog FE hiển thị trạng thái `FAILED` với nút "Chạy lại AI". |
| Caregiver upload PDF thay vì ảnh | FE nhận file OK, AIService phát hiện khi xử lý → cảnh báo `UNSUPPORTED_FILE` → `UNDETERMINED`. Admin thấy rõ trong dialog. |
| Version conflict (409) khi duyệt đồng thời | Dialog gửi `version` trong mọi mutation. Lỗi `4251` ánh xạ toast "Chứng chỉ vừa được cập nhật. Hãy tải lại." |
| Auto-poll làm quá nhiều request | Poll chỉ bật khi `items.some(isAiChecking)` hoặc `statistics.checking > 0`; tắt ngay khi hết. |
| Lộ Groq API key | `BE/.gitignore` đã chặn `.env` / `.env.*` (trừ `.env.example`). Không copy key vào docs, `.env.example` hay biến `VITE_*`. Nếu key từng bị gửi ra ngoài → tạo key mới trên Groq. |
| Gọi nhầm endpoint AI cũ | Chỉ `/api/v1/ai/certificate-checks` thuộc luồng duyệt; `/certificate-verifications` là code cũ, giữ lại nhưng không dùng (mục 11, Q3). |
| Model `qwen/qwen3.8-27b` không nhận ảnh | Chạy bước kiểm tra model ở mục 6.1 trước E2E. Nếu thất bại chỉ cần đổi `AI_GROQ_VISION_MODEL` và restart `ai-service` — không phải sửa code. |
| Caregiver sửa chứng chỉ đã duyệt làm mất trạng thái duyệt | Dialog sửa hiện xác nhận trước khi lưu khi trạng thái khác `PENDING` (mục 11, Q2). |
| `motion/react` chưa được cài trong test env | Lỗi này đã xuất hiện khi chạy test từ gốc workspace. Chạy test từ bên trong `FE-careconnect/` để đúng Vite config và `node_modules`. |
| Test lỗi hàng loạt `TypeError: React.act is not a function` | Máy dev đang đặt biến môi trường hệ thống `NODE_ENV=production` → React bản production không có `act`. Chạy `NODE_ENV=test pnpm test` (Git Bash) hoặc `$env:NODE_ENV='test'; pnpm test` (PowerShell), hoặc gỡ biến hệ thống đó. |
---

## 10. Tiến độ (cập nhật sau mỗi lần hoàn thành)

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Backend (ProviderService, AIService, Gateway) | ✅ Hoàn thành | Test: 91 + 6 + 24 = 121 test xanh |
| OpenAPI contract (`openapi.yaml`) | ✅ Hoàn thành | `api:validate` passed |
| Entity layer (`entities/provider/certificate-*`) | ✅ Hoàn thành | ai.ts, ai-badge, files, review-dialog |
| Provider API helpers (`provider-api.ts`) | ✅ Hoàn thành | fetchPending, statistics, aiCheck, verify |
| i18n `certificate-review-resources.ts` | ✅ Hoàn thành | vi + en đầy đủ |
| i18n `admin/certificates-resources.ts` | ✅ Hoàn thành | vi + en đầy đủ |
| Admin trang hàng chờ (`admin-certificates-page.tsx`) | ✅ Hoàn thành | Stat cards, filters, table, dialog |
| Admin test cases | ✅ 3/3 | Cần bổ sung: revoke, undetermined, auto-poll |
| Center Manager xác nhận (`manager-certificates.tsx`) | ✅ Hoàn thành | 2026-11-10: lỗi 4205/4250/4251/4253/4254/4255 hiển thị đúng nghĩa |
| Sửa mã lỗi FE + plan sau review (2026-11-10) | ✅ Hoàn thành | typecheck xanh; test admin/manager/i18n 21/21 xanh (chạy với `NODE_ENV=test`) |
| Manager test cases | ❌ Chưa có | Cần tạo `manager-certificates.test.tsx` |
| Caregiver tab certificates | ✅ Hoàn thành | Grid, badge, xem ảnh, xóa |
| Caregiver form thêm chứng chỉ | ✅ Hoàn thành | Upload, drag & drop, 2 cột |
| Kiểm thử E2E thủ công trên trình duyệt | ❌ Chưa thực hiện | Cần infrastructure Docker sẵn sàng |
| Áp SQL migration (Owner) | ❌ Chưa thực hiện | `2026-11-09_certificate_ai_check.sql` |
| Cấu hình AI_GROQ_VISION_MODEL | 🟡 Đã thêm vào `.env` (2026-11-10) | `AI_GROQ_VISION_MODEL=qwen/qwen3.8-27b`; **Owner còn phải** restart `ai-service` và chạy kiểm tra đọc ảnh (mục 6.1) |
| Q1 — BE chặn xóa chứng chỉ ngoài `PENDING`/`REJECTED` + FE ẩn nút | ✅ Hoàn thành (2026-11-10) | `DELETABLE_STATUSES` → 409 `4253`; ProviderService `mvnw test` 96/96 xanh (+4 test xóa); FE ẩn nút "Xóa", báo `deleteBlocked` khi bị chặn |
| Q2 — FE sửa chứng chỉ (Caregiver) | ✅ Hoàn thành (2026-11-10) | `certificate-edit-form.tsx` + `certificate-details-fields.tsx`; ảnh dùng ngăn "Xem tệp" có sẵn (xem "Điều chỉnh khi triển khai", mục 12) |
| OpenAPI khai báo `409` cho thao tác chứng chỉ | ✅ Hoàn thành (2026-11-10) | `api:validate` + `api:generate` xanh |
| Kiểm tra FE | ✅ / ⚠️ | `pnpm typecheck` xanh; ESLint các file đã sửa xanh (`pnpm lint` toàn dự án còn 58 lỗi có sẵn ở file khác); test caregiver profile 12/12; toàn bộ `vitest` 499/501 — 2 lỗi có sẵn, không liên quan (`admin-bookings.test.tsx` hủy booking, `booking-requests-list.test.tsx` từ chối yêu cầu: không tìm thấy nhãn "Lý do") |

---

## 11. Quyết định bổ sung sau rà soát (Chủ dự án chốt 2026-11-10)

| # | Câu hỏi | Quyết định |
|---|---|---|
| Q1 | Caregiver được xóa chứng chỉ ở trạng thái nào? | **Chỉ `PENDING` hoặc `REJECTED`.** Chứng chỉ đang chờ admin (`CENTER_VERIFIED`) hoặc đã duyệt (`ADMIN_VERIFIED`) không được xóa. |
| Q2 | Có làm giao diện sửa chứng chỉ + thêm/xóa ảnh trong đợt này? | **Có.** |
| Q3 | Endpoint AI cũ `/api/v1/ai/certificate-verifications` (OCR + QR)? | **Giữ lại, không xóa**, chỉ ghi chú là chưa dùng. Luồng duyệt chỉ dùng `/certificate-checks`. |
| Q4 | Model đọc ảnh? | **`qwen/qwen3.8-27b`** (cùng model với chat). Phải xác nhận model nhận ảnh bằng bước kiểm tra ở mục 6.1. |

### 11.1. Q1 — Chặn xóa chứng chỉ ngoài `PENDING` / `REJECTED`

**BE (ProviderService)**
- `CertificateServiceImpl.delete()`: sau `checkVersion`, nếu `verificationStatus` không thuộc `{PENDING, REJECTED}` → `throw new AppException(ErrorCode.CERTIFICATE_INVALID_TRANSITION)` (409 `4253`, dùng lại mã có sẵn, không tạo mã mới).
- Test trong `CertificateServiceTests`: xóa được khi `PENDING`, `REJECTED`; bị chặn khi `CENTER_VERIFIED`, `ADMIN_VERIFIED`.
- Cập nhật `BE/docs/2026-11-09-AI_CHAT_AND_CERTIFICATE_AI_CHECK.md` (Phần B) một dòng về quy tắc xóa. OpenAPI không đổi (chỉ thêm mã lỗi 409 vào mô tả nếu có).

**FE**
- [`certificates-tab.tsx`](../app/features/caregiver/profile/components/certificates-tab.tsx): chỉ hiện nút "Xóa" khi `verificationStatus` là `PENDING` hoặc `REJECTED`. Đặt điều kiện thành helper dùng chung (ví dụ `canDeleteCertificate`) trong `entities/provider/certificate-ai.ts` hoặc cạnh tab nếu chỉ một nơi dùng.
- Lỗi xóa `4253` (đã có câu `certificateReview.errors.e4253`) → toast lỗi rõ nghĩa, rồi invalidate `providerKeys.certificates(caregiverId)`.
- Test: nút xóa ẩn với `CENTER_VERIFIED` / `ADMIN_VERIFIED`, hiện với `PENDING` / `REJECTED`.

### 11.2. Q2 — Caregiver sửa chứng chỉ và thêm / xóa ảnh

BE đã có đủ: `PUT /certificates/{id}` (kèm `version`), `POST /provider-media/CERTIFICATE/{id}`, `DELETE /provider-media/CERTIFICATE/{id}/{mediaFileId}`; cả ba đều đưa chứng chỉ về `PENDING` và xóa kết quả AI. **Không đổi OpenAPI.**

**FE — phạm vi**
- [`certificate-form.tsx`](../app/features/caregiver/profile/components/certificate-form.tsx): thêm chế độ sửa (prop chứng chỉ đang sửa).
  - Điền sẵn tên, đơn vị cấp, số, ngày cấp, ngày hết hạn; lưu qua `saveCertificate(id, { ...request, version })`.
  - Phần ảnh: hiện ảnh hiện có (`fetchProviderMedia('CERTIFICATE', id)`), cho xóa từng ảnh (`removeMedia`) và thêm ảnh mới (`uploadMedia`), tổng tối đa `MAX_CERTIFICATE_FILES = 5`.
  - Không cho xóa ảnh cuối cùng (chứng chỉ phải còn ≥ 1 ảnh, khớp điều kiện `4255` của Manager).
  - Thứ tự lưu: PUT thông tin (nếu đổi) → xóa ảnh đã bỏ → upload ảnh mới. Lỗi giữa chừng giữ form và cho thử lại như luồng tạo hiện tại.
- [`certificates-tab.tsx`](../app/features/caregiver/profile/components/certificates-tab.tsx): nút "Sửa" trên mỗi thẻ chứng chỉ, mở form ở chế độ sửa.
- Xác nhận trước khi lưu khi trạng thái khác `PENDING`: "Sửa thông tin hoặc ảnh sẽ đưa chứng chỉ về chờ trung tâm xác nhận lại" (với `ADMIN_VERIFIED`: chứng chỉ sẽ tạm không còn hiển thị là đã xác minh cho khách hàng).
- Sau khi lưu: invalidate `providerKeys.certificates(caregiverId)` và `providerKeys.media('CERTIFICATE', id)` (hoặc dùng `invalidate-provider-media.ts`).
- Lỗi: `4251` (lệch version → tải lại), `4252` (ngày hết hạn trước ngày cấp — client đã validate, map làm lưới an toàn), `4250` (chứng chỉ đã bị xóa).
- i18n vi + en trong `shared/i18n/caregiver/me-resources.ts`: tiêu đề form sửa, nút "Sửa", câu xác nhận, toast "Đã lưu — chờ trung tâm xác nhận lại", lỗi "phải còn ít nhất 1 ảnh".
- Nếu `certificate-form.tsx` vượt ~300 dòng sau khi thêm → tách phần ảnh thành component riêng trong `components/` (theo `docs/ARCHITECTURE.md`).

**FE — test**
- Sửa thông tin → gọi PUT kèm `version`, invalidate đúng key.
- Xóa ảnh / thêm ảnh → gọi đúng API; không cho xóa ảnh cuối cùng.
- Sửa chứng chỉ `CENTER_VERIFIED` / `ADMIN_VERIFIED` → hiện xác nhận trước khi lưu.
- Lỗi `4251` → thông báo tải lại.

**Kiểm tra cuối**: `pnpm typecheck`, `pnpm lint`, `pnpm test` (với `NODE_ENV=test`) xanh; E2E thủ công bước 5 và 8 ở mục 6.3.

### 11.3. Q3 — Endpoint AI cũ

Không đổi code. Ghi chú trong plan (mục 5.1, mục 9). Không ai gọi `/api/v1/ai/certificate-verifications` từ ProviderService hay FE.

### 11.4. Q4 — Model đọc ảnh

- `BE/AIService/.env`: thêm `AI_GROQ_VISION_MODEL=qwen/qwen3.8-27b` (giá trị này giống fallback hiện tại, ghi ra cho tường minh và dễ đổi sau).
- Restart `ai-service`, chạy bước kiểm tra đọc ảnh ở mục 6.1.
- Nếu model không nhận ảnh → chỉ đổi biến môi trường sang model vision khác của Groq, không sửa code.

---

## 12. Các bước triển khai (thứ tự thực hiện)

Mỗi bước làm xong, chạy kiểm tra của bước đó rồi mới sang bước sau. Không `git commit` / `git push`. Chỉ **một** phiên làm việc sửa code và file plan này trong lúc triển khai.

### Bước 0 — Chuẩn bị

- [ ] Đọc lại plan, `AGENTS.md`, `docs/ARCHITECTURE.md`, và các file sẽ sửa (có thể đã bị phiên khác đổi).
- [ ] Ghi lại kết quả test hiện tại làm mốc: `NODE_ENV=test pnpm test` trong `FE-careconnect/`, `mvnw test -Dtest=CertificateServiceTests` trong `BE/ProviderService/`.

### Bước 1 — Q4: cấu hình model đọc ảnh

- [ ] `BE/AIService/.env`: thêm `AI_GROQ_VISION_MODEL=qwen/qwen3.8-27b` ngay dưới `AI_GROQ_MODEL`.
- [ ] `BE/AIService/.env.example` giữ `AI_GROQ_VISION_MODEL=` (trống) — không đưa giá trị thật / key vào file mẫu.
- [ ] Bước kiểm tra đọc ảnh (mục 6.1) do Chủ dự án chạy khi Docker sẵn sàng.

### Bước 2 — Q1: BE chặn xóa chứng chỉ ngoài `PENDING` / `REJECTED`

- [ ] `CertificateServiceImpl.delete()`: sau `checkVersion`, nếu `verificationStatus` không thuộc `{PENDING, REJECTED}` → `AppException(ErrorCode.CERTIFICATE_INVALID_TRANSITION)` (409 `4253`). Khai báo tập trạng thái thành hằng `DELETABLE_STATUSES` cạnh các hằng hiện có.
- [ ] `CertificateServiceTests`: 4 test — xóa được khi `PENDING`, `REJECTED`; bị chặn (`4253`, không gọi `save`) khi `CENTER_VERIFIED`, `ADMIN_VERIFIED`.
- [ ] Mô tả Swagger của `DELETE /certificates/{id}` (nếu có `@Operation`): ghi "chỉ khi PENDING hoặc REJECTED".
- [ ] `BE/docs/2026-11-09-AI_CHAT_AND_CERTIFICATE_AI_CHECK.md` (Phần B, ProviderService): thêm một dòng quy tắc xóa.
- [ ] Kiểm tra: `mvnw test` trong `BE/ProviderService/` xanh.

### Bước 3 — Q1: FE chỉ cho xóa khi `PENDING` / `REJECTED`

- [ ] [`certificates-tab.tsx`](../app/features/caregiver/profile/components/certificates-tab.tsx): hàm cục bộ `canDelete(certificate)` (`PENDING` hoặc `REJECTED`); chỉ hiện nút "Xóa" khi đúng. Không đưa lên `entities/` vì chỉ tab caregiver dùng.
- [ ] Mutation xóa: lỗi `4253` → toast `certificateReview.errors.e4253` (qua `certificateReviewErrorKey`), rồi invalidate `providerKeys.certificates(caregiverId)` để thẻ cập nhật trạng thái mới; lỗi khác giữ cách báo hiện tại.
- [ ] Test (thêm vào `features/caregiver/profile/__tests__/`): nút xóa hiện với `PENDING` / `REJECTED`, ẩn với `CENTER_VERIFIED` / `ADMIN_VERIFIED`.
- [ ] Kiểm tra: `pnpm typecheck`, test caregiver profile xanh.

### Bước 4 — Q2: tách phần chọn ảnh khỏi `certificate-form.tsx` (không đổi hành vi)

`certificate-form.tsx` đã 345 dòng (> 300, theo `ARCHITECTURE.md` phải tách) — tách trước khi thêm chế độ sửa.

- [ ] Tạo `features/caregiver/profile/components/certificate-file-picker.tsx`: vùng kéo-thả + nút chọn file + lưới xem trước + thông báo lỗi file (`type` / `size` / `count`), nhận `files`, `onChange`, `max`, `disabled`, `showRequired`.
- [ ] `certificate-form.tsx` dùng component mới; hành vi tạo chứng chỉ giữ nguyên.
- [ ] Kiểm tra: test caregiver profile hiện có vẫn xanh (đây là refactor thuần).

### Bước 5 — Q2: chế độ sửa trong `CertificateForm`

- [ ] Prop mới `certificate?: ProviderCertificateRecord`. Có → chế độ sửa: tiêu đề / nút đổi theo chế độ, điền sẵn tên, đơn vị cấp, số, ngày cấp, ngày hết hạn.
- [ ] Ảnh hiện có: `useQuery({ queryKey: providerKeys.media('CERTIFICATE', id), queryFn: () => fetchProviderMedia('CERTIFICATE', id) })`. Hiện cùng lưới với ảnh mới; mỗi ảnh hiện có có nút "Bỏ ảnh" — **chỉ đánh dấu**, chưa gọi API (bấm Hủy thì không mất gì).
- [ ] Ràng buộc: (ảnh hiện có còn giữ + ảnh mới) trong khoảng 1–5. Bỏ ảnh cuối cùng → báo dưới vùng ảnh "phải còn ít nhất 1 ảnh", không cho lưu.
- [ ] Lưu theo thứ tự, mỗi bước chỉ chạy khi có thay đổi:
  1. Thông tin đổi → `saveCertificate(id, { ...request, version: certificate.version })`.
  2. Xóa từng ảnh đã đánh dấu → `removeMedia('CERTIFICATE', id, mediaFileId)`.
  3. Upload ảnh mới → `uploadMedia('CERTIFICATE', id, files)`.
  - Lỗi giữa chừng: giữ form và nhớ bước đã xong (giống `createdId` của luồng tạo), bấm "Thử lại" chỉ chạy các bước còn lại. Không gửi lại PUT đã thành công (version đã tăng).
  - Không có thay đổi nào → nút lưu disabled.
- [ ] Sau khi lưu (cả khi lỗi giữa chừng): invalidate `providerKeys.certificates(caregiverId)` và `providerKeys.media('CERTIFICATE', id)` (dùng `invalidate-provider-media.ts` nếu phù hợp).
- [ ] Lỗi: `4251` → "Chứng chỉ vừa được cập nhật, hãy tải lại" + invalidate; `4250` → "Chứng chỉ không còn tồn tại" + đóng form; `4252` → lưới an toàn cho validate ngày phía client; còn lại → `apiRequestErrorKey` như hiện tại.
- [ ] Kiểm tra: `certificate-form.tsx` sau khi sửa ≤ ~300 dòng; nếu vượt, tách logic lưu thành hook `hooks/use-certificate-save.ts`.

### Bước 6 — Q2: nút "Sửa" và xác nhận trên tab chứng chỉ

- [ ] [`certificates-tab.tsx`](../app/features/caregiver/profile/components/certificates-tab.tsx): nút "Sửa" trên mỗi thẻ (mọi trạng thái), mở `CertificateForm` với `certificate`.
- [ ] Trạng thái khác `PENDING`: form hiện ghi chú cố định ở đầu ("Lưu thay đổi sẽ đưa chứng chỉ về chờ trung tâm xác nhận lại"; `ADMIN_VERIFIED` thêm "và tạm không hiển thị là đã xác minh với khách hàng"), và bấm lưu mở `ConfirmDialog` (`shared/ui/modal`) trước khi gửi.
- [ ] Toast thành công: "Đã lưu — chứng chỉ chờ trung tâm xác nhận lại" (hoặc "Đã lưu" nếu đang `PENDING`).

### Bước 7 — i18n

- [ ] `shared/i18n/caregiver/me-resources.ts` (vi + en cùng lúc, cùng cấu trúc key) dưới `caregiver.me.certificates`: `edit` (nút), `form.editTitle`, `form.saveChanges`, `form.removeFile`, `form.keepOneFile`, `form.noChanges` (nếu cần), `form.resetNotice`, `form.resetNoticeVerified`, `form.confirmTitle`, `form.confirmDescription`, `form.updated`, `form.updatedReset`.
- [ ] Không hardcode chuỗi trong JSX (ESLint `project/no-hardcoded-ui-text`).

### Bước 8 — Test FE cho Q2

- [ ] Sửa thông tin → gọi `updateProviderCertificate` với `version`; invalidate đúng key.
- [ ] Bỏ 1 ảnh + thêm 1 ảnh → gọi `removeMedia` rồi `uploadMedia`; không gọi PUT khi thông tin không đổi.
- [ ] Bỏ ảnh cuối cùng → báo lỗi, không cho lưu.
- [ ] Chứng chỉ `CENTER_VERIFIED` / `ADMIN_VERIFIED` → hiện ghi chú + `ConfirmDialog` trước khi gửi.
- [ ] Upload lỗi sau khi PUT thành công → "Thử lại" không gọi lại PUT.
- [ ] Lỗi `4251` → thông báo tải lại.

### Bước 9 — Kiểm tra toàn bộ

- [ ] `FE-careconnect/`: `pnpm typecheck`, `pnpm lint`, `NODE_ENV=test pnpm test` (máy dev đang đặt `NODE_ENV=production`, xem mục 9) — tất cả xanh.
- [ ] `BE/ProviderService/`: `mvnw test` xanh.
- [ ] OpenAPI không đổi → không cần `pnpm api:generate`; nếu có đổi mô tả Swagger thì vẫn không ảnh hưởng type sinh ra.

### Bước 10 — Cập nhật tài liệu

- [ ] Plan này: mục 10 (tiến độ) đánh dấu Q1, Q2, Q4; ghi số test thực tế.
- [ ] `docs/ARCHITECTURE.md` (đoạn `/caregiver/profile` và đoạn "Certificate review"): caregiver sửa được chứng chỉ và ảnh; chỉ xóa khi `PENDING` / `REJECTED`; sửa đưa chứng chỉ về chờ trung tâm.
- [ ] Báo lại cho Chủ dự án: việc đã làm, kết quả test chính xác, việc còn lại (áp SQL, đăng ký client `ai`, kiểm tra model đọc ảnh, E2E mục 6.3).

### Điều chỉnh khi triển khai (2026-11-10)

Phát hiện khi đọc code trước khi làm Bước 4–6:

- Tab chứng chỉ của caregiver **đã có** quản lý ảnh: nút "Xem tệp" mở `ProviderMediaPanel` (tải lên / xóa ảnh, sau đó `invalidateOwnerMedia` làm mới cả danh sách chứng chỉ và hàng chờ admin). Theo yêu cầu "phần đã có giao diện thì không làm lại", **không** dựng lại phần ảnh trong form sửa:
  - Bước 4 đổi thành: tách **các ô thông tin** (tên, nơi cấp, số, 2 ngày) ra `certificate-details-fields.tsx`, dùng chung cho form thêm và form sửa (form thêm giữ nguyên hành vi, còn ~270 dòng).
  - Bước 5 đổi thành: form sửa riêng `certificate-edit-form.tsx` (1 cột, `Modal` size `lg`) chỉ sửa thông tin qua `PUT` kèm `version`; hiển thị số ảnh đang có và nút "Quản lý ảnh" mở đúng ngăn "Xem tệp" có sẵn. Không còn luồng lưu nhiều bước (PUT → xóa ảnh → upload).
  - Ràng buộc "không xóa ảnh cuối cùng" **không làm** (nằm trong `ProviderMediaPanel` dùng chung, không sửa giao diện có sẵn). Thay vào đó form sửa báo đỏ "Chưa có ảnh — trung tâm chỉ xác nhận được chứng chỉ có ít nhất một ảnh"; Manager vẫn được chặn bởi `4255`.
  - Ngăn "Xem tệp" thêm ghi chú (khi chứng chỉ khác `PENDING`): thêm / xóa ảnh sẽ đưa chứng chỉ về chờ trung tâm duyệt lại.
- Test xóa BE đặt trong `CertificateAiCheckTests` (đã có sẵn fixture chứng chỉ + trung tâm) thay vì `CertificateServiceTests`.
- OpenAPI: các thao tác chứng chỉ trả 409 nhưng chưa khai báo → thêm `'409'` cho `updateProviderCertificate`, `archiveProviderCertificate`, `verifyProviderCertificate`, `verifyProviderCertificateByCenter`, `startProviderCertificateAiCheck`; chạy `pnpm api:validate` + `pnpm api:generate`. Mọi endpoint của luồng (list / create / update / delete / center-verification / verification / pending-audit / statistics / ai-check / provider-media GET-POST-DELETE) **đã có sẵn** trong OpenAPI và đã được FE dùng.
- Manager và Admin: rà soát lại, các nút của luồng đã hoạt động đủ (Manager xác nhận / từ chối kèm lý do, hiển thị trạng thái AI; Admin hàng chờ + thống kê + lọc, dialog duyệt / từ chối / thu hồi / chạy lại AI, mở từ `/admin/certificates` và `/admin/centers/:id/caregivers`). Không sửa giao diện hai role này.

### Ngoài phạm vi đợt này

- Không xóa endpoint `/certificate-verifications` (Q3).
- Không đổi luồng Manager / Admin ngoài các mục đã ghi.
- Không tạo mã lỗi BE mới, không đổi schema DB.
