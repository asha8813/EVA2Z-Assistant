/*!
 * EVA2Z Chat Widget – Embeddable Script
 * Drop this on any website / web-app to get the floating EVA2Z support chat.
 *
 * Usage (one line):
 *   <script
 *     src="https://YOUR-BACKEND/widget.js"
 *     data-api-url="https://YOUR-BACKEND"
 *     data-color="#0066ff"
 *     data-color-2="#00c6ff"
 *     data-title="EVA2Z Assistant"
 *     data-position="bottom-right"
 *     data-auto-open="false"
 *     defer></script>
 *
 * No dependencies. Uses Shadow DOM so the host page's CSS cannot break it
 * and the widget's CSS cannot leak into the host page.
 */
(function () {
  "use strict";

  // -----------------------------------------------------------------
  // 1. CONFIG  (from <script data-*="..."> attributes)
  // -----------------------------------------------------------------
  var SCRIPT =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();

  var d = (SCRIPT && SCRIPT.dataset) || {};

  var CONFIG = {
    apiUrl: (d.apiUrl || window.location.origin).replace(/\/$/, ""),
    primary: d.color || "#0066ff",
    secondary: d.color2 || "#00c6ff",
    title: d.title || "EVA2Z Assistant",
    position: d.position || "bottom-right", // bottom-right | bottom-left
    autoOpen: d.autoOpen === "true",
    icon: d.icon || "🤖",
    quickQuestions: parseQuick(d.quickQuestions),
  };

  function parseQuick(raw) {
    if (!raw) {
      return [
        ["🔹 Warranty safe?", "Is this GPS device safe for my vehicle warranty?"],
        ["🔹 Free install?", "Do you provide free installation?"],
        ["🔹 Battery backup?", "How long does the GPS work if the vehicle battery is disconnected?"],
        ["🔹 Visible?", "Will the GPS device be visible after installation?"],
        ["🔹 Self install?", "Can I install the GPS device myself?"],
        ["🔹 Install time?", "How long does the installation process take?"],
        ["🔹 Drilling?", "Is drilling required during installation?"],
      ];
    }
    // format: "Label1|Question1;;Label2|Question2"
    return raw.split(";;").map(function (pair) {
      var parts = pair.split("|");
      return [parts[0].trim(), (parts[1] || parts[0]).trim()];
    });
  }

  // -----------------------------------------------------------------
  // 2. STYLES  (scoped inside Shadow DOM)
  // -----------------------------------------------------------------
  var CSS = `
    :host { all: initial; font-family: 'Segoe UI', Roboto, Arial, sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }

    .eva-icon {
      position: fixed; bottom: 25px; ${CONFIG.position === "bottom-left" ? "left: 25px;" : "right: 25px;"}
      width: 65px; height: 65px; border-radius: 50%;
      background: linear-gradient(135deg, ${CONFIG.primary}, ${CONFIG.secondary});
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 28px; cursor: pointer; user-select: none;
      box-shadow: 0 8px 20px rgba(0,0,0,0.25);
      transition: transform 0.25s ease;
      z-index: 2147483646;
    }
    .eva-icon:hover { transform: scale(1.08); }

    .history-dot {
      position: absolute; top: -6px; right: -6px;
      background: #ff4757; color: white; font-size: 10px;
      min-width: 18px; height: 18px; border-radius: 9px; padding: 0 4px;
      display: none; align-items: center; justify-content: center;
      font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .chat-box {
      position: fixed; bottom: 100px;
      ${CONFIG.position === "bottom-left" ? "left: 25px;" : "right: 25px;"}
      width: 360px; height: 560px; max-height: calc(100vh - 130px);
      background: white; border-radius: 18px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.2);
      display: none; flex-direction: column; overflow: hidden;
      z-index: 2147483647;
      animation: eva-pop 0.25s ease;
    }
    .chat-box.open { display: flex; }
    @keyframes eva-pop {
      from { opacity: 0; transform: translateY(10px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .chat-header {
      background: linear-gradient(135deg, ${CONFIG.primary}, ${CONFIG.secondary});
      color: white; padding: 14px 16px; font-weight: 600; font-size: 15px;
      display: flex; justify-content: space-between; align-items: center;
      flex-shrink: 0;
    }
    .header-actions { display: flex; gap: 6px; align-items: center; }
    .header-btn {
      background: rgba(255,255,255,0.2); color: white; border: none;
      padding: 5px 9px; border-radius: 6px; cursor: pointer; font-size: 12px;
      transition: background 0.15s;
    }
    .header-btn:hover { background: rgba(255,255,255,0.32); }
    .status-pill { font-size: 11px; opacity: 0.9; margin-left: 4px; }

    .chat-messages {
      flex: 1; padding: 14px; overflow-y: auto; background: #f9fafc;
      scroll-behavior: smooth;
    }
    .chat-messages::-webkit-scrollbar { width: 6px; }
    .chat-messages::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }

    .msg {
      margin-bottom: 10px; padding: 10px 14px; border-radius: 14px;
      max-width: 78%; font-size: 14px; line-height: 1.45;
      white-space: pre-wrap; word-wrap: break-word;
      animation: eva-fade 0.25s ease;
    }
    @keyframes eva-fade {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .msg.user {
      background: ${CONFIG.primary}; color: white;
      margin-left: auto; border-bottom-right-radius: 4px;
    }
    .msg.bot {
      background: #e9eef6; color: #2c3e50;
      border-bottom-left-radius: 4px;
    }
    .msg.bot a { color: ${CONFIG.primary}; text-decoration: underline; word-break: break-all; }

    .typing { display: inline-flex; gap: 4px; padding: 4px 0; }
    .typing span {
      width: 6px; height: 6px; border-radius: 50%; background: #888;
      animation: eva-bounce 1.2s infinite;
    }
    .typing span:nth-child(2) { animation-delay: 0.15s; }
    .typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes eva-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    .faq-panel {
      padding: 10px 12px; border-top: 1px solid #eee; border-bottom: 1px solid #eee;
      background: #f8f9fa; flex-shrink: 0; max-height: 130px; overflow-y: auto;
    }
    .faq-panel p {
      margin: 0 0 8px 0; font-size: 12px; color: #666; font-weight: 600;
    }
    .faq-grid { display: flex; flex-wrap: wrap; gap: 6px; }
    .faq-btn {
      background: #e6f0ff; color: ${CONFIG.primary}; border: 1px solid #b3d1ff;
      padding: 6px 11px; border-radius: 20px; font-size: 12px; cursor: pointer;
      transition: all 0.15s; white-space: nowrap; font-family: inherit;
    }
    .faq-btn:hover {
      background: #d1e3ff;
      box-shadow: 0 2px 5px rgba(0,102,255,0.2);
    }

    .chat-input {
      display: flex; border-top: 1px solid #eee; background: white;
      padding: 10px; gap: 8px; flex-shrink: 0;
    }
    .chat-input input {
      flex: 1; padding: 10px 14px; border: 1px solid #ddd;
      border-radius: 22px; outline: none; font-size: 14px;
      transition: border-color 0.15s; font-family: inherit;
    }
    .chat-input input:focus { border-color: ${CONFIG.primary}; }
    .chat-input button {
      background: ${CONFIG.primary}; color: white; border: none;
      border-radius: 22px; padding: 0 18px; cursor: pointer;
      font-size: 14px; font-weight: 500; font-family: inherit;
      transition: filter 0.15s;
    }
    .chat-input button:hover { filter: brightness(1.1); }
    .chat-input button:disabled { opacity: 0.5; cursor: not-allowed; }

    .modal {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.5); z-index: 2147483647;
      align-items: center; justify-content: center;
    }
    .modal.show { display: flex; }
    .modal-card {
      background: white; padding: 22px; border-radius: 14px;
      max-width: 320px; text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .modal-card h4 { margin: 0 0 8px; font-size: 16px; color: #2c3e50; }
    .modal-card p { margin: 0 0 16px; font-size: 13px; color: #666; }
    .modal-actions { display: flex; gap: 10px; justify-content: center; }
    .modal-btn {
      padding: 8px 16px; border: none; border-radius: 6px;
      cursor: pointer; font-weight: 500; font-size: 13px; font-family: inherit;
    }
    .modal-btn.yes { background: #ff4757; color: white; }
    .modal-btn.no { background: #f1f2f6; color: #333; }

    /* Mobile */
    @media (max-width: 480px) {
      .chat-box {
        width: calc(100vw - 20px);
        right: 10px; left: 10px;
        bottom: 90px;
        height: calc(100vh - 110px);
      }
      .eva-icon {
        bottom: 15px;
        ${CONFIG.position === "bottom-left" ? "left: 15px;" : "right: 15px;"}
        width: 58px; height: 58px;
      }
    }
  `;

  // -----------------------------------------------------------------
  // 3. MARKUP
  // -----------------------------------------------------------------
  function buildMarkup() {
    var quickButtons = CONFIG.quickQuestions
      .map(function (q, i) {
        return (
          '<button class="faq-btn" data-q="' +
          escapeAttr(q[1]) +
          '">' +
          escapeHtml(q[0]) +
          "</button>"
        );
      })
      .join("");

    return `
      <div class="eva-icon" id="evaIcon" title="${escapeAttr(CONFIG.title)}">
        ${CONFIG.icon}
        <span class="history-dot" id="historyDot"></span>
      </div>

      <div class="chat-box" id="chatBox">
        <div class="chat-header">
          <span>${escapeHtml(CONFIG.title)}</span>
          <div class="header-actions">
            <button class="header-btn" id="saveBtn" title="Save chat">💾</button>
            <button class="header-btn" id="clearBtn" title="Clear chat">🗑️</button>
            <button class="header-btn" id="closeBtn" title="Close">✕</button>
          </div>
        </div>

        <div class="chat-messages" id="chatMessages"></div>

        <div class="faq-panel">
          <p>⚡ Quick questions – click to ask:</p>
          <div class="faq-grid">${quickButtons}</div>
        </div>

        <div class="chat-input">
          <input type="text" id="messageInput" placeholder="Type your question…" autocomplete="off" />
          <button id="sendBtn">Send</button>
        </div>
      </div>

      <div class="modal" id="clearModal">
        <div class="modal-card">
          <h4>Clear chat history?</h4>
          <p>This will remove all messages in this conversation.</p>
          <div class="modal-actions">
            <button class="modal-btn yes" id="clearYes">Yes, clear</button>
            <button class="modal-btn no" id="clearNo">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  // -----------------------------------------------------------------
  // 4. HELPERS
  // -----------------------------------------------------------------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }
  function escapeAttr(s) {
    return escapeHtml(s);
  }

  function linkify(text) {
    var safe = escapeHtml(text);
    return safe.replace(/\b(https?:\/\/|www\.)[^\s<]+/gi, function (url) {
      var full = url.indexOf("http") === 0 ? url : "http://" + url;
      return (
        '<a href="' +
        full +
        '" target="_blank" rel="noopener noreferrer">' +
        url +
        "</a>"
      );
    });
  }

  function getGreeting() {
    var h = new Date().getHours();
    if (h < 12) return "Good Morning ☀️";
    if (h < 17) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  }

  // -----------------------------------------------------------------
  // 5. INIT
  // -----------------------------------------------------------------
  function init() {
    if (document.getElementById("eva2z-widget-host")) return; // prevent double-mount

    var host = document.createElement("div");
    host.id = "eva2z-widget-host";
    document.body.appendChild(host);

    var shadow = host.attachShadow({ mode: "open" });
    var style = document.createElement("style");
    style.textContent = CSS;
    shadow.appendChild(style);

    var wrap = document.createElement("div");
    wrap.innerHTML = buildMarkup();
    shadow.appendChild(wrap);

    wireUp(shadow);
  }

  // -----------------------------------------------------------------
  // 6. WIRE-UP (events + state)
  // -----------------------------------------------------------------
  function wireUp(shadow) {
    var $ = function (id) {
      return shadow.getElementById(id);
    };

    var icon = $("evaIcon");
    var box = $("chatBox");
    var messagesEl = $("chatMessages");
    var input = $("messageInput");
    var sendBtn = $("sendBtn");
    var saveBtn = $("saveBtn");
    var clearBtn = $("clearBtn");
    var closeBtn = $("closeBtn");
    var historyDot = $("historyDot");
    var clearModal = $("clearModal");
    var clearYes = $("clearYes");
    var clearNo = $("clearNo");

    var history = []; // {text, type, ts}
    var greeted = false;

    function open() {
      box.classList.add("open");
      if (!greeted) {
        addMessage(
          getGreeting() +
            "! I'm " +
            CONFIG.title +
            " 🤖\n\nClick a quick question below or type your own.",
          "bot"
        );
        greeted = true;
      }
      setTimeout(function () {
        input.focus();
      }, 250);
    }

    function close() {
      box.classList.remove("open");
    }

    icon.addEventListener("click", function () {
      box.classList.contains("open") ? close() : open();
    });
    closeBtn.addEventListener("click", close);

    function addMessage(text, type) {
      var div = document.createElement("div");
      div.className = "msg " + type;
      if (type === "bot") {
        div.innerHTML = linkify(text).replace(/\n/g, "<br>");
      } else {
        div.textContent = text;
      }
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      history.push({ text: text, type: type, ts: new Date().toISOString() });
      updateDot();
    }

    function updateDot() {
      if (history.length > 0) {
        historyDot.style.display = "flex";
        historyDot.textContent = history.length > 99 ? "99+" : history.length;
      } else {
        historyDot.style.display = "none";
      }
    }

    function showTyping() {
      var div = document.createElement("div");
      div.className = "msg bot";
      div.id = "evaTyping";
      div.innerHTML =
        '<div class="typing"><span></span><span></span><span></span></div>';
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    function hideTyping() {
      var t = shadow.getElementById("evaTyping");
      if (t) t.remove();
    }

    async function ask(question) {
      if (!question) return;
      addMessage(question, "user");
      input.value = "";
      sendBtn.disabled = true;
      showTyping();

      try {
        var res = await fetch(CONFIG.apiUrl + "/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: question }),
        });
        var data = await res.json();
        hideTyping();

        if (data.answer === "CHAT_CLEAR_REQUEST") {
          openClearModal();
        } else if (data.answer === "CHAT_SAVE_REQUEST") {
          saveHistory();
        } else {
          addMessage(data.answer || "Sorry, no response received.", "bot");
        }
      } catch (err) {
        hideTyping();
        addMessage(
          "Sorry, I couldn't reach the server. Please try again.",
          "bot"
        );
      } finally {
        sendBtn.disabled = false;
      }
    }

    sendBtn.addEventListener("click", function () {
      ask(input.value.trim());
    });
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") ask(input.value.trim());
    });

    // Quick FAQ buttons
    shadow.querySelectorAll(".faq-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        ask(btn.getAttribute("data-q"));
      });
    });

    // Clear modal
    function openClearModal() {
      if (history.length === 0) return;
      clearModal.classList.add("show");
    }
    clearBtn.addEventListener("click", openClearModal);
    clearNo.addEventListener("click", function () {
      clearModal.classList.remove("show");
    });
    clearYes.addEventListener("click", function () {
      while (messagesEl.firstChild) messagesEl.removeChild(messagesEl.firstChild);
      history = [];
      greeted = false;
      updateDot();
      clearModal.classList.remove("show");
      open(); // re-greet
    });

    // Save history
    function saveHistory() {
      if (history.length === 0) {
        addMessage("No chat history to save yet.", "bot");
        return;
      }
      var lines = [
        CONFIG.title + " – Chat History",
        "Generated: " + new Date().toLocaleString(),
        "=".repeat(50),
        "",
      ];
      history.forEach(function (m, i) {
        var role = m.type === "user" ? "You" : CONFIG.title;
        var time = new Date(m.ts).toLocaleTimeString();
        lines.push(i + 1 + ". [" + time + "] " + role + ":");
        lines.push(m.text);
        lines.push("-".repeat(40));
      });
      var blob = new Blob([lines.join("\n")], { type: "text/plain" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download =
        "eva2z_chat_" + new Date().toISOString().split("T")[0] + ".txt";
      a.click();
      URL.revokeObjectURL(a.href);
      addMessage("💾 Chat history downloaded.", "bot");
    }
    saveBtn.addEventListener("click", saveHistory);

    // Auto-open if configured
    if (CONFIG.autoOpen) setTimeout(open, 800);

    // Expose a tiny public API on window for advanced users
    window.EVA2Z = {
      open: open,
      close: close,
      ask: ask,
      clear: function () {
        history = [];
        while (messagesEl.firstChild) messagesEl.removeChild(messagesEl.firstChild);
        greeted = false;
        updateDot();
      },
      config: CONFIG,
    };
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();