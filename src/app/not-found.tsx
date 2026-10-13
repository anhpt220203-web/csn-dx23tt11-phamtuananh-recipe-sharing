import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center bg-white px-4 py-20">
      <div className="max-w-md text-center">
        <p className="text-6xl" aria-hidden>
          🍳
        </p>
        <h1 className="mt-4 text-3xl font-extrabold text-zinc-800">
          Không tìm thấy trang
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          Công thức hoặc danh mục bạn tìm có thể đã bị xoá, hoặc đường dẫn
          không đúng.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            Về trang chủ
          </Link>
          <Link
            href="/cong-thuc"
            className="rounded-full border-2 border-brand px-5 py-2.5 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
          >
            Xem tất cả công thức
          </Link>
        </div>
      </div>
    </div>
  );
}
