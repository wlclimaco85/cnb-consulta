import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReceitaService } from './services/receita.service';
import { CnbService } from './services/cnb.service';
import { CndService } from './services/cnd.service';
import { CertificadoPdfService } from './services/certificado-pdf.service';
import { CnpjResponse, CnbResult, CndInfo } from './models/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private receitaService = inject(ReceitaService);
  private cnbService = inject(CnbService);
  private cndService = inject(CndService);
  private certPdf = inject(CertificadoPdfService);

  cnpj = signal('');
  loading = signal(false);
  statusMsg = signal('');
  exportando = signal(false);
  error = signal('');
  empresa = signal<CnpjResponse | null>(null);
  resultado = signal<CnbResult | null>(null);
  certidoes = signal<CndInfo[]>([]);
  consultar() {
    const raw = this.cnpj();
    if (!raw || raw.replace(/\D/g, '').length !== 14) {
      this.error.set('Digite um CNPJ válido com 14 dígitos');
      return;
    }
    this.loading.set(true);
    this.statusMsg.set('Consultando CNPJ...');
    this.error.set('');
    this.empresa.set(null);
    this.resultado.set(null);
    this.certidoes.set([]);

    this.receitaService.consultar(raw).subscribe({
      next: (emp) => {
        if (!emp) {
          this.error.set('CNPJ inválido');
          this.loading.set(false);
          this.statusMsg.set('');
          return;
        }
        this.empresa.set(emp);
        this.statusMsg.set('Consultando CNBs...');

        let pendente = 2;

        this.cnbService.consultar(emp.uf, emp.municipio).subscribe({
          next: (res) => {
            this.resultado.set(res);
            this.statusMsg.set('Consultando CNDs...');
            if (--pendente === 0) { this.loading.set(false); this.statusMsg.set(''); }
          },
          error: () => {
            if (--pendente === 0) { this.loading.set(false); this.statusMsg.set(''); }
          }
        });

        this.cndService.consultar(emp.cnpj, emp.uf, emp.municipio).subscribe({
          next: (lista) => {
            this.certidoes.set(lista);
            if (--pendente === 0) { this.loading.set(false); this.statusMsg.set(''); }
          },
          error: () => {
            if (--pendente === 0) { this.loading.set(false); this.statusMsg.set(''); }
          }
        });
      },
      error: (err) => {
        this.error.set('Erro: ' + (err.message || err));
        this.loading.set(false);
        this.statusMsg.set('');
      }
    });
  }

  gerarPdf() {
    const emp = this.empresa();
    const res = this.resultado();
    const certs = this.certidoes();
    if (!emp) return;
    this.exportando.set(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let y = margin;

      const corPrimaria: [number, number, number] = [0.38, 0.42, 0.95];
      const corCinza: [number, number, number] = [0.4, 0.4, 0.4];
      const corClaro: [number, number, number] = [0.95, 0.95, 0.97];

      // === CABEÇALHO ===
      pdf.setFontSize(22);
      pdf.setTextColor(...corPrimaria);
      pdf.text('RELATÓRIO DE VINCULAÇÃO', margin, y);
      y += 8;
      pdf.setFontSize(16);
      pdf.text('CNB e CND', margin, y);
      y += 12;

      pdf.setFontSize(9);
      pdf.setTextColor(...corCinza);
      pdf.text(`CNPJ consultado: ${emp.cnpj}`, margin, y);
      const hoje = new Date().toLocaleDateString('pt-BR');
      pdf.text(`Gerado em: ${hoje}`, pageW - margin - pdf.getTextWidth(`Gerado em: ${hoje}`), y);
      y += 4;

      pdf.setDrawColor(...corPrimaria);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageW - margin, y);
      y += 8;

      // === SEÇÃO 1: DADOS DA EMPRESA ===
      pdf.setFontSize(14);
      pdf.setTextColor(...corPrimaria);
      pdf.text('1. Dados da Empresa', margin, y);
      y += 6;

      autoTable(pdf, {
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: corPrimaria, fontSize: 9, textColor: [1, 1, 1] },
        bodyStyles: { fontSize: 9, textColor: [0.1, 0.1, 0.1] },
        alternateRowStyles: { fillColor: corClaro },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { cellWidth: 'auto' } },
        body: [
          ['CNPJ', emp.cnpj],
          ['Razão Social', emp.nome],
          ['Nome Fantasia', emp.fantasia || '—'],
          ['Inscrição Estadual', emp.inscricao_estadual || '—'],
          ['Situação', emp.situacao],
          ['Endereço', `${emp.logradouro}, ${emp.numero}${emp.complemento ? ' - ' + emp.complemento : ''} - ${emp.bairro}`],
          ['Município / UF', `${emp.municipio} / ${emp.uf}`],
          ['CEP', emp.cep],
          ['Telefone', emp.telefone || '—'],
          ['E-mail', emp.email || '—'],
          ['Natureza Jurídica', emp.natureza_juridica],
          ['Atividade Principal', emp.atividade_principal?.[0]?.text || '—'],
        ],
      });
      y = (pdf as any).lastAutoTable.finalY + 10;

      // === SEÇÃO 2: CNBs ===
      if (res) {
        pdf.setFontSize(14);
        pdf.setTextColor(...corPrimaria);
        pdf.text('2. Entidades Notariais Vinculadas (CNB)', margin, y);
        y += 6;

        const cnbRows: any[][] = [];
        if (res.nacional) cnbRows.push(['Nacional', res.nacional.sigla, res.nacional.entidade, res.nacional.website]);
        if (res.estadual) cnbRows.push(['Estadual', res.estadual.sigla, res.estadual.entidade, res.estadual.website]);
        if (res.municipal) cnbRows.push(['Municipal', res.municipal.sigla, res.municipal.entidade, res.municipal.website]);

        autoTable(pdf, {
          startY: y,
          theme: 'grid',
          head: [['Nível', 'Sigla', 'Entidade', 'Site']],
          headStyles: { fillColor: corPrimaria, fontSize: 8, textColor: [1, 1, 1] },
          bodyStyles: { fontSize: 8, textColor: [0.1, 0.1, 0.1] },
          alternateRowStyles: { fillColor: corClaro },
          columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 22 }, 2: { cellWidth: 'auto' }, 3: { cellWidth: 60 } },
          body: cnbRows,
        });
        y = (pdf as any).lastAutoTable.finalY + 10;
      }

      // === SEÇÃO 3: CNDs ===
      if (certs.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(...corPrimaria);
        pdf.text('3. Certidões Negativas de Débito (CND)', margin, y);
        y += 6;

        const cndRows = certs.map(c => [c.tipo, c.orgao, c.descricao, c.url]);

        autoTable(pdf, {
          startY: y,
          theme: 'grid',
          head: [['Tipo', 'Órgão', 'Descrição', 'Link para consulta']],
          headStyles: { fillColor: corPrimaria, fontSize: 8, textColor: [1, 1, 1] },
          bodyStyles: { fontSize: 7.5, textColor: [0.1, 0.1, 0.1] },
          alternateRowStyles: { fillColor: corClaro },
          columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 40 }, 2: { cellWidth: 'auto' }, 3: { cellWidth: 55 } },
          body: cndRows,
          didParseCell: (data) => {
            if (data.column.index === 3 && data.cell.raw) {
              data.cell.styles.textColor = [99, 102, 241];
            }
          },
        });
        y = (pdf as any).lastAutoTable.finalY + 10;
      }

      // === RODAPÉ da página de resumo ===
      if (y > pageH - 25) pdf.addPage();
      const footerY = pageH - 15;
      pdf.setDrawColor(...corPrimaria);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 3, pageW - margin, footerY - 3);
      pdf.setFontSize(7);
      pdf.setTextColor(...corCinza);
      pdf.text(`Relatório gerado em ${hoje} via CNB Consulta`, margin, footerY + 3);
      pdf.text(`CNPJ: ${emp.cnpj}`, pageW - margin - pdf.getTextWidth(`CNPJ: ${emp.cnpj}`), footerY + 3);

      // === CERTIFICADOS OFICIAIS (6 páginas) ===
      this.certPdf.gerarCertificados(pdf, emp);

      const nomeArquivo = emp.nome.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40);
      pdf.save(`RELATORIO_CNB_CND_${nomeArquivo}.pdf`);
    } catch (e) {
      this.error.set('Erro ao gerar PDF: ' + (e instanceof Error ? e.message : e));
    } finally {
      this.exportando.set(false);
    }
  }

  mascaraCnpj(v: string) {
    v = v.replace(/\D/g, '').substring(0, 14);
    if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})$/, '$1.$2.$3/$4');
    else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{0,3})$/, '$1.$2.$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,3})$/, '$1.$2');
    this.cnpj.set(v);
  }
}
