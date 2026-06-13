"use client";

import Sidebar from "@/app/componentes/SideBar";
import { ExternalLink, Smartphone, Instagram, Linkedin } from "lucide-react";

const links = [
  {
    category: "Aplicativos",
    items: [
      {
        name: "Toyota App",
        description: "Baixe o aplicativo oficial da Toyota na Play Store.",
        url: "https://play.google.com/store/apps/details?id=com.toyota.oneapp",
        icon: <Smartphone size={20} />,
        color: "bg-red-100",
      },
      {
        name: "KINTO da Toyota",
        description: "Baixe o aplicativo KINTO da Toyota na Play Store.",
        url: "https://www.kintomobility.com.br",
        icon: <Smartphone size={20} />,
        color: "bg-red-100",
      },
    ],
  },
  {
    category: "Instagram",
    items: [
      {
        name: "Toyota do Brasil",
        description: "Perfil oficial da Toyota do Brasil no Instagram.",
        url: "https://www.instagram.com/toyotadobrasil",
        icon: <Instagram size={20} />,
        color: "bg-pink-100",
      },
      {
        name: "Fundação Toyota do Brasil",
        description: "Perfil oficial da Fundação Toyota do Brasil no Instagram.",
        url: "https://www.instagram.com/fundacaotoyota",
        icon: <Instagram size={20} />,
        color: "bg-pink-100",
      },
    ],
  },
  {
    category: "LinkedIn",
    items: [
      {
        name: "Toyota do Brasil",
        description: "Página oficial da Toyota do Brasil no LinkedIn.",
        url: "https://www.linkedin.com/company/toyota-do-brasil",
        icon: <Linkedin size={20} />,
        color: "bg-blue-100",
      },
      {
        name: "Fundação Toyota do Brasil",
        description: "Página oficial da Fundação Toyota do Brasil no LinkedIn.",
        url: "https://www.linkedin.com/company/fundacao-toyota-do-brasil",
        icon: <Linkedin size={20} />,
        color: "bg-blue-100",
      },
    ],
  },
];

export default function Conecte() {
  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTEÚDO */}
      <div className="flex-1 md:ml-20 flex flex-col">
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 pt-10 pb-10">

          <div className="mb-6">
            <h1 className="text-xl font-bold text-black">Conecte-se</h1>
            <p className="text-sm text-gray-500">
              Acesse os canais oficiais da Toyota
            </p>
          </div>

          {links.map((group) => (
            <div key={group.category} className="mb-8">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {group.category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => window.open(item.url, "_blank")}
                    className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition cursor-pointer flex flex-col justify-between min-h-[130px]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 flex items-center justify-center ${item.color} rounded-lg text-gray-700`}
                      >
                        {item.icon}
                      </div>
                      <p className="font-semibold text-black text-sm">
                        {item.name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex justify-end mt-3">
                      <ExternalLink className="text-gray-400" size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
