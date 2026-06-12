# TOYOTA EXPERIENCE: PLATAFORMA INTEGRADA DE ACOMPANHAMENTO DE FABRICAÇÃO E ENTREGA DE VEÍCULOS COM TECNOLOGIAS IIoT

**Instituição:** SENAI — Serviço Nacional de Aprendizagem Industrial | **Curso:** Desenvolvimento de Sistemas | **Data:** Junho de 2026

---

## INTRODUÇÃO

Toyota Experience é uma plataforma integrada desenvolvida por estudantes do SENAI como Projeto Integrador Interdisciplinar em parceria com a Toyota do Brasil. O objetivo é digitalizar a jornada do cliente desde a compra até a entrega do veículo, oferecendo rastreamento em tempo real de cada etapa da produção — da montagem estrutural à entrega — comunicação com a concessionária, chatbot de suporte técnico automotivo e sincronização de dados com a nuvem via AWS.

---

## METODOLOGIA

O projeto foi desenvolvido em ciclos iterativos com revisões de código entre os integrantes da equipe. O controle de versão foi realizado via GitHub, com entregas organizadas por fases — Sprint inicial, revisão parcial e revisão final — garantindo rastreabilidade e qualidade incremental.

A arquitetura adota o padrão MVC, com separação entre frontend (Next.js/React), backend (Spring Boot/Java 17), integração IoT (Python/Node-RED) e banco de dados (PostgreSQL). Durante o desenvolvimento foi utilizado banco H2 para testes locais, com migração para PostgreSQL em produção via Docker. O deploy do backend foi realizado na plataforma AWS com integração contínua a partir do repositório principal.

---

## OBJETIVOS

Desenvolver uma plataforma que digitalize a jornada do cliente Toyota, permitindo:

- Acompanhamento em tempo real das **9 etapas de fabricação** do veículo — da montagem estrutural à entrega;
- Agendamento da retirada na concessionária;
- Suporte via chatbot automotivo **Totoya** (Flask) com diagnóstico OBD2;
- Gestão centralizada de pedidos, clientes e métricas para o vendedor;
- Monitoramento industrial via stack **MING** (Mosquitto, InfluxDB, Node-RED, Grafana).

---

## FUNDAMENTAÇÃO TÉCNICA

O desenvolvimento de aplicações modernas apoia-se em arquiteturas cliente-servidor, nas quais o frontend é responsável pela interface e experiência do usuário, enquanto o backend gerencia regras de negócio, persistência de dados e segurança. O projeto utiliza o framework **Next.js 16**, baseado em React 19, que combina renderização no lado do cliente e do servidor, favorecendo desempenho e escalabilidade.

No backend, o **Spring Boot 3.3.1** é um framework Java amplamente adotado na indústria por simplificar a criação de APIs REST robustas. Aliado ao **Spring Security** com autenticação via **JWT HS256** (JSON Web Token), garante controle de acesso por perfil de usuário de forma stateless e segura.

A integração com a linha de produção é realizada via protocolo **MQTT** (Eclipse Mosquitto), padrão industrial para comunicação de baixa latência em ambientes IIoT. O **Node-RED** atua como middleware de integração, filtrando e transformando eventos do ESP32/Simulador Python antes de encaminhá-los à API REST. Dados históricos de produção são persistidos no **InfluxDB 2.7** e visualizados no **Grafana**.

---

## DISCUSSÃO E RESULTADOS

A plataforma Toyota Experience foi entregue com todas as funcionalidades previstas e publicada na nuvem AWS, estando acessível em **http://54.91.247.129**. O backend opera em instância **EC2 (t3.micro)** com Java 17, conectado a banco **PostgreSQL gerenciado via RDS**, com 9 serviços containerizados via Docker Compose.

O cliente consegue acompanhar as etapas de produção do seu veículo em tempo real, com visualização em **timeline interativa** e animação de estrada (RoadVisualization em SVG/Bézier). O chatbot **Totoya** responde dúvidas sobre processos, financiamento e códigos de diagnóstico OBD2.

O painel do vendedor apresenta **métricas de desempenho, gráficos de vendas mensais** (AreaChart + BarChart via Recharts) e gestão de pedidos e clientes, centralizando as operações da concessionária em uma única interface. A autenticação com **JWT** e perfis distintos (cliente, vendedor, admin, IoT) garantiu segurança e separação de responsabilidades.

A integração IoT foi validada com **ESP32 simulando 10 veículos em pipeline simultâneo**, publicando eventos no broker Mosquitto. O Node-RED mapeia as etapas para a máquina de estados do backend, que registra cada transição em `tb_status_historico` com timestamp imutável.

---

## ARQUITETURA CLOUD (AWS)

```
[Cliente/Vendedor]
       │
       ▼
[Frontend Next.js]          ──► Vercel (branch feature/FrontEndWeb)
       │
       │ HTTP/REST + JWT
       ▼
[Backend Spring Boot]        ──► AWS EC2 t3.micro (54.91.247.129:8080)
       │                              Java 17 | systemd service
       │ JDBC/JPA
       ▼
[PostgreSQL 16]              ──► AWS RDS (VPC privada)
       │
[MQTT Pipeline IoT]
ESP32 / Simulador Python
    → Mosquitto Broker
    → Node-RED
    → Spring Boot API
    → PostgreSQL + InfluxDB → Grafana
```

---

## REFERÊNCIAS

- SCHWAB, K. *A Quarta Revolução Industrial*. Edipro, 2016.
- NEWMAN, S. *Building Microservices*. O'Reilly Media, 2015.
- WALLS, C. *Spring Boot in Action*. Manning, 2022.
- VERCEL. *Next.js Documentation*. Disponível em: https://nextjs.org/docs. 2024.
- AWS. *Amazon EC2 Documentation*. Disponível em: https://docs.aws.amazon.com/ec2. 2024.
- Artigo — Aplicação do Modelo de Aceitação de Tecnologia à Computação Em Nuvem.pdf
- Artigo — Competitive Strategy.pdf
