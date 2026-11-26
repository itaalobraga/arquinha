<p align="center">
  <img src=".github/assets/banner.png" alt="Arquinha" width="100%" />
</p>

<p align="center">
  Um app para os pequenos: cada toque na tela traz um bicho, com o som de verdade dele.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/iOS%20%7C%20Android-5B3A1A?style=flat-square" alt="iOS e Android" />
  <img src="https://img.shields.io/badge/Expo%20SDK-58-FF6C3C?style=flat-square" alt="Expo SDK 58" />
</p>

---

## Sobre

O Arquinha é uma tela de brincar para crianças pequenas. Sem menus, sem botões e sem anúncios: a criança toca em qualquer lugar e um bicho aparece pulando, com o som que ele faz. Vale com vários dedos ao mesmo tempo.

Enquanto isso, o celular fica protegido. A tela não apaga, a barra de status some e o "voltar" do Android não faz nada. Só um adulto sai de lá.

## Destaques

- **14 bichos** com gravações reais, do cachorro ao elefante
- **Cada um com seu jeito de se mexer**: quica, chacoalha, pula, bate asas ou cai pesado
- **Cores e vibração leve** a cada toque
- **Sem nada para apertar sem querer** enquanto a criança brinca
- **Respeita "Reduzir movimento"** do sistema
- **Nenhuma permissão sensível**: não usa microfone, câmera nem internet

## Para os pais

Para sair da brincadeira, segure os **dois cantos de cima da tela ao mesmo tempo por 2 segundos**.

Nenhum app consegue bloquear sozinho o botão de início do celular. Para travar de verdade, use o recurso do sistema:

| Sistema | Recurso |
| --- | --- |
| iOS | Ajustes › Acessibilidade › **Acesso Guiado** |
| Android | Configurações › Segurança › **Fixação de tela** |

## Rodando localmente

Pré-requisitos: Node.js LTS e o app Expo Go no celular (ou um simulador).

```bash
npm install
npx expo start
```

Escaneie o QR code com o celular, ou aperte `i` (iOS) ou `a` (Android) para abrir no simulador.

> O gesto de saída usa dois toques ao mesmo tempo. Teste num aparelho de verdade, porque no simulador isso é difícil.

### Scripts

| Comando | O que faz |
| --- | --- |
| `npm start` | Sobe o servidor de desenvolvimento |
| `npm run ios` / `npm run android` | Compila e abre o build nativo |
| `npm run lint` | Roda o ESLint |
| `npm run art` | Gera de novo toda a arte (ícones, splash, animação de abertura e o banner deste README) |

## Estrutura

```
src/
├── animals.ts        # bichos: nome, emoji, movimento e som
├── sounds.ts         # carrega e toca os sons
├── credits.ts        # autores e licenças dos sons
├── theme.ts          # cores e fontes
├── motion.ts         # curvas de animação e "Reduzir movimento"
├── screens/          # Início, Brincar e Créditos
└── components/       # animação dos bichos, splash, gesto de saída...
design/
└── art.mjs           # fonte única de toda a arte do app
```

Toda a arte nasce de uma descrição vetorial em `design/art.mjs`. Depois de mexer em formas ou cores, rode `npm run art`.

## Créditos

Os sons são gravações do [Wikimedia Commons](https://commons.wikimedia.org), em domínio público ou sob licenças Creative Commons. Autores e licenças de cada um estão em [`src/credits.ts`](src/credits.ts) e na tela de créditos do app.

A fonte é a [Fredoka](https://fonts.google.com/specimen/Fredoka), sob a SIL Open Font License.

## Licença

© 2026 Ítalo Braga. Todos os direitos reservados. O código e a arte não podem ser reutilizados sem autorização. Veja [LICENSE](LICENSE).
