import { api } from "./apiClient";
import type { ConfiguracaoRestaurante, HorarioDia } from "./storefront";

export type ConfiguracaoAparencia = Pick<
  ConfiguracaoRestaurante,
  | "arteCardapioUrl"
  | "logoUrl"
  | "corBotaoPrimario"
  | "corBotaoSecundario"
  | "corTextoPrimario"
  | "corTextoSecundario"
  | "mostrarDescricao"
  | "mostrarFotos"
  | "mostrarIngredientes"
  | "mostrarPreco"
>;

export type UpdateConfiguracaoRestauranteInput = Partial<{
  nome: string;
  descricao: string;
  historia: string;
  horarios: HorarioDia[];
  arteCardapioUrl?: string | null;
  logoUrl?: string | null;
  corBotaoPrimario?: string;
  corBotaoSecundario?: string;
  corTextoPrimario?: string;
  corTextoSecundario?: string;
  mostrarDescricao?: boolean;
  mostrarFotos?: boolean;
  mostrarIngredientes?: boolean;
  mostrarPreco?: boolean;
  enderecoCep?: string;
  enderecoRua?: string;
  enderecoNumero?: string;
  enderecoBairro?: string;
  enderecoCidade?: string;
  permiteTakeaway?: boolean;
  permiteDelivery?: boolean;
}>;

export async function updateConfiguracaoRestaurante(
  payload: UpdateConfiguracaoRestauranteInput,
): Promise<ConfiguracaoRestaurante> {
  const response = await api.patch<ConfiguracaoRestaurante>(
    "/restaurante",
    payload,
  );
  return response.data;
}

export async function getConfiguracaoRestauranteAdmin(): Promise<ConfiguracaoRestaurante> {
  const response = await api.get<ConfiguracaoRestaurante>("/restaurante");
  return response.data;
}

export async function uploadImagemRestaurante(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("arquivo", file);
  const response = await api.post<{ url: string }>(
    "/restaurante/imagens",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data.url;
}
