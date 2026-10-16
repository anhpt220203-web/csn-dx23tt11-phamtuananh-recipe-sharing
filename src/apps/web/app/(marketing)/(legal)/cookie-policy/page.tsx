import { SitePageHeader } from '~/(marketing)/_components/site-page-header';

export const metadata = {
  title: 'Chính sách cookie',
};

const SECTIONS: Array<{ heading: string; body: string[]; list?: string[] }> = [
  {
    heading: '1. Cookie là gì?',
    body: [
      'Cookie là các tệp văn bản nhỏ được trình duyệt lưu trên thiết bị của bạn khi truy cập website. Cookie giúp website ghi nhớ trạng thái và tùy chọn của bạn, mang lại trải nghiệm mượt mà hơn ở những lần truy cập sau.',
    ],
  },
  {
    heading: '2. Các loại cookie chúng tôi sử dụng',
    body: [
      'Công thức món ngon sử dụng các nhóm cookie sau:',
    ],
    list: [
      'Cookie cần thiết: duy trì phiên đăng nhập, bảo mật (chống giả mạo yêu cầu), ghi nhớ lựa chọn đồng ý cookie của bạn. Nhóm này bắt buộc để website hoạt động.',
      'Cookie tùy chọn giao diện: ghi nhớ chế độ sáng/tối bạn đã chọn.',
      'Cookie phân tích (nếu có): thống kê ẩn danh về lượt truy cập để cải thiện nội dung. Chỉ bật khi bạn đồng ý.',
    ],
  },
  {
    heading: '3. Quản lý cookie',
    body: [
      'Bạn có thể quản lý cookie theo các cách sau:',
    ],
    list: [
      'Chọn "Từ chối" trên banner cookie khi truy cập website — chúng tôi chỉ dùng cookie cần thiết.',
      'Xóa cookie bất cứ lúc nào trong phần cài đặt của trình duyệt (thao tác này sẽ đăng xuất bạn khỏi tài khoản).',
      'Chặn cookie của bên thứ ba trong cài đặt trình duyệt nếu muốn.',
    ],
  },
  {
    heading: '4. Thời gian lưu trữ',
    body: [
      'Cookie phiên đăng nhập tồn tại trong suốt phiên làm việc của bạn và tự hết hạn khi bạn đăng xuất hoặc sau một thời gian không hoạt động. Lựa chọn đồng ý/từ chối cookie được lưu trên thiết bị của bạn cho đến khi bạn xóa dữ liệu trình duyệt.',
    ],
  },
  {
    heading: '5. Liên hệ',
    body: [
      'Mọi thắc mắc về chính sách cookie, vui lòng liên hệ qua trang Hỏi đáp hoặc email hỗ trợ được công bố trên website.',
    ],
  },
];

function CookiePolicyPage() {
  return (
    <div>
      <SitePageHeader
        title={'Chính sách cookie'}
        subtitle={
          'Cách chúng tôi sử dụng cookie trên website. Cập nhật lần cuối: tháng 10/2026.'
        }
      />

      <div className={'container mx-auto max-w-3xl py-8'}>
        <div className={'space-y-8'}>
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2
                className={'font-heading mb-3 text-xl font-medium tracking-tight'}
              >
                {section.heading}
              </h2>

              {section.body.map((paragraph, index) => (
                <p
                  key={index}
                  className={'text-muted-foreground mb-3 leading-relaxed'}
                >
                  {paragraph}
                </p>
              ))}

              {section.list && (
                <ul
                  className={
                    'text-muted-foreground list-disc space-y-2 pl-6 leading-relaxed'
                  }
                >
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CookiePolicyPage;
