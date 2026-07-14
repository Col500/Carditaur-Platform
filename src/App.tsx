import { AdminFlyers } from './components/AdminFlyers';
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TemplateDebugger } from "./components/TemplateDebugger";
import { ScalingIframe } from "./components/ScalingIframe";
import {
  RecommendationService,
  BusinessProfile,
  BrandTone,
  BusinessType,
  RecommendationResult,
} from "./engine";
import {
  Sparkles,
  Plus,
  Building2,
  MapPin,
  Check,
  Globe,
  Palette,
  Eye,
  Download,
  Copy,
  Calendar,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  AlertCircle,
  X,
  Upload,
  Trash2,
  Edit,
  User,
  Gift,
  Heart,
  Smile,
  Users,
  BookOpen,
  Cpu,
  Award,
  Leaf,
  Image as ImageIcon,
  Clapperboard,
  Maximize2,
  Minimize2,
  Camera
} from "lucide-react";

interface Occasion {
  id: string;
  name: string;
  category: string;
  date: string;
  is_dynamic_date: boolean;
  countries: string[];
  imageKeywords: string[];
  designElements: string[];
  suggestedColors?: string[];
  enabled?: boolean;
  globalPriority?: number;
  recommendedIndustries?: string[];
  targetBusinessTypes?: "B2B" | "B2C" | "Both" | "All";
  compatibleBrandTones?: string[];
  mandatory?: boolean;
}

const CORE_EVENTS = ["christmas", "new_years_day", "valentines_day", "easter_sunday", "democracy_day", "nigeria_independence_day"];

interface Business {
  id: string;
  businessName: string;
  industry: string;
  location: string;
  logoUrl?: string;
  brandColor: string;
  accentColor: string;
  extractedColors?: string[];
  subscribedOccasions: string[];
  countries: string[];
  createdAt: string;
  pendingDeletionDate?: string | null;
  profileType?: "business" | "individual";
  customEvents?: {
    id: string;
    name: string;
    date: string;
    type: "birthday" | "anniversary" | "other";
    notes?: string;
  }[];
  phone?: string;
  email?: string;
  instagram?: string;
  xUsername?: string;
  description?: string;
  businessType?: "B2B" | "B2C" | "Both";
  brandTone?: "corporate" | "friendly" | "playful" | "premium";
  signOffName?: string;
  signOffRole?: string;
  useSignOff?: boolean;
}

interface FlyerResponse {
  success: boolean;
  imageUrl: string;
  isHTMLFallback: boolean;
  flyerData: {
    businessName: string;
    industry: string;
    logoUrl?: string;
    brandColor: string;
    accentColor: string;
    occasionName: string;
    greetingMessage: string;
    stockImageUrl: string;
  };
}

const AVAILABLE_COUNTRIES = [
  "Nigeria",
  "South Africa",
  "Kenya",
  "Ghana",
  "Africa",
  "United States",
  "Canada",
  "Germany",
  "France",
  "Australia",
  "India",
  "Japan",
  "Brazil",
  "China",
  "Custom",
];

const BUSINESS_TAGLINE_TEMPLATES = [
  {
    label: "Faith & Community",
    text: "Faith-based community group centering on religious connection, charity, and hope.",
  },
  {
    label: "Democracy & Civic Engagement",
    text: "Advocating for civil rights, democratic participation, and public transparency.",
  },
  {
    label: "Youth Culture & Creative Socials",
    text: "Vibrant lifestyle, arts, and fashion celebrating youth power and creative expression.",
  },
  {
    label: "Environment & Eco Action",
    text: "Committed to sustainable growth, eco-friendly conservation, and green lifestyle choices.",
  },
  {
    label: "Wellness & Mental Health",
    text: "Empowering individuals with clinical focus on holistic fitness, mental health, and physical peace.",
  },
  {
    label: "Heritage, Arts & Culture",
    text: "Preserving cultural history, native craftsmanship, and regional heritage for modern times.",
  },
  {
    label: "Social Justice & Humanitarian Inclusion",
    text: "Supporting underprivileged groups, social inclusion, human rights, and charity relief.",
  },
  {
    label: "Modern Technology & Digital Inclusion",
    text: "Empowering local networks with software innovation, digital access, and simple tools.",
  },
  {
    label: "Logistics, Trade & Connection",
    text: "Bridging physical and digital trade, ensuring seamless flow of goods and travel services.",
  },
  {
    label: "Family Support & Child Literacy",
    text: "Engaged in childcare support, family empowerment and child education advancement.",
  },
];

const getTemplateIcon = (label: string) => {
  switch (label) {
    case "Faith & Community":
      return <Heart className="w-3.5 h-3.5" />;
    case "Democracy & Civic Engagement":
      return <Globe className="w-3.5 h-3.5" />;
    case "Youth Culture & Creative Socials":
      return <Sparkles className="w-3.5 h-3.5" />;
    case "Environment & Eco Action":
      return <Leaf className="w-3.5 h-3.5" />;
    case "Wellness & Mental Health":
      return <Smile className="w-3.5 h-3.5" />;
    case "Heritage, Arts & Culture":
      return <BookOpen className="w-3.5 h-3.5" />;
    case "Social Justice & Humanitarian Inclusion":
      return <Users className="w-3.5 h-3.5" />;
    case "Modern Technology & Digital Inclusion":
      return <Cpu className="w-3.5 h-3.5" />;
    case "Logistics, Trade & Connection":
      return <Award className="w-3.5 h-3.5" />;
    case "Family Support & Child Literacy":
      return <Users className="w-3.5 h-3.5" />;
    default:
      return <Sparkles className="w-3.5 h-3.5" />;
  }
};

const getVibrantAvatarClass = (name: string) => {
  const code = (name || "A").charCodeAt(0) % 3;
  if (code === 0)
    return "bg-gradient-to-br from-[#E52B50] to-[#F25C3D] text-white shadow-sm"; // "Red Hot" Amaranth to Coral
  if (code === 1)
    return "bg-gradient-to-br from-[#45B1E8] to-[#1E824C] text-white shadow-sm"; // Picton Blue to Salem Green
  return "bg-gradient-to-br from-[#1E824C] to-[#E8B14A] text-white shadow-sm"; // Salem Green to Amber Gold
};

function getDaysUntilMilestone(dateStr: string): number {
  try {
    const today = new Date(); // Using current user's local date context
    const year = today.getFullYear();
    let month = -1;
    let day = -1;

    // Check if format is YYYY-MM-DD or MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split("-");
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else if (/^\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split("-");
      month = parseInt(parts[0], 10) - 1;
      day = parseInt(parts[1], 10);
    } else {
      // Try parsing with Javascript Date parser
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        month = parsed.getMonth();
        day = parsed.getDate();
      } else {
        // Look for month names and numbers
        const lower = dateStr.toLowerCase();
        const months = [
          "jan",
          "feb",
          "mar",
          "apr",
          "may",
          "jun",
          "jul",
          "aug",
          "sep",
          "oct",
          "nov",
          "dec",
        ];
        for (let i = 0; i < 12; i++) {
          if (lower.includes(months[i])) {
            month = i;
            // extract a number for day
            const match = lower.match(/\b\d{1,2}\b/);
            if (match) {
              day = parseInt(match[0], 10);
            }
            break;
          }
        }
      }
    }

    if (month === -1 || day === -1) {
      return 9999; // Unknown
    }

    // Next occurrence in current year or next year
    let target = new Date(year, month, day);
    // Clear hours to compare calendar days
    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const targetMidnight = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate(),
    );

    if (targetMidnight < todayMidnight) {
      // It's already passed this year, so targeted next year
      target = new Date(year + 1, month, day);
    }

    const diffTime = target.getTime() - todayMidnight.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 9999;
  }
}

function getOrdinalNum(n: number) {
  return (
    n +
    (n > 0
      ? ["th", "st", "nd", "rd"][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10]
      : "")
  );
}

export function resolveDynamicDateStr(
  occId: string,
  defaultDate: string | undefined,
): string | undefined {
  const year = new Date().getFullYear();
  const getNthDayOfMonth = (
    monthIndex: number,
    dayOfWeek: number,
    nth: number,
  ) => {
    const firstOfMonth = new Date(year, monthIndex, 1);
    const offset = (7 + dayOfWeek - firstOfMonth.getDay()) % 7;
    const targetDate = 1 + offset + (nth - 1) * 7;
    const mm = String(monthIndex + 1).padStart(2, "0");
    const dd = String(targetDate).padStart(2, "0");
    return `${mm}-${dd}`;
  };

  if (occId === "fathers_day") return getNthDayOfMonth(5, 0, 3); // 3rd Sunday of June
  if (occId === "mothers_day") return getNthDayOfMonth(4, 0, 2); // 2nd Sunday of May
  if (occId === "black_friday") {
    // 4th Thursday of Nov + 1
    const parts = getNthDayOfMonth(10, 4, 4).split("-");
    return `11-${String(parseInt(parts[1]) + 1).padStart(2, "0")}`;
  }
  if (occId === "cyber_monday") {
    const parts = getNthDayOfMonth(10, 4, 4).split("-");
    const d = parseInt(parts[1]) + 4;
    return d > 30
      ? `12-${String(d - 30).padStart(2, "0")}`
      : `11-${String(d).padStart(2, "0")}`;
  }
  if (occId === "easter_sunday") {
    if (year === 2026) return "04-05";
    if (year === 2025) return "04-20";
    if (year === 2024) return "03-31";
    return "04-05"; // fallback to 2026
  }

  return defaultDate;
}

function formatDateStr(dateStr?: string, occId?: string): string {
  const resolvedDateStr = occId
    ? resolveDynamicDateStr(occId, dateStr)
    : dateStr;
  if (!resolvedDateStr) return "TBD";
  const parts = resolvedDateStr.split("-");
  if (parts.length !== 2) return resolvedDateStr;
  const moNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  if (isNaN(m) || isNaN(d) || m < 1 || m > 12) return resolvedDateStr;
  return `${getOrdinalNum(d)} ${moNames[m - 1]}`;
}

export default function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("coloh_logged_in") === "true";
  });
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!loginEmail || !loginEmail.trim() || !loginEmail.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }

    if (!loginPassword || loginPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    // Sign in successfully
    localStorage.setItem("coloh_logged_in", "true");
    localStorage.setItem("coloh_user_email", loginEmail);
    setIsAuthenticated(true);
    showToast("Signed in successfully!", "success");
  };

  const handleLogout = () => {
    localStorage.removeItem("coloh_logged_in");
    localStorage.removeItem("coloh_user_email");
    setIsAuthenticated(false);
    setLoginPassword("");
    showToast("Signed out successfully.", "info");
  };

  // App Core State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);

  // Compute the current season dynamically in real-time based on system date
  const currentSeasonName = React.useMemo(() => {
    if (occasions.length === 0) return "World Refugee Day Season";
    const today = new Date();
    let closestOcc: Occasion | null = null;
    let minDiffDays = 9999;

    for (const occ of occasions) {
      const resolvedDateStr = resolveDynamicDateStr(occ.id, occ.date);
      if (!resolvedDateStr) continue;
      const parts = resolvedDateStr.split("-");
      if (parts.length !== 2) continue;
      const m = parseInt(parts[0], 10);
      const d = parseInt(parts[1], 10);
      if (isNaN(m) || isNaN(d)) continue;

      const year = today.getFullYear();
      let occDate = new Date(year, m - 1, d);

      // Calculate diff in days
      let diffMs = occDate.getTime() - today.getTime();
      let diffDays = diffMs / (1000 * 60 * 60 * 24);

      // If it passed more than 5 days ago, check next year
      if (diffDays < -5) {
        occDate = new Date(year + 1, m - 1, d);
        diffMs = occDate.getTime() - today.getTime();
        diffDays = diffMs / (1000 * 60 * 60 * 24);
      }

      const absDiff = Math.abs(diffDays);
      if (absDiff < minDiffDays) {
        minDiffDays = absDiff;
        closestOcc = occ;
      }
    }
    return closestOcc
      ? `${closestOcc.name} Season`
      : "World Refugee Day Season";
  }, [occasions]);

  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [selectedOccasionId, setSelectedOccasionId] = useState<string>("");
  const [customUserInput, setCustomUserInput] = useState<string>("");
  const [showHolidaysFullPage, setShowHolidaysFullPage] =
    useState<boolean>(false);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);

  // Tabbed layout & Design-Tone variations
  const [activeTab, setActiveTab] = useState<"composer" | "monitor">(
    "composer",
  );
  const [writingStyle, setWritingStyle] = useState<string>("professional");
  const [designLayout, setDesignLayout] = useState<string>("classic");

  // Dynamic country category toggles (manually toggleable on-dashboard)
  const [countryFilters, setCountryFilters] = useState<string[]>(["Nigeria"]);
  const [showAllMarkets, setShowAllMarkets] = useState<boolean>(false);
  const [showDesignSpecs, setShowDesignSpecs] = useState<boolean>(false);

  // Interactive Generation States
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<string>("");
  const [generatedFlyers, setGeneratedFlyers] = useState<FlyerResponse[]>([]);
  const [creditsUsed, setCreditsUsed] = useState<number>(() => {
    return parseInt(localStorage.getItem('carditaur_credits_used') || '0', 10);
  });
  const MAX_CREDITS = 26;
  const [currentFlyerIndex, setCurrentFlyerIndex] = useState(0);
  const [isFullscreenMode, setIsFullscreenMode] = useState<boolean>(false);
  const [showSizeBadge, setShowSizeBadge] = useState<boolean>(true);
  const [showDebugOverlay, setShowDebugOverlay] = useState<boolean>(true);
  const [previewPrompt, setPreviewPrompt] = useState<string>("");
  const [previewVariations, setPreviewVariations] = useState<any[]>([]);
  const [usedModel, setUsedModel] = useState<string>("");
  const [flyerZoom, setFlyerZoom] = useState<number>(1);
  const [captionCopied, setCaptionCopied] = useState<boolean>(false);

  // Profile Form States
  const [signupSuccessBiz, setSignupSuccessBiz] = useState<Business | null>(
    null,
  );
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);
  const [showAddBiz, setShowAddBiz] = useState<boolean>(false);
  const [newBizName, setNewBizName] = useState<string>("");
  const [newBizIndustry, setNewBizIndustry] = useState<string>(
    "Logistics & Delivery",
  );
  const [newBizLocation, setNewBizLocation] = useState<string>("");
  const [newBizLogoUrl, setNewBizLogoUrl] = useState<string>("");
  const [newBizBrandColor, setNewBizBrandColor] = useState<string>("#1F4D43");
  const [newBizAccentColor, setNewBizAccentColor] = useState<string>("#E8B14A");
  const [newBizSubscribed, setNewBizSubscribed] = useState<string[]>([]);
  const [newBizCountries, setNewBizCountries] = useState<string[]>(["Nigeria"]);
  const [newBizType, setNewBizType] = useState<"B2B" | "B2C" | "Both">("Both");
  const [newBizTone, setNewBizTone] = useState<BrandTone>("corporate");
  const [newBizSignOffName, setNewBizSignOffName] = useState<string>("");
  const [newBizSignOffRole, setNewBizSignOffRole] = useState<string>("");
  const [newBizUseSignOff, setNewBizUseSignOff] = useState<boolean>(false);
  const [editingBusinessId, setEditingBusinessId] = useState<string | null>(
    null,
  );
  const [newProfileType, setNewProfileType] = useState<
    "business" | "individual"
  >("business");
  const [newCustomEvents, setNewCustomEvents] = useState<
    {
      id: string;
      name: string;
      date: string;
      type: "birthday" | "anniversary" | "other";
      notes?: string;
      isAnnual?: boolean;
    }[]
  >([]);

  // Smooth, precise real-time percentage indicators
  const [flyerProgressPercent, setFlyerProgressPercent] = useState<number>(0);
  const [savingProgressPercent, setSavingProgressPercent] = useState<number>(0);
  const [activatingProgress, setActivatingProgress] = useState<number | null>(
    null,
  );

  // Synchronous simulated progress for profile saving
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSavingProfile) {
      setSavingProgressPercent(0);
      let p = 0;
      interval = setInterval(() => {
        p += Math.floor(Math.random() * 14) + 8; // fast jumps
        if (p >= 98) {
          p = 98;
        }
        setSavingProgressPercent(p);
      }, 40);
    } else {
      setSavingProgressPercent(100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSavingProfile]);

  // Fast loading effect with visible percentage for showHolidaysFullPage (the activate profile page)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showHolidaysFullPage) {
      setActivatingProgress(0);
      let progress = 0;
      interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 15; // 15% to 30% jump per step
        if (progress >= 100) {
          progress = 100;
          setActivatingProgress(100);
          clearInterval(interval);
          setTimeout(() => {
            setActivatingProgress(null);
          }, 150);
        } else {
          setActivatingProgress(progress);
        }
      }, 30);
    } else {
      setActivatingProgress(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showHolidaysFullPage]);
  const [tempEventName, setTempEventName] = useState<string>("");
  const [tempEventDate, setTempEventDate] = useState<string>("");
  const [tempEventType, setTempEventType] = useState<
    "birthday" | "anniversary" | "other"
  >("birthday");
  const [tempEventNotes, setTempEventNotes] = useState<string>("");
  const [tempEventIsAnnual, setTempEventIsAnnual] = useState<boolean>(true);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newBizPhone, setNewBizPhone] = useState<string>("");
  const [newBizEmail, setNewBizEmail] = useState<string>("");
  const [newBizInstagram, setNewBizInstagram] = useState<string>("");
  const [newBizXUsername, setNewBizXUsername] = useState<string>("");
  const [newBizDescription, setNewBizDescription] = useState<string>("");

  // Real-time suggested events for Step 5 based on selected countries
  const suggestedEventsForStep5 = React.useMemo(() => {
    if (newBizCountries.length === 0) return [];

    const profile: BusinessProfile = {
      businessName: newBizName || "New Brand",
      industry: newBizIndustry,
      country: newBizCountries[0] || "Global",
      businessType: newBizType,
      brandTone: newBizTone,
    };

    const results = RecommendationService.getRecommendations(profile, 6);
    return [
      ...results.mandatory,
      ...results.recommended,
      ...results.optional,
    ].slice(0, 6);
  }, [newBizCountries, newBizName, newBizIndustry, newBizType, newBizTone]);

  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  // State for upcoming rotating events
  const [rotatingIndex, setRotatingIndex] = useState<number>(0);
  const [activeUpcomingIndex, setActiveUpcomingIndex] = useState<number>(0);
  const [isRotatingPaused, setIsRotatingPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isRotatingPaused) return;
    const interval = setInterval(() => {
      setRotatingIndex((prev) => prev + 1);
      setActiveUpcomingIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isRotatingPaused]);

  // Automatically synchronize selected template markers with the description value
  useEffect(() => {
    if (!newBizDescription) {
      setSelectedTemplates([]);
      return;
    }
    const matched = BUSINESS_TAGLINE_TEMPLATES.filter((tpl) =>
      newBizDescription.includes(tpl.text),
    ).map((tpl) => tpl.label);
    setSelectedTemplates(matched);
  }, [newBizDescription]);

  const handleTemplateToggle = (tpl: { label: string; text: string }) => {
    if (selectedTemplates.includes(tpl.label)) {
      const updated = selectedTemplates.filter((item) => item !== tpl.label);
      setSelectedTemplates(updated);
      const pieces = BUSINESS_TAGLINE_TEMPLATES.filter((tag) =>
        updated.includes(tag.label),
      ).map((tag) => tag.text);
      setNewBizDescription(pieces.join(" "));
    } else {
      if (selectedTemplates.length >= 4) {
        showToast("You can select up to 4 categories maximum!", "info");
        return;
      }
      const updated = [...selectedTemplates, tpl.label];
      setSelectedTemplates(updated);
      const pieces = BUSINESS_TAGLINE_TEMPLATES.filter((tag) =>
        updated.includes(tag.label),
      ).map((tag) => tag.text);
      setNewBizDescription(pieces.join(" "));
    }
  };

  // Account/Profile Dropdown & Size Customization states (Request Requirements)
  const [profileCardOpenId, setProfileCardOpenId] = useState<string | null>(
    null,
  );
  const [newBizIndustryDropdown, setNewBizIndustryDropdown] = useState<string>(
    "Logistics & Delivery",
  );
  const [newBizIndustryCustom, setNewBizIndustryCustom] = useState<string>("");
  const [sizePreset, setSizePreset] = useState<string>("auto-diverse");
  const [selectedWidth, setSelectedWidth] = useState<number>(1080);
  const [selectedHeight, setSelectedHeight] = useState<number>(1080);
  const [addBizStep, setAddBizStep] = useState<number>(1);
  const [activeFeature, setActiveFeature] = useState<
    "home" | "flyer" | "milestones" | "profile" | "mission"
  >("home");

  // Handle window scroll restoration on navigation or overlay triggers
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [showHolidaysFullPage, activeFeature]);

  // Dismiss profile minicard on clicking/tapping outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      const popup = document.getElementById("profile_popup_card_global");
      const trigger = document.getElementById(
        "header_collapsed_avatar_trigger",
      );
      if (
        profileCardOpenId &&
        popup &&
        !popup.contains(target) &&
        (!trigger || !trigger.contains(target))
      ) {
        setProfileCardOpenId(null);
        setDeleteConfirmId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [profileCardOpenId]);

  const [clickedButtonId, setClickedButtonId] = useState<
    "hub" | "flyer" | "milestones" | "profile" | "mission" | null
  >(null);

  const handleHomeButtonClick = (
    id: "hub" | "flyer" | "milestones" | "profile" | "mission",
    action: () => void,
  ) => {
    setClickedButtonId(id);
    setTimeout(() => {
      action();
      setClickedButtonId(null);
    }, 450);
  };

  const [contactsExpanded, setContactsExpanded] = useState<boolean>(false);
  const [showEventPickerPrompt, setShowEventPickerPrompt] =
    useState<boolean>(false);

  // Custom Toast, Error tracking, and interactive deletion confirm states (Request requirements)
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [customMsgOpen, setCustomMsgOpen] = useState<boolean>(true);
  const [timelineExpanded, setTimelineExpanded] = useState<boolean>(true);
  const [flyerOverlay, setFlyerOverlay] = useState<
    "events" | "caption" | "styling" | "create-custom-event" | null
  >(null);
  const [showAutomationNotice, setShowAutomationNotice] =
    useState<boolean>(false);
  const hasSeenFlyerNotice = useRef<boolean>(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState<boolean>(true);
  const [directorySearchQuery, setDirectorySearchQuery] = useState<string>("");
  const [directoryCategoryFilter, setDirectoryCategoryFilter] =
    useState<string>("all");
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'menu' | 'flyers' | 'settings'>('menu');
  const [ideogramApiKey, setIdeogramApiKey] = useState<string>("");
  const [deepseekApiKey, setDeepseekApiKey] = useState<string>("");
  const [viewingFlyersForBizId, setViewingFlyersForBizId] = useState<string | null>(null);
  const [bizFlyers, setBizFlyers] = useState<any[]>([]);
  const [adminTemplates, setAdminTemplates] = useState<any[]>([]);
  const [adminLoadingTemplates, setAdminLoadingTemplates] = useState(false);
  
  useEffect(() => {
    if (showAdminPanel) {
      setAdminLoadingTemplates(true);
      
      // Fetch Config
      fetch('/api/admin/config')
        .then(r => r.json())
        .then(data => {
            if (data.ideogramApiKey) setIdeogramApiKey(data.ideogramApiKey);
            if (data.deepseekApiKey) setDeepseekApiKey(data.deepseekApiKey);
        })
        .catch(err => console.error(err));

      fetch('/api/admin/templates')
        .then(r => r.json())
        .then(data => {
           setAdminTemplates(data);
           setAdminLoadingTemplates(false);
        })
        .catch(err => {
           console.error(err);
           setAdminLoadingTemplates(false);
        });
    }
  }, [showAdminPanel]);
  const [enforceNonRepeatingImages, setEnforceNonRepeatingImages] = useState<boolean>(false);
  const [isPaidUser, setIsPaidUser] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [intlGroupOpen, setIntlGroupOpen] = useState<boolean>(true);
  const [nationalGroupOpen, setNationalGroupOpen] = useState<boolean>(false);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({ message, type });
  };

  // Client-Side Brand Extraction state (zero AI cost!)
  const [extractedBrand, setExtractedBrand] = useState<{
    colors: string[];
    typography: string;
    fontSize: string;
    fontStyle: string;
    brandMaterial: string;
    aspectRatioLabel: string;
  } | null>(null);

  const getIndustryBrandRecs = (industry: string) => {
    let typography = "Space Grotesk (Headings) & Inter (Body)";
    let fontSize = "Robust Display Weight (24px Title, 14px Copy)";
    let fontStyle = "Bold modern sans-serif, snug letter-spacing";
    let brandMaterial = "Clean vector margins, crisp color contrast panels";

    if (
      industry.includes("Retail") ||
      industry.includes("Fashion") ||
      industry.includes("Aesthetics")
    ) {
      typography = "Playfair Display (Headings) & Inter (Body)";
      fontSize = "Classic Boutique Weight (22px Title, 13px Light Copy)";
      fontStyle = "Serif elegance, italic touchpoints, airy tracking (+0.05em)";
      brandMaterial =
        "Warm beige cards, accent bounding-borders, high-end look";
    } else if (
      industry.includes("Professional") ||
      industry.includes("Consulting") ||
      industry.includes("Healthcare")
    ) {
      typography = "Inter Semibold (Headings) & Inter Regular (Body)";
      fontSize = "Balanced Editorial (20px Title, 14px Understated)";
      fontStyle = "Structured sans-serif, neutral layout flow, crisp lines";
      brandMaterial = "Geometric matte blocks, high-contrast text dividers";
    } else if (
      industry.includes("Technology") ||
      industry.includes("Software") ||
      industry.includes("Fintech") ||
      industry.includes("Banking")
    ) {
      typography =
        "Space Grotesk (Headings) & JetBrains Mono (Labels/Metadata)";
      fontSize = "Striking Bold Tech (24px Title, 11px Monospace Labels)";
      fontStyle = "Futuristic technical high-contrast, zero-padding grids";
      brandMaterial =
        "Contrast outlines, modern data tables, dark-accented neon bounds";
    } else if (industry.includes("Food") || industry.includes("Hospitality")) {
      typography = "Inter Bold (Headings) & Space Grotesk (Sub-elements)";
      fontSize = "Familiar Friendly Scale (22px Title, 15px High-Legibility)";
      fontStyle = "Warm organic rounded edges, thick/bold display weights";
      brandMaterial = "Thick aesthetic frames, cozy card shadow backdrops";
    }
    return { typography, fontSize, fontStyle, brandMaterial };
  };

  const handleLogoFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewBizLogoUrl(dataUrl);

      // Analyze colors and metrics using standard HTML5 Canvas
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const ratio = img.width / img.height;
        let logoDesignType = "Emblem / Icon Badge";
        if (ratio > 1.35) {
          logoDesignType = "Horizontal Wordmark Logo";
        } else if (ratio < 0.75) {
          logoDesignType = "Vertical / Stacked Symbol";
        }

        const canvas = document.createElement("canvas");
        const MAX_SIZE = 500;
        let pWidth = img.width;
        let pHeight = img.height;
        if (pWidth > MAX_SIZE || pHeight > MAX_SIZE) {
            if (pWidth > pHeight) {
                pHeight = Math.round((pHeight * MAX_SIZE) / pWidth);
                pWidth = MAX_SIZE;
            } else {
                pWidth = Math.round((pWidth * MAX_SIZE) / pHeight);
                pHeight = MAX_SIZE;
            }
        }
        canvas.width = pWidth;
        canvas.height = pHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, pWidth, pHeight);
          try {
            const imgDataFull = ctx.getImageData(0, 0, pWidth, pHeight);
            const dataFull = imgDataFull.data;
            let containsWhiteBackground = false;
            
            // Check edges to see if there's a white background
            const samplePoints = [0, pWidth-1, (pHeight-1)*pWidth, (pHeight-1)*pWidth + pWidth-1];
            let whiteEdgeCount = 0;
            for (const sp of samplePoints) {
                const i = sp * 4;
                if (dataFull[i] > 240 && dataFull[i+1] > 240 && dataFull[i+2] > 240 && dataFull[i+3] > 200) {
                    whiteEdgeCount++;
                }
            }
            if (whiteEdgeCount >= 2) {
                containsWhiteBackground = true;
            }

            if (containsWhiteBackground) {
                for (let i = 0; i < dataFull.length; i += 4) {
                    const r = dataFull[i];
                    const g = dataFull[i + 1];
                    const b = dataFull[i + 2];
                    const a = dataFull[i + 3];
                    
                    // Simple magic wand: remove pure/near white
                    if (r > 235 && g > 235 && b > 235 && a > 100) {
                        dataFull[i + 3] = 0;
                    }
                }
                ctx.putImageData(imgDataFull, 0, 0);
                const processedDataUrl = canvas.toDataURL('image/png');
                setNewBizLogoUrl(processedDataUrl);
            }

            // Downsample for color extraction
            const extCanvas = document.createElement("canvas");
            extCanvas.width = 60;
            extCanvas.height = 60;
            const extCtx = extCanvas.getContext("2d");
            if (extCtx) {
              extCtx.drawImage(img, 0, 0, 60, 60);
              const imgData = extCtx.getImageData(0, 0, 60, 60).data;
              
              // Divide the 60x60 image into a 3x3 grid (9 sections of 20x20 pixels)
              const sectionSize = 20;
              const colorSectionPresence: { [hex: string]: number } = {};
              const globalPixelCounts: { [hex: string]: number } = {};

              for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                  const sectionColorCounts: { [hex: string]: number } = {};
                  
                  // Scan the 20x20 area of this specific section
                  for (let y = row * sectionSize; y < (row + 1) * sectionSize; y++) {
                    for (let x = col * sectionSize; x < (col + 1) * sectionSize; x++) {
                      // Skip every other pixel for performance (stride of 2)
                      if ((x + y) % 2 !== 0) continue;
                      
                      const i = (y * 60 + x) * 4;
                      const r = imgData[i];
                      const g = imgData[i + 1];
                      const b = imgData[i + 2];
                      const a = imgData[i + 3];

                      // Skip transparent
                      if (a < 140) continue;

                      const brightness = (r + g + b) / 3;
                      const isGray =
                        Math.abs(r - g) < 18 &&
                        Math.abs(g - b) < 18 &&
                        brightness > 60 &&
                        brightness < 195;

                      if (isGray) continue;

                      // Group similar colors
                      const roundR = Math.round(r / 20) * 20;
                      const roundG = Math.round(g / 20) * 20;
                      const roundB = Math.round(b / 20) * 20;

                      const toHex = (c: number) => {
                        const hex = Math.min(255, Math.max(0, c)).toString(16);
                        return hex.length === 1 ? "0" + hex : hex;
                      };
                      const hex =
                        `#${toHex(roundR)}${toHex(roundG)}${toHex(roundB)}`.toUpperCase();
                        
                      sectionColorCounts[hex] = (sectionColorCounts[hex] || 0) + 1;
                      globalPixelCounts[hex] = (globalPixelCounts[hex] || 0) + 1;
                    }
                  }
                  
                  // If a color is sufficiently present in this section (e.g. > 2 pixels), count it for this section
                  Object.keys(sectionColorCounts).forEach(hex => {
                    if (sectionColorCounts[hex] >= 2) {
                      colorSectionPresence[hex] = (colorSectionPresence[hex] || 0) + 1;
                    }
                  });
                }
              }

              // Sort colors primarily by how many sections (out of 9) they appear in, 
              // and use their global pixel count as a tie-breaker.
              const sortedColors = Object.keys(colorSectionPresence).sort(
                (x, y) => {
                  const sectionDiff = colorSectionPresence[y] - colorSectionPresence[x];
                  if (sectionDiff !== 0) return sectionDiff;
                  return globalPixelCounts[y] - globalPixelCounts[x];
                }
              );
              
              // Calculate percentage dominance for debugging/logging
              const dominanceLog = sortedColors.slice(0, 5).map(hex => 
                `${hex}: ${Math.round((colorSectionPresence[hex] / 9) * 100)}% (${colorSectionPresence[hex]}/9 grids)`
              );
              console.log("Extracted Color Dominance:", dominanceLog);

              const primaryExtracted = sortedColors[0] || "#1F4D43";
              const accentExtracted =
                sortedColors[1] ||
                (primaryExtracted === "#E8B14A" ? "#1F4D43" : "#E8B14A");

              setNewBizBrandColor(primaryExtracted);
              setNewBizAccentColor(accentExtracted);

              const recs = getIndustryBrandRecs(newBizIndustry);

              setExtractedBrand({
                colors: sortedColors.slice(0, 5),
                typography: recs.typography,
                fontSize: recs.fontSize,
                fontStyle: recs.fontStyle,
                brandMaterial: recs.brandMaterial,
                aspectRatioLabel: logoDesignType,
              });
            }
          } catch (err) {
            console.warn("Client image pixels analysis blocked:", err);
          }
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Trigger dynamic recommendations update on industry change
  useEffect(() => {
    if (newBizLogoUrl) {
      const recs = getIndustryBrandRecs(newBizIndustry);
      setExtractedBrand((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          typography: recs.typography,
          fontSize: recs.fontSize,
          fontStyle: recs.fontStyle,
          brandMaterial: recs.brandMaterial,
        };
      });
    }
  }, [newBizIndustry]);

  // Automatically select regional national holidays when countries/regions are selected or edited
  useEffect(() => {
    if (newBizCountries.length > 0 && occasions.length > 0) {
      const nationalOccasionsOfSelectedCountries = occasions
        .filter(
          (occ) =>
            occ.category === "national" &&
            occ.countries?.some((c) => newBizCountries.includes(c)),
        )
        .map((occ) => occ.id);

      if (nationalOccasionsOfSelectedCountries.length > 0) {
        setNewBizSubscribed((prev) => {
          const merged = new Set([
            ...prev,
            ...nationalOccasionsOfSelectedCountries,
          ]);
          if (
            nationalOccasionsOfSelectedCountries.some(
              (id) => !prev.includes(id),
            )
          ) {
            return Array.from(merged);
          }
          return prev;
        });
      }
    }
  }, [newBizCountries, occasions]);

  // Fetch initial collections
  useEffect(() => {
    fetchOccasions();
    fetchBusinesses();
  }, []);

  // Auto-clears floating notification toasts
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // When selected business changes, sync country occasion filters to match the business's countries
  const activeBusiness = businesses.find((b) => b.id === selectedBusinessId);

  useEffect(() => {
    if (activeBusiness) {
      const bizCountries =
        activeBusiness.countries && activeBusiness.countries.length > 0
          ? activeBusiness.countries
          : ["Nigeria"];
      setCountryFilters(bizCountries);
    }
  }, [selectedBusinessId, businesses]);

  const fetchOccasions = async () => {
    try {
      const res = await fetch("/api/occasions");
      if (res.ok) {
        const data = await res.json();
        setOccasions(data);
        if (data.length > 0) setSelectedOccasionId(data[0].id);
      }
    } catch (e) {
      console.error("Failed to query occasions API:", e);
    }
  };

  const fetchBusinesses = async (selectNewId?: string) => {
    try {
      const res = await fetch("/api/businesses");
      if (res.ok) {
        const data: Business[] = await res.json();
        setBusinesses(data);

        // Restore from storage if empty
        const cached = localStorage.getItem("coloh_current_biz");
        if (selectNewId) {
          setSelectedBusinessId(selectNewId);
        } else if (cached && data.some((b) => b.id === cached)) {
          setSelectedBusinessId(cached);
        } else if (data.length > 0) {
          setSelectedBusinessId(data[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to query businesses API:", e);
    }
  };

  const handleDeleteBusiness = async (bizId: string) => {
    try {
      const biz = businesses.find((b) => b.id === bizId);
      if (!biz) return;

      const res = await fetch(`/api/businesses/${bizId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProfileCardOpenId(null);
        setDeleteConfirmId(null);
        const cached = localStorage.getItem("coloh_current_biz");
        if (cached === bizId) {
          localStorage.removeItem("coloh_current_biz");
        }
        await fetchBusinesses();
        showToast(
          `Successfully deleted "${biz.businessName}" profile entirely!`,
        );
      } else {
        showToast("Server reported failure deleting profile.", "error");
      }
    } catch (err) {
      console.error("Deletion failure:", err);
      showToast("Network error deleting profile.", "error");
    }
  };

  const handleRestoreBusiness = async (bizId: string) => {
    try {
      const biz = businesses.find((b) => b.id === bizId);
      if (!biz) return;

      const res = await fetch(`/api/businesses/${bizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingDeletionDate: null }),
      });
      if (res.ok) {
        await fetchBusinesses();
        setProfileCardOpenId(null);
        showToast(
          `Successfully restored "${biz.businessName}" profile! All campaign triggers have been re-enabled.`,
        );
      } else {
        showToast(
          "Server reported failure restoring corporate profile.",
          "error",
        );
      }
    } catch (err) {
      console.error("Restore failure:", err);
      showToast("Network error restoring profile.", "error");
    }
  };

  const toggleHolidaySubscription = async (occasionId: string) => {
    if (!selectedBusinessId) return;
    const biz = businesses.find((b) => b.id === selectedBusinessId);
    if (!biz) return;

    const isSubscribed = biz.subscribedOccasions?.includes(occasionId);

    // Check limits if subscribing
    if (!isSubscribed) {
      const baseMax = 18 + Math.max(0, (biz.countries || []).length - 1) * 3;
      const absoluteMax = baseMax + 5;
      const validSubscribedCount = (biz.subscribedOccasions || []).filter(id => !CORE_EVENTS.includes(id)).length;
      if (validSubscribedCount >= absoluteMax) {
        showToast(
          `Your profile has reached the maximum allowance of ${absoluteMax} subscribed events. (Core holidays are free)`,
          "info",
        );
        return;
      }
    }

    const updatedSubscribed = isSubscribed
      ? (biz.subscribedOccasions || []).filter((id) => id !== occasionId)
      : [...(biz.subscribedOccasions || []), occasionId];

    // Optimistically update standard React state so UI responds in exactly 0 milliseconds!
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id === selectedBusinessId) {
          return {
            ...b,
            subscribedOccasions: updatedSubscribed,
          };
        }
        return b;
      }),
    );

    try {
      const res = await fetch(`/api/businesses/${selectedBusinessId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscribedOccasions: updatedSubscribed,
        }),
      });
      if (res.ok) {
        showToast(
          isSubscribed
            ? "Unsubscribed from occasion feed successfully!"
            : "Subscribed to occasion feed successfully!",
          "success",
        );
      } else {
        // Revert optimistic update
        setBusinesses((prev) =>
          prev.map((b) => {
            if (b.id === selectedBusinessId) {
              return {
                ...b,
                subscribedOccasions: biz.subscribedOccasions || [],
              };
            }
            return b;
          }),
        );
        showToast("Server rejected subscription update.", "error");
      }
    } catch (e) {
      console.error("Failed to update holiday subscription:", e);
      // Revert optimistic update
      setBusinesses((prev) =>
        prev.map((b) => {
          if (b.id === selectedBusinessId) {
            return {
              ...b,
              subscribedOccasions: biz.subscribedOccasions || [],
            };
          }
          return b;
        }),
      );
      showToast("Failed to update subscription.", "error");
    }
  };

  const activeBiz =
    businesses.find((b) => b.id === selectedBusinessId) || businesses[0];
  const activeOccasion =
    occasions.find((o) => o.id === selectedOccasionId) ||
    (() => {
      if (!activeBiz || !activeBiz.customEvents) return undefined;
      const evt = activeBiz.customEvents.find(
        (e) => e.id === selectedOccasionId,
      );
      if (!evt) return undefined;
      const dateParts = evt.date.split("-");
      const dateString =
        dateParts.length === 3 ? `${dateParts[1]}-${dateParts[2]}` : evt.date;
      return {
        id: evt.id,
        name: evt.name,
        date: dateString,
        category: "custom",
        countries: ["International"],
        theme:
          evt.type === "birthday"
            ? "Family & Childcare"
            : evt.type === "anniversary"
              ? "Heritage & Culture"
              : "Creative Trends",
        enabled: true,
      };
    })();

  // Reference to current abort controller to cancel previous requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPreviewPrompt = () => {
    if (!selectedBusinessId || !selectedOccasionId || activeFeature !== "flyer") return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setPreviewPrompt("Generating prompt preview...");
    setPreviewVariations([]);
    setUsedModel("");
    fetch('/api/preview-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: selectedBusinessId, occasionId: selectedOccasionId, overrideOccasionName: activeOccasion?.name }),
      signal: controller.signal
    })
    .then(r => r.json())
    .then(data => {
      if (data.prompt) {
         setPreviewPrompt(data.prompt);
         if (data.variations) {
           setPreviewVariations(data.variations);
         }
         setUsedModel(data.usedModel || "");
      }
      else if (data.error) setPreviewPrompt("Failed: " + data.error);
    })
    .catch(err => {
      if (err.name === 'AbortError') return;
      setPreviewPrompt("Failed to preview prompt.");
    });
  };

  // Fetch Preview Prompt automatically on change
  useEffect(() => {
    fetchPreviewPrompt();
  }, [selectedBusinessId, selectedOccasionId, activeFeature, activeOccasion?.name]);

  // Trigger campaign pipeline with simulated logging steps
  const handleGenerateCampaign = async () => {
    if (!selectedBusinessId || !selectedOccasionId) return;

    // Abort previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setGeneratedFlyers([]);
    setFlyerProgressPercent(0);

    const phases = [
      "Establishing Secure Connection...",
      "Profiling Industry Parameters...",
      "Drafting Heartfelt Materials...",
      "Formulating Vector Coordinates...",
      "Sourcing High-Quality Visuals...",
      "Assembling Template Contours...",
      "Finalizing Graphic Rendering...",
    ];

    let currentPhase = 0;
    setLoadingPhase(phases[0]);

    const interval = setInterval(() => {
      if (currentPhase < phases.length - 1) {
        currentPhase++;
        setLoadingPhase(phases[currentPhase]);
      }
    }, 1200);

    let progressPct = 0;
    const pctInterval = setInterval(() => {
      progressPct += Math.floor(Math.random() * 8) + 4;
      if (progressPct >= 96) {
        progressPct = 96;
      }
      setFlyerProgressPercent(progressPct);
    }, 350);

    try {
      const response = await fetch("/api/generate-flyers-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          sizePreset,
          businessId: selectedBusinessId,
          occasionId: selectedOccasionId,
          userInput: customUserInput,
          width: selectedWidth,
          height: selectedHeight,
          writingStyle,
          designLayout,
          overrideOccasionName: activeOccasion?.name,
          isPaidUser
        }),
      });

      // Clear interval manually here
      clearInterval(interval);
      clearInterval(pctInterval);
      setFlyerProgressPercent(100);

      if (response.ok) {
        const data = await response.json();
        setGeneratedFlyers(data.flyers);
        setCurrentFlyerIndex(0);
        setActiveTab("monitor");
        setCreditsUsed((prev) => {
           const next = prev + 1;
           localStorage.setItem('carditaur_credits_used', next.toString());
           return next;
        });
      } else {
        alert("Server returned an error generating the flyer. Check logs.");
      }
    } catch (err: any) {
      clearInterval(interval);
      clearInterval(pctInterval);
      if (err.name === 'AbortError') {
        console.log("Previous generation request aborted.");
        return; // Don't turn off loading state, another request is handling it
      }
      console.error("Network generation error:", err);
      alert("Network pipeline interrupted.");
    } finally {
      if (abortControllerRef.current === abortController) {
         setLoading(false);
         abortControllerRef.current = null;
      }
    }
  };

  // Trigger Automation Notice on Flyer view
  useEffect(() => {
    if (activeFeature === "flyer" && !hasSeenFlyerNotice.current) {
      setShowAutomationNotice(true);
      hasSeenFlyerNotice.current = true;
    }
  }, [activeFeature]);

  // Submit profile creation or editing
  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardingError(null);

    if (!newBizName || !newBizIndustry || !newBizLocation) {
      setOnboardingError("Please fill out all required profile coordinates.");
      return;
    }
    if (newBizCountries.length === 0) {
      setOnboardingError("Please select at least one active market region.");
      return;
    }

    // Every account is eligible to have only two business accounts and one personal account. (Request constraint)
    if (!editingBusinessId) {
      const currentBizCount = businesses.filter(
        (b) => b.profileType === "business" || !b.profileType,
      ).length;
      const currentPersonalCount = businesses.filter(
        (b) => b.profileType === "individual",
      ).length;

      if (newProfileType === "business" && currentBizCount >= 2) {
        setOnboardingError(
          "Every account is eligible to hold only two business profiles. You have reached this maximum. Please delete an older business account first.",
        );
        return;
      }
      if (newProfileType === "individual" && currentPersonalCount >= 1) {
        setOnboardingError(
          "Every account is eligible to hold only one personal individual profile. You have reached this maximum. Please delete your existing personal account first.",
        );
        return;
      }
    }

    setIsSavingProfile(true);

    try {
      const isEdit = editingBusinessId !== null;
      const url = isEdit
        ? `/api/businesses/${editingBusinessId}`
        : "/api/signup";
      const method = isEdit ? "PUT" : "POST";

      // Based on the business and their tagline and what they identify with, autoselect events based on country selection
      let finalOccasionsToSave = newBizSubscribed;
      finalOccasionsToSave = Array.from(new Set([...finalOccasionsToSave, ...CORE_EVENTS]));
      if (!isEdit && occasions.length > 0) {
        const maxEvents = 18 + Math.max(0, newBizCountries.length - 1) * 3;
        try {
          const aiRes = await fetch("/api/ai-recommend-events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              businessName: newBizName || "New Brand",
              industry: newBizIndustry || "Logistics & Delivery",
              description: newBizDescription || "",
              countries: newBizCountries,
              businessType: newBizType || "Both",
              brandTone: newBizTone || "corporate",
              maxEvents,
            }),
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            if (
              aiData &&
              Array.isArray(aiData.recommendedIds) &&
              aiData.recommendedIds.length > 0
            ) {
              finalOccasionsToSave = aiData.recommendedIds;
            }
          }
        } catch (e) {
          console.error("AI recommendation failed", e);
        }

        // Fallback strategy if AI failed
        if (finalOccasionsToSave.length === 0) {
          const profile: BusinessProfile = {
            businessName: newBizName || "New Brand",
            industry: newBizIndustry || "Logistics & Delivery",
            country: newBizCountries[0] || "Global",
            businessType: newBizType || "Both",
            brandTone: newBizTone || "corporate",
          };
          const results = RecommendationService.getRecommendations(
            profile,
            maxEvents,
          );
          finalOccasionsToSave = [
            ...results.mandatory,
            ...results.recommended,
            ...results.optional,
          ]
            .map((x) => x.id)
            .slice(0, maxEvents);
        }
      }

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: newBizName,
          industry: newBizIndustry,
          location: newBizLocation,
          logoUrl: newBizLogoUrl,
          brandColor: newBizBrandColor,
          accentColor: newBizAccentColor,
          extractedColors: extractedBrand?.colors || [],
          subscribedOccasions: finalOccasionsToSave,
          countries: newBizCountries,
          businessType: newBizType,
          brandTone: newBizTone,
          signOffName: newBizSignOffName,
          signOffRole: newBizSignOffRole,
          useSignOff: newBizUseSignOff,
          profileType: newProfileType,
          customEvents: newCustomEvents,
          phone: newBizPhone,
          email: newBizEmail,
          instagram: newBizInstagram, xUsername: newBizXUsername,
          description: newBizDescription,
        }),
      });

      if (res.ok) {
        const savedBiz: Business = await res.json();
        localStorage.setItem("coloh_current_biz", savedBiz.id);

        // Reset states
        setNewBizName("");
        setNewBizIndustry("Logistics & Delivery");
        setNewBizIndustryDropdown("Logistics & Delivery");
        setNewBizIndustryCustom("");
        setNewBizLocation("");
        setNewBizDescription("");
        setNewBizLogoUrl("");
        setNewBizBrandColor("#1F4D43");
        setNewBizAccentColor("#E8B14A");
        setNewBizSubscribed([]);
        setNewBizCountries(["Nigeria"]);
        setNewBizSignOffName("");
        setNewBizSignOffRole("");
        setNewBizUseSignOff(false);
        setNewProfileType("business");
        setNewCustomEvents([]);
        setTempEventName("");
        setTempEventDate("");
        setTempEventType("birthday");
        setTempEventNotes("");
        setNewBizPhone("");
        setNewBizEmail("");
        setNewBizInstagram(""); setNewBizXUsername("");
        setShowAddBiz(false);
        setEditingBusinessId(null);
        setAddBizStep(1);
        setOnboardingError(null);

        // Update local state instantly and optimistically
        setBusinesses((prev) => {
          const index = prev.findIndex((b) => b.id === savedBiz.id);
          if (index !== -1) {
            const copy = [...prev];
            copy[index] = savedBiz;
            copy[index].subscribedOccasions = finalOccasionsToSave;
            return copy;
          } else {
            return [
              ...prev,
              { ...savedBiz, subscribedOccasions: finalOccasionsToSave },
            ];
          }
        });
        setSelectedBusinessId(savedBiz.id);

        // Fetch in background for sync without blocking UI
        fetchBusinesses(savedBiz.id);

        if (!isEdit) {
          setShowHolidaysFullPage(true);
          setActiveFeature("home");
        } else {
          setActiveFeature("profile");
          showToast("Profile updated instantly!");
        }
      } else {
        showToast(
          isEdit
            ? "Could not save business profile updates."
            : "Could not register brand campaign profile.",
          "error",
        );
      }
    } catch (err) {
      showToast("Connection error saving brand campaign profile.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleQuickSaveProfile = async () => {
    setOnboardingError(null);
    if (!newBizName.trim()) {
      setOnboardingError(
        newProfileType === "business"
          ? "Company Registered Name is required."
          : "Display Name is required.",
      );
      showToast("Please specify your profile name first in Step 1.", "error");
      setAddBizStep(1);
      return;
    }
    if (!newBizLocation.trim()) {
      setOnboardingError("Location / City is required.");
      showToast("Please specify location context in Step 1.", "error");
      setAddBizStep(1);
      return;
    }
    if (newBizCountries.length === 0) {
      setOnboardingError("Please select at least one active market region.");
      showToast(
        "Please select at least one active market region in Step 5.",
        "error",
      );
      setAddBizStep(5);
      return;
    }

    // Every account is eligible to have only two business accounts and one personal account
    if (!editingBusinessId) {
      const currentBizCount = businesses.filter(
        (b) => b.profileType === "business" || !b.profileType,
      ).length;
      const currentPersonalCount = businesses.filter(
        (b) => b.profileType === "individual",
      ).length;

      if (newProfileType === "business" && currentBizCount >= 2) {
        setOnboardingError(
          "Every account is eligible to hold only two business profiles.",
        );
        showToast("You already have two business profiles.", "error");
        return;
      }
      if (newProfileType === "individual" && currentPersonalCount >= 1) {
        setOnboardingError(
          "Every account is eligible to hold only one personal individual profile.",
        );
        showToast("You already have one personal profile.", "error");
        return;
      }
    }

    setIsSavingProfile(true);

    try {
      const isEdit = editingBusinessId !== null;
      const url = isEdit
        ? `/api/businesses/${editingBusinessId}`
        : "/api/signup";
      const method = isEdit ? "PUT" : "POST";

      let finalOccasionsToSave = newBizSubscribed;
      finalOccasionsToSave = Array.from(new Set([...finalOccasionsToSave, ...CORE_EVENTS]));
      if (!isEdit && occasions.length > 0) {
        const maxEvents = 18 + Math.max(0, newBizCountries.length - 1) * 3;
        try {
          const aiRes = await fetch("/api/ai-recommend-events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              businessName: newBizName || "New Brand",
              industry: newBizIndustry || "Logistics & Delivery",
              description: newBizDescription || "",
              countries: newBizCountries,
              businessType: newBizType || "Both",
              brandTone: newBizTone || "corporate",
              maxEvents,
            }),
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            if (
              aiData &&
              Array.isArray(aiData.recommendedIds) &&
              aiData.recommendedIds.length > 0
            ) {
              finalOccasionsToSave = aiData.recommendedIds;
            }
          }
        } catch (e) {
          console.error("AI recommendation failed", e);
        }

        // Fallback strategy if AI failed
        if (finalOccasionsToSave.length === 0) {
          const profile: BusinessProfile = {
            businessName: newBizName || "New Brand",
            industry: newBizIndustry || "Logistics & Delivery",
            country: newBizCountries[0] || "Global",
            businessType: newBizType || "Both",
            brandTone: newBizTone || "corporate",
          };
          const results = RecommendationService.getRecommendations(
            profile,
            maxEvents,
          );
          finalOccasionsToSave = [
            ...results.mandatory,
            ...results.recommended,
            ...results.optional,
          ]
            .map((x) => x.id)
            .slice(0, maxEvents);
        }
      }

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: newBizName,
          industry: newBizIndustry,
          location: newBizLocation,
          logoUrl: newBizLogoUrl,
          brandColor: newBizBrandColor,
          accentColor: newBizAccentColor,
          extractedColors: extractedBrand?.colors || [],
          subscribedOccasions: finalOccasionsToSave,
          countries: newBizCountries,
          businessType: newBizType,
          brandTone: newBizTone,
          profileType: newProfileType,
          customEvents: newCustomEvents,
          phone: newBizPhone,
          email: newBizEmail,
          instagram: newBizInstagram,
          xUsername: newBizXUsername,
          description: newBizDescription,
        }),
      });

      if (res.ok) {
        const savedBiz: Business = await res.json();
        localStorage.setItem("coloh_current_biz", savedBiz.id);

        // Reset states
        setNewBizName("");
        setNewBizIndustry("Logistics & Delivery");
        setNewBizIndustryDropdown("Logistics & Delivery");
        setNewBizIndustryCustom("");
        setNewBizLocation("");
        setNewBizDescription("");
        setNewBizLogoUrl("");
        setNewBizBrandColor("#1F4D43");
        setNewBizAccentColor("#E8B14A");
        setNewBizSubscribed([]);
        setNewBizCountries(["Nigeria"]);
        setNewProfileType("business");
        setNewCustomEvents([]);
        setTempEventName("");
        setTempEventDate("");
        setTempEventType("birthday");
        setTempEventNotes("");
        setNewBizPhone("");
        setNewBizEmail("");
        setNewBizInstagram("");
        setShowAddBiz(false);
        setEditingBusinessId(null);
        setAddBizStep(1);
        setOnboardingError(null);

        // Update local state instantly and optimistically
        setBusinesses((prev) => {
          const index = prev.findIndex((b) => b.id === savedBiz.id);
          if (index !== -1) {
            const copy = [...prev];
            copy[index] = savedBiz;
            copy[index].subscribedOccasions = finalOccasionsToSave;
            return copy;
          } else {
            return [
              ...prev,
              { ...savedBiz, subscribedOccasions: finalOccasionsToSave },
            ];
          }
        });
        setSelectedBusinessId(savedBiz.id);

        // Fetch in background for sync without blocking UI
        fetchBusinesses(savedBiz.id);

        if (!isEdit) {
          setShowHolidaysFullPage(true);
          setActiveFeature("home");
        } else {
          setActiveFeature("profile");
          showToast("Profile saved and updated immediately!");
        }
      } else {
        showToast(
          isEdit
            ? "Could not save business profile updates."
            : "Could not register brand campaign profile.",
          "error",
        );
      }
    } catch (err) {
      showToast("Connection error saving brand campaign profile.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCopyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    setCaptionCopied(true);
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  const toggleNewBizOccasion = (id: string) => {
    setNewBizSubscribed((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id],
    );
  };

  // Helper to identify if an occasion is highly relevant but unsubscribed for a business/onboarding country list
  const isOccasionHighlyRelevant = (
    occ: Occasion,
    selectedCountries: string[],
  ): boolean => {
    if (!occ.countries || occ.countries.length === 0) return false;
    return occ.countries.some(
      (c) =>
        selectedCountries.includes(c) &&
        c !== "International" &&
        c !== "Custom",
    );
  };

  const getOccasionDescription = (occ: Occasion) => {
    const name = occ.name;
    const countriesStr = occ.countries?.join(", ") || "Global";
    const keywordStr =
      occ.imageKeywords?.slice(0, 3).join(", ") || "festive visuals";
    const elemStr =
      occ.designElements?.slice(0, 2).join(" and ") || "elegant boundaries";

    let extraRelevance = "";
    if (occ.countries?.includes("India")) {
      extraRelevance =
        " Subscribe to this if you have clients, employees, or partners in India or of Indian heritage.";
    } else if (occ.countries?.includes("Nigeria")) {
      extraRelevance =
        " Essential for businesses operating in Nigeria or engaging with the West African diaspora.";
    } else if (occ.countries?.includes("United States")) {
      extraRelevance =
        " highly recommended for US-focused operations, regional campaigns, and local community outreach.";
    } else if (occ.countries?.includes("United Kingdom")) {
      extraRelevance =
        " Recommended if you coordinate with British audiences or partners based in the UK.";
    } else if (occ.category === "international") {
      extraRelevance =
        " A versatile occasion to foster global team unity and brand awareness across international partners.";
    } else {
      extraRelevance = ` Strong choice for targeting relationships in ${countriesStr}.`;
    }

    return `This seasonal event centers on ${name}, bringing people together with visual themes of ${keywordStr} set against ${elemStr}.${extraRelevance}`;
  };

  interface DisplayEvent {
    id: string;
    name: string;
    type: string; // 'holiday' | 'birthday' | 'anniversary' | 'other'
    dateLabel: string;
    unixTime?: number;
    isHighlyRelevant?: boolean;
  }

  const getUpcomingEventsList = (biz: Business): DisplayEvent[] => {
    const list: DisplayEvent[] = [];
    const today = new Date();
    const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const currentYear = today.getFullYear();

    // 1. Process custom profile events (Birthdays, Anniversaries, etc.)
    if (biz.customEvents && biz.customEvents.length > 0) {
      biz.customEvents.forEach((evt) => {
        const parts = evt.date.split("-");
        let m = 0,
          d = 0;
        if (parts.length === 3) {
          m = parseInt(parts[1], 10);
          d = parseInt(parts[2], 10);
        } else if (parts.length === 2) {
          m = parseInt(parts[0], 10);
          d = parseInt(parts[1], 10);
        }
        if (m > 0 && d > 0) {
          let evtDate = new Date(currentYear, m - 1, d);
          // If already past in the current year, check if next year fits
          if (
            evtDate < today &&
            (today.getMonth() !== m - 1 || today.getDate() !== d)
          ) {
            evtDate = new Date(currentYear + 1, m - 1, d);
          }
          if (evtDate >= today && evtDate <= twoWeeksLater) {
            list.push({
              id: evt.id,
              name: evt.name,
              type: evt.type,
              dateLabel: `${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`,
              unixTime: evtDate.getTime(),
            });
          }
        }
      });
    }

    // 2. Process subscribed official occasions
    if (biz.subscribedOccasions && biz.subscribedOccasions.length > 0) {
      occasions
        .filter((occ) => biz.subscribedOccasions.includes(occ.id))
        .forEach((occ) => {
          let mStr = resolveDynamicDateStr(occ.id, occ.date) || "";
          let evtDate: Date | null = null;
          if (mStr) {
            const parts = mStr.split("-");
            if (parts.length === 2) {
              const m = parseInt(parts[0], 10);
              const d = parseInt(parts[1], 10);
              evtDate = new Date(currentYear, m - 1, d);
              if (
                evtDate < today &&
                (today.getMonth() !== m - 1 || today.getDate() !== d)
              ) {
                evtDate = new Date(currentYear + 1, m - 1, d);
              }
            }
          }

          const isHighlyRelevant = isOccasionHighlyRelevant(
            occ,
            biz.countries || [],
          );

          if (evtDate) {
            if (evtDate >= today && evtDate <= twoWeeksLater) {
              list.push({
                id: occ.id,
                name: occ.name,
                type: "holiday",
                dateLabel: mStr,
                unixTime: evtDate.getTime(),
                isHighlyRelevant,
              });
            }
          } else {
            // Seasonal / No exact date: Add to list if we are close to when dates will be announced
            const isClose =
              isHighlyRelevant ||
              occ.id === "occ-fathers-day" ||
              occ.id === "occ-democracy-day-ng" ||
              occ.id === "occ-islamic-new-year";
            if (isClose) {
              list.push({
                id: occ.id,
                name: occ.name,
                type: "holiday",
                dateLabel: "Date TBD",
                unixTime: today.getTime() + 6 * 24 * 60 * 60 * 1000,
                isHighlyRelevant,
              });
            }
          }
        });
    }

    // Chronological order
    list.sort((a, b) => (a.unixTime || 0) - (b.unixTime || 0));
    return list.slice(0, 5);
  };

  // Google Accounts notification style upcoming occurrences counter
  const getUpcomingOccasionsCount = (biz: Business): number => {
    if (!biz) return 0;
    const activeCountries = biz.countries || ["Nigeria"];
    let count = 0;
    const today = new Date();
    const currentWindowStart = today.getTime();
    const currentWindowEnd = today.getTime() + 45 * 24 * 60 * 60 * 1000;
    const currentYear = today.getFullYear();

    occasions.forEach((occ) => {
      const matchCountry =
        occ.countries?.some((c) => activeCountries.includes(c)) ||
        occ.countries?.includes("International") ||
        occ.countries?.includes("international");
      if (!matchCountry) return;

      let m = -1,
        d = -1;
      const resolvedDateStr = resolveDynamicDateStr(occ.id, occ.date);
      if (resolvedDateStr) {
        const [mStr, dStr] = resolvedDateStr.split("-");
        m = parseInt(mStr);
        d = parseInt(dStr);
      }

      if (m !== -1 && d !== -1) {
        let evtDate = new Date(currentYear, m - 1, d);
        if (
          evtDate.getTime() < currentWindowStart &&
          (today.getMonth() !== m - 1 || today.getDate() !== d)
        ) {
          evtDate = new Date(currentYear + 1, m - 1, d);
        }
        if (
          evtDate.getTime() >= currentWindowStart &&
          evtDate.getTime() <= currentWindowEnd
        ) {
          count++;
        }
      }
    });
    return count > 0 ? count : 3; // Fallback to 3 if zero, guaranteeing active engagement notifications
  };

  // List next 4 upcoming occasions starting from the real current date
  const getUpcomingOccasionsList = (biz: Business): Occasion[] => {
    if (!biz) return [];
    const activeCountries = biz.countries || ["Nigeria"];

    // Filter of subscribed or matched country occasions
    const filtered = occasions.filter((occ) => {
      if (occ.enabled === false) return false;
      const isSubscribed = biz.subscribedOccasions?.includes(occ.id);
      if (biz.subscribedOccasions && biz.subscribedOccasions.length > 0) {
        return isSubscribed;
      }
      const matchCountry =
        occ.countries?.some((c) => activeCountries.includes(c)) ||
        occ.countries?.includes("International") ||
        occ.countries?.includes("international");
      return matchCountry;
    });

    // Also inject custom events!
    const customOccasions: Occasion[] = (biz.customEvents || []).map((evt) => {
      let dateStr = evt.date;
      if (evt.date.length === 10) {
        const parts = evt.date.split("-");
        dateStr = `${parts[1]}-${parts[2]}`;
      } else if (evt.date.length === 5 && evt.date.includes("-")) {
        dateStr = evt.date;
      }
      return {
        id: evt.id,
        name: evt.name,
        date: dateStr,
        category: "custom",
        is_dynamic_date: false,
        countries: ["International"],
        theme:
          evt.type === "birthday"
            ? "Family & Childcare"
            : evt.type === "anniversary"
              ? "Heritage & Culture"
              : "Creative Trends",
        enabled: true,
        imageKeywords:
          evt.type === "birthday"
            ? ["birthday", "cake", "celebration"]
            : evt.type === "anniversary"
              ? ["anniversary", "gifts", "celebration"]
              : ["celebration"],
        designElements: ["Abstract shapes"],
        suggestedColors: [
          biz.brandColor || "#E52B50",
          biz.accentColor || "#45B1E8",
        ],
      };
    });

    const merged = [...filtered, ...customOccasions];
    const today = new Date();

    const getMonthDay = (occ: Occasion) => {
      const resolvedDateStr = resolveDynamicDateStr(occ.id, occ.date);
      if (!resolvedDateStr) return { m: 12, d: 31 };
      const parts = resolvedDateStr.split("-");
      const mStr = parts[0];
      const dStr = parts[1] || parts[0];
      return { m: parseInt(mStr) || 12, d: parseInt(dStr) || 31 };
    };

    const sortedWithRealDays = merged.map((occ) => {
      const dInfo = getMonthDay(occ);
      const year = today.getFullYear();

      // Let's create candidate dates: this year, and next year (in case it has already passed this year)
      let occDate = new Date(year, dInfo.m - 1, dInfo.d);
      // If it passed this year, the next occurrence is next year
      if (occDate.getTime() < today.getTime() - 24 * 60 * 60 * 1000) {
        // permit today
        occDate = new Date(year + 1, dInfo.m - 1, dInfo.d);
      }

      const diffMs = occDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return { occ, diffDays };
    });

    // Keep ONLY occasions that are within the next 3 weeks (between 0 and 21 days inclusive!)
    const filteredByThreeWeeks = sortedWithRealDays.filter(
      (item) => item.diffDays >= 0 && item.diffDays <= 21,
    );

    // Sort by diffDays ascending
    filteredByThreeWeeks.sort((a, b) => a.diffDays - b.diffDays);

    return filteredByThreeWeeks.map((item) => item.occ);
  };

  const toggleNewBizCountry = (countryName: string) => {
    let updated: string[];
    if (newBizCountries.includes(countryName)) {
      updated = newBizCountries.filter((c) => c !== countryName);
      // We do not remove corresponding national holidays from subscriber list upon uncheck
      // to keep them statically placed and subscribed where they are.
    } else {
      if (newBizCountries.length >= 5) {
        showToast("You can select up to 5 countries maximum!", "info");
        setOnboardingError(
          "You can select up to 5 countries maximum for your profile affiliations.",
        );
        return;
      }
      setOnboardingError(null);
      updated = [...newBizCountries, countryName];
      // Auto-subscribe to mandatory (national) holidays of the newly selected region
      const nationalOccasionsForCountry = occasions
        .filter(
          (occ) =>
            occ.category === "national" && occ.countries?.includes(countryName),
        )
        .map((occ) => occ.id);

      setNewBizSubscribed((prev) => {
        const combined = new Set([...prev, ...nationalOccasionsForCountry]);
        return Array.from(combined);
      });
    }
    setNewBizCountries(updated);
  };

  const toggleCountryFilter = (countryName: string) => {
    setCountryFilters((prev) =>
      prev.includes(countryName)
        ? prev.filter((c) => c !== countryName)
        : [...prev, countryName],
    );
  };

  // Filter occasions to display:
  // Must be International OR belong to any region in countryFilters
  const filteredOccasions = occasions.filter((occ) => {
    if (occ.enabled === false) return false;
    const occCountries = occ.countries || [];
    if (
      occCountries.includes("International") ||
      occCountries.includes("international")
    ) {
      return true;
    }
    return occCountries.some((c) => countryFilters.includes(c));
  });

  if (!isAuthenticated) {
    return (
      <div
        id="coloh_landing_gate"
        className="min-h-screen bg-bgsoft text-charcoal flex flex-col justify-between antialiased selection:bg-[#45B1E8] selection:text-white"
      >
        {/* Simple crisp header */}
        <header className="border-b border-border-gray bg-white/95 backdrop-blur-md py-3.5 flex items-center justify-center shrink-0 w-full shadow-sm sticky top-0 z-[100]">
          <div className="w-full max-w-7xl px-4 sm:px-8 flex justify-between items-center">
            <div className="flex flex-col justify-center min-w-0">
              <span
                className="text-xl sm:text-2xl font-black text-[#1E824C] font-display tracking-tight hover:opacity-90 transition-all cursor-pointer block pb-0.5"
                onClick={() => {
                  setGeneratedFlyers([]);
                  setActiveFeature("home");
                }}
              >
                Carditaur
              </span>
              <span className="text-[8.5px] text-[#FF4E20] font-sans tracking-widest font-bold uppercase opacity-90 block">
                relationship intelligence
              </span>
            </div>
            <div className="text-[10px] sm:text-[10.5px] bg-[#1E824C]/10 border border-[#1E824C]/25 text-[#1E824C] px-3 py-1.5 rounded-full font-mono uppercase tracking-widest font-extrabold flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#45B1E8] animate-pulse"></span>
              Secure Hub Login
            </div>
          </div>
        </header>

        {/* Content body split / grid */}
        <main className="flex-grow flex items-center justify-center p-4 sm:p-8 md:p-12 relative z-10 w-full rounded-2xl">
          <div className="absolute inset-0 top-0 w-full h-[50vh] bg-gradient-to-b from-[#f4fbf7] to-bgsoft z-[-1]" />
          
          <div className="max-w-[1000px] w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column: Visual copywriting pitch block with Logo */}
            <div className="space-y-8 text-center md:text-left hidden md:flex flex-col justify-center h-full">
              {/* Logo / Attached Graphic area */}
              <div className="w-full relative flex flex-col items-center justify-center md:justify-start md:items-start group">
                <div className="relative">
                 {/* Decorative background glow for the logo */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#39FF14]/10 blur-3xl filter rounded-full z-[-1] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 <img 
                    src="/carditaur-logo.png" 
                    alt="Carditaur Graphic" 
                    onError={(e) => {
                      // Fallback if image isn't loaded properly
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/800x300/ffffff/1E824C?text=CARDITAUR\\n+Holidays%2C+Reminders+%26+Cards";
                    }}
                    className="w-full max-w-[380px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500 will-change-transform" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E824C]/10 text-[#1E824C] text-[10.5px] font-bold uppercase tracking-widest font-mono border border-[#1E824C]/20 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Relationship Intelligence Engine
                </span>
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-display font-extrabold leading-[1.15] tracking-tight text-[#080808]">
                  Remember <span className="text-[#1E824C] italic">every</span> important date.
                  <br className="hidden lg:block"/>
                  <span className="text-gray-400">Effortlessly.</span>
                </h1>
                <p className="text-[15px] sm:text-base text-gray-500 leading-relaxed font-sans max-w-md md:pr-4">
                  Never miss an opportunity to connect. Carditaur automates your commercial and personal relationship marketing, generating custom greeting cards and reminders exactly when you need them.
                </p>
              </div>
              
              {/* Feature highlights mini-bento */}
              <div className="grid grid-cols-2 gap-4 pt-4 max-w-md">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2 hover:border-[#39FF14]/40 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#1E824C]/10 flex items-center justify-center">
                     <Calendar className="w-4 h-4 text-[#1E824C]" />
                  </div>
                  <h4 className="text-xs font-bold text-charcoal">Smart Reminders</h4>
                  <p className="text-[10.5px] text-gray-500 leading-tight">Stay ahead of every holiday and milestone.</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2 hover:border-[#39FF14]/40 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#45B1E8]/10 flex items-center justify-center">
                     <Sparkles className="w-4 h-4 text-[#45B1E8]" />
                  </div>
                  <h4 className="text-xs font-bold text-charcoal">Custom Cards</h4>
                  <p className="text-[10.5px] text-gray-500 leading-tight">Gemini-powered personalized messaging.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Sign In Interactive Form Card */}
            <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-[2rem] p-6 sm:p-10 lg:p-12 shadow-[0_24px_80px_rgba(30,130,76,0.12)] space-y-8 text-left relative overflow-hidden ring-1 ring-black/5 hover:shadow-[0_32px_96px_rgba(30,130,76,0.16)] transition-shadow duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/10 rounded-full -mr-32 -mt-32 blur-[64px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#45B1E8]/5 rounded-full -ml-32 -mb-32 blur-[64px] pointer-events-none" />
              
              <div className="space-y-2 relative z-10 text-center sm:text-left">
                <div className="md:hidden w-full flex justify-center mb-6">
                  <img 
                    src="/carditaur-logo.png" 
                    alt="Carditaur" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/400x150/ffffff/1E824C?text=CARDITAUR";
                    }}
                    className="w-full max-w-[240px] object-contain drop-shadow-md" 
                  />
                </div>
                <h2 className="text-3xl font-extrabold font-display text-charcoal tracking-tight">
                   Get Started
                </h2>
                <p className="text-[13.5px] text-gray-500 font-sans leading-relaxed pt-1 max-w-sm mx-auto sm:mx-0">
                  Enter your credentials to access your relationship intelligence workspace.
                </p>
              </div>

              {authError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-950 rounded-2xl text-xs flex gap-2.5 items-start font-sans animate-shake">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.2" />
                  <div>
                    <span className="font-bold">Authentication Refused:</span>{" "}
                    {authError}
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth_email_field"
                    className="block text-[10px] font-bold text-[#1E824C] uppercase tracking-widest font-mono"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                      <User className="w-4 h-4 text-[#1E824C]" />
                    </span>
                    <input
                      id="auth_email_field"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. partner@carditaur.com"
                      className="block w-full pl-10 pr-3.5 py-3 bg-white border border-border-gray rounded-xl text-xs text-[#2b2b2b] placeholder-gray-400 focus:ring-1 focus:ring-[#1E824C] focus:border-[#1E824C] outline-none transition-all font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="auth_password_field"
                      className="block text-[10px] font-bold text-[#1E824C] uppercase tracking-widest font-mono"
                    >
                      Secret Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] font-bold text-[#45B1E8] hover:text-[#1E824C] hover:underline focus:outline-none cursor-pointer"
                    >
                      {showPassword ? "Hide password" : "Show password"}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                      <span className="font-mono text-base font-bold select-none text-[#1E824C]">
                        *
                      </span>
                    </span>
                    <input
                      id="auth_password_field"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-3.5 py-3 bg-white border border-border-gray rounded-xl text-xs text-[#2b2b2b] placeholder-gray-400 focus:ring-1 focus:ring-[#1E824C] focus:border-[#1E824C] outline-none transition-all font-sans"
                      required
                    />
                  </div>
                </div>

                <button
                  id="auth_submit_btn"
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#1E824C] to-[#45B1E8] hover:from-[#155A34] hover:to-[#2B86B1] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer font-sans active:scale-98 border-none"
                >
                  <span>Authenticate & Open Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Demo accounts hint widget */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5 select-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-505 block font-mono">
                  Demo accounts overview
                </span>
                <p className="text-[11px] text-gray-550 leading-normal">
                  You can sign-in instantly using our pre-seeded credentials:
                </p>
                <div className="bg-white border border-slate-100 rounded-lg p-2.5 grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-800">
                  <div>
                    <span className="text-gray-500 font-sans">Email: </span>
                    <span className="font-bold underline">
                      partner@carditaur.com
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-555 font-sans">Password: </span>
                    <span className="font-bold underline">carditaur2026</span>
                  </div>
                </div>
                <p className="text-[9.5px] text-[#888] leading-relaxed">
                  * Note: The app also allows enrolling any custom email & 6+
                  length password to experiment with local sessions.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Crisp landing footer */}
        <footer className="border-t border-border-gray bg-white py-3 text-center text-[9px] text-gray-400 space-y-0.5 shrink-0 font-mono">
          <p>
            Carditaur Relationship Marketing Platform • © 2026 Carditaur Inc.
            All rights reserved.
          </p>
          <p className="text-gray-450">
            Protected by end-to-end local session encryption hashes.
          </p>
        </footer>

        {/* Toast alerts inside login portal as well */}
        {toast && (
          <div
            id="custom_toast_alert_auth"
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4.5 py-3.5 rounded-2xl shadow-2xl border transition-all duration-300 animate-slide-up ${
              toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : toast.type === "info"
                  ? "bg-slate-100 border-slate-200 text-[#2b2b2b]"
                  : "bg-emerald-50 border-emerald-250 text-emerald-900"
            }`}
          >
            <div className="shrink-0">
              {toast.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              ) : toast.type === "info" ? (
                <AlertCircle className="w-5 h-5 text-slate-500" />
              ) : (
                <Check className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <p className="text-xs font-bold font-sans tracking-tight">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 hover:bg-slate-200/50 text-gray-450 hover:text-gray-650 p-1 rounded-lg transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (showHolidaysFullPage) {
    if (activatingProgress !== null) {
      return (
        <div
          id="coloh_holidays_loading_view"
          className="fixed inset-0 bg-[#FAF9F5] z-[9999] flex flex-col items-center justify-center p-6 select-none font-sans"
        >
          <div className="w-full max-w-xl text-center space-y-8 animate-fade-in">
            {/* Elegant spinning progress indicator */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  className="stroke-gray-200/40"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  className="stroke-[#1E824C] transition-all duration-75"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 64}`}
                  strokeDashoffset={`${2 * Math.PI * 64 * (1 - activatingProgress / 100)}`}
                />
              </svg>
              <div
                id="activating_percentage_display_full"
                className="text-3xl font-black text-slate-800 font-display"
              >
                {activatingProgress}%
              </div>
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 bg-[#1E824C]/10 text-[#1E824C] border border-[#1E824C]/20 px-4.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
                <span className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-pulse" />
                Profiling Campaign Parameters
              </span>
              <h3 className="text-2xl sm:text-3.5xl font-extrabold text-slate-900 tracking-tight font-display">
                Calibrating Occasions Calendar
              </h3>
              <p className="text-sm text-slate-450 max-w-md mx-auto leading-relaxed">
                Recommending localized high-impact opportunities aligned to your
                brand expression and target demographic profiles.
              </p>
            </div>

            {/* Simulated progress linear bar */}
            <div className="w-full max-w-xs mx-auto bg-gray-200/65 h-2 rounded-full overflow-hidden shadow-xs">
              <div
                className="bg-gradient-to-r from-[#1E824C] to-[#39FF14] h-full transition-all duration-75"
                style={{ width: `${activatingProgress}%` }}
              />
            </div>

            <div className="text-[11px] uppercase font-bold text-[#1E824C] font-mono tracking-widest animate-pulse">
              Running Profile Matching Sequence...
            </div>
          </div>
        </div>
      );
    }

    const activeBiz =
      businesses.find((b) => b.id === selectedBusinessId) || businesses[0];

    const profile: BusinessProfile = {
      businessName: activeBiz?.businessName || "New Brand",
      industry: activeBiz?.industry || "Logistics & Delivery",
      country: (activeBiz?.countries && activeBiz?.countries[0]) || "Global",
      businessType: activeBiz?.businessType || "Both",
      brandTone: activeBiz?.brandTone || "corporate",
    };

    const maxEvents =
      18 + Math.max(0, (activeBiz?.countries?.length || 1) - 1) * 3;

    const rawRecs = RecommendationService.getRecommendations(
      profile,
      Math.max(100, maxEvents + 20),
    );
    const subscribedSet = new Set(activeBiz?.subscribedOccasions || []);

    const displayMandatory = rawRecs.mandatory.filter((o) =>
      subscribedSet.has(o.id),
    );
    const displayRecommended = rawRecs.recommended.filter((o) =>
      subscribedSet.has(o.id),
    );
    const displayOptional = rawRecs.optional.filter((o) =>
      subscribedSet.has(o.id),
    );

    const missedIds = [...subscribedSet].filter(
      (id) =>
        !displayMandatory.find((o) => o.id === id) &&
        !displayRecommended.find((o) => o.id === id) &&
        !displayOptional.find((o) => o.id === id),
    );
    missedIds.forEach((id) => {
      const oc = occasions.find((x) => x.id === id);
      if (oc) displayRecommended.push(oc);
    });

    const extraRecs = [
      ...rawRecs.mandatory,
      ...rawRecs.recommended,
      ...rawRecs.optional,
    ]
      .filter((o) => !subscribedSet.has(o.id))
      .slice(0, 5);
    displayOptional.push(...extraRecs);

    const recommendationResult = {
      mandatory: displayMandatory,
      recommended: displayRecommended,
      optional: displayOptional,
    };

    // Check if isSubscribed helper
    const checkSubscribed = (id: string) => {
      return activeBiz?.subscribedOccasions?.includes(id) || false;
    };

    const renderOccasionCard = (occ: any) => {
      const isSubscribed = checkSubscribed(occ.id);
      return (
        <div
          key={occ.id}
          onClick={() => toggleHolidaySubscription(occ.id)}
          className={`flex items-center gap-4 p-4.5 rounded-2xl border transition-all cursor-pointer select-none relative overflow-hidden ${
            isSubscribed
              ? "bg-[#1E824C]/[0.04] border-[#1E824C] shadow-xs"
              : "bg-white border-slate-200 hover:border-[#1E824C]/50 hover:bg-slate-50 shadow-3xs"
          }`}
        >
          {/* Visual Left edge band highlight representing selection state */}
          <div
            className={`absolute top-0 bottom-0 left-0 w-1.5 transition-all duration-300 ${isSubscribed ? "bg-gradient-to-b from-[#1E824C] to-[#39FF14]" : "bg-transparent"}`}
          />

          {/* Customized Beautiful Circular Checkbox container */}
          <div
            className="flex items-center justify-center shrink-0 ml-1.5"
            onClick={(e) => {
              e.stopPropagation();
              toggleHolidaySubscription(occ.id);
            }}
          >
            <button
              type="button"
              className={`w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all ${
                isSubscribed
                  ? "bg-gradient-to-br from-[#1E824C] to-[#39FF14] text-white"
                  : "border-2 border-slate-300 hover:border-[#1E824C] text-transparent"
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          <div className="flex-grow space-y-1 text-left min-w-0">
            <h4 className="font-sans font-extrabold text-slate-900 text-base sm:text-lg leading-tight truncate">
              {occ.name}
            </h4>
            <p className="text-xs text-gray-400 font-medium truncate flex items-center gap-1.5">
              <span className="bg-slate-100 font-bold px-1.5 py-0.5 rounded text-[10px] text-slate-500 uppercase tracking-wider">
                {occ.category || "Celebration"}
              </span>
              <span>•</span>
              <span>{occ.countries?.join(", ") || "Global"}</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`text-[11px] font-mono font-bold px-3 py-1 rounded-lg border transition-all ${
                isSubscribed
                  ? "text-[#1E824C] bg-white border-[#1E824C]/35"
                  : "text-gray-500 bg-slate-50 border-gray-200"
              }`}
            >
              {formatDateStr(occ.date, occ.id)}
            </span>
          </div>
        </div>
      );
    };

    return (
      <div
        id="coloh_holidays_viewport"
        className="fixed inset-0 bg-[#FAF9F5] z-[9999] overflow-y-auto animate-fade-in text-[#080808] font-sans flex flex-col min-h-screen relative"
      >
        {/* Top Left Go Back button to return to homepage instantly */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
          <button
            type="button"
            onClick={() => {
              setShowHolidaysFullPage(false);
              setSignupSuccessBiz(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#1E824C] hover:text-white border border-[#EEDFD2]/80 text-slate-800 font-sans font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span>Go Back</span>
          </button>
        </div>

        <div className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col mt-6 sm:mt-0">
          {/* Header Area in clean minimalist layout */}
          <div className="text-center space-y-4 max-w-2xl mx-auto py-6 shrink-0">
            <span className="inline-flex items-center gap-2 bg-[#1E824C]/10 text-[#1E824C] border border-[#1E824C]/25 px-4.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-ping shrink-0" />
              Campaign Profile Activated
            </span>
            <h1 className="text-3xl sm:text-4.5xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
              {activeBiz?.businessName || "WindowDoor Plus Limited"}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-sans max-w-lg mx-auto">
              We selected {activeBiz?.subscribedOccasions?.length || 0} seasonal
              holidays and civic gatherings to anchor your relationship
              marketing campaigns (Allowance:{" "}
              {activeBiz?.subscribedOccasions?.length || 0} / {maxEvents} events
              based on countries).
            </p>
          </div>

          {/* Fully scrollable event checklist in full view, not in small block */}
          <div className="grid grid-cols-1 gap-8 mt-8 flex-grow">
            {recommendationResult.mandatory.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-2">
                  Mandatory / Civic Action
                </h3>
                <div className="space-y-3.5">
                  {recommendationResult.mandatory.map(renderOccasionCard)}
                </div>
              </div>
            )}

            {recommendationResult.recommended.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-[#1E824C] uppercase tracking-widest pl-2">
                  Highly Recommended Matches
                </h3>
                <div className="space-y-3.5">
                  {recommendationResult.recommended.map(renderOccasionCard)}
                </div>
              </div>
            )}

            {recommendationResult.optional.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                  Optional Extensions
                </h3>
                <div className="space-y-3.5">
                  {recommendationResult.optional.map(renderOccasionCard)}
                </div>
              </div>
            )}
          </div>

          {/* Action Close buttons */}
          <div className="pt-12 pb-8 flex flex-col sm:flex-row gap-4 justify-center shrink-0 items-center">
            <button
              type="button"
              onClick={() => {
                setShowHolidaysFullPage(false);
                setSignupSuccessBiz(null);
              }}
              className="w-full sm:w-auto px-12 py-4 bg-slate-900 hover:bg-[#1E824C] text-white font-sans font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer text-center tracking-wide flex items-center justify-center gap-2"
            >
              <span>Let's Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="coloh_app_stage"
      className="min-h-screen bg-bgsoft text-charcoal flex flex-col antialiased selection:bg-[#E52B50] selection:text-white relative"
    >
      {/* Premium Content Header - Recreated to ensure 100% stable vertical centering and static design */}
      <header className="sticky top-0 w-full bg-white border-b border-border-gray shadow-sm z-[100] py-3.5 flex items-center justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-8 flex justify-between items-center">
          {/* Brand Left Identification Area containing logo and tag */}
          <div className="flex flex-col justify-center min-w-0">
            <span
              onClick={() => {
                setGeneratedFlyers([]);
                setActiveFeature("home");
              }}
              className="text-xl sm:text-2xl font-black text-[#1E824C] font-display tracking-tight hover:opacity-90 transition-all cursor-pointer block pb-0.5"
            >
              Carditaur
            </span>
            <span className="text-[8.5px] text-[#FF4E20] font-sans tracking-widest font-bold uppercase opacity-90 block">
              relationship intelligence
            </span>
          </div>

          {/* Profile & Multi-account Dropdown on the RIGHT */}
          <div className="flex items-center gap-3 relative select-none shrink-0">
            {!isPaidUser && (
              <button
                onClick={() => setShowPaywall(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#1E824C] to-emerald-500 hover:opacity-90 transition-all text-white font-bold text-xs shadow-sm hover:shadow"
              >
                <Award className="w-3.5 h-3.5" />
                Upgrade to Premium
              </button>
            )}
            {businesses.length > 0 &&
              (() => {
                const activeBiz =
                  businesses.find((b) => b.id === selectedBusinessId) ||
                  businesses[0];
                const initials = activeBiz.businessName
                  ? activeBiz.businessName.trim().charAt(0).toUpperCase()
                  : "P";
                const upcomingCount = getUpcomingOccasionsCount(activeBiz);

                return (
                  <div
                    id="header_collapsed_profile_group"
                    className="relative shrink-0 select-none"
                  >
                    <button
                      id="header_collapsed_avatar_trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfileCardOpenId(
                          profileCardOpenId === activeBiz.id
                            ? null
                            : activeBiz.id,
                        );
                      }}
                      className={`relative rounded-full focus:outline-none transition-all active:scale-95 flex items-center justify-center font-bold text-xs select-none w-10 h-10 border-2 ${
                        profileCardOpenId === activeBiz.id
                          ? "border-[#E52B50] ring-2 ring-[#E52B50]/20 scale-105"
                          : "border-border-gray hover:border-black"
                      }`}
                      title="Manage & switch accounts"
                    >
                      {activeBiz.logoUrl ? (
                        <img
                          src={activeBiz.logoUrl}
                          alt={activeBiz.businessName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full rounded-full flex items-center justify-center font-extrabold text-white text-[13px] font-playful tracking-normal ${getVibrantAvatarClass(activeBiz.businessName)}`}
                        >
                          {initials}
                        </div>
                      )}

                      {/* Event notification alert badge */}
                      {upcomingCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#E52B50] text-white font-mono font-bold text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                          {upcomingCount}
                        </span>
                      )}
                    </button>

                    {/* Unified multi-account dropdown */}
                    {profileCardOpenId === activeBiz.id &&
                      (() => {
                        const bizCount = businesses.filter(
                          (b) => b.profileType === "business" || !b.profileType,
                        ).length;
                        const personalCount = businesses.filter(
                          (b) => b.profileType === "individual",
                        ).length;

                        return (
                          <>
                            {/* Interactive click escape overlay to dismiss profile popup modal */}
                            <div
                              className="fixed inset-0 bg-black/5 z-[998] cursor-pointer animate-fade-in"
                              onClick={() => {
                                setProfileCardOpenId(null);
                                setDeleteConfirmId(null);
                              }}
                            />
                            <div
                              id="profile_popup_card_global"
                              className="absolute -right-2 sm:right-0 top-full mt-4 w-[calc(100vw-32px)] sm:w-80 max-w-[21.5rem] bg-white shadow-[0_24px_48px_rgba(0,0,0,0.12)] rounded-3xl z-[999] p-5 divide-y divide-gray-100 space-y-4 animate-scale-in text-left font-sans ring-1 ring-black/5 overflow-hidden border border-[#39FF14]/20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E824C] via-[#39FF14] to-[#45B1E8]" />
                              {/* Dropdown Header segment */}
                              <div className="flex justify-between items-start pb-2 relative pt-1">
                                <div>
                                  <span className="text-[9px] bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#1E824C] font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">
                                    Active Campaign Profile
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setProfileCardOpenId(null);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="text-gray-400 hover:text-[#1E824C] bg-gray-50 hover:bg-[#39FF14]/10 p-1.5 rounded-full transition-colors cursor-pointer"
                                  title="Close profile options"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Top: Active profile presentation block */}
                              <div className="py-3">
                                <div className="flex items-center gap-4 group">
                                  <div className="relative">
                                    {activeBiz.logoUrl ? (
                                      <img
                                        src={activeBiz.logoUrl}
                                        alt={activeBiz.businessName}
                                        referrerPolicy="no-referrer"
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-[0_0_0_2px_rgba(57,255,20,0.4)] bg-white transition-transform group-hover:scale-105"
                                      />
                                    ) : (
                                      <div
                                        className={`w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-2xl shadow-[0_0_0_2px_rgba(57,255,20,0.4)] border-2 border-white text-white font-playful tracking-normal transition-transform group-hover:scale-105 ${getVibrantAvatarClass(activeBiz.businessName)}`}
                                      >
                                        {initials}
                                      </div>
                                    )}
                                    <div className="absolute -bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#39FF14] border-2 border-white rounded-full z-10" />
                                  </div>

                                  <div className="min-w-0 flex-1 pl-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // Edit parameters loading
                                        setEditingBusinessId(activeBiz.id);
                                        setNewBizName(activeBiz.businessName);
                                        setNewBizIndustry(activeBiz.industry);

                                        const selectableCategories = [
                                          "Logistics & Delivery",
                                          "Retail & E-commerce",
                                          "Professional Services",
                                          "Technology & Software",
                                          "Fintech & Banking",
                                          "Fashion & Aesthetics",
                                          "Healthcare & Wellness",
                                          "Education & Consulting",
                                          "Food & Hospitality",
                                        ];

                                        if (
                                          selectableCategories.includes(
                                            activeBiz.industry,
                                          )
                                        ) {
                                          setNewBizIndustryDropdown(
                                            activeBiz.industry,
                                          );
                                          setNewBizIndustryCustom("");
                                        } else {
                                          setNewBizIndustryDropdown("Custom");
                                          setNewBizIndustryCustom(
                                            activeBiz.industry,
                                          );
                                        }

                                        setNewBizLocation(activeBiz.location);
                                        setNewBizLogoUrl(
                                          activeBiz.logoUrl || "",
                                        );
                                        setNewBizBrandColor(
                                          activeBiz.brandColor || "#1F4D43",
                                        );
                                        setNewBizAccentColor(
                                          activeBiz.accentColor || "#E8B14A",
                                        );
                                        setNewBizSubscribed(
                                          activeBiz.subscribedOccasions || [],
                                        );
                                        setNewBizCountries(
                                          activeBiz.countries || ["Nigeria"],
                                        );
                                        setNewBizType(
                                          activeBiz.businessType || "Both",
                                        );
                                        setNewProfileType(
                                          activeBiz.profileType || "business",
                                        );
                                        setNewCustomEvents(
                                          activeBiz.customEvents || [],
                                        );
                                        setNewBizPhone(activeBiz.phone || "");
                                        setNewBizEmail(activeBiz.email || "");
                                        setNewBizInstagram(
                                          activeBiz.instagram || "",
                                        );
                                        setNewBizXUsername(activeBiz.xUsername || "");
                                        setNewBizDescription(
                                          activeBiz.description || "",
                                        );

                                        setAddBizStep(1);
                                        setOnboardingError(null);
                                        setShowAddBiz(true);
                                        setProfileCardOpenId(null);
                                      }}
                                      className="text-sm font-bold text-charcoal hover:text-[#E52B50] hover:underline truncate font-display leading-tight flex items-center gap-1 text-left w-full group cursor-pointer"
                                      title="Click to edit profile parameters"
                                    >
                                      <span className="truncate">
                                        {activeBiz.businessName}
                                      </span>
                                      <Edit className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#E52B50] shrink-0 transition-colors" />
                                    </button>
                                    <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                                      {activeBiz.profileType === "individual" ? activeBiz.location : `${activeBiz.industry} • ${activeBiz.location}`}
                                    </span>
                                    <span
                                      className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-md inline-block mt-1 ${
                                        activeBiz.profileType === "individual"
                                          ? "bg-[#E52B50]/10 text-[#E52B50]"
                                          : "bg-[#1E824C]/10 text-[#1E824C]"
                                      }`}
                                    >
                                      {activeBiz.profileType === "individual"
                                        ? "Personal Account"
                                        : `Business Account • ${activeBiz.businessType || "Both"}`}
                                    </span>
                                  </div>

                                  {/* Delete Option for Active Account */}
                                  <div className="shrink-0">
                                    {deleteConfirmId === activeBiz.id ? (
                                      <div className="flex flex-col gap-1 items-end bg-rose-50 border border-rose-200 p-1.5 rounded-lg animate-fade-in z-20">
                                        <span className="text-[8px] text-rose-700 font-bold uppercase">
                                          Confirm?
                                        </span>
                                        <div className="flex gap-1">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDeleteBusiness(activeBiz.id)
                                            }
                                            className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[8px] font-bold shadow-sm"
                                          >
                                            Yes
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setDeleteConfirmId(null)
                                            }
                                            className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-[8px] font-bold"
                                          >
                                            No
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteConfirmId(activeBiz.id)
                                        }
                                        className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                        title="Delete active profile entirely"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 animate-pulse" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Dedicated Holidays Directory launchpad segment */}
                              <div className="py-3 bg-neutral-50/70 border border-[#EEDFD2] rounded-xl px-3.5 flex flex-col gap-1.5 font-sans">
                                <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono font-bold uppercase tracking-wider">
                                  <span>Sourced calendar feeds</span>
                                  <span className="text-[#E52B50] font-bold">
                                    {activeBiz?.subscribedOccasions?.length ||
                                      0}{" "}
                                    Subscribed
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowHolidaysFullPage(true);
                                    setProfileCardOpenId(null);
                                  }}
                                  className="w-full inline-flex justify-center items-center gap-1.5 px-3.5 py-2.5 bg-[#1E824C] hover:bg-[#155A34] text-white text-[10.5px] font-bold rounded-xl shadow-sm transition-all cursor-pointer font-sans uppercase tracking-wider border-none"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-[#E8B14A]" />
                                  <span>Holidays & Events Feed</span>
                                </button>
                              </div>

                              {/* Middle: Accounts Switcher & Stats indicators */}
                              <div className="py-3.5 space-y-2.5">
                                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                                  <span>Switch Accounts</span>
                                  <span>
                                    {bizCount}/2 Biz • {personalCount}/1 Pers
                                  </span>
                                </div>

                                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                                  {businesses.map((b) => {
                                    if (b.id === activeBiz.id) return null;
                                    const bInitials = b.businessName
                                      ? b.businessName
                                          .trim()
                                          .charAt(0)
                                          .toUpperCase()
                                      : "B";
                                    return (
                                      <div
                                        key={b.id}
                                        onClick={() => {
                                          setSelectedBusinessId(b.id);
                                          localStorage.setItem(
                                            "coloh_current_biz",
                                            b.id,
                                          );
                                          setGeneratedFlyers([]);
                                          setProfileCardOpenId(null);
                                        }}
                                        className="flex justify-between items-center p-2 rounded-xl border border-transparent hover:border-gray-100 hover:bg-slate-50 cursor-pointer transition-all min-w-0"
                                      >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] text-white font-playful tracking-normal shrink-0 border border-slate-200/50 overflow-hidden ${b.logoUrl ? "bg-white" : getVibrantAvatarClass(b.businessName)}`}
                                          >
                                            {b.logoUrl ? (
                                              <img
                                                src={b.logoUrl}
                                                alt={b.businessName}
                                                referrerPolicy="no-referrer"
                                                className="w-full h-full rounded-full object-cover p-0.5 bg-white"
                                              />
                                            ) : (
                                              <span>{bInitials}</span>
                                            )}
                                          </div>
                                          <div className="min-w-0 flex-1 text-left">
                                            <span className="text-xs font-bold text-gray-700 truncate block hover:underline">
                                              {b.businessName}
                                            </span>
                                            <span className="text-[9px] text-[#888] block">
                                              {b.profileType === "individual"
                                                ? "Personal"
                                                : "Business"}{" "}
                                              Account
                                            </span>
                                          </div>
                                        </div>

                                        {/* Delete option for stored profiles */}
                                        <div
                                          className="shrink-0 ml-1.5"
                                          onClick={(ev) => ev.stopPropagation()}
                                        >
                                          {deleteConfirmId === b.id ? (
                                            <div className="flex gap-1 items-center bg-rose-50 border border-rose-200 p-1 rounded-md animate-fade-in">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleDeleteBusiness(b.id)
                                                }
                                                className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[8px] font-bold shadow-sm"
                                              >
                                                Go
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setDeleteConfirmId(null)
                                                }
                                                className="px-1 py-0.5 bg-gray-200 text-gray-700 rounded text-[8px] font-bold"
                                              >
                                                No
                                              </button>
                                            </div>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setDeleteConfirmId(b.id)
                                              }
                                              className="p-1 text-gray-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                                              title="Delete stored profile entirely"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {businesses.length <= 1 && (
                                    <div className="text-[9px] text-gray-400 py-1 text-center font-mono uppercase tracking-wider font-bold">
                                      No secondary profile setup yet.
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Bottom actions: add profile, holidays trigger, sign out, and limits details */}
                              <div className="pt-3.5 flex flex-col gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowHolidaysFullPage(true);
                                    setCurrentCardIndex(0);
                                    setProfileCardOpenId(null);
                                  }}
                                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1E824C]/10 hover:bg-[#1E824C]/20 border border-[#1E824C]/25 text-[#1E824C] text-[11px] font-bold rounded-xl transition-all shadow-sm cursor-pointer font-sans"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-[#E8B14A] animate-pulse" />
                                  <span>Holidays & Events Feed</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingBusinessId(null);
                                    setNewBizName("");
                                    setNewBizIndustry("Logistics & Delivery");
                                    setNewBizIndustryDropdown(
                                      "Logistics & Delivery",
                                    );
                                    setNewBizIndustryCustom("");
                                    setNewBizLocation("");
                                    setNewBizLogoUrl("");
                                    setNewBizBrandColor("#1F4D43");
                                    setNewBizAccentColor("#E8B14A");
                                    setNewBizSubscribed([]);
                                    setNewBizCountries(["Nigeria"]);
                                    setNewProfileType("business");
                                    setNewCustomEvents([]);
                                    setTempEventName("");
                                    setTempEventDate("");
                                    setTempEventType("birthday");
                                    setAddBizStep(1);
                                    setOnboardingError(null);
                                    setShowAddBiz(true);
                                    setProfileCardOpenId(null);
                                  }}
                                  className="w-full inline-flex items-center justify-center gap-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl shadow-sm transition-all cursor-pointer border-none font-sans"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add New Profile Account</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to clear the entire workspace and log out?",
                                      )
                                    ) {
                                      localStorage.clear();
                                      setBusinesses([]);
                                      setProfileCardOpenId(null);
                                    }
                                  }}
                                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded-xl shadow-sm transition-all cursor-pointer border border-rose-200 mt-1 uppercase tracking-wider"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Clear Cache & Reset</span>
                                </button>

                                <div className="text-[8.5px] text-gray-405 text-center leading-relaxed">
                                  Eligible limit bounds: Maximum of 2 Business
                                  profiles & 1 Personal profile.
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                  </div>
                );
              })()}

            {/* Removed the 'register a business or profile first' text warning completely as requested */}
          </div>
        </div>
      </header>

      {/* Main Campaign Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Global Transparent Overlay Spinner when Saving/Updating Profiles as requested */}
        {isSavingProfile && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center space-y-6 animate-fade-in pointer-events-auto select-none">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#E52B50] animate-spin"></div>
              <span className="text-slate-800 text-xs font-mono font-black">
                {savingProgressPercent}%
              </span>
            </div>
            <div className="space-y-2 text-center max-w-sm">
              <h3 className="text-base font-bold text-charcoal font-display">
                Activating Campaign Profile...
              </h3>
              <p className="text-xs text-gray-500 font-sans px-4">
                Matching best seasonal dates and calibrating copywriting engine
              </p>
            </div>

            {/* Horizontal progress representation */}
            <div className="w-full max-w-[200px] bg-slate-100 h-1 rounded-full overflow-hidden">
              <div
                className="bg-[#E52B50] h-full transition-all duration-100"
                style={{ width: `${savingProgressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Brand Banner with Taglines - Only displays on pristine landing phase */}
        {businesses.length === 0 && !showAddBiz && (
          <div className="space-y-6">
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-border-gray shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3.5xl font-sans font-bold text-[#1E824C] tracking-normal leading-tight italic">
                  "You don't remember 20 marketing opportunities every year. We
                  do."
                </h2>
                <p className="text-sm text-[#6B7280] font-sans">
                  Never miss a celebratory date again. We template, copywrite,
                  and compose it — you send it.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-bgsoft p-4 border border-border-gray rounded-2xl w-full md:w-auto shrink-0 shadow-inner">
                <Clock className="w-10 h-10 text-[#E52B50] shrink-0 font-playful" />
                <div>
                  <div className="text-[10px] text-gray-500 font-bold font-display uppercase tracking-wider">
                    Current Local Calendar Frame
                  </div>
                  <div className="text-sm text-[#F25C3D] font-display font-bold mt-0.5">
                    {currentSeasonName}
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-white border border-border-gray rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 bg-[#E52B50]/10 rounded-2xl flex items-center justify-center mx-auto text-[#E52B50]">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-charcoal font-display">
                No Registered Campaign Profiles
              </h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                An active identity (Business or Personal profile) is required to
                auto-produce themed greetings and copywright social flyers.
                Register one now to get started.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingBusinessId(null);
                  setNewBizName("");
                  setNewBizIndustry("Logistics & Delivery");
                  setNewBizIndustryDropdown("Logistics & Delivery");
                  setNewBizIndustryCustom("");
                  setNewBizLocation("");
                  setNewBizLogoUrl("");
                  setNewBizBrandColor("#1F4D43");
                  setNewBizAccentColor("#E8B14A");
                  setNewBizSubscribed([]);
                  setNewBizCountries(["Nigeria"]);
                  setNewProfileType("business");
                  setNewCustomEvents([]);
                  setTempEventName("");
                  setTempEventDate("");
                  setTempEventType("birthday");
                  setAddBizStep(1);
                  setOnboardingError(null);
                  setShowAddBiz(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E52B50] hover:bg-[#B81E3D] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer font-sans border-none"
              >
                <Plus className="w-4 h-4" />
                <span>Register a Campaign Profile</span>
              </button>
            </div>
          </div>
        )}

        {showAddBiz && (
          /* Profile Registry Multi-Step Wizard - Full Page Experience Stretching From Top to Bottom with scrollbar at far right */
          <section
            id="add_business_panel"
            className="fixed inset-0 bg-white z-[999] flex flex-col w-full h-full overflow-y-auto animate-fade-in font-sans"
          >
            <div className="w-full flex-1 flex flex-col p-6 sm:p-12 max-w-3xl mx-auto h-auto justify-between min-h-screen">
              <form
                onSubmit={handleCreateBusiness}
                className="flex-grow flex flex-col justify-between overflow-visible"
              >
                {/* Header of Onboarding with beautiful clickable steps progress indicator (Slimmed) */}
                <div className="mb-4 space-y-2 shrink-0">
                  <div className="flex justify-between items-center">
                    <h2 className="text-base font-extrabold text-charcoal font-display tracking-tight">
                      {editingBusinessId
                        ? "Edit Campaign Profile"
                        : "Register New Campaign Profile"}
                    </h2>
                    <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md">
                      Step {addBizStep} of 6
                    </span>
                  </div>

                  {/* Slimmed progress indicator bar - Clickable for fast-travel */}
                  <div className="grid grid-cols-6 gap-1.5 pb-2 border-b border-gray-100">
                    {[
                      { label: "Profile Focus", color: "#1E824C" },
                      { label: "Mission", color: "#F25C3D" },
                      { label: "Milestones", color: "#E52B50" },
                      { label: "Design Asset", color: "#0076A3" },
                      { label: "Country Affiliations", color: "#45B1E8" },
                      { label: "Identity Preview", color: "#8854D0" },
                    ].map((st, i) => {
                      const stepIdx = i + 1;
                      const isPast = addBizStep > stepIdx;
                      const isActive = addBizStep === stepIdx;
                      return (
                        <button
                          key={st.label}
                          type="button"
                          onClick={() => {
                            if (stepIdx > 1 && !newBizName.trim()) {
                              setOnboardingError(
                                "Display / Company Registered Name is required before leaving step 1.",
                              );
                              return;
                            }
                            setOnboardingError(null);
                            setAddBizStep(stepIdx);
                          }}
                          className="flex flex-col gap-1 text-left focus:outline-none cursor-pointer group select-none border-none bg-transparent"
                          title={`Go to Step ${stepIdx}: ${st.label}`}
                        >
                          <div
                            className="h-1.5 w-full rounded-full transition-all duration-300 group-hover:opacity-100"
                            style={{
                              backgroundColor:
                                isPast || isActive ? st.color : "#E5E7EB",
                              opacity: isActive ? 1 : isPast ? 0.7 : 0.3,
                            }}
                          />
                          <span
                            className="text-[7.5px] font-extrabold uppercase tracking-widest hidden sm:block truncate text-center w-full group-hover:underline"
                            style={{
                              color: isPast || isActive ? st.color : "#9CA3AF",
                            }}
                          >
                            {st.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Body - Spacious and fully visible for outer document scrolling */}
                <div className="flex-grow py-1 pr-1 pb-28 overflow-visible">
                  {/* Onboarding Error Notification Block */}
                  {onboardingError && (
                    <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-3.5 text-xs font-bold font-sans flex items-start gap-2 animate-fade-in shrink-0">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>{onboardingError}</div>
                    </div>
                  )}

                  {/* STEP 1: Profile Type & Basic Coordinates */}
                  {addBizStep === 1 && (
                    <div className="space-y-4 py-2 animate-fade-in text-left">
                      <div>
                        <span className="block text-xs font-bold text-[#1E824C] uppercase tracking-wider mb-2">
                          Select Campaign Profile Type
                        </span>
                        <div className="grid grid-cols-2 gap-4">
                          {(() => {
                            const bizLimitReached =
                              !editingBusinessId &&
                              businesses.filter(
                                (b) =>
                                  b.profileType === "business" ||
                                  !b.profileType,
                              ).length >= 2;
                            return (
                              <button
                                type="button"
                                disabled={bizLimitReached}
                                onClick={() => {
                                  setNewProfileType("business");
                                  setNewBizIndustry("Logistics & Delivery");
                                  setNewBizIndustryDropdown(
                                    "Logistics & Delivery",
                                  );
                                }}
                                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                                  bizLimitReached
                                    ? "opacity-40 cursor-not-allowed border-[#EEDFD2] bg-gray-50 text-gray-400"
                                    : newProfileType === "business"
                                      ? "bg-[#1E824C]/5 text-[#1E824C] border-[#1E824C] ring-2 ring-[#1E824C]/20 font-bold"
                                      : "bg-white hover:bg-slate-50 border-border-gray text-gray-500"
                                }`}
                                title={
                                  bizLimitReached
                                    ? "Maximum of 2 business profiles reached"
                                    : ""
                                }
                              >
                                <Building2 className="w-6 h-6 animate-pulse" />
                                <div className="text-xs font-bold font-display">
                                  Business Profile
                                </div>
                                <div className="text-[10px] opacity-75 font-sans">
                                  {bizLimitReached
                                    ? "Limit (2/2) Reached"
                                    : "Launch corporate campaigns & flyering"}
                                </div>
                              </button>
                            );
                          })()}

                          {(() => {
                            const persLimitReached =
                              !editingBusinessId &&
                              businesses.filter(
                                (b) => b.profileType === "individual",
                              ).length >= 1;
                            return (
                              <button
                                type="button"
                                disabled={persLimitReached}
                                onClick={() => {
                                  setNewProfileType("individual");
                                  setNewBizIndustry("Personal");
                                  setNewBizIndustryDropdown("Personal");
                                }}
                                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                                  persLimitReached
                                    ? "opacity-40 cursor-not-allowed border-[#EEDFD2] bg-gray-50 text-gray-400"
                                    : newProfileType === "individual"
                                      ? "bg-[#1E824C]/5 text-[#1E824C] border-[#1E824C] ring-2 ring-[#1E824C]/20 font-bold"
                                      : "bg-white hover:bg-slate-50 border-border-gray text-gray-500"
                                }`}
                                title={
                                  persLimitReached
                                    ? "Maximum of 1 personal profile reached"
                                    : ""
                                }
                              >
                                <User className="w-6 h-6 animate-pulse" />
                                <div className="text-xs font-bold font-display">
                                  Personal Individual
                                </div>
                                <div className="text-[10px] opacity-75 font-sans">
                                  {persLimitReached
                                    ? "Limit (1/1) Reached"
                                    : "Personal greeting cards"}
                                </div>
                              </button>
                            );
                          })()}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="form_biz_name"
                          className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                        >
                          {newProfileType === "business"
                            ? "Company Registered Name"
                            : "Display Name"}
                        </label>
                        <input
                          id="form_biz_name"
                          type="text"
                          placeholder={
                            newProfileType === "business"
                              ? "e.g. Eagle Logistics Hub"
                              : "e.g. Kolawole Davies"
                          }
                          value={newBizName}
                          onChange={(e) => setNewBizName(e.target.value)}
                          className="block w-full px-4 py-3 bg-bgsoft border border-border-gray rounded-2xl focus:ring-1 focus:ring-[#1E824C] focus:border-transparent text-sm text-charcoal placeholder-gray-400 font-sans"
                        />
                      </div>

                      {newProfileType === "business" ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label
                                htmlFor="form_biz_industry"
                                className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                              >
                                Industry Sector
                              </label>
                              <select
                                id="form_biz_industry"
                                value={newBizIndustryDropdown}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNewBizIndustryDropdown(val);
                                  if (val === "Custom") {
                                    setNewBizIndustry(
                                      newBizIndustryCustom || "Custom",
                                    );
                                  } else {
                                    setNewBizIndustry(val);
                                  }
                                }}
                                className="block w-full px-4 py-3 bg-bgsoft border border-border-gray rounded-2xl focus:ring-1 focus:ring-[#1E824C] focus:border-transparent text-sm text-charcoal font-sans"
                              >
                                <option value="Logistics & Delivery">
                                  Logistics & Delivery
                                </option>
                                <option value="Retail & E-commerce">
                                  Retail & E-commerce
                                </option>
                                <option value="Professional Services">
                                  Professional Services
                                </option>
                                <option value="Technology & Software">
                                  Technology & Software
                                </option>
                                <option value="Fintech & Banking">
                                  Fintech & Banking
                                </option>
                                <option value="Fashion & Aesthetics">
                                  Fashion & Aesthetics
                                </option>
                                <option value="Healthcare & Wellness">
                                  Healthcare & Wellness
                                </option>
                                <option value="Education & Consulting">
                                  Education & Consulting
                                </option>
                                <option value="Food & Hospitality">
                                  Food & Hospitality
                                </option>
                                <option value="Custom">
                                  Other (Type Custom Category Below...)
                                </option>
                              </select>

                              {newBizIndustryDropdown === "Custom" && (
                                <div className="mt-2 animate-fade-in">
                                  <label
                                    htmlFor="form_biz_industry_custom"
                                    className="sr-only"
                                  >
                                    Type custom category
                                  </label>
                                  <input
                                    id="form_biz_industry_custom"
                                    type="text"
                                    placeholder="Type custom focus category"
                                    value={newBizIndustryCustom}
                                    onChange={(e) => {
                                      setNewBizIndustryCustom(e.target.value);
                                      setNewBizIndustry(e.target.value);
                                    }}
                                    className="block w-full px-3 py-2 bg-white border border-border-gray rounded-xl focus:ring-1 focus:ring-[#1E824C] focus:border-transparent text-xs text-charcoal placeholder-gray-400 shadow-inner"
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor="form_biz_loc"
                                className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                              >
                                HQ City / Base Location
                              </label>
                              <input
                                id="form_biz_loc"
                                type="text"
                                placeholder="e.g. Victoria Island, Lagos"
                                value={newBizLocation}
                                onChange={(e) =>
                                  setNewBizLocation(e.target.value)
                                }
                                className="block w-full px-4 py-3 bg-bgsoft border border-border-gray rounded-2xl focus:ring-1 focus:ring-[#1E824C] focus:border-transparent text-sm text-charcoal placeholder-gray-400 font-sans"
                              />
                            </div>
                          </div>

                          <div className="mt-4 animate-fade-in">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                              Audience Focus / Business Model
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {(["B2B", "B2C", "Both"] as const).map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setNewBizType(type)}
                                  className={`px-4 py-2.5 text-xs font-bold rounded-2xl border transition-all duration-200 cursor-pointer ${
                                    newBizType === type
                                      ? "bg-[#1E824C] border-[#1E824C] text-white shadow-sm"
                                      : "bg-white border-border-gray hover:bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  {type === "Both" ? "Both (B2B & B2C)" : type}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div>
                          <label
                            htmlFor="form_biz_loc_individual"
                            className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                          >
                            Home City / Country
                          </label>
                          <input
                            id="form_biz_loc_individual"
                            type="text"
                            placeholder="e.g. Ikeja, Lagos"
                            value={newBizLocation}
                            onChange={(e) => setNewBizLocation(e.target.value)}
                            className="block w-full px-4 py-3 bg-bgsoft border border-border-gray rounded-2xl focus:ring-1 focus:ring-[#1E824C] focus:border-transparent text-sm text-charcoal placeholder-gray-400 font-sans"
                          />
                        </div>
                      )}

                      {/* Optional Fliers Contact Information Fields - Collapsible Accordion Box */}
                      <div className="border border-border-gray rounded-2xl bg-white overflow-hidden mt-4 shadow-sm text-left">
                        <button
                          type="button"
                          onClick={() => setContactsExpanded(!contactsExpanded)}
                          className="w-full flex justify-between items-center px-4 py-3 bg-[#FCFAF7] hover:bg-[#F3EDE0] transition-colors text-left focus:outline-none"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-700 font-sans tracking-wide">
                              Contacts (optional)
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              - Tap to{" "}
                              {contactsExpanded ? "collapse" : "expand"}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] text-gray-400 font-bold transition-transform duration-200 transform ${contactsExpanded ? "rotate-180" : ""}`}
                          >
                            ▼
                          </span>
                        </button>

                        {contactsExpanded && (
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-gray bg-white animate-fade-in">
                            <div>
                              <label
                                htmlFor="form_biz_phone"
                                className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5"
                              >
                                Phone
                              </label>
                              <input
                                id="form_biz_phone"
                                type="tel"
                                placeholder="e.g. +234 80 1234 5678"
                                value={newBizPhone}
                                onChange={(e) => setNewBizPhone(e.target.value)}
                                className="block w-full px-3 py-2 bg-bgsoft border border-border-gray rounded-xl focus:ring-1 focus:ring-[#1E824C] focus:border-transparent text-xs text-charcoal placeholder-gray-400 font-sans"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="form_biz_email"
                                className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5"
                              >
                                Email
                              </label>
                              <input
                                id="form_biz_email"
                                type="email"
                                placeholder="e.g. contact@domain.com"
                                value={newBizEmail}
                                onChange={(e) => setNewBizEmail(e.target.value)}
                                className="block w-full px-3 py-2 bg-bgsoft border border-border-gray rounded-xl focus:ring-1 focus:ring-[#1E824C] focus:border-transparent text-xs text-charcoal placeholder-gray-400 font-sans"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="form_biz_instagram"
                                className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5"
                              >
                                Instagram
                              </label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                                  @
                                </span>
                                <input
                                  id="form_biz_instagram"
                                  type="text"
                                  placeholder="username"
                                  value={newBizInstagram}
                                  onChange={(e) =>
                                    setNewBizInstagram(
                                      e.target.value.replace("@", ""),
                                    )
                                  }
                                  className="block w-full pl-6 pr-3 py-2 bg-bgsoft border border-border-gray rounded-xl focus:ring-1 focus:ring-[#1E824C] focus:border-transparent text-xs text-charcoal placeholder-gray-400 font-sans"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label
                                htmlFor="form_biz_x_username"
                                className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5"
                              >
                                X (Twitter)
                              </label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                                  @
                                </span>
                                <input
                                  id="form_biz_x_username"
                                  type="text"
                                  placeholder="username"
                                  value={newBizXUsername}
                                  onChange={(e) =>
                                    setNewBizXUsername(
                                      e.target.value.replace("@", ""),
                                    )
                                  }
                                  className="block w-full pl-6 pr-3 py-2 bg-bgsoft border border-border-gray rounded-xl focus:ring-1 focus:ring-[#1E824C] focus:border-transparent text-xs text-charcoal placeholder-gray-400 font-sans"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Standalone Brand Tagline, Beliefs & Mission (Separate Setup Screen) */}
                  {addBizStep === 2 && (
                    <div className="space-y-4 py-2 animate-fade-in text-left">
                      <div className="space-y-1">
                        <span className="block text-[10px] font-black text-[#F25C3D] uppercase tracking-widest bg-orange-50 inline-block px-2.5 py-1 rounded-md mb-1">
                          Step 2: Brand Tagline & Values Profile
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight font-display">
                          Identify Brand Values & Mission
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-sans">
                          These core values feed our dynamic recommendation
                          engine to highlight the most relevant seasonal
                          engagements for your audience.
                        </p>
                      </div>

                      <div className="space-y-3.5">
                        {/* Values templates quick select */}
                        <div className="space-y-3.5 mt-4">
                          <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 shrink-0 select-none">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                              Quick-Add Brand Focus Categories
                            </span>
                            <span className="text-[9px] font-black text-[#F25C3D] bg-orange-100/80 px-2 rounded font-mono">
                              {selectedTemplates.length}/4 Selected
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
                            {BUSINESS_TAGLINE_TEMPLATES.map((tpl) => {
                              const isActive = selectedTemplates.includes(
                                tpl.label,
                              );
                              return (
                                <button
                                  key={tpl.label}
                                  type="button"
                                  onClick={() => handleTemplateToggle(tpl)}
                                  className={`p-2.5 rounded-xl border transition-all text-left flex items-start gap-2.5 select-none cursor-pointer group ${
                                    isActive
                                      ? "bg-[#F25C3D] border-[#F25C3D] text-white shadow-xs"
                                      : "bg-white hover:bg-slate-50 border-gray-200/80 text-slate-700"
                                  }`}
                                >
                                  <div
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                      isActive
                                        ? "bg-white/20 text-white"
                                        : "bg-[#F25C3D]/5 text-[#F25C3D]"
                                    }`}
                                  >
                                    {getTemplateIcon(tpl.label)}
                                  </div>
                                  <div className="min-w-0 flex-1 leading-tight">
                                    <h4
                                      className={`font-bold text-[10.5px] truncate ${isActive ? "text-white" : "text-slate-800"}`}
                                    >
                                      {tpl.label}
                                    </h4>
                                    <p
                                      className={`text-[9px] line-clamp-1 mt-0.5 ${isActive ? "text-orange-100/90" : "text-gray-400"}`}
                                    >
                                      {tpl.text}
                                    </p>
                                  </div>
                                  <div className="shrink-0 pt-0.5">
                                    {isActive ? (
                                      <div className="w-4 h-4 rounded-full bg-white text-[#F25C3D] flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                      </div>
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 text-transparent group-hover:text-slate-400 transition-all flex items-center justify-center">
                                        <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-2 mt-4">
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                            Brand Tone & Voice
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {(
                              [
                                "corporate",
                                "friendly",
                                "playful",
                                "premium",
                              ] as BrandTone[]
                            ).map((tone) => (
                              <button
                                key={tone}
                                type="button"
                                onClick={() => setNewBizTone(tone)}
                                className={`px-4 py-3 text-xs font-bold rounded-2xl border transition-all duration-200 cursor-pointer capitalize ${
                                  newBizTone === tone
                                    ? "bg-[#F25C3D] border-[#F25C3D] text-white shadow-sm"
                                    : "bg-white border-border-gray hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                {tone}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sign-Off Settings */}
                        <div className="space-y-3 mt-6 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                              Use Personalized Sign-off?
                            </label>
                            <button
                              type="button"
                              onClick={() => setNewBizUseSignOff(!newBizUseSignOff)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${newBizUseSignOff ? "bg-[#1E824C]" : "bg-gray-300"}`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${newBizUseSignOff ? "translate-x-4.5" : "translate-x-1"}`} />
                            </button>
                          </div>
                          {newBizUseSignOff && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in mt-3">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                  Sign-off Name
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. John Doe"
                                  value={newBizSignOffName}
                                  onChange={(e) => setNewBizSignOffName(e.target.value)}
                                  className="block w-full px-3 py-2 bg-bgsoft border border-border-gray rounded-xl focus:ring-1 focus:ring-[#1E824C] focus:border-transparent text-xs text-charcoal placeholder-gray-400 font-sans"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                  Position/Role (Optional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Managing Director"
                                  value={newBizSignOffRole}
                                  onChange={(e) => setNewBizSignOffRole(e.target.value)}
                                  className="block w-full px-3 py-2 bg-bgsoft border border-border-gray rounded-xl focus:ring-1 focus:ring-[#1E824C] focus:border-transparent text-xs text-charcoal placeholder-gray-400 font-sans"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Custom Milestone Celebrations (Birthdays, Anniversaries) */}
                  {addBizStep === 3 && (
                    <div className="space-y-4 py-2 animate-fade-in text-left flex flex-col justify-start overflow-y-auto flex-1 min-h-0">
                      <div>
                        <span className="block text-xs font-bold text-[#E52B50] uppercase tracking-wider mb-1">
                          Custom Non-Occasions
                        </span>
                        <p className="text-xs text-gray-400 mb-3 font-sans leading-relaxed">
                          Capture custom dates such as customer/employee
                          anniversaries, family birthdays, or brand specific
                          milestones to celebrate them.
                        </p>
                      </div>

                      {/* Milestone details entering - Flat Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 py-2.5 bg-transparent shrink-0">
                        <div className="sm:col-span-4">
                          <label
                            htmlFor="milestone_name"
                            className="block text-[10px] font-bold text-gray-500 uppercase mb-1"
                          >
                            Event Name
                          </label>
                          <input
                            id="milestone_name"
                            type="text"
                            placeholder="e.g. John's Birthday, Anniversary"
                            value={tempEventName}
                            onChange={(e) => setTempEventName(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-border-gray rounded-xl text-xs font-sans text-charcoal focus:outline-none focus:ring-1 focus:ring-[#E52B50]"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label
                            htmlFor="milestone_date"
                            className="block text-[10px] font-bold text-gray-500 uppercase mb-1"
                          >
                            Date
                          </label>
                          <input
                            id="milestone_date"
                            type="date"
                            value={tempEventDate}
                            onChange={(e) => setTempEventDate(e.target.value)}
                            className="block w-full px-2 py-2 bg-white border border-border-gray rounded-xl text-xs font-sans text-[#444] focus:outline-none focus:ring-1 focus:ring-[#E52B50]"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label
                            htmlFor="milestone_type"
                            className="block text-[10px] font-bold text-gray-500 uppercase mb-1"
                          >
                            Type
                          </label>
                          <select
                            id="milestone_type"
                            value={tempEventType}
                            onChange={(e) =>
                              setTempEventType(
                                e.target.value as
                                  | "birthday"
                                  | "anniversary"
                                  | "other",
                              )
                            }
                            className="block w-full px-2 py-2 bg-white border border-border-gray rounded-xl text-xs font-sans text-[#444] focus:outline-none focus:ring-1 focus:ring-[#E52B50]"
                          >
                            <option value="birthday">Birthday</option>
                            <option value="anniversary">Anniversary</option>
                            <option value="other">
                              Other (Other events with notes)
                            </option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (!tempEventName.trim()) {
                                showToast(
                                  "Please enter custom celebration name first!",
                                  "info",
                                );
                                return;
                              }
                              if (!tempEventDate) {
                                showToast(
                                  "Please specify the milestone date first!",
                                  "info",
                                );
                                return;
                              }
                              // Parse into suitable representation (MM-DD)
                              const parts = tempEventDate.split("-");
                              let formattedDate = tempEventDate;
                              if (parts.length === 3) {
                                // YYYY-MM-DD
                                formattedDate = `${parts[1]}-${parts[2]}`;
                              }

                              if (editingEventId) {
                                // Save edit
                                setNewCustomEvents((prev) =>
                                  prev.map((evt) => {
                                    if (evt.id === editingEventId) {
                                      return {
                                        ...evt,
                                        name: tempEventName,
                                        date: formattedDate,
                                        type: tempEventType,
                                        notes: tempEventNotes,
                                        isAnnual: tempEventIsAnnual,
                                      };
                                    }
                                    return evt;
                                  }),
                                );
                                showToast("Event updated successfully!");
                                setEditingEventId(null);
                              } else {
                                // Add new event
                                const newEvent = {
                                  id: "custom_" + Date.now(),
                                  name: tempEventName,
                                  date: formattedDate,
                                  type: tempEventType,
                                  notes: tempEventNotes,
                                  isAnnual: tempEventIsAnnual,
                                };
                                setNewCustomEvents((prev) => [
                                  ...prev,
                                  newEvent,
                                ]);
                                showToast("Event added successfully!");
                              }

                              setTempEventName("");
                              setTempEventDate("");
                              setTempEventNotes("");
                              setTempEventIsAnnual(true);
                            }}
                            className="w-full bg-[#E52B50] hover:bg-[#B81E3D] inline-flex items-center justify-center p-2.5 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer border-none animate-scale-in"
                          >
                            {editingEventId ? "Save" : "Add"}
                          </button>
                        </div>

                        {/* Repeat annually check box */}
                        <div className="sm:col-span-12 flex items-center gap-2 mt-1 select-none">
                          <input
                            id="milestone_is_annual"
                            type="checkbox"
                            checked={tempEventIsAnnual}
                            onChange={(e) =>
                              setTempEventIsAnnual(e.target.checked)
                            }
                            className="w-4 h-4 text-[#E52B50] border-border-gray rounded focus:ring-[#E52B50] cursor-pointer"
                          />
                          <label
                            htmlFor="milestone_is_annual"
                            className="text-xs text-gray-500 font-bold cursor-pointer font-sans"
                          >
                            annual event
                          </label>
                          {editingEventId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEventId(null);
                                setTempEventName("");
                                setTempEventDate("");
                                setTempEventNotes("");
                                setTempEventIsAnnual(true);
                              }}
                              className="ml-auto text-[#E52B50] hover:underline text-xs bg-transparent border-none cursor-pointer"
                            >
                              Cancel Edit
                            </button>
                          )}
                        </div>

                        {/* Always show Notes / Details field for custom events */}
                        <div className="sm:col-span-12 mt-1">
                          <label
                            htmlFor="milestone_notes"
                            className="block text-[10px] font-bold text-gray-500 uppercase mb-1"
                          >
                            Notes / What is this about?{" "}
                            <span className="text-[9px] text-gray-400 font-normal lowercase">
                              (Optional)
                            </span>
                          </label>
                          <textarea
                            id="milestone_notes"
                            rows={1}
                            placeholder={
                              tempEventType === "other"
                                ? "Describe and add explanatory notes context about this custom milestone..."
                                : "Add details or personal campaign notes about this celebration..."
                            }
                            value={tempEventNotes}
                            onChange={(e) => setTempEventNotes(e.target.value)}
                            className="block w-full px-3 py-1.5 bg-white border border-border-gray rounded-xl text-xs font-sans text-charcoal focus:ring-1 focus:ring-[#E52B50] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Displaying added custom milestones */}
                      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
                        <span className="block text-[10px] font-bold text-[#E52B50] uppercase mb-1.5 shrink-0">
                          Captured Milestones ({newCustomEvents.length})
                        </span>
                        {newCustomEvents.length > 0 ? (
                          <div className="overflow-y-auto max-h-[160px] border border-border-gray bg-white rounded-xl p-2.5 space-y-1 font-sans">
                            {newCustomEvents.map((evt) => (
                              <div
                                key={evt.id}
                                className="flex justify-between items-center bg-white hover:bg-[#45B1E8]/5 border border-slate-100 p-1.5 px-3 rounded-xl text-xs transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                <div className="flex flex-col min-w-0 flex-1 text-left">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-neutral-800 text-[11px] truncate max-w-[120px]">
                                      {evt.name}
                                    </span>
                                    <span className="text-[8px] bg-slate-100 text-slate-800 border border-slate-200/50 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider shrink-0">
                                      {evt.type}
                                    </span>
                                    {evt.isAnnual !== false && (
                                      <span className="text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-150 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider shrink-0">
                                        Annual
                                      </span>
                                    )}
                                  </div>
                                  {evt.notes && (
                                    <span className="text-[9.5px] text-gray-400 font-sans truncate max-w-[150px] sm:max-w-[220px]">
                                      {evt.notes}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  <span className="text-[9px] text-[#45B1E8] bg-[#45B1E8]/10 border border-[#45B1E8]/20 px-2 py-0.5 rounded-md font-mono font-bold shrink-0">
                                    {evt.date}
                                  </span>

                                  <div className="flex items-center gap-1 border-l border-gray-100 pl-1.5">
                                    {/* Edit Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingEventId(evt.id);
                                        setTempEventName(evt.name);
                                        setTempEventDate(
                                          evt.date.length === 5
                                            ? `2026-${evt.date}`
                                            : evt.date,
                                        );
                                        setTempEventType(evt.type);
                                        setTempEventNotes(evt.notes || "");
                                        setTempEventIsAnnual(
                                          evt.isAnnual !== false,
                                        );
                                      }}
                                      className="p-1 text-gray-400 hover:text-[#45B1E8] hover:bg-[#45B1E8]/10 rounded-lg transition-colors"
                                      title="Edit event details"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (editingEventId === evt.id) {
                                          setEditingEventId(null);
                                          setTempEventName("");
                                          setTempEventDate("");
                                          setTempEventNotes("");
                                          setTempEventIsAnnual(true);
                                        }
                                        setNewCustomEvents((prev) =>
                                          prev.filter((e) => e.id !== evt.id),
                                        );
                                      }}
                                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-rose-50 rounded-lg transition-colors"
                                      title="Delete custom celebration"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-border-gray bg-[#FCFDFE] rounded-xl p-4.5 text-center text-xs text-gray-400 font-sans">
                            No custom celebrations captured yet. Use the inputs
                            above to add one.
                          </div>
                        )}

                        {/* Step remains fully navigable using Next or the progress stepper above */}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Brand Identity - No Scroll */}
                  {addBizStep === 4 && (
                    <div className="space-y-6 py-4 animate-fade-in text-left">
                      <div className="space-y-3">
                        <span className="block text-xs font-bold text-[#0076A3] uppercase tracking-wider">
                          Company Logo & Brand Expression
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Direct Upload Box with success thumbnail preview */}
                          <div className="border-2 border-dashed border-border-gray hover:border-[#0076A3]/50 bg-[#FCFDFE] rounded-2xl p-5 text-center cursor-pointer transition-all relative flex flex-col justify-center items-center group min-h-[140px]">
                            <input
                              id="form_biz_logo_upload"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFilesSelect}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            {newBizLogoUrl ? (
                              <div className="flex flex-col items-center gap-2 z-20">
                                <img
                                  src={newBizLogoUrl}
                                  alt="Uploaded business logo preview"
                                  referrerPolicy="no-referrer"
                                  className="w-16 h-16 rounded-none object-contain border border-border-gray bg-white p-1 shadow-md animate-scale-in"
                                />
                                <span className="text-[10px] text-[#0076A3] font-bold flex items-center gap-1 bg-[#0076A3]/15 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3 text-[#0076A3]" />{" "}
                                  {newBizLogoUrl.startsWith("data:") ? "Upload Success" : "Logo Active"}
                                </span>
                                <span className="text-[9px] text-gray-400 font-sans">
                                  Click/Drag to replace
                                </span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-[#0076A3] mb-2 group-hover:scale-105 transition-transform" />
                                <span className="text-xs font-bold text-[#6B7280]">
                                  Direct Logo Upload
                                </span>
                                <span className="text-[10px] text-gray-400 mt-0.5 font-sans">
                                  Drag/Drop or Tap to select image
                                </span>
                              </>
                            )}
                          </div>

                          {/* URL Fallback Box */}
                          <div className="border border-border-gray rounded-2xl p-5 bg-white flex flex-col justify-center gap-2">
                            <label
                              htmlFor="form_biz_logo"
                              className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider font-sans mt-0.5"
                            >
                              Or Paste Logo Image URL
                            </label>
                            <input
                              id="form_biz_logo"
                              type="text"
                              placeholder="e.g. https://domain.local/logo.png"
                              value={
                                newBizLogoUrl.startsWith("data:")
                                  ? ""
                                  : newBizLogoUrl
                              }
                              onChange={(e) => setNewBizLogoUrl(e.target.value)}
                              className="block w-full px-3.5 py-2.5 bg-bgsoft border border-border-gray rounded-xl focus:ring-1 focus:ring-[#0076A3] focus:border-transparent text-xs text-charcoal placeholder-gray-400 font-mono"
                            />
                            {newBizLogoUrl &&
                              newBizLogoUrl.startsWith("data:") && (
                                <span className="text-[9px] bg-[#0076A3]/15 text-[#0076A3] px-2.5 py-1 rounded inline-flex items-center gap-1 font-bold animate-pulse">
                                  <Check className="w-3 h-3 shrink-0 text-[#0076A3]" />{" "}
                                  Direct Memory Upload Active
                                </span>
                              )}
                            {newBizLogoUrl &&
                              !newBizLogoUrl.startsWith("data:") && (
                                <div className="flex items-center gap-2 mt-1">
                                  <img
                                    src={newBizLogoUrl}
                                    alt="Logo URL preview"
                                    referrerPolicy="no-referrer"
                                    className="w-8 h-8 rounded border object-contain bg-slate-50"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display =
                                        "none";
                                    }}
                                  />
                                  <span className="text-[9px] text-gray-400 font-sans">
                                    URL synced
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>

                        {extractedBrand && extractedBrand.colors && extractedBrand.colors.length > 0 && newBizLogoUrl && (
                          <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col gap-2 animate-fade-in text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                                  Color Palette Extracted
                                </span>
                            </div>
                            <p className="text-xs text-indigo-900/80 font-sans">
                              We successfully extracted your brand colors. Carditaur will use these to automatically style and brand all generated flyers (backgrounds, text, and assets).
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              {extractedBrand.colors.map((color: string, i: number) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                  <div 
                                    className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="text-[9px] text-gray-500 font-mono uppercase">{color}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                  {/* STEP 5: Dedicated Country selection page - active regions we are affiliated with */}
                  {addBizStep === 5 && (
                    <div className="space-y-4 py-4 animate-fade-in text-left">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                          <span className="block text-xs font-bold text-[#45B1E8] uppercase tracking-wider">
                            Active Countries & Affiliations
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full select-none ${
                              newBizCountries.length === 5
                                ? "bg-amber-100 text-amber-800"
                                : newBizCountries.length > 0
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {newBizCountries.length}/5 Countries Selected
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 font-sans leading-relaxed">
                          Select the countries where your campaign profile is
                          active or regions you are affiliated with. This will
                          customize your Seasonal Timeline and automatically
                          suggest and score relevant local celebrations.
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2 bg-transparent">
                          {AVAILABLE_COUNTRIES.map((country) => {
                            const isChecked = newBizCountries.includes(country);
                            return (
                              <button
                                key={country}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleNewBizCountry(country);
                                }}
                                className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-center transition-all select-none cursor-pointer flex items-center justify-center gap-1.5 ${
                                  isChecked
                                    ? "bg-[#45B1E8] text-white border-[#45B1E8] shadow-sm font-sans"
                                    : "bg-white text-gray-600 border-border-gray hover:bg-gray-50 hover:border-gray-300 font-sans"
                                }`}
                              >
                                {isChecked && (
                                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                                )}
                                <span>{country}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: Brand Campaign Identity Preview & Matching Calibration */}
                  {addBizStep === 6 && (
                    <div className="space-y-4 py-4 animate-fade-in text-left">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="block text-xs font-bold text-[#8854D0] uppercase tracking-wider font-display">
                            Brand Campaign Profile Calibration Preview
                          </span>
                        </div>

                        {/* Summary panel of entered metadata */}
                        <div className="bg-white border border-border-gray rounded-2xl p-4 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <div className="min-w-0">
                              <h4 className="text-sm font-extrabold text-charcoal truncate">
                                {newBizName || "Unnamed Campaign"}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                                {newBizIndustry} •{" "}
                                {newBizLocation || "No region specified"}
                              </p>
                            </div>
                            <span
                              className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 block ${
                                newProfileType === "individual"
                                  ? "bg-[#E52B50]/10 text-[#E52B50]"
                                  : "bg-[#1E824C]/10 text-[#1E824C]"
                              }`}
                            >
                              {newProfileType === "individual"
                                ? "Personal"
                                : "Business"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                            <div>
                              <span className="text-gray-400 block font-medium">
                                Contact Details
                              </span>
                              <span className="text-gray-600 truncate block mt-0.5 max-w-xs">
                                {newBizPhone || newBizEmail || newBizInstagram || newBizXUsername
                                  ? `${newBizPhone || "-"} | ${newBizEmail || "-"} | ${newBizInstagram || "-"} | ${newBizXUsername || "-"}`
                                  : "No contacts provided"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 block font-medium">
                                Target Affiliations
                              </span>
                              <span className="text-gray-600 truncate block mt-0.5 max-w-xs">
                                {newBizCountries.join(", ") ||
                                  "No countries selected"}
                              </span>
                            </div>
                          </div>

                          {newBizDescription && (
                            <div className="text-[10.5px] border-t border-gray-50 pt-2">
                              <span className="text-gray-400 block font-medium">
                                Campaign Description / Mission Tagline
                              </span>
                              <p className="text-gray-600 mt-0.5 max-w-lg leading-relaxed italic truncate">
                                “{newBizDescription}”
                              </p>
                            </div>
                          )}

                          {/* Brand Asset Colors Preview */}
                          <div className="flex items-center gap-2 text-[10.5px] pt-1">
                            <span className="text-gray-400 font-medium font-sans">
                              Brand Palette Preview:
                            </span>
                            <div className="flex items-center gap-1">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-100 shadow-xs"
                                style={{ backgroundColor: newBizBrandColor }}
                                title={`Primary Color: ${newBizBrandColor}`}
                              />
                              <div
                                className="w-4 h-4 rounded-full border border-gray-100 shadow-xs"
                                style={{ backgroundColor: newBizAccentColor }}
                                title={`Accent Color: ${newBizAccentColor}`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Real-time Dynamic Event Suggestion Section */}
                        <div className="border-t border-dashed border-gray-150 pt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-700 tracking-tight uppercase flex items-center gap-1.5 font-sans">
                              <Sparkles className="w-3.5 h-3.5 text-[#E52B50] animate-pulse" />
                              Algorithm Recommendations Based on Affiliations
                            </span>
                            <span className="text-[9.5px] font-semibold text-gray-400 font-mono">
                              Matched Live
                            </span>
                          </div>

                          {suggestedEventsForStep5.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                              {suggestedEventsForStep5.map((occ) => {
                                // Find matching country name or use list
                                const matches =
                                  occ.countries?.filter((c) =>
                                    newBizCountries.includes(c),
                                  ) || [];
                                return (
                                  <div
                                    key={occ.id}
                                    className="p-2.5 rounded-xl border border-dashed border-gray-200 bg-gray-50 hover:bg-white hover:shadow-sm transition-all flex flex-col justify-between items-start gap-1"
                                  >
                                    <div className="flex items-center justify-between w-full gap-2">
                                      <span className="text-xs font-extrabold text-gray-800 line-clamp-1">
                                        {occ.name}
                                      </span>
                                      <span className="text-[10px] text-gray-500 font-bold bg-white border border-gray-100 px-1.5 py-0.5 rounded shrink-0">
                                        {occ.date
                                          ? formatDateStr(occ.date, occ.id)
                                          : "Moveable"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap mt-1 w-full">
                                      <span className="text-[8px] font-bold text-[#E52B50] bg-rose-50 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                                        {occ.category}
                                      </span>
                                      {matches.slice(0, 2).map((m) => (
                                        <span
                                          key={m}
                                          className="text-[8.5px] font-semibold text-[#45B1E8] bg-sky-50 px-1.5 py-0.5 rounded"
                                        >
                                          Affiliated: {m}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-6 border border-dashed border-gray-100 bg-slate-50/50 rounded-xl">
                              <Globe className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                              <p className="text-[10.5px] font-bold text-gray-450 leading-normal">
                                Please select at least one country in Step 5 to
                                preview instant algorithm recommendations
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Overlaid Navigation Controls */}
                <div className="select-none">
                  {/* Floating Left Button (Back / Cancel) */}
                  <div className="fixed bottom-6 left-6 md:left-12 z-[1000]">
                    {addBizStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOnboardingError(null);
                          setAddBizStep(addBizStep - 1);
                        }}
                        className="px-5 py-2.5 bg-white border border-[#E2D1BD] hover:bg-[#FAF6ED] text-[#080808] font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer font-sans"
                      >
                        ← Back
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddBiz(false);
                          setEditingBusinessId(null);
                          setAddBizStep(1);
                        }}
                        className="px-5 py-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer font-sans"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {/* Floating Action Right Button (Next / Register) */}
                  <div className="fixed bottom-6 right-6 md:right-12 z-[1000]">
                    {addBizStep < 6 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setOnboardingError(null);
                          if (addBizStep === 1) {
                            if (!newBizName.trim()) {
                              setOnboardingError(
                                newProfileType === "business"
                                  ? "Company Registered Name is required."
                                  : "Display Name is required.",
                              );
                              return;
                            }
                            if (!newBizLocation.trim()) {
                              setOnboardingError(
                                "Location / City is required.",
                              );
                              return;
                            }
                          }
                          setAddBizStep(addBizStep + 1);
                        }}
                        className="px-6 py-2.5 bg-[#E52B50] hover:bg-[#C81C3D] text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer font-sans"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#1E824C] hover:bg-[#155C34] text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer font-sans"
                      >
                        {editingBusinessId
                          ? "Save Profile"
                          : "Register Profile"}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Unified, Premium & Minimalist Campaign Workspace */}
        {businesses.length > 0 && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-6">
            {/* Feature 1: HOME (Dashboard Bento Roster) */}
            {activeFeature === "home" && (
              <div className="space-y-6 animate-fade-in flex flex-col w-full text-left">
                {/* Single line showing closest upcoming event, rotating top 2 events every 5 seconds with slide-right animation */}
                {(() => {
                  const activeBiz =
                    businesses.find((b) => b.id === selectedBusinessId) ||
                    businesses[0];
                  const upcomingEvents = getUpcomingOccasionsList(activeBiz);

                  if (upcomingEvents.length === 0) {
                    return (
                      <button
                        onClick={() => {
                          setShowHolidaysFullPage(true);
                          setCurrentCardIndex(0);
                        }}
                        className="w-full bg-white hover:bg-slate-50 border-y border-y-gray-150 border-l-[5px] border-l-[#1E824C] border-r-[5px] border-r-[#45B1E8] rounded-xl px-4 py-2.5 flex items-center justify-between transition-all cursor-pointer text-left shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-[9px] font-bold text-[#1E824C] uppercase tracking-wider bg-[#39FF14]/20 px-2.5 py-1 rounded-md leading-none">
                            Upcoming Event:
                          </span>
                          <span className="text-xs font-bold text-gray-400 font-sans leading-none">
                            No celebrations configured.
                          </span>
                        </div>
                      </button>
                    );
                  }

                  const displayLength = upcomingEvents.length;
                  const currentEventIndex = activeUpcomingIndex % displayLength;
                  const currentEvent = upcomingEvents[currentEventIndex];

                  const onTouchStart = (e: React.TouchEvent) => {
                    touchStartXRef.current = e.touches[0].clientX;
                  };

                  const onTouchEnd = (e: React.TouchEvent) => {
                    if (touchStartXRef.current === null) return;
                    const diff =
                      touchStartXRef.current - e.changedTouches[0].clientX;
                    touchStartXRef.current = null;
                    if (Math.abs(diff) > 40) {
                      setIsRotatingPaused(true);
                      if (diff > 0) {
                        setActiveUpcomingIndex(
                          (prev) => (prev + 1) % displayLength,
                        );
                      } else {
                        setActiveUpcomingIndex(
                          (prev) => (prev - 1 + displayLength) % displayLength,
                        );
                      }
                    }
                  };

                  return (
                    <div
                      onTouchStart={onTouchStart}
                      onTouchEnd={onTouchEnd}
                      className="w-full bg-white border border-[#EEDFD2] border-l-[6px] border-l-[#39FF14] rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 transition-all hover:border-[#39FF14]/40 shadow-sm font-sans"
                    >
                      {/* Main Center content card */}
                      <div
                        onClick={() => {
                          setShowHolidaysFullPage(true);
                          const occasionIndex = occasions.findIndex(
                            (o) => o.id === currentEvent.id,
                          );
                          if (occasionIndex !== -1) {
                            setCurrentCardIndex(occasionIndex);
                          } else {
                            setCurrentCardIndex(0);
                          }
                        }}
                        className="flex-1 w-full text-left cursor-pointer min-h-[36px] overflow-hidden flex flex-col justify-center px-1 border-none bg-transparent"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentEvent.id}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{
                              duration: 0.3,
                              type: "spring",
                              stiffness: 300,
                              damping: 25,
                            }}
                            className="flex flex-row justify-between items-center w-full gap-4 flex-nowrap"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-row flex-wrap flex-1">
                              <span className="text-[9.5px] font-black text-[#1E824C] uppercase tracking-wider bg-[#39FF14]/20 px-2.5 py-1 rounded-md shrink-0 border border-[#39FF14]/30">
                                Upcoming Event:
                              </span>
                              <span className="text-[13.5px] font-bold text-charcoal tracking-wide break-words hover:text-[#1E824C] transition-colors line-clamp-1">
                                {currentEvent.name}
                              </span>
                            </div>

                            {/* Accentuated Date or Countdown Badge */}
                            {currentEvent.date ? (
                              <span className="text-[11px] font-bold text-[#1E824C] bg-[#39FF14]/20 border border-[#39FF14]/40 px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-all hover:bg-[#39FF14]/30 cursor-default">
                                {formatDateStr(
                                  currentEvent.date,
                                  currentEvent.id,
                                )}
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md whitespace-nowrap shrink-0">
                                Date TBD
                              </span>
                            )}
                          </motion.div>
                        </AnimatePresence>

                        {/* Interactive dots indicators */}
                        <div className="flex items-center gap-1.5 mt-2 justify-center sm:justify-start pl-[2px]">
                          {upcomingEvents.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsRotatingPaused(true);
                                setActiveUpcomingIndex(idx);
                              }}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentEventIndex
                                  ? "w-4 bg-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.6)]"
                                  : "w-1.5 bg-gray-200 hover:bg-[#39FF14]/50"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4-Button Bento Grid configuration of the key modules - Rich Image cards with floating pill badges */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 w-full pt-2">
                  {/* Topic 1: EventsGen */}
                  <motion.button
                    type="button"
                    onClick={() => {
                      handleHomeButtonClick("hub", () => {
                        setShowHolidaysFullPage(true);
                        setCurrentCardIndex(0);
                      });
                    }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    animate={
                      clickedButtonId === "hub"
                        ? { scale: [1, 1.15, 0.95, 1], rotate: [0, 4, -4, 0] }
                        : clickedButtonId
                          ? { opacity: 0.3, scale: 0.95 }
                          : { scale: 1, rotate: 0, opacity: 1 }
                    }
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="group relative h-[180px] sm:h-[240px] md:h-[260px] lg:h-[280px] rounded-[1.8rem] overflow-hidden flex flex-col justify-end text-left w-full cursor-pointer select-none shadow-md border-none animate-fade-in"
                  >
                    {/* Background image fetched from the internet */}
                    <img
                      src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80"
                      alt="EventsGen Background"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out z-0"
                      referrerPolicy="no-referrer"
                    />
                    {/* Dark gradient overlay for text protection */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 z-10" />

                    {/* Floating Pill Badge - perfectly aligned and centered */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-max max-w-[90%] bg-white px-3 py-2 rounded-2xl flex items-center justify-center gap-2 shadow-lg border border-black/[0.04] z-20">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center bg-[#1E824C]/10 text-[#1E824C] shrink-0">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className="font-display font-black text-slate-900 text-[11px] sm:text-[13px] uppercase tracking-wider leading-none select-none">
                        Events
                      </span>
                    </div>

                    {/* Bottom descriptive message on hover/visible */}
                    <div className="relative p-3 sm:p-4 z-20 mt-auto">
                      <p className="text-[10px] sm:text-xs font-sans leading-relaxed text-white/95 drop-shadow-sm font-medium">
                        Review holiday catalogs & campaign guidelines.
                      </p>
                    </div>
                  </motion.button>

                  {/* Topic 2: FlyerGen */}
                  <motion.button
                    type="button"
                    onClick={() => {
                      handleHomeButtonClick("flyer", () => {
                        setActiveFeature("flyer");
                      });
                    }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    animate={
                      clickedButtonId === "flyer"
                        ? { rotate: [0, 8, -8, 0], scale: [1, 1.12, 0.95, 1] }
                        : clickedButtonId
                          ? { opacity: 0.3, scale: 0.95 }
                          : { scale: 1, rotate: 0, opacity: 1 }
                    }
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="group relative h-[180px] sm:h-[240px] md:h-[260px] lg:h-[280px] rounded-[1.8rem] overflow-hidden flex flex-col justify-end text-left w-full cursor-pointer select-none shadow-md border-none animate-fade-in"
                  >
                    {/* Background image fetched from the internet */}
                    <img
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
                      alt="FlyerGen Background"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out z-0"
                      referrerPolicy="no-referrer"
                    />
                    {/* Dark gradient overlay for text protection */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 z-10" />

                    {/* Floating Pill Badge - perfectly aligned and centered */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-max max-w-[90%] bg-white px-3 py-2 rounded-2xl flex items-center justify-center gap-2 shadow-lg border border-black/[0.04] z-20">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center bg-[#0076A3]/10 text-[#0076A3] shrink-0">
                        <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className="font-display font-black text-slate-900 text-[11px] sm:text-[13px] uppercase tracking-wider leading-none select-none">
                        Flyers
                      </span>
                    </div>

                    {/* Bottom descriptive message on hover/visible */}
                    <div className="relative p-3 sm:p-4 z-20 mt-auto">
                      <p className="text-[10px] sm:text-xs font-sans leading-relaxed text-white/95 drop-shadow-sm font-medium">
                        Make and review flyers.
                      </p>
                    </div>
                  </motion.button>

                  {/* Topic 3: MilestonesGen */}
                  <motion.button
                    type="button"
                    onClick={() => {
                      handleHomeButtonClick("milestones", () => {
                        setActiveFeature("milestones");
                      });
                    }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    animate={
                      clickedButtonId === "milestones"
                        ? { y: [0, -15, 8, 0], scale: [1, 1.1, 0.95, 1] }
                        : clickedButtonId
                          ? { opacity: 0.3, scale: 0.95 }
                          : { scale: 1, y: 0, opacity: 1 }
                    }
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="group relative h-[180px] sm:h-[240px] md:h-[260px] lg:h-[280px] rounded-[1.8rem] overflow-hidden flex flex-col justify-end text-left w-full cursor-pointer select-none shadow-md border-none animate-fade-in"
                  >
                    {/* Background image fetched from the internet */}
                    <img
                      src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80"
                      alt="MilestonesGen Background"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out z-0"
                      referrerPolicy="no-referrer"
                    />
                    {/* Dark gradient overlay for text protection */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 z-10" />

                    {/* Floating Pill Badge - perfectly aligned and centered */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-max max-w-[90%] bg-white px-3 py-2 rounded-2xl flex items-center justify-center gap-2 shadow-lg border border-black/[0.04] z-20">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center bg-[#E52B50]/10 text-[#E52B50] shrink-0">
                        <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className="font-display font-black text-slate-900 text-[11px] sm:text-[13px] uppercase tracking-wider leading-none select-none">
                        Milestones
                      </span>
                    </div>

                    {/* Bottom descriptive message on hover/visible */}
                    <div className="relative p-3 sm:p-4 z-20 mt-auto">
                      <p className="text-[10px] sm:text-xs font-sans leading-relaxed text-white/95 drop-shadow-sm font-medium">
                        Capture birthdays, local milestones, and anniversaries.
                      </p>
                    </div>
                  </motion.button>

                  {/* Topic 4: ProfilesGen */}
                  <motion.button
                    type="button"
                    onClick={() => {
                      handleHomeButtonClick("profile", () => {
                        setActiveFeature("profile");
                      });
                    }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    animate={
                      clickedButtonId === "profile"
                        ? {
                            scale: [1, 1.15, 1.02, 1.12, 1],
                            rotate: [0, -3, 3, 0],
                          }
                        : clickedButtonId
                          ? { opacity: 0.3, scale: 0.95 }
                          : { scale: 1, rotate: 0, opacity: 1 }
                    }
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="group relative h-[180px] sm:h-[240px] md:h-[260px] lg:h-[280px] rounded-[1.8rem] overflow-hidden flex flex-col justify-end text-left w-full cursor-pointer select-none shadow-md border-none animate-fade-in"
                  >
                    {/* Background image fetched from the internet */}
                    <img
                      src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80"
                      alt="ProfilesGen Background"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out z-0"
                      referrerPolicy="no-referrer"
                    />
                    {/* Dark gradient overlay for text protection */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 z-10" />

                    {/* Floating Pill Badge - perfectly aligned and centered */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-max max-w-[90%] bg-white px-3 py-2 rounded-2xl flex items-center justify-center gap-2 shadow-lg border border-black/[0.04] z-20">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center bg-[#45B1E8]/10 text-[#45B1E8] shrink-0">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className="font-display font-black text-slate-900 text-[11px] sm:text-[13px] uppercase tracking-wider leading-none select-none">
                        Profiles
                      </span>
                    </div>

                    {/* Bottom descriptive message on hover/visible */}
                    <div className="relative p-3 sm:p-4 z-20 mt-auto">
                      <p className="text-[10px] sm:text-xs font-sans leading-relaxed text-white/95 drop-shadow-sm font-medium">
                        Switch and manage your connection profiles.
                      </p>
                    </div>
                  </motion.button>
                </div>

                {/* Additional Dashboard Widget: Past Campaigns */}
                <div className="w-full bg-white border border-[#EEDFD2] rounded-2xl p-4 sm:p-5 mt-6 flex flex-col items-center sm:flex-row sm:justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                   <div className="flex items-center gap-3 w-full sm:w-auto">
                     <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                       <ImageIcon className="w-5 h-5 text-gray-400" />
                     </div>
                     <div>
                       <h3 className="font-display font-extrabold text-sm text-charcoal">Past Campaign Generations</h3>
                       <p className="text-[10px] text-gray-500 font-sans mt-0.5">View previously generated flyers and greeting messages for this profile.</p>
                     </div>
                   </div>
                   <button
                     onClick={() => {
                       setViewingFlyersForBizId(selectedBusinessId);
                       fetch(`/api/business/${selectedBusinessId}/flyers`)
                         .then(r => r.json())
                         .then(data => setBizFlyers(data.flyers || []))
                         .catch(err => console.error(err));
                     }}
                     className="w-full sm:w-auto px-5 py-2.5 bg-[#FAFAFA] hover:bg-gray-100 border border-gray-200 text-charcoal rounded-xl text-xs font-bold transition-all shadow-sm"
                   >
                     View Flyer History
                   </button>
                </div>
              </div>
            )}

            {/* Feature 2: FLYER (Studio Dual-Column Creator Panel) */}
            {activeFeature === "flyer" && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveFeature("home");
                    setGeneratedFlyers([]);
                  }}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-border-gray rounded-xl text-xs font-bold text-gray-700 transition-all cursor-pointer shadow-xs"
                >
                  ← Back to Events
                </button>

                {/* Main Creative Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* LEFT COLUMN: Unified, Sleek Campaign Customizer */}
                  <div className="lg:col-span-12 space-y-6 max-w-3xl mx-auto w-full">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Button 1: Events */}
                      <motion.button
                        type="button"
                        onClick={() => setFlyerOverlay("events")}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-[180px] rounded-[1.8rem] overflow-hidden flex flex-col justify-end text-left w-full cursor-pointer shadow-md border-none"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80"
                          alt="Events"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out z-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-max max-w-[90%] bg-white px-3 py-2 rounded-2xl flex items-center justify-center gap-2 shadow-lg z-20">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#1E824C]/10 text-[#1E824C]">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-display font-black text-slate-900 text-[11px] uppercase tracking-wider leading-none">
                            Events
                          </span>
                        </div>
                        <div className="relative p-3 z-20 mt-auto">
                          <p className="text-[10px] font-sans leading-relaxed text-white/95 font-medium">
                            {activeOccasion
                              ? activeOccasion.name
                              : "Select upcoming event"}
                          </p>
                        </div>
                      </motion.button>

                      {/* Button 2: Caption */}
                      <motion.button
                        type="button"
                        onClick={() => setFlyerOverlay("caption")}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-[180px] rounded-[1.8rem] overflow-hidden flex flex-col justify-end text-left w-full cursor-pointer shadow-md border-none"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1555679427-1f6dfcce943b?auto=format&fit=crop&w=600&q=80"
                          alt="Caption"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out z-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-max max-w-[90%] bg-white px-3 py-2 rounded-2xl flex items-center justify-center gap-2 shadow-lg z-20">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#45B1E8]/10 text-[#45B1E8]">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-display font-black text-slate-900 text-[11px] uppercase tracking-wider leading-none">
                            Message
                          </span>
                        </div>
                        <div className="relative p-3 z-20 mt-auto">
                          <p className="text-[10px] font-sans leading-relaxed text-white/95 font-medium">
                            {customUserInput
                              ? "Custom message applied"
                              : "Add custom caption"}
                          </p>
                        </div>
                      </motion.button>

                      {/* Button 3: Flyer Studio */}
                      <motion.button
                        type="button"
                        onClick={() => setFlyerOverlay("studio")}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-[180px] rounded-[1.8rem] overflow-hidden flex flex-col justify-end text-left w-full cursor-pointer shadow-md border-none"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80"
                          alt="Style"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out z-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-max max-w-[90%] bg-white px-3 py-2 rounded-2xl flex items-center justify-center gap-2 shadow-lg z-20">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-500">
                            <Palette className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-display font-black text-slate-900 text-[11px] uppercase tracking-wider leading-none"> Flyer Studio </span>
                        </div>
                        <div className="relative p-3 z-20 mt-auto">
                          <p className="text-[10px] font-sans leading-relaxed text-white/95 font-medium">
                            {writingStyle} & {designLayout}
                          </p>
                        </div>
                      </motion.button>

                      {/* Button 4: Generate (Now GIF & MP4) */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative h-[180px] rounded-[1.8rem] overflow-hidden flex flex-col justify-end text-left w-full cursor-pointer shadow-md border-none"
                        onClick={() => {
                          showToast("GIF & Video generation under construction. Coming soon!", "info");
                        }}
                      >
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out z-0 pointer-events-none"
                        >
                          <source src="https://videos.pexels.com/video-files/7583288/7583288-sd_640_360_25fps.mp4" type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-max max-w-[90%] bg-white px-3 py-2 rounded-2xl flex items-center justify-center gap-2 shadow-lg z-20">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-500">
                            <Clapperboard className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-display font-black text-slate-900 text-[11px] uppercase tracking-wider leading-none">
                            GIF & MP4
                          </span>
                        </div>
                        <div className="relative p-3 z-20 mt-auto">
                          <p className="text-[10px] font-sans leading-relaxed text-white/95 font-medium">
                            Synthesize motion media
                          </p>
                        </div>
                      </motion.button>
                    </div>

                    {/* Overlays */}
                    <AnimatePresence>
                      {flyerOverlay && flyerOverlay !== "studio" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                          onClick={() => setFlyerOverlay(null)}
                        >
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setFlyerOverlay(null)}
                              className="absolute top-4 right-4 text-gray-400 hover:text-black"
                            >
                              <X className="w-5 h-5" />
                            </button>

                            {flyerOverlay === "events" && (
                              <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 mb-4">
                                  <Calendar className="w-5 h-5 text-[#1E824C]" />
                                  <h3 className="font-display font-bold text-lg text-charcoal">
                                    Upcoming Events
                                  </h3>
                                </div>
                                <div className="space-y-2">
                                  {(() => {
                                    const activeBiz =
                                      businesses.find(
                                        (b) => b.id === selectedBusinessId,
                                      ) || businesses[0];
                                    const upcomingEvents =
                                      getUpcomingOccasionsList(activeBiz);

                                    if (upcomingEvents.length === 0) {
                                      return (
                                        <div className="p-4 text-center text-xs text-gray-400 font-sans border border-dashed rounded-xl">
                                          No active events found.
                                        </div>
                                      );
                                    }

                                    return upcomingEvents.map((occ) => {
                                      const isCurrent =
                                        occ.id === selectedOccasionId;
                                      return (
                                        <button
                                          key={occ.id}
                                          type="button"
                                          onClick={() => {
                                            setSelectedOccasionId(occ.id);
                                            setGeneratedFlyers([]);
                                            setFlyerOverlay(null);
                                          }}
                                          className={`w-full text-left p-4 rounded-xl transition-all cursor-pointer flex justify-between items-center group font-sans border ${
                                            isCurrent
                                              ? "bg-[#1E824C]/5 border-[#1E824C] shadow-sm text-[#1E824C]"
                                              : "bg-transparent border-gray-200 hover:border-[#1E824C]/40 text-charcoal"
                                          }`}
                                        >
                                          <div className="flex flex-col gap-1">
                                            <span
                                              className={`text-[13px] font-bold leading-none ${isCurrent ? "text-[#1E824C]" : "text-charcoal group-hover:text-[#1E824C]"}`}
                                            >
                                              {occ.name}
                                            </span>
                                            <span className="text-[10px] font-mono font-semibold uppercase text-gray-500">
                                              {occ.date
                                                ? formatDateStr(
                                                    occ.date,
                                                    occ.id,
                                                  )
                                                : "Moveable"}
                                            </span>
                                          </div>
                                          {isCurrent && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#1E824C] shadow-[0_0_8px_rgba(30,130,76,0.6)]" />
                                          )}
                                        </button>
                                      );
                                    });
                                  })()}
                                </div>

                                <button
                                  onClick={() =>
                                    setFlyerOverlay("create-custom-event")
                                  }
                                  className="w-full mt-4 py-3 bg-[#39FF14] hover:bg-[#32CD32] text-black font-bold text-sm rounded-xl shadow-sm transition-all"
                                >
                                  Create Custom Event
                                </button>
                              </div>
                            )}

                            {flyerOverlay === "create-custom-event" && (
                              <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 mb-4">
                                  <Calendar className="w-5 h-5 text-[#39FF14]" />
                                  <h3 className="font-display font-bold text-lg text-charcoal">
                                    Quick Custom Event
                                  </h3>
                                </div>

                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-gray mb-1">
                                      Event Name
                                    </label>
                                    <input
                                      type="text"
                                      value={tempEventName}
                                      onChange={(e) =>
                                        setTempEventName(e.target.value)
                                      }
                                      placeholder="e.g. Weekend Flash Sale"
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#39FF14] focus:outline-none"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-gray mb-1">
                                        Date
                                      </label>
                                      <input
                                        type="date"
                                        value={tempEventDate}
                                        onChange={(e) =>
                                          setTempEventDate(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#39FF14] focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-gray mb-1">
                                        Type
                                      </label>
                                      <select
                                        value={tempEventType}
                                        onChange={(e) =>
                                          setTempEventType(
                                            e.target.value as any,
                                          )
                                        }
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#39FF14] focus:outline-none"
                                      >
                                        <option value="other">General</option>
                                        <option value="anniversary">
                                          Milestone
                                        </option>
                                        <option value="birthday">
                                          Birthday
                                        </option>
                                      </select>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-gray mb-1">
                                      Quick Notes
                                    </label>
                                    <input
                                      type="text"
                                      value={tempEventNotes}
                                      onChange={(e) =>
                                        setTempEventNotes(e.target.value)
                                      }
                                      placeholder="Optional details..."
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#39FF14] focus:outline-none"
                                    />
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    if (!tempEventName || !tempEventDate)
                                      return;

                                    const activeBiz = businesses.find(
                                      (b) => b.id === selectedBusinessId,
                                    );
                                    if (activeBiz) {
                                      const newEvent = {
                                        id: `custom_evt_${Date.now()}`,
                                        name: tempEventName,
                                        date: tempEventDate,
                                        type: tempEventType,
                                        notes: tempEventNotes,
                                        isAnnual: false,
                                      };

                                      const updatedBiz = {
                                        ...activeBiz,
                                        customEvents: [
                                          ...(activeBiz.customEvents || []),
                                          newEvent,
                                        ],
                                      };

                                      setBusinesses((prev) =>
                                        prev.map((b) =>
                                          b.id === activeBiz.id
                                            ? updatedBiz
                                            : b,
                                        ),
                                      );
                                      setSelectedOccasionId(newEvent.id);

                                      // Reset temp
                                      setTempEventName("");
                                      setTempEventDate("");
                                      setTempEventNotes("");

                                      setGeneratedFlyers([]);
                                      setFlyerOverlay(null);
                                    }
                                  }}
                                  className="w-full mt-4 py-3 bg-[#39FF14] hover:bg-[#32CD32] text-black font-bold text-sm rounded-xl shadow-sm transition-all"
                                >
                                  Generate Immediately
                                </button>

                                <div className="pt-2">
                                  <p className="text-center text-[10px] text-gray-500 font-sans mb-2 px-4">
                                    Want this to generate automatically when the
                                    date approaches instead?
                                  </p>
                                  <button
                                    onClick={() => {
                                      setFlyerOverlay(null);
                                      setEditingBusinessId(selectedBusinessId);
                                      setActiveFeature("home");
                                    }}
                                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-charcoal font-bold text-sm rounded-xl shadow-sm transition-all border border-slate-200"
                                  >
                                    Add to Event Pipeline (Reminders)
                                  </button>
                                </div>

                                <button
                                  onClick={() => setFlyerOverlay("events")}
                                  className="w-full mt-2 py-2 text-gray-500 font-bold text-sm hover:text-black transition-all"
                                >
                                  Back
                                </button>
                              </div>
                            )}

                            {flyerOverlay === "caption" && (
                              <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 mb-4">
                                  <MessageSquare className="w-5 h-5 text-[#45B1E8]" />
                                  <h3 className="font-display font-bold text-lg text-charcoal">
                                    Custom Caption
                                  </h3>
                                </div>
                                <div className="bg-white border-2 border-[#45B1E8]/20 rounded-2xl p-4 shadow-sm relative overflow-hidden group focus-within:border-[#45B1E8] transition-colors">
                                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#45B1E8]" />
                                  <label className="block text-[10px] text-[#45B1E8] uppercase tracking-widest font-bold font-mono mb-2 pl-2">
                                    Your Message
                                  </label>
                                  <textarea
                                    rows={4}
                                    placeholder="Write a rough draft. It will be repolished. You can also leave this blank."
                                    value={customUserInput}
                                    onChange={(e) =>
                                      setCustomUserInput(e.target.value)
                                    }
                                    className="block w-full bg-transparent text-sm text-charcoal placeholder-gray-400 focus:outline-none font-medium resize-none min-h-[40px] pl-2"
                                  />
                                </div>
                                <button
                                  onClick={() => setFlyerOverlay(null)}
                                  className="w-full py-3 bg-[#45B1E8] text-white font-bold text-sm rounded-xl shadow-sm hover:opacity-90"
                                >
                                  Save Caption
                                </button>
                              </div>
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Flyer Studio Full-screen Overlay */}
                    <AnimatePresence>
                      {flyerOverlay === "studio" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[200] bg-[#fafafa] flex flex-col items-center justify-start overflow-hidden font-sans"
                        >
                                {/* Header - Thinner, Minimalist */}
                                <div className="w-full bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 py-5 z-10 shrink-0">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                     <button onClick={() => setFlyerOverlay(null)} className="p-1 sm:p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all flex-shrink-0">
                                       <ArrowLeft className="w-5 h-5" />
                                     </button>
                                    <div className="hidden sm:flex w-7 h-7 rounded bg-[#39FF14]/10 items-center justify-center border border-[#39FF14]/20 flex-shrink-0">
                                      <Palette className="w-3.5 h-3.5 text-[#39FF14]" />
                                    </div>
                                    <h3 className="font-display font-bold text-base sm:text-lg text-charcoal tracking-tight flex-shrink-0">Flyer Studio</h3>
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <select 
                                        className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#39FF14] font-medium text-gray-700"
                                        value={sizePreset}
                                        onChange={(e) => {
                                            setSizePreset(e.target.value);
                                            if (e.target.value === "1080x1080") { setSelectedWidth(1080); setSelectedHeight(1080); }
                                            if (e.target.value === "1080x1350") { setSelectedWidth(1080); setSelectedHeight(1350); }
                                            if (e.target.value === "1080x1920") { setSelectedWidth(1080); setSelectedHeight(1920); }
                                        }}
                                     >
                                        <option value="auto-diverse">Auto (Diverse Sizes)</option>
                                        <option value="1080x1080">1080 x 1080 (Square)</option>
                                        <option value="1080x1350">1080 x 1350 (Portrait)</option>
                                        <option value="1080x1920">1080 x 1920 (Story)</option>
                                     </select>
                                  </div>
                                </div>

                                {/* Main Studio Content */}
                                <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col items-center justify-center p-4">
                                   {loading ? (
                                      <div className="flex flex-col items-center justify-center space-y-6">
                                        <div className="relative w-16 h-16 flex items-center justify-center">
                                          <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 animate-pulse"></div>
                                          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#39FF14] animate-spin"></div>
                                          <span className="text-charcoal text-xs font-mono font-black">{flyerProgressPercent}%</span>
                                        </div>
                                        <div className="space-y-1.5 text-center">
                                          <h4 className="font-bold text-sm text-charcoal">Synthesizing Diverse Flyers</h4>
                                          <p className="text-xs text-gray-500">{loadingPhase}</p>
                                        </div>
                                      </div>
                                   ) : generatedFlyers.length > 0 ? (
                                      <div className={`w-full h-full max-w-7xl flex ${showDebugOverlay ? "flex-col lg:flex-row" : "flex-col"} items-center lg:items-stretch justify-center gap-6 pt-2 relative`}><div className="flex-1 flex flex-col items-center w-full max-w-4xl h-full min-h-0">
                                         
                                         {/* Top indicators */}
                                         <div className="flex gap-2 justify-center mb-2">
                                            {[...generatedFlyers, { isPlaceholder: true }].map((_, i) => (
                                                <button key={i} onClick={() => {
                                                   const el = document.getElementById('carousel_scroll_container');
                                                   if (el) el.scrollTo({ left: el.offsetWidth * i, behavior: 'smooth' });
                                                   setCurrentFlyerIndex(i);
                                                }} className={`w-10 h-1 rounded-full transition-colors ${i === currentFlyerIndex ? 'bg-[#39FF14]' : 'bg-gray-200 hover:bg-gray-300'}`}></button>
                                            ))}
                                         </div>

                                         {/* Carousel Swipeable Container */}
                                         <div 
                                           id="carousel_scroll_container"
                                           className="w-full flex-1 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8" 
                                           style={{ scrollSnapType: 'x mandatory' }}
                                           onScroll={(e) => {
                                              const target = e.target as HTMLDivElement;
                                              const index = Math.round(target.scrollLeft / target.offsetWidth);
                                              setCurrentFlyerIndex(index);
                                           }}
                                         >
                                            {[...generatedFlyers, { isPlaceholder: true }].map((flyer, i) => (
                                                <div key={i} className="min-w-full h-full flex flex-col justify-center items-center snap-center px-4" style={{ scrollSnapAlign: 'center', scrollSnapStop: 'always' }}>
                                                   <div className="relative h-full flex flex-col justify-center items-center py-6 w-full" style={{ transform: `scale(${flyerZoom})`, transition: 'transform 0.2s ease-out', transformOrigin: 'center center' }}>
                                                     {flyer.isPlaceholder ? (
                                                        <div className="relative w-full max-w-sm aspect-[4/5] border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl flex flex-col items-center justify-center opacity-70">
                                                           <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
                                                           <p className="text-gray-400 font-mono text-xs">Empty Slot</p>
                                                        </div>
                                                     ) : flyer.isHTMLFallback ? (
                                                       <div className="relative max-w-full max-h-[100%] border border-gray-200 shadow-xl bg-white rounded-2xl overflow-hidden cursor-pointer" onClick={() => setShowSizeBadge(!showSizeBadge)} style={{ aspectRatio: `${flyer.flyerData?.width || selectedWidth} / ${flyer.flyerData?.height || selectedHeight}`, height: '100%' }}>
                                                          <ScalingIframe
                                                             src={flyer.imageUrl}
                                                             width={flyer.flyerData?.width || selectedWidth}
                                                             height={flyer.flyerData?.height || selectedHeight}
                                                             className="w-full h-full pointer-events-none"
                                                           />
                                                          {showSizeBadge && (
                                                            <div className="absolute top-10 right-6 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-mono font-medium z-50 flex items-center gap-2 border border-white/10 shadow-sm pointer-events-none">
                                                               <span className="text-gray-400">SIZE</span> {flyer.flyerData?.width || selectedWidth}×{flyer.flyerData?.height || selectedHeight}
                                                            </div>
                                                          )}
                                                          {flyer.debug?.usedModel && (
                                                            <div className="absolute top-10 left-6 bg-black/80 backdrop-blur-sm text-[#39FF14] px-3 py-1.5 rounded-lg text-xs font-mono font-medium z-50 flex items-center gap-2 border border-[#39FF14]/30 shadow-sm pointer-events-none">
                                                               <Sparkles className="w-3.5 h-3.5" /> {flyer.debug.usedModel}
                                                            </div>
                                                          )}
                                                       </div>
                                                     ) : (
                                                       <div className="relative max-w-full max-h-[100%] inline-block h-full cursor-pointer" onClick={() => setShowSizeBadge(!showSizeBadge)}>
                                                          <img
                                                            src={flyer.imageUrl}
                                                            alt="Flyer"
                                                            className="max-w-full h-full object-contain rounded-2xl shadow-xl bg-white border border-gray-200"
                                                          />
                                                          {showSizeBadge && (
                                                            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-medium z-50 flex items-center gap-1.5 border border-white/10 shadow-sm pointer-events-none">
                                                               <span className="text-gray-400">SIZE</span> {flyer.flyerData?.width || selectedWidth}×{flyer.flyerData?.height || selectedHeight}
                                                            </div>
                                                          )}
                                                          {flyer.debug?.usedModel && (
                                                            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-[#39FF14] px-2.5 py-1 rounded-md text-[10px] font-mono font-medium z-50 flex items-center gap-1.5 border border-[#39FF14]/30 shadow-sm pointer-events-none">
                                                               <Sparkles className="w-3 h-3" /> {flyer.debug.usedModel}
                                                            </div>
                                                          )}
                                                       </div>
                                                     )}
                                                     
                                                     <div className="mt-6 flex flex-row items-center gap-3" style={{ transform: `scale(${1/flyerZoom})` }}>
                                                        <button
                                                          onClick={() => {
                                                            if (selectedOccasionId) handleGenerateCampaign();
                                                          }}
                                                          className="px-6 py-2.5 bg-white hover:bg-gray-50 text-charcoal font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 border border-gray-200"
                                                          disabled={loading || !selectedOccasionId || creditsUsed >= MAX_CREDITS}
                                                        >
                                                          <Sparkles className="w-4 h-4 text-[#39FF14]" /> {creditsUsed >= MAX_CREDITS ? "Credits Exhausted" : `Generate (${MAX_CREDITS - creditsUsed})`}
                                                        </button>
                                                        <button
                                                          onClick={() => setIsFullscreenMode(true)}
                                                          className="p-2.5 bg-gray-100 hover:bg-gray-200 text-charcoal font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center border border-gray-200"
                                                          title="Full Screen"
                                                         >
                                                           <Maximize2 className="w-4 h-4" />
                                                         </button>
                                                         <button
                                                           onClick={() => setShowDebugOverlay(!showDebugOverlay)}
                                                           className={`p-2.5 rounded-xl shadow-md transition-all flex items-center justify-center border ${
                                                             showDebugOverlay 
                                                               ? "bg-[#39FF14] border-[#39FF14] text-black hover:bg-[#32CD32]" 
                                                               : "bg-gray-100 hover:bg-gray-200 text-charcoal border-gray-200"
                                                           }`}
                                                           title="Toggle Template Debugger"
                                                         >
                                                           <span className="text-xs font-extrabold uppercase px-1">Debug</span>
                                                         </button>
                                                         
                                                        <a
                                                          href={flyer.imageUrl}
                                                          download
                                                          className="p-3 bg-black hover:bg-gray-900 text-[#39FF14] rounded-full shadow-md transition-all flex items-center justify-center border border-black"
                                                          title="Download Flyer"
                                                        >
                                                          <Download className="w-5 h-5" /> 
                                                        </a>
                                                     </div>
                                                   </div>
                                                </div>
                                            ))}
                                            
                                            {/* Blank GIF Page */}
                                            <div key="gif" className="min-w-full h-full flex flex-col justify-center items-center snap-center px-4">
                                                <div className="w-full max-w-sm aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 p-8 text-center shadow-inner">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                                       <Sparkles className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-display font-bold text-xl text-charcoal mb-2">Animated GIF</span>
                                                    <span className="text-sm">We're preparing your motion graphics. This feature will be available shortly.</span>
                                                </div>
                                            </div>
                                         </div>
                                       </div>

                                       <AnimatePresence>
                                         {showDebugOverlay && (
                                           <TemplateDebugger
                                             isOpen={showDebugOverlay}
                                             onClose={() => setShowDebugOverlay(false)}
                                             flyerData={generatedFlyers[currentFlyerIndex]}
                                             currentIndex={currentFlyerIndex}
                                             totalCount={generatedFlyers.length}
                                             onNext={() => setCurrentFlyerIndex((prev) => (prev + 1) % generatedFlyers.length)}
                                             onPrev={() => setCurrentFlyerIndex((prev) => (prev - 1 + generatedFlyers.length) % generatedFlyers.length)}
                                           />
                                         )}
                                       </AnimatePresence>
                                      </div>
                                   ) : (
                                      <div className="text-center space-y-3 max-w-sm">
                                        <div className="w-14 h-14 bg-black text-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#39FF14]/20">
                                          <Sparkles className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-display font-bold text-charcoal tracking-tight">Studio Ready</h3>
                                        <p className="text-gray-500 font-sans text-xs leading-relaxed">Hit generate to create a diverse batch of 3 unique flyers + 1 animated GIF for the selected occasion.</p>
                                        <button
                                          onClick={() => {
                                            if (!selectedOccasionId) {
                                               showToast("Please select an event first", "info");
                                               return;
                                            }
                                            handleGenerateCampaign();
                                          }}
                                          className="w-full py-2.5 bg-black hover:bg-gray-900 text-[#39FF14] font-bold text-sm rounded-xl shadow-md transition-all mt-4 border border-black"
                                          disabled={creditsUsed >= MAX_CREDITS}
                                        >
                                          {creditsUsed >= MAX_CREDITS ? "Credits Exhausted" : `Generate (Credits: ${MAX_CREDITS - creditsUsed} left)`}
                                        </button>
                                        <button onClick={() => setShowDebugOverlay(!showDebugOverlay)} className="text-xs font-bold uppercase underline mt-4 text-gray-400 hover:text-black">Toggle Prompt Preview</button>
                                        <AnimatePresence>
                                         {showDebugOverlay && previewPrompt && (
                                           <TemplateDebugger
                                             isOpen={showDebugOverlay}
                                             onClose={() => setShowDebugOverlay(false)}
                                             previewPrompt={previewPrompt}
                                             previewVariations={previewVariations}
                                             usedModel={usedModel}
                                             onRefreshPrompt={fetchPreviewPrompt}
                                           />
                                         )}
                                        </AnimatePresence>
                                      </div>
                                   )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* Feature 3: Custom Milestones Screen */}
            {activeFeature === "milestones" &&
              (() => {
                const activeBiz =
                  businesses.find((b) => b.id === selectedBusinessId) ||
                  businesses[0];

                // Gather all custom milestones globally across all user profiles
                const allCustoms: {
                  id: string;
                  name: string;
                  type: string;
                  date: string;
                  isAnnual?: boolean;
                  notes?: string;
                  bizId: string;
                  bizName: string;
                  daysToGo: number;
                }[] = [];
                businesses.forEach((b) => {
                  const list = b.customEvents || [];
                  list.forEach((evt) => {
                    allCustoms.push({
                      id: evt.id,
                      name: evt.name,
                      type: evt.type,
                      date: evt.date,
                      isAnnual: evt.isAnnual,
                      notes: evt.notes,
                      bizId: b.id,
                      bizName: b.businessName,
                      daysToGo: getDaysUntilMilestone(evt.date),
                    });
                  });
                });

                // Sort custom milestones based on the one that is closer, the one that is nearer
                allCustoms.sort((a, b) => a.daysToGo - b.daysToGo);

                return (
                  <div className="space-y-6 animate-fade-in text-left bg-white border border-[#EEDFD2] rounded-3xl p-6 shadow-sm relative overflow-hidden">
                    {/* Decorative faint background element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/5 rounded-bl-[100px] -mr-20 -mt-20 pointer-events-none" />

                    {/* Back button */}
                    <div className="pb-4 relative z-10">
                      <button
                        type="button"
                        onClick={() => setActiveFeature("home")}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-[#39FF14]/10 border border-gray-200 hover:border-[#39FF14]/30 rounded-xl text-xs font-bold text-slate-700 hover:text-[#1E824C] transition-all cursor-pointer shadow-sm group"
                      >
                        <span className="group-hover:-translate-x-1 transition-transform">
                          ←
                        </span>{" "}
                        Back to Events
                      </button>
                    </div>

                    <div className="pb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative z-10">
                      <div>
                        <h3 className="font-display font-black text-2xl text-[#1E824C] flex items-center gap-2">
                          <Calendar className="w-6 h-6 text-[#39FF14]" />
                          Event Pipeline
                        </h3>
                        <p className="text-sm text-gray-500 font-sans mt-2 max-w-lg leading-relaxed">
                          Track and manage your upcoming custom celebrations or
                          connection milestones, sorted by nearest date.
                        </p>
                      </div>
                      {activeBiz && (
                        <button
                          onClick={() => {
                            setSelectedBusinessId(activeBiz.id);
                            setEditingBusinessId(activeBiz.id);
                            setNewBizName(activeBiz.businessName);
                            setNewBizIndustry(activeBiz.industry);
                            setNewBizIndustryDropdown(activeBiz.industry);
                            setNewBizLocation(activeBiz.location);
                            setNewBizLogoUrl(activeBiz.logoUrl || "");
                            setNewBizBrandColor(activeBiz.brandColor);
                            setNewBizAccentColor(activeBiz.accentColor);
                            setNewBizSubscribed(
                              activeBiz.subscribedOccasions || [],
                            );
                            setNewBizCountries(
                              activeBiz.countries || ["Nigeria"],
                            );
                            setNewBizType(activeBiz.businessType || "Both");
                            setNewBizSignOffName(activeBiz.signOffName || "");
                            setNewBizSignOffRole(activeBiz.signOffRole || "");
                            setNewBizUseSignOff(activeBiz.useSignOff || false);
                            setNewCustomEvents(activeBiz.customEvents || []);
                            setNewBizPhone(activeBiz.phone || "");
                            setNewBizEmail(activeBiz.email || "");
                            setNewBizInstagram(activeBiz.instagram || "");
                            setNewBizXUsername(activeBiz.xUsername || "");
                            setNewBizDescription(activeBiz.description || "");
                            setAddBizStep(3);
                            setShowAddBiz(true);
                          }}
                          className="px-5 py-2.5 text-xs font-bold text-[#1E824C] bg-[#39FF14] hover:bg-[#32CD32] rounded-xl shadow-[0_4px_14px_rgba(57,255,20,0.3)] transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 ml-[-4px]" />+ Add Custom
                          Milestone
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 relative z-10">
                      {allCustoms.length > 0 ? (
                        allCustoms.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05, duration: 0.3 }}
                            className="p-5 border border-gray-100 hover:border-[#39FF14]/40 bg-white rounded-2xl flex justify-between items-center hover:shadow-[0_8px_30px_rgba(57,255,20,0.08)] transition-all overflow-hidden group"
                          >
                            <div className="space-y-3 relative z-10">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-black text-charcoal font-display text-base group-hover:text-[#1E824C] transition-colors">
                                  {item.name}
                                </span>
                                <span className="text-[9px] bg-slate-100 text-slate-500 font-extrabold uppercase tracking-widest px-2 py-1 rounded-md">
                                  {item.type}
                                </span>

                                {item.daysToGo === 0 ? (
                                  <span className="text-[9.5px] bg-[#39FF14] text-[#1E824C] font-black uppercase tracking-wider px-2 py-1 rounded-md animate-pulse shadow-[0_0_10px_rgba(57,255,20,0.4)]">
                                    🎉 Today!
                                  </span>
                                ) : item.daysToGo === 1 ? (
                                  <span className="text-[9.5px] bg-[#39FF14]/20 text-[#1E824C] border border-[#39FF14]/30 font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                                    Tomorrow
                                  </span>
                                ) : (
                                  <span className="text-[9.5px] bg-gray-50 text-gray-600 font-mono font-bold px-2 py-1 rounded-md border border-gray-200">
                                    In {item.daysToGo} days
                                  </span>
                                )}
                              </div>

                              <p className="text-[12.5px] text-gray-500 font-sans flex items-center gap-3">
                                <span className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1">
                                  <Calendar className="w-3.5 h-3.5 text-[#1E824C]" />
                                  <strong className="text-charcoal">
                                    {formatDateStr(item.date, item.id)}
                                  </strong>
                                </span>

                                <span className="text-gray-300">•</span>

                                <span className="flex items-center gap-1.5 text-[#1E824C] font-semibold bg-[#1E824C]/5 rounded-lg px-2.5 py-1">
                                  <User className="w-3.5 h-3.5" />
                                  {item.bizName}
                                </span>
                              </p>

                              {item.notes && (
                                <p className="text-[11px] text-gray-500 font-medium font-sans flex items-center gap-1.5 mt-1 border-l-2 border-[#39FF14] pl-2">
                                  <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="italic">"{item.notes}"</span>
                                </p>
                              )}
                            </div>

                            <button
                              onClick={async () => {
                                const targetBiz = businesses.find(
                                  (b) => b.id === item.bizId,
                                );
                                if (!targetBiz) return;
                                const updatedCustoms = (
                                  targetBiz.customEvents || []
                                ).filter((e) => e.id !== item.id);
                                const updatedBiz = {
                                  ...targetBiz,
                                  customEvents: updatedCustoms,
                                };
                                const idx = businesses.findIndex(
                                  (b) => b.id === targetBiz.id,
                                );
                                if (idx !== -1) {
                                  const newBizs = [...businesses];
                                  newBizs[idx] = updatedBiz as any;
                                  setBusinesses(newBizs);
                                  localStorage.setItem(
                                    "coloh_businesses",
                                    JSON.stringify(newBizs),
                                  );
                                  showToast(
                                    "Custom milestone removed successfully",
                                  );
                                }
                              }}
                              className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors relative z-10 opacity-0 group-hover:opacity-100"
                              title="Delete Milestone"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </motion.div>
                        ))
                      ) : (
                        <div className="p-16 text-center border-2 border-dashed border-gray-200 bg-gray-50 rounded-[2rem] flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <Gift className="w-10 h-10 text-gray-300" />
                          </div>
                          <p className="text-sm text-gray-500 font-sans max-w-sm leading-relaxed mb-4">
                            No custom connection milestones added for this
                            profile yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            {/* Feature 4: Connection Profiles Screen */}
            {activeFeature === "profile" &&
              (() => {
                return (
                  <div className="space-y-6 animate-fade-in text-left">
                    {/* Back button */}
                    <button
                      type="button"
                      onClick={() => setActiveFeature("home")}
                      className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-border-gray rounded-xl text-xs font-bold text-gray-700 transition-all cursor-pointer shadow-xs"
                    >
                      ← Back to Events
                    </button>

                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-display font-extrabold text-lg text-charcoal">
                          Registered Identity Profiles
                        </h3>
                        <p className="text-xs text-gray-500 font-sans mt-0.5">
                          Manage your configured corporate entities and personal
                          fiduciaries details.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const currentBizCount = businesses.filter(
                            (b) =>
                              b.profileType === "business" || !b.profileType,
                          ).length;
                          const currentPersonalCount = businesses.filter(
                            (b) => b.profileType === "individual",
                          ).length;
                          if (
                            currentBizCount >= 2 &&
                            currentPersonalCount >= 1
                          ) {
                            showToast(
                              "You already have 2 Business and 1 Personal profiles. To create a new one, please delete an existing profile first.",
                              "error",
                            );
                            return;
                          }

                          setEditingBusinessId(null);
                          setNewBizName("");
                          if (currentBizCount >= 2) {
                            setNewProfileType("individual");
                            setNewBizIndustry("Personal");
                            setNewBizIndustryDropdown("Personal");
                          } else {
                            setNewProfileType("business");
                            setNewBizIndustry("Logistics & Delivery");
                            setNewBizIndustryDropdown("Logistics & Delivery");
                          }
                          setNewBizIndustryCustom("");
                          setNewBizLocation("");
                          setNewBizLogoUrl("");
                          setNewBizBrandColor("#F25C3D");
                          setNewBizAccentColor("#E8B14A");
                          setNewBizSubscribed([]);
                          setNewBizCountries(["Nigeria"]);
                          setNewCustomEvents([]);
                          setNewBizPhone("");
                          setNewBizEmail("");
                          setNewBizInstagram("");
                          setNewBizXUsername("");
                          setAddBizStep(1);
                          setShowAddBiz(true);
                        }}
                        className="px-4 py-2.5 bg-primary hover:bg-opacity-95 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer font-sans"
                      >
                        + Create New Profile
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {businesses.map((biz) => {
                        const logoInit = biz.businessName
                          ? biz.businessName.charAt(0).toUpperCase()
                          : "B";
                        const isSelected = biz.id === selectedBusinessId;
                        return (
                          <div
                            key={biz.id}
                            className={`bg-white rounded-2xl border p-4 flex flex-col justify-between space-y-3 shadow-sm transition-all relative ${
                              isSelected
                                ? "border-primary ring-1 ring-primary/25"
                                : "border-border-gray"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-bgsoft border border-border-gray rounded-xl flex items-center justify-center font-bold text-primary text-base overflow-hidden shrink-0">
                                {biz.logoUrl ? (
                                  <img
                                    src={biz.logoUrl}
                                    alt="Logo"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  logoInit
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-display font-extrabold text-[#080808] text-sm truncate">
                                  {biz.businessName}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                                  {biz.profileType || "business"}
                                  {biz.profileType !== "individual"
                                    ? ` • ${biz.businessType || "Both"}`
                                    : ""}
                                </p>
                              </div>
                            </div>

                            <div className="border-t border-gray-100 pt-2 flex justify-between items-center flex-wrap gap-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedBusinessId(biz.id);
                                    showToast(
                                      `Switched active profile to ${biz.businessName}`,
                                    );
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-secondary text-white"
                                      : "bg-[#FCFAF7] border border-border-gray hover:bg-gray-50 text-gray-755"
                                  }`}
                                >
                                  {isSelected
                                    ? "Active Profile"
                                    : "Select Profile"}
                                </button>
                                <button
                                  onClick={() => {
                                    setViewingFlyersForBizId(biz.id);
                                    fetch(`/api/business/${biz.id}/flyers`)
                                      .then(r => r.json())
                                      .then(data => setBizFlyers(data.flyers || []))
                                      .catch(err => console.error(err));
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-charcoal"
                                >
                                  Flyers History
                                </button>
                              </div>

                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedBusinessId(biz.id);
                                    setEditingBusinessId(biz.id);
                                    setNewBizName(biz.businessName);
                                    setNewBizIndustry(biz.industry);
                                    setNewBizIndustryDropdown(biz.industry);
                                    setNewBizLocation(biz.location);
                                    setNewBizLogoUrl(biz.logoUrl || "");
                                    setNewBizBrandColor(biz.brandColor);
                                    setNewBizAccentColor(biz.accentColor);
                                    setNewBizCountries(
                                      biz.countries || ["Nigeria"],
                                    );
                                    setNewBizType(biz.businessType || "Both");
                                    setNewBizSignOffName(biz.signOffName || "");
                                    setNewBizSignOffRole(biz.signOffRole || "");
                                    setNewBizUseSignOff(biz.useSignOff || false);
                                    setNewCustomEvents(biz.customEvents || []);
                                    setNewBizPhone(biz.phone || "");
                                    setNewBizEmail(biz.email || "");
                                    setNewBizInstagram(biz.instagram || "");
                                    setNewBizXUsername(biz.xUsername || "");
                                    setNewBizDescription(biz.description || "");
                                    setAddBizStep(1);
                                    setShowAddBiz(true);
                                  }}
                                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-200 text-charcoal hover:text-black rounded-lg text-[11px] font-bold transition-all shadow-xs font-sans cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (businesses.length <= 1) {
                                      showToast(
                                        "Cannot delete the last remaining connection profile!",
                                      );
                                      return;
                                    }
                                    const updatedBizs = businesses.filter(
                                      (b) => b.id !== biz.id,
                                    );
                                    setBusinesses(updatedBizs);
                                    localStorage.setItem(
                                      "coloh_businesses",
                                      JSON.stringify(updatedBizs),
                                    );
                                    if (isSelected) {
                                      setSelectedBusinessId(updatedBizs[0].id);
                                    }
                                    showToast(
                                      "Connected profile successfully deleted",
                                    );
                                  }}
                                  className="p-1.5 text-gray-450 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })()}

            {/* Feature 5: Standalone Mission & Beliefs Screen */}
            {activeFeature === "mission" &&
              (() => {
                const activeBiz =
                  businesses.find((b) => b.id === selectedBusinessId) ||
                  businesses[0];
                if (!activeBiz) return null;

                return (
                  <div className="space-y-6 animate-fade-in text-left">
                    {/* Back button */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveFeature("home")}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-border-gray rounded-xl text-xs font-bold text-gray-700 transition-all cursor-pointer shadow-xs font-sans"
                      >
                        ← Back to Events
                      </button>

                      <span className="text-[10px] font-mono font-bold bg-[#E52B50]/10 text-[#E52B50] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Live Connection Sync Active
                      </span>
                    </div>

                    {/* Header */}
                    <div className="border border-border-gray bg-white rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-display font-black text-xl text-charcoal">
                          What "{activeBiz.businessName}" Stands For
                        </h3>
                        <p className="text-xs text-gray-400 font-sans mt-0.5">
                          Define your brand mission, custom beliefs, and
                          strategic positioning vectors.
                        </p>
                      </div>
                      <div className="bg-[#1E824C]/10 text-[#1E824C] px-3.5 py-2 rounded-xl text-xs font-bold font-sans">
                        Active Relevance Score:{" "}
                        <span className="font-mono text-sm leading-none font-black text-[#1E824C]">
                          98%
                        </span>
                      </div>
                    </div>

                    {/* Dual Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Column 1: Edit & Predefined Templates (8 cols) */}
                      <div className="lg:col-span-8 space-y-4">
                        <div className="bg-white border border-border-gray rounded-2xl p-5 space-y-4 shadow-sm">
                          <div className="space-y-1">
                            <label
                              htmlFor="dashboard_biz_desc"
                              className="block text-xs font-bold text-gray-650 uppercase tracking-wider"
                            >
                              Personal Tagline / Mission Statement / Core
                              Beliefs
                            </label>
                            <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                              Fine-tune the description text. This context
                              powers our background machine intelligence to flag
                              localized opportunities.
                            </p>
                          </div>

                          <textarea
                            id="dashboard_biz_desc"
                            rows={4}
                            placeholder="e.g. An organic family farming cooperative bringing high-vitality products to local communities..."
                            value={activeBiz.description || ""}
                            className="block w-full px-4 py-3 bg-bgsoft border border-border-gray rounded-xl focus:ring-1 focus:ring-[#E52B50] focus:border-transparent text-xs text-charcoal font-sans resize-none"
                            onChange={(e) => {
                              const updatedBiz = {
                                ...activeBiz,
                                description: e.target.value,
                              };
                              const idx = businesses.findIndex(
                                (b) => b.id === activeBiz.id,
                              );
                              if (idx !== -1) {
                                const newBizs = [...businesses];
                                newBizs[idx] = updatedBiz;
                                setBusinesses(newBizs);
                                localStorage.setItem(
                                  "coloh_businesses",
                                  JSON.stringify(newBizs),
                                );
                              }
                            }}
                          />

                          {/* Templates Selector */}
                          <div className="space-y-3 pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <div>
                                <span className="block text:[10px] font-bold text-gray-550 uppercase tracking-wider">
                                  Select Predefined Tagline Template
                                  (Automatically populated & scored):
                                </span>
                                <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                                  Select up to 4 categories. The system
                                  automatically merges selected tags into your
                                  core brand expression profile.
                                </p>
                              </div>
                              <span className="text-[10px] font-bold text-[#E52B50] bg-[#E52B50]/10 px-2.5 py-0.5 rounded-full">
                                {selectedTemplates.length}/4 selected
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FCFAF7] rounded-xl p-3 border border-[#EEDFD2]">
                              {BUSINESS_TAGLINE_TEMPLATES.map((tpl) => {
                                const isActive = selectedTemplates.includes(
                                  tpl.label,
                                );
                                return (
                                  <button
                                    key={tpl.label}
                                    type="button"
                                    onClick={() => {
                                      handleTemplateToggle(tpl);

                                      // Also apply merged text to our active business profile description!
                                      setTimeout(() => {
                                        let currentSelected = [
                                          ...selectedTemplates,
                                        ];
                                        if (isActive) {
                                          currentSelected =
                                            currentSelected.filter(
                                              (name) => name !== tpl.label,
                                            );
                                        } else {
                                          if (currentSelected.length < 4) {
                                            currentSelected.push(tpl.label);
                                          }
                                        }

                                        const mergedText = currentSelected
                                          .map((label) => {
                                            const matched =
                                              BUSINESS_TAGLINE_TEMPLATES.find(
                                                (t) => t.label === label,
                                              );
                                            return matched ? matched.text : "";
                                          })
                                          .filter(Boolean)
                                          .join(" ");

                                        const updatedBiz = {
                                          ...activeBiz,
                                          description:
                                            mergedText || "Custom Brand Vision",
                                        };
                                        const idx = businesses.findIndex(
                                          (b) => b.id === activeBiz.id,
                                        );
                                        if (idx !== -1) {
                                          const newBizs = [...businesses];
                                          newBizs[idx] = updatedBiz;
                                          setBusinesses(newBizs);
                                          localStorage.setItem(
                                            "coloh_businesses",
                                            JSON.stringify(newBizs),
                                          );
                                        }
                                      }, 50);
                                    }}
                                    className={`text-[9px] p-2 rounded-xl border font-bold transition-all text-center flex flex-col items-center justify-between gap-1 leading-tight select-none cursor-pointer min-h-[55px] ${
                                      isActive
                                        ? "bg-[#E52B50] text-white border-[#E52B50]"
                                        : "bg-white hover:bg-slate-50 text-charcoal border-gray-250"
                                    }`}
                                  >
                                    <span>{tpl.label}</span>
                                    {isActive && (
                                      <Check className="w-3.5 h-3.5 shrink-0 text-white" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Educational Guide Info Card (4 cols) */}
                      <div className="lg:col-span-4 space-y-4">
                        {/* Interactive Explanation Card Styled with Salem */}
                        <div className="bg-[#1E824C]/5 border border-[#1E824C]/20 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center gap-2 text-[#1E824C]">
                            <Sparkles className="w-4 h-4 shrink-0" />
                            <h4 className="font-display font-extrabold text-xs uppercase tracking-wider">
                              How to leverage this profile
                            </h4>
                          </div>
                          <p className="text-xs text-[#1E824C] leading-relaxed font-sans">
                            Our pipeline runs matches against local regional
                            calendars. By localizing your focus, we recommend
                            high-relevance events with exact alignment triggers.
                          </p>
                          <div className="bg-white border border-[#1E824C]/15 rounded-xl p-3.5 space-y-2">
                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                              Selected categories
                            </span>
                            {selectedTemplates.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {selectedTemplates.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[9.5px] bg-slate-150 text-[#0076A3] font-bold px-2 py-0.5 rounded font-mono border border-slate-200"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-sans italic">
                                None selected yet. Try toggling template
                                buttons.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Vision Proclamation Styled with Amaranth */}
                        <div className="bg-[#E52B50]/5 border border-[#E52B50]/20 rounded-2xl p-5 text-center space-y-2.5">
                          <span className="block text-[9px] font-mono font-black text-[#E52B50] uppercase tracking-widest">
                            Active Brand Vision
                          </span>
                          <blockquote className="text-xs italic text-[#E52B50] leading-relaxed font-serif p-1">
                            "
                            {activeBiz.description
                              ? activeBiz.description.length > 110
                                ? activeBiz.description.substring(0, 110) +
                                  "..."
                                : activeBiz.description
                              : "Define your brand vision to drive outreach algorithms."}
                            "
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        )}
      </main>

      {/* Solid humanized brand footer */}
      <footer className="border-t border-border-gray bg-white py-3 px-6 text-center text-[10px] text-gray-400 space-y-1 mt-auto">
        <p className="font-sans text-xs text-[#FF4E20] font-bold leading-normal">
          "We don't create art. We automate relationship intelligence."
        </p>
        <p className="text-[9px] font-mono text-gray-400">
          Carditaur Campaign Control Panel • © 2026 Carditaur Inc. All rights
          reserved. Integration built securely.
        </p>
        <button className="mt-2 opacity-50 hover:opacity-100 hover:text-charcoal transition-all text-[10px] font-bold underline" onClick={() => setShowAdminPanel(true)}>Admin / Backend</button>
      </footer>

      <AnimatePresence>
        {viewingFlyersForBizId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-charcoal tracking-tight">Generated Flyers History</h2>
                  <p className="text-sm text-gray-500 mt-1">Review all campaigns generated for this profile.</p>
                </div>
                <button onClick={() => setViewingFlyersForBizId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                 {bizFlyers.length === 0 ? (
                   <div className="text-center py-20">
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-400">
                       <Camera className="w-8 h-8" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-700">No Flyers Yet</h3>
                     <p className="text-sm text-gray-500 mt-2">Generate a campaign for this profile to see it here.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                     {bizFlyers.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((flyer, idx) => (
                       <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
                         <div className="aspect-square w-full relative">
                            <img src={flyer.imageUrl} alt={flyer.occasionName} className="w-full h-full object-cover" />
                         </div>
                         <div className="p-4">
                            <div className="text-[10px] font-bold tracking-wider text-primary uppercase mb-1">
                              {flyer.occasionName}
                            </div>
                            <div className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                              {flyer.greetingMessage}
                            </div>
                            <div className="mt-3 text-[10px] text-gray-400 font-medium">
                              {new Date(flyer.createdAt).toLocaleDateString()}
                            </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center sm:p-4 bg-white sm:bg-black/60 sm:backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`bg-white w-full h-full relative overflow-hidden flex flex-col ${adminTab === 'flyers' ? '' : 'sm:rounded-[2rem] sm:p-6 sm:max-w-6xl sm:shadow-2xl sm:h-[90vh] p-4'}`}
            >
              {adminTab !== 'flyers' && (<button
                onClick={() => setShowAdminPanel(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>)}
              
              <div className="w-full h-full flex flex-col">
                {adminTab !== 'flyers' && (
                  <>
                    <div className="border-b pb-4 mb-4">
                      <h2 className="text-xl font-display font-bold text-charcoal">Admin Dashboard</h2>
                      <p className="text-xs text-gray-500">Manage settings, templates, and review AI-generated flyers.</p>
                    </div>
                    {adminTab !== 'menu' && (
                      <div className="mb-4 flex space-x-4">
                        <button onClick={() => setAdminTab('menu')} className="px-4 py-2 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200">← Back</button>
                        <button onClick={() => setAdminTab('settings')} className="px-4 py-2 text-xs font-bold rounded-lg bg-charcoal text-white">API Settings</button>
                      </div>
                    )}
                  </>
                )}
                
                <div className="flex-1 overflow-hidden flex flex-col">
                   
                   <div className="flex-1 overflow-y-auto">
                     {adminTab === 'menu' ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-6">
                          <button onClick={() => setAdminTab('settings')} className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center">
                              <span className="text-lg font-bold text-charcoal mb-2">API Backend</span>
                              <span className="text-xs text-gray-500 text-center">Configure external APIs and system settings</span>
                          </button>
                          <button onClick={() => setAdminTab('flyers')} className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center">
                              <span className="text-lg font-bold text-[#1E824C] mb-2">Studio Editor</span>
                              <span className="text-xs text-gray-500 text-center">Review, edit, and approve AI-generated flyers</span>
                          </button>
                      </div>
                   ) : adminTab === 'flyers' ? (
                        <AdminFlyers onClose={() => setAdminTab('menu')} />
                   ) : (
                        <div>
                          {/* Config Settings */}
                          <div className="space-y-2 mt-4 p-4 border border-border-gray rounded-2xl bg-slate-50">
                             <div className="font-bold text-sm text-charcoal">Ideogram API Key</div>
                             <div className="text-xs text-slate-500 font-sans mb-2">Used for generating flyer background imagery via Ideogram.</div>
                             <input
                               type="text"
                               value={ideogramApiKey}
                               onChange={(e) => setIdeogramApiKey(e.target.value)}
                               className="w-full text-xs p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E824C] font-mono bg-white"
                               placeholder="UseZ10RT..."
                             />
                          </div>

                          <div className="space-y-2 mt-4 p-4 border border-border-gray rounded-2xl bg-slate-50">
                             <div className="font-bold text-sm text-charcoal">DeepSeek API Key (Legacy)</div>
                             <div className="text-xs text-slate-500 font-sans mb-2">Not currently active.</div>
                             <input
                               type="text"
                               value={deepseekApiKey}
                               onChange={(e) => setDeepseekApiKey(e.target.value)}
                               className="w-full text-xs p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E824C] font-mono bg-white"
                               placeholder="sk-..."
                             />
                          </div>

                          <button
                            onClick={() => {
                              fetch('/api/admin/config', {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ ideogramApiKey, deepseekApiKey })
                              }).catch(console.error);
                              setShowAdminPanel(false);
                            }}
                            className="w-full font-bold bg-charcoal hover:opacity-90 text-white rounded-xl py-3 shadow-md transition-all active:scale-95 text-xs mt-6"
                          >
                            Save Settings & Close
                          </button>
                        </div>
                     )}
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-[#1E824C]"></div>
              <button
                onClick={() => setShowPaywall(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col items-center text-center mt-4 mb-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-[#1E824C] mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="font-display font-black text-2xl text-charcoal leading-none">Upgrade to Premium</h2>
                <p className="text-xs text-slate-500 font-sans mt-2">
                  Unlock high-resolution watermark-free flyers and priority rendering pipeline access.
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-3xl font-black text-charcoal">$9.99</span>
                  <span className="text-xs text-slate-400 font-bold">/mo</span>
                </div>
                <ul className="space-y-2 text-xs font-medium text-slate-600 text-left">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1E824C]" /> Remove "Carditaur 🦖" Watermarks</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1E824C]" /> HD Flyer Resolutions</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1E824C]" /> Priority Generation Queue</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#1E824C]" /> Dedicated Flutterwave Checkout (Coming Soon)</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsPaidUser(true);
                    setShowPaywall(false);
                    showToast("Successfully upgraded to Premium! Watermarks are removed.", "success");
                  }}
                  className="w-full font-bold bg-gradient-to-r from-[#1E824C] to-emerald-600 hover:opacity-90 text-white rounded-xl py-4 shadow-lg transition-all active:scale-95 text-sm"
                >
                  Simulate Payment (Dev)
                </button>
                <button
                  onClick={() => setShowPaywall(false)}
                  className="w-full font-bold text-slate-400 hover:text-slate-600 rounded-xl py-2 transition-all text-xs"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFullscreenMode && generatedFlyers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden"
          >
            <button
              onClick={() => setIsFullscreenMode(false)}
              className="absolute bottom-6 right-6 z-[10000] p-3 bg-black/60 hover:bg-black border border-[#39FF14] text-[#39FF14] rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            {currentFlyerIndex < generatedFlyers.length && (
                <a
                  href={generatedFlyers[currentFlyerIndex]?.imageUrl}
                  download
                  className="absolute bottom-6 left-6 z-[10000] p-3 bg-black/60 hover:bg-black border border-[#39FF14] text-[#39FF14] rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md"
                  title="Download Flyer"
                >
                  <Download className="w-5 h-5" />
                </a>
            )}
            <div 
              id="fullscreen_carousel_scroll"
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
              style={{ scrollSnapType: 'x mandatory' }}
              ref={(el) => {
                if (el && isFullscreenMode) {
                   // Slight delay to ensure layout is done
                   setTimeout(() => {
                      el.scrollLeft = el.offsetWidth * currentFlyerIndex;
                   }, 50);
                }
              }}
              onScroll={(e) => {
                 const target = e.target as HTMLDivElement;
                 const index = Math.round(target.scrollLeft / target.offsetWidth);
                 setCurrentFlyerIndex(index);
              }}
            >
              {[...generatedFlyers, { isPlaceholder: true }].map((flyer, idx) => (
                 <div key={idx} className="min-w-full h-full flex items-center justify-center snap-center p-0" style={{ scrollSnapAlign: 'center', scrollSnapStop: 'always' }}>
                    {flyer.isPlaceholder ? (
                        <div className="w-full max-w-sm aspect-[4/5] border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center opacity-70">
                           <ImageIcon className="w-10 h-10 text-gray-500 mb-2" />
                           <p className="text-gray-400 font-mono text-xs">Empty Slot</p>
                        </div>
                    ) : flyer.isHTMLFallback ? (
                      <div className="w-full h-full flex justify-center items-center">
                         <ScalingIframe
                             src={flyer.imageUrl}
                             width={flyer.flyerData?.width || selectedWidth}
                             height={flyer.flyerData?.height || selectedHeight}
                             className="w-full h-full bg-white max-w-[100vw] max-h-[100vh]"
                          />
                      </div>
                    ) : (
                      <img
                        src={flyer.imageUrl}
                        alt="Flyer fullscreen"
                        className="w-full h-full object-contain"
                      />
                    )}
                 </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAutomationNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] p-0 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setShowAutomationNotice(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white/90 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="h-44 relative w-full bg-[#1E824C]">
                <img
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80"
                  alt="Automated Deliveries"
                  className="w-full h-full object-cover mix-blend-overlay opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />

                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-[#1E824C]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2 className="font-display font-black text-2xl text-charcoal">
                    Zero Effort.
                  </h2>
                </div>
              </div>

              <div className="px-6 py-6 space-y-4">
                <p className="font-sans text-sm text-slate-gray leading-relaxed">
                  For all events in your saved{" "}
                  <span className="font-bold text-[#1E824C]">pipeline</span>,
                  flyers will be <strong>automatically generated</strong> and
                  ready for you when the date approaches! You'll never miss an
                  occasion.
                </p>
                <p className="font-sans text-sm text-slate-gray leading-relaxed border-l-2 border-[#39FF14] pl-3 py-1 bg-[#39FF14]/5 rounded-r-lg">
                  Use this <strong className="text-black">creation area</strong>{" "}
                  only for immediate, impromptu custom events—like a flash sale
                  or suddenly-remembered milestone!
                </p>

                <div className="pt-4 flex flex-col gap-3">
                  <button
                    onClick={() => setShowAutomationNotice(false)}
                    className="w-full py-4 bg-gradient-to-r from-[#1E824C] to-emerald-600 hover:opacity-90 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    Got it, let's create a flyer!
                  </button>
                  <button
                    onClick={() => {
                      setShowAutomationNotice(false);
                      setActiveFeature("home");
                    }}
                    className="w-full py-3 text-charcoal font-semibold text-sm hover:text-[#1E824C] hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    Back to my Event Pipeline
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe Visual Floating Toast Notifications */}
      {toast && (
        <div
          id="custom_toast_alert"
          className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4.5 py-3.5 rounded-2xl shadow-2xl border transition-all duration-300 animate-slide-up ${
            toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : toast.type === "info"
                ? "bg-slate-100 border-slate-200 text-charcoal"
                : "bg-emerald-50 border-emerald-250 text-emerald-900"
          }`}
        >
          <div className="shrink-0">
            {toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            ) : toast.type === "info" ? (
              <AlertCircle className="w-5 h-5 text-slate-500" />
            ) : (
              <Check className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <p className="text-xs font-bold font-sans tracking-tight">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 hover:bg-slate-200/50 text-gray-400 hover:text-gray-650 p-1 rounded-lg transition-all"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
