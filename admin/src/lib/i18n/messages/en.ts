/**
 * English translation dictionary. Must match the shape of `tr.ts`.
 */
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
    confirm: "Confirm",
    reject: "Reject",
    approve: "Approve",
    pause: "Pause",
    resume: "Resume",
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
    actions: "Actions",
    status: "Status",
    all: "All",
    none: "None",
    yes: "Yes",
    no: "No",
    optional: "optional",
    required: "required",
  },

  app: {
    title: "MarkaRadar Admin",
    adminBadge: "admin",
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

  nav: {
    section: {
      main: "Main",
      content: "Content",
      marketing: "Marketing",
      community: "Community",
      brandStudio: "Brand Studio",
      commerce: "Commerce",
      system: "System",
    },
    dashboard: "Dashboard",
    analytics: "Analytics",
    articles: "Articles",
    aiStudio: "AI Studio",
    comments: "Comments",
    newsletter: "Newsletter",
    reports: "Reports",
    agencies: "Agencies",
    reviewModeration: "Review Moderation",
    jobs: "Jobs",
    academy: "Academy",
    events: "Events & Awards",
    brandAccounts: "Brand Accounts",
    approvalQueue: "Approval Queue",
    premium: "Premium Members",
    users: "Users",
    settings: "Settings",
    auditLog: "Audit Log",
    pages: "Pages (CMS)",
  },

  dashboard: {
    title: "Dashboard",
    subtitle: "How is MarkaRadar doing this week?",
    stat: {
      publishedNews: "Published news",
      newsletterSubs: "Newsletter subscribers",
      premiumMembers: "Premium members",
      listedAgencies: "Listed agencies",
      pendingReviews: "Pending reviews",
      monthlyVisitors: "Monthly visitors",
      activeCourses: "Active courses",
      activeJobs: "Active jobs",
    },
    todayTasks: "Today's tasks",
    recentActivity: "Recent activity",
    noActivity: "No activity yet.",
  },

  login: {
    title: "Admin Sign In",
    subtitle: "Welcome to MarkaRadar Admin",
    email: "Email",
    password: "Password",
    submit: "Sign In",
    submitting: "Signing in...",
    error: "Sign in failed",
  },

  articleStatus: {
    draft: "Draft",
    in_review: "In review",
    scheduled: "Scheduled",
    published: "Published",
    archived: "Archived",
  },

  articles: {
    title: "Articles",
    countLabel: "{count} articles",
    newArticle: "New article",
    firstArticle: "Create the first article",
    empty: "No articles yet.",
    column: {
      title: "Title",
      category: "Category",
      status: "Status",
      author: "Author",
      views: "Views",
      updated: "Updated",
    },
    badge: {
      premium: "Premium",
      sponsored: "Sponsored",
    },
    edit: "Edit",
  },

  aiStudio: {
    title: "AI Studio",
    subtitle: "Generate article drafts, headlines and social posts with AI.",
  },

  newsletter: {
    title: "Newsletter",
    subtitle: 'Daily "Pazarlama 5" composer and subscriber stats.',
  },

  agencies: {
    title: "Agencies",
    subtitle: "{count} agencies · Top 50 ranking: {top} active",
    new: "New agency",
    firstAgency: "Add the first agency",
    empty: "No agencies yet.",
    topRanking: "Türkiye Top 50 Ranking (by review score)",
    moreCount: "+{count} more",
    column: {
      name: "Agency",
      city: "City",
      tier: "Tier",
      reviews: "Reviews",
      verification: "Verification",
    },
  },

  academy: {
    title: "Academy",
    subtitle: "{courses} courses · {cohorts} cohorts",
    newCourse: "New course",
    openCohort: "Open cohort",
    firstCourse: "Create the first course",
    empty: "No courses yet.",
    inactive: "Inactive",
    price: "Price",
    earlyBird: "early bird",
    cohortLabel: "Cohort #{n}",
    enrolledLabel: "enrolled",
    cohortStatus: {
      open: "Open",
      full: "Full",
      in_progress: "In progress",
      completed: "Completed",
      canceled: "Canceled",
    },
  },

  events: {
    title: "Events & Awards",
    subtitle: "{count} events — summit, awards ceremony, webinar",
    new: "New event",
    empty:
      'No events yet. Create one to announce the "Türkiye AI Marketing Awards".',
    juryPage: "Jury page",
    type: {
      summit: "Summit",
      workshop: "Workshop",
      webinar: "Webinar",
      meetup: "Meetup",
      awards: "Awards",
    },
  },

  reviews: {
    title: "Review Moderation Queue",
    subtitle: "{count} reviews awaiting approval. SLA: 72 hours.",
    empty: "No reviews in the queue. Nice work!",
  },

  comments: {
    title: "Comment Moderation",
    subtitle:
      "{count} comments pending approval or review (reported or pending).",
    empty: "Queue is empty.",
    approve: "Approve",
    rejectSpam: "Reject (spam)",
    reportsLabel: "reports",
  },

  analytics: {
    title: "Analytics",
    subtitle:
      "AI usage, traffic, content production and revenue overview.",
    stat: {
      publishedArticles: "Published articles",
      newsletterSubs: "Newsletter subscribers",
      newsletterHint: "Month 12 target: 15,000",
      listedAgencies: "Listed agencies",
      activeJobs: "Active job listings",
    },
    ai: {
      title: "AI Usage — this month",
      generationsLabel: "{count} generations",
      spent: "Spent this month",
      budget: "Budget cap",
      remaining: "Remaining",
      used: "{pct}% used",
      byType: "By type",
      byProvider: "By provider",
      budgetWarn: "Budget {pct}%",
    },
    revenue: {
      title: "Revenue overview",
      subtitle:
        "MRR, sponsored content, agency premium, job listing revenue.",
      phase2:
        "Phase 2: Stripe + iyzico subscription aggregate, sponsored content revenue and agency tier upgrades will surface here.",
    },
  },

  reports: {
    title: "Reports",
    subtitle: "{count} reports — premium PDF library",
    new: "New report",
    empty: "No published reports yet.",
    firstSuggestion:
      'Suggestion: "Türkiye Agency Ecosystem Report 2026" (free — lead magnet)',
    free: "Free",
    includedInTier: "Included in {tier}",
    pages: "pages",
  },

  premium: {
    title: "Premium Members",
    subtitle:
      "MarkaRadar+ subscription management, MRR and churn metrics.",
    tiers: "Tiers",
    perYear: "yr",
    stat: {
      active: "Active members",
      mrr: "MRR (TRY)",
      newThisMonth: "New this month",
      churn: "Churn (30d)",
    },
    hint: {
      active: "From Stripe webhook",
      mrr: "Monthly recurring revenue",
      churn: "Target: < 5%",
    },
    phase2Title: "This page ships in phase 2",
    phase2Body:
      "Stripe + iyzico subscription list, subscriber filters, manual cancel/refund, churn analytics. Coming after /admin/subscriptions endpoints (phase 2) are ready.",
  },

  jobs: {
    title: "Jobs",
    countLabel: "{count} listings",
    new: "New listing",
    empty: "No listings.",
    remote: "Remote",
    column: {
      role: "Role",
      company: "Company",
      seniority: "Seniority",
      plan: "Plan",
      status: "Status",
      viewApply: "Views / Applies",
      expires: "Expires",
    },
    status: {
      pending: "Pending",
      active: "Active",
      expired: "Expired",
      filled: "Filled",
      withdrawn: "Withdrawn",
    },
  },

  users: {
    title: "Users",
    subtitle: "MarkaRadar members, roles and status management.",
    searchPlaceholder: "Search by email or name...",
    countLabel: "{count} users",
    empty: "No users in this filter.",
    column: {
      name: "Name",
      email: "Email",
      role: "Role",
      status: "Status",
      verified: "Verified",
      lastLogin: "Last login",
      joined: "Joined",
      actions: "Actions",
    },
    statusActive: "Active",
    statusInactive: "Inactive",
    verified: "Verified",
    notVerified: "Unverified",
    never: "—",
    deactivate: "Deactivate",
    activate: "Activate",
    changeRole: "Change role",
    confirmDeactivate: "Are you sure you want to deactivate {name}?",
  },

  settings: {
    title: "Settings",
    subtitle: "System configuration and service health.",
    services: {
      title: "Service status",
      database: "Database",
      redis: "Redis (queue + cache)",
      storage: "Object storage (S3/R2)",
      ai: "AI provider",
      mail: "Email service",
      payment: "Payments (Stripe + iyzico)",
      configured: "Configured",
      notConfigured: "Not configured",
      healthy: "Healthy",
      unhealthy: "Unhealthy",
    },
    appInfo: {
      title: "Application",
      version: "Version",
      environment: "Environment",
      uptime: "Uptime",
    },
    aiBudget: {
      title: "AI budget (this month)",
      cap: "Monthly cap",
      used: "Spent this month",
      remaining: "Remaining",
    },
    actions: {
      title: "Quick actions",
      revalidate: "Revalidate web cache",
      flushQueue: "Flush queues",
      sentTest: "Send test email",
    },
    placeholder:
      "This page expands in phase 2 — service status + key facts for now.",
  },

  audit: {
    title: "Audit Log",
    subtitle: "All admin actions (audit trail). Filter + history.",
    countLabel: "{count} entries",
    empty: "No entries in this filter.",
    filter: {
      action: "Action",
      resource: "Resource",
      actorEmail: "Actor email",
      failedOnly: "Failed only",
      apply: "Apply",
      clear: "Clear",
    },
    column: {
      time: "Time",
      actor: "Actor",
      action: "Action",
      resource: "Resource",
      status: "Status",
      changes: "Changes",
    },
    success: "OK",
    failed: "Failed",
    showDetails: "Show details",
    hideDetails: "Hide",
    noChanges: "No diff",
  },

  brandStudio: {
    accounts: {
      title: "Brand Accounts",
      subtitle:
        "Companies awaiting KYC approval and active accounts. Tax number and website compliance checked.",
      empty: "No companies in this filter.",
      filter: {
        all: "All",
        pendingKyc: "Pending KYC",
        active: "Active",
        suspended: "Suspended",
        rejected: "Rejected",
      },
      column: {
        company: "Company",
        contact: "Contact",
        tax: "Tax",
        wallet: "Wallet",
        status: "Status",
        actions: "Actions",
      },
      action: {
        activate: "Activate",
        suspend: "Suspend",
        reactivate: "Reactivate",
        reject: "Reject",
      },
      rejectConfirm: "Are you sure you want to reject {company}?",
      walletAdjust: {
        button: "Adjust wallet",
        title: "Wallet adjustment — {company}",
        currentBalance: "Current balance",
        amount: "Amount (₺)",
        amountHint:
          "Positive value credits (bonus, refund); negative debits (error reversal).",
        reason: "Reason (min 5 chars, written to audit log)",
        reasonPlaceholder: "E.g. complaint refund, promo credit, etc.",
        submit: "Update balance",
        submitting: "Updating...",
        successAdded: "Balance +{amount} ₺ updated",
        successDeducted: "Balance {amount} ₺ deducted",
      },
    },
    campaigns: {
      title: "Brand Campaign Approval Queue",
      subtitle:
        "{count} campaigns awaiting review. Ad regulation compliance, misinformation, brand impersonation checks.",
      reminder:
        "Reminder: Sponsored / editorial ratio must stay below 30%. GDPR/KVKK & ad regulation (RTÜK + 6502) compliance is mandatory.",
      empty: "No campaigns pending approval. Nice work!",
      reviewCreative: "Review creative",
      targeting: "Targeting",
      approveAndPublish: "Approve → publish",
      reject: "Reject",
      rejectReason: "Rejection reason (visible to the brand)",
      rejectPlaceholder:
        'E.g. Non-compliant claim: "only..." is an unmeasurable statement.',
      sendReject: "Send",
      sending: "Sending...",
    },
  },
  forms: {
    newArticle: {
      title: "New Article",
      subtitle: "Auto-fills if you generated draft from AI Studio.",
    },
    editArticle: {
      title: "Edit article",
      subtitle: "Changes apply immediately on save.",
    },
    newAgency: {
      title: "New Agency",
      subtitle: "Add a new agency to the directory. Default tier: free.",
    },
    newCourse: {
      title: "New Course",
      subtitle: "Course details and cohort capacity.",
    },
    newCohort: {
      title: "New cohort",
      subtitle: "Open a new session for the course.",
    },
    newEvent: {
      title: "New Event",
      subtitle: "Summit, webinar, awards.",
    },
    newJob: {
      title: "New Job",
      subtitle: "Job is published based on the plan tier.",
    },
  },
} satisfies MessageTree;
