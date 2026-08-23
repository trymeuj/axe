// Content script: injects the Axe sidebar into x.com

const SIDEBAR_WIDTH = 320;
const SIDEBAR_ID = "axe-sidebar-container";

function injectSidebar() {
  if (document.getElementById(SIDEBAR_ID)) return;

  // Create sidebar container
  const container = document.createElement("div");
  container.id = SIDEBAR_ID;
  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    right: "0",
    width: `${SIDEBAR_WIDTH}px`,
    height: "100vh",
    zIndex: "9999",
    borderLeft: "1px solid #2f3336",
    background: "#000",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease",
  });

  // Create iframe pointing to sidebar React app
  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("assets/sidebar.html");
  Object.assign(iframe.style, {
    width: "100%",
    height: "100%",
    border: "none",
    background: "transparent",
  });

  // Toggle button
  const toggle = document.createElement("button");
  toggle.id = "axe-toggle";
  toggle.innerHTML = `<span style="font-weight:700;font-size:13px;letter-spacing:-0.02em">Axe</span>`;
  Object.assign(toggle.style, {
    position: "fixed",
    top: "50%",
    right: `${SIDEBAR_WIDTH}px`,
    transform: "translateY(-50%) translateX(50%) rotate(-90deg)",
    transformOrigin: "center center",
    background: "#000",
    border: "1px solid #2f3336",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "6px 6px 0 0",
    cursor: "pointer",
    zIndex: "10000",
    fontSize: "12px",
    transition: "right 0.2s ease",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  });

  let isOpen = true;

  toggle.addEventListener("click", () => {
    isOpen = !isOpen;
    container.style.transform = isOpen ? "translateX(0)" : `translateX(${SIDEBAR_WIDTH}px)`;
    toggle.style.right = isOpen ? `${SIDEBAR_WIDTH}px` : "0px";
  });

  container.appendChild(iframe);
  document.body.appendChild(container);
  document.body.appendChild(toggle);

  // Push X's main content left to make room
  nudgeXLayout(SIDEBAR_WIDTH);
}

function nudgeXLayout(width: number) {
  // X uses a main column — nudge it left so it doesn't get covered
  const style = document.createElement("style");
  style.id = "axe-layout-override";
  style.textContent = `
    body {
      margin-right: ${width}px !important;
    }
  `;
  document.head.appendChild(style);
}

// Wait for DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectSidebar);
} else {
  injectSidebar();
}
