import { Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type LinkProps, NavLink } from "react-router";
import { cn } from "@/commons/utils";

type CustomLink = LinkProps & { label: string; icon: string; fillIcon?: string };

export function Sidebar() {
  const { t } = useTranslation();

  const navItems = [
    {
      to: "/playground",
      target: "_self",
      label: t("navPlayground"),
      icon: "i-tabler-ballpen",
      fillIcon: "i-tabler-ballpen-filled",
    },
    {
      to: "/selector",
      target: "_self",
      label: t("navSelector"),
      icon: "i-tabler-pointer",
      fillIcon: "i-tabler-pointer-filled",
    },
  ] satisfies CustomLink[];

  const [sidebarIsOpen, setSidebarIsOpen] = useState(
    window.matchMedia("(min-width: 1024px)").matches,
  );
  useEffect(() => {
    const onResize = () => {
      setSidebarIsOpen(window.matchMedia("(min-width: 1024px)").matches);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <button
        className="-mx-2 fixed top-3 left-8 z-20 flex cursor-pointer items-center justify-center rounded-sm border-solid bg-slate-950/5 p-2 text-slate-800 hover:text-neutral-200 lg:hidden dark:bg-white/5 dark:text-white"
        onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
      >
        <span className="sr-only">{t("srToggleSidebar")}</span>
        <div
          className={cn(
            "fixed inset-0 bg-transparent/40 backdrop-blur-sm backdrop-filter",
            sidebarIsOpen ? "!flex" : "hidden",
          )}
        />
        <i className="i-tabler-chevrons-right size-7" />
      </button>
      <Transition show={sidebarIsOpen}>
        <nav
          className={cn(
            "data-[enter]:data-[closed]:-translate-x-full data-[leave]:data-[closed]:-translate-x-full fixed top-0 z-30 min-h-screen w-72 flex-col gap-6 border-gray-200 border-r border-solid bg-white px-6 py-5 font-semibold text-base transition ease-in-out data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-300 lg:flex dark:border-neutral-800 dark:bg-neutral-900",
            sidebarIsOpen && "!flex",
          )}
        >
          <div className="flex items-center gap-2 text-black transition dark:text-white">
            <div className="flex items-center justify-center gap-2 px-1.5">
              <span className="font-bold text-lg decoration-neutral-400 decoration-wavy">
                音読み殺し屋
              </span>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-start gap-4">
            <div className="-mx-2 flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  to={item.to}
                  key={item.label}
                  target={item.target}
                  className={({ isActive }) =>
                    cn(
                      "group flex w-64 items-center justify-between rounded-md p-2 hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300",
                      isActive &&
                        "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-4">
                        <i
                          className={cn(
                            "size-6 group-hover:text-emerald-900 group-hover:dark:text-emerald-300",
                            isActive ? item.fillIcon : item.icon,
                            isActive
                              ? "text-emerald-900 dark:text-emerald-300"
                              : "text-slate-600 dark:text-slate-300",
                          )}
                        />
                        {item.label}
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </Transition>
    </>
  );
}
