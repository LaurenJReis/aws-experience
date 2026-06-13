"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Package, Users, User, LogOut,
  Search, Eye, Shield, Loader2, AlertCircle,
} from "lucide-react";
import { pedidoApi, type PedidoResponse } from "@/app/lib/api";

function getStatusColor(status: string) {
  if (status === "Finalizado")        return "bg-green-100 text-green-700";
  if (status === "Em produção")       return "bg-yellow-100 text-yellow-700";
  if (status === "Em transporte")     return "bg-purple-100 text-purple-700";
  if (status === "Pedido confirmado") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<PedidoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoResponse | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  const carregar = useCallback(async (pagina = 0) => {
    setLoading(true);
    setErro("");
    try {
      const data = await pedidoApi.listar(pagina, itensPorPagina);
      setPedidos(data.content);
      setTotalPaginas(data.totalPages);
      setPaginaAtual(pagina);
    } catch {
      setErro("Não foi possível carregar os pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(0); }, [carregar]);

  const pedidosFiltrados = pedidos.filter((p) =>
    p.cliente?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    String(p.id).includes(busca) ||
    p.itens?.[0]?.produto?.modelo?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="hidden md:flex w-64 bg-white border-r flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 p-6">
            <div className="bg-red-600 text-white p-3 rounded-lg"><Package size={20} /></div>
            <div>
              <p className="font-bold text-black">Toyota</p>
              <p className="text-sm text-gray-500">Painel do Vendedor</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2 px-4">
            <Link href="/Vendedor/Dashbord" className="flex items-center gap-3 text-gray-600 p-3 rounded-xl hover:bg-gray-100"><LayoutDashboard size={18} />Dashboard</Link>
            <Link href="/Vendedor/Pedidos" className="flex items-center gap-3 bg-red-600 text-white p-3 rounded-xl"><Package size={18} />Pedidos</Link>
            <Link href="/Vendedor/Clientes" className="flex items-center gap-3 text-gray-600 p-3 rounded-xl hover:bg-gray-100"><Users size={18} />Clientes</Link>
            <Link href="/Vendedor/Perfil" className="flex items-center gap-3 text-gray-600 p-3 rounded-xl hover:bg-gray-100"><User size={18} />Perfil</Link>
            <Link href="/Vendedor/Administracao" className="flex items-center gap-3 text-gray-600 p-3 rounded-xl hover:bg-gray-100"><Shield size={18} />Administração</Link>
          </nav>
        </div>
        <div className="p-4 border-t">
          <Link href="/Login" onClick={() => localStorage.clear()} className="flex items-center gap-2 text-gray-600 hover:text-red-600">
            <LogOut size={18} />Sair
          </Link>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-bold text-black">Pedidos</h1>
        <p className="text-gray-500 mt-1">Gerencie os pedidos dos seus clientes</p>

        {/* BUSCA */}
        <div className="mt-6 relative max-w-lg">
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente, pedido ou veículo..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPaginaAtual(0); }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-red-500 text-black"
          />
        </div>

        {/* ESTADO */}
        {loading && (
          <div className="flex items-center gap-3 mt-12 text-gray-500">
            <Loader2 className="animate-spin" size={24} />
            <span>Carregando pedidos...</span>
          </div>
        )}

        {!loading && erro && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700 text-sm">{erro}</span>
            <button onClick={() => carregar(0)} className="ml-auto text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">Tentar novamente</button>
          </div>
        )}

        {/* TABELA */}
        {!loading && !erro && (
          <>
            <div className="mt-8 bg-white rounded-2xl shadow border overflow-hidden">
              <div className="grid grid-cols-6 px-8 py-4 text-gray-500 text-sm border-b bg-gray-50">
                <span>Pedido</span><span>Cliente</span><span>Veículo</span>
                <span>Status</span><span>Data</span><span></span>
              </div>

              {pedidosFiltrados.length === 0 && (
                <p className="text-center text-gray-500 py-12">Nenhum pedido encontrado.</p>
              )}

              {pedidosFiltrados.map((pedido) => (
                <div key={pedido.id} className="grid grid-cols-6 px-8 py-5 items-center border-b hover:bg-gray-50 transition">
                  <span className="font-semibold text-black">#{pedido.id}</span>
                  <span className="text-black">{pedido.cliente?.nome ?? "—"}</span>
                  <span className="text-gray-600">{pedido.itens?.[0]?.produto?.modelo ?? "—"}</span>
                  <span className={`px-3 py-1 rounded-full text-xs w-fit bg-blue-100 text-blue-700`}>
                    Pedido confirmado
                  </span>
                  <span className="text-gray-500">
                    {pedido.dataPedido ? new Date(pedido.dataPedido).toLocaleDateString("pt-BR") : "—"}
                  </span>
                  <Eye
                    onClick={() => setPedidoSelecionado(pedido)}
                    className="text-gray-400 cursor-pointer hover:text-red-600 transition"
                    size={20}
                  />
                </div>
              ))}
            </div>

            {/* PAGINAÇÃO */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button onClick={() => carregar(paginaAtual - 1)} disabled={paginaAtual === 0}
                  className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 text-sm">Anterior</button>
                <span className="text-sm text-gray-600">Página {paginaAtual + 1} de {totalPaginas}</span>
                <button onClick={() => carregar(paginaAtual + 1)} disabled={paginaAtual >= totalPaginas - 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 text-sm">Próxima</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL DETALHE */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-black mb-4">Detalhes do Pedido</h2>
            <div className="space-y-2 text-sm text-black">
              <p><strong>ID:</strong> #{pedidoSelecionado.id}</p>
              <p><strong>Cliente:</strong> {pedidoSelecionado.cliente?.nome ?? "—"}</p>
              <p><strong>Email:</strong> {pedidoSelecionado.cliente?.email ?? "—"}</p>
              <p><strong>Vendedor:</strong> {pedidoSelecionado.vendedor?.nome ?? "—"}</p>
              <p><strong>Data:</strong> {pedidoSelecionado.dataPedido ? new Date(pedidoSelecionado.dataPedido).toLocaleDateString("pt-BR") : "—"}</p>
              <p><strong>Valor total:</strong> {pedidoSelecionado.valorTotal != null ? `R$ ${Number(pedidoSelecionado.valorTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</p>
              {pedidoSelecionado.itens?.length > 0 && (
                <div>
                  <strong>Itens:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    {pedidoSelecionado.itens.map((item) => (
                      <li key={item.id}>
                        {item.produto?.modelo} {item.produto?.cor} — {item.quantidade}x
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button onClick={() => setPedidoSelecionado(null)}
              className="mt-6 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
