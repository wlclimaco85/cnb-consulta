import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry, delay, map } from 'rxjs/operators';
import { CnpjResponse, mapBrasilApiToCnpj } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReceitaService {
  private http = inject(HttpClient);
  private apiUrl = 'https://brasilapi.com.br/api/cnpj/v1';

  consultar(cnpj: string): Observable<CnpjResponse | null> {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) return of(null);
    return this.http.get<any>(`${this.apiUrl}/${cnpjLimpo}`).pipe(
      retry(1),
      delay(500),
      map(data => mapBrasilApiToCnpj(data)),
      catchError((err) => {
        return throwError(() => new Error(
          'Falha ao consultar BrasilAPI. CNPJ inválido ou serviço temporariamente indisponível.'
        ));
      })
    );
  }
}
