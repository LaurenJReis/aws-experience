"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, LogOut, Pencil, Check, X, Loader2 } from "lucide-react";
import Sidebar from "@/app/componentes/SideBar";
import { authApi, usuarioApi, type UsuarioResponse } from "@/app/lib/api";

function Switch({ active }: { active: boolean }) {
  return (
    <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${active ? "bg-red-500" : "bg-gray-300"}`}>
      <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-all duration-300 ${active ? "translate-x-6" : ""}`} />
    </div>
  );
}

export default function Perfil() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Campos editáveis (exceto email)
  const [editando, setEditando] = useState(false);
  const [nomeEdit, setNomeEdit] = useState("");
  const [telefoneEdit, setTelefoneEdit] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");

  const [prefs, setPrefs] = useState({ emailNotif: false, smsNotif: true, promo: false });

  // Carrega dados reais da API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/Login"); return; }

    authApi.me()
      .then((u) => {
        setUsuario(u);
        setNomeEdit(u.nome ?? "");
        // telefone não vem no UsuarioResponse padrão — usa localStorage como cache
        const tel = localStorage.getItem("telefone_cliente") ?? "";
        setTelefoneEdit(tel);
      })
      .catch(() => { router.push("/Login"); })
      .finally(() => setLoading(false));

    const savedPrefs = localStorage.getItem("prefs_cliente");
    if (savedPrefs) setPrefs(JSON.parse(savedPrefs));
  }, [router]);

  function iniciarEdicao() { setEditando(true); setErroSalvar(""); }
  function cancelarEdicao() { setEditando(false); setNomeEdit(usuario?.nome ?? ""); }

  async function salvarEdicao() {
    if (!usuario) return;
    setSalvando(true);
    setErroSalvar("");
    try {
      const atualizado = await usuarioApi.atualizar(usuario.id, {
        nome: nomeEdit,
        email: usuario.email,         // email não muda
        role: usuario.role,
        dataNascimento: usuario.dataNascimento,
        ativo: usuario.ativo,
      });
      setUsuario(atualizado);
      // Telefone não é campo do UsuarioResponse — salva localmente
      localStorage.setItem("telefone_cliente", telefoneEdit);
      setEditando(false);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    } catch (err: any) {
      setErroSalvar("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  function updatePref(key: string) {
    const updated = { ...prefs, [key]: !prefs[key as keyof typeof prefs] };
    setPrefs(updated);
    localStorage.setItem("prefs_cliente", JSON.stringify(updated));
  }

  function sair() {
    localStorage.clear();
    router.push("/Login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="animate-spin text-red-600" size={36} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 px-5 md:px-12 py-8 md:ml-20">
        <div className="max-w-3xl mx-auto">

          {/* TOAST SALVO */}
          {salvo && (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
              <Check size={16} /> Perfil atualizado com sucesso!
            </div>
          )}

          {/* HEADER */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
              <p className="text-gray-600 text-sm mt-1">Seus dados pessoais e preferências</p>
            </div>

            {!editando ? (
              <button
                onClick={iniciarEdicao}
                className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 shadow-sm transition"
              >
                <Pencil size={15} /> Editar perfil
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
                  disabled={salvando}
                  className="flex items-center gap-1 text-sm bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
                >
                  {salvando ? <Loader2 size={14} className="animate-spin" /> : <Check size={15} />}
                  Salvar
                </button>
              </div>
            )}
          </div>

          {/* AVATAR */}
          <div className="flex justify-center mb-8">
            <div className="bg-red-100 p-6 rounded-full shadow-md">
              <User className="text-red-600 w-10 h-10" />
            </div>
          </div>

          {/* DADOS */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">

            {/* NOME */}
            <div className="flex items-center gap-4 p-5 border-b">
              <div className="bg-gray-100 p-3 rounded-xl shrink-0"><User className="text-gray-600 w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Nome</p>
                {editando ? (
                  <input
                    value={nomeEdit}
                    onChange={(e) => setNomeEdit(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                ) : (
                  <p className="font-semibold text-gray-900">
                    {usuario?.nome || <span className="text-gray-400 italic">Não informado</span>}
                  </p>
                )}
              </div>
            </div>

            {/* EMAIL — não editável */}
            <div className="flex items-center gap-4 p-5 border-b bg-gray-50">
              <div className="bg-gray-100 p-3 rounded-xl shrink-0"><Mail className="text-gray-600 w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">
                  Email <span className="text-gray-400">(não pode ser alterado)</span>
                </p>
                <p className="font-semibold text-gray-900 break-all">{usuario?.email}</p>
              </div>
            </div>

            {/* TELEFONE */}
            <div className="flex items-center gap-4 p-5 border-b">
              <div className="bg-gray-100 p-3 rounded-xl shrink-0"><Phone className="text-gray-600 w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Telefone</p>
                {editando ? (
                  <input
                    value={telefoneEdit}
                    onChange={(e) => setTelefoneEdit(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                ) : (
                  <p className="font-semibold text-gray-900">
                    {telefoneEdit || <span className="text-gray-400 italic">Não informado</span>}
                  </p>
                )}
              </div>
            </div>

            {/* ROLE */}
            <div className="flex items-center gap-4 p-5">
              <div className="bg-gray-100 p-3 rounded-xl shrink-0"><User className="text-gray-600 w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Perfil</p>
                <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                  {usuario?.role ?? "CLIENTE"}
                </span>
              </div>
            </div>

          </div>

          {erroSalvar && (
            <p className="text-red-500 text-sm mb-4">{erroSalvar}</p>
          )}

          {/* PREFERÊNCIAS */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Preferências</h2>
            <p className="text-sm text-gray-500">Controle como você recebe notificações</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            {[
              { key: "emailNotif", label: "Notificações por Email", desc: "Receber atualizações por email" },
              { key: "smsNotif",   label: "Notificações por SMS",   desc: "Alertas diretos no celular" },
              { key: "promo",      label: "Emails Promocionais",    desc: "Ofertas e novidades" },
            ].map((item, idx, arr) => (
              <div
                key={item.key}
                onClick={() => updatePref(item.key)}
                className={`flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition ${idx < arr.length - 1 ? "border-b" : ""}`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <Switch active={prefs[item.key as keyof typeof prefs]} />
              </div>
            ))}
          </div>

          {/* SAIR */}
          <button
            onClick={sair}
            className="w-full bg-white border border-red-500 text-red-500 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-50 transition shadow-sm"
          >
            <LogOut size={18} /> Sair da conta
          </button>

        </div>
      </div>
    </div>
  );
}
