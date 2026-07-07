import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CndInfo } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CndService {

  consultar(cnpj: string, uf: string, municipio: string): Observable<CndInfo[]> {
    const ufLower = (uf || '').toLowerCase();
    const lista: CndInfo[] = [
      {
        tipo: 'Federal',
        orgao: 'Receita Federal / PGFN',
        descricao: 'Certidão Conjunta de Débitos (RFB + PGFN) — consultar/emitir',
        url: 'https://servicos.receitafederal.gov.br/servico/certidoes',
        icone: 'governo',
      },
      {
        tipo: 'Estadual',
        orgao: `SEFAZ ${uf}`,
        descricao: 'Certidão de Débitos Tributários (CDT) — emitir sem login',
        url: this.urlEstadual(ufLower),
        icone: 'governo',
      },
      {
        tipo: 'Trabalhista',
        orgao: 'Tribunal Superior do Trabalho (TST)',
        descricao: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
        url: 'https://www.tst.jus.br/certidao',
        icone: 'governo',
      },
      {
        tipo: 'FGTS',
        orgao: 'Caixa Econômica Federal',
        descricao: 'Certificado de Regularidade do FGTS (CRF) — emitir',
        url: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
        icone: 'governo',
      },
      {
        tipo: 'Correcional',
        orgao: 'Controladoria-Geral da União (CGU)',
        descricao: 'Certidão Negativa Correcional — CEIS, CNEP, CEPIM',
        url: 'https://certidoes.cgu.gov.br/',
        icone: 'governo',
      },
    ];
    return of(lista).pipe(delay(0));
  }

  private urlEstadual(uf: string): string {
    const urls: Record<string, string> = {
      ac: 'https://www.sefaz.ac.gov.br',
      al: 'https://certidao.sefaz.al.gov.br',
      ap: 'https://www.sefaz.ap.gov.br',
      am: 'https://www.sefaz.am.gov.br',
      ba: 'https://www.sefaz.ba.gov.br',
      ce: 'https://www.sefaz.ce.gov.br',
      df: 'https://www.receita.df.gov.br',
      es: 'https://www.sefaz.es.gov.br',
      go: 'https://www.sefaz.go.gov.br',
      ma: 'https://www.sefaz.ma.gov.br',
      mt: 'https://www.sefaz.mt.gov.br',
      ms: 'https://www.sefaz.ms.gov.br',
      mg: 'https://www2.fazenda.mg.gov.br/sol/ctrl/SOL/CDT/SERVICO_829?ACAO=INICIAR',
      pa: 'https://www.sefaz.pa.gov.br',
      pb: 'https://www.sefaz.pb.gov.br',
      pr: 'https://www.fazenda.pr.gov.br',
      pe: 'https://www.sefaz.pe.gov.br',
      pi: 'https://www.sefaz.pi.gov.br',
      rj: 'https://www.fazenda.rj.gov.br',
      rn: 'https://www.set.rn.gov.br',
      rs: 'https://www.sefaz.rs.gov.br',
      ro: 'https://www.sefaz.ro.gov.br',
      rr: 'https://www.sefaz.rr.gov.br',
      sc: 'https://www.sefaz.sc.gov.br',
      sp: 'https://www.certidoes.fazenda.sp.gov.br',
      se: 'https://www.sefaz.se.gov.br',
      to: 'https://www.sefaz.to.gov.br',
    };
    return urls[uf] || `https://www.sefaz.${uf}.gov.br`;
  }
}
