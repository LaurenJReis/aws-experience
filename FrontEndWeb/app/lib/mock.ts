/**
 * DADOS MOCADOS — substitui a API enquanto o backend não está rodando.
 * Para desativar: setar USE_MOCK = false em api.ts
 */

import type {
  LoginResponse,
  UsuarioResponse,
  PedidoResponse,
  VeiculoResponse,
  ProdutoResponse,
  DashboardResponse,
  Page,
} from "./api";

// ─── Usuários mocados ──────────────────────────────────────────────────────────

export const MOCK_USUARIOS: UsuarioResponse[] = [
  { id: 1,  nome: "Ana Souza",              email: "ana.souza@email.com",          dataNascimento: "1990-03-15", role: "CLIENTE",  ativo: true  },
  { id: 2,  nome: "Bruno Lima",             email: "bruno.lima@email.com",         dataNascimento: "1985-07-22", role: "CLIENTE",  ativo: true  },
  { id: 3,  nome: "Carla Mendes",           email: "carla.mendes@email.com",       dataNascimento: "1992-11-05", role: "CLIENTE",  ativo: true  },
  { id: 4,  nome: "Diego Ferreira",         email: "diego.ferreira@email.com",     dataNascimento: "1988-01-30", role: "CLIENTE",  ativo: false },
  { id: 5,  nome: "Elisa Costa",            email: "elisa.costa@email.com",        dataNascimento: "1995-06-18", role: "CLIENTE",  ativo: true  },
  { id: 6,  nome: "Felipe Rocha",           email: "felipe.rocha@email.com",       dataNascimento: "1983-09-12", role: "CLIENTE",  ativo: true  },
  { id: 7,  nome: "Gabriela Nunes",         email: "gabriela.nunes@email.com",     dataNascimento: "1997-04-25", role: "CLIENTE",  ativo: true  },
  { id: 8,  nome: "Henrique Alves",         email: "henrique.alves@email.com",     dataNascimento: "1991-08-08", role: "CLIENTE",  ativo: false },
  { id: 9,  nome: "Isabela Martins",        email: "isabela.martins@email.com",    dataNascimento: "1994-02-14", role: "CLIENTE",  ativo: true  },
  { id: 10, nome: "João Pereira",           email: "joao.pereira@email.com",       dataNascimento: "1987-12-03", role: "CLIENTE",  ativo: true  },
  { id: 11, nome: "Carlos Vendedor Toyota", email: "vendedor.toyota@experience.com", dataNascimento: "1980-05-10", role: "VENDEDOR", ativo: true },
  { id: 12, nome: "Administrador",          email: "admin@experience.com",         dataNascimento: "1990-01-01", role: "ADMIN",    ativo: true  },
];

// Contas de acesso rápido (login mocado)
const MOCK_CONTAS: Record<string, { senha: string; id: number }> = {
  "ana.souza@email.com":           { senha: "cliente123",  id: 1  },
  "vendedor.toyota@experience.com":{ senha: "vendedor123", id: 11 },
  "admin@experience.com":          { senha: "admin123",    id: 12 },
};

// ─── Produtos mocados ──────────────────────────────────────────────────────────

export const MOCK_PRODUTOS: ProdutoResponse[] = [
  { idProduto: 1, modelo: "Corolla",  cor: "Branco Pérola",   versao: "XEi",     ano: 2024 },
  { idProduto: 2, modelo: "Hilux",    cor: "Prata Metálico",  versao: "SRX",     ano: 2024 },
  { idProduto: 3, modelo: "Yaris",    cor: "Vermelho",        versao: "XLS",     ano: 2024 },
  { idProduto: 4, modelo: "RAV4",     cor: "Preto",           versao: "GR-S",    ano: 2025 },
  { idProduto: 5, modelo: "SW4",      cor: "Cinza Grafite",   versao: "Diamond", ano: 2025 },
];

// ─── Pedidos mocados ───────────────────────────────────────────────────────────

export const MOCK_PEDIDOS: PedidoResponse[] = [
  {
    id: 1001,
    dataPedido: "2026-03-05T10:00:00",
    valorTotal: 149900,
    cliente:  { id: 1,  nome: "Ana Souza",    email: "ana.souza@email.com" },
    vendedor: { id: 11, nome: "Carlos Vendedor Toyota" },
    itens: [{ id: 1, quantidade: 1, produto: { id: 1, modelo: "Corolla",  cor: "Branco Pérola",  versao: "XEi", ano: 2024 } }],
  },
  {
    id: 1002,
    dataPedido: "2026-03-04T14:30:00",
    valorTotal: 289900,
    cliente:  { id: 2,  nome: "Bruno Lima",   email: "bruno.lima@email.com" },
    vendedor: { id: 11, nome: "Carlos Vendedor Toyota" },
    itens: [{ id: 2, quantidade: 1, produto: { id: 2, modelo: "Hilux",    cor: "Prata Metálico", versao: "SRX", ano: 2024 } }],
  },
  {
    id: 1003,
    dataPedido: "2026-03-03T09:15:00",
    valorTotal: 109900,
    cliente:  { id: 3,  nome: "Carla Mendes", email: "carla.mendes@email.com" },
    vendedor: { id: 11, nome: "Carlos Vendedor Toyota" },
    itens: [{ id: 3, quantidade: 1, produto: { id: 3, modelo: "Yaris",    cor: "Vermelho",       versao: "XLS", ano: 2024 } }],
  },
  {
    id: 1004,
    dataPedido: "2026-03-02T16:00:00",
    valorTotal: 319900,
    cliente:  { id: 5,  nome: "Elisa Costa",  email: "elisa.costa@email.com" },
    vendedor: { id: 11, nome: "Carlos Vendedor Toyota" },
    itens: [{ id: 4, quantidade: 1, produto: { id: 4, modelo: "RAV4",     cor: "Preto",          versao: "GR-S", ano: 2025 } }],
  },
  {
    id: 1005,
    dataPedido: "2026-03-01T11:45:00",
    valorTotal: 399900,
    cliente:  { id: 6,  nome: "Felipe Rocha", email: "felipe.rocha@email.com" },
    vendedor: { id: 11, nome: "Carlos Vendedor Toyota" },
    itens: [{ id: 5, quantidade: 1, produto: { id: 5, modelo: "SW4",      cor: "Cinza Grafite",  versao: "Diamond", ano: 2025 } }],
  },
];

// ─── Dashboard mocado para o cliente Ana Souza ────────────────────────────────

export const MOCK_DASHBOARD: DashboardResponse = {
  usuario: { id: 1, nome: "Ana Souza", email: "ana.souza@email.com", role: "CLIENTE" },
  totalPedidos: 1,
  pedidos: [
    {
      idPedido: 1001,
      dataPedido: "2026-03-05T10:00:00",
      valorTotal: 149900,
      idVeiculo: 201,
      modeloVeiculo: "Corolla",
      corVeiculo: "Branco Pérola",
      chassiVeiculo: 10001,
      statusAtual: "PINTURA",
      statusDescricao: "Seu veículo está recebendo a pintura.",
      dataUltimaAtualizacao: "2026-06-10T08:00:00",
      progressoPercent: 38,
      historico: [
        { status: "AGUARDANDO",          descricao: "Aguardando Fabricação",  dataAlteracao: "2026-03-05T10:00:00", concluida: true  },
        { status: "MONTAGEM_ESTRUTURAL", descricao: "Montagem Estrutural",    dataAlteracao: "2026-04-01T08:00:00", concluida: true  },
        { status: "PINTURA",             descricao: "Pintura",                dataAlteracao: "2026-06-10T08:00:00", concluida: true  },
        { status: "INSTALACAO_MOTOR",    descricao: "Instalação do Motor",    dataAlteracao: "",                    concluida: false },
        { status: "ACABAMENTO_INTERNO",  descricao: "Acabamento Interno",     dataAlteracao: "",                    concluida: false },
        { status: "INSPECAO_FINAL",      descricao: "Inspeção Final",         dataAlteracao: "",                    concluida: false },
        { status: "LIBERACAO_TRANSPORTE",descricao: "Liberado para Transporte",dataAlteracao: "",                   concluida: false },
        { status: "ENTREGUE",            descricao: "Entregue",               dataAlteracao: "",                    concluida: false },
      ],
    },
  ],
};

// ─── Implementação das funções mocadas ────────────────────────────────────────

let _usuarios = [...MOCK_USUARIOS];

export const mockAuth = {
  login(email: string, senha: string): LoginResponse {
    const conta = MOCK_CONTAS[email];
    if (!conta || conta.senha !== senha) throw new Error("Erro 401");
    const usuario = _usuarios.find((u) => u.id === conta.id)!;
    return {
      token: `mock-token-${usuario.role.toLowerCase()}`,
      email: usuario.email,
      role: usuario.role,
    };
  },

  me(): UsuarioResponse {
    const email = localStorage.getItem("user") ?? "";
    const u = _usuarios.find((u) => u.email === email);
    if (!u) throw new Error("Erro 401");
    return u;
  },
};

export const mockUsuarioApi = {
  listar(page = 0, size = 10): Page<UsuarioResponse> {
    const start = page * size;
    const content = _usuarios.slice(start, start + size);
    return { content, totalElements: _usuarios.length, totalPages: Math.ceil(_usuarios.length / size), number: page, size };
  },

  buscarPorId(id: number): UsuarioResponse {
    const u = _usuarios.find((u) => u.id === id);
    if (!u) throw new Error("Erro 404");
    return u;
  },

  atualizar(id: number, dados: Partial<UsuarioResponse>): UsuarioResponse {
    _usuarios = _usuarios.map((u) => u.id === id ? { ...u, ...dados } : u);
    return _usuarios.find((u) => u.id === id)!;
  },

  ativar(id: number): UsuarioResponse {
    return mockUsuarioApi.atualizar(id, { ativo: true });
  },

  desativar(id: number): UsuarioResponse {
    return mockUsuarioApi.atualizar(id, { ativo: false });
  },
};

export const mockPedidoApi = {
  listar(page = 0, size = 10): Page<PedidoResponse> {
    const start = page * size;
    const content = MOCK_PEDIDOS.slice(start, start + size);
    return { content, totalElements: MOCK_PEDIDOS.length, totalPages: Math.ceil(MOCK_PEDIDOS.length / size), number: page, size };
  },

  buscarPorId(id: number): PedidoResponse {
    const p = MOCK_PEDIDOS.find((p) => p.id === id);
    if (!p) throw new Error("Erro 404");
    return p;
  },

  meusPedidos(): PedidoResponse[] {
    const email = localStorage.getItem("user") ?? "";
    return MOCK_PEDIDOS.filter((p) => p.cliente.email === email);
  },
};

export const mockDashboardApi = {
  get(): DashboardResponse {
    const email = localStorage.getItem("user") ?? "";
    const usuario = _usuarios.find((u) => u.email === email);
    if (!usuario) throw new Error("Erro 401");
    // Retorna dashboard genérico com nome do usuário logado
    return {
      ...MOCK_DASHBOARD,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    };
  },
};

export const mockProdutoApi = {
  listar(page = 0, size = 20): Page<ProdutoResponse> {
    return { content: MOCK_PRODUTOS, totalElements: MOCK_PRODUTOS.length, totalPages: 1, number: 0, size };
  },
};
