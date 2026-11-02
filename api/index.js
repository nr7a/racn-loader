export default function handler(req, res) {
  const host = req.headers.host;
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const url = new URL(req.url, `${protocol}://${host}`);
  const pathname = url.pathname;
  const slug = pathname.replace(/^\/+/, ""); // 取得任意無限後綴
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "";
  const acceptHeader = req.headers["accept"] || "";

  // 判斷請求來源
  const isBrowser = acceptHeader.includes("text/html") || userAgent.includes("Mozilla") || userAgent.includes("Chrome");
  const isRoblox = userAgent.includes("Roblox") || userAgent.includes("WinInet") || req.query.run === "true";

  // 1. 首頁直接訪問
  if (!slug) {
    return res.status(200).send("RACN Loader System is Online.");
  }

  // 2. 瀏覽器訪問：呈現深色官方 Loadstring 介面
  if (isBrowser && !isRoblox) {
    const fullLoadUrl = `${protocol}://${host}/${slug}`;
    const loaderCode = `loadstring(game:HttpGet("${fullLoadUrl}"))()`;
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loadstring</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #141624;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container { width: 100%; max-width: 520px; display: flex; flex-direction: column; align-items: center; }
    .header { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
    .header-icon { font-size: 22px; }
    .header-title { font-size: 19px; font-weight: 700; color: #ffffff; }
    .card {
      background-color: #191c2b;
      border: 1px solid #23273c;
      border-radius: 12px;
      padding: 16px 18px;
      width: 100%;
      position: relative;
      box-shadow: 0 12px 30px rgba(0,0,0,0.45);
    }
    .code-content {
      font-family: monospace;
      font-size: 13px;
      line-height: 1.6;
      word-break: break-all;
      white-space: pre-wrap;
      padding-right: 68px;
      color: #e2e8f0;
    }
    .copy-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      background-color: #272a3d;
      border: 1px solid #333852;
      color: #e2e8f0;
      font-size: 12px;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: 7px;
      cursor: pointer;
    }
    .copy-btn:hover { background-color: #31364e; color: #ffffff; }
    .footer { margin-top: 18px; text-align: center; font-size: 12px; color: #6b7280; line-height: 1.6; }
    .footer a { color: #8b9bb4; text-decoration: none; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="header-icon">📜</span>
      <span class="header-title">Loadstring</span>
    </div>
    <div class="card">
      <button class="copy-btn" id="cp">Copy</button>
      <div class="code-content">${loaderCode}</div>
    </div>
    <div class="footer">
      <div>Contents can not be displayed on browser •</div>
      <div><a href="https://discord.gg/wdrpVxyjTe" target="_blank">https://discord.gg/wdrpVxyjTe</a></div>
    </div>
  </div>
  <script>
    document.getElementById('cp').onclick = function() {
      navigator.clipboard.writeText('${loaderCode}');
      this.innerText = 'Copied!';
      setTimeout(() => this.innerText = 'Copy', 1500);
    };
  </script>
</body>
</html>`;
    return res.status(200).setHeader("Content-Type", "text/html; charset=utf-8").send(html);
  }

  // 3. Roblox 執行器請求：回傳實際可運行的 Lua 腳本
  if (isRoblox) {
    const luaScript = `-- [RACN LOADER ACTIVE]
-- Path: /${slug}
print("[RACN] 腳本 /${slug} 載入成功！")
print("[RACN] 執行者 IP: ${clientIp}")
`;
    return res.status(200).setHeader("Content-Type", "text/plain; charset=utf-8").send(luaScript);
  }

  // 4. 非瀏覽器且非執行器的惡意挖取爬蟲：整人誘捕回應
  const trollResponse = `-- [ANTI-MINING TRAP ACTIVATED]
-- Suspicious Request Logged from ${clientIp}
loadstring(game:HttpGet("${protocol}://${host}/${slug}"))()`;
  return res.status(200).setHeader("Content-Type", "text/plain; charset=utf-8").send(trollResponse);
}
