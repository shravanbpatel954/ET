// SentinelAI On-Page PDF & URL Threat Detection Content Script
(function () {
  console.log("SentinelAI Content Script initialized.");

  // 1. Scan page for PDF links & embeds
  function scanPageForPdfLinks() {
    const links = document.querySelectorAll("a[href*='.pdf'], a[href*='pdf']");
    links.forEach(link => {
      if (link.dataset.sentinelAiInjected) return;
      link.dataset.sentinelAiInjected = "true";

      const badge = document.createElement("span");
      badge.className = "sentinel-pdf-badge";
      badge.innerHTML = `🛡️ AI Verify`;
      badge.title = "Verify this PDF advisory with SentinelAI";

      badge.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        analyzePdfLink(link.href, badge);
      });

      link.parentNode.insertBefore(badge, link.nextSibling);
    });
  }

  // 2. Analyze PDF link on click
  async function analyzePdfLink(pdfUrl, badgeEl) {
    badgeEl.textContent = "⏳ Analyzing...";
    badgeEl.classList.add("loading");

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "ANALYZE_PDF_URL", pdfUrl }, (res) => {
          if (res && res.success) resolve(res.data);
          else reject(new Error(res ? res.error : "No response"));
        });
      });

      showThreatModal(response, pdfUrl);
      badgeEl.textContent = response.threat_level === "SAFE" ? "✅ Safe PDF" : "⚠️ Threat PDF";
      badgeEl.className = "sentinel-pdf-badge " + (response.threat_level === "SAFE" ? "badge-safe" : "badge-danger");
    } catch (err) {
      badgeEl.textContent = "❌ Check Failed";
      badgeEl.className = "sentinel-pdf-badge badge-error";
    }
  }

  // 3. Render Floating Threat Modal
  function showThreatModal(data, targetUrl) {
    const existing = document.getElementById("sentinel-overlay-modal");
    if (existing) existing.remove();

    const level = data.threat_level || "SAFE";
    const score = data.threat_score || 0;
    const category = data.scam_category || "Document Advisory";
    const isSafe = level === "SAFE";

    const modal = document.createElement("div");
    modal.id = "sentinel-overlay-modal";
    modal.className = "sentinel-modal-backdrop";

    modal.innerHTML = `
      <div class="sentinel-modal-card ${isSafe ? 'card-safe' : 'card-danger'}">
        <div class="sentinel-modal-header">
          <div class="sentinel-modal-brand">
            <span class="sentinel-shield-icon">🛡️</span>
            <div>
              <h3>SentinelAI Threat Report</h3>
              <span class="sentinel-target-url">${targetUrl.substring(0, 45)}...</span>
            </div>
          </div>
          <button class="sentinel-close-btn">&times;</button>
        </div>

        <div class="sentinel-modal-body">
          <div class="sentinel-banner ${isSafe ? 'b-safe' : 'b-danger'}">
            <div class="sentinel-banner-left">
              <span class="sentinel-level-tag">${level}</span>
              <span class="sentinel-category-name">${category}</span>
            </div>
            <div class="sentinel-score-box">
              <span class="sentinel-score-num">${score}</span>
              <span class="sentinel-score-txt">RISK SCORE</span>
            </div>
          </div>

          <div class="sentinel-section">
            <div class="sentinel-sec-title">Risk Signals</div>
            <ul class="sentinel-list">
              ${(data.indicators || ["No threat signals found"]).map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>

          <div class="sentinel-section">
            <div class="sentinel-sec-title">Recommendations</div>
            <ul class="sentinel-list">
              ${(data.recommendations || ["Proceed safely."]).map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>
        </div>

        <div class="sentinel-modal-footer">
          <span>Powered by SentinelAI Engine</span>
          <button class="sentinel-action-btn" id="sentinel-dismiss-btn">Dismiss</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector(".sentinel-close-btn").addEventListener("click", close);
    modal.querySelector("#sentinel-dismiss-btn").addEventListener("click", close);
  }

  // Initial Scan & MutationObserver for dynamic PDF links
  scanPageForPdfLinks();
  const observer = new MutationObserver(scanPageForPdfLinks);
  observer.observe(document.body, { childList: true, subtree: true });
})();
