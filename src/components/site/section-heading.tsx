// Heading section kiểu trang công thức: chữ thường màu đen, phần nhấn màu đỏ
// đậm (weight 900), canh giữa.
export function SectionHeading({
  normal,
  strong,
  id,
}: {
  normal: string;
  strong: string;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className="mb-8 text-center text-3xl font-extrabold text-ink sm:text-4xl lg:text-5xl"
    >
      {normal} <strong className="font-extrabold text-brand">{strong}</strong>
    </h2>
  );
}
