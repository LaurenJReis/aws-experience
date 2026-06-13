"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Eye, EyeOff, Zap } from "lucide-react";
import { authApi, usuarioApi, USE_MOCK } from "@/app/lib/api";

function formatarCPF(valor: string): string {
  const nums = valor.replace(/\D/g, "").slice(0, 11);
  return nums
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function calcularIdade(dataNasc: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

const ATALHOS = [
  { label: "Cliente",  email: "ana.souza@email.com",             senha: "cliente123",  cor: "bg-blue-600"  },
  { label: "Vendedor", email: "vendedor.toyota@experience.com",  senha: "vendedor123", cor: "bg-green-600" },
  { label: "Admin",    email: "admin@experience.com",            senha: "admin123",    cor: "bg-red-600"   },
];

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [isCadastro, setIsCadastro] = useState(false);
  const [nomeNovo, setNomeNovo] = useState("");
  const [emailNovo, setEmailNovo] = useState("");
  const [cpfNovo, setCpfNovo] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [mostrarSenhaNova, setMostrarSenhaNova] = useState(false);

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!email || !senha) { setErro("Preencha todos os campos."); return; }
    setLoading(true);
    try {
      const data = await authApi.login(email, senha);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", data.email);
      localStorage.setItem("userRole", data.role);
      if (data.role === "ADMIN") router.push("/Vendedor/Administracao");
      else if (data.role === "VENDEDOR") router.push("/Vendedor/Dashbord");
      else router.push("/");
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      if (msg.includes("401") || msg.toLowerCase().includes("inválid")) {
        setErro("E-mail ou senha incorretos.");
      } else if (msg.toLowerCase().includes("disabled") || msg.toLowerCase().includes("inativ")) {
        setErro("Sua conta está inativa. Entre em contato com a concessionária.");
      } else {
        setErro("E-mail ou senha incorretos.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loginRapido(emailAtalho: string, senhaAtalho: string) {
    setErro("");
    setLoading(true);
    try {
      const data = await authApi.login(emailAtalho, senhaAtalho);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", data.email);
      localStorage.setItem("userRole", data.role);
      if (data.role === "ADMIN") router.push("/Vendedor/Administracao");
      else if (data.role === "VENDEDOR") router.push("/Vendedor/Dashbord");
      else router.push("/");
    } catch {
      setErro("Erro no acesso rápido.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!nomeNovo || !emailNovo || !cpfNovo || !dataNasc || !senhaNova) {
      setErro("Preencha todos os campos."); return;
    }
    if (calcularIdade(dataNasc) < 18) {
      setErro("Você precisa ter pelo menos 18 anos para se cadastrar."); return;
    }
    setLoading(true);
    try {
      await usuarioApi.cadastrarPessoaFisica({
        nome: nomeNovo, email: emailNovo, senha: senhaNova,
        dataNascimento: dataNasc, cpf: cpfNovo.replace(/\D/g, ""), role: "CLIENTE",
      });
      alert("Cadastro realizado! Faça login para continuar.");
      setIsCadastro(false);
      setNomeNovo(""); setEmailNovo(""); setCpfNovo(""); setDataNasc(""); setSenhaNova("");
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      if (msg.toLowerCase().includes("cpf")) setErro("Este CPF já está cadastrado.");
      else if (msg.toLowerCase().includes("email")) setErro("Este e-mail já está cadastrado.");
      else if (msg.includes("409")) setErro("Dados já cadastrados. Verifique o e-mail ou CPF.");
      else setErro("Erro ao cadastrar. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">

        <div className="flex flex-col items-center mb-6">
          <div className="bg-red-600 p-4 rounded-xl mb-4">
            <Car className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Toyota Experience</h1>
          <p className="text-gray-600 text-sm">
            {isCadastro ? "Crie sua conta" : "Acompanhe seu veículo em tempo real"}
          </p>
        </div>

        {/* ── ATALHOS DE ACESSO RÁPIDO (apenas em modo mock) ── */}
        {USE_MOCK && !isCadastro && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700 font-semibold flex items-center gap-1 mb-2">
              <Zap size={12} /> Acesso rápido (modo demonstração)
            </p>
            <div className="flex gap-2">
              {ATALHOS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => loginRapido(a.email, a.senha)}
                  disabled={loading}
                  className={`flex-1 text-white text-xs font-semibold py-2 rounded-lg ${a.cor} hover:opacity-90 transition disabled:opacity-50`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── LOGIN ── */}
        {!isCadastro && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Senha</label>
              <div className="relative mt-1">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full p-3 pr-11 rounded-lg border bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {erro && <p className="text-red-500 text-sm">{erro}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}

        {/* ── CADASTRO ── */}
        {isCadastro && (
          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Nome completo</label>
              <input type="text" placeholder="Seu nome"
                className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={nomeNovo} onChange={(e) => setNomeNovo(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input type="email" placeholder="seu@email.com"
                className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={emailNovo} onChange={(e) => setEmailNovo(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm text-gray-600">CPF</label>
              <input type="text" placeholder="000.000.000-00"
                className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={cpfNovo} onChange={(e) => setCpfNovo(formatarCPF(e.target.value))} maxLength={14} required />
            </div>
            <div>
              <label className="text-sm text-gray-600">
                Data de nascimento <span className="text-gray-400 text-xs">(mínimo 18 anos)</span>
              </label>
              <input type="date"
                className="w-full mt-1 p-3 rounded-lg border bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={dataNasc} onChange={(e) => setDataNasc(e.target.value)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                required />
            </div>
            <div>
              <label className="text-sm text-gray-600">Senha</label>
              <div className="relative mt-1">
                <input
                  type={mostrarSenhaNova ? "text" : "password"} placeholder="••••••••"
                  className="w-full p-3 pr-11 rounded-lg border bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} required />
                <button type="button" onClick={() => setMostrarSenhaNova(!mostrarSenhaNova)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {mostrarSenhaNova ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {erro && <p className="text-red-500 text-sm">{erro}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50">
              {loading ? "Cadastrando..." : "Criar Conta"}
            </button>
          </form>
        )}

        <p
          onClick={() => { setIsCadastro(!isCadastro); setErro(""); }}
          className="text-center text-sm text-red-600 mt-4 cursor-pointer hover:underline"
        >
          {isCadastro ? "Já tem conta? Fazer login" : "Não tem conta? Criar agora"}
        </p>

      </div>
    </div>
  );
}
