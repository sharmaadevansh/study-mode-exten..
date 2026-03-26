let lastUrl = location.href;
let isApplied = false;

function isChannelPage() {
    const path = window.location.pathname;
    return path.startsWith("/@") || path.startsWith("/channel/") || path.includes("/videos");
}

function applyStudyMode() {
    chrome.storage.sync.get(["studyMode"], (data) => {
        if (!data.studyMode) {
            isApplied = false;
            showDistractions();
            return;
        }

        if (isChannelPage()) return;

        if (isApplied) return;

        hideDistractions();
        isApplied = true;
    });
}

function hideDistractions() {
    const sidebar = document.getElementById("related");
    if (sidebar) sidebar.style.display = "none";

    const comments = document.getElementById("comments");
    if (comments) comments.style.display = "none";

    document.querySelectorAll("ytd-rich-item-renderer").forEach(el => {
        el.style.display = "none";
    });

    document.querySelectorAll("ytd-reel-shelf-renderer").forEach(el => {
        el.style.display = "none";
    });
}

function showDistractions() {
    const sidebar = document.getElementById("related");
    if (sidebar) sidebar.style.display = "";

    const comments = document.getElementById("comments");
    if (comments) comments.style.display = "";

    document.querySelectorAll("ytd-rich-item-renderer, ytd-reel-shelf-renderer")
        .forEach(el => el.style.display = "");
}

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "ENABLE" || msg.action === "DISABLE") {
        isApplied = false;
        applyStudyMode();
    }
});

function handleNavigation() {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        isApplied = false;
        setTimeout(applyStudyMode, 1000);
    }
}

new MutationObserver(handleNavigation).observe(document.body, {
    childList: true,
    subtree: true
});

setTimeout(applyStudyMode, 1500);