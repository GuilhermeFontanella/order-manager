# Order Manager

## Acessando o cardápio do cliente (storefront)

O cardápio do cliente não fica atrás de uma URL fixa — ele depende de uma **mesa** real, resolvida a partir do link do QR code físico: `/r/:tenantSlug/mesa/:qrCodeToken`. Sem esse link (ou uma sessão de mesa já salva no navegador), a tela de pedido mostra "Mesa não informada".

### Passo a passo para testar localmente

1. **Suba o backend** (Kitchen Service) e garanta que `VITE_API_URL` no front aponte pra ele (padrão: `http://localhost:3000`).
2. **Popule o tenant de demonstração**, se ainda não fez (no repositório do backend):
   ```bash
   npm run tenant:seed-demo -- --slug=pizza-do-joao
   ```
   Rodar de novo reseta os dados (mesas, produtos, pedidos de exemplo) a qualquer momento.
3. **Faça login como staff** para conseguir um token:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"joao@kitchen.local","senha":"demo123"}'
   ```
   Guarde o `accessToken` retornado.
4. **Liste as mesas do tenant** e pegue o `qrCodeToken` de uma delas:
   ```bash
   curl http://localhost:3000/mesas -H "Authorization: Bearer <accessToken>"
   ```
5. **Monte o link da mesa** com o `tenantSlug` (`pizza-do-joao`) e o `qrCodeToken` do passo anterior:
   ```
   http://localhost:5173/r/pizza-do-joao/mesa/<qrCodeToken>
   ```
6. **Abra esse link no navegador** — ou cole em `/scan`, no campo de entrada manual, se preferir simular a leitura do QR. Isso grava a sessão da mesa (`tenantSlug` + `qrCodeToken`) no `localStorage` do navegador e redireciona para `/order`, que carrega a mesa e o cardápio reais via `GET /r/:tenantSlug/mesa/:qrCodeToken`.

Enquanto essa sessão estiver salva, recarregar `/order` continua funcionando sem precisar repetir os passos acima. Para trocar de mesa, use "Escanear outro QR code" ou "Remover mesa" no menu da tela de pedido.

### Credenciais de teste (staff)

| email | senha | papel |
|---|---|---|
| `joao@kitchen.local` | `demo123` | ADMIN |
| `cozinha@kitchen.local` | `cozinha` | COZINHA |
| `balcao@kitchen.local` | `balcao` | ATENDENTE |

### Em produção

O QR code físico de cada mesa deve ser gerado a partir do mesmo `qrCodeToken` (devolvido por `POST /mesas` ou `GET /mesas`), codificando a URL do domínio real do front:

```
https://{dominio-do-front}/r/{tenantSlug}/mesa/{qrCodeToken}
```

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
