// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹" },
  { code: "om", name: "Afaan Oromoo", nativeName: "Afaan Oromoo", flag: "🇪🇹" },
  { code: "ti", name: "Tigrinya", nativeName: "ትግርኛ", flag: "🇪🇹" },
  { code: "so", name: "Somali", nativeName: "Soomaali", flag: "🇸🇴" },
];

export const TRANSLATIONS = {
  en: {
    // Navigation & Sidebar
    dashboard: "Dashboard",
    salons: "Salons",
    myAppointments: "My Appointments",
    bookAppointment: "Book Appointment",
    businessHours: "Business Hours",
    services: "Services",
    employees: "Staff & Specialists",
    bookings: "Bookings",
    transactions: "Transactions",
    customers: "Customers",
    systemReport: "Reports & Analytics",
    categories: "Categories",
    notifications: "Notifications",
    profile: "Profile & Settings",
    logout: "Sign Out",
    login: "Log In",
    register: "Register",

    // Common Actions & Badges
    save: "Save Changes",
    saved: "Saved Successfully",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    search: "Search...",
    filter: "Filter",
    viewDetails: "View Details",
    status: "Status",
    open: "Open",
    closed: "Closed",
    active: "Active",
    pending: "Pending",
    accepted: "Accepted",
    completed: "Completed",
    rejected: "Rejected",
    cancelled: "Cancelled",

    // Greetings & Dashboard
    goodMorning: "Good Morning",
    goodAfternoon: "Good Afternoon",
    goodEvening: "Good Evening",
    welcomeBack: "Welcome back",
    upcomingAppointment: "Upcoming Appointment",
    noUpcomingAppointments: "No upcoming appointments scheduled.",
    bookNow: "Book Now",
    quickStats: "Quick Overview",
    totalBookings: "Total Bookings",
    pendingRequests: "Pending Requests",

    // Preferences & Theme
    preferences: "Preferences & Settings",
    theme: "Theme Mode",
    lightTheme: "Light Mode",
    darkTheme: "Dark Mode",
    systemTheme: "System Auto",
    language: "App Language",
    calendarPreferences: "Calendar & Time Settings",
    bookingConfirmations: "Booking confirmations",
    bookingReminders: "Booking reminders",
    promotionalOffers: "Promotional offers",
  },
  am: {
    // Navigation & Sidebar
    dashboard: "ዳሽቦርድ",
    salons: "ሳሎኖች",
    myAppointments: "ቀጠሮዎቼ",
    bookAppointment: "ቀጠሮ ይያዙ",
    businessHours: "የስራ ሰዓታት",
    services: "አገልግሎቶች",
    employees: "ባለሙያዎች",
    bookings: "የቀጠሮ ዝርዝር",
    transactions: "የገንዘብ ዝውውር",
    customers: "ደንበኞች",
    systemReport: "ሪፖርቶች",
    categories: "ምድቦች",
    notifications: "ማሳወቂያዎች",
    profile: "መገለጫ እና ቅንብሮች",
    logout: "ውጣ",
    login: "ግባ",
    register: "ተመዝገብ",

    // Common Actions & Badges
    save: "ለውጦችን አስቀምጥ",
    saved: "በተሳካ ሁኔታ ተቀምጧል",
    cancel: "ሰርዝ",
    confirm: "አረጋግጥ",
    delete: "አጥፋ",
    edit: "አስተካክል",
    back: "ተመለስ",
    next: "ቀጣይ",
    search: "ፈልግ...",
    filter: "አጣራ",
    viewDetails: "ዝርዝር ይመልከቱ",
    status: "ሁኔታ",
    open: "ክፍት",
    closed: "ዝግ ነው",
    active: "ንቁ",
    pending: "በመጠባበቅ ላይ",
    accepted: "ተቀባይነት አግኝቷል",
    completed: "ተጠናቋል",
    rejected: "ተቀባይነት አላገኘም",
    cancelled: "ተሰርዟል",

    // Greetings & Dashboard
    goodMorning: "እንደምን አደሩ",
    goodAfternoon: "እንደምን ዋሉ",
    goodEvening: "እንደምን አመሹ",
    welcomeBack: "እንኳን ደህና መጡ",
    upcomingAppointment: "ቀጣይ ቀጠሮ",
    noUpcomingAppointments: "የተያዘ ቀጣይ ቀጠሮ የለም።",
    bookNow: "አሁኑኑ ይያዙ",
    quickStats: "አጠቃላይ እይታ",
    totalBookings: "ጠቅላላ ቀጠሮዎች",
    pendingRequests: "በመጠባበቅ ላይ ያሉ",

    // Preferences & Theme
    preferences: "ምርጫዎች እና ቅንብሮች",
    theme: "የገጽታ ቀለም (ቴም)",
    lightTheme: "ነጭ ገጽታ (Light)",
    darkTheme: "ጥቁር ገጽታ (Dark)",
    systemTheme: "የስልክ/ኮምፒውተር ምርጫ (Auto)",
    language: "የመተግበሪያ ቋንቋ",
    calendarPreferences: "የቀን መቁጠሪያ እና ሰዓት ቅንብር",
    bookingConfirmations: "የቀጠሮ ማረጋገጫዎች",
    bookingReminders: "የቀጠሮ ማስታወሻዎች",
    promotionalOffers: "ልዩ ቅናሾች",
  },
  om: {
    // Navigation & Sidebar
    dashboard: "Daashboordii",
    salons: "Saloonaawwan",
    myAppointments: "Beellamoota Kiyya",
    bookAppointment: "Beellama Qabadhu",
    businessHours: "Sa'aatii Hojii",
    services: "Tajaajiloota",
    employees: "Hojjattoota",
    bookings: "Tarree Beellamaa",
    transactions: "Daddabarsa Maallaqaa",
    customers: "Maamiltoota",
    systemReport: "Gabaasaalee",
    categories: "Gareewwan",
    notifications: "Beeksisoota",
    profile: "Piroofayilii fi Qindaa'inoota",
    logout: "Bahi",
    login: "Seeni",
    register: "Galmaa'i",

    // Common Actions & Badges
    save: "Jijjiirama Galmeessi",
    saved: "Milkaa'inaan Galmaa'eera",
    cancel: "Haqi",
    confirm: "Mirkaneessi",
    delete: "Balleessi",
    edit: "Gulaali",
    back: "Deebi'i",
    next: "Itti Fufi",
    search: "Barbaadi...",
    filter: "Calali",
    viewDetails: "Bal'ina Ilaali",
    status: "Haala",
    open: "Banaadha",
    closed: "Cufaadha",
    active: "Hojii Irra",
    pending: "Eegamaa Jira",
    accepted: "Fudhatameera",
    completed: "Xumurameera",
    rejected: "Kufaa Ta'eera",
    cancelled: "Haqameera",

    // Greetings & Dashboard
    goodMorning: "Akkam Bulte",
    goodAfternoon: "Akkam Oolte",
    goodEvening: "Akkam Galte",
    welcomeBack: "Baga Nagaan Dhufte",
    upcomingAppointment: "Beellama Itti Aanu",
    noUpcomingAppointments: "Beellamni itti aanu hin jiru.",
    bookNow: "Amma Qabadhu",
    quickStats: "Ilaalcha Waliigalaa",
    totalBookings: "Waliigala Beellamootaa",
    pendingRequests: "Gaaffilee Eegamaa Jiran",

    // Preferences & Theme
    preferences: "Filannoowwan fi Qindaa'inoota",
    theme: "Haala Halluu (Theme)",
    lightTheme: "Ifaa (Light)",
    darkTheme: "Dukkanaawaa (Dark)",
    systemTheme: "Akka Meeshaa (Auto)",
    language: "Afaan Appilikeeshinii",
    calendarPreferences: "Qindaa'ina Kalendarii fi Sa'aatii",
    bookingConfirmations: "Mirkaneessa Beellamaa",
    bookingReminders: "Yaadachiisa Beellamaa",
    promotionalOffers: "Beeksisa Addaa",
  },
  ti: {
    // Navigation & Sidebar
    dashboard: "ዳሽቦርድ",
    salons: "ሳሎናት",
    myAppointments: "ቆጸሮታተይ",
    bookAppointment: "ቆጸሮ ሓዝ",
    businessHours: "ናይ ስራሕ ሰዓታት",
    services: "ኣገልግሎታት",
    employees: "ሰራሕተኛታት",
    bookings: "ዝርዝር ቆጸሮታት",
    transactions: "ዝውውር ገንዘብ",
    customers: "ዓማዊል",
    systemReport: "ጸብጻባት",
    categories: "ምድባት",
    notifications: "መፍለጥታት",
    profile: "መገለጺን ምምዕራይን",
    logout: "ውጻእ",
    login: "እቶ",
    register: "ተመዝገብ",

    // Common Actions & Badges
    save: "ለውጥታት ኣቐምጥ",
    saved: "ብዓወት ተቐሚጡ",
    cancel: "ሰርዝ",
    confirm: "ኣረጋግጽ",
    delete: "ደምስስ",
    edit: "ኣዐሪ",
    back: "ተመለስ",
    next: "ቀጻሊ",
    search: "ድለ...",
    filter: "ኣጻሪ",
    viewDetails: "ዝርዝር ርአ",
    status: "ኩነታት",
    open: "ክፉት",
    closed: "ዕጹው",
    active: "ንጡፍ",
    pending: "ኣብ ምጽባይ",
    accepted: "ተቐባልነት ረኺቡ",
    completed: "ተወዲኡ",
    rejected: "ተነጺጉ",
    cancelled: "ተሰሪዙ",

    // Greetings & Dashboard
    goodMorning: "ከመይ ሓዲርኩም",
    goodAfternoon: "ከመይ ውዒልኩም",
    goodEvening: "ከመይ ኣምሲኹም",
    welcomeBack: "እንቋዕ ብደሓን መጻእኩም",
    upcomingAppointment: "ቀጻሊ ቆጸሮ",
    noUpcomingAppointments: "ዝተታሕዘ ቆጸሮ የለን።",
    bookNow: "ሕጂ ሓዝ",
    quickStats: "ሓፈሻዊ ትሕዝቶ",
    totalBookings: "ጠቕላላ ቆጸሮታት",
    pendingRequests: "ኣብ ምጽባይ ዘለዉ",

    // Preferences & Theme
    preferences: "ምርጫታትን ምምዕራያትን",
    theme: "ሕብሪ ገጽ (Theme)",
    lightTheme: "ብሩህ (Light)",
    darkTheme: "ጸሊም (Dark)",
    systemTheme: "ናይ መሳርሒ (Auto)",
    language: "ቋንቋ ኣፕሊኬሽን",
    calendarPreferences: "ምምዕራይ ካላንደርን ሰዓትን",
    bookingConfirmations: "ምርግጋጽ ቆጸሮታት",
    bookingReminders: "መዘኻኸሪ ቆጸሮታት",
    promotionalOffers: "ፍሉይ ቅናሽ",
  },
  so: {
    // Navigation & Sidebar
    dashboard: "Dashboodhka",
    salons: "Saloonnada",
    myAppointments: "Ballamahayga",
    bookAppointment: "Qabso Ballan",
    businessHours: "Saacadaha Shaqada",
    services: "Adeegyada",
    employees: "Shaqaalaha",
    bookings: "Liiska Ballamaha",
    transactions: "Lacag-bixinta",
    customers: "Macaamiisha",
    systemReport: "Warbixinada",
    categories: "Qaybaha",
    notifications: "Ogeysiisyada",
    profile: "Xogta & Habaynta",
    logout: "Ka Bax",
    login: "Gal",
    register: "Is-diiwaangeli",

    // Common Actions & Badges
    save: "Keydi Isbedelada",
    saved: "Si guul leh ayaa loo keydiyay",
    cancel: "Jooji",
    confirm: "Xaqiiji",
    delete: "Tirtir",
    edit: "Wax ka bedel",
    back: "Dib u noqo",
    next: "Gudub",
    search: "Raadi...",
    filter: "Kala sooc",
    viewDetails: "Faahfaahin",
    status: "Xaaladda",
    open: "Furan",
    closed: "Xidhan",
    active: "Shaqaynaya",
    pending: "La sugayo",
    accepted: "La aqbalay",
    completed: "Dhamaaday",
    rejected: "La diiday",
    cancelled: "La joojiyay",

    // Greetings & Dashboard
    goodMorning: "Subax Wanaagsan",
    goodAfternoon: "Galab Wanaagsan",
    goodEvening: "Fiid Wanaagsan",
    welcomeBack: "Kusoo dhawaaw",
    upcomingAppointment: "Ballanta Soo Socota",
    noUpcomingAppointments: "Ma jiraan ballamo soo socda.",
    bookNow: "Qabso Hada",
    quickStats: "Guudmar Degdeg ah",
    totalBookings: "Wadarta Ballamaha",
    pendingRequests: "Codsiyada Sugaya",

    // Preferences & Theme
    preferences: "Dookhyada & Habaynta",
    theme: "Muuqaalka (Theme)",
    lightTheme: "Muuqaal Cad (Light)",
    darkTheme: "Muuqaal Madow (Dark)",
    systemTheme: "Habka Qalabka (Auto)",
    language: "Luqadda App-ka",
    calendarPreferences: "Habaynta Taariikhda & Saacadda",
    bookingConfirmations: "Xaqiijinta Ballanta",
    bookingReminders: "Xusuusinta Ballanta",
    promotionalOffers: "Dalabyo Gaar ah",
  },
};

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState(() => {
    return localStorage.getItem("veloura_app_lang") || "en";
  });

  const setLanguage = (langCode) => {
    if (TRANSLATIONS[langCode]) {
      setCurrentLangState(langCode);
      localStorage.setItem("veloura_app_lang", langCode);
    }
  };

  /**
   * Translates a given key, falling back to English, then the key itself
   */
  const t = (key) => {
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    if (langDict[key]) return langDict[key];
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return key;
  };

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        currentLanguageInfo,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      currentLang: "en",
      setLanguage: () => {},
      t: (k) => k,
      supportedLanguages: SUPPORTED_LANGUAGES,
      currentLanguageInfo: SUPPORTED_LANGUAGES[0],
    };
  }
  return context;
};

export default LanguageContext;
