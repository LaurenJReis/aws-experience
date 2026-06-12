"use client";

import Sidebar from "@/app/componentes/SideBar";
import { ExternalLink } from "lucide-react";

const cards = [
  // ÔöÇÔöÇ APPS ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  {
    name: "Toyota App",
    description: "App oficial da Toyota. Acompanhe seu ve├¡culo, agende revis├Áes, acesse manuais digitais e receba notifica├º├Áes no celular.",
    link: "https://play.google.com/store/apps/details?id=com.toyota.oneapp",
    tipo: "playstore",
    icon: "­ƒô▒",
    categoria: "Aplicativo",
  },
  {
    name: "KINTO Share",
    description: "Servi├ºo oficial de compartilhamento de carros Toyota. Alugue um ve├¡culo por horas ou dias diretamente pelo app.",
    link: "https://play.google.com/store/apps/details?id=io.worldwidemobility.kinto",
    tipo: "playstore",
    icon: "­ƒöæ",
    categoria: "Aplicativo",
  },

  // ÔöÇÔöÇ SITE ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  {
    name: "Toyota do Brasil",
    description: "Site oficial da Toyota no Brasil. Explore modelos, encontre concession├írias e simule financiamentos.",
    link: "https://www.toyota.com.br",
    tipo: "site",
    icon: "­ƒîÉ",
    categoria: "Site oficial",
  },
  {
    name: "Funda├º├úo Toyota do Brasil",
    description: "Conhe├ºa as iniciativas sociais, ambientais e educacionais da Funda├º├úo Toyota no Brasil.",
    link: "https://www.fundacaotoyotadobrasil.org.br",
    tipo: "site",
    icon: "­ƒî┐",
    categoria: "Site oficial",
  },

  // ÔöÇÔöÇ REDES SOCIAIS ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
  {
    name: "Instagram Toyota Brasil",
    description: "Acompanhe novidades, lan├ºamentos e conte├║dos exclusivos da Toyota do Brasil no Instagram.",
    link: "https://www.instagram.com/toyotadobrasil",
    tipo: "instagram",
    icon: "­ƒô©",
    categoria: "Redes sociais",
  },
  {
    name: "LinkedIn Toyota do Brasil",
    description: "Conecte-se com a Toyota do Brasil no LinkedIn. Vagas, novidades corporativas e muito mais.",
    link: "https://www.linkedin.com/company/toyota-do-brasil",
    tipo: "linkedin",
    icon: "­ƒÆ╝",
    categoria: "Redes sociais",
  },
  {
    name: "LinkedIn Funda├º├úo Toyota",
    description: "P├ígina oficial da Funda├º├úo Toyota do Brasil no LinkedIn com projetos e oportunidades.",
    link: "https://www.linkedin.com/company/fundacao-toyota-do-brasil",
    tipo: "linkedin",
    icon: "­ƒñØ",
    categoria: "Redes sociais",
  },
  {
    name: "Instagram Funda├º├úo Toyota",
    description: "Siga a Funda├º├úo Toyota do Brasil e acompanhe projetos sociais, meio ambiente e responsabilidade.",
    link: "https://www.instagram.com/fundacaotoyotadobrasil",
    tipo: "instagram",
    icon: "­ƒÆÜ",
    categoria: "Redes sociais",
  },
];

const BADGE: Record<string, { label: string; color: string }> = {
  playstore: { label: "ÔûÂ Google Play",  color: "text-green-700 bg-green-50" },
  site:      { label: "­ƒîÉ Site oficial", color: "text-blue-700 bg-blue-50" },
  instagram: { label: "­ƒô© Instagram",    color: "text-pink-700 bg-pink-50" },
  linkedin:  { label: "­ƒÆ╝ LinkedIn",     color: "text-sky-700 bg-sky-50" },
};

const CATEGORIAS = ["Aplicativo", "Site oficial", "Redes sociais"];

export default function Conecte() {
  return (
    <div className="bg-gray-100 min-h-screen flex">
      <Sidebar />

      <div className="flex-1 md:ml-20 flex flex-col pb-24 md:pb-0">
        <div className="max-w-4xl mx-auto w-full px-4 pt-10 pb-10">

          <div className="mb-8">
            <h1 className="text-xl font-bold text-black">Toyota ÔÇö Conecte-se</h1>
            <p className="text-sm text-gray-500">Apps, sites e redes sociais oficiais da Toyota</p>
          </div>

          {CATEGORIAS.map((cat) => {
            const itens = cards.filter((c) => c.categoria === cat);
            return (
              <div key={cat} className="mb-8">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {cat}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {itens.map((card) => {
                    const badge = BADGE[card.tipo];
                    return (
                      <div
                        key={card.name}
                        onClick={() => window.open(card.link, "_blank")}
                        className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition cursor-pointer flex flex-col justify-between min-h-[140px]"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg text-lg flex-shrink-0">
                            {card.icon}
                          </div>
                          <p className="font-semibold text-black text-sm leading-tight">
                            {card.name}
                          </p>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed flex-1">
                          {card.description}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                          <ExternalLink className="text-gray-400" size={14} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
