import { api } from "./apiClient";
import type { AreaAtendimentoCidade } from "./storefront";

export type { AreaAtendimentoCidade };

export async function listarAreaAtendimento(): Promise<AreaAtendimentoCidade[]> {
  const response = await api.get<AreaAtendimentoCidade[]>("/area-atendimento");
  return response.data;
}

export async function criarAreaAtendimentoCidade(payload: {
  cidade: string;
  uf: string;
  bairros: string[];
}): Promise<AreaAtendimentoCidade> {
  const response = await api.post<AreaAtendimentoCidade>(
    "/area-atendimento",
    payload,
  );
  return response.data;
}

export async function atualizarAreaAtendimentoCidade(
  id: string,
  payload: Partial<{ cidade: string; uf: string; bairros: string[] }>,
): Promise<AreaAtendimentoCidade> {
  const response = await api.patch<AreaAtendimentoCidade>(
    `/area-atendimento/${id}`,
    payload,
  );
  return response.data;
}

export async function removerAreaAtendimentoCidade(id: string): Promise<void> {
  await api.delete(`/area-atendimento/${id}`);
}
