export interface CnpjResponse {
  status: string;
  cnpj: string;
  nome: string;
  fantasia: string;
  uf: string;
  municipio: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  telefone: string;
  email: string;
  situacao: string;
  abertura: string;
  natureza_juridica: string;
  porte: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  atividade_principal: Array<{ code: string; text: string }>;
  atividades_secundarias: Array<{ code: string; text: string }>;
}

interface BrasilApiCnpj {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  descricao_situacao_cadastral: string;
  uf: string;
  descricao_municipio: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  ddd_telefone_1: string;
  email: string;
  data_inicio_atividade: string;
  descricao_natureza_juridica: string;
  porte: string;
  inscricoes_estaduais: Array<{ inscricao_estadual: string }>;
  cnae_fiscal_descricao: string;
  cnaes_secundarios: Array<{ codigo: string; descricao: string }>;
}

export function mapBrasilApiToCnpj(data: BrasilApiCnpj): CnpjResponse {
  return {
    status: 'OK',
    cnpj: data.cnpj,
    nome: data.razao_social,
    fantasia: data.nome_fantasia || '',
    uf: data.uf,
    municipio: data.descricao_municipio,
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento || '',
    bairro: data.bairro,
    cep: data.cep,
    telefone: data.ddd_telefone_1 || '',
    email: data.email || '',
    situacao: data.descricao_situacao_cadastral,
    abertura: data.data_inicio_atividade,
    natureza_juridica: data.descricao_natureza_juridica,
    porte: data.porte,
    inscricao_estadual: data.inscricoes_estaduais?.[0]?.inscricao_estadual,
    atividade_principal: [{ code: '', text: data.cnae_fiscal_descricao }],
    atividades_secundarias: (data.cnaes_secundarios || []).map(c => ({ code: c.codigo, text: c.descricao })),
  };
}

export interface CnbData {
  nivel: 'NACIONAL' | 'ESTADUAL' | 'MUNICIPAL';
  entidade: string;
  sigla: string;
  uf: string;
  municipio: string;
  website: string;
  descricao: string;
  associados: number;
  endpointReal: string;
}

export interface CnbResult {
  nacional: CnbData;
  estadual: CnbData | null;
  municipal: CnbData | null;
}

export interface CndInfo {
  tipo: string;
  orgao: string;
  descricao: string;
  url: string;
  icone: string;
}
