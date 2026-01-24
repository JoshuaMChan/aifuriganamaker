import { useTranslation } from "react-i18next";

interface FooterLinkProps {
  href: string;
  content: string;
}

function FooterLink({ href, content }: FooterLinkProps) {
  return (
    <a
      className="font-semibold text-black underline decoration-solid transition hover:text-sky-500 dark:text-white"
      href={href}
      target="_blank"
      rel="noreferrer noopener"
    >
      {content}
    </a>
  );
}

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-gray-200 border-t dark:border-slate-800">
      <div className="mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <p className="flex flex-col flex-wrap gap-1.5 py-8 text-center text-sm sm:flex-row">
          <span className="block sm:inline">
            Thank you so much to <FooterLink content="aiktb" href="https://github.com/aiktb" /> for
            creating the original Furigana&nbsp;Maker and sharing it with the community.
          </span>
          <span className="block sm:inline"> This AI agent fork is built on that work.</span>
        </p>
        <a
          className="flex size-9 items-center justify-center rounded-md text-black hover:bg-gray-100 dark:text-white dark:hover:bg-slate-800 dark:hover:text-white"
          href="https://github.com/aiktb/furiganamaker"
        >
          <span className="sr-only">{t("srGithub")}</span>
          <i className="i-fa6-brands-github size-5" />
        </a>
      </div>
    </footer>
  );
}
