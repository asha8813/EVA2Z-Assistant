# EVA2Z Chat Widget — Integration Guide

Add the EVA2Z support chat to any website or web-app with **one line**.

---

## 1. The one-liner

Paste this into your HTML, just before `</body>`:

```html
<script
  src="https://YOUR-BACKEND/widget.js"
  data-api-url="https://YOUR-BACKEND"
  defer></script>
```

Replace `YOUR-BACKEND` with the host where your FastAPI app is running
(e.g. `https://chat.eva2z.com` or `http://localhost:8000` while developing).

That's it. A floating chat bubble appears in the bottom-right corner.

---

## 2. Configuration options

All options are passed as `data-*` attributes on the `<script>` tag.

| Attribute              | Default                   | Description                                              |
| ---------------------- | ------------------------- | -------------------------------------------------------- |
| `data-api-url`         | current page origin       | Base URL of your FastAPI backend                          |
| `data-color`           | `#0066ff`                 | Primary brand color (header, send button, user bubble)   |
| `data-color-2`         | `#00c6ff`                 | Secondary color for header gradient                      |
| `data-title`           | `EVA2Z Assistant`         | Title shown in the header and bubble tooltip             |
| `data-position`        | `bottom-right`            | `bottom-right` or `bottom-left`                          |
| `data-icon`            | `🤖`                      | Emoji or single character shown in the bubble            |
| `data-auto-open`       | `false`                   | Open the chat automatically on page load                 |
| `data-quick-questions` | (built-in EVA2Z FAQ list) | Custom quick buttons. Format: `Label1\|Q1;;Label2\|Q2`   |

Example — fully customized:

```html
<script
  src="https://chat.eva2z.com/widget.js"
  data-api-url="https://chat.eva2z.com"
  data-color="#10b981"
  data-color-2="#34d399"
  data-title="Eva Support"
  data-position="bottom-left"
  data-icon="💬"
  data-auto-open="false"
  data-quick-questions="🚗 Car install?|How is the GPS installed in my car?;;💰 Pricing?|What is the subscription price?"
  defer></script>
```

---

## 3. Programmatic API

Once loaded, a tiny global is exposed for advanced usage:

```js
EVA2Z.open();                                 // open the chat box
EVA2Z.close();                                // close it
EVA2Z.ask("Do you offer free installation?"); // ask a question programmatically
EVA2Z.clear();                                // wipe local message history
EVA2Z.config;                                 // read current config
```

For example, to open the chat when a customer clicks a "Need help?" link:

```html
<a href="#" onclick="EVA2Z.open(); return false;">Need help?</a>
```

---

## 4. Works with any framework

Because the widget injects itself into the DOM at runtime and isolates its
markup inside a Shadow DOM, it works inside:

- **Plain HTML / static sites** — paste the script tag.
- **WordPress** — paste it into the theme footer or a "Custom HTML" widget.
- **Shopify / Wix / Squarespace** — paste it into the custom-code section.
- **React / Next.js** — put it in `public/index.html` (CRA) or in `<Script src="..." />` (Next.js).
- **Vue / Nuxt / Angular** — put it in `index.html` of the build.
- **Mobile WebViews** — works inside Android `WebView` and iOS `WKWebView`.

---

## 5. Backend setup (one time)

The widget calls `POST {data-api-url}/ask` to fetch answers. The provided
FastAPI app already:

- Enables **CORS** for any origin (so the widget works cross-domain).
- Serves the script at **`/widget.js`** (so customers don't need to host it themselves).
- Exposes a demo page at **`/`** showing the embed in action.

Run it:

```bash
pip install fastapi uvicorn pydantic langchain langchain-community \
            faiss-cpu sentence-transformers deep-translator langdetect requests
uvicorn main:app --host 0.0.0.0 --port 8000
```

Then visit `http://localhost:8000/` to see the demo, or open `demo.html`
in any browser to test the embed pattern from a separate origin.

For production, tighten `allow_origins` in `main.py` to the list of
customer domains you want to allow:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://customer1.com", "https://customer2.com"],
    ...
)
```

---

## 6. Files in this bundle

| File             | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `eva2z-chat.js`  | The embeddable widget script. Self-contained, no dependencies.       |
| `main.py`        | FastAPI backend with `/ask`, `/widget.js`, and `/` demo page.        |
| `demo.html`      | Standalone HTML page showing the embed in action.                    |
| `INTEGRATION.md` | This guide.                                                           |