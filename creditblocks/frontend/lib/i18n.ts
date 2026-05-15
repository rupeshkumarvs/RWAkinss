/**
 * Internationalization setup for multi-language support
 * Using next-intl for Next.js App Router
 */

export const locales = ["en", "es", "zh", "ja", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  ja: "日本語",
  fr: "Français",
};

// Translation keys - in production, these would be in separate JSON files
export const translations: Record<Locale, Record<string, string>> = {
  en: {
    "common.wallet": "Wallet",
    "common.score": "Score",
    "common.loans": "Loans",
    "common.dashboard": "Dashboard",
    "common.settings": "Settings",
    "common.connect": "Connect Wallet",
    "common.disconnect": "Disconnect",
    "score.title": "Credit Score",
    "score.generate": "Generate Score",
    "score.history": "Score History",
    "loans.title": "Loan Management",
    "loans.create": "Create Loan",
    "loans.active": "Active Loans",
    "dashboard.welcome": "Welcome to CreditBlocks",
    "dashboard.description": "Your AI-powered credit passport",
  },
  es: {
    "common.wallet": "Cartera",
    "common.score": "Puntuación",
    "common.loans": "Préstamos",
    "common.dashboard": "Panel",
    "common.settings": "Configuración",
    "common.connect": "Conectar Cartera",
    "common.disconnect": "Desconectar",
    "score.title": "Puntuación de Crédito",
    "score.generate": "Generar Puntuación",
    "score.history": "Historial de Puntuación",
    "loans.title": "Gestión de Préstamos",
    "loans.create": "Crear Préstamo",
    "loans.active": "Préstamos Activos",
    "dashboard.welcome": "Bienvenido a CreditBlocks",
    "dashboard.description": "Tu pasaporte de crédito impulsado por IA",
  },
  zh: {
    "common.wallet": "钱包",
    "common.score": "分数",
    "common.loans": "贷款",
    "common.dashboard": "仪表板",
    "common.settings": "设置",
    "common.connect": "连接钱包",
    "common.disconnect": "断开连接",
    "score.title": "信用分数",
    "score.generate": "生成分数",
    "score.history": "分数历史",
    "loans.title": "贷款管理",
    "loans.create": "创建贷款",
    "loans.active": "活跃贷款",
    "dashboard.welcome": "欢迎使用 CreditBlocks",
    "dashboard.description": "您的 AI 驱动的信用护照",
  },
  ja: {
    "common.wallet": "ウォレット",
    "common.score": "スコア",
    "common.loans": "ローン",
    "common.dashboard": "ダッシュボード",
    "common.settings": "設定",
    "common.connect": "ウォレットを接続",
    "common.disconnect": "切断",
    "score.title": "信用スコア",
    "score.generate": "スコアを生成",
    "score.history": "スコア履歴",
    "loans.title": "ローン管理",
    "loans.create": "ローンを作成",
    "loans.active": "アクティブローン",
    "dashboard.welcome": "CreditBlocksへようこそ",
    "dashboard.description": "AI 駆動의 信用パスポート",
  },
  fr: {
    "common.wallet": "Portefeuille",
    "common.score": "Score",
    "common.loans": "Prêts",
    "common.dashboard": "Tableau de bord",
    "common.settings": "Paramètres",
    "common.connect": "Connecter le portefeuille",
    "common.disconnect": "Déconnecter",
    "score.title": "Score de crédit",
    "score.generate": "Générer le score",
    "score.history": "Historique du score",
    "loans.title": "Gestion des prêts",
    "loans.create": "Créer un prêt",
    "loans.active": "Prêts actifs",
    "dashboard.welcome": "Bienvenue sur CreditBlocks",
    "dashboard.description": "Votre passeport de crédit alimenté par l'IA",
  },
};

export function getTranslation(locale: Locale, key: string): string {
  return translations[locale]?.[key] || translations[defaultLocale][key] || key;
}

export function useTranslation(locale: Locale = defaultLocale) {
  return (key: string) => getTranslation(locale, key);
}

// Client-side locale management
export const supportedLocales: Locale[] = [...locales];

export function getLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  const stored = localStorage.getItem('locale') as Locale | null;
  return stored && locales.includes(stored) ? stored : defaultLocale;
}

export function setLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  if (locales.includes(locale)) {
    localStorage.setItem('locale', locale);
    window.dispatchEvent(new Event('localechange'));
  }
}
