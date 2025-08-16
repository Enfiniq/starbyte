"use client";

import { CONTENTS } from "@/config/mobileNavigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import useStar from "@/hooks/useStar";

const MobileNav = () => {
  const { star } = useStar();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(mobileNavRef as React.RefObject<HTMLElement>, () =>
    setIsOpen(false)
  );

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  if (!isOpen)
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-skin-muted-400 dark:text-skin-muted-500"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
    );

  return (
    <div>
      <div className="relative z-40 lg:hidden">
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </div>{" "}
      <div className="fixed overflow-y-scroll overscroll-y-none inset-0 z-40 flex">
        <div className="w-4/5" ref={mobileNavRef}>
          <div className="relative flex w-full max-w-sm flex-col overflow-y-auto bg-white dark:bg-black pb-12 shadow-xl">
            <div className="flex px-4 pb-2 pt-5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-skin-muted-400 dark:text-skin-muted-500"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-2">
              <ul>
                {CONTENTS.map((content) => (
                  <li
                    key={content.label}
                    className="space-y-10 px-4 pb-8 pt-10"
                  >
                    <div className="border-b border-gray-200 dark:border-gray-800">
                      <div className="-mb-px flex">
                        <p className="border-transparent flex-1 whitespace-nowrap border-b-2 py-4 text-base font-medium">
                          {content.label}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-10 gap-x-4">
                      {content.featured.map((item) => (
                        <div key={item.name} className="group relative text-sm">
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                            <Image
                              priority
                              fill
                              src={item.imageSrc}
                              alt={`${item.name} - ${content.label} - Content Image`}
                              className="object-cover object-center"
                              placeholder="blur"
                              blurDataURL={item.imageSrc || "/placeholder.svg"}
                            />
                          </div>
                          <Link
                            href={item.href}
                            className="mt-6 block font-medium"
                          >
                            {item.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {star?.level ? null : (
              <div className="space-y-6 border-t border-gray-200  dark:border-gray-800 px-4 py-6">
                <div className="flow-root">
                  <Link
                    onClick={() => closeOnCurrent("/authentication")}
                    href={"/authentication"}
                    className="-m-2 block p-2 font-medium"
                  >
                    Authenticate
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
