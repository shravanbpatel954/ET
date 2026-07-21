// SentinelAI Chrome Extension - Popup Logic
const API_BASE_URL = "http://localhost:8000/api/v1";

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  checkBackendHealth();
  loadCurrentTabUrl();
  initPdfDropzone();
  loadStats();

  document.getElementById("btn-scan-url").addEventListener("click", scanCurrentUrl);
  document.getElementById("btn-scan-pdf").addEventListener("click", scanSelectedPdf);
  document.getElementById("btn-open-dashboard").addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173" });
  });
});

// 1. Tab Switching
function initTabs() {
  const tabs = document.querySelectorAll(".nav-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      
      tab.classList.add("active");
      const targetId = tab.getAttribute("data-tab");
      document.getElementById(targetId).classList.add("active");
    });
  });
}

// 2. Health Check
async function checkBackendHealth() {
  const statusEl = document.getElementById("backend-status");
  const statusText = document.getElementById("status-text");

  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
    if (res.ok) {
      statusEl.className = "status-pill status-connected";
      statusText.textContent = "API Active";
    } else {
      throw new Error("API returned non-200");
    }
  } catch (err) {
    statusEl.className = "status-pill status-offline";
    statusText.textContent = "Offline (Local)";
  }
}

// 3. Load Active Tab URL
function loadCurrentTabUrl() {
  if (chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        const currentUrl = tabs[0].url;
        document.getElementById("target-url").value = currentUrl;
      }
    });
  } else {
    document.getElementById("target-url").value = "https://github.com/shravanbpatel954/etbackendcode";
  }
}

// 4. Scan Website URL
async function scanCurrentUrl() {
  const urlInput = document.getElementById("target-url").value;
  if (!urlInput) return;

  const btn = document.getElementById("btn-scan-url");
  const spinner = btn.querySelector(".spinner");
  const btnText = btn.querySelector(".btn-text");
  const resultCard = document.getElementById("url-result");

  btn.disabled = true;
  spinner.classList.remove("hidden");
  btnText.textContent = "Analyzing...";
  resultCard.classList.add("hidden");

  try {
    const formData = new FormData();
    formData.append("source_type", "news_article_url");
    formData.append("content", urlInput);

    const response = await fetch(`${API_BASE_URL}/analyze/full`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();

    renderUrlResults(data, urlInput);
    incrementStat(data.threat_level === "SAFE" ? "safe" : "threat");
  } catch (err) {
    alert("Analysis failed. Make sure backend is running on http://localhost:8000\nError: " + err.message);
  } finally {
    btn.disabled = false;
    spinner.classList.add("hidden");
    btnText.textContent = "Analyze URL";
  }
}

function renderUrlResults(data, urlStr) {
  const resultCard = document.getElementById("url-result");
  const banner = document.getElementById("url-threat-banner");
  const levelBadge = document.getElementById("url-threat-level");
  const categoryText = document.getElementById("url-scam-category");
  const scoreVal = document.getElementById("url-score-value");
  const indicatorsList = document.getElementById("url-indicators-list");
  const recommendationsList = document.getElementById("url-recommendations-list");

  const level = data.threat_level || "SAFE";
  const score = data.threat_score !== undefined ? data.threat_score : 0;
  const category = data.scam_category || "Safe Website";

  // Set Banner Theme
  banner.className = "threat-banner " + (
    level === "SAFE" ? "banner-safe" :
    (level === "LOW" || level === "MEDIUM") ? "banner-warning" : "banner-danger"
  );

  levelBadge.textContent = level;
  categoryText.textContent = category;
  scoreVal.textContent = score;

  // Set Evidence
  try {
    const host = new URL(urlStr).hostname;
    document.getElementById("ev-domain").textContent = host;
    document.getElementById("ev-https").textContent = urlStr.startsWith("https") ? "Yes (Secure)" : "No (Insecure)";
  } catch (e) {
    document.getElementById("ev-domain").textContent = urlStr;
  }
  document.getElementById("ev-forms").textContent = (data.evidence && data.evidence["Page Structure"]) ? data.evidence["Page Structure"][0] || "0" : "Checked";

  // Indicators
  indicatorsList.innerHTML = "";
  const indicators = data.indicators && data.indicators.length ? data.indicators : ["No malicious patterns or phishing threats detected."];
  indicators.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    indicatorsList.appendChild(li);
  });

  // Recommendations
  recommendationsList.innerHTML = "";
  const recs = data.recommendations && data.recommendations.length ? data.recommendations : ["Site content verified. Practice routine web safety."];
  recs.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    recommendationsList.appendChild(li);
  });

  resultCard.classList.remove("hidden");

  // Update extension badge
  if (chrome.action) {
    const badgeText = level === "SAFE" ? "SAFE" : level;
    const badgeColor = level === "SAFE" ? "#10b981" : level === "MEDIUM" ? "#f59e0b" : "#ef4444";
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
  }
}

// 5. PDF Dropzone & Scan
let selectedPdfFile = null;

function initPdfDropzone() {
  const dropzone = document.getElementById("pdf-dropzone");
  const fileInput = document.getElementById("pdf-file-input");
  const prompt = document.getElementById("dropzone-prompt");
  const fileInfo = document.getElementById("file-info");
  const btnScan = document.getElementById("btn-scan-pdf");

  dropzone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handlePdfSelected(e.target.files[0]);
    }
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfSelected(e.dataTransfer.files[0]);
    }
  });

  function handlePdfSelected(file) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please select a valid PDF file.");
      return;
    }
    selectedPdfFile = file;
    document.getElementById("selected-file-name").textContent = file.name;
    document.getElementById("selected-file-size").textContent = (file.size / 1024).toFixed(1) + " KB";
    
    prompt.classList.add("hidden");
    fileInfo.classList.remove("hidden");
    btnScan.disabled = false;
  }
}

async function scanSelectedPdf() {
  if (!selectedPdfFile) return;

  const btn = document.getElementById("btn-scan-pdf");
  const spinner = btn.querySelector(".spinner");
  const btnText = btn.querySelector(".btn-text");
  const resultCard = document.getElementById("pdf-result");

  btn.disabled = true;
  spinner.classList.remove("hidden");
  btnText.textContent = "Parsing & Analyzing PDF...";
  resultCard.classList.add("hidden");

  try {
    const formData = new FormData();
    formData.append("source_type", "pdf_advisory");
    formData.append("file", selectedPdfFile);

    const response = await fetch(`${API_BASE_URL}/analyze/full`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();

    renderPdfResults(data);
    incrementStat(data.threat_level === "SAFE" ? "safe" : "threat");
  } catch (err) {
    alert("PDF Analysis failed. Make sure backend is running.\nError: " + err.message);
  } finally {
    btn.disabled = false;
    spinner.classList.add("hidden");
    btnText.textContent = "Analyze PDF Safety";
  }
}

function renderPdfResults(data) {
  const resultCard = document.getElementById("pdf-result");
  const banner = document.getElementById("pdf-threat-banner");
  const levelBadge = document.getElementById("pdf-threat-level");
  const categoryText = document.getElementById("pdf-scam-category");
  const scoreVal = document.getElementById("pdf-score-value");
  const summaryText = document.getElementById("pdf-summary");
  const recsList = document.getElementById("pdf-recommendations-list");

  const level = data.threat_level || "SAFE";
  const score = data.threat_score !== undefined ? data.threat_score : 0;
  const category = data.scam_category || "Clean PDF Document";

  banner.className = "threat-banner " + (
    level === "SAFE" ? "banner-safe" :
    (level === "LOW" || level === "MEDIUM") ? "banner-warning" : "banner-danger"
  );

  levelBadge.textContent = level;
  categoryText.textContent = category;
  scoreVal.textContent = score;

  // Extracted Evidence Entities
  const ev = data.evidence || {};
  document.getElementById("pdf-ev-phone").textContent = (ev.Phone && ev.Phone.length) ? ev.Phone.join(", ") : "None Detected";
  document.getElementById("pdf-ev-upi").textContent = (ev.UPI && ev.UPI.length) ? ev.UPI.join(", ") : "None Detected";
  document.getElementById("pdf-ev-amount").textContent = (ev.Amount && ev.Amount.length) ? ev.Amount.join(", ") : "None Detected";

  summaryText.textContent = data.intelligence?.scam_summary || (level === "SAFE" ? "Document analysis clean. No threat patterns found." : `Threat detected in PDF document. Variant: ${category}`);

  recsList.innerHTML = "";
  const recs = data.recommendations && data.recommendations.length ? data.recommendations : ["PDF text verified safe."];
  recs.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    recsList.appendChild(li);
  });

  resultCard.classList.remove("hidden");
}

// 6. Statistics Tracking
function loadStats() {
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["scanned", "verified", "threats"], (res) => {
      document.getElementById("stat-scanned").textContent = res.scanned || 0;
      document.getElementById("stat-verified").textContent = res.verified || 0;
      document.getElementById("stat-threats").textContent = res.threats || 0;
    });
  }
}

function incrementStat(type) {
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["scanned", "verified", "threats"], (res) => {
      const scanned = (res.scanned || 0) + 1;
      const verified = (res.verified || 0) + (type === "safe" ? 1 : 0);
      const threats = (res.threats || 0) + (type === "threat" ? 1 : 0);

      chrome.storage.local.set({ scanned, verified, threats }, () => {
        loadStats();
      });
    });
  }
}
