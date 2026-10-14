# Feature Specification: Đăng nhập và quản lý tài khoản

**Feature Branch**: `002-auth-account-admin`

**Created**: 2026-10-13

**Status**: Draft

**Input**: User description: "thêm tính năng đăng nhập, đăng ký tài khoản, thêm trang admin quản lý tài khoản, có tài khoản demo admin, tài khoản demo user"

## Clarifications

### Session 2026-10-13

- Q: Khi quản trị viên khóa tài khoản, các phiên đăng nhập đang mở của tài khoản đó nên bị chấm dứt ngay hay chỉ bị từ chối ở lần đăng nhập tiếp theo? → A: Thu hồi các phiên hiện có ngay khi khóa tài khoản.
- Q: Mật khẩu mới cần có độ dài tối thiểu bao nhiêu ký tự? → A: Tối thiểu 8 ký tự.

## User Scenarios & Testing

### User Story 1 - Đăng ký và đăng nhập (Priority: P1)

Khách truy cập có thể tạo tài khoản bằng email, tên hiển thị và mật khẩu, sau đó đăng nhập để sử dụng các chức năng dành cho người dùng. Hệ thống phản hồi rõ ràng khi thông tin không hợp lệ hoặc email đã được đăng ký.

**Why this priority**: Tài khoản là nền tảng để nhận diện người dùng và bảo vệ các chức năng cần đăng nhập.

**Independent Test**: Đăng ký một tài khoản mới, đăng xuất, đăng nhập lại bằng thông tin đó và xác nhận phiên truy cập được thiết lập đúng.

**Acceptance Scenarios**:

1. **Given** email chưa được sử dụng và thông tin hợp lệ, **When** khách gửi biểu mẫu đăng ký, **Then** hệ thống tạo tài khoản thường và thông báo đăng ký thành công.
2. **Given** email đã tồn tại, **When** khách gửi biểu mẫu đăng ký, **Then** hệ thống từ chối tạo tài khoản trùng và hiển thị thông báo tiếng Việt dễ hiểu.
3. **Given** tài khoản đang hoạt động, **When** người dùng nhập đúng email và mật khẩu, **Then** hệ thống đăng nhập và hiển thị trạng thái đã đăng nhập.
4. **Given** thông tin đăng nhập sai hoặc tài khoản bị vô hiệu hóa, **When** người dùng đăng nhập, **Then** hệ thống từ chối truy cập và hiển thị thông báo phù hợp.
5. **Given** người dùng đã đăng nhập, **When** họ chọn đăng xuất, **Then** phiên đăng nhập kết thúc và các trang cần xác thực không còn truy cập được.
6. **Given** khách nhập mật khẩu ngắn hơn 8 ký tự, **When** gửi biểu mẫu đăng ký, **Then** hệ thống từ chối tạo tài khoản và thông báo yêu cầu độ dài tối thiểu.

---

### User Story 2 - Quản trị tài khoản (Priority: P2)

Quản trị viên có thể mở trang quản lý tài khoản để xem danh sách, tìm theo email/tên, xem vai trò và trạng thái, rồi khóa hoặc mở khóa tài khoản người dùng. Người dùng thường không thể xem hay thao tác trên trang này.

**Why this priority**: Quản trị viên cần kiểm soát tài khoản không còn phù hợp mà không xóa mất lịch sử gắn với tài khoản đó.

**Independent Test**: Đăng nhập bằng tài khoản quản trị demo, tìm một tài khoản, khóa tài khoản đó và xác nhận tài khoản bị từ chối đăng nhập; sau đó mở khóa và xác nhận có thể đăng nhập lại.

**Acceptance Scenarios**:

1. **Given** quản trị viên đã đăng nhập, **When** mở trang quản lý tài khoản, **Then** danh sách hiển thị email, tên, vai trò và trạng thái của từng tài khoản.
2. **Given** danh sách tài khoản, **When** quản trị viên tìm bằng email hoặc tên, **Then** chỉ các tài khoản phù hợp được hiển thị.
3. **Given** một tài khoản thường đang hoạt động và có thể có phiên đăng nhập trên nhiều thiết bị, **When** quản trị viên khóa tài khoản, **Then** trạng thái được cập nhật ngay, mọi phiên hiện có bị chấm dứt và tài khoản không thể đăng nhập.
4. **Given** một tài khoản bị khóa, **When** quản trị viên mở khóa, **Then** tài khoản có thể đăng nhập trở lại.
5. **Given** người dùng thường hoặc khách truy cập, **When** họ mở trang hoặc gửi thao tác quản trị tài khoản, **Then** hệ thống từ chối và không tiết lộ dữ liệu tài khoản.
6. **Given** quản trị viên đang thao tác trên tài khoản quản trị cuối cùng còn hoạt động, **When** họ cố khóa tài khoản đó, **Then** hệ thống từ chối để luôn còn ít nhất một quản trị viên hoạt động.

---

### User Story 3 - Dùng tài khoản demo (Priority: P3)

Người xem demo có thể dùng tài khoản mẫu quản trị viên hoặc người dùng thường để kiểm tra trải nghiệm của từng vai trò.

**Why this priority**: Hai vai trò demo cho phép kiểm chứng nhanh quyền truy cập và chức năng quản trị khi trình bày đồ án.

**Independent Test**: Dùng thông tin demo được cung cấp để đăng nhập bằng từng vai trò; xác nhận quản trị viên truy cập được trang quản lý, còn người dùng thường thì không.

**Acceptance Scenarios**:

1. **Given** dữ liệu demo đã được chuẩn bị, **When** người xem dùng thông tin tài khoản demo quản trị viên, **Then** họ đăng nhập thành công và dùng được chức năng quản lý tài khoản.
2. **Given** dữ liệu demo đã được chuẩn bị, **When** người xem dùng thông tin tài khoản demo người dùng, **Then** họ đăng nhập thành công với quyền người dùng thường và không truy cập được chức năng quản trị.
3. **Given** thông tin demo được hiển thị hoặc cung cấp cho người xem, **When** họ làm theo hướng dẫn, **Then** email và mật khẩu mẫu dùng được và thông tin không chứa bí mật môi trường hay dữ liệu thật.

### Edge Cases

- Email được nhập khác chữ hoa/thường nhưng thuộc cùng một địa chỉ đã đăng ký phải được xem là trùng.
- Biểu mẫu thiếu trường bắt buộc, email không hợp lệ hoặc mật khẩu ngắn hơn 8 ký tự phải được báo lỗi tại trường tương ứng; không tạo tài khoản một phần.
- Khi tài khoản bị khóa, mọi phiên đăng nhập hiện có phải bị chấm dứt ngay; tài khoản không thể tiếp tục dùng chức năng cần xác thực trên bất kỳ thiết bị nào.
- Khi không tìm thấy kết quả hoặc danh sách rỗng, trang quản trị hiển thị trạng thái rỗng dễ hiểu.
- Người dùng không thể tự nâng vai trò của mình bằng dữ liệu gửi từ giao diện.
- Nếu thao tác khóa/mở khóa thất bại, trạng thái hiển thị phải phản ánh dữ liệu đã lưu và có thông báo để thử lại.

## Requirements

### Functional Requirements

- **FR-001 (FR4)**: Hệ thống MUST cho phép khách đăng ký tài khoản người dùng thường bằng tên hiển thị, email hợp lệ và mật khẩu dài ít nhất 8 ký tự. Biểu mẫu MUST thông báo rõ yêu cầu này.
- **FR-002 (FR4)**: Hệ thống MUST bảo đảm email duy nhất, không phân biệt chữ hoa/thường, và từ chối đăng ký khi email đã tồn tại.
- **FR-003 (FR4)**: Hệ thống MUST cho phép tài khoản đang hoạt động đăng nhập và đăng xuất bằng email và mật khẩu.
- **FR-004 (FR4, NFR2)**: Hệ thống MUST từ chối truy cập được xác thực cho thông tin đăng nhập sai hoặc tài khoản bị khóa, đồng thời chấm dứt ngay mọi phiên hiện có khi tài khoản bị khóa; mật khẩu MUST không được lưu dưới dạng văn bản có thể đọc trực tiếp.
- **FR-005 (FR4)**: Hệ thống MUST cung cấp thông báo và nhãn giao diện bằng tiếng Việt cho đăng ký, đăng nhập, đăng xuất, lỗi xác thực và trạng thái tài khoản.
- **FR-006 (FR7 mở rộng)**: Hệ thống MUST cung cấp trang quản lý tài khoản cho quản trị viên, gồm danh sách tài khoản và thông tin email, tên hiển thị, vai trò, trạng thái.
- **FR-007 (FR7 mở rộng)**: Hệ thống MUST cho phép quản trị viên tìm tài khoản theo email hoặc tên, khóa tài khoản thường và mở khóa tài khoản bị khóa.
- **FR-008 (FR7 mở rộng, NFR2)**: Hệ thống MUST xác minh phiên đăng nhập và vai trò quản trị ở phía máy chủ cho mọi thao tác đọc/ghi quản trị; giao diện ẩn nút hoặc chặn điều hướng không được xem là biện pháp bảo vệ duy nhất.
- **FR-009 (FR7 mở rộng)**: Hệ thống MUST ngăn khóa tài khoản quản trị viên hoạt động cuối cùng và MUST ngăn người dùng thường tự thay đổi vai trò.
- **FR-010 (NFR5)**: Dữ liệu demo MUST có tối thiểu một tài khoản quản trị viên và một tài khoản người dùng thường; tổng số tài khoản demo vẫn đáp ứng yêu cầu dự án tối thiểu năm tài khoản.
- **FR-011 (NFR5)**: Tài khoản demo MUST có thông tin đăng nhập dùng được cho trình diễn, được cung cấp cùng hướng dẫn demo, và không được dùng làm thông tin xác thực cho môi trường sản xuất.
- **FR-012 (NFR3)**: Các màn hình đăng ký, đăng nhập và quản lý tài khoản MUST hiển thị tốt từ chiều rộng 375px và toàn bộ nội dung giao diện MUST bằng tiếng Việt.

### Key Entities

- **Tài khoản**: Danh tính người dùng gồm tên hiển thị, email duy nhất, thông tin xác thực không thể đọc trực tiếp, vai trò (quản trị viên hoặc người dùng thường) và trạng thái (hoạt động hoặc bị khóa).
- **Phiên đăng nhập**: Trạng thái xác thực gắn với một tài khoản; kết thúc khi người dùng đăng xuất hoặc tài khoản bị khóa.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Ít nhất 95% người dùng thử hoàn thành đăng ký hợp lệ và đăng nhập trong lần thử đầu tiên.
- **SC-002**: Người dùng hoàn thành đăng ký hoặc đăng nhập trong vòng 2 phút khi cung cấp thông tin hợp lệ.
- **SC-003**: 100% thử nghiệm truy cập trang và thao tác quản trị bằng khách hoặc tài khoản thường bị từ chối.
- **SC-004**: Tài khoản demo quản trị và demo người dùng đều đăng nhập thành công; quyền hai vai trò được phân biệt trong toàn bộ kịch bản demo.
- **SC-005**: Sau khi quản trị viên khóa một tài khoản, mọi phiên hiện có bị chấm dứt ngay và tài khoản không thể bắt đầu phiên mới; sau khi mở khóa, có thể đăng nhập lại.
- **SC-006**: Các luồng chính đăng ký, đăng nhập và quản lý tài khoản hoàn thành được trên màn hình rộng 375px mà không cuộn ngang.

## Assumptions

- SRS nguồn hiện có tại tmp/spec-recipe-website.md; nội dung FR4, mở rộng FR7 về quản lý tài khoản và phân vai demo NFR5 đã được đồng bộ vào thesis/doc/SRS.md theo chỉ đạo chủ dự án.
- Đăng ký công khai chỉ tạo vai trò người dùng thường; chỉ quản trị viên hiện hữu mới có quyền khóa hoặc mở khóa tài khoản.
- Quản trị tài khoản trong phạm vi này gồm xem, tìm kiếm, khóa và mở khóa; không xóa tài khoản, đổi email, đặt lại mật khẩu hoặc thay đổi vai trò.
- Tài khoản demo được dành riêng cho môi trường trình diễn và không được dùng làm thông tin đăng nhập sản xuất.
- Tính năng hồ sơ, khôi phục mật khẩu, xác minh email, đăng nhập mạng xã hội và giới hạn tốc độ chống thử mật khẩu nằm ngoài phạm vi feature này.
- Các nguyên tắc bảo mật server-side, bảo vệ mật khẩu, giao diện tiếng Việt và mobile-first trong Constitution tiếp tục áp dụng.
