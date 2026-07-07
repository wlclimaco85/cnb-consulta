# CNB Consulta

Consulta de entidades notariais (CNB) e certidões negativas de débito (CND) vinculadas a um CNPJ.

**Stack:** Angular 22 + TypeScript 6 + BrasilAPI (via Browser)

## Funcionalidades

- **Consulta de CNPJ** via [BrasilAPI](https://brasilapi.com.br) — dados completos da empresa
- **CNB Nacional + Estadual + Municipal** — mapper com as 27 seções estaduais do Colégio Notarial do Brasil
- **CND (Certidões Negativas de Débito)** — links diretos para os 5 órgãos:
  - Federal (Receita Federal / PGFN)
  - Estadual (SEFAZ de cada UF)
  - Municipal (ISS)
  - Trabalhista (TST)
  - FGTS (Caixa Econômica Federal)
- **Exportar PDF** — relatório completo com dados da empresa, CNBs e CNDs
- **Responsivo** — funciona em desktop e mobile

## Pré-requisitos

- Node.js 18+ (recomendado 20+)
- npm 9+
- Angular CLI 22+ (`npm install -g @angular/cli`)

## Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/wlclimaco85/cnb-consulta.git
cd cnb-consulta

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
ng serve --open
```

Acesse em `http://localhost:4200`

## Build de produção

```bash
ng build
```

O build será gerado em `dist/cnb-consulta/`.

## Como usar

1. Digite um CNPJ válido (14 dígitos) no campo de busca
2. Clique em "Consultar" ou pressione Enter
3. Os dados da empresa aparecem automaticamente
4. Abaixo, os cards das CNBs (Nacional, Estadual, Municipal)
5. Em seguida, os links para as Certidões Negativas de Débito (CND)
6. Clique em "Exportar PDF" para gerar o relatório completo

## APIs utilizadas

| API | Uso | Limite |
|-----|-----|--------|
| [BrasilAPI](https://brasilapi.com.br) (CNPJ) | Dados cadastrais da empresa | Gratuito, sem limite |
| [Receita Federal](https://solucoes.receita.fazenda.gov.br) | CND Federal | Público |
| [TST](https://www.tst.jus.br) | CND Trabalhista | Público |
| [Caixa/CRF](https://consulta-crf.caixa.gov.br) | FGTS | Público |

**Nota:** As CNDs redirecionam para os portais oficiais de cada órgão. O preenchimento automático do CNPJ funciona nos links da Receita Federal e TST.

## Estrutura do projeto

```
cnb-consulta/
├── src/
│   ├── app/
│   │   ├── models/         # Interfaces e mappers
│   │   ├── services/       # ReceitaService, CnbService, CndService
│   │   ├── app.ts          # Componente principal
│   │   ├── app.html        # Template
│   │   ├── app.css         # Estilos
│   │   └── app.config.ts   # Configuração (HttpClient)
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```

## Licença

MIT
