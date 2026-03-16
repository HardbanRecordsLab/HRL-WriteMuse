// Demo data for investor presentations
export const DEMO_BOOK = {
  id: 'demo-book-1',
  title: 'Przygody w Krainie Marzeń',
  description: 'Magiczna opowieść o dziewczynce, która odkrywa tajemniczy świat za lustrem',
  status: 'in_progress' as const,
  user_id: 'demo-user-123',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  cover_image_url: null,
  settings: null,
};

export const DEMO_CHAPTERS = [
  {
    id: 'demo-chapter-1',
    document_id: 'demo-book-1',
    title: 'Prolog: Stare Lustro',
    order_index: 0,
    content: `W małym domku na skraju lasu stało stare lustro. Nikt nie pamiętał, skąd się wzięło ani kto je tam postawił. Babcia Zosi twierdziła, że lustro należało do pradawnej czarodziejki, ale mała dziewczynka nigdy w to nie wierzyła.

Aż do tej jednej, magicznej nocy.

Było to w środku lata, gdy słońce chowało się za horyzontem, malując niebo na odcienie złota i purpury. Zosia siedziała w swoim pokoju, patrząc przez okno na zachód słońca. Nagle usłyszała cichy szept, jakby ktoś wołał jej imię.

— Zosia... Zosia...

Dziewczynka rozejrzała się niepewnie. Głos zdawał się dobiegać z korytarza, tam gdzie wisiało stare lustro. Powoli wstała z łóżka i na palcach podeszła do drzwi.

Lustro lśniło tajemniczym, srebrzystym blaskiem.`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-chapter-2',
    document_id: 'demo-book-1',
    title: 'Rozdział 1: Za Lustrem',
    order_index: 1,
    content: `Zosia stała przed lustrem, wpatrując się w swoje odbicie. Ale coś było nie tak. Odbicie uśmiechało się, choć ona sama nie czuła się na uśmiech. Co więcej, za plecami odbicia nie było jej pokoju – była tam łąka pełna świecących kwiatów.

— Nie bój się — szepnęło odbicie. — Kraina Marzeń czeka.

Zanim Zosia zdążyła krzyknąć lub uciec, poczuła, jak tafla lustra staje się miękka jak woda. Jej palce przeniknęły przez szkło, potem dłoń, ramię... W jednej chwili cała wpadła przez lustro.

Wylądowała na miękkiej, pachnącej lawendą trawie. Nad głową świeciły dwa słońca – jedno złote, drugie srebrne. Powietrze pachniało miodem i czekoladą.

— Witaj, Zosia — powiedział głos za jej plecami.

Odwróciła się. Stał tam króliczek wielkości psa, ubrany w elegancki frak i cylinder.

— Jestem Barnaba — przedstawił się z ukłonem. — Twój przewodnik po Krainie Marzeń. Mamy wiele do zrobienia, bo Ciemny Czarodziej przejął Pałac Snów!`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-chapter-3',
    document_id: 'demo-book-1',
    title: 'Rozdział 2: Leśni Strażnicy',
    order_index: 2,
    content: `Barnaba prowadził Zosię przez las świecących drzew. Każde z nich miało inny kolor – turkusowe, różowe, fioletowe. Z gałęzi zwisały małe lampiony, które oświetlały ścieżkę.

— Dokąd idziemy? — zapytała Zosia.

— Do Strażników Lasu. Tylko oni znają drogę do Pałacu Snów.

Po godzinie marszu dotarli do polany, na której środku stał ogromny dąb. Wokół niego zebrali się najdziwniejszi mieszkańcy lasu: sowy w okularach, lisy w płaszczach, i borsuki z długimi brodami.

— Przybywamy prosić o pomoc — oznajmił Barnaba.

Najstarszy borsuk podniósł się i podszedł do Zosi.

— Widzę w twoich oczach odwagę — powiedział. — Ale czy jesteś gotowa zmierzyć się z Ciemnym Czarodziejem? Wielu próbowało. Nikt nie wrócił.

Zosia przełknęła ślinę, ale wyprostowała się dumnie.

— Jestem gotowa — odpowiedziała pewnym głosem.`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-chapter-4',
    document_id: 'demo-book-1',
    title: 'Rozdział 3: Tajemnica Czarodzieja',
    order_index: 3,
    content: `Strażnicy wręczyli Zosi magiczną mapę, która pokazywała drogę do Pałacu Snów. Mapa sama się aktualizowała, pokazując bezpieczne ścieżki i ukryte pułapki.

— Pamiętaj — ostrzegł najstarszy borsuk — Ciemny Czarodziej nie zawsze był zły. Kiedyś był Strażnikiem Snów, najbardziej kochanym mieszkańcem Krainy. Ale pewnego dnia stracił kogoś bardzo bliskiego i jego serce wypełniła ciemność.

Zosia zastanowiła się. Może nie musi z nim walczyć? Może wystarczy mu pomóc?

— Czy jest sposób, żeby przywrócić mu dawne serce? — zapytała.

Borsuk spojrzał na nią z zaskoczeniem, a potem uśmiechnął się.

— Jesteś mądra, młoda podróżniczko. Jest tylko jedna rzecz, która może rozświetlić ciemność: Łza Prawdziwej Przyjaźni. Ale gdzie jej szukać, tego nawet my nie wiemy.

Zosia kiwnęła głową. Miała plan.`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-chapter-5',
    document_id: 'demo-book-1',
    title: 'Epilog',
    order_index: 4,
    content: `Zosia obudziła się w swoim łóżku, ale wszystko wydawało się inne. Pamiętała każdy szczegół podróży — Barnabę, Strażników Lasu, Ciemnego Czarodzieja, który teraz znów był Strażnikiem Snów.

Czy to był tylko sen? Spojrzała na lustro w korytarzu. Zdawało się, że przez chwilę zobaczyła w nim znajomy uśmiech i królika w cylindrze, który pomachał jej łapką.

Uśmiechnęła się. Wiedziała, że kiedyś wróci do Krainy Marzeń. Bo niektóre przygody nigdy się nie kończą — one tylko czekają na odpowiedni moment.

KONIEC`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEMO_STATS = {
  totalBooks: 3,
  totalChapters: 12,
  totalWords: 4567,
  wordsToday: 342,
  wordsThisWeek: 1823,
  writingStreak: 7,
};

export const DEMO_RECENT_DOCUMENTS = [
  DEMO_BOOK,
  {
    id: 'demo-book-2',
    title: 'Poradnik Młodego Pisarza',
    description: 'Jak pisać angażujące historie krok po kroku',
    status: 'draft' as const,
    user_id: 'demo-user-123',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    cover_image_url: null,
    settings: null,
  },
  {
    id: 'demo-book-3',
    title: 'Dziennik Podróżnika',
    description: 'Wspomnienia z wypraw przez Europę',
    status: 'completed' as const,
    user_id: 'demo-user-123',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    cover_image_url: null,
    settings: null,
  },
];
