/**
 * Chamadas ao Core CRM externo
 * Usa Service Account com cache de 23h (mesmo padrão do QRlead Pro)
 * 
 * REGRA: Toda comunicação com o Core passa por aqui.
 */

import axios from 'axios';

const CORE_API_URL = process.env.CORE_API_URL!;
const CORE_SERVICE_EMAIL = process.env.CORE_SERVICE_EMAIL!;
const CORE_SERVICE_PASSWORD = process.env.CORE_SERVICE_PASSWORD!;

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Obtém token do Service Account com cache de 23h
 */
export async function getCoreServiceToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await axios.post(`${CORE_API_URL}/api/auth/login`, {
    email: CORE_SERVICE_EMAIL,
    password: CORE_SERVICE_PASSWORD,
  });

  cachedToken = response.data.token;
  tokenExpiresAt = now + 23 * 60 * 60 * 1000; // 23 horas
  console.log('[CoreAPI] Service Account token renovado');
  return cachedToken!;
}

/**
 * Busca lead no Core por telefone
 * IMPORTANTE: O Core usa o parâmetro 'search' (não 'phone') para filtrar.
 * O search pode retornar leads com match parcial, então filtramos por telefone exato.
 * Retorna o lead se existir, null se não existir.
 */
export async function buscarLeadPorTelefone(telefone: string): Promise<any | null> {
  const token = await getCoreServiceToken();
  try {
    const response = await axios.get(`${CORE_API_URL}/api/leads`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { search: telefone },
    });
    // Filtra por telefone EXATO (search pode retornar matches parciais)
    const leads = response.data.leads || response.data;
    if (Array.isArray(leads) && leads.length > 0) {
      const exactMatch = leads.find((l: any) => l.phone === telefone);
      return exactMatch || null;
    }
    return null;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

/**
 * Cria lead novo no Core
 */
export async function criarLead(dados: {
  name: string;
  phone: string;
  source?: string;
  notes?: string;
}): Promise<any> {
  const token = await getCoreServiceToken();
  const response = await axios.post(`${CORE_API_URL}/api/leads`, dados, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * Atualiza notes do lead no Core (append)
 */
export async function atualizarNotesLead(leadId: number, novaNote: string): Promise<void> {
  const token = await getCoreServiceToken();

  // Buscar notes atuais
  const leadResponse = await axios.get(`${CORE_API_URL}/api/leads/${leadId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const notesAtuais = leadResponse.data.notes || '';
  const notesAtualizadas = notesAtuais
    ? `${notesAtuais}\n---\n${novaNote}`
    : novaNote;

  await axios.put(`${CORE_API_URL}/api/leads/${leadId}`, {
    notes: notesAtualizadas,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Grava metadata no lead (chave-valor)
 */
export async function gravarMetadata(leadId: number, key: string, value: string): Promise<void> {
  const token = await getCoreServiceToken();
  await axios.post(`${CORE_API_URL}/api/leads/${leadId}/metadata`, {
    key,
    value,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
