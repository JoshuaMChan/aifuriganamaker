import { debounce, isNotNil } from "es-toolkit";
import { useTranslation } from "react-i18next";
import PowerIcon from "@/assets/icons/Power.svg?react";
import SettingIcon from "@/assets/icons/Setting.svg?react";
import { ExtEvent, ExtStorage } from "@/commons/constants";
import { cn, sendMessage } from "@/commons/utils";
import { Button } from "./components/Button";
import { CheckBox } from "./components/CheckBox";
import { Link } from "./components/Link";
import { useGeneralSettingsStore } from "./store";

export function Root() {
  const autoModeEnabled = useGeneralSettingsStore((state) => state[ExtStorage.AutoMode]);
  const toggleAutoMode = useGeneralSettingsStore((state) => state.toggleAutoMode);
  const { t } = useTranslation();

  type ACTIONTYPE = { type: typeof ExtEvent.ToggleAutoMode; payload: boolean };

  const handleEventHappened = async (action: ACTIONTYPE) => {
    // Query all tabs
    const tabs = await browser.tabs.query({});
    const ids = tabs.map((tab) => tab.id).filter(isNotNil);
    await Promise.all(ids.map((id) => sendMessage(id, action.type)));
  };

  const handleCallGemini = async () => {
    // Get the active tab
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id) {
      try {
        await sendMessage(activeTab.id, ExtEvent.CallGemini);
      } catch (error) {
        console.error("Error calling Gemini:", error);
      }
    }
  };

  // Debounce to prevent exceeding the maximum number of modifications to chrome.storage in a short period of time.
  const handleEventHappenedWithDebounced = debounce(handleEventHappened, 100);

  return (
    <menu className="space-y-2 pr-1 font-sans">
      <MenuItem icon={<PowerIcon className={cn(autoModeEnabled && "text-emerald-400")} />}>
        <CheckBox
          className="playwright-toggle-auto-mode"
          text={t("toggleAutoMode")}
          checked={autoModeEnabled}
          onChange={(enabled) => {
            toggleAutoMode();
            handleEventHappenedWithDebounced({ type: ExtEvent.ToggleAutoMode, payload: enabled });
          }}
        />
      </MenuItem>
      <MenuItem icon={<i className="i-tabler-sparkles text-2xl" />}>
        <Button text="AI チェック" onClick={handleCallGemini} />
      </MenuItem>
      <MenuItem icon={<SettingIcon />}>
        <Link href={browser.runtime.getURL("/options.html")} text={t("linkSettings")} />
      </MenuItem>
    </menu>
  );
}
interface MenuItemProps {
  children: React.ReactNode;
  icon: React.ReactNode;
}

function MenuItem({ children, icon }: MenuItemProps) {
  return (
    <li className="flex items-center gap-x-1">
      <div className="flex items-center justify-center text-2xl">{icon}</div>
      {children}
    </li>
  );
}
