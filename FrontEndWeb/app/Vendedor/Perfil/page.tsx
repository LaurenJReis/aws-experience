"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  User,
  LogOut,
  Shield,
  Calendar,
  Phone,
  Mail,
  Building2,
  Pencil,
  Check,
  X,
} from "lucide-react";

interface PerfilVendedor {
  nome: string;
  email: string;
  telefone: string;
  concessionaria: string;
}

export default function PerfilVendedor() {

  const [perfil, setPerfil] = useState<PerfilVendedor>({
    nome: "",
    email: "",
    telefone: "",
    concessionaria: "",
  });

  const [editando, setEditando] = useState(false);
  const [perfilEdit, setPerfilEdit] = useState<PerfilVendedor>({ ...perfil });
  const [salvo, setSalvo] = useState(false);

  const [prefs, setPrefs] = useState({
    emailNotif: true,
    smsNotif: false,
    promo: false,
  });

  // Carrega dados do localStorage
  useEffect(() => {
    const email = localStorage.getItem("user") ?? "";

    const perfilSalvo = localStorage.getItem("perfil_vendedor");
    if (perfilSalvo) {
      const dados = JSON.parse(perfilSalvo) as PerfilVendedor;
      setPerfil(dados);
      setPerfilEdit(dados);
    } else {
      const inicial: PerfilVendedor = {
        nome: "",
        email,
        telefone: "",
        concessionaria: "",
      };
      setPerfil(inicial);
      setPerfilEdit(inicial);
    }

    const savedPrefs = localStorage.getItem("prefs_vendedor");
    if (savedPrefs) setPrefs(JSON.parse(savedPrefs));
  }, []);

  function iniciarEdicao() {
    setPerfilEdit({ ...perfil });
    setEditando(true);
  }

  function cancelarEdicao() {
    setPerfilEdit({ ...perfil });
    setEditando(false);
  }

  function salvarEdicao() {
    const atualizado: PerfilVendedor = {
      ...perfilEdit,
      email: perfil.email, // e-mail não editável
    };
    setPerfil(atualizado);
    localStorage.setItem("perfil_vendedor", JSON.stringify(atualizado));
    setEditando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  function updatePref(key: string) {
    const updated = { ...prefs, [key]: !prefs[key as keyof typeof prefs] };
    setPrefs(updated);
    localStorage.setItem("prefs_vendedor", JSON.stringify(updated));
  }

  function sair() {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    window.location.href = "/Login";
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="hidden md:flex w-64 bg-white border-r flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 p-6">
            <div className="bg-red-600 text-white p-3 rounded-lg">
              <Package size={20} />
            </div>
            <div>
              <p className="font-bold text-black">Toyota</p>
              <p className="text-sm text-gray-500">Painel do Vendedor</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2 px-4">
            <Link href="/Vendedor/Dashbord" className="flex items-center gap-3 text-gray-600 p-3 rounded-xl hover:bg-gray-100">
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link href="/Vendedor/Pedidos" className="flex items-center gap-3 text-gray-600 p-3 rounded-xl hover:bg-gray-100">
              <Package size={18} /> Pedidos
            </Link>
            <Link href="/Vendedor/Clientes" className="flex items-center gap-3 text-gray-600 p-3 rounded-xl hover:bg-gray-100">
              <Users size={18} /> Clientes
            </Link>
            <Link href="/Vendedor/Perfil" className="flex items-center gap-3 bg-red-600 text-white p-3 rounded-xl">
              <User size={18} /> Perfil
            </Link>
            <Link href="/Vendedor/Administracao" className="flex items-center gap-3 text-gray-600 p-3 rounded-xl hover:bg-gray-100">
              <Shield size={18} /> Administração
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t">
          <button onClick={sair} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* TOAST */}
          {salvo && (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <Check size={16} />
              Perfil atualizado com sucesso!
            </div>
          )}

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
              <p className="text-gray-500 text-sm mt-1">Gerencie suas informações pessoais</p>
            </div>

            {!editando ? (
              <button
                onClick={iniciarEdicao}
                className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 shadow-sm transition"
              >
                <Pencil size={15} />
                Editar perfil
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={cancelarEdicao}
                  className="flex items-center gap-1 text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                >
                  <X size={15} /> Cancelar
                </button>
                <button
                  onClick={salvarEdicao}
                  className="flex items-center gap-1 text-sm bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
                >
                  <Check size={15} /> Salvar
                </button>
              </div>
            )}
          </div>

          {/* CARD PERFIL */}
          <div className="bg-white rounded-2xl shadow p-6">

            {/* AVATAR + NOME */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <User className="text-red-600" size={40} />
              </div>
              <p className="font-bold text-black mt-3 text-lg">
                {perfil.nome || <span className="text-gray-400 italic text-base">Nome não informado</span>}
              </p>
              <span className="inline-block mt-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                Vendedor
              </span>
            </div>

            {/* CAMPOS */}
            <div className="space-y-4">

              {/* Nome */}
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <User size={13} /> Nome completo
                </label>
                {editando ? (
                  <input
                    value={perfilEdit.nome}
                    onChange={(e) => setPerfilEdit({ ...perfilEdit, nome: e.target.value })}
                    placeholder="Seu nome"
                    className="w-full border border-gray-200 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                ) : (
                  <p className="text-black font-medium p-3 bg-gray-50 rounded-lg">
                    {perfil.nome || <span className="text-gray-400 italic">Não informado</span>}
                  </p>
                )}
              </div>

              {/* Email — não editável */}
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Mail size={13} /> Email <span className="text-gray-400">(não pode ser alterado)</span>
                </label>
                <p className="text-black font-medium p-3 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                  {perfil.email || "—"}
                </p>
              </div>

              {/* Telefone */}
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Phone size={13} /> Telefone
                </label>
                {editando ? (
                  <input
                    value={perfilEdit.telefone}
                    onChange={(e) => setPerfilEdit({ ...perfilEdit, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full border border-gray-200 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                ) : (
                  <p className="text-black font-medium p-3 bg-gray-50 rounded-lg">
                    {perfil.telefone || <span className="text-gray-400 italic">Não informado</span>}
                  </p>
                )}
              </div>

              {/* Concessionária */}
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Building2 size={13} /> Concessionária
                </label>
                {editando ? (
                  <input
                    value={perfilEdit.concessionaria}
                    onChange={(e) => setPerfilEdit({ ...perfilEdit, concessionaria: e.target.value })}
                    placeholder="Nome da concessionária"
                    className="w-full border border-gray-200 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                ) : (
                  <p className="text-black font-medium p-3 bg-gray-50 rounded-lg">
                    {perfil.concessionaria || <span className="text-gray-400 italic">Não informado</span>}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* PREFERÊNCIAS */}
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Preferências</h2>
            <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
              {[
                { key: "emailNotif", label: "Notificações por Email",  desc: "Receber atualizações por email" },
                { key: "smsNotif",   label: "Notificações por SMS",    desc: "Alertas diretos no celular" },
                { key: "promo",      label: "Emails Promocionais",     desc: "Ofertas e novidades" },
              ].map((item, idx, arr) => (
                <div
                  key={item.key}
                  onClick={() => updatePref(item.key)}
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition ${idx < arr.length - 1 ? "border-b" : ""}`}
                >
                  <div>
                    <p className="text-sm text-black font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 flex items-center rounded-full p-1 transition ${prefs[item.key as keyof typeof prefs] ? "bg-red-600" : "bg-gray-300"}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow transform transition ${prefs[item.key as keyof typeof prefs] ? "translate-x-5" : ""}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INFO DA CONTA */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              <Shield size={18} /> Informações da Conta
            </h2>
            <div className="space-y-3 text-black text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cargo</span>
                <span className="font-medium">Vendedor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Concessionária</span>
                <span className="font-medium">{perfil.concessionaria || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Membro desde</span>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Mar 2023</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total de vendas</span>
                <span className="font-medium text-red-600">247 veículos</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
