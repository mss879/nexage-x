/**
 * Service catalogue — the single source for service copy.
 *
 * The pages (homepage Services accordion, /services/software,
 * /services/logistics) render these, and lib/ai-knowledge.ts feeds the same
 * text to the AI assistant, so the agent can never describe a service
 * differently from the website. Icons stay in the components.
 */

export interface HomeService {
  id: string;
  num: string;
  title: string;
  description: string;
  includes?: string;
  deliverable: string;
  keywords: string[];
}

/** Homepage "What we do" → E-Commerce Growth tab */
export const HOME_ECOMMERCE_SERVICES: HomeService[] = [
  {
    id: "brand-setup",
    num: "001",
    title: "Brand & Store Setup",
    description: "We build your brand foundation and launch-ready online store from the ground up, including identity, visuals, store setup, payments, shipping, and mobile optimization.",
    includes: "Brand identity, logo design, packaging design, product photography, Shopify setup, domain and email setup, payment gateway integration, shipping setup, mobile optimization, and conversion-focused UI/UX.",
    deliverable: "A fully launch-ready online store.",
    keywords: ["IDENTITY", "LOGO", "SHOPIFY SETUP", "LAUNCH READY"],
  },
  {
    id: "store-dev",
    num: "002",
    title: "Store Development & Customization",
    description: "We design and develop high-performing e-commerce stores tailored to your products, customers, and business goals.",
    includes: "Custom Shopify sections, theme customization, product page optimization, collection setup, checkout improvements, upsell features, app integrations, and performance optimization.",
    deliverable: "A customized online store built for speed, trust, and conversions.",
    keywords: ["THEME CUSTOMIZATION", "SHOPIFY SECTIONS", "SPEED", "CONVERSIONS"],
  },
  {
    id: "retention-loyalty",
    num: "003",
    title: "Retention & Loyalty Systems",
    description: "We help brands increase repeat purchases through customer retention, loyalty, and automated engagement systems.",
    includes: "Email marketing flows, SMS campaigns, loyalty programs, referral systems, abandoned cart recovery, customer win-back campaigns, and post-purchase automation.",
    deliverable: "A retention system that keeps customers engaged and buying again.",
    keywords: ["EMAIL FLOWS", "SMS CAMPAIGNS", "LOYALTY", "AUTOMATIONS"],
  },
  {
    id: "perf-marketing",
    num: "004",
    title: "Performance Marketing",
    description: "We create and manage data-driven advertising campaigns that help e-commerce brands attract customers and generate sales.",
    includes: "Meta Ads, Google Ads, campaign strategy, creative direction, audience targeting, retargeting, conversion tracking, and performance reporting.",
    deliverable: "A paid advertising system focused on traffic, conversions, and return on ad spend.",
    keywords: ["META ADS", "GOOGLE ADS", "RETARGETING", "ROI OUTCOME"],
  },
  {
    id: "ops-automation",
    num: "005",
    title: "Operations & Automation",
    description: "We streamline your e-commerce operations using automation, integrations, and smart backend systems.",
    includes: "Inventory syncing, ERP integrations, warehouse automation, CRM setup, customer service systems, WhatsApp integrations, AI chatbots, Make.com automation, and Shopify Flow automation.",
    deliverable: "A more efficient e-commerce operation with fewer manual tasks and better control.",
    keywords: ["INTEGRATIONS", "SYNCING", "MAKE.COM", "AI CHATBOTS"],
  },
  {
    id: "marketplace-exp",
    num: "006",
    title: "Marketplace Expansion",
    description: "We help brands expand beyond their own website by setting up and optimizing marketplace sales channels.",
    includes: "Amazon setup, Noon setup, product listing creation, marketplace account configuration, catalog structuring, and basic marketplace optimization.",
    deliverable: "Your products listed and ready to sell across major marketplaces.",
    keywords: ["AMAZON SETUP", "NOON SETUP", "LISTINGS", "EXPANSION"],
  },
  {
    id: "fulfillment-mgmt",
    num: "007",
    title: "Fulfillment Management",
    description: "We manage the operational side of shipping and order fulfillment so brands can focus on growth.",
    includes: "Warehouse coordination, pick and pack management, inventory monitoring, shipping label generation, COD management, return handling, and international shipping coordination.",
    deliverable: "A reliable fulfillment process that keeps orders moving smoothly.",
    keywords: ["WAREHOUSE COORD", "PICK AND PACK", "COD MGMT", "SHIPPING LABELS"],
  },
];

/** Homepage "What we do" → Business Automation tab */
export const HOME_AUTOMATION_SERVICES: HomeService[] = [
  {
    id: "workflow-automation",
    num: "001",
    title: "Workflow Automation Systems",
    description: "We automate repetitive business tasks so your team can save time, reduce errors, and operate more efficiently.",
    deliverable: "Automated workflows that save time and eliminate manual errors.",
    keywords: ["INTEGRATIONS", "API SYNC", "TASK AUTOMATION", "ERROR REDUCTION"],
  },
  {
    id: "content-automation",
    num: "002",
    title: "Content Automation Systems",
    description: "We build systems that help plan, create, organize, and publish content faster across multiple platforms.",
    deliverable: "A central publishing and automation system for digital media.",
    keywords: ["CONTENT SCHEDULING", "DYNAMIC TEMPLATES", "MULTI-PLATFORM", "AUTO-PUBLISH"],
  },
  {
    id: "ai-assistants",
    num: "003",
    title: "AI Assistants & Chatbots",
    description: "We create AI-powered assistants and chatbots that can support customers, answer questions, qualify leads, and handle routine tasks.",
    deliverable: "An intelligent AI chatbot working 24/7 to capture and support leads.",
    keywords: ["LEAD QUALIFICATION", "CUSTOMER SUPPORT", "NLP ENGINES", "CRM SYNC"],
  },
  {
    id: "consulting-audits",
    num: "004",
    title: "Consulting & Automation Audits",
    description: "We review your current systems, identify bottlenecks, and recommend practical automation solutions for your business.",
    deliverable: "A complete automation strategy report tailored to your business.",
    keywords: ["BOTTLENECK ANALYSIS", "PIPELINE AUDITS", "ROI ESTIMATES", "ARCH PLANS"],
  },
  {
    id: "smart-websites",
    num: "005",
    title: "Smart Websites",
    description: "We build modern, SEO-optimized websites designed to look professional, load fast, and convert visitors into leads or customers.",
    deliverable: "A fast, modern website built to turn traffic into paying leads.",
    keywords: ["SEO OPTIMIZATION", "STATIC BUILDS", "RESPONSIVE UI", "CONVERSION FLOWS"],
  },
  {
    id: "smart-campaigns",
    num: "006",
    title: "Smart Ad Campaigns",
    description: "We plan, launch, and optimize targeted advertising campaigns across platforms to help businesses generate leads, sales, and measurable growth.",
    deliverable: "High-ROI ad campaigns built to generate predictable business growth.",
    keywords: ["AUDIENCE RESEARCH", "PERFORMANCE TRACK", "AD TESTING", "BUDGET CONTROL"],
  },
  {
    id: "web-apps",
    num: "007",
    title: "Web Apps",
    description: "We design and develop custom web applications built around your business needs, workflows, and customer experience.",
    deliverable: "A custom-coded web application designed to run your business operations.",
    keywords: ["CUSTOM WORKFLOWS", "USER INTERFACES", "CLOUD COMPUTE", "DATABASE ARCH"],
  },
  {
    id: "smart-funnels",
    num: "008",
    title: "Smart Funnels",
    description: "We create conversion-focused funnels that guide visitors from interest to action through landing pages, forms, automations, and follow-up systems.",
    deliverable: "A high-converting marketing funnel that guides visitors to take action.",
    keywords: ["LANDING PAGES", "FORM BUILDERS", "SEQUENTIAL EMAILS", "CONVERSION HOOKS"],
  },
  {
    id: "custom-backend",
    num: "009",
    title: "Custom Backend Systems",
    description: "We build secure backend systems that manage data, users, operations, dashboards, and business processes.",
    deliverable: "A robust backend engine to manage data, security, and users.",
    keywords: ["SECURE DATABASES", "API GATEWAYS", "DASHBOARD LOGIC", "SYSTEM INTEGRITY"],
  },
  {
    id: "brand-kits",
    num: "010",
    title: "Brand Kits",
    description: "We create professional brand kits that give your business a consistent visual identity across websites, ads, social media, and marketing materials.",
    deliverable: "A unified visual identity guidelines package for all materials.",
    keywords: ["COLOR PALETTES", "LOGO SUITES", "VECTOR BRANDING", "STYLE MANUALS"],
  },
  {
    id: "chat-voice-agents",
    num: "011",
    title: "AI Chat Agents & Voice Agents",
    description: "We build AI chat and voice agents that can handle customer conversations, answer inquiries, capture leads, and support business operations.",
    deliverable: "AI chat and voice agents operating seamlessly across calls and text.",
    keywords: ["NATURAL DIALOGUE", "LEAD CAPTURE", "INTEGRATED CHANNELS", "SUPPORT AGENTS"],
  },
  {
    id: "odoo-zoho-integration",
    num: "012",
    title: "Website + Odoo & Zoho Integration",
    description: "We connect your website and storefront to Odoo ERP and tools like Zoho — unifying CRM, inventory, accounting, and order fulfilment into one synchronized system with no manual re-entry.",
    includes: "Odoo ERP integration, Zoho CRM & Books sync, two-way product/customer/order sync, invoicing automation, inventory and stock syncing, payment reconciliation, custom Odoo modules, and API middleware between your site and back office.",
    deliverable: "A fully integrated website wired into Odoo/Zoho with reliable two-way data sync.",
    keywords: ["ODOO ERP", "ZOHO CRM", "TWO-WAY SYNC", "UNIFIED DATA"],
  },
];

/** /services/software */
export const SOFTWARE_SERVICES: { num: string; title: string; body: string; featured: boolean }[] = [
  { num: "01", title: "Custom Web & Web Apps", body: "Bespoke, production-grade applications built around your workflows — fast, secure and scalable.", featured: false },
  { num: "02", title: "Smart Websites", body: "SEO-optimised, lightning-fast marketing sites engineered to convert traffic into pipeline.", featured: false },
  { num: "03", title: "E-commerce & Shopify", body: "High-converting storefronts, custom sections and checkout optimisation built for revenue.", featured: false },
  { num: "04", title: "AI Assistants & Chatbots", body: "24/7 AI agents that qualify leads, support customers and handle routine work across channels.", featured: false },
  { num: "05", title: "Workflow Automation", body: "Connect your tools and eliminate manual tasks with reliable, monitored automation pipelines.", featured: false },
  { num: "06", title: "Custom Backend Systems", body: "Secure databases, APIs and dashboards that run the operational core of your business.", featured: false },
  { num: "07", title: "Website + Odoo & Zoho Integration", body: "Wire your site and storefront directly into Odoo ERP and Zoho — one synchronized source of truth across CRM, inventory, accounting and fulfilment.", featured: true },
  { num: "08", title: "Brand Kits & Identity", body: "A consistent visual system across product, web, ads and social — unmistakably yours.", featured: false },
];

/** What a website ↔ Odoo / Zoho integration keeps in sync (/services/software) */
export const ODOO_ZOHO_SYNC_ITEMS = ["Products & catalogue", "Customers & contacts", "Orders & invoices", "Inventory & stock levels", "Payments & reconciliation", "Chart of accounts & taxes"];

/** /services/logistics */
export const LOGISTICS_SERVICES: { num: string; title: string; body: string; accent?: boolean }[] = [
  { num: "01", title: "Fulfilment Management", body: "Pick, pack and dispatch handled end-to-end so every order moves the moment it lands." },
  { num: "02", title: "Warehousing", body: "Secure storage with real-time inventory monitoring and stock-level syncing to your store." },
  { num: "03", title: "Freight & Shipping", body: "Air, sea and ground freight coordination with the right carrier for every lane." },
  { num: "04", title: "COD Management", body: "Cash-on-delivery handling, reconciliation and reporting built for emerging markets." },
  { num: "05", title: "Returns & Reverse Logistics", body: "Painless returns, inspection and restocking that protect margin and the customer." },
  { num: "06", title: "International Shipping", body: "Cross-border coordination, customs docs and duties handled without the headaches." },
  { num: "07", title: "Inventory Sync", body: "Live two-way stock sync between warehouse, storefront and ERP — no overselling.", accent: true },
  { num: "08", title: "Last-Mile Delivery", body: "Reliable final-leg delivery partners with tracking your customers actually trust." },
];

/** The fulfilment flow, in order (/services/logistics) */
export const LOGISTICS_FLOW: { step: string; title: string; body: string }[] = [
  { step: "01", title: "Receive", body: "Inbound stock checked, logged and shelved." },
  { step: "02", title: "Store", body: "Inventory tracked live and synced to your store." },
  { step: "03", title: "Pick & Pack", body: "Orders fulfilled fast with branded packaging." },
  { step: "04", title: "Ship", body: "Best-fit carrier selected for every destination." },
  { step: "05", title: "Track & Return", body: "Live tracking plus effortless reverse logistics." },
];
