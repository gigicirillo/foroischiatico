# Foro Ischiatico

Sito cinematografico in italiano per Foro Ischiatico: fisioterapia, postura e riabilitazione a Castiglione del Lago, Tavernelle e Città della Pieve.

## Avvio locale

```sh
python3 -m http.server 4173
```

Aprire http://localhost:4173. Nessuna compilazione o dipendenza Node richiesta.

## Esperienza

- HTML, CSS e JavaScript; Lenis 1.3.17 ospitato localmente, con scroll nativo se non disponibile.
- Tre sequenze canvas: 150 JPEG per capitolo, 1600 px di larghezza, estratti da filmati a 1080p.
- Precaricamento del primo capitolo; caricamento progressivo dei successivi; cache limitata a 32 bitmap decodificate.
- Video ottimizzati su mobile; immagini statiche con `prefers-reduced-motion`.
- Tredici pagine interne dei servizi, ognuna con una hero tematica generata tramite Higgsfield.
- Pagina contatti con validazione, selezione del servizio e anteprima email. Il visitatore completa l'invio nel proprio programma di posta; nessun backend o invio automatico è simulato. I campi non sono salvati nel localStorage.
- Logo PNG bianco con trasparenza fornito dal committente, senza bordi, fondi aggiunti o effetti.
- Privacy e cookie policy, dati societari Fisioena Srl e DPO indicato dal committente. Il pannello cookie gestisce esclusivamente la preferenza tecnica di chiusura dell'avviso, con scadenza a sei mesi. Non sono presenti analytics o marketing.

## Contenuti

Servizi e recapiti verificati su https://foroischiatico.it/ il 24 settembre 2026. Le nuove sedi di Tavernelle e Città della Pieve sono state indicate dal committente; gli indirizzi non sono stati forniti, quindi le schede invitano a contattare il centro.

Le immagini anatomiche sono illustrazioni editoriali generate con Higgsfield (GPT Image 2.5 e Seedance 2.0). Non sono immagini diagnostiche, simulazioni terapeutiche o promesse di risultato.

## Pubblicazione

Sito statico compatibile con GitHub Pages dalla radice del branch `main`. Tutti i percorsi degli asset sono relativi, compatibili con `/foroischiatico/`.

Font: Manrope e Cormorant Garamond, SIL Open Font License; file e licenze in `assets/`.

## Aggiornare le pagine interne

I testi dei servizi sono in `content/services.json`. Il generatore `python3 scripts/build_pages.py` aggiorna le pagine statiche, contatti, informative, header e footer. `site.css` e `site.js` contengono lo stile condiviso, la gestione del menu, le preferenze tecniche e la preparazione dell'email.

Le informative descrivono il funzionamento effettivo di questa versione. L'introduzione di un backend per il modulo, analytics o altri destinatari richiede l'aggiornamento delle informative e, dove necessario, dei consensi prima dell'attivazione.

Per aprire esplicitamente la versione statica, aggiungere `?motion=reduce` all’URL.
