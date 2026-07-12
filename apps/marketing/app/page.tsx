import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <h1 className="text-lg font-semibold">TransitOps</h1>
        <nav className="flex gap-6 text-sm text-[#555]">
          <Link href="/login" className="hover:text-[#111]">Sign in</Link>
          <Link href="/register" className="hover:text-[#111]">Get started</Link>
          <a href="http://localhost:8000/docs" className="hover:text-[#111]">API</a>
        </nav>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-8 py-8 text-center">
        <h2 className="mb-2 text-5xl font-bold">Full-stack monorepo</h2>
        <p className="mb-8 text-lg text-[#666]">Next.js + FastAPI. Bun + uv. Turborepo.</p>
        <div className="flex gap-4">
          <Link href="/register" className="rounded-lg bg-[#111] px-6 py-3 font-medium text-white no-underline">Get started</Link>
          <Link href="/login" className="rounded-lg border border-[#ddd] bg-transparent px-6 py-3 font-medium text-[#111] no-underline">Sign in</Link>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-[#888]">
        <span>Next.js 16 · FastAPI · Turborepo</span>
      </footer>
    </div>
  );
}
