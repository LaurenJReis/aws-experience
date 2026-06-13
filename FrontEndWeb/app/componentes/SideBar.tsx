"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Car,
  Store,
  Share2,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Início" },
  { href: "/Cliente/Acompanhamento", icon: Car, label: "Acompanhamento" },
  { href: "/Cliente/Loja", icon: Store, label: "Loja" },
  { href: "/Cliente/Apps", icon: Share2, label: "Conecte-se" },
  { href: "/Cliente/perfil", icon: User, label: "Perfil" },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(path: string) {
    return pathname === path;
  }

  function getItemStyle(path: string) {
    return `
      p-3 rounded-xl cursor-pointer transition
      ${isActive(path) ? "bg-red-500 text-white" : "text-gray-400 hover:bg-gray-100"}
    `;
  }

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    window.location.href = "/Login";
  }

  return (
    <>
      {/* MOBILE — barra inferior */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-md flex justify-around items-center py-3 md:hidden z-50">
        {navItems.map(({ href, icon: Icon, label }) => (
          <NextLink key={href} href={href}>
            <div className={getItemStyle(href)} title={label} aria-label={label}>
              <Icon size={22} />
            </div>
          </NextLink>
        ))}
      </div>

      {/* DESKTOP — barra lateral com tooltips */}
      <div className="hidden md:flex fixed top-0 left-0 h-screen w-20 bg-white shadow-md flex-col justify-between items-center py-6 z-40">

        {/* ITENS DE NAVEGAÇÃO */}
        <div className="flex flex-col items-center gap-6">
          {navItems.map(({ href, icon: Icon, label }) => (
            <NextLink key={href} href={href}>
              <div className="relative group">
                <div className={getItemStyle(href)} aria-label={label}>
                  <Icon size={22} />
                </div>
                {/* TOOLTIP */}
                <span className="
                  absolute left-full ml-3 top-1/2 -translate-y-1/2
                  bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap
                  opacity-0 group-hover:opacity-100 pointer-events-none
                  transition-opacity duration-200 z-50
                ">
                  {label}
                </span>
              </div>
            </NextLink>
          ))}
        </div>

        {/* LOGOUT */}
        <div className="relative group">
          <div
            onClick={logout}
            className="p-3 rounded-xl cursor-pointer transition text-gray-400 hover:bg-red-100 hover:text-red-600"
            aria-label="Sair"
          >
            <LogOut size={22} />
          </div>
          <span className="
            absolute left-full ml-3 top-1/2 -translate-y-1/2
            bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap
            opacity-0 group-hover:opacity-100 pointer-events-none
            transition-opacity duration-200 z-50
          ">
            Sair
          </span>
        </div>

      </div>
    </>
  );
}
