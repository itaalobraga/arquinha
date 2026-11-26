# Arquinha (MVP)

App "trava tela" para crianças: cada toque na tela faz aparecer um bicho aleatório, que faz o seu barulho.

## Rodar

```bash
npm install
npx expo start
```

Abra no Expo Go (celular) ou aperte `i` / `a` para o simulador.

## Como funciona

- **Início**: tela para os pais, com o botão "Começar a brincar" e dicas.
- **Brincando**: cada toque (com vários dedos ao mesmo tempo) mostra um bicho animado e toca o som dele. O fundo muda de cor e o celular vibra de leve.
- **Trava**: sem nenhum botão na tela. A barra de status fica escondida, a tela não apaga e o "voltar" do Android é ignorado.
- **Saída dos pais**: segurar os dois cantos de cima da tela ao mesmo tempo por 2 segundos volta para a tela inicial. Teste num iPhone de verdade (o simulador não faz dois toques fácil).
- Para travar de verdade, use o Acesso Guiado (iOS) ou a Fixação de tela (Android). Nenhum app consegue bloquear o botão de início sozinho.

## Estrutura

- `src/animals.ts`: lista de bichos (emoji, nome, som)
- `src/sounds.ts`: carrega e toca os sons (expo-audio)
- `src/screens/`: `HomeScreen` e `PlayScreen`
- `src/components/`: `AnimalPop` (animação do bicho)
- `src/credits.ts`: autores e licenças dos sons
- `src/components/AnimatedSplash.tsx`: abertura animada (Lottie) que assume no lugar da splash nativa
- `design/art.mjs`: gera toda a arte (ícones iOS/Android, splash nativa e `assets/lottie/splash.json`). Rode `npm run art` depois de mexer nas formas ou cores.

## Próximos passos

- Sons: 14 gravações reais do Wikimedia Commons (créditos em `src/credits.ts` e na tela de créditos). Ouvir e trocar as que ficarem ruins.
- Trocar os emojis por ilustrações próprias.
