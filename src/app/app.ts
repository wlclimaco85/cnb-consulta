import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ReceitaService } from './services/receita.service';
import { CnbService } from './services/cnb.service';
import { CndService } from './services/cnd.service';
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
  readonly relatorioEl = viewChild<ElementRef<HTMLDivElement>>('relatorio');

  cnpj = signal('');
  loading = signal(false);
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
    this.error.set('');
    this.empresa.set(null);
    this.resultado.set(null);
    this.certidoes.set([]);

    this.receitaService.consultar(raw).subscribe({
      next: (emp) => {
        if (!emp) {
          this.error.set('CNPJ inválido');
          this.loading.set(false);
          return;
        }
        this.empresa.set(emp);
        this.cnbService.consultar(emp.uf, emp.municipio).subscribe({
          next: (res) => {
            this.resultado.set(res);
            this.loading.set(false);
          },
          error: (err2) => {
            this.error.set('Erro ao buscar CNBs: ' + (err2.message || err2));
            this.loading.set(false);
          }
        });
        this.cndService.consultar(emp.cnpj, emp.uf, emp.municipio).subscribe({
          next: (lista) => this.certidoes.set(lista),
        });
      },
      error: (err) => {
        this.error.set('Erro: ' + (err.message || err));
        this.loading.set(false);
      }
    });
  }

  async gerarPdf() {
    const el = this.relatorioEl();
    if (!el) return;
    this.exportando.set(true);
    try {
      const canvas = await html2canvas(el.nativeElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      let heightLeft = pdfH;
      let position = 0;
      const pageH = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - pdfH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH);
        heightLeft -= pageH;
      }
      const nome = this.empresa()?.nome?.replace(/[^a-zA-Z0-9]/g, '_') || 'relatorio';
      pdf.save(`Relatorio_${nome}.pdf`);
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
