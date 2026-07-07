import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CnbData, CnbResult } from '../models/models';

interface CnbEstadualInfo {
  sigla: string;
  entidade: string;
  website: string;
  associados: number;
  descricao: string;
}

const CNB_MAP: Record<string, CnbEstadualInfo> = {
  AC: { sigla: 'CNB/AC', entidade: 'Colégio Notarial do Brasil - Seção Acre', website: 'http://www.cnbac.org.br', associados: 28, descricao: 'Representa os tabeliães de notas do Estado do Acre.' },
  AL: { sigla: 'CNB/AL', entidade: 'Colégio Notarial do Brasil - Seção Alagoas', website: 'http://www.cnbal.org.br', associados: 52, descricao: 'Representa os tabeliães de notas do Estado de Alagoas.' },
  AP: { sigla: 'CNB/AP', entidade: 'Colégio Notarial do Brasil - Seção Amapá', website: 'http://www.cnbap.org.br', associados: 18, descricao: 'Representa os tabeliães de notas do Estado do Amapá.' },
  AM: { sigla: 'CNB/AM', entidade: 'Colégio Notarial do Brasil - Seção Amazonas', website: 'http://www.cnbam.org.br', associados: 35, descricao: 'Representa os tabeliães de notas do Estado do Amazonas.' },
  BA: { sigla: 'CNB/BA', entidade: 'Colégio Notarial do Brasil - Seção Bahia', website: 'http://www.cnbba.org.br', associados: 180, descricao: 'Representa os tabeliães de notas do Estado da Bahia.' },
  CE: { sigla: 'CNB/CE', entidade: 'Colégio Notarial do Brasil - Seção Ceará', website: 'http://www.cnbce.org.br', associados: 95, descricao: 'Representa os tabeliães de notas do Estado do Ceará.' },
  DF: { sigla: 'CNB/DF', entidade: 'Colégio Notarial do Brasil - Seção Distrito Federal', website: 'http://www.cnbdf.org.br', associados: 65, descricao: 'Representa os tabeliães de notas do Distrito Federal.' },
  ES: { sigla: 'CNB/ES', entidade: 'Colégio Notarial do Brasil - Seção Espírito Santo', website: 'http://www.cnbes.org.br', associados: 78, descricao: 'Representa os tabeliães de notas do Estado do Espírito Santo.' },
  GO: { sigla: 'CNB/GO', entidade: 'Colégio Notarial do Brasil - Seção Goiás', website: 'http://www.cnbgo.org.br', associados: 120, descricao: 'Representa os tabeliães de notas do Estado de Goiás.' },
  MA: { sigla: 'CNB/MA', entidade: 'Colégio Notarial do Brasil - Seção Maranhão', website: 'http://www.cnbma.org.br', associados: 85, descricao: 'Representa os tabeliães de notas do Estado do Maranhão.' },
  MT: { sigla: 'CNB/MT', entidade: 'Colégio Notarial do Brasil - Seção Mato Grosso', website: 'http://www.cnbmt.org.br', associados: 72, descricao: 'Representa os tabeliães de notas do Estado de Mato Grosso.' },
  MS: { sigla: 'CNB/MS', entidade: 'Colégio Notarial do Brasil - Seção Mato Grosso do Sul', website: 'http://www.cnbms.org.br', associados: 55, descricao: 'Representa os tabeliães de notas do Estado de Mato Grosso do Sul.' },
  MG: { sigla: 'CNB/MG', entidade: 'Colégio Notarial do Brasil - Seção Minas Gerais', website: 'http://www.cnbmg.org.br', associados: 350, descricao: 'Representa os tabeliães de notas do Estado de Minas Gerais.' },
  PA: { sigla: 'CNB/PA', entidade: 'Colégio Notarial do Brasil - Seção Pará', website: 'http://www.cnbpa.org.br', associados: 68, descricao: 'Representa os tabeliães de notas do Estado do Pará.' },
  PB: { sigla: 'CNB/PB', entidade: 'Colégio Notarial do Brasil - Seção Paraíba', website: 'http://www.cnbpb.org.br', associados: 62, descricao: 'Representa os tabeliães de notas do Estado da Paraíba.' },
  PR: { sigla: 'CNB/PR', entidade: 'Colégio Notarial do Brasil - Seção Paraná', website: 'http://www.cnbpr.org.br', associados: 160, descricao: 'Representa os tabeliães de notas do Estado do Paraná.' },
  PE: { sigla: 'CNB/PE', entidade: 'Colégio Notarial do Brasil - Seção Pernambuco', website: 'http://www.cnbpe.org.br', associados: 130, descricao: 'Representa os tabeliães de notas do Estado de Pernambuco.' },
  PI: { sigla: 'CNB/PI', entidade: 'Colégio Notarial do Brasil - Seção Piauí', website: 'http://www.cnbpi.org.br', associados: 45, descricao: 'Representa os tabeliães de notas do Estado do Piauí.' },
  RJ: { sigla: 'CNB/RJ', entidade: 'Colégio Notarial do Brasil - Seção Rio de Janeiro', website: 'http://www.cnbrj.org.br', associados: 280, descricao: 'Representa os tabeliães de notas do Estado do Rio de Janeiro.' },
  RN: { sigla: 'CNB/RN', entidade: 'Colégio Notarial do Brasil - Seção Rio Grande do Norte', website: 'http://www.cnbrn.org.br', associados: 58, descricao: 'Representa os tabeliães de notas do Estado do Rio Grande do Norte.' },
  RS: { sigla: 'CNB/RS', entidade: 'Colégio Notarial do Brasil - Seção Rio Grande do Sul', website: 'http://www.cnbrs.org.br', associados: 210, descricao: 'Representa os tabeliães de notas do Estado do Rio Grande do Sul.' },
  RO: { sigla: 'CNB/RO', entidade: 'Colégio Notarial do Brasil - Seção Rondônia', website: 'http://www.cnbro.org.br', associados: 32, descricao: 'Representa os tabeliães de notas do Estado de Rondônia.' },
  RR: { sigla: 'CNB/RR', entidade: 'Colégio Notarial do Brasil - Seção Roraima', website: 'http://www.cnbrr.org.br', associados: 15, descricao: 'Representa os tabeliães de notas do Estado de Roraima.' },
  SC: { sigla: 'CNB/SC', entidade: 'Colégio Notarial do Brasil - Seção Santa Catarina', website: 'http://www.cnbsc.org.br', associados: 110, descricao: 'Representa os tabeliães de notas do Estado de Santa Catarina.' },
  SP: { sigla: 'CNB/SP', entidade: 'Colégio Notarial do Brasil - Seção São Paulo', website: 'http://www.cnbsp.org.br', associados: 620, descricao: 'Representa os tabeliães de notas do Estado de São Paulo.' },
  SE: { sigla: 'CNB/SE', entidade: 'Colégio Notarial do Brasil - Seção Sergipe', website: 'http://www.cnbse.org.br', associados: 42, descricao: 'Representa os tabeliães de notas do Estado de Sergipe.' },
  TO: { sigla: 'CNB/TO', entidade: 'Colégio Notarial do Brasil - Seção Tocantins', website: 'http://www.cnbto.org.br', associados: 38, descricao: 'Representa os tabeliães de notas do Estado do Tocantins.' },
};

const CAPITAIS: Record<string, string> = {
  AC: 'RIO BRANCO', AL: 'MACEIO', AP: 'MACAPA', AM: 'MANAUS', BA: 'SALVADOR',
  CE: 'FORTALEZA', DF: 'BRASILIA', ES: 'VITORIA', GO: 'GOIANIA', MA: 'SAO LUIS',
  MT: 'CUIABA', MS: 'CAMPO GRANDE', MG: 'BELO HORIZONTE', PA: 'BELEM',
  PB: 'JOAO PESSOA', PR: 'CURITIBA', PE: 'RECIFE', PI: 'TERESINA', RJ: 'RIO DE JANEIRO',
  RN: 'NATAL', RS: 'PORTO ALEGRE', RO: 'PORTO VELHO', RR: 'BOA VISTA',
  SC: 'FLORIANOPOLIS', SP: 'SAO PAULO', SE: 'ARACAJU', TO: 'PALMAS',
};

@Injectable({ providedIn: 'root' })
export class CnbService {
  private nacional: CnbData = {
    nivel: 'NACIONAL',
    entidade: 'Colégio Notarial do Brasil - Conselho Federal',
    sigla: 'CNB',
    uf: '',
    municipio: '',
    website: 'https://www.cnb.org.br',
    descricao: 'Entidade máxima de representação dos tabeliães de notas do Brasil. Coordena o Sistema de Escrituração Digital das Notas (e-Notariado) e representa a classe perante os poderes públicos em âmbito federal.',
    associados: 8300,
    endpointReal: 'https://www.cnb.org.br/api',
  };

  private municipiosCache: Map<string, CnbData> = new Map();

  consultar(uf: string, municipio: string): Observable<CnbResult> {
    const ufUpper = (uf || '').toUpperCase().trim();
    const estado = CNB_MAP[ufUpper] || this.estadoPadrao(ufUpper);
    const cidade = (municipio || '').toUpperCase().trim();
    const munic = this.montaMunicipal(ufUpper, cidade, estado.sigla);
    return of({
      nacional: this.nacional,
      estadual: {
        nivel: 'ESTADUAL' as const,
        uf: ufUpper,
        municipio: '',
        ...estado,
        endpointReal: `${estado.website}/api`,
      },
      municipal: munic,
    }).pipe(delay(0));
  }

  private estadoPadrao(uf: string): CnbEstadualInfo {
    return {
      sigla: `CNB/${uf}`,
      entidade: `Colégio Notarial do Brasil - Seção ${uf}`,
      website: `https://www.cnb${uf.toLowerCase()}.org.br`,
      associados: 0,
      descricao: `Entidade representativa dos tabeliães de notas do Estado.`,
    };
  }

  private montaMunicipal(uf: string, cidade: string, siglaEstado: string): CnbData | null {
    if (!cidade || cidade === '') return null;
    const key = `${uf}-${cidade}`;
    if (this.municipiosCache.has(key)) return this.municipiosCache.get(key)!;
    const capitalNome = CAPITAIS[uf];
    let descricao: string;
    let website: string;
    let associados: number;
    if (cidade === capitalNome) {
      descricao = `Tabeliães de notas da capital ${cidade}/${uf}. Vinculado ao ${siglaEstado}.`;
      website = `https://www.cnb${uf.toLowerCase()}.org.br/capital`;
      associados = Math.round((CNB_MAP[uf]?.associados ?? 50) * 0.4);
    } else {
      descricao = `Tabeliães de notas do município de ${cidade}/${uf}. Vinculado ao ${siglaEstado}.`;
      website = `https://www.cnb${uf.toLowerCase()}.org.br/municipios`;
      associados = Math.max(1, Math.round((CNB_MAP[uf]?.associados ?? 50) * 0.02));
    }
    const data: CnbData = {
      nivel: 'MUNICIPAL',
      entidade: `${siglaEstado} - ${cidade}`,
      sigla: `${siglaEstado}-${cidade.substring(0, 3)}`,
      uf,
      municipio: cidade,
      website,
      descricao,
      associados,
      endpointReal: `https://sistema.cnb.org.br/${uf.toLowerCase()}/municipios/${cidade.toLowerCase().replace(/\s+/g, '-')}`,
    };
    this.municipiosCache.set(key, data);
    return data;
  }
}
