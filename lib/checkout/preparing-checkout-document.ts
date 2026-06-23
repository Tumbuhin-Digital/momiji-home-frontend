const PRIMARY = "#7eb4b4"
const PRIMARY_SOFT = "rgba(126, 180, 180, 0.12)"
const PRIMARY_PING = "rgba(126, 180, 180, 0.28)"
const ALTERNATE = "#2d3f42"
const MUTED = "rgba(45, 63, 66, 0.62)"

export function writePreparingCheckoutDocument(targetWindow: Window): void {
  const doc = targetWindow.document
  doc.open()
  doc.write(buildPreparingCheckoutHTML())
  doc.close()
}

function buildPreparingCheckoutHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Preparing checkout — Momiji Home</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      height: 100%;
    }

    body {
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(ellipse 80% 60% at 50% 0%, ${PRIMARY_SOFT}, transparent 70%),
        linear-gradient(180deg, #fafafa 0%, #f3f5f5 100%);
      color: ${ALTERNATE};
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      -webkit-font-smoothing: antialiased;
    }

    .card {
      width: 100%;
      max-width: 420px;
      background: #fff;
      border-radius: 24px;
      padding: 40px 32px;
      text-align: center;
      box-shadow:
        0 1px 2px rgba(45, 63, 66, 0.04),
        0 12px 40px rgba(45, 63, 66, 0.08);
    }

    .spinner-wrap {
      position: relative;
      width: 72px;
      height: 72px;
      margin: 0 auto 28px;
    }

    .spinner-ping {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: ${PRIMARY_PING};
      animation: ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    .spinner-ring {
      position: absolute;
      inset: 8px;
      border-radius: 50%;
      background: ${PRIMARY_SOFT};
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 2.5px solid ${PRIMARY_SOFT};
      border-top-color: ${PRIMARY};
      border-radius: 50%;
      animation: spin 0.85s linear infinite;
    }

    .eyebrow {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: ${PRIMARY};
      margin-bottom: 8px;
    }

    h1 {
      font-size: 26px;
      font-weight: 500;
      line-height: 1.25;
      color: ${ALTERNATE};
      margin-bottom: 10px;
    }

    .subtitle {
      font-size: 15px;
      line-height: 1.55;
      color: ${MUTED};
      max-width: 300px;
      margin: 0 auto 28px;
    }

    .progress-track {
      height: 4px;
      background: rgba(45, 63, 66, 0.08);
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 24px;
    }

    .progress-bar {
      height: 100%;
      width: 40%;
      border-radius: 999px;
      background: linear-gradient(90deg, ${PRIMARY}, #9cc8c8);
      animation: slide 1.4s ease-in-out infinite;
    }

    .secure {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: ${MUTED};
    }

    .secure svg {
      flex-shrink: 0;
      color: ${PRIMARY};
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes ping {
      0%, 100% { transform: scale(1); opacity: 0.55; }
      50% { transform: scale(1.12); opacity: 0; }
    }

    @keyframes slide {
      0% { transform: translateX(-120%); }
      100% { transform: translateX(320%); }
    }
  </style>
</head>
<body>
  <main class="card" role="status" aria-live="polite" aria-busy="true">
    <div class="spinner-wrap" aria-hidden="true">
      <div class="spinner-ping"></div>
      <div class="spinner-ring">
        <div class="spinner"></div>
      </div>
    </div>

    <p class="eyebrow">Preparing checkout</p>
    <h1>Taking you to payment</h1>
    <p class="subtitle">
      We&rsquo;re setting up a secure Shopify checkout for your order.
      This usually takes just a moment.
    </p>

    <div class="progress-track" aria-hidden="true">
      <div class="progress-bar"></div>
    </div>

    <div class="secure">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span>Encrypted &amp; secure checkout</span>
    </div>
  </main>
</body>
</html>`
}
