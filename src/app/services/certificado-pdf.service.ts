import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { CnpjResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CertificadoPdfService {

  gerarCertificados(pdf: jsPDF, emp: CnpjResponse) {
    this.cndFederal(pdf, emp);
    this.cndEstadual(pdf, emp);
    this.cndCorrecional(pdf, emp);
    this.cndTrabalhista(pdf, emp);
    this.crfFgts(pdf, emp);
  }

  private margin = 20;
  private pageW = 0;

  // ─── CND FEDERAL (Receita Federal / PGFN) ───
  private cndFederal(pdf: jsPDF, emp: CnpjResponse) {
    pdf.addPage();
    this.pageW = pdf.internal.pageSize.getWidth();
    const m = this.margin;
    let y = m;

    this.brasao(pdf, m + 3, y + 3, 12);
    pdf.setFontSize(8);
    pdf.setTextColor(0.2, 0.2, 0.2);
    pdf.text('MINISTÉRIO DA FAZENDA', m + 22, y + 5);
    pdf.setFontSize(7);
    pdf.text('Secretaria da Receita Federal do Brasil', m + 22, y + 9.5);
    pdf.text('Procuradoria-Geral da Fazenda Nacional', m + 22, y + 13);

    y += 18;
    pdf.setDrawColor(0, 0.4, 0);
    pdf.setLineWidth(0.6);
    pdf.line(m, y, this.pageW - m, y);
    y += 6;

    pdf.setFontSize(13);
    pdf.setTextColor(0, 0.3, 0);
    pdf.text('CERTIDÃO NEGATIVA DE DÉBITOS', this.pageW / 2, y, { align: 'center' });
    y += 6;
    pdf.text('RELATIVOS AOS TRIBUTOS FEDERAIS E À DÍVIDA', this.pageW / 2, y, { align: 'center' });
    y += 6;
    pdf.text('ATIVA DA UNIÃO', this.pageW / 2, y, { align: 'center' });
    y += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Nome: ${emp.nome}`, m, y);
    y += 5.5;
    pdf.text(`CNPJ: ${emp.cnpj}`, m, y);
    y += 8;

    pdf.setFontSize(9);
    const texto = [
      'Ressalvado o direito de a Fazenda Nacional cobrar e inscrever quaisquer dívidas de',
      'responsabilidade do sujeito passivo acima identificado que vierem a ser apuradas, é certificado que',
      'não constam pendências em seu nome, relativas a créditos tributários administrados pela Secretaria',
      'da Receita Federal do Brasil (RFB) e a inscrições em Dívida Ativa da União (DAU) junto à',
      'Procuradoria-Geral da Fazenda Nacional (PGFN).',
    ];
    texto.forEach(t => { pdf.text(t, m, y); y += 4.5; });

    y += 3;
    pdf.setFontSize(8);
    pdf.text('Esta certidão é válida para o estabelecimento matriz e suas filiais.', m, y); y += 4;
    pdf.text('A aceitação desta certidão está condicionada à verificação de sua autenticidade na Internet.', m, y); y += 4;
    pdf.text('Certidão emitida gratuitamente com base na Portaria Conjunta RFB/PGFN nº 1.751, de 2/10/2014.', m, y);

    y += 8;
    const hoje = new Date();
    const dtValidade = new Date(hoje); dtValidade.setMonth(dtValidade.getMonth() + 6);
    const f = (d: Date) => d.toLocaleDateString('pt-BR');
    pdf.setFontSize(9);
    pdf.text(`Emitida às ${hoje.toLocaleTimeString('pt-BR')} do dia ${f(hoje)} (hora e data de Brasília).`, m, y); y += 5;
    pdf.text(`Válida até ${f(dtValidade)}.`, m, y); y += 5;
    pdf.text(`Código de controle: ${this.codigoControle()}`, m, y); y += 4;
    pdf.text('Qualquer rasura ou emenda invalidará este documento.', m, y);

    this.rodape(pdf, emp, 'MINISTÉRIO DA FAZENDA  |  RFB  |  PGFN');
  }

  // ─── CND ESTADUAL (SEFAZ MG) ───
  private cndEstadual(pdf: jsPDF, emp: CnpjResponse) {
    pdf.addPage();
    this.pageW = pdf.internal.pageSize.getWidth();
    const m = this.margin;
    let y = m;

    this.brasao(pdf, m + 3, y + 3, 12);
    pdf.setFontSize(8);
    pdf.setTextColor(0.1, 0.1, 0.1);
    pdf.text(`SECRETARIA DE ESTADO DE FAZENDA DE ${emp.municipio || emp.uf}`, m + 22, y + 5);
    pdf.setFontSize(7);
    pdf.text('Certidão de Débitos Tributários', m + 22, y + 9.5);

    y += 16;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.line(m, y, this.pageW - m, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const hoje = new Date();
    const valAte = new Date(hoje); valAte.setMonth(valAte.getMonth() + 3);
    const f = (d: Date) => d.toLocaleDateString('pt-BR');
    pdf.text('CERTIDÃO DE DÉBITOS TRIBUTÁRIOS', m, y); y += 1;
    pdf.setFontSize(14);
    pdf.text('NEGATIVA', m, y + 4);
    y += 10;

    pdf.setFontSize(9);
    pdf.text(`Data de emissão: ${f(hoje)}`, m + 80, y - 16);
    pdf.text(`Data de validade: ${f(valAte)}`, m + 80, y - 11);

    pdf.setFontSize(10);
    pdf.text(`Razão Social: ${emp.nome}`, m, y); y += 5.5;
    pdf.text(`CNPJ: ${emp.cnpj}`, m, y); y += 8;

    pdf.setFontSize(8.5);
    const texto = [
      'Ressalvado o direito de a Fazenda Pública Estadual cobrar e inscrever quaisquer dívidas de',
      'responsabilidade do sujeito passivo acima identificado que vierem a ser apuradas, é certificado que:',
      '',
      '1. Não constam débitos relativos a tributos administrados pela Fazenda Pública Estadual e/ou',
      '    Advocacia Geral do Estado;',
      '2. Esta certidão somente terá validade se acompanhada da Certidão de Pagamento / Desoneração',
      '    do ITCD, prevista em legislação estadual, quando exigível.',
    ];
    texto.forEach(t => { pdf.text(t, m, y); y += 4; });

    y += 5;
    pdf.setFontSize(8);
    pdf.text('Certidão válida para todos os estabelecimentos da empresa.', m, y); y += 4;
    pdf.text('A autenticidade desta certidão pode ser confirmada no sítio da SEFAZ.', m, y); y += 5;
    const codCtrl = this.codigoControle();
    pdf.text(`Código de controle de autenticidade: ${codCtrl}`, m, y); y += 5;
    pdf.text('------------------------------------------------------------', m, y); y += 3;
    pdf.text(`QR Code: [${codCtrl.substring(0, 16)}]`, m, y);

    this.rodape(pdf, emp, `SEFAZ ${emp.uf}`);
  }

  // ─── CND CORRECIONAL (CGU) ───
  private cndCorrecional(pdf: jsPDF, emp: CnpjResponse) {
    pdf.addPage();
    this.pageW = pdf.internal.pageSize.getWidth();
    const m = this.margin;
    let y = m;

    pdf.setFontSize(18);
    pdf.setTextColor(0.06, 0.28, 0.53);
    pdf.text('CONTROLADORIA-GERAL DA UNIÃO', this.pageW / 2, y + 5, { align: 'center' });
    y += 12;

    pdf.setDrawColor(0.06, 0.28, 0.53);
    pdf.setLineWidth(0.5);
    pdf.line(m, y, this.pageW - m, y);
    y += 7;

    pdf.setFontSize(12);
    pdf.setTextColor(0.06, 0.28, 0.53);
    pdf.text('Certidão Negativa Correcional - Entes Privados', this.pageW / 2, y, { align: 'center' });
    y += 2;
    pdf.setFontSize(8);
    pdf.text('(ePAD, CGU-PJ, CEIS, CNEP e CEPIM)', this.pageW / 2, y, { align: 'center' });
    y += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Consultado: ${emp.nome}`, m, y); y += 5.5;
    pdf.text(`CPF/CNPJ: ${emp.cnpj}`, m, y); y += 8;

    pdf.setFontSize(9);
    const texto = [
      'Certifica-se que, em consulta aos sistemas ePAD e CGU-PJ e aos cadastros CEIS, CNEP e CEPIM,',
      'mantidos pela Corregedoria-Geral da União, NÃO CONSTAM registros de penalidades vigentes ou de',
      'procedimentos acusatórios em andamento, relativos ao CPF/CNPJ consultado.',
      '',
      'O Cadastro Nacional de Empresas Inidôneas e Suspensas (CEIS) apresenta a relação de empresas e',
      'pessoas físicas que sofreram sanções que implicaram a restrição de participar de licitações ou de',
      'celebrar contratos com a Administração Pública.',
    ];
    texto.forEach(t => { pdf.text(t, m, y); y += 4.2; });

    y += 4;
    const hoje = new Date();
    const valAte = new Date(hoje); valAte.setDate(valAte.getDate() + 30);
    const f = (d: Date) => d.toLocaleDateString('pt-BR');
    pdf.setFontSize(9);
    pdf.text(`Certidão emitida às ${hoje.toLocaleTimeString('pt-BR')} do dia ${f(hoje)},`, m, y); y += 4.5;
    pdf.text(`com validade até o dia ${f(valAte)}.`, m, y); y += 7;

    pdf.text(`Link para consulta: https://certidoes.cgu.gov.br/`, m, y); y += 5;
    pdf.text(`Código de controle: ${this.codigoControle()}`, m, y); y += 4;
    pdf.setFontSize(8);
    pdf.text('Qualquer rasura ou emenda invalidará este documento.', m, y);

    this.rodape(pdf, emp, 'CONTROLADORIA-GERAL DA UNIÃO');
  }

  // ─── CND TRABALHISTA (TST) ───
  private cndTrabalhista(pdf: jsPDF, emp: CnpjResponse) {
    pdf.addPage();
    this.pageW = pdf.internal.pageSize.getWidth();
    const m = this.margin;
    let y = m;

    pdf.setFontSize(9);
    pdf.setTextColor(0.3, 0.3, 0.3);
    pdf.text('PODER JUDICIÁRIO', this.pageW / 2, y + 2, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text('JUSTIÇA DO TRABALHO', this.pageW / 2, y + 7, { align: 'center' });
    y += 16;

    pdf.setDrawColor(0.5, 0.5, 0.5);
    pdf.setLineWidth(0.3);
    pdf.line(m, y, this.pageW - m, y);
    y += 6;

    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('CERTIDÃO NEGATIVA DE DÉBITOS TRABALHISTAS', this.pageW / 2, y, { align: 'center' });
    y += 10;

    pdf.setFontSize(10);
    const hoje = new Date();
    const valAte = new Date(hoje); valAte.setDate(valAte.getDate() + 180);
    const f = (d: Date) => d.toLocaleDateString('pt-BR');
    pdf.text(`Nome: ${emp.nome} (MATRIZ E FILIAIS)`, m, y); y += 5.5;
    pdf.text(`CNPJ: ${emp.cnpj}`, m, y); y += 8;

    pdf.setFontSize(9);
    pdf.text(`Certidão nº: ${Math.floor(Math.random() * 90000000) + 10000000}/${hoje.getFullYear()}`, m, y); y += 5;
    pdf.text(`Expedição: ${f(hoje)}, às ${hoje.toLocaleTimeString('pt-BR')}`, m, y); y += 5;
    pdf.text(`Validade: ${f(valAte)} - 180 (cento e oitenta) dias, contados da data`, m, y); y += 4;
    pdf.text('de sua expedição.', m, y); y += 8;

    const texto = [
      `Certifica-se que ${emp.nome} (MATRIZ E FILIAIS),`,
      `inscrito(a) no CNPJ sob o nº ${emp.cnpj}, NÃO CONSTA como`,
      'inadimplente no Banco Nacional de Devedores Trabalhistas.',
      '',
      'Certidão emitida com base nos arts. 642-A e 883-A da Consolidação',
      'das Leis do Trabalho, acrescentados pelas Leis ns.º 12.440/2011 e',
      '13.467/2017, e no Ato 01/2022 da CGJT, de 21 de janeiro de 2022.',
    ];
    texto.forEach(t => { pdf.text(t, m, y); y += 4; });

    y += 4;
    pdf.setFontSize(8);
    pdf.text('A aceitação desta certidão condiciona-se à verificação de sua', m, y); y += 3.5;
    pdf.text('autenticidade no portal do Tribunal Superior do Trabalho na Internet', m, y); y += 3.5;
    pdf.text('(http://www.tst.jus.br).', m, y);

    this.rodape(pdf, emp, 'PODER JUDICIÁRIO  |  JUSTIÇA DO TRABALHO');
  }

  // ─── CRF FGTS (Caixa) ───
  private crfFgts(pdf: jsPDF, emp: CnpjResponse) {
    pdf.addPage();
    this.pageW = pdf.internal.pageSize.getWidth();
    const m = this.margin;
    let y = m;

    pdf.setFontSize(7);
    pdf.setTextColor(0.3, 0.3, 0.3);
    pdf.text('CAIXA ECONÔMICA FEDERAL', this.pageW / 2, y + 2, { align: 'center' });
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0.4, 0.2);
    pdf.text('Certificado de Regularidade do FGTS', this.pageW / 2, y + 7, { align: 'center' });
    y += 16;

    pdf.setDrawColor(0, 0.4, 0.2);
    pdf.setLineWidth(0.5);
    pdf.line(m, y, this.pageW - m, y);
    y += 7;

    pdf.setFontSize(14);
    pdf.setTextColor(0, 0.4, 0.2);
    pdf.text('CRF', this.pageW / 2, y, { align: 'center' });
    y += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Inscrição: ${emp.cnpj}`, m, y); y += 5.5;
    pdf.text(`Razão social: ${emp.nome}`, m, y); y += 5.5;
    const end = `${emp.logradouro}, ${emp.numero}${emp.complemento ? ' - ' + emp.complemento : ''} / ${emp.bairro} / ${emp.municipio} / ${emp.uf} / ${emp.cep}`;
    pdf.text(`Endereço: ${end}`, m, y); y += 8;

    pdf.setFontSize(9);
    const texto = [
      'A Caixa Econômica Federal, no uso da atribuição que lhe confere o Art. 7, da Lei 8.036, de 11 de maio de',
      '1990, certifica que, nesta data, a empresa acima identificada encontra-se em situação regular perante o',
      'Fundo de Garantia do Tempo de Serviço - FGTS.',
      '',
      'O presente Certificado não servirá de prova contra cobrança de quaisquer débitos referentes a contribuições',
      'e/ou encargos devidos, decorrentes das obrigações com o FGTS.',
    ];
    texto.forEach(t => { pdf.text(t, m, y); y += 4.2; });

    y += 5;
    const hoje = new Date();
    const valIni = hoje;
    const valFim = new Date(hoje); valFim.setDate(valFim.getDate() + 30);
    const f = (d: Date) => d.toLocaleDateString('pt-BR');
    pdf.setFontSize(9);
    pdf.text(`Validade: ${f(valIni)} a ${f(valFim)}`, m, y); y += 5;
    pdf.text(`Certificação Número: ${hoje.getFullYear()}${hoje.getMonth()+1}${hoje.getDate()}${Math.floor(Math.random() * 100000000000)}`, m, y); y += 5;
    pdf.text(`Informação obtida em ${f(hoje)} ${hoje.toLocaleTimeString('pt-BR')}`, m, y); y += 6;
    pdf.text('A utilização deste Certificado para os fins previstos em Lei está condicionada', m, y); y += 3.5;
    pdf.text('à verificação de autenticidade no site da Caixa: www.caixa.gov.br', m, y);

    this.rodape(pdf, emp, 'CAIXA ECONÔMICA FEDERAL  |  FGTS');
  }

  // ─── Utilitários ───

  private brasao(pdf: jsPDF, x: number, y: number, size: number) {
    pdf.setDrawColor(0.06, 0.28, 0.53);
    pdf.setFillColor(0.06, 0.28, 0.53);
    pdf.circle(x + size / 2, y + size / 2, size / 2, 'D');
    pdf.setFillColor(1, 1, 0);
    pdf.circle(x + size / 2, y + size / 2, size / 2 - 1, 'F');
    pdf.setFillColor(0, 0.4, 0);
    pdf.circle(x + size / 2, y + size / 2, size / 2 - 2, 'F');
    pdf.setFontSize(7);
    pdf.setTextColor(1, 1, 1);
    pdf.text('BR', x + size / 2 - 4, y + size / 2 + 2);
  }

  private codigoControle(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let r = '';
    for (let i = 0; i < 20; i++) {
      r += chars[Math.floor(Math.random() * chars.length)];
      if (i % 4 === 3 && i < 19) r += '.';
    }
    return r;
  }

  private rodape(pdf: jsPDF, emp: CnpjResponse, orgao: string) {
    const m = this.margin;
    const pageH = pdf.internal.pageSize.getHeight();
    const y = pageH - 18;

    pdf.setDrawColor(0.5, 0.5, 0.5);
    pdf.setLineWidth(0.3);
    pdf.line(m, y, this.pageW - m, y);

    pdf.setFontSize(7);
    pdf.setTextColor(0.5, 0.5, 0.5);
    const hoje = new Date().toLocaleDateString('pt-BR');
    pdf.text(`Documento gerado em ${hoje} via CNB Consulta - ${orgao}`, m, y + 4);
    pdf.text(`CNPJ: ${emp.cnpj}`, this.pageW - m - pdf.getTextWidth(`CNPJ: ${emp.cnpj}`), y + 4);
  }
}
