// Content script: injects the Axe sidebar into x.com

const SIDEBAR_WIDTH = 500;
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
    borderLeft: "1px solid rgba(130, 152, 190, 0.18)",
    background: "#07090f",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-18px 0 60px rgba(0, 0, 0, 0.32)",
    transition: "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
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
    background: "linear-gradient(135deg, #2589ff, #7257ff)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    color: "#fff",
    padding: "7px 16px",
    borderRadius: "9px 9px 0 0",
    cursor: "pointer",
    zIndex: "10000",
    fontSize: "12px",
    boxShadow: "0 -4px 18px rgba(37, 137, 255, 0.28)",
    transition: "right 0.32s cubic-bezier(0.22, 1, 0.36, 1), filter 0.2s ease",
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
