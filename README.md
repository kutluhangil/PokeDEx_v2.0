<div align="center">

<img src="docs/media/hero.svg" alt="Pixel-Dex — a retro-futuristic Pokédex with pixel sprites and real cries" width="100%">

<p>
  <a href="https://pixel-dex-psi.vercel.app"><img alt="Live demo" src="https://img.shields.io/badge/live%20demo-boot%20the%20dex-ff4d6d?style=for-the-badge&labelColor=05060f"></a>
  <img alt="PokéAPI" src="https://img.shields.io/badge/data-Pok%C3%A9API-5cf2ff?style=for-the-badge&labelColor=05060f">
  <img alt="Firestore" src="https://img.shields.io/badge/Firestore-trainer%20charts-ffe14d?style=for-the-badge&labelColor=05060f">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-ff4d6d?style=for-the-badge&labelColor=05060f">
</p>

<p><em>A retro-futuristic Pokédex: animated pixel sprites, cinematic parallax, a glowing neon UI and real Pokémon cries,<br>
in a fast, mobile-first React app.</em></p>

<a href="https://pixel-dex-psi.vercel.app"><img src="docs/screenshots/explore-hero.png" alt="The cinematic explore hero with legendaries" width="100%"></a>

</div>

<img src="docs/media/divider.svg" width="100%" alt="">

## What's inside

| | |
|---|---|
| **Cinematic Pokédex** | A parallax hero, an intro boot animation and a featured carousel of legendaries. |
| **Search and filters** | Instant search by name or number, filtered by type, generation, legendary and mythical. |
| **Deep detail view** | Base stats, abilities, evolution map, move set, size and Pokédex lore. |
| **Real cries** | Every entry plays its authentic cry, with retro UI sound effects. |
| **Trainer Charts** | A global leaderboard of the most-viewed Pokémon, kept in Firebase Firestore. |
| **Who's That Pokémon?** | A silhouette-and-cry quiz with score, streak and high-score tracking. |
| **Team builder** | A six-slot dream team with live type-matchup awareness. |
| **Shiny mode** | One toggle flips every sprite, card and artwork to its shiny variant. |
| **Retro themes** | *Neon* and *Ultra-Retro* themes, an optional CRT scanline effect and hand-made 8-bit icons for all 18 types. |
| **Deep links** | Share any Pokémon at `/pokemon/:id`. |

<table>
  <tr>
    <td width="33%"><img src="docs/screenshots/explore-grid.png" alt="The explore grid"></td>
    <td width="33%"><img src="docs/screenshots/detail.png" alt="A detail page with stats"></td>
    <td width="33%"><img src="docs/screenshots/quiz.png" alt="Who's That Pokémon quiz"></td>
  </tr>
  <tr>
    <td align="center"><code>explore</code> · every species</td>
    <td align="center"><code>detail</code> · stats and lore</td>
    <td align="center"><code>quiz</code> · silhouette + cry</td>
  </tr>
</table>

<img src="docs/media/divider.svg" width="100%" alt="">

## How it fits together

```mermaid
flowchart LR
  API[PokéAPI] --> Q[Query cache]
  Q --> UI[Explore · Detail · Team · Quiz]
  UI --> V[View event] --> FS[(Firestore<br/>trainer charts)]
  FS --> LB[Global leaderboard]
  CTX[Theme · shiny · sound contexts] --> UI
```

<img src="docs/media/divider.svg" width="100%" alt="">

## Türkçe özet

**Pixel-Dex**, tüm Pokémon'ları tek bir sinematik panelden keşfetmeni sağlayan retro-fütüristik bir Pokédex. Animasyonlu piksel spritelar, gerçek Pokémon sesleri, parlak (shiny) mod, CRT efektli retro temalar ve "Bu Pokémon kim?" oyunu var. En çok görüntülenen Pokémon'lar Firestore üzerinde global bir sıralamada tutuluyor. Mobil öncelikli; giriş gerekmiyor.

<img src="docs/media/divider.svg" width="100%" alt="">

## Development

```sh
npm install
npm run dev      # http://localhost:8080
npm test         # vitest
npm run build
firebase deploy --only firestore:rules   # leaderboard rules
```

```
src/components/  hero, cards, detail, team, quiz, type icons
src/contexts/    theme, shiny mode, sound
src/lib/         PokéAPI client, Firestore leaderboard
src/pages/       routes including /pokemon/:id
```

<div align="center">
<br>
<a href="https://github.com/kutluhangil"><img src="docs/media/signature.svg" width="100%" alt="Built by kutluhangil"></a>
<sub>Unofficial fan project · data from PokéAPI · Pokémon and all related names belong to Nintendo, Game Freak and The Pokémon Company.</sub>
</div>
