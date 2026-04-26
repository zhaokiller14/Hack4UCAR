"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function UcarLandingPage() {
  const reveal = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F6F3] font-sans text-[#0D2B3E]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-[#1B4F6B]/10 blur-3xl"
          animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 top-64 h-72 w-72 rounded-full bg-[#C9A84C]/15 blur-3xl"
          animate={{ y: [0, 14, 0], x: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 h-44 w-44 rounded-full bg-[#1B4F6B]/10 blur-3xl"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-6"
      >
        <div className="flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]">
          {/* Placeholder for UCAR Logo */}
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B4F6B] text-xl font-bold text-white"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            U
          </motion.div>
          <span className="text-xl font-bold text-[#1B4F6B] tracking-tight">
            Université de Carthage
          </span>
        </div>
        <div className="hidden md:flex gap-8 font-medium text-sm text-[#0D2B3E]/80">
          <Link
            href="#about"
            className="hover:text-[#1B4F6B] transition-colors"
          >
            Our Vision
          </Link>
          <Link
            href="#platform"
            className="hover:text-[#1B4F6B] transition-colors"
          >
            The Platform
          </Link>
          <Link
            href="#institutions"
            className="hover:text-[#1B4F6B] transition-colors"
          >
            Institutions
          </Link>
        </div>
        <Link
          href="/ucar/dashboard"
          className="rounded px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#153e54] hover:shadow-md bg-[#1B4F6B]"
        >
          Access Dashboard
        </Link>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-8 py-24 text-center">
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="inline-block rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-[#C9A84C]"
        >
          Digitalization & Institutional Intelligence
        </motion.div>
        <motion.h1
          variants={reveal}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-6 mt-6 max-w-4xl text-5xl font-extrabold leading-tight text-[#0D2B3E] md:text-7xl"
        >
          Empowering the Future of{" "}
          <span className="text-[#1B4F6B]">Carthage</span>
        </motion.h1>
        <motion.p
          variants={reveal}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mb-10 max-w-2xl text-lg text-[#0D2B3E]/70 md:text-xl"
        >
          Transforming 38 affiliated institutions into a single, intelligent
          ecosystem. Real-time insights, automated workflows, and AI-driven
          predictive analytics for modern university governance.
        </motion.p>
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/ucar/dashboard"
            className="rounded bg-[#1B4F6B] px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#153e54] hover:shadow-xl"
          >
            Launch Executive Dashboard
          </Link>
          <Link
            href="#platform"
            className="rounded border border-[#1B4F6B]/20 bg-white px-8 py-4 text-lg font-medium text-[#1B4F6B] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-[#1B4F6B]/5 hover:shadow-md"
          >
            Discover the Architecture
          </Link>
        </motion.div>
      </section>

      {/* Real-World Statistics Section */}
      <motion.section
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-[#1B4F6B] py-16 text-white"
      >
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/20 text-center">
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <div className="mb-2 text-4xl font-bold text-[#C9A84C]">1988</div>
            <div className="text-sm font-medium uppercase tracking-wider opacity-80">
              Founded
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <div className="mb-2 text-4xl font-bold text-[#C9A84C]">38</div>
            <div className="text-sm font-medium uppercase tracking-wider opacity-80">
              Affiliated Institutions
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <div className="mb-2 text-4xl font-bold text-[#C9A84C]">
              48,000+
            </div>
            <div className="text-sm font-medium uppercase tracking-wider opacity-80">
              Students
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <div className="mb-2 text-4xl font-bold text-[#C9A84C]">1</div>
            <div className="text-sm font-medium uppercase tracking-wider opacity-80">
              Unified Platform
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* About UCAR Context Section */}
      <section
        id="about"
        className="mx-auto grid max-w-7xl items-center gap-16 px-8 py-24 md:grid-cols-2"
      >
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D2B3E] mb-6">
            "I shall either find a way or make one."
          </h2>
          <p className="text-lg text-[#0D2B3E]/70 mb-6 leading-relaxed">
            As one of Tunisia's premier multidisciplinary institutions, the
            University of Carthage spans five governorates and encompasses elite
            institutions like INAT, SUP'COM, and EPT.
          </p>
          <p className="text-lg text-[#0D2B3E]/70 mb-6 leading-relaxed">
            Recently accredited internationally by the NCEE as an{" "}
            <strong className="text-[#1B4F6B]">
              "Entrepreneurial University"
            </strong>
            , UCAR is deeply committed to innovation and economic impact through
            initiatives like the Student Entrepreneur Pole (PEEC). To sustain
            this momentum, our governance must evolve from fragmented legacy
            systems to a unified, AI-driven framework.
          </p>
        </motion.div>
        <motion.div
          className="relative"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#1B4F6B] to-[#C9A84C] opacity-20"
            style={{ transform: "translate(1rem, 1rem)" }}
            animate={{ y: [16, 8, 16], x: [16, 8, 16] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10 rounded-2xl border border-gray-100 bg-white p-10 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
            <h3 className="text-xl font-bold text-[#1B4F6B] mb-4">
              The Digital Challenge
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-[#C62828] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="text-[#0D2B3E]/80">
                  Data scattered across paper, legacy Excel, and disconnected
                  databases.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-[#C62828] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="text-[#0D2B3E]/80">
                  Blind spots in resource allocation and budget execution across
                  38 nodes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-[#C62828] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="text-[#0D2B3E]/80">
                  Inability to cross-reference academic success with
                  infrastructure usage in real-time.
                </span>
              </li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* Platform Features Section */}
      <section
        id="platform"
        className="border-t border-gray-100 bg-white py-24"
      >
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            className="mb-16 text-center"
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0D2B3E] mb-4">
              A Multi-Layered Architecture
            </h2>
            <p className="text-lg text-[#0D2B3E]/60 max-w-2xl mx-auto">
              Built for massive scale, deep analytics, and uncompromising
              security.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              className="rounded-xl border border-gray-100 bg-[#F7F6F3] p-8"
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              whileHover={{
                y: -6,
                boxShadow: "0 8px 24px rgba(27, 79, 107, 0.12)",
              }}
            >
              <div className="w-12 h-12 bg-[#1B4F6B]/10 text-[#1B4F6B] rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0D2B3E] mb-3">
                Intelligent Ingestion
              </h3>
              <p className="text-[#0D2B3E]/70 text-sm leading-relaxed">
                Automated OCR and AI pipelines transform fragmented PDFs and
                Excel sheets into a structured, unified ontological database.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="rounded-xl border border-gray-100 bg-[#F7F6F3] p-8"
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              whileHover={{
                y: -6,
                boxShadow: "0 8px 24px rgba(27, 79, 107, 0.12)",
              }}
            >
              <div className="w-12 h-12 bg-[#C9A84C]/10 text-[#C9A84C] rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0D2B3E] mb-3">
                Multi-Tenant Core
              </h3>
              <p className="text-[#0D2B3E]/70 text-sm leading-relaxed">
                A single deployment securely isolating 38 institutions via Row
                Level Security (RLS) while allowing cross-tenant aggregation for
                executive insights.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="rounded-xl border border-gray-100 bg-[#F7F6F3] p-8"
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              whileHover={{
                y: -6,
                boxShadow: "0 8px 24px rgba(27, 79, 107, 0.12)",
              }}
            >
              <div className="w-12 h-12 bg-[#1B4F6B]/10 text-[#1B4F6B] rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0D2B3E] mb-3">
                Predictive AI Engine
              </h3>
              <p className="text-[#0D2B3E]/70 text-sm leading-relaxed">
                Explainable AI (XAI) models forecast budget burn rates, track
                pedagogical progression, and flag anomaly alerts directly to
                Deans and Presidents.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D2B3E] py-12 text-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-bold tracking-tight">
              Université de Carthage
            </span>
            <p className="text-sm text-white/50 mt-1">
              Hack4UCAR Digitalization Platform
            </p>
          </div>
          <div className="flex gap-6 text-sm text-white/70">
            <Link
              href="/ucar/admin/users"
              className="hover:text-white transition-colors"
            >
              Admin Portal
            </Link>
            <Link
              href="/ucar/dashboard"
              className="hover:text-white transition-colors"
            >
              Executive Dashboard
            </Link>
            <span className="opacity-50">|</span>
            <span className="text-white/40">Secured via Supabase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
