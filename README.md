# Foro Ischiatico

Sito cinematografico in italiano per Foro Ischiatico: fisioterapia, postura e riabilitazione a Castiglione del Lago, Tavernelle e Città della Pieve.

## Avvio locale

```sh
python3 -m http.server 4173
```

Aprire http://localhost:4173. Nessuna compilazione o dipendenza Node richiesta.

## Esperienza

- HTML, CSS e JavaScript; Lenis 1.3.17 da CDN, con scroll nativo se non disponibile.
- Tre sequenze canvas: 150 JPEG per capitolo, 1600 px di larghezza, estratti da filmati a 1080p.
- Precaricamento del primo capitolo; caricamento progressivo dei successivi; cache limitata a 32 bitmap decodificate.
- Video ottimizzati su mobile; immagini statiche con `prefers-reduced-motion`.
- Collegamenti reali a telefono, email, servizi e modulo contatti originale. Nessuna raccolta dati locale, analytics o form simulato.
- Logo SVG originale fornito dal committente, conservato senza alterazioni.

## Contenuti

Servizi e recapiti verificati su https://foroischiatico.it/ il 24 settembre 2026. Le nuove sedi di Tavernelle e Città della Pieve sono state indicate dal committente; gli indirizzi non sono stati forniti, quindi le schede invitano a contattare il centro.

Le immagini anatomiche sono illustrazioni editoriali generate con Higgsfield (GPT Image 2.5 e Seedance 2.0). Non sono immagini diagnostiche, simulazioni terapeutiche o promesse di risultato.

## Pubblicazione

Sito statico compatibile con GitHub Pages dalla radice del branch `main`. Tutti i percorsi degli asset sono relativi, compatibili con `/foroischiatico/`.

Font: Manrope e Cormorant Garamond, SIL Open Font License; file e licenze in `assets/`.

Per aprire esplicitamente la versione statica, aggiungere `?motion=reduce` all’URL.
