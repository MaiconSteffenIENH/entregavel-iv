import promptSync from "prompt-sync";
import { linearSearch } from "./search/linear-search.js";
import { insertionSort } from "./sort/insertion-sort.js";
import { Queue } from "./structs/queue.js";
import { Stack } from "./structs/stack.js";

const prompt = promptSync();

const enun = `
O que você quer fazer?
[rc] Registrar cliente na fila
[ac] Atender o próximo cliente
[mc] Mostrar clientes atendidos (a-z)
[pc] Procurar cliente da fila pelo nome
[uc] Ver último cliente atendido
[rq] Mostrar relatório e sair
`.trim();

const fila = new Queue();
const pilhaAtendidos = new Stack();

let proximaSenha = 1;
const nomesRegistrados = new Set();

function obterTamanho(col) {
  if (typeof col.size === "function") return col.size();
  if (typeof col.size === "number") return col.size;
  return 0;
}

function paraArray(col) {
  if (typeof col.toArray === "function") return col.toArray();
  if (Array.isArray(col.items)) return col.items.slice();
  return [];
}

function normalizarNome(s) {
  if (!s) return "";
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function formatarCliente(c) {
  return `#${c.ticket} - ${c.name}`;
}

function registrarCliente() {
  const nomeRaw = prompt("Nome do cliente: ").trim();
  if (!nomeRaw) {
    console.log("Nome inválido. Tente novamente.");
    return;
  }

  const chave = normalizarNome(nomeRaw);

  if (nomesRegistrados.has(chave)) {
    console.log("Cliente já registrado na fila.");
    return;
  }

  const existeNaFila = paraArray(fila).some(c => normalizarNome(c.name) === chave);
  if (existeNaFila) {
    console.log("Cliente já registrado na fila.");
    nomesRegistrados.add(chave);
    return;
  }

  const cliente = { ticket: proximaSenha++, name: nomeRaw };
  fila.enqueue(cliente);
  nomesRegistrados.add(chave);
  console.log("Registrado:", formatarCliente(cliente));
}

function atenderProximo() {
  if (fila.isEmpty()) {
    console.log("Nenhum cliente na fila.");
    return;
  }
  const cliente = fila.dequeue();
  pilhaAtendidos.push(cliente);
  nomesRegistrados.delete(normalizarNome(cliente.name));
  console.log("Atendido:", formatarCliente(cliente));
}

function mostrarAtendidos() {
  if (pilhaAtendidos.isEmpty()) {
    console.log("Nenhum cliente atendido ainda.");
    return;
  }
  const atendidos = paraArray(pilhaAtendidos).map(c => c.name);
  const ordenados = insertionSort ? insertionSort(atendidos.slice()) : atendidos.slice().sort();
  console.log("Clientes atendidos (A-Z):");
  ordenados.forEach(nome => console.log("- " + nome));
}

function procurarNaFila() {
  if (fila.isEmpty()) {
    console.log("Fila vazia.");
    return;
  }
  const termoRaw = prompt("Nome a procurar: ").trim();
  if (!termoRaw) {
    console.log("Busca vazia.");
    return;
  }
  const termo = normalizarNome(termoRaw);
  const arr = paraArray(fila).map(c => normalizarNome(c.name));
  const idx = linearSearch ? linearSearch(arr, termo) : arr.indexOf(termo);
  if (idx >= 0) {
    const cliente = paraArray(fila)[idx];
    console.log("Encontrado na fila:", formatarCliente(cliente), `(posição ${idx + 1})`);
  } else {
    console.log("Cliente não encontrado na fila.");
  }
}

function verUltimoAtendido() {
  if (pilhaAtendidos.isEmpty()) {
    console.log("Nenhum cliente atendido ainda.");
    return;
  }
  const ultimo = pilhaAtendidos.peek();
  console.log("Último atendido:", formatarCliente(ultimo));
}

function relatorioESair() {
  console.log("=== Relatório final ===");
  console.log("Clientes ainda na fila:", obterTamanho(fila));
  if (!fila.isEmpty()) {
    paraArray(fila).forEach(c => console.log(" -", formatarCliente(c)));
  }
  console.log("Clientes atendidos (ordem de atendimento):");
  const atendidos = paraArray(pilhaAtendidos).slice().reverse();
  if (atendidos.length === 0) console.log(" (nenhum)");
  else atendidos.forEach(c => console.log(" -", formatarCliente(c)));
  console.log("Saindo!");
  process.exit();
}

while (true) {
  console.log("\n" + enun);
  const entrada = prompt("Ação: ") ?? "";
  const acao = entrada.trim().toLowerCase().slice(0, 2);

  if (acao === "rq") {
    relatorioESair();
  } else if (acao === "rc") {
    registrarCliente();
  } else if (acao === "ac") {
    atenderProximo();
  } else if (acao === "mc") {
    mostrarAtendidos();
  } else if (acao === "pc") {
    procurarNaFila();
  } else if (acao === "uc") {
    verUltimoAtendido();
  } else {
    console.log("Ação desconhecida. Use os códigos do menu.");
  }
}