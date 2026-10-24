# Sivaprasad MP — Cybersecurity Portfolio

A responsive, dark charcoal and white portfolio focused on VAPT, security auditing, offensive security, application security, and infrastructure security. The original photograph and résumé are preserved.

**Live portfolio:** https://sivaprasad-mp.github.io/my-profile/

## Run locally

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000. No install or build step is required. Serve over HTTP so the Three.js ES module can load.

## Files

- `index.html`: concise VAPT introduction, three focus areas, current experience, highest education, and contact links.
- `projects.html`: project details linked from the home page.
- `certifications.html`: all six credentials and training entries.
- `styles.css`: shared responsive dark theme with subtle blue accents and a white contact section.
- `script.js`: accessible mobile navigation and footer year.
- `network.js`: interactive Three.js network sphere with pause/resume, reduced-motion support, offscreen suspension, and a CSS fallback for unavailable WebGL.
- `vendor/three.module.min.js`: locally hosted Three.js 0.170.0, MIT licensed; see `vendor/THREE-LICENSE.txt`.
- `images/avatar.jpg`: original profile photograph, displayed in full color.
- `Sivaprasad_mp_(resume).pdf`: original downloadable résumé.

## Publishing

Push changes to the repository's configured GitHub Pages source. The site uses relative asset URLs and requires no framework or server-side code. Browser navigation and primary content also work without JavaScript.

Credentials are represented as listed in the résumé; no verification IDs, certificate downloads, or project repository links are invented.
