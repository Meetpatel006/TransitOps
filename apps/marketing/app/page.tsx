import Link from "next/link";
import { ArrowRight, Activity, ShieldCheck, Map } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white selection:bg-neutral-900 selection:text-white">
      <header className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-white">
            <Activity className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900">TransitOps</span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium text-neutral-500">
          <div className="flex items-center gap-3">
            <Link href="/login" className="hover:text-neutral-900 transition-colors">Sign in</Link>
            <Link href="/register" className="rounded-full bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800 transition-colors">
              Get started
            </Link>
          </div>
        </nav>
      </header>
      
      <main className="flex flex-1 flex-col">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
            Smart Transport Operations Platform
          </div>
          
          <h1 className="max-w-3xl text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-neutral-950 mb-6 text-balance">
            Run your fleet with <br className="hidden md:block" /> absolute precision.
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-neutral-500 mb-10 leading-relaxed text-balance">
            Digitize your logistics operations. Manage vehicles, drivers, dispatch, maintenance, and expenses from a single, centralized command center.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:bg-neutral-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all"
            >
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a 
              href="#features" 
              className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-6 py-3.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 transition-all"
            >
              Explore platform
            </a>
          </div>
        </section>

        {/* Value Prop Micro-section */}
        <section id="features" className="px-6 py-20 border-t border-neutral-100 bg-neutral-50">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-neutral-100">
                  <Map className="h-5 w-5 text-neutral-700" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2">Intelligent Dispatch</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Assign trips with automated capacity, license, and status validation to prevent scheduling conflicts.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-neutral-100">
                  <ShieldCheck className="h-5 w-5 text-neutral-700" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2">Safety &amp; Compliance</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Track license validity, safety scores, and maintenance logs. Keep non-compliant vehicles off the road.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-neutral-100">
                  <Activity className="h-5 w-5 text-neutral-700" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2">Cost Analytics</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Monitor operational expenses, fuel consumption, and vehicle ROI in real-time with automated reporting.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-100 py-8 px-6 text-center text-sm text-neutral-500">
        <p>© 2026 TransitOps. All rights reserved.</p>
      </footer>
    </div>
  );
}
