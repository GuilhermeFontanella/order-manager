export type MunicipioIbge = {
  id: number;
  nome: string;
  uf: string;
};

type MunicipioIbgeApi = {
  id: number;
  nome: string;
  microrregiao?: { mesorregiao?: { UF?: { sigla?: string } } };
  "regiao-imediata"?: { "regiao-intermediaria"?: { UF?: { sigla?: string } } };
};

let municipiosCache: MunicipioIbge[] | null = null;
let municipiosPromise: Promise<MunicipioIbge[]> | null = null;

async function carregarMunicipios(): Promise<MunicipioIbge[]> {
  if (municipiosCache) return municipiosCache;
  if (!municipiosPromise) {
    municipiosPromise = fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome",
    )
      .then((response) => (response.ok ? response.json() : []))
      .then((data: MunicipioIbgeApi[]) =>
        data.map((m) => ({
          id: m.id,
          nome: m.nome,
          uf: m.microrregiao?.mesorregiao?.UF?.sigla ?? m["regiao-imediata"]?.["regiao-intermediaria"]?.UF?.sigla ?? "",
        })),
      )
      .then((municipios) => {
        municipiosCache = municipios;
        return municipios;
      })
      .catch(() => []);
  }
  return municipiosPromise;
}

export async function buscarMunicipios(
  nome: string,
): Promise<MunicipioIbge[]> {
  const termo = nome.trim();
  if (termo.length < 2) return [];

  const municipios = await carregarMunicipios();
  const termoNormalizado = termo.toLowerCase();

  return municipios
    .filter((m) => m.nome.toLowerCase().includes(termoNormalizado))
    .slice(0, 20);
}
