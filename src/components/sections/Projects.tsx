"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ProjectData {
  title: string;
  image: string;
  tags: string[];
  description: string;
  url: string;
}

const projects: ProjectData[] = [
  {
    title: "TOS Lanka Mfg",
    image: "/projects-done/tos-lanka.png",
    tags: ["Automation", "Manufacturing"],
    description:
      "State-of-the-art electronic manufacturing services system facilitating real-time factory floor tracking and quality assurance.",
    url: "#",
  },
  {
    title: "Agenly",
    image: "/projects-done/agenly.online.webp",
    tags: ["SaaS", "Web", "AI"],
    description:
      "An innovative SaaS platform that empowers businesses to build, train, and deploy custom AI agents in minutes.",
    url: "https://www.agenly.online/",
  },
  {
    title: "Ontriq",
    image: "/projects-done/Ontriq-screenshot.webp",
    tags: ["HR", "Web System"],
    description:
      "Sri Lanka's background verification and HR solutions provider offering rapid turnaround for employment and education checks.",
    url: "https://www.ontriq.com",
  },
  {
    title: "Core Craft",
    image: "/projects-done/core-craft-screenshot.webp",
    tags: ["Branding", "Web", "Design"],
    description:
      "Premium web design and development agency offering custom website builds, high-fidelity UI/UX design, and brand identity solutions.",
    url: "https://www.corecraft.agency",
  },
  {
    title: "Ceylon Tea Land",
    image: "/projects-done/ceylon-tea-land.webp",
    tags: ["E-Commerce", "B2B"],
    description:
      "A premium B2B export platform enabling global buyers to source 100% pure, hand-picked Ceylon tea from Sri Lanka's finest estates.",
    url: "https://www.ceylontealand.com/",
  },
  {
    title: "EXIM Corporation",
    image: "/projects-done/exim.webp",
    tags: ["Logistics", "Automation"],
    description:
      "Specialized logistical system for industrial manufacturing and global partner networks, streamlining shipments and delivery logs.",
    url: "https://eximcpl.com",
  },
  {
    title: "Halo Systems",
    image: "/projects-done/halo.webp",
    tags: ["Automation", "ERP"],
    description:
      "Custom enterprise resource planning system and automation hub designed to streamline industrial production and client workflows.",
    url: "#",
  },
  {
    title: "Car Arena Ceylon",
    image: "/projects-done/cararenaceylon.webp",
    tags: ["E-Commerce", "Web", "Branding"],
    description:
      "Premium automotive dealer platform emphasizing warranty tracking, OEM upgrades, and streamlined vehicle catalog browsing.",
    url: "https://www.cararenaceylon.com/",
  },
  {
    title: "Portlands Group",
    image: "/projects-done/portlands.webp",
    tags: ["Web", "Corporate"],
    description:
      "High-end corporate website and client portal showcasing construction portfolios, investment metrics, and property development.",
    url: "#",
  },
  {
    title: "YBO Growth Agency",
    image: "/projects-done/yboagency.webp",
    tags: ["Marketing", "Web"],
    description:
      "Strategic marketing automation portal and growth agency platform built to run lead generation and target acquisition campaigns.",
    url: "#",
  },
];

function PortfolioCard({ project, index }: { project: ProjectData; index: number }) {
  return (
    <a
      href={project.url}
      target={project.url !== "#" ? "_blank" : undefined}
      rel={project.url !== "#" ? "noopener noreferrer" : undefined}
      className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-[#111113] overflow-hidden transition-all duration-500 hover:border-white/[0.14] hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
    >
      {/* Tags Row */}
      <div className="flex items-center gap-2 flex-wrap px-6 pt-6 pb-4">
        {project.tags.map((tag, i) => (
          <React.Fragment key={tag}>
            <span className="px-3.5 py-1 rounded-full border border-white/[0.12] text-[11px] font-medium text-white/60 tracking-wide font-sans transition-colors duration-300 group-hover:border-white/[0.2] group-hover:text-white/80">
              {tag}
            </span>
            {i < project.tags.length - 1 && (
              <span className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Image Container */}
      <div className="relative mx-5 mb-6 rounded-xl overflow-hidden bg-[#1a1a1d]">
        <div className="relative w-full aspect-[2/1] overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
          {/* Soft vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>
      </div>

      {/* Bottom Content */}
      <div className="flex items-end justify-between gap-4 px-6 pb-6 mt-auto">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <h3 className="text-lg md:text-xl font-semibold text-white tracking-tight font-sans leading-tight truncate">
            {project.title}
          </h3>
          <p className="text-[13px] text-white/40 font-sans leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Arrow Circle */}
        <div className="shrink-0 w-10 h-10 rounded-full border border-white/[0.15] flex items-center justify-center transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/[0.06] group-hover:scale-110">
          <ArrowUpRight className="w-4 h-4 text-white/50 transition-all duration-300 group-hover:text-white group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
        </div>
      </div>
    </a>
  );
}

export default function Projects() {
  const [visibleCount, setVisibleCount] = React.useState(4);

  React.useEffect(() => {
    // Refresh ScrollTrigger to recalculate pinning and section offsets
    // after the DOM height increases from loading more projects
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150); // Small timeout to let React finish updates and paint the new grid cards
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <section
      id="recent-projects"
      className="relative w-full py-24 md:py-32 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Subtle radial glow behind heading */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.015] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 relative z-10">

        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-syne font-semibold text-white tracking-tight leading-[0.95] select-none">
            Portfolio
          </h2>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {projects.slice(0, visibleCount).map((project, idx) => (
            <PortfolioCard key={project.title} project={project} index={idx} />
          ))}
        </div>

        {/* Buttons Container */}
        <div className="mt-16 flex flex-col items-center justify-center gap-4">
          {visibleCount < projects.length && (
            <button
              onClick={() => setVisibleCount((prev) => prev + 4)}
              className="px-8 py-4 rounded-full border border-white/[0.08] bg-[#111113] hover:bg-white/[0.04] hover:border-white/[0.15] text-white font-medium text-sm transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              Load More
            </button>
          )}
          
          <a
            href="#"
            className="px-8 py-4 rounded-full bg-white text-black hover:bg-white/90 font-medium text-sm transition-all duration-300 active:scale-[0.98] flex items-center gap-2"
          >
            View Portfolio
            <ArrowUpRight className="w-4.5 h-4.5 text-black" />
          </a>
        </div>
      </div>
    </section>
  );
}
