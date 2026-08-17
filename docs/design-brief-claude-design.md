# Chess Diary — brief dla Claude Design: dostosowanie widoków do stylu strony głównej

## Cel

Strona główna (`/`) ma już zaprojektowany styl, który mi się podoba i który ma być punktem odniesienia dla całej reszty aplikacji. Poniżej lista wszystkich pozostałych widoków/zakładek, które trzeba ostylować w tej samej estetyce, plus wskazówki co do ich zawartości i stanu (żeby dało się to zrobić bez zgadywania).

## Kierunek stylistyczny (z homepage)

- **Dark theme** jako domyślny/jedyny motyw (nie trzeba wspierać jasnego).
- **Akcenty czerwono-pomarańczowe** (np. na przyciskach primary, linkach, stanach aktywnych/hover, statusach).
- **Minimalistycznie, nowocześnie** — dużo przestrzeni, mało dekoracji, czytelna typografia, subtelne obramowania/cienie zamiast ciężkich kart.
- Zachować spójność z shadcn/ui (Button, Input, Table itd.) — nie odchodzimy od tej biblioteki komponentów, tylko przestrajamy tokeny kolorów/radius w `globals.css` (`--primary`, `--accent`, `--destructive`, `--ring`, `--card`, `--border` itd. w bloku `.dark`).

## Stan obecny (ważne!)

Wszystkie widoki poniżej są dziś czystym, nieostylowanym scaffoldingiem — domyślny motyw shadcn (jasny, neutralny szary), zero dark theme, zero akcentów. Homepage jest jedynym miejscem z docelowym designem. Więc zadanie to nie "dopasuj niuanse", tylko realne zaprojektowanie każdego widoku od zera w nowym stylu.

## Lista zakładek/widoków do zaprojektowania

### 1. Strona logowania — `/login`
- Formularz logowania (email + hasło, Supabase Auth).
- Jedyny "publiczny" formularz wejściowy — powinien być prosty, wyśrodkowany, minimalistyczny (karta na środku ekranu).

### 2. Lista turniejów — `/tournaments`
- Tabela: Name, Location, Date.
- Stan pusty: "No tournaments yet."
- To jedna z głównych stron nawigacyjnych czytelnika — warto pomyśleć o niej jak o liście/kartach zamiast surowej tabeli, jeśli to pasuje do stylu homepage.

### 3. Nowy turniej — `/tournaments/new`
- Formularz dodania turnieju (tylko dla zalogowanego autora — redirect do `/login` jeśli brak sesji).

### 4. Gry w turnieju — `/tournaments/[id]/games`
- Tabela: Opponent (link do gry), Color, Date, Status (Draft/Published).
- Czytelnicy niezalogowani widzą tylko gry Published (filtrowane po stronie backendu).
- Status "Draft" powinien być wizualnie odróżnialny (np. badge) — to jedyne miejsce gdzie widać workflow Draft→Published.

### 5. Import gry — `/games/new`
- Formularz importu PGN + wybór turnieju z listy (tylko dla autora, redirect jeśli brak sesji).

### 6. Widok gry — `/games/[id]` (najbardziej złożony widok)
- Nagłówek: "vs {opponent}".
- Przełącznik Draft/Published (widoczny tylko dla autora — `PublishToggle`).
- Główny komponent: `GameViewer` — szachownica + lista ruchów z adnotacjami autora przy poszczególnych posunięciach (główna linia).
- Dla autora: edycja adnotacji inline (`annotation-editor`).
- Sideline'y (warianty/boczne linie od danego posunięcia, mogą się zagnieżdżać):
  - `sideline-viewer` — przeglądanie sideline'a (osobna szachownica/lista ruchów dla wariantu + jego adnotacje).
  - `sideline-editor` — tworzenie/edycja sideline'a przez autora, w tym zagnieżdżonych sideline'ów wewnątrz sideline'ów, z kaskadowym usuwaniem.
- To ekran, na którym najwięcej się dzieje — warto zaprojektować jasną hierarchię: szachownica jako punkt centralny, lista ruchów obok/pod, adnotacje wyraźnie oddzielone od ruchów, sideline'y wizualnie "zagnieżdżone" względem głównej linii (np. wcięcia/kolor ramki), żeby poziom zagnieżdżenia był czytelny na pierwszy rzut oka.

## Współdzielone elementy do zaprojektowania raz, użyte wszędzie

- **Nawigacja/layout globalny** (`layout.tsx`) — obecnie nie ma żadnego navbara/menu. Trzeba zaprojektować header/nav spinający wszystkie zakładki (Home, Tournaments, + akcje autora: New tournament, Import game, Log in/Log out zależnie od sesji).
- **Stan pustych list** ("No tournaments yet.", "No games yet.") — spójny styl empty-state.
- **Badge/status** dla Draft vs Published.
- **Formularze** (login, new tournament, new game) — spójny styl inputów, labeli, przycisków submit, komunikatów błędów.
- **Tabele vs karty** — decyzja czy listy (tournaments, games) zostają jako tabele czy zamieniamy na karty/listy w stylu bardziej dopasowanym do dark+minimalist.

## Słownik domenowy (dla kontekstu, z CONTEXT.md)

- **Tournament** — turniej, obowiązkowy rodzic każdej Game.
- **Game** — pojedyncza partia, status Draft/Published.
- **Move** — pojedynczy półruch (ply).
- **Annotation** — komentarz autora do Move lub Sideline.
- **Sideline** — wariant odgałęziający się od danego Move, może się zagnieżdżać rekurencyjnie.
- **Status** — Draft (widoczny tylko dla autora) / Published (widoczny dla wszystkich).
