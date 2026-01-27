import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/assets/_locales/en/translation.json";
import ja from "@/assets/_locales/ja/translation.json";
import zhCN from "@/assets/_locales/zh-CN/translation.json";
import zhTW from "@/assets/_locales/zh-TW/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    "zh-CN": { translation: zhCN },
    "zh-TW": { translation: zhTW },
    ja: { translation: ja },
  },
  lng: "ja",
  fallbackLng: "ja",
  interpolation: {
    // react already safes from xss
    escapeValue: false,
  },
});

// Force Japanese language
i18n.changeLanguage("ja");
document.documentElement.lang = "ja";
