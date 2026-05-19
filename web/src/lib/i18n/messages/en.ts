import type { MessageTree } from "./tr";

export const en = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    search: "Search...",
    logout: "Sign out",
    backToSite: "Back to site",
    optional: "optional",
    required: "required",
  },

  theme: {
    label: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },

  locale: {
    label: "Language",
    tr: "Türkçe",
    en: "English",
  },

  reportsPage: {
    eyebrow: "Reports",
    title: "Marketing\nindustry reports.",
    subtitle:
      "Research with 120+ marketers, sector trends, AI maturity scoring.",
    empty: "No published reports yet.",
    free: "Free",
    includedInTier: "Included in {tier}",
    pages: "{n} pages",
    downloads: "{count} downloads",
    freeCta: "Download",
    buyCta: "Buy — ₺{price}",
    tierCta: "Subscribe to {tier}",
  },

  eventsPage: {
    eyebrow: "Events",
    title: "Where marketing\ncomes together.",
    subtitle:
      "Summits, awards ceremonies and webinars — for Türkiye marketing professionals.",
    empty: "No announced events yet.",
    registered: "{count} registered",
    learnMore: "Details",
    statusLabel: {
      announced: "Announced",
      registration_open: "Registration open",
      sold_out: "Sold out",
      in_progress: "In progress",
      completed: "Completed",
      canceled: "Canceled",
    },
    typeLabel: {
      summit: "Summit",
      workshop: "Workshop",
      webinar: "Webinar",
      meetup: "Meetup",
      awards: "Awards",
    },
  },

  about: {
    eyebrow: "About",
    title: "Türkiye's\nAI-native marketing media.",
    subtitle:
      "Editorial coverage + agency directory + AI production tool + community — built for marketers.",
    vision: {
      label: "Vision",
      body:
        "Become the daily ritual of Türkiye's marketing professionals. The Turkish hybrid of Morning Brew + Stratechery + Clutch.",
    },
    mission: {
      label: "Mission",
      body:
        'Deliver "brand takeaways" — analytical value beyond news. Make agency selection transparent with verified reviews.',
    },
    whatWeDo: "What we do",
    features: {
      newsletter: "Daily 'Pazarlama 5' — 5-minute morning digest.",
      directory: "AgencyRadar — verified-review agency directory.",
      aiStudio: "AI Studio — 8 formats from one source.",
      premium: "MarkaRadar+ Premium — weekly deep-dives + CMO Slack.",
      awards: "Türkiye AI Marketing Awards — annual program.",
      academy: "MarkaRadar Academy — cohort-based courses.",
    },
    contactCta: {
      title: "Contact",
      body: "Sponsorship, press, partnership:",
      advertise: "Advertise",
      contact: "Contact form",
    },
  },

  contact: {
    eyebrow: "Contact",
    title: "Let's talk.",
    subtitle:
      "Sponsorship, agency premium, press inquiries — reply within 24 hours.",
    email: "Email",
    inbox: "hello@markaradar.com",
    cards: {
      sponsor: {
        title: "Sponsorship + ads",
        desc: "Newsletter, sponsored article, banner. Send brief, reply within 24h.",
        cta: "Send brief",
      },
      agency: {
        title: "Agency premium application",
        desc: "Talk to sales for Featured / Elite tier.",
        cta: "Details",
      },
      press: {
        title: "Press & media",
        desc: "Interviews, demos, partnership requests.",
        cta: "Contact",
      },
    },
  },

  jobsPage: {
    eyebrow: "Careers",
    title: "Marketer's\ncareer board.",
    subtitle:
      "Marketing, ad and brand-side career opportunities — from verified employers.",
    countLabel: "{count} listings",
    searchPlaceholder: "Role or company...",
    allLevels: "All levels",
    remoteOnly: "Remote only",
    filterCta: "Filter",
    clear: "Clear",
    empty: "No active listings yet.",
    remote: "Remote",
    detail: {
      back: "All listings",
      apply: "Apply",
      company: "Company",
      location: "Location",
      seniority: "Level",
      employment: "Type",
      salary: "Salary",
      postedOn: "Posted",
      expiresOn: "Closes",
    },
  },

  academyPage: {
    eyebrow: "Academy",
    title: "The marketer's\nnew-gen education.",
    subtitle:
      "Cohort-based intensive programs, self-paced courses and in-person workshops — with real case studies.",
    empty: "No published courses yet.",
    nextCohort: "Next cohort",
    earlyBird: "Early bird",
    enroll: "Enroll",
    detail: {
      back: "All courses",
      outcomes: "What you'll learn",
      instructor: "Instructor",
      cohorts: "Upcoming cohorts",
      enrolled: "enrolled",
      duration: "{weeks} weeks",
    },
    format: {
      online: "Online",
      inPerson: "In person",
      selfPaced: "Self-paced",
    },
  },

  agencyDirectory: {
    eyebrow: "Verified reviews",
    title: "Türkiye's\nagency directory.",
    subtitle:
      "Customer email + LinkedIn-verified reviews. Find the right agency with trusted feedback.",
    countLabel: "{count} agencies",
    searchPlaceholder: "Agency, service, location...",
    allTiers: "All tiers",
    cityPlaceholder: "City",
    filterCta: "Filter",
    clear: "Clear",
    empty: "No agencies match this filter.",
    seeAll: "See all agencies",
    verified: "Verified",
    reviewCount: "{count} reviews",
    detail: {
      back: "All agencies",
      reviewsTab: "Reviews",
      aboutTab: "About",
      teamSize: "Team size",
      founded: "Founded",
      services: "Services",
      industries: "Industries",
      writeReview: "Write a review",
      noReviews: "No reviews yet.",
    },
  },

  advertise: {
    eyebrow: "Brand Studio",
    title: "Buy the ad,\nlet AI build it.",
    subtitle:
      "Generate sponsored content in Turkish with AI and publish on MarkaRadar. KVKK-compliant, self-serve, wallet-based.",
    primaryCta: "Create brand account",
    secondaryCta: "Book a demo",

    how: {
      eyebrow: "How it works",
      title: "Live in 4 steps.",
      step1Title: "Create brand account",
      step1Desc: "Company info + tax ID. 5 minutes.",
      step2Title: "Generate with AI",
      step2Desc:
        "8 formats — banner, sponsored article, newsletter blurb, reels script…",
      step3Title: "Budget + dates",
      step3Desc:
        "Top up wallet, pick placement, launch. Min ₺5,000.",
      step4Title: "Editor approval + publish",
      step4Desc: "Reviewed within 24h. Auto-publishes after approval.",
    },

    pricing: {
      eyebrow: "Transparent pricing",
      title: "Wallet + approval based.",
      subtitle:
        "No monthly subscription. 100% of your top-up goes to campaigns.",
      minBudgetTitle: "Min ₺5,000 / campaign",
      minBudgetDesc: "Right starting point for small tests.",
      cpmTitle: "CPM ₺80-180",
      cpmDesc: "By placement and segment. Transparent invoicing.",
      approvalTitle: "24h approval",
      approvalDesc: "Editorial team review. Rejection rate 12%.",
      noLockInTitle: "No lock-in",
      noLockInDesc: "Unspent balance refunded. No contract.",
    },

    rules: {
      eyebrow: "Editorial rules",
      title: "What content gets rejected?",
      r1: "Misleading advertising (ad regulation violation).",
      r2: "Naming and attacking competitors.",
      r3: 'Unprovable claims like "best", "only", "champion".',
      r4: "Sponsored content that doesn't disclose sponsorship.",
      r5: "Personal data collection that violates KVKK/GDPR.",
      r6: "Pressure that undermines editorial independence.",
    },

    faq: {
      title: "Frequently asked",
      q1: "Which brands can apply?",
      a1: "Any tax-registered company in Türkiye. MLM, gambling, alcohol+tobacco not accepted.",
      q2: "How long does AI generation take?",
      a2: "10-30 seconds per format. 8 formats can be generated in parallel.",
      q3: "Can I use multiple creatives in one campaign?",
      a3: "No — one creative per campaign. Create new campaigns with the same budget.",
      q4: "What if I cancel a campaign — do I get a refund?",
      a4: "Unspent balance is refunded within 14 business days.",
    },
  },

  premiumPage: {
    eyebrow: "MarkaRadar+",
    title: "For marketing professionals.",
    subtitle:
      "Weekly deep dives, CMO Club Slack access, and the only AI-native Türkiye marketing index.",
    yearly: "yr",
    seats: "{n} seats included",
    cta: "Subscribe",
    foundingCta: "Become a Founding Member",
    badgePopular: "Most popular",
    badgeFounding: "Limited: first 200",
    noTiers: "Pricing failed to load.",
    paymentBanner:
      "Stripe for international, iyzico for TL. 30-day money-back guarantee. VAT included.",
    faq: {
      title: "Frequently asked",
      q1: "How do I cancel?",
      a1: "One-click cancel any time. Access continues until the end of the current period.",
      q2: "How often is premium content published?",
      a2: "Marka Hamlesi 1-2× weekly, sector reports quarterly, premium webinar monthly.",
      q3: "Can I pay in Turkish Lira?",
      a3: "Yes — iyzico shows TL pricing. 3D Secure supported.",
      q4: "Can I get a company invoice?",
      a4: "Yes — enter company name + tax ID via Stripe or iyzico for an e-archive invoice.",
    },
  },

  landing: {
    hero: {
      eyebrow: "Türkiye's AI-native marketing media",
      title: "Catch up with marketing\nat AI speed.",
      subtitle:
        "Daily intelligence on ads, brands and agencies — analytical, verified, with takeaways for brands.",
      emailPlaceholder: "your work email",
      cta: "Subscribe to Pazarlama 5",
      micro: "12,000+ marketers · free · no spam",
    },
    trust: {
      label: "Read at companies like",
    },
    publications: {
      eyebrow: "Publications",
      heading: "Marketing seen from every angle",
      subtitle: "Strategy for brands, market data for agencies, daily intel for all.",
      pazarlama5: {
        title: "Pazarlama 5",
        meta: "Daily · free",
        desc: "Every morning at 08:30 — Türkiye + global marketing in 5 minutes.",
        cta: "Subscribe",
      },
      markaHamlesi: {
        title: "Marka Hamlesi",
        meta: "Weekly · premium",
        desc: "Deep brand strategy analysis with numbers — what worked, what didn't.",
        cta: "Read sample",
      },
      ajansRehberi: {
        title: "Agency Directory",
        meta: "Always fresh · free",
        desc: "Türkiye's first verified-review agency database.",
        cta: "Explore",
      },
      brandStudio: {
        title: "Brand Studio",
        meta: "Self-serve · brand-specific",
        desc: "If you're a brand, generate ads with AI and publish on MarkaRadar.",
        cta: "Create account",
      },
    },
    semaform: {
      eyebrow: "AI-native analysis",
      title: "4 perspectives in every story.",
      subtitle:
        'Not just "what happened" — concrete takeaways for brands and agencies. Only on MarkaRadar.',
      labels: {
        news: "News",
        brand: "Brand take",
        agency: "Agency take",
        notable: "Notable",
      },
      example: {
        headline: "Coca-Cola Türkiye shifts to AI-driven campaigns",
        lede: "The brand moved 40% of its 2026 TVC budget to AI production platforms.",
        brandTake:
          "For CMOs: production cost down 60%, but brand-fit review must stay with humans.",
        agencyTake:
          "For agencies: TVC briefs will drop 30% within 6 months — plan a new service layer.",
        notable:
          "First time budget shift to AI breaks 40% · Five agencies still the main partner · Ad regulation review possible in 12 months",
      },
    },
    premium: {
      eyebrow: "Premium",
      title: "See the inside of marketing.",
      subtitle:
        "₺49/mo. Full Marka Hamlesi access, reports, premium webinar archive.",
      cta: "View Premium",
      free: {
        title: "Free",
        item1: "Daily Pazarlama 5",
        item2: "News archive",
        item3: "Agency Directory basic",
      },
      paid: {
        title: "MarkaRadar+",
        item1: "Full Marka Hamlesi access",
        item2: "Industry reports (4/year)",
        item3: "Academy discount (30%)",
        item4: "Premium webinar archive",
      },
    },
    studioCta: {
      eyebrow: "For brands",
      title: "Buy the ad, let AI build it.",
      subtitle:
        "Generate sponsored content in Turkish with AI and publish on MarkaRadar. KVKK-compliant, self-serve, wallet-based.",
      cta: "Create brand account",
      learn: "How it works",
    },
    audience: {
      eyebrow: "Who it's for",
      title: "Separate value for brands, agencies, and creators",
      subtitle: "One platform, three distinct use cases.",
      tabs: {
        brand: "Brands",
        agency: "Agencies",
        creator: "Creator",
      },
      brand: {
        f1: {
          title: "Sector intel",
          desc: "Which campaign delivered in Türkiye? Evidence-based decisions at the CMO level.",
        },
        f2: {
          title: "Brand Studio",
          desc: "Generate ad content with AI, reach MarkaRadar's 12,000+ marketer audience.",
        },
        f3: {
          title: "Verified ecosystem",
          desc: "Verified agency directory and reviews — make meaningful choices.",
        },
      },
      agency: {
        f1: {
          title: "Visibility",
          desc: "Brand clients discover you in Türkiye's first verified review agency directory.",
        },
        f2: {
          title: "Job platform",
          desc: "Premium plan reaches 12,000+ marketers — 3x more applicants.",
        },
        f3: {
          title: "Competitive intel",
          desc: "Which agency won which brief, AI readiness — see the whole market.",
        },
      },
      creator: {
        f1: {
          title: "Academy",
          desc: "AI Prompt, Performance, Brand Strategy — cohort training with sector experts.",
        },
        f2: {
          title: "Publish",
          desc: "MarkaRadar contributor program — publish your work, reach an audience.",
        },
        f3: {
          title: "Reports",
          desc: "Türkiye Agency Ecosystem, AI Maturity Index — first-hand data.",
        },
      },
    },
    faq: {
      eyebrow: "FAQ",
      title: "Whatever's on your mind, here.",
      q1: {
        q: "Is MarkaRadar free?",
        a: "All core content is free. Premium membership (yearly) unlocks deep analysis, reports, and academy discounts.",
      },
      q2: {
        q: "How does Brand Studio work?",
        a: "Open a brand account → fund the wallet in TRY → generate content with AI → publish on MarkaRadar after moderation. CPC-based billing.",
      },
      q3: {
        q: "Is the agency directory paid?",
        a: "Free visibility — Free tier. Premium tiers (Featured/Elite) unlock featured placement, keyword bidding, lead forms.",
      },
      q4: {
        q: "Are you KVKK compliant?",
        a: "Yes — we meet all data controller obligations. Download your data or delete your account from /me.",
      },
      q5: {
        q: "Is content written by AI?",
        a: "No. Editors write articles. AI assists with summaries, categorization, and brand/agency takeaways only. AI-Human Ratio is shown transparently on every article.",
      },
    },
    recent: {
      title: "Latest stories",
      subtitle: "What's making waves in marketing",
      all: "All stories",
    },
  },

  marketing: {
    nav: {
      home: "Home",
      aiMarketing: "AI Marketing",
      agencyDirectory: "Agencies",
      jobs: "Jobs",
      academy: "Academy",
      premium: "Premium",
      brandStudio: "Brand Studio",
    },
    auth: {
      login: "Sign in",
      register: "Sign up",
      logout: "Sign out",
    },
    footer: {
      tagline: "Türkiye's AI-native marketing media",
      sectionDiscover: "Discover",
      sectionCompany: "Company",
      sectionLegal: "Legal",
      about: "About",
      contact: "Contact",
      advertise: "Advertise",
      mediaKit: "Media Kit",
      kvkk: "KVKK",
      privacy: "Privacy",
      cookie: "Cookies",
      tos: "Terms",
      rights: "All rights reserved.",
      reports: "Reports",
    },
  },

  auth: {
    common: {
      submitting: "Submitting...",
    },
    login: {
      title: "Sign in",
      subtitle: "Don't have an account?",
      createAccount: "Create account",
      email: "Email",
      password: "Password",
      forgot: "Forgot?",
      submit: "Sign In",
      submitting: "Signing in...",
      failed: "Sign in failed",
    },
    register: {
      title: "Create account",
      subtitle: "Already a member?",
      login: "Sign in",
      fullName: "Full name",
      email: "Email",
      password: "Password",
      passwordHint: "Min 8 characters",
      submit: "Create account",
      submitting: "Creating account...",
      failed: "Sign up failed",
    },
    forgot: {
      title: "Forgot password",
      subtitle: "Enter your email and we'll send a reset link.",
      email: "Email",
      submit: "Send reset link",
      submitting: "Sending...",
      backToLogin: "Back to sign in",
      sent: "If that email exists in our system, a link has been sent.",
    },
    reset: {
      title: "Set new password",
      subtitle: "Enter your new password.",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      submit: "Update password",
      submitting: "Updating...",
      mismatch: "Passwords don't match",
      success: "Password updated. You can sign in now.",
    },
    verify: {
      title: "Email verification",
      verifying: "Verifying...",
      success: "Your email is verified.",
      failed: "Verification failed. Link invalid or expired.",
      goLogin: "Sign in",
    },
  },

  brandPortal: {
    nav: {
      dashboard: "Overview",
      ai: "Brand AI Studio",
      campaigns: "Campaigns",
      wallet: "Wallet",
      reports: "Reports",
      team: "Team",
    },
    studioLabel: "Brand Studio",
    balance: "Balance",
    pendingKyc: "KYC approval pending",

    dashboard: {
      hello: "Hello, {company}",
      subtitle:
        "Generate ads with AI, launch campaigns, track performance.",
      kycCardTitle: "Complete your KYC",
      kycCardBody:
        "Before launching a campaign we need to verify your tax info. Required for ad regulation compliance.",
      stat: {
        balance: "Wallet balance",
        activeCampaigns: "Active campaigns",
        impressions: "Total impressions",
        clicks: "{count} clicks",
      },
      quickActions: "Quick actions",
      action: {
        generate: "Generate ad content with AI",
        newCampaign: "Start a new campaign",
        recharge: "Top up wallet (Stripe)",
        topUp: "Top up",
        seeAll: "See all",
      },
      recentCampaigns: "Recent campaigns",
      emptyCampaigns:
        "No campaigns yet. Generate an ad in AI Studio and publish.",
    },

    kyc: {
      taxNumber: "Tax No",
      taxNumberPlaceholder: "10-11 digits",
      taxOffice: "Tax Office",
      taxOfficePlaceholder: "Beşiktaş VD",
      website: "Website",
      submit: "Submit KYC",
      submitting: "Submitting...",
      ok: "KYC details saved",
    },

    ai: {
      title: "Generate ad content",
      subtitle:
        "Turkish, MarkaRadar editorial tone, sponsored content. Launch posts, case studies, banner briefs, newsletter blurbs and more.",
      contentType: "Content type",
      output: "Output",
      creativeName: "Creative name",
      creativeNamePlaceholder: "Name shown in the library",
      clickUrl: "Click URL (optional)",
      generate: "Generate",
      generating: "Generating...",
      save: "Save to library",
      saved: "Creative saved (publish via Campaigns > New)",
    },

    campaigns: {
      title: "Ad Campaigns",
      subtitle: "Publish AI-generated creatives as campaigns.",
      new: "New campaign",
      empty: "No campaigns yet",
      emptyBody:
        "Generate an ad in AI Studio first, then launch a campaign.",
      goToAi: "Go to AI Studio",
      startManual: "Start a manual campaign",
      column: {
        impressions: "Impressions",
        clicks: "Clicks",
        budget: "Budget",
      },
      status: {
        draft: "Draft",
        pending_approval: "In review",
        scheduled: "Scheduled",
        active: "Live",
        paused: "Paused",
        completed: "Completed",
        canceled: "Canceled",
        rejected: "Rejected",
      },
      detail: {
        backToCampaigns: "Campaigns",
        rejectedReason: "Rejection reason",
        details: "Campaign details",
        goal: "Goal",
        source: "Source",
        targeting: "Targeting",
        impressions: "Impressions",
        clicks: "Clicks",
        ctr: "CTR",
        spent: "Spent",
        budgetLabel: "Budget: {value} ₺",
        actions: "Actions",
        pause: "Pause campaign",
        resume: "Resume campaign",
        noActions: "No actions available in the current status.",
      },
      builder: {
        title: "Create Self-Serve Campaign",
        subtitle:
          "Pick a ready creative, set audience + budget + dates. Goes live automatically after approval.",
        step1: "1. Campaign details",
        step2: "2. Pick a creative",
        step3: "3. Targeting (optional)",
        step4: "4. Budget & dates",
        name: "Campaign name",
        namePlaceholder: "Spring Launch 2026",
        goal: "Goal",
        type: "Type",
        placement: "Placement",
        placementOpt: {
          homepageTop: "Homepage Top (970x250) — high visibility",
          categoryTop: "Category Top — segment-specific",
          sidebar: "Sidebar Sticky (300x600)",
          articleInline: "In-article (728x90)",
          mobileSticky: "Mobile Sticky bottom",
          newsletter: "Newsletter Top — Pazarlama 5",
        },
        typeOpt: {
          banner: "Banner",
          sponsored: "Sponsored content (Brand Story)",
          newsletter: "Newsletter sponsorship",
          native: "Native (in-feed)",
        },
        goalOpt: {
          awareness: "Brand awareness",
          traffic: "Traffic",
          leadGen: "Lead generation",
          brandStory: "Brand story",
        },
        creativeReady: "ready",
        creativeApprove: "Approve",
        noCreativesYet: "No creatives yet.",
        generateFromAi: "Generate from AI Studio",
        audience: "Audience description",
        audiencePlaceholder: "35-50 y/o, FMCG CMO",
        categories: "Categories (comma-separated)",
        categoriesPlaceholder: "ai-marketing, performance",
        cities: "Cities (comma-separated)",
        citiesPlaceholder: "Istanbul, Ankara",
        budget: "Total budget (₺)",
        budgetHint: "Min ₺5,000. Debited from wallet.",
        startAt: "Start date",
        endAt: "End date",
        balanceLabel: "Current balance: ",
        balanceInsufficient: "Insufficient balance. ",
        topUp: "Top up",
        nextStep: "Next step",
        flow1: "1. Editorial team reviews within 24 hours",
        flow2: "2. Ad regulation compliance check",
        flow3: "3. Budget is reserved after approval",
        flow4: "4. Auto publishes on the start date",
        submit: "Submit for approval",
        submitting: "Submitting...",
        fillRequired: "Fill all required fields",
        minBudget: "Minimum budget is ₺5,000",
      },
    },

    wallet: {
      title: "Ad Budget",
      subtitle:
        "Campaign spend is debited from the wallet. Top up via Stripe — instantly usable.",
      balance: "Current balance",
      spent: "Total spent",
      topped: "Total top-ups",
      rechargeTitle: "Top Up Wallet",
      rechargeSubtitle:
        "Stripe Checkout. KVKK compliant. Min ₺1,000.",
      customAmount: "Custom amount (₺)",
      customAmountHint:
        "Min ₺1,000 — Max ₺500,000 per single recharge",
      payWith: "Top up ₺{amount} via Stripe",
      paymentFailed: "Could not start payment",
      minAmount: "Minimum top-up is ₺1,000",
    },

    reports: {
      title: "Performance Reports",
      subtitle: "Aggregate performance across all your campaigns.",
      stat: {
        impressions: "Total impressions",
        clicks: "Total clicks",
        spent: "Total spent",
        ctr: "CTR",
        cpc: "Average CPC",
        cpm: "Average CPM",
      },
      campaignBreakdown: "By campaign",
      empty: "No data yet — start a campaign.",
      column: {
        campaign: "Campaign",
        impressions: "Impressions",
        clicks: "Clicks",
        ctr: "CTR",
        spent: "Spent",
      },
    },

    team: {
      title: "Company Team",
      subtitle: "Manage who can access the ads panel.",
      inviteTitle: "Invite a new member",
      inviteHint:
        "The invitee must register on MarkaRadar first, then they can be added here.",
      email: "Email",
      role: "Role",
      sendInvite: "Send invite",
      sending: "Sending...",
      sent: "Invite sent",
      rolesTitle: "Roles",
      roles: {
        owner: "Owner — Full access, billing",
        manager: "Manager — Campaign mgmt + invites",
        editor: "Editor — Can generate creatives and launch campaigns",
        viewer: "Viewer — Read-only (reports)",
      },
    },

    signup: {
      tagline: "MarkaRadar Brand Studio",
      title: "Create a brand account",
      subtitle:
        "Generate ad content with AI and publish on MarkaRadar. Turkish, KVKK-compliant, self-serve.",
      companyName: "Company name",
      contactName: "Contact person",
      contactPhone: "Phone",
      contactEmail: "Work email",
      industry: "Industry",
      industryPlaceholder: "FMCG, banking, SaaS...",
      companySize: "Company size",
      companySizePlaceholder: "Select",
      website: "Website",
      password: "Password",
      passwordHint: "Min 8 chars — upper/lower + digit recommended",
      submit: "Create brand account",
      submitting: "Creating account...",
      tos1: "By signing up you accept our ",
      tos2: " and ",
      tos3: ".",
      tosTerms: "Terms of Use",
      tosKvkk: "KVKK Privacy Notice",
      already: "Already registered?",
      login: "Sign in",
      passwordTooShort: "Password must be at least 8 characters",
      fillRequired: "Fill all required fields",
    },
  },
} satisfies MessageTree;
