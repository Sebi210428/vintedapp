import Link from "next/link";
import type { CSSProperties } from "react";
import Image from "next/image";
import { getServerAuthSession } from "@/lib/auth";
import LogoutTextButton from "@/components/auth/LogoutTextButton";
import WowEffects from "@/components/WowEffects";

export default async function Page() {
  const session = await getServerAuthSession();
  const isAuthed = Boolean(session?.user);
  const tiltVars = { "--wow-rx": "4deg", "--wow-ry": "-10deg" } as CSSProperties;

  return (
    <>
      <div className="ambient-light">
      <div className="ambient-blob bg-blue-900/20 w-[80vw] h-[80vw] -top-[40vw] -left-[20vw] animate-blob mix-blend-screen hidden sm:block"></div>
      <div className="ambient-blob bg-indigo-900/20 w-[70vw] h-[70vw] -bottom-[20vw] -right-[10vw] animate-blob [animation-delay:2s] mix-blend-screen hidden sm:block"></div>
      <div className="ambient-blob bg-primary/10 w-[50vw] h-[50vw] top-[30%] left-[25%] animate-blob [animation-delay:4s] mix-blend-screen hidden sm:block"></div>
      <div className="ambient-blob bg-primary/20 w-[360px] h-[360px] sm:w-[600px] sm:h-[600px] -top-20 -right-20 animate-pulse-glow mix-blend-screen"></div>
      <div className="ambient-blob bg-indigo-900/20 w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] -bottom-20 -left-20 mix-blend-screen"></div>
      <div className="absolute inset-0 bg-[url('/textures/noise.svg')] opacity-10 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>
      <nav data-wow-nav className="sticky top-0 z-50 w-full glass-nav px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
      <a className="flex items-center gap-3 group" href="#top">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-blue-900/20 transition-transform duration-300 group-hover:scale-105 group-hover:bg-primary-light">
      <span className="material-symbols-outlined text-[28px]">photo_camera_front</span>
      </div>
      <span className="text-xl font-bold tracking-tight text-white group-hover:text-gray-200 transition-colors">BlueCut</span>
      </a>
      <div className="flex items-center gap-3 sm:gap-6">
      <a className="hidden text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200 md:block hover:underline underline-offset-4 decoration-blue-500/50" href="#how-it-works">How it works</a>
      <a className="hidden text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200 md:block hover:underline underline-offset-4 decoration-blue-500/50" href="#pricing">Pricing</a>
      {isAuthed ? (
        <>
          <LogoutTextButton className="hidden h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 md:flex" />
          <Link
            className="btn-shine flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-primary/40 border border-white/5 hover:scale-105 active:scale-95"
            href="/dashboard"
          >
            Go to dashboard
          </Link>
        </>
      ) : (
        <>
          <Link
            className="hidden h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 md:flex"
            href="/login"
          >
            Log in
          </Link>
          <Link
            className="btn-shine flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-primary/40 border border-white/5 hover:scale-105 active:scale-95"
            href="/login"
          >
            Start Now
          </Link>
        </>
      )}
      </div>
      </div>
      </nav>
      <section className="relative w-full min-h-[80vh] sm:min-h-[90vh] flex items-center pt-14 sm:pt-24 pb-14 sm:pb-20 overflow-hidden" id="home">
      <div className="layout-container mx-auto w-full max-w-7xl px-6 md:px-10 relative z-10">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
      <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col gap-6 sm:gap-8 text-center sm:text-left items-center sm:items-start relative z-10">
      <div className="hidden sm:inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-sm animate-fade-in-up">
      <div className="flex -space-x-2">
      <div className="size-6 rounded-full bg-gray-600 border border-[#0B0F19] overflow-hidden">
      <span className="material-symbols-outlined text-sm bg-gray-300 w-full h-full flex items-center justify-center text-gray-800">face</span>
      </div>
      <div className="size-6 rounded-full bg-gray-500 border border-[#0B0F19] overflow-hidden">
      <span className="material-symbols-outlined text-sm bg-gray-200 w-full h-full flex items-center justify-center text-gray-700">face_3</span>
      </div>
      <div className="size-6 rounded-full bg-gray-400 border border-[#0B0F19] overflow-hidden">
      <span className="material-symbols-outlined text-sm bg-gray-100 w-full h-full flex items-center justify-center text-gray-600">face_6</span>
      </div>
      </div>
      <span className="text-sm font-medium text-gray-300">Loved by 50,000+ sellers</span>
      </div>
      <h1 className="text-3xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] animate-fade-in-up [animation-delay:100ms]">
                          Professional <br className="hidden lg:block"/>
      <span className="relative inline-block">
      <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Vinted Photos</span>
      <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-500/30 -z-10" fill="none" preserveAspectRatio="none" viewBox="0 0 100 10"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8"></path></svg>
      </span>
      <br/> in One Click
                      </h1>
      <p className="text-sm sm:text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed animate-fade-in-up [animation-delay:200ms] mx-auto sm:mx-0">
                          Transform messy phone photos into high-converting listings instantly. 
                          Our AI removes backgrounds and enhances lighting automatically.
                      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full sm:w-auto animate-fade-in-up [animation-delay:300ms]">
      <Link
        className="btn-shine group relative flex h-14 w-full sm:min-w-[180px] sm:w-auto items-center justify-center gap-2 rounded-2xl bg-primary px-8 text-base sm:text-lg font-bold text-white transition-all duration-300 hover:bg-blue-600 hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/20 border border-white/10"
        href="/register"
      >
        Start Free Trial
        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
          arrow_forward
        </span>
      </Link>
      <Link
        className="group flex h-14 w-full sm:min-w-[180px] sm:w-auto items-center justify-center gap-2 rounded-2xl border border-gray-700 bg-white/5 px-8 text-base sm:text-lg font-bold text-white transition-all duration-300 hover:bg-white/10 hover:border-gray-500 hover:scale-105 active:scale-95 backdrop-blur-sm"
        href="/demo"
      >
        <span className="material-symbols-outlined text-gray-400 group-hover:text-white transition-colors">
          play_circle
        </span>
        View Demo
      </Link>
      </div>
      </div>
      <div data-wow-tilt-scope className="lg:col-span-6 order-1 lg:order-2 relative lg:h-[750px] flex items-center justify-center lg:perspective-[2500px] group mt-4 sm:mt-16 lg:mt-0">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/15 to-purple-500/15 rounded-full blur-3xl -z-10 transform scale-75 group-hover:scale-100 transition-transform duration-700"></div>
      <div data-wow-tilt data-wow-tilt-max="7" data-wow-tilt-rx="4" data-wow-tilt-ry="-10" className="relative w-full max-w-[320px] sm:max-w-lg xl:max-w-xl aspect-[3/4] sm:aspect-[4/5] rounded-[2rem] sm:rounded-[2.5rem] [clip-path:inset(0_round_2rem)] sm:[clip-path:inset(0_round_2.5rem)] border border-white/10 bg-[#131B2C] shadow-2xl overflow-hidden transform lg:[transform:rotateY(-10deg)_rotateX(4deg)] transition-all duration-700 hover:rotate-0 hover:scale-[1.02] hover:shadow-blue-500/20 z-20" style={tiltVars} suppressHydrationWarning>
      <div className="absolute top-0 inset-x-0 h-12 sm:h-16 bg-white/5 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 sm:px-8 z-20">
      <div className="flex items-center gap-2.5">
      <div className="w-3.5 h-3.5 rounded-full bg-red-500/80"></div>
      <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80"></div>
      <div className="w-3.5 h-3.5 rounded-full bg-green-500/80"></div>
      </div>
      <div className="px-3 py-1 rounded-full bg-black/40 text-[10px] sm:text-[11px] font-mono text-gray-400 border border-white/5">
                                  AI_Processor.exe
                              </div>
      </div>
      <div className="absolute inset-0 mt-12 sm:mt-16 bg-gray-900 group-hover:scale-105 transition-transform duration-1000 ease-out">
      <Image
        alt="AI processed product preview"
        className="object-cover object-center"
        fill
        priority
        sizes="(max-width: 1024px) 90vw, 720px"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDVRQyvsacrRZKXh3z3lhynhrtUBbLt1isGrN2_HbAV_pSPNTNdYbzJsGWVl_E7Z5x89vNcDXPZzPJD9_fwyZpKDaLMX-EVpoFgoWe2LV9RK88ew2rwCuWbMVr4ValhwNWmQrjUTKrCoeBsl8FaLEWnqt-HOmpRbvYOjErBxLns50AldY0tb3iBbuJdPoA61WZYt3epg5BE72SBkdJYfvdQfzQ_2isfgp3_hHFkXtM6KjAfJ_t7pCjGkarlWwwiI1FfDB1IzvM908"
      />
      </div>
      <div className="absolute inset-0 mt-12 sm:mt-16 bg-gradient-to-b from-transparent via-blue-400/20 to-transparent h-[10%] w-full animate-scan pointer-events-none z-10"></div>
      </div>
      <div className="pointer-events-none hidden sm:block absolute -right-4 top-[20%] lg:-right-6 z-30 p-5 rounded-2xl bg-[#1a2333]/90 backdrop-blur-xl border border-white/10 shadow-xl animate-float lg:[transform:translateZ(60px)]">
      <div className="flex items-center gap-4">
      <div className="size-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
      <span className="material-symbols-outlined text-2xl">trending_up</span>
      </div>
      <div>
      <div className="text-sm text-gray-400">Sales Velocity</div>
      <div className="text-xl font-bold text-white">+340%</div>
      </div>
      </div>
      </div>
      <div className="pointer-events-none hidden sm:block absolute -left-4 bottom-[20%] lg:-left-6 z-30 p-5 rounded-2xl bg-[#1a2333]/90 backdrop-blur-xl border border-white/10 shadow-xl animate-float-delayed lg:[transform:translateZ(80px)]">
      <div className="flex items-center gap-4">
      <div className="size-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
      <span className="material-symbols-outlined text-2xl">auto_fix</span>
      </div>
      <div>
      <div className="text-sm text-gray-400">Background</div>
      <div className="text-base font-bold text-white">Removed Automatically</div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </section>
      <section className="relative overflow-hidden cv-auto" id="features">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.03] to-transparent pointer-events-none"></div>
      <div className="mx-auto flex w-full max-w-md flex-col gap-3 py-10 sm:py-14 px-6 relative z-10 sm:max-w-5xl sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 md:gap-6">
      <div className="group relative w-full rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5 hover:bg-white/[0.04] transition-all duration-300 backdrop-blur-sm sm:flex-1 sm:min-w-[220px]">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="flex items-start gap-4 relative z-10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 group-hover:bg-blue-500/20 group-hover:scale-105 transition-all duration-300">
      <span className="material-symbols-outlined text-xl">photo_library</span>
      </div>
      <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
      <span data-wow-count="700" data-wow-duration="950" className="text-2xl font-extrabold text-white tracking-tight">700</span>
      <span className="text-lg font-bold text-blue-400">+</span>
      </div>
      <span className="text-xs font-medium text-gray-400 mt-1">Photos optimized daily</span>
      </div>
      </div>
      </div>
      <div className="group relative w-full rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5 hover:bg-white/[0.04] transition-all duration-300 backdrop-blur-sm sm:flex-1 sm:min-w-[220px]">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="flex items-start gap-4 relative z-10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:scale-105 transition-all duration-300">
      <span className="material-symbols-outlined text-xl">groups</span>
      </div>
      <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
      <span data-wow-count="300" data-wow-duration="900" className="text-2xl font-extrabold text-white tracking-tight">300</span>
      <span className="text-lg font-bold text-indigo-400">+</span>
      </div>
      <span className="text-xs font-medium text-gray-400 mt-1">Sellers helped globally</span>
      </div>
      </div>
      </div>
      <div className="group relative w-full rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:p-5 hover:bg-white/[0.04] transition-all duration-300 backdrop-blur-sm sm:flex-1 sm:min-w-[220px]">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="flex items-start gap-4 relative z-10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all duration-300">
      <span className="material-symbols-outlined text-xl">trending_up</span>
      </div>
      <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
      <span className="text-2xl font-extrabold text-white tracking-tight">3x</span>
      <span className="text-lg font-bold text-emerald-400">Faster</span>
      </div>
      <span className="text-xs font-medium text-gray-400 mt-1">Sales velocity increase</span>
      </div>
      </div>
      </div>
      </div>
      </section>
      <section className="w-full py-16 sm:py-24 overflow-hidden relative z-10 cv-auto" id="how-it-works">
      <div className="mx-auto flex max-w-7xl flex-col px-6 md:px-10">
      <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-4 text-center items-center">
      <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight md:text-5xl">
                              How it Works
                          </h2>
      <p className="text-gray-400 text-sm sm:text-base md:text-xl max-w-2xl">
                              Transform your raw photos into sales-ready images in three simple steps.
                          </p>
      </div>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10 relative">
      <div className="hidden md:block absolute top-[30%] left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-gray-800 -z-10 opacity-60"></div>
      <div className="flex flex-col items-center text-center gap-8 group">
      <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[340px] rounded-[2rem] bg-gradient-to-b from-[#1a2333] to-[#0f1623]/80 border border-white/5 shadow-2xl overflow-hidden group-hover:border-blue-500/30 transition-all duration-500 group-hover:shadow-blue-900/20 backdrop-blur-sm">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#3b82f6 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
      <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
      <div className="relative w-32 h-56 bg-gray-900 rounded-3xl border-4 border-gray-700 shadow-2xl z-10 transform transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-gray-800 rounded-b-lg"></div>
      <div className="w-full h-full rounded-[1.3rem] overflow-hidden bg-gray-800 flex flex-col p-3 gap-2">
      <div className="w-full h-32 bg-gray-700/50 rounded-xl animate-pulse"></div>
      <div className="grid grid-cols-2 gap-2">
      <div className="h-16 bg-gray-700/30 rounded-lg"></div>
      <div className="h-16 bg-gray-700/30 rounded-lg"></div>
      </div>
      </div>
      </div>
      <div className="absolute top-1/4 right-8 md:right-4 lg:right-10 size-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 z-20 transform rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110 animate-float">
      <span className="material-symbols-outlined text-white text-3xl">add_photo_alternate</span>
      </div>
      <div className="absolute bottom-16 left-8 md:left-4 lg:left-10 size-12 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center z-0 transform -rotate-6 group-hover:-rotate-12 transition-transform duration-500 animate-float-delayed">
      <span className="material-symbols-outlined text-gray-400 text-xl">image</span>
      </div>
      </div>
      </div>
      <div className="flex flex-col gap-3 px-4">
      <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-900/20 px-3 py-1.5 rounded-full w-fit mx-auto border border-blue-900/30">Step 1</span>
      <h3 className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors">Upload Photos</h3>
      <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors">Select raw photos directly from your phone gallery or computer.</p>
      </div>
      </div>
      <div className="flex flex-col items-center text-center gap-8 group">
      <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[340px] rounded-[2rem] bg-gradient-to-b from-[#1e1b2e] to-[#0f1623]/80 border border-white/5 shadow-2xl overflow-hidden group-hover:border-indigo-500/30 transition-all duration-500 group-hover:shadow-indigo-900/20 backdrop-blur-sm">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
      <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
      <div className="relative w-48 h-60 bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden z-10">
      <div className="absolute inset-0 flex items-center justify-center">
      <span className="material-symbols-outlined text-gray-600 text-[64px] opacity-50">checkroom</span>
      </div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20 animate-scan"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent z-10 mix-blend-overlay"></div>
      </div>
      <div className="absolute top-12 right-10 text-yellow-300 animate-pulse">
      <span className="material-symbols-outlined text-3xl">spark</span>
      </div>
      <div className="absolute bottom-16 left-12 text-indigo-400 animate-pulse delay-700">
      <span className="material-symbols-outlined text-2xl">auto_awesome</span>
      </div>
      <div className="absolute -bottom-4 -right-4 size-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-600/30 z-30 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
      <span className="material-symbols-outlined text-white text-4xl">magic_button</span>
      </div>
      </div>
      </div>
      <div className="flex flex-col gap-3 px-4">
      <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-900/20 px-3 py-1.5 rounded-full w-fit mx-auto border border-indigo-900/30">Step 2</span>
      <h3 className="text-2xl font-bold text-white group-hover:text-indigo-100 transition-colors">AI Processing</h3>
      <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors">Our AI instantly detects contours and removes the messy background.</p>
      </div>
      </div>
      <div className="flex flex-col items-center text-center gap-8 group">
      <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[340px] rounded-[2rem] bg-gradient-to-b from-[#11231f] to-[#0f1623]/80 border border-white/5 shadow-2xl overflow-hidden group-hover:border-emerald-500/30 transition-all duration-500 group-hover:shadow-emerald-900/20 backdrop-blur-sm">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#10b981 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
      <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
      <div className="relative w-40 h-48 bg-gray-800 rounded-xl border border-gray-700 shadow-xl z-10 transform -rotate-3 transition-transform duration-500 group-hover:rotate-0">
      <div className="w-full h-32 bg-gray-700/30 rounded-t-xl flex items-center justify-center">
      <span className="material-symbols-outlined text-gray-500 text-4xl">checkroom</span>
      </div>
      <div className="p-3">
      <div className="h-3 w-2/3 bg-gray-600/30 rounded mb-2"></div>
      <div className="h-3 w-1/2 bg-gray-600/30 rounded"></div>
      </div>
      <div className="absolute -top-3 -right-3 size-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 z-30">
      <span className="material-symbols-outlined text-white text-xl font-bold">check</span>
      </div>
      </div>
      <div className="absolute bottom-10 -right-4 w-40 h-32 z-0 opacity-60">
      <svg className="w-full h-full text-emerald-500/30" fill="currentColor" viewBox="0 0 100 100">
      <path d="M0 100 L20 80 L40 90 L70 50 L100 20 L100 100 Z"></path>
      </svg>
      </div>
      <div className="absolute top-10 left-8 size-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/30 z-20 transform transition-transform duration-500 group-hover:-translate-y-4 group-hover:scale-110 animate-float">
      <span className="material-symbols-outlined text-white text-4xl">rocket_launch</span>
      </div>
      </div>
      </div>
      <div className="flex flex-col gap-3 px-4">
      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/20 px-3 py-1.5 rounded-full w-fit mx-auto border border-emerald-900/30">Step 3</span>
      <h3 className="text-2xl font-bold text-white group-hover:text-emerald-100 transition-colors">Sell Faster</h3>
      <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors">Download high-quality images ready to post and boost your sales.</p>
      </div>
      </div>
      </div>
      </div>
      </div>
      </section>
      <section className="relative w-full py-16 sm:py-20 overflow-hidden cv-auto" id="pricing">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-full max-w-5xl rounded-full bg-blue-600/10 blur-[130px] pointer-events-none animate-pulse-glow hidden sm:block"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzYjViZGIiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30 pointer-events-none mix-blend-overlay"></div>
      <div className="relative layout-container mx-auto flex max-w-6xl flex-col px-6 md:px-10 z-10">
      <div className="mb-16 flex flex-col items-center text-center gap-4">
      <span className="text-blue-400 font-bold tracking-wider text-sm uppercase bg-blue-900/20 px-3 py-1 rounded-full border border-blue-900/30 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">Pricing Plans</span>
      <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight md:text-5xl drop-shadow-lg">
                      Choose Your Plan
                  </h2>
      <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                      Select the perfect package to professionalize your Vinted closet.
                  </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-start">
      <div className="relative group rounded-2xl border border-white/10 bg-[#0b1121]/70 p-6 sm:p-7 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-colors duration-300 hover:border-white/20 hover:bg-[#0b1224]/80 backdrop-blur">
      <div className="mb-4">
      <h3 className="text-xl font-bold text-white">Basic</h3>
      </div>
      <p className="text-gray-400 text-sm mb-6">Perfect for closet cleanouts</p>
      <div className="flex items-baseline gap-1 mb-6">
      <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">€14.99</span>
      <span className="text-gray-500">/mo</span>
      </div>
      <div className="w-full h-px bg-white/5 mb-5"></div>
      <ul className="flex flex-col gap-3 mb-7 flex-1">
      <li className="text-[13px] text-gray-300">50 automated edits/mo</li>
      <li className="text-[13px] text-gray-300">Standard background removal</li>
      <li className="text-[13px] text-gray-300">HD resolution downloads</li>
      <li className="text-[13px] text-gray-300">Email support</li>
      </ul>
      <Link className="flex w-full items-center justify-center py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-200" href="/login?plan=basic">
                          Get Started
                      </Link>
      </div>
      <div className="wow-popular-card relative rounded-2xl border border-blue-500/40 bg-[#0d1426]/80 p-6 sm:p-7 shadow-[0_18px_40px_rgba(15,23,42,0.6)] ring-1 ring-blue-500/30 transition-colors duration-300 hover:bg-[#0e1530]/90 backdrop-blur">
      <div className="mb-4 relative z-10">
      <div className="flex items-center gap-2">
      <h3 className="text-xl font-bold text-white">Pro</h3>
      <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-200">
        Popular
      </span>
      </div>
      </div>
      <p className="text-blue-200/70 text-sm mb-6 relative z-10">For active Vinted sellers</p>
      <div className="flex items-baseline gap-1 mb-6 relative z-10">
      <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">€29.99</span>
      <span className="text-blue-300/60">/mo</span>
      </div>
      <div className="w-full h-px bg-blue-500/20 mb-5 relative z-10"></div>
      <ul className="flex flex-col gap-3 mb-7 flex-1 relative z-10">
      <li className="text-[13px] text-gray-200">250 AI-enhanced edits/mo</li>
      <li className="text-[13px] text-gray-200">4K Ultra-HD downloads</li>
      <li className="text-[13px] text-gray-200">Custom studio backgrounds</li>
      <li className="text-[13px] text-gray-200">Batch processing (20 photos)</li>
      <li className="text-[13px] text-gray-200">Priority support access</li>
      </ul>
      <Link className="btn-shine flex w-full items-center justify-center py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all duration-300 border border-blue-400/40 relative z-10" href="/login?plan=pro">
                          Choose Pro
                      </Link>
      </div>
      <div className="relative group rounded-2xl border border-white/10 bg-[#0b1121]/70 p-6 sm:p-7 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-colors duration-300 hover:border-white/20 hover:bg-[#0b1224]/80 backdrop-blur">
      <div className="mb-4">
      <h3 className="text-xl font-bold text-white">Studio</h3>
      </div>
      <p className="text-gray-400 text-sm mb-6">Power users &amp; businesses</p>
      <div className="flex items-baseline gap-1 mb-6">
      <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">€59.99</span>
      <span className="text-gray-500">/mo</span>
      </div>
      <div className="w-full h-px bg-white/5 mb-5"></div>
      <ul className="flex flex-col gap-3 mb-7 flex-1">
      <li className="text-[13px] text-gray-300">Unlimited photo editing</li>
      <li className="text-[13px] text-gray-300">RAW file support &amp; export</li>
      <li className="text-[13px] text-gray-300">Advanced API access</li>
      <li className="text-[13px] text-gray-300">White-label options</li>
      <li className="text-[13px] text-gray-300">Dedicated account manager</li>
      </ul>
      <Link className="flex w-full items-center justify-center py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-200" href="/login?plan=studio">
                          Contact Sales
                      </Link>
      </div>
      </div>
      </div>
      </section>
      <footer className="text-white py-12 relative z-10 cv-auto">
      <div className="mx-auto max-w-6xl px-6 md:px-10 flex flex-col items-center gap-8">
      <div className="flex flex-wrap justify-center gap-8 md:gap-12">
      <a className="text-gray-400 hover:text-white transition-colors duration-200 font-medium text-sm" href="#top">Home</a>
      <a className="text-gray-400 hover:text-white transition-colors duration-200 font-medium text-sm" href="#pricing">Pricing</a>
      <Link className="text-gray-400 hover:text-white transition-colors duration-200 font-medium text-sm" href="/terms" prefetch={false}>Terms</Link>
      <Link className="text-gray-400 hover:text-white transition-colors duration-200 font-medium text-sm" href="/privacy-policy" prefetch={false}>Privacy Policy</Link>
      </div>
      <div className="flex items-center gap-6">
      <a aria-label="Instagram" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110" href="#">
      <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.484 2h.231zm-5.679 6a1 1 0 110-2 1 1 0 010 2zm5.679-2a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z"></path></svg>
      </a>
      <a aria-label="X" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110" href="#">
      <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z"></path></svg>
      </a>
      <a aria-label="YouTube" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110" href="#">
      <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.582 6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254 4 12 4 12 4S5.746 4 4.186 4.418c-0.86 0.23-1.538 0.908-1.768 1.768C2 7.746 2 12 2 12s0 4.254 0.418 5.814c0.23 0.86 0.908 1.538 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-0.418c0.86-0.23 1.538-0.908 1.768-1.768C22 16.254 22 12 22 12s0-4.254-0.418-5.814zM10 15.464V8.536L16 12L10 15.464z"></path></svg>
      </a>
      <a aria-label="TikTok" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110" href="#">
      <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path></svg>
      </a>
      <a aria-label="Telegram" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110" href="#">
      <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.002.001l-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15l4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"></path></svg>
      </a>
      <a aria-label="Email" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110" href="#">
      <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg>
      </a>
      </div>
      <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-gray-600 text-xs">© 2024 BlueCut. All rights reserved.</p>
      </div>
      </div>
      </footer>
      <WowEffects enabled />
    </>
  );
}
