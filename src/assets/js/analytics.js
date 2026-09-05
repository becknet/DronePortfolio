(() => {
  // Google Analytics is deliberately inactive for the first release.
  // Set both values only when the consent UI and privacy text have been reviewed.
  const config = Object.freeze({ enabled: false, measurementId: "" });
  if (!config.enabled || !/^G-[A-Z0-9]+$/.test(config.measurementId)) return;

  const consentKey = "droneportfolio-analytics-consent";
  const loadAnalytics = () => {
    if (document.querySelector("script[data-google-analytics]")) return;
    const script = document.createElement("script");
    script.async = true;
    script.dataset.googleAnalytics = "true";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.measurementId)}`;
    document.head.append(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", config.measurementId, { anonymize_ip: true });
  };

  const banner = document.createElement("aside");
  banner.className = "consent-banner";
  banner.setAttribute("aria-label", "Einwilligung zur Reichweitenmessung");
  banner.innerHTML = `<p>Diese Website möchte Google Analytics zur anonymisierten Reichweitenmessung verwenden.</p><div><button type="button" data-consent="deny">Ablehnen</button><button type="button" data-consent="accept">Zustimmen</button></div>`;

  const choice = localStorage.getItem(consentKey);
  if (choice === "accepted") loadAnalytics();
  if (!choice) {
    document.body.append(banner);
    banner.addEventListener("click", (event) => {
      const decision = event.target.closest("[data-consent]")?.dataset.consent;
      if (!decision) return;
      localStorage.setItem(consentKey, decision === "accept" ? "accepted" : "denied");
      banner.remove();
      if (decision === "accept") loadAnalytics();
    });
  }
})();
