# DronePortfolio

Persönliches Drohnenportfolio von Daniel Brodbeck für GitHub Pages.

## Lokal starten

```bash
npm install
npm run prepare:images
npm run check
npm run serve
```

Danach ist die Seite unter `http://127.0.0.1:4173/` erreichbar.

## Bilder ergänzen

1. Das private Original in `source-images/<Kategorie>/` ablegen. Dieser Ordner wird nicht in Git aufgenommen.
2. Titel, Alternativtext und Bildunterschrift in `content/gallery.json` ergänzen.
3. `npm run prepare:images` ausführen. Dadurch entstehen responsive JPEG- und WebP-Dateien ohne EXIF- oder GPS-Metadaten.
4. `npm run check` ausführen und die erzeugte Seite kontrollieren.
5. Die generierten Dateien unter `assets/gallery/` zusammen mit den Inhaltsänderungen committen.

Die zulässigen Kategorien und ihre Reihenfolge stehen in `content/site.json`.

## Google Analytics

Analytics ist in `src/assets/js/analytics.js` absichtlich deaktiviert. Vor einer Aktivierung müssen Mess-ID, Consent-Oberfläche, Widerruf und Datenschutztext gemeinsam geprüft und veröffentlicht werden. Ohne Aktivierung stellt die Website keine Verbindung zu Google Analytics her.

## Veröffentlichung

Der Workflow `.github/workflows/deploy-pages.yml` baut und veröffentlicht `dist/` auf GitHub Pages. Im GitHub-Repository muss unter **Settings → Pages** als Quelle **GitHub Actions** gewählt sein.
