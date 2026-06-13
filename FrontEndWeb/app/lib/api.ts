/**
 * Camada centralizada de integração com a API Spring Boot (AWS EC2 / localhost)
 * Todos os fetch do frontend passam por aqui.
 *
 * USE_MOCK = true  → usa dados mocados localmente (sem backend rodando)
 * USE_MOCK = false → chama a API real em BASE_URL
 */

export const USE_MOCK = true; // ← mude para false quando o backend estiver rodando

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try {
      const body = await res.text();
      msg = body || msg;
    } catch {}
    throw new Error(msg);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Tipos espelhando os DTOs do backend ──────────────────────────────────────

export type UserRole = "CLIENTE" | "VENDEDOR" | "ADMIN" | "IOT";

export type StatusFabricacao =
  | "AGUARDANDO"
  | "MONTAGEM_ESTRUTURAL"
  | "PINTURA"
  | "INSTALACAO_MOTOR"
  | "ACABAMENTO_INTERNO"
  | "INSPECAO_FINAL"
  | "LIBERACAO_TRANSPORTE"
  | "ENTREGUE"
  | "CANCELADO";

export const STATUS_LABELS: Record<StatusFabricacao, string> = {
  AGUARDANDO: "Aguardando",
  MONTAGEM_ESTRUTURAL: "Montagem Estrutural",
  PINTURA: "Pintura",
  INSTALACAO_MOTOR: "Instalação do Motor",
  ACABAMENTO_INTERNO: "Acabamento Interno",
  INSPECAO_FINAL: "Inspeção Final",
  LIBERACAO_TRANSPORTE: "Liberação para Transporte",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const STATUS_ORDER: StatusFabricacao[] = [
  "AGUARDANDO",
  "MONTAGEM_ESTRUTURAL",
  "PINTURA",
  "INSTALACAO_MOTOR",
  "ACABAMENTO_INTERNO",
  "INSPECAO_FINAL",
  "LIBERACAO_TRANSPORTE",
  "ENTREGUE",
];

export interface LoginResponse {
  token: string;
  email: string;
  role: UserRole;
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  dataNascimento: string;
  role: UserRole;
  ativo: boolean;
}

export interface PedidoResponse {
  id: number;
  dataPedido: string;
  valorTotal: number;
  cliente: { id: number; nome: string; email: string };
  vendedor: { id: number; nome: string };
  itens: {
    id: number;
    quantidade: number;
    produto: { id: number; modelo: string; cor: string; versao: string; ano: number };
  }[];
}

export interface VeiculoResponse {
  id: number;
  produto: { id: number; modelo: string; cor: string; versao: string; ano: number };
  chassi: number;
  statusVeiculo: StatusFabricacao;
  idPedido: number;
}

export interface ProdutoResponse {
  idProduto: number;
  modelo: string;
  cor: string;
  versao: string;
  ano: number;
}

export interface DashboardResponse {
  usuario: { id: number; nome: string; email: string; role: string };
  pedidos: {
    idPedido: number;
    dataPedido: string;
    valorTotal: number;
    idVeiculo: number;
    modeloVeiculo: string;
    corVeiculo: string;
    chassiVeiculo: number;
    statusAtual: StatusFabricacao;
    statusDescricao: string;
    dataUltimaAtualizacao: string;
    progressoPercent: number;
    historico: {
      status: StatusFabricacao;
      descricao: string;
      dataAlteracao: string;
      concluida: boolean;
    }[];
  }[];
  totalPedidos: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  async login(email: string, senha: string): Promise<LoginResponse> {
    if (USE_MOCK) {
      const { mockAuth } = await import("./mock");
      return mockAuth.login(email, senha);
    }
    const res = await fetch(`${BASE_URL}/api/usuario/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    return handleResponse<LoginResponse>(res);
  },

  async me(): Promise<UsuarioResponse> {
    if (USE_MOCK) {
      const { mockAuth } = await import("./mock");
      return mockAuth.me();
    }
    const res = await fetch(`${BASE_URL}/api/usuario/me`, {
      headers: authHeaders(),
    });
    return handleResponse<UsuarioResponse>(res);
  },
};

// ─── Usuários ─────────────────────────────────────────────────────────────────

export const usuarioApi = {
  async listar(page = 0, size = 20): Promise<Page<UsuarioResponse>> {
    if (USE_MOCK) {
      const { mockUsuarioApi } = await import("./mock");
      return mockUsuarioApi.listar(page, size);
    }
    const res = await fetch(`${BASE_URL}/api/usuario?page=${page}&size=${size}`, {
      headers: authHeaders(),
    });
    return handleResponse<Page<UsuarioResponse>>(res);
  },

  async buscarPorId(id: number): Promise<UsuarioResponse> {
    if (USE_MOCK) {
      const { mockUsuarioApi } = await import("./mock");
      return mockUsuarioApi.buscarPorId(id);
    }
    const res = await fetch(`${BASE_URL}/api/usuario/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse<UsuarioResponse>(res);
  },

  async atualizar(id: number, dados: Partial<UsuarioResponse & { senha?: string }>): Promise<UsuarioResponse> {
    if (USE_MOCK) {
      const { mockUsuarioApi } = await import("./mock");
      return mockUsuarioApi.atualizar(id, dados);
    }
    const res = await fetch(`${BASE_URL}/api/usuario/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(dados),
    });
    return handleResponse<UsuarioResponse>(res);
  },

  async ativar(id: number): Promise<UsuarioResponse> {
    if (USE_MOCK) {
      const { mockUsuarioApi } = await import("./mock");
      return mockUsuarioApi.ativar(id);
    }
    const res = await fetch(`${BASE_URL}/api/usuario/${id}/ativar`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    return handleResponse<UsuarioResponse>(res);
  },

  async desativar(id: number): Promise<UsuarioResponse> {
    if (USE_MOCK) {
      const { mockUsuarioApi } = await import("./mock");
      return mockUsuarioApi.desativar(id);
    }
    const res = await fetch(`${BASE_URL}/api/usuario/${id}/desativar`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    return handleResponse<UsuarioResponse>(res);
  },

  async cadastrarPessoaFisica(dados: {
    nome: string;
    email: string;
    senha: string;
    dataNascimento: string;
    cpf: string;
    role: UserRole;
  }) {
    if (USE_MOCK) {
      // Em modo mock, simula cadastro bem-sucedido
      return { id: Date.now(), nome: dados.nome, email: dados.email, dataNascimento: dados.dataNascimento, role: "CLIENTE" as UserRole, ativo: true };
    }
    const res = await fetch(`${BASE_URL}/api/pessoaFisica`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    return handleResponse<UsuarioResponse>(res);
  },
};

// ─── Pedidos ──────────────────────────────────────────────────────────────────

export const pedidoApi = {
  async listar(page = 0, size = 10): Promise<Page<PedidoResponse>> {
    if (USE_MOCK) {
      const { mockPedidoApi } = await import("./mock");
      return mockPedidoApi.listar(page, size);
    }
    const res = await fetch(`${BASE_URL}/api/pedido?page=${page}&size=${size}`, {
      headers: authHeaders(),
    });
    return handleResponse<Page<PedidoResponse>>(res);
  },

  async buscarPorId(id: number): Promise<PedidoResponse> {
    if (USE_MOCK) {
      const { mockPedidoApi } = await import("./mock");
      return mockPedidoApi.buscarPorId(id);
    }
    const res = await fetch(`${BASE_URL}/api/pedido/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse<PedidoResponse>(res);
  },

  async meusPedidos(): Promise<PedidoResponse[]> {
    if (USE_MOCK) {
      const { mockPedidoApi } = await import("./mock");
      return mockPedidoApi.meusPedidos();
    }
    const res = await fetch(`${BASE_URL}/api/pedido/meus-pedidos`, {
      headers: authHeaders(),
    });
    return handleResponse<PedidoResponse[]>(res);
  },

  async criar(dados: {
    idCliente: number;
    idVendedor: number;
    dataPedido: string;
    valorTotal: number;
  }): Promise<PedidoResponse> {
    const res = await fetch(`${BASE_URL}/api/pedido`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(dados),
    });
    return handleResponse<PedidoResponse>(res);
  },
};

// ─── Veículos ─────────────────────────────────────────────────────────────────

export const veiculoApi = {
  async listar(page = 0, size = 10): Promise<Page<VeiculoResponse>> {
    const res = await fetch(`${BASE_URL}/api/veiculo?page=${page}&size=${size}`, {
      headers: authHeaders(),
    });
    return handleResponse<Page<VeiculoResponse>>(res);
  },

  async buscarPorId(id: number): Promise<VeiculoResponse> {
    const res = await fetch(`${BASE_URL}/api/veiculo/${id}`, {
      headers: authHeaders(),
    });
    return handleResponse<VeiculoResponse>(res);
  },

  async historico(veiculoId: number) {
    const res = await fetch(`${BASE_URL}/api/veiculo/${veiculoId}/status`, {
      headers: authHeaders(),
    });
    return handleResponse<{ status: StatusFabricacao; dataAlteracao: string }[]>(res);
  },
};

// ─── Produtos ─────────────────────────────────────────────────────────────────

export const produtoApi = {
  async listar(page = 0, size = 20): Promise<Page<ProdutoResponse>> {
    if (USE_MOCK) {
      const { mockProdutoApi } = await import("./mock");
      return mockProdutoApi.listar(page, size);
    }
    const res = await fetch(`${BASE_URL}/api/produto?page=${page}&size=${size}`, {
      headers: authHeaders(),
    });
    return handleResponse<Page<ProdutoResponse>>(res);
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  async get(): Promise<DashboardResponse> {
    if (USE_MOCK) {
      const { mockDashboardApi } = await import("./mock");
      return mockDashboardApi.get();
    }
    const res = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: authHeaders(),
    });
    return handleResponse<DashboardResponse>(res);
  },
};
