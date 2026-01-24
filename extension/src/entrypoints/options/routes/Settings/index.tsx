import { useTranslation } from "react-i18next";
import { ExtStorage } from "@/commons/constants";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { useMoreSettingsStore } from "./store";

export function Settings() {
  const language = useMoreSettingsStore((state) => state[ExtStorage.Language]);
  const setLanguage = useMoreSettingsStore((state) => state.setLanguage);
  const { i18n, t } = useTranslation();

  function handleLanguageChange(newLanguage: string) {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    document.documentElement.lang = newLanguage;
  }

  return (
    <menu className="flex flex-col items-center justify-between space-y-10 text-pretty lg:max-w-5xl lg:px-8">
      <li className="flex w-full items-center justify-between gap-4">
        <div>
          <div className="font-bold text-lg text-slate-800 dark:text-slate-200">
            {t("settingsLanguage")}
          </div>
          <div>{t("settingsLanguageDesc")}</div>
        </div>
        <LanguageSwitcher language={language ?? i18n.language} onChange={handleLanguageChange} />
      </li>
    </menu>
  );
}
