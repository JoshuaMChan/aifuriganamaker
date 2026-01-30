/**
 * The dark mode and i18n settings in this content script cannot stay
 * in sync with the extension’s internal settings.
 */
import picomatch from "picomatch/posix";
import { StrictMode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { addFurigana, type FuriganaResult } from "@/commons/addFurigana";
import { ExtEvent, ExtStorage } from "@/commons/constants";
import { sendMessage } from "@/commons/message";
import { cn, getGeneralSettings, getMoreSettings, setMoreSettings } from "@/commons/utils";

import "@/tailwind.css";
import { gemini } from "@/agent/gemini.ts";
import { audit } from "@/agent/prompt.ts";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  runAt: "document_idle",

  async main(ctx) {
    const autoModeIsEnabled = await getGeneralSettings(ExtStorage.AutoMode);
    const excludeSites = await getMoreSettings(ExtStorage.ExcludeSites);
    const isMatch = picomatch(excludeSites, { nocase: true });
    const isExcluded = isMatch(location.hostname);
    if (!autoModeIsEnabled || isExcluded) {
      /**
       * If the user does not enable the extension, the extension will not attempt to add furigana to the page.
       * The page must be refreshed after switching the extension to the enabled state.
       */
      return;
    }

    const customRule = await sendMessage("getSelector", { domain: location.hostname });
    const selector = customRule.selector || "[lang='ja'], [lang='ja-JP']";
    const initialElements = Array.from(document.querySelectorAll(selector));

    function getTextLength() {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let textLength = 0;
      while (walker.nextNode()) {
        const parent = walker.currentNode.parentElement;
        if (parent && !["SCRIPT", "STYLE"].includes(parent.tagName)) {
          textLength += walker.currentNode.textContent?.length ?? 0;
        }
      }

      return textLength;
    }
    const textLength = getTextLength();
    const formatter = new Intl.NumberFormat(browser.i18n.getUILanguage());
    const formattedTextLength = formatter.format(textLength);

    const MY_THINKING_BIG_PAGE_SIZE = 30000;
    const isPageTooLarge = textLength > MY_THINKING_BIG_PAGE_SIZE;
    const alwaysRunSites = await getMoreSettings(ExtStorage.AlwaysRunSites);
    const isAlwaysRunSite = alwaysRunSites.includes(location.hostname);
    if (!isPageTooLarge || isAlwaysRunSite) {
      handleAndObserveJapaneseElements(initialElements, selector, ctx);
      return;
    }

    const warningDisabled = await getMoreSettings(ExtStorage.DisableWarning);
    if (warningDisabled && isPageTooLarge && !isAlwaysRunSite) {
      browser.runtime.sendMessage(ExtEvent.MarkDisabledTab);
      return;
    }

    const hasInitialElements = initialElements.length > 0;
    if (!hasInitialElements) {
      return;
    }

    // Reflow on a huge page causes severe page freezes and even the browser becomes unresponsive. (issue#16)
    const ui = await createShadowRootUi(ctx, {
      name: "auto-mode-is-disabled-warning",
      position: "inline",
      anchor: "body",
      onMount(container) {
        const wrapper = document.createElement("div");
        container.appendChild(wrapper);
        const root = createRoot(wrapper);
        root.render(
          <StrictMode>
            <PageTooLargeWarningDialog
              onClose={() => {
                ui.remove();
                browser.runtime.sendMessage(ExtEvent.MarkDisabledTab);
              }}
              onRunOnce={() => {
                ui.remove();
                handleAndObserveJapaneseElements(initialElements, selector, ctx);
              }}
              onAlwaysRun={async () => {
                ui.remove();
                handleAndObserveJapaneseElements(initialElements, selector, ctx);
                await setMoreSettings(ExtStorage.AlwaysRunSites, [
                  ...(await getMoreSettings(ExtStorage.AlwaysRunSites)),
                  location.hostname,
                ]);
              }}
              formattedTextLength={formattedTextLength}
            />
          </StrictMode>,
        );
        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });
    ui.mount();
  },
});

interface PageTooLargeWarningDialogProps {
  onClose: () => void;
  onRunOnce: () => void;
  onAlwaysRun: () => void;
  formattedTextLength: string;
}
const PageTooLargeWarningDialog = ({
  onClose,
  onRunOnce,
  onAlwaysRun,
  formattedTextLength,
}: PageTooLargeWarningDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={cn(
        "-translate-x-1/2 top-5 left-1/2 flex max-w-xl transform flex-col rounded-2xl bg-white p-4 text-base text-slate-800 shadow dark:bg-slate-900 dark:text-white",
        window.matchMedia("(prefers-color-scheme: dark)").matches && "dark",
      )}
    >
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-1 font-bold text-lg">
          <i className="i-tabler-alert-circle-filled size-6 text-sky-500" />
          <span>{browser.i18n.getMessage("contentScriptWarningTitle")}</span>
        </h1>
        <button
          className="flex size-6 cursor-pointer items-center justify-center rounded-md transition hover:bg-slate-100 hover:text-sky-500 focus-visible:bg-slate-100 focus-visible:text-sky-500 dark:focus-visible:bg-slate-800 dark:hover:bg-slate-800"
          onClick={() => dialogRef.current?.close()}
        >
          <i className="i-tabler-x size-4" />
        </button>
      </div>
      <p className="mt-2.5">
        {browser.i18n.getMessage("contentScriptWarningDesc1", formattedTextLength)}
      </p>
      <div>
        <button
          className="cursor-pointer text-sky-500 underline decoration-current transition hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-500"
          // The browser automatically blocks navigation to URLs with the `chrome-extension://` prefix, so the `<a>` tag cannot be used.
          // Content scripts do not have permission to run `browser.runtime.openOptionsPage`, so the request needs to be forwarded to the background.
          onClick={() => browser.runtime.sendMessage(ExtEvent.OpenOptionsPage)}
        >
          {browser.i18n.getMessage("contentScriptWarningDesc2")}
        </button>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          className="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 font-bold text-blue-900 text-sm transition hover:bg-blue-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={onRunOnce}
        >
          {browser.i18n.getMessage("btnRunOnce")}
        </button>
        <button
          className="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 font-bold text-slate-900 text-sm transition hover:bg-red-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:bg-red-800 dark:text-slate-200 dark:hover:bg-red-900"
          onClick={onAlwaysRun}
        >
          {browser.i18n.getMessage("btnAlwaysRun")}
        </button>
      </div>
    </dialog>
  );
};

interface FuriganaResultsPopupProps {
  geminiResponse: string;
  onClose: () => void;
}

const FuriganaResultsPopup = ({ geminiResponse, onClose }: FuriganaResultsPopupProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={cn(
        "-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 flex max-w-2xl transform flex-col rounded-2xl bg-white p-6 text-base text-slate-800 shadow-xl dark:bg-slate-900 dark:text-white",
        window.matchMedia("(prefers-color-scheme: dark)").matches && "dark",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center gap-2 font-bold text-lg">
          <i className="i-tabler-database-filled size-6 text-emerald-500" />
          <span>📝 Gemini Audit Results</span>
        </h1>
        <button
          className="flex size-6 cursor-pointer items-center justify-center rounded-md transition hover:bg-slate-100 hover:text-emerald-500 focus-visible:bg-slate-100 focus-visible:text-emerald-500 dark:focus-visible:bg-slate-800 dark:hover:bg-slate-800"
          onClick={() => {
            dialogRef.current?.close();
            onClose();
          }}
        >
          <i className="i-tabler-x size-4" />
        </button>
      </div>

      <div className="mb-4 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-mono text-slate-700 text-sm dark:bg-slate-800 dark:text-slate-300">
          {geminiResponse}
        </pre>
      </div>

      <div className="flex justify-end">
        <button
          className="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 font-semibold text-sm text-white transition hover:bg-emerald-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          onClick={() => {
            dialogRef.current?.close();
            onClose();
          }}
        >
          Close
        </button>
      </div>
    </dialog>
  );
};

// Declare createShadowRootUi type for TypeScript
type ShadowRootUI = {
  mount: () => void;
  remove: () => void;
};

let currentResultsPopup: ShadowRootUI | null = null;

async function showFuriganaResultsPopup(results: FuriganaResult[], ctx: any): Promise<void> {
  if (currentResultsPopup) {
    currentResultsPopup.remove();
    currentResultsPopup = null;
  }

  // Format results to JSON
  const formatResults = () => {
    if (results.length === 0) {
      return "No results available.";
    }

    const jsonData = results.map((result) => ({
      originalText: result.originalText,
      tokens: result.tokens.map((token) => ({
        original: token.original,
        reading: token.reading,
      })),
    }));

    return JSON.stringify(jsonData, null, 2);
  };

  // Call Gemini API before rendering popup
  let geminiResponse: string;
  try {
    const jsonData = formatResults();

    const prompt = audit(jsonData);

    geminiResponse = await gemini(prompt);
  } catch (error) {
    geminiResponse = `Error: ${error instanceof Error ? error.message : String(error)}`;
  }

  // Now render the popup with the Gemini response
  const ui = await createShadowRootUi(ctx, {
    name: "furigana-results-popup",
    position: "inline",
    anchor: "body",
    onMount(container) {
      const wrapper = document.createElement("div");
      container.appendChild(wrapper);
      const root = createRoot(wrapper);
      root.render(
        <StrictMode>
          <FuriganaResultsPopup
            geminiResponse={geminiResponse}
            onClose={() => {
              ui.remove();
              currentResultsPopup = null;
            }}
          />
        </StrictMode>,
      );
      return { root, wrapper };
    },
    onRemove: (elements) => {
      elements?.root.unmount();
      elements?.wrapper.remove();
      currentResultsPopup = null;
    },
  });

  currentResultsPopup = ui;
  ui.mount();
}

const isElement = (node: Node): node is Element => node.nodeType === Node.ELEMENT_NODE;
function handleAndObserveJapaneseElements(initialElements: Element[], selector: string, ctx: any) {
  // Observer will not observe the element that is loaded for the first time on the page,
  // so it needs to execute `addFurigana` once immediately.
  if (initialElements.length > 0) {
    browser.runtime.sendMessage(ExtEvent.MarkActiveTab);
    addFurigana(...initialElements).then(async (results) => {
      // Show popup with results
      await showFuriganaResultsPopup(results, ctx);
    });
  }
  const observer = new MutationObserver((records) => {
    const japaneseElements = records
      .flatMap((record) => Array.from(record.addedNodes))
      .filter(isElement)
      .flatMap((element) => Array.from(element.querySelectorAll(selector)));

    if (japaneseElements.length) {
      browser.runtime.sendMessage(ExtEvent.MarkActiveTab);
      addFurigana(...japaneseElements);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
