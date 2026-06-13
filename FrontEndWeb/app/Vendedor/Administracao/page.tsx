"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Package, Users, User,
  LogOut, Shield, Search, Loader2, AlertCircle,
} from "lucide-react";
import { usuarioApi, type UsuarioResponse } from "@/app/lib/api";

export default function Administracao() {
  const [status, setStatus] = useState<"loading" | "admin" | "blocked">("loading");
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [loadingDados, setLoadingDados] = useState(false);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  const [modalAtivo, setModalAtivo] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioResponse | null>(null);
  const [processando, setProcessando] = useState(false);

  // Verifica permissão
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "ADMIN") setStatus("admin");
    else setStatus("blocked");
  }, []);

  const carregar = useCallback(async (pagina = 0) => {
    setLoadingDados(true);
    setErro("");
    try {
      const data = await usuarioApi.listar(pagina, itensPorPagina);
      setUsuarios(data.content);
      setTotalPaginas(data.totalPages);
      setPaginaAtual(pagina);
    } catch {
      setErro("Não foi possível carregar os usuários.");
    } finally {
      setLoadingDados(false);
    }
  }, []);

  useEffect(() => {
    if (status === "admin") carregar(0);
  }, [status, carregar]);

  function abrirModal(u: UsuarioResponse) {
    setUsuarioSelecionado(u);
    setModalAtivo(true);
  }

  async function confirmarToggle() {
    if (!usuarioSelecionado) return;
    setProcessando(true);
    try {
      const atualizado = usuarioSelecionado.ativo
        ? await usuarioApi.desativar(usuarioSelecionado.id)
        : await usuarioApi.ativar(usuarioSelecionado.id);

      setUsuarios((prev) => prev.map((u) => u.id === atualizado.id ? atualizado : u));
      setModalAtivo(false);
      setUsuarioSelecionado(null);
    } catch {
      setErro("Erro ao alterar status do usuário.");
    } finally {
      setProcessando(false);
    }
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusca =
      u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      u.email?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus =
      filtroStatus === "todos" ||
      (filtroStatus === "ativo" && u.ativo) ||
      (filtroStatus === "inativo" && !u.ativo);
    return matchBusca && matchStatus;
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-red-600" size={36} />
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-2xl font-bold text-red-600">Acesso negado 🚫</h1>
        <p className="mt-2 text-gray-600">Você não tem permissão para acessar esta página.</p>
        <Link href="/Vendedor/Dashbord" className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">

      {/* SIDEBAR */}
      <div className="hidden md:flex w-64 bg-white flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 p-6">
            <div className="bg-red-600 text-white p-3 rounded-lg"><Package size={20} /></div>
            <div><p className="font-bold">Toyota</p><p className="text-sm text-gray-500">Administração</p></div>
          </div>
          <nav className="flex flex-col gap-2 px-4">
            <Link href="/Vendedor/Dashbord" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100"><LayoutDashboard size={18} />Dashboard</Link>
            <Link href="/Vendedor/Pedidos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100"><Package size={18} />Pedidos</Link>
            <Link href="/Vendedor/Clientes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100"><Users size={18} />Clientes</Link>
            <Link href="/Vendedor/Perfil" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100"><User size={18} />Perfil</Link>
            <Link href="/Vendedor/Administracao" className="flex items-center gap-3 bg-red-600 text-white p-3 rounded-xl"><Shield size={18} />Administração</Link>
          </nav>
        </div>
        <div className="p-4">
          <Link href="/Login" onClick={() => localStorage.clear()} className="flex items-center gap-2 hover:text-red-600">
            <LogOut size={18} />Sair
          </Link>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 p-8 space-y-6">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <p className="text-gray-500 -mt-4">Gerencie usuários da plataforma</p>

        {/* FILTROS */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="w-full pl-10 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex gap-2">
            {["todos", "ativo", "inativo"].map((f) => (
              <button
                key={f}
                onClick={() => setFiltroStatus(f)}
                className={`px-4 py-2 rounded-full text-sm transition ${filtroStatus === f ? "bg-red-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                {f === "todos" ? "Todos" : f === "ativo" ? "Ativos" : "Inativos"}
              </button>
            ))}
          </div>
        </div>

        {/* ESTADO */}
        {loadingDados && (
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="animate-spin" size={20} /><span>Carregando usuários...</span>
          </div>
        )}
        {!loadingDados && erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700 text-sm">{erro}</span>
            <button onClick={() => carregar(0)} className="ml-auto text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg">Tentar novamente</button>
          </div>
        )}

        {/* TABELA */}
        {!loadingDados && !erro && (
          <div className="bg-white p-6 rounded-xl shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-3">Nome</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Perfil</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">Nenhum usuário encontrado.</td></tr>
                )}
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-semibold">{u.nome}</td>
                    <td className="text-gray-600">{u.email}</td>
                    <td>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{u.role}</span>
                    </td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => abrirModal(u)}
                        className={`text-sm font-medium ${u.ativo ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"} transition`}
                      >
                        {u.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINAÇÃO */}
            {totalPaginas > 1 && (
              <div className="flex justify-center gap-4 mt-4">
                <button onClick={() => carregar(paginaAtual - 1)} disabled={paginaAtual === 0}
                  className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100 text-sm">Anterior</button>
                <span className="text-sm text-gray-600">Página {paginaAtual + 1} de {totalPaginas}</span>
                <button onClick={() => carregar(paginaAtual + 1)} disabled={paginaAtual >= totalPaginas - 1}
                  className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100 text-sm">Próxima</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL CONFIRMAR */}
      {modalAtivo && usuarioSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center shadow-xl max-w-sm w-full">
            <h2 className="mb-2 font-bold text-lg">Alterar status</h2>
            <p className="text-gray-600 text-sm mb-6">
              Deseja{" "}
              <span className={usuarioSelecionado.ativo ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                {usuarioSelecionado.ativo ? "desativar" : "ativar"}
              </span>{" "}
              o usuário <strong>{usuarioSelecionado.nome}</strong>?
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setModalAtivo(false)} className="border px-5 py-2 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
              <button
                onClick={confirmarToggle}
                disabled={processando}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {processando && <Loader2 size={14} className="animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
