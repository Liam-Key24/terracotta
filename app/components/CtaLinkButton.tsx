"use client";

import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";

type Props = {
  href?: string;
  label?: string;
  className?: string;
  labelClassName?: string;
  ariaLabel?: string;
};

const isPlainAnchorHref = (href: string) =>
  href.startsWith("mailto:") ||
  href.startsWith("tel:") ||
  href.startsWith("http://") ||
  href.startsWith("https://");

export function CtaLinkButton({
  href = "/menu",
  label = "See Menu",
  className = "group md:w-56 w-32 h-15 flex space-x-2 p-1 md:p-3 items-center justify-center glass rounded-2xl",
  labelClassName = "text-lg md:text-2xl",
  ariaLabel,
}: Props) {
  const content = (
    <>
      <span className={labelClassName}>{label}</span>
      <ArrowRightIcon className="group-hover:hidden" />
      <ArrowUpRightIcon className="hidden group-hover:block" />
    </>
  );

  const commonProps = {
    className: `${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20`,
    "aria-label": ariaLabel,
  } as const;

  if (isPlainAnchorHref(href)) {
    return (
      <a href={href} {...commonProps}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} {...commonProps}>
      {content}
    </Link>
  );
}
