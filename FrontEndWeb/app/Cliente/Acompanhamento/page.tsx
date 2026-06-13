"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/app/componentes/SideBar";
import { Car, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import { dashboardApi, STATUS_LABELS, STATUS_ORDER, type DashboardResponse } from "@/app/lib/api";

type PedidoResumo = DashboardResponse["pedidos"][number];

export default function Acompanhamento() {
  const [pedidos, setPedidos] = useState<PedidoResumo[]>([]);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const data = await dashboardApi.get();
      setPedidos(data.pedidos ?? []);
    } catch (err: any) {
      setErro("Não foi possível carregar seus pedidos. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col items-center px-5 md:px-12 py-8 md:ml-20">

        {/* HEADER */}
        <div className="w-full max-w-3xl sticky top-0 z-20 bg-gray-100 pb-5 mb-8">
          <div className="pt-4">
            <h1 className="text-2xl font-bold text-gray-900">Seus Veículos</h1>
            <p className="text-sm text-gray-600 mt-1">
              {loading ? "Carregando..." : `${pedidos.length} pedido(s) encontrado(s)`}
            </p>
          </div>
        </div>

        {/* ESTADO DE CARREGAMENTO */}
        {loading && (
          <div className="flex flex-col items-center gap-3 mt-20 text-gray-500">
            <Loader2 className="animate-spin" size={36} />
            <p>Carregando seus pedidos...</p>
          </div>
        )}

        {/* ESTADO DE ERRO */}
        {!loading && erro && (
          <div className="w-full max-w-3xl bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
            <AlertCircle className="text-red-500 shrink-0" size={24} />
            <div>
              <p className="font-semibold text-red-700">Erro ao carregar pedidos</p>
              <p className="text-sm text-red-600 mt-1">{erro}</p>
            </div>
            <button
              onClick={carregar}
              className="ml-auto text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* SEM PEDIDOS */}
        {!loading && !erro && pedidos.length === 0 && (
          <div className="flex flex-col items-center gap-3 mt-20 text-gray-500">
            <Car size={48} className="text-gray-300" />
            <p className="text-lg font-medium">Nenhum pedido encontrado</p>
            <p className="text-sm">Você ainda não possui veículos em acompanhamento.</p>
          </div>
        )}

        {/* LISTA DE PEDIDOS */}
        {!loading && !erro && pedidos.map((p) => {
          const aberto = expandido === p.idPedido;
          const statusLabel = STATUS_LABELS[p.statusAtual] ?? p.statusAtual;
          const statusIndex = STATUS_ORDER.indexOf(p.statusAtual);

          return (
            <div key={p.idPedido} className="w-full max-w-3xl mb-8">

              {/* CARD */}
              <div
                onClick={() => setExpandido(aberto ? null : p.idPedido)}
                className="bg-white p-7 rounded-3xl shadow-md hover:shadow-xl transition duration-300 cursor-pointer border border-gray-100"
              >
                <div className="flex justify-between items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Pedido #{p.idPedido}</p>
                    <h2 className="text-2xl font-bold text-gray-900 mt-1">{p.modeloVeiculo}</h2>
                    <p className="text-sm text-gray-600 mt-1">{p.corVeiculo}</p>

                    {/* STATUS VISÍVEL */}
                    <span className="mt-4 inline-block text-xs font-semibold text-red-700 bg-red-100 px-4 py-1.5 rounded-full">
                      {statusLabel}
                    </span>

                    {/* PROGRESSO */}
                    <div className="mt-3 w-48">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span>{p.progressoPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-red-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${p.progressoPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                      <Car className="w-7 h-7 text-red-600" />
                    </div>
                    {aberto ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                  </div>
                </div>
              </div>

              {/* DETALHES EXPANDIDOS */}
              {aberto && (
                <div className="mt-6 space-y-6">

                  {/* IMAGEM */}
                  <div className="w-full h-64 rounded-3xl overflow-hidden shadow bg-red-50 flex items-center justify-center">
                    <Car className="text-red-300" size={80} />
                  </div>

                  {/* TIMELINE */}
                  <div className="bg-white p-7 rounded-3xl shadow-md border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Acompanhamento</h3>
                    <p className="text-sm text-gray-500 mb-7">
                      Status atual:{" "}
                      <span className="font-semibold text-red-600">{statusLabel}</span>
                    </p>

                    <div className="relative">
                      <div className="absolute left-[14px] top-0 bottom-0 w-[2px] bg-red-200" />

                      {(p.historico?.length > 0 ? p.historico : STATUS_ORDER.slice(0, statusIndex + 1).map((s) => ({
                        status: s,
                        descricao: STATUS_LABELS[s],
                        dataAlteracao: "",
                        concluida: STATUS_ORDER.indexOf(s) <= statusIndex,
                      }))).map((etapa, i) => (
                        <div key={i} className="flex items-start gap-5 mb-10">
                          <div className="z-10">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${etapa.concluida ? "bg-red-600" : "bg-gray-300"}`}>
                              {etapa.concluida && <span className="text-white text-xs">✓</span>}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {STATUS_LABELS[etapa.status] ?? etapa.status}
                            </p>
                            {etapa.dataAlteracao && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(etapa.dataAlteracao).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}
