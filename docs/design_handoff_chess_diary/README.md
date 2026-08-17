# Handoff: Chess Diary — dark theme UI (homepage + wszystkie widoki aplikacji)

## Overview
Kompletny design aplikacji Chess Diary (blog szachowy "My Chess Journey"): strona główna z interaktywną szachownicą 3D oraz wszystkie widoki aplikacji (login, turnieje, partie, import PGN, widok gry z adnotacjami i sideline'ami) w spójnym dark theme z czerwonym akcentem.

## About the Design Files
Pliki w tym pakiecie to **referencje designu wykonane w HTML** — prototypy pokazujące docelowy wygląd i zachowanie, NIE kod produkcyjny do skopiowania. Zadanie polega na **odtworzeniu tych designów w istniejącym codebase** (Next.js + shadcn/ui + Supabase), używając istniejących komponentów shadcn (Button, Input, Table itd.) i przestrajając tokeny w `globals.css` (blok `.dark`).

## Fidelity
**High-fidelity** — kolory, typografia, spacing i stany są docelowe. Odtwórz 1:1 używając komponentów shadcn/ui.

## Design Tokens (do `globals.css`, blok `.dark`)
- Tło strony: gradient `linear-gradient(160deg, #1a1a22 0%, #0d0d0e 50%, #1b1320 100%)` (na body/layout; karty na tym tle)
- `--background`: #0d0d0e
- `--card` / powierzchnie: `rgba(255,255,255,.03)` z obramowaniem `rgba(255,255,255,.09)`
- `--primary` (akcent): **#d6483a** · hover: #e05446 / #e06a5e
- Tekst główny: #f5f4f2 · wyciszony: `rgba(245,244,241,.5–.65)` · etykiety: `rgba(245,244,241,.4–.45)`
- Inputy: tło `rgba(0,0,0,.3)`, border `rgba(255,255,255,.12)`, radius 9px
- Badge Published: tekst #8fd694, tło `rgba(120,200,120,.12)`, border `rgba(143,214,148,.3)`
- Badge Draft: tekst #e08079, tło `rgba(214,72,58,.14)`, border `rgba(224,128,121,.35)`
- Radius: karty 12px, inputy 9px, przyciski pill (100px)
- Font: systemowy sans (`system-ui, -apple-system, sans-serif`); mono (`ui-monospace`) dla dat i numerów ruchów
- Typografia: H1 26px/800/-0.5px; tytuły kart 15–16px/700; body 13–14px; etykiety sekcji 11–11.5px/700/uppercase/letter-spacing 1–1.5px

## Screens / Views

### 1. Homepage `/` (plik: Chess Blog Homepage.dc.html)
- Non-scrollable, 100vh: nav (góra) → hero grid → stopka.
- Grid 2fr/3fr: lewa kolumna = badge "ANALIZA PARTII · 1800+" (akcent), H1 38px/800, opis, lista "Ostatnie analizy" (4 karty hover); prawa = szachownica 3D (three.js).
- Szachownica 3D: styl Staunton (figury z LatheGeometry), białe pola #f2efe8, czarne #2a2a2d, przezroczyste tło canvas, kamera z perspektywy białych pod kątem (elewacja 38°, azymut 18°), powolna rotacja `rotation.y += delta*0.08` zatrzymywana na hover.
- Interakcja: hover na kartę analizy → reset planszy → animowane odegranie 3 pierwszych ruchów (750ms odstęp, ruch 520ms, łuk sinusoidalny w osi Y, marker celu #d6483a zanikający).
- Karta analizy aktywna: border #d6483a, tło `rgba(214,72,58,.12)`.

### 2. `/login` (Chess Diary Screens.dc.html → ekran Login)
- Karta 360px wyśrodkowana w pionie i poziomie; tytuł "Zaloguj się" 22px/800, podtytuł muted.
- Pola Email + Hasło (label 12px/600, input jak w tokenach), błąd walidacji 12.5px #e08079, przycisk primary pill pełnej szerokości.

### 3. `/tournaments`
- Max-width 980px, wyśrodkowany. H1 "Turnieje" + licznik po prawej (12.5px muted).
- Lista KART (nie tabela): każda karta = nazwa (16px/700) + lokalizacja (12.5px muted) po lewej; data (mono 12.5px) + strzałka → po prawej. Hover: border #d6483a + tło `rgba(214,72,58,.07)`. Cała karta klikalna → gry turnieju.
- Empty state: ramka dashed `rgba(255,255,255,.14)`, radius 12px, tekst "No tournaments yet." wycentrowany, muted; dla autora przycisk "New tournament".

### 4. `/tournaments/new`
- Max-width 560px. Breadcrumb "← Tournaments" (12px muted, klikalny). H1 "Nowy turniej".
- Pola: Nazwa, Miejsce, Data. Przyciski: primary "Utwórz turniej" + ghost "Anuluj".

### 5. `/tournaments/[id]/games`
- Max-width 980px. Breadcrumb ← , H1 = nazwa turnieju + podtytuł (miejsce · data). Po prawej przycisk "Import game" (tylko autor).
- Wiersze jako karty w gridzie `1fr 110px 130px 120px`: Opponent (15px/700), Color ("⚪ Białe"/"⚫ Czarne"), Date (mono), Status badge.
- Wiersz Draft: border **dashed** `rgba(214,72,58,.4)` + badge Draft; widoczny tylko dla autora. Czytelnik widzi tylko Published (+ dopisek pod listą).
- Nagłówki kolumn: 11.5px/700 uppercase letter-spacing 1px, muted.

### 6. `/games/new` (Import PGN)
- Max-width 640px. Breadcrumb ← do turnieju. H1 "Import partii (PGN)".
- Select turnieju (styl inputu + chevron ▾), textarea PGN (mono 12.5px, min-height 130px), przyciski Importuj/Anuluj.
- Dopisek: "Partia trafia jako Draft — opublikujesz ją z widoku gry."

### 7. `/games/[id]` — widok gry (najbardziej złożony)
- Max-width 1180px. Breadcrumb ← do turnieju. H1 "vs {opponent}" + podtytuł (kolor · data · runda).
- **PublishToggle** (tylko autor): kapsuła z labelem "Status" + segmented Draft/Published (aktywny segment: tło #d6483a, biały tekst; nieaktywny transparent muted).
- Grid `1.1fr / 1fr`, gap 32px:
  - **Lewa: szachownica 2D** — grid 8×8, aspect-ratio 1, radius 10px, border `rgba(255,255,255,.12)`; pola jasne #e9e4d8, ciemne #3a3a3e; figury unicode (♔♕♖♗♘♙ / ♚♛♜♝♞♟), białe #fdfcf9 z cieniem, czarne #17171a; pole ostatniego ruchu podświetlone `rgba(214,72,58,.55)`. Pod planszą nawigacja ⏮ ◀ ▶ ⏭ (przyciski outline).
  - **Prawa: lista ruchów** — nagłówek sekcji "GŁÓWNA LINIA"; wiersz ruchu = numer (mono, muted, 26px szer.) + białe posunięcie (600) + czarne; hover `rgba(255,255,255,.05)`; **aktualny ruch**: tło `rgba(214,72,58,.14)` + border `rgba(214,72,58,.35)`, posunięcie w kolorze #e08079.
- **Adnotacja**: blok wcięty 36px pod ruchem, tło `rgba(255,255,255,.04)`, left-border 2px #d6483a, radius `0 9px 9px 0`, 13px/1.6; autor widzi link "Edytuj" (inline edycja → textarea w tym samym bloku).
- **Sideline**: karta wcięta 36px, border `rgba(255,255,255,.1)`, tło `rgba(0,0,0,.2)`, radius 10px; nagłówek "SIDELINE · po 3.Bc4" + link "Otwórz na szachownicy →"; ruchy wariantu w linii + komentarz muted.
- **Zagnieżdżony sideline**: wewnątrz karty sideline'a, kolejne wcięcie 14px, left-border 2px `rgba(214,72,58,.5)` — poziom zagnieżdżenia = kolejne wcięcie + czerwona linia.
- Akcje autora w sideline: "+ Dodaj zagnieżdżony wariant" (akcent), "Usuń sideline" (muted → czerwony na hover; usuwa kaskadowo).
- Autor pod listą: dashed przycisk "+ Dodaj adnotację do {ruch}".

## Shared: nawigacja / layout globalny (`layout.tsx`)
- Header: logo "My Chess Journey" (17px/700) + linki Home, Tournaments (13.5px; aktywny #f5f4f2/600, nieaktywny 65% opacity); po prawej dla autora: "New tournament" (outline pill), "Import game" (primary pill), "Log out" (tekstowy muted); dla niezalogowanych: "Log in" (outline pill). Border-bottom `rgba(255,255,255,.08)`.
- Stopka: © + drobny tekst, border-top jak wyżej. (Przełącznik "Podgląd jako" w prototypie to narzędzie podglądu — nie implementować.)

## Interactions & Behavior
- Hover kart/wierszy: border → #d6483a, tło → `rgba(214,72,58,.07)`, transition `all .25s ease`.
- Nawigacja: karta turnieju → gry; wiersz gry → widok gry; breadcrumby wstecz.
- Formularze: redirect do /login bez sesji (tournaments/new, games/new); walidacja inline czerwonym #e08079.
- Homepage: patrz sekcja 1 (hover-driven animacje 3D).

## State Management
- Sesja (Supabase Auth) → warianty autor/czytelnik całego UI.
- Widok gry: aktualny indeks ruchu (podświetlenie pola + wiersza), otwarty sideline (podmienia pozycję na planszy), tryb edycji adnotacji.
- Status gry Draft/Published (toggle, optimistic update).

## Assets
Brak zewnętrznych assetów. Figury: unicode (2D) / geometria three.js (3D, plik homepage). three.js ^0.184 przez import map.

## Files
- `Chess Blog Homepage.dc.html` — strona główna z szachownicą 3D (logika three.js w bloku script na dole pliku)
- `Chess Diary Screens.dc.html` — wszystkie widoki aplikacji (przełączanie ekranów w logice komponentu)
