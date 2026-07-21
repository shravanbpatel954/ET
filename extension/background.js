// SentinelAI Extension Background Service Worker (Manifest V3)
const API_BASE = "http://localhost:8000/api/v1";

chrome.runtime.onInstalled.addListener(() => {
  console.log("SentinelAI Threat Shield Extension Installed.");
  chrome.action.setBadgeText({ text: "OK" });
  chrome.action.setBadgeBackgroundColor({ color: "#00e5ff" });
});

// Auto-check active tab URLs on update
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
    checkTabUrlSafety(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url && tab.url.startsWith("http")) {
      checkTabUrlSafety(tab.id, tab.url);
    }
  });
});

async function checkTabUrlSafety(tabId, url) {
  try {
    const formData = new FormData();
    formData.append("source_type", "news_article_url");
    formData.append("content", url);

    const res = await fetch(`${API_BASE}/analyze/full`, {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      const level = data.threat_level || "SAFE";

      if (level === "SAFE") {
        chrome.action.setBadgeText({ tabId, text: "SAFE" });
        chrome.action.setBadgeBackgroundColor({ tabId, color: "#10b981" });
      } else if (level === "LOW" || level === "MEDIUM") {
        chrome.action.setBadgeText({ tabId, text: "WARN" });
        chrome.action.setBadgeBackgroundColor({ tabId, color: "#f59e0b" });
      } else {
        chrome.action.setBadgeText({ tabId, text: "RISK" });
        chrome.action.setBadgeBackgroundColor({ tabId, color: "#ef4444" });
      }
    }
  } catch (err) {
    // API server offline or not responding silently fails background badge update
  }
}

// Handle messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ANALYZE_PDF_URL") {
    analyzePdfUrl(request.pdfUrl).then(data => sendResponse({ success: true, data })).catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }
});

async function analyzePdfUrl(pdfUrl) {
  const formData = new FormData();
  formData.append("source_type", "news_article_url");
  formData.append("content", pdfUrl);

  const res = await fetch(`${API_BASE}/analyze/full`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Failed to analyze PDF URL");
  return await res.json();
}
