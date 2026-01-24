import { debounce, isNotNil } from "es-toolkit";
import { useTranslation } from "react-i18next";
import CursorOutlineIcon from "@/assets/icons/CursorDefault.svg?react";
import CursorTextIcon from "@/assets/icons/CursorText.svg?react";
import PowerIcon from "@/assets/icons/Power.svg?react";
import SettingIcon from "@/assets/icons/Setting.svg?react";
import { ExtEvent, ExtStorage, SelectMode } from "@/commons/constants";
import { cn, sendMessage } from "@/commons/utils";
import { Button } from "./components/Button";
import { CheckBox } from "./components/CheckBox";
import { Link } from "./components/Link";
import { Select } from "./components/Select";
import { useGeneralSettingsStore } from "./store";

export function Root() {
  const autoModeEnabled = useGeneralSettingsStore((state) => state[ExtStorage.AutoMode]);
  const selectedSelectMode = useGeneralSettingsStore((state) => state[ExtStorage.SelectMode]);
  const toggleAutoMode = useGeneralSettingsStore((state) => state.toggleAutoMode);
  const setSelectMode = useGeneralSettingsStore((state) => state.setSelectMode);
  const { t } = useTranslation();

  const selectModeOptions = [
    { label: t("optionDefault"), value: SelectMode.Default },
    { label: t("optionOriginal"), value: SelectMode.Original },
    { label: t("optionParentheses"), value: SelectMode.Parentheses },
  ];

  type ACTIONTYPE =
    | { type: typeof ExtEvent.ToggleAutoMode; payload: boolean }
    | { type: typeof ExtEvent.SwitchSelectMode; payload: SelectMode };

  const handleEventHappened = async (action: ACTIONTYPE) => {
    // Query all tabs
    const tabs = await browser.tabs.query({});
    const ids = tabs.map((tab) => tab.id).filter(isNotNil);
    await Promise.all(ids.map((id) => sendMessage(id, action.type)));
  };

  // Debounce to prevent exceeding the maximum number of modifications to chrome.storage in a short period of time.
  const handleEventHappenedWithDebounced = debounce(handleEventHappened, 100);

  return (
    <menu className="space-y-2 pr-1 font-sans">
      <MenuItem icon={<CursorOutlineIcon />}>
        <Button
          className="playwright-add-furigana-btn"
          tip={t("tipEscShortcut")}
          text={t("btnAddFurigana")}
          onClick={addFurigana}
        />
      </MenuItem>
      <MenuItem icon={<PowerIcon className={cn(autoModeEnabled && "text-sky-500")} />}>
        <CheckBox
          className="playwright-toggle-auto-mode"
          tip={t("tipRefreshPage")}
          text={t("toggleAutoMode")}
          checked={autoModeEnabled}
          onChange={(enabled) => {
            toggleAutoMode();
            handleEventHappenedWithDebounced({ type: ExtEvent.ToggleAutoMode, payload: enabled });
          }}
        />
      </MenuItem>
      <MenuItem icon={<CursorTextIcon />}>
        <Select
          className="playwright-switch-select-mode"
          tip={t("tipCopyText")}
          selected={selectedSelectMode}
          options={selectModeOptions}
          onChange={(selected) => {
            setSelectMode(selected as SelectMode);
            handleEventHappenedWithDebounced({
              type: ExtEvent.SwitchSelectMode,
              payload: selected as SelectMode,
            });
          }}
        />
      </MenuItem>
      <MenuItem icon={<SettingIcon />}>
        <Link href={browser.runtime.getURL("/options.html")} text={t("linkSettings")} />
      </MenuItem>
    </menu>
  );
}

async function addFurigana() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  await sendMessage(tab!.id!, ExtEvent.AddFurigana);
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
