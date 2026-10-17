import { SitePageHeader } from '~/(marketing)/_components/site-page-header';

export const metadata = {
  title: 'Điều khoản dịch vụ',
};

const SECTIONS: Array<{ heading: string; body: string[]; list?: string[] }> = [
  {
    heading: '1. Giới thiệu',
    body: [
      'Chào mừng bạn đến với Công thức món ngon — website chia sẻ công thức nấu ăn Việt Nam. Bằng việc truy cập và sử dụng website, bạn đồng ý tuân thủ các điều khoản dưới đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng dịch vụ.',
      'Chúng tôi có thể cập nhật điều khoản này theo thời gian. Phiên bản mới nhất luôn được đăng tại trang này và có hiệu lực ngay khi đăng tải.',
    ],
  },
  {
    heading: '2. Tài khoản người dùng',
    body: [
      'Để sử dụng đầy đủ tính năng (lưu món yêu thích, đánh giá công thức, đặt câu hỏi), bạn cần đăng ký tài khoản bằng địa chỉ email hợp lệ.',
    ],
    list: [
      'Bạn chịu trách nhiệm bảo mật mật khẩu và mọi hoạt động diễn ra dưới tài khoản của mình.',
      'Mỗi người chỉ được sở hữu một tài khoản. Nghiêm cấm chia sẻ, mua bán hoặc chuyển nhượng tài khoản.',
      'Chúng tôi có quyền khóa hoặc xóa tài khoản vi phạm điều khoản mà không cần báo trước.',
    ],
  },
  {
    heading: '3. Quy tắc đăng nội dung',
    body: [
      'Khi đánh giá, bình luận hoặc đặt câu hỏi trên website, bạn cam kết:',
    ],
    list: [
      'Nội dung trung thực, lịch sự, không chứa ngôn từ thô tục, xúc phạm hay kích động.',
      'Không đăng nội dung vi phạm pháp luật, xâm phạm quyền riêng tư hoặc quyền sở hữu trí tuệ của người khác.',
      'Không spam, quảng cáo hoặc đăng liên kết độc hại.',
      'Không giả mạo danh tính người khác.',
    ],
  },
  {
    heading: '4. Quyền sở hữu nội dung',
    body: [
      'Toàn bộ công thức, hình ảnh, bài viết và thiết kế trên website thuộc quyền sở hữu của Công thức món ngon hoặc các đối tác cung cấp nội dung, trừ khi có ghi chú khác.',
      'Bạn được phép xem, lưu trữ cá nhân và chia sẻ liên kết tới các công thức cho mục đích phi thương mại. Mọi hình thức sao chép, tái bản vì mục đích thương mại đều cần được sự đồng ý bằng văn bản của chúng tôi.',
      'Khi bạn đăng đánh giá hoặc bình luận, bạn cấp cho chúng tôi quyền sử dụng, hiển thị nội dung đó trên website.',
    ],
  },
  {
    heading: '5. Giới hạn trách nhiệm',
    body: [
      'Các công thức trên website được cung cấp với mục đích tham khảo. Kết quả món ăn có thể khác nhau tùy nguyên liệu, dụng cụ và kỹ năng của mỗi người.',
      'Chúng tôi không chịu trách nhiệm về dị ứng thực phẩm, sự cố sức khỏe hay thiệt hại phát sinh từ việc áp dụng công thức. Nếu bạn có vấn đề về sức khỏe hoặc dị ứng, hãy tham khảo ý kiến chuyên gia trước khi thực hiện.',
      'Website được cung cấp "nguyên trạng". Chúng tôi nỗ lực duy trì hoạt động ổn định nhưng không cam kết dịch vụ không bao giờ gián đoạn.',
    ],
  },
  {
    heading: '6. Thay đổi điều khoản',
    body: [
      'Chúng tôi có thể sửa đổi điều khoản dịch vụ bất cứ lúc nào. Thay đổi quan trọng sẽ được thông báo trên website. Việc bạn tiếp tục sử dụng dịch vụ sau khi điều khoản thay đổi đồng nghĩa với việc bạn chấp nhận điều khoản mới.',
    ],
  },
  {
    heading: '7. Liên hệ',
    body: [
      'Mọi thắc mắc về điều khoản dịch vụ, vui lòng liên hệ với chúng tôi qua trang Hỏi đáp hoặc email hỗ trợ được công bố trên website.',
    ],
  },
];

function TermsOfServicePage() {
  return (
    <div>
      <SitePageHeader
        title={'Điều khoản dịch vụ'}
        subtitle={
          'Quy định khi sử dụng website Công thức món ngon. Cập nhật lần cuối: tháng 10/2026.'
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

export default TermsOfServicePage;
