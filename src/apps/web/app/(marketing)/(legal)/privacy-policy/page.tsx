import { SitePageHeader } from '~/(marketing)/_components/site-page-header';

export const metadata = {
  title: 'Chính sách bảo mật',
};

const SECTIONS: Array<{ heading: string; body: string[]; list?: string[] }> = [
  {
    heading: '1. Giới thiệu',
    body: [
      'Công thức món ngon tôn trọng quyền riêng tư của bạn. Chính sách này giải thích chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn như thế nào khi bạn sử dụng website.',
    ],
  },
  {
    heading: '2. Dữ liệu chúng tôi thu thập',
    body: ['Khi bạn sử dụng website, chúng tôi có thể thu thập:'],
    list: [
      'Thông tin tài khoản: địa chỉ email, họ tên bạn cung cấp khi đăng ký.',
      'Hoạt động trên website: món ăn yêu thích bạn đã lưu, đánh giá và bình luận bạn đã đăng, câu hỏi bạn đã đặt.',
      'Dữ liệu kỹ thuật: loại trình duyệt, thiết bị, địa chỉ IP — phục vụ bảo mật và cải thiện trải nghiệm.',
    ],
  },
  {
    heading: '3. Mục đích sử dụng dữ liệu',
    body: ['Dữ liệu của bạn được dùng để:'],
    list: [
      'Cung cấp và duy trì dịch vụ: đăng nhập, lưu món yêu thích, hiển thị đánh giá của bạn.',
      'Cá nhân hóa trải nghiệm: gợi ý công thức phù hợp với sở thích.',
      'Bảo mật: phát hiện và ngăn chặn hành vi gian lận, lạm dụng.',
      'Liên lạc: gửi thông báo quan trọng về tài khoản hoặc thay đổi chính sách.',
    ],
  },
  {
    heading: '4. Chia sẻ dữ liệu',
    body: [
      'Chúng tôi không bán, cho thuê hay chia sẻ dữ liệu cá nhân của bạn cho bên thứ ba vì mục đích quảng cáo.',
      'Dữ liệu được lưu trữ trên hạ tầng Supabase (PostgreSQL) với các biện pháp bảo mật tiêu chuẩn ngành. Một số dữ liệu kỹ thuật ẩn danh có thể được dùng cho thống kê tổng hợp.',
      'Chúng tôi chỉ tiết lộ dữ liệu khi có yêu cầu hợp pháp từ cơ quan nhà nước có thẩm quyền.',
    ],
  },
  {
    heading: '5. Bảo mật dữ liệu',
    body: [
      'Mật khẩu của bạn được mã hóa một chiều (hash) và không ai — kể cả chúng tôi — có thể đọc được mật khẩu gốc.',
      'Truy cập dữ liệu được kiểm soát chặt chẽ bằng Row Level Security (RLS): mỗi người dùng chỉ xem và sửa được dữ liệu của chính mình; chỉ quản trị viên mới có quyền quản trị nội dung.',
      'Mọi kết nối tới website đều được mã hóa qua HTTPS.',
    ],
  },
  {
    heading: '6. Quyền của bạn',
    body: ['Bạn có quyền:'],
    list: [
      'Xem và chỉnh sửa thông tin cá nhân trong trang Hồ sơ.',
      'Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan bất cứ lúc nào.',
      'Rút lại sự đồng ý sử dụng cookie không cần thiết (xem Chính sách cookie).',
    ],
  },
  {
    heading: '7. Lưu trữ dữ liệu',
    body: [
      'Dữ liệu tài khoản được lưu giữ trong suốt thời gian bạn sử dụng dịch vụ. Khi bạn xóa tài khoản, dữ liệu cá nhân sẽ bị xóa khỏi hệ thống, trừ các bản sao lưu kỹ thuật được xóa theo chu kỳ.',
    ],
  },
  {
    heading: '8. Liên hệ',
    body: [
      'Mọi câu hỏi về chính sách bảo mật hoặc yêu cầu liên quan đến dữ liệu cá nhân, vui lòng liên hệ qua trang Hỏi đáp hoặc email hỗ trợ được công bố trên website.',
    ],
  },
];

function PrivacyPolicyPage() {
  return (
    <div>
      <SitePageHeader
        title={'Chính sách bảo mật'}
        subtitle={
          'Cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn. Cập nhật lần cuối: tháng 10/2026.'
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

export default PrivacyPolicyPage;
