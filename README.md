## Sobre

Site de busca, análise e visualização de ativos (Ações, Fiis e ETFs) negociados na bolsa de valores [B3](https://www.b3.com.br/pt_br/).

## Tecnologias

Este projeto foi arquitetado em 4 etapas:

1.  Busca e adequação dos dados:

    - Projeto [dude333/rapina](https://github.com/dude333/rapina) utilizando a linguagem [GO](https://go.dev) Obrigado [dude333](https://github.com/dude333) pelo excelente trabalho e por me ajudar a aprender [GO](https://go.dev) - download e processamento de dados financeiros de empresas brasileiras diretamente da [CVM](https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/DFP/)
    - Projeto fiiparse utilizando a linguagem [Python](https://www.python.org), quando sobrar um tempo vou disponibilizar o código.
    - Projeto stockparse utilizando a linguagem [Python](https://www.python.org), quando sobrar um tempo vou disponibilizar o código.

2. Visualização dos dados:

    - Projeto [roremeol/investdata](https://github.com/roremeol/investdata) utilizado a linguagem (Javascript), Escrito utilizado [Next.js](https://nextjs.org/) e [React](https://react.dev)

3. Automatização

    - Shell scripts para automatização do processo de atualização das informações/dados do sistema

4. Hospedagem

    - Utilizei o [Vercel](https://vercel.com/dashboard)

## Começando

Para rodar este código localmente basta executar:

```bash
npm run dev
# or
yarn dev
```

E abra a página [http://localhost:3000](http://localhost:3000) no browser para ver o resultado.

## Atenção

Como a pasta `data` pode não estar atualizada com as informações dos últimos meses ou anos, pode acontecer de os gráficos e resultados estarem desatualizados e ou errados, no último caso por falha em alguma das etapas do processamento dos dados.