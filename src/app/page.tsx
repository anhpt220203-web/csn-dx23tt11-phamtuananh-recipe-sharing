export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-4">
          Website Quản lý &amp; Chia sẻ Công thức Nấu Ăn
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center max-w-md">
          Khám phá và chia sẻ các công thức nấu ăn ngon miệng theo nhóm món ăn.
        </p>
      </main>
    </div>
  );
}
