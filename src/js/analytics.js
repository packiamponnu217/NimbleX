
(function () {
  var GA_MEASUREMENT_ID = 'G-5MR0R7YJDL';

  // ----- 1. Load gtag.js and initialize -----
  (function loadGtagScript() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);
  })();

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);

  // ----- 2. Generic event tracking helper -----
  // Usage: NXAnalytics.trackEvent('button_click', { button_name: 'join_now' });
  function trackEvent(eventName, params) {
    if (typeof gtag !== 'function') return;
    gtag('event', eventName, params || {});
  }

  // ----- 3. "Screen" / section view tracking -----
  // Since this is a single-page site, GA4's automatic page_view only fires once
  // on load. To see which sections ("screens") users actually scroll to and view,
  // we fire a custom `section_view` event the first time each section becomes
  // visible in the viewport.
  var seenSections = {};

  function trackSectionView(sectionId, sectionLabel) {
    if (!sectionId || seenSections[sectionId]) return;
    seenSections[sectionId] = true;
    trackEvent('section_view', {
      section_id: sectionId,
      section_name: sectionLabel || sectionId
    });
  }

  function initSectionTracking(sectionIds) {
    if (!window.IntersectionObserver) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          trackSectionView(id, entry.target.getAttribute('data-section-name') || id);
        }
      });
    }, {
      root: null,
      threshold: 0.4 // fire once ~40% of the section is visible
    });

    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  // Kick off section tracking once the DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    initSectionTracking([
      'why',
      'how-it-works',
      'mentors',
      'manager',
      'roadmap',
      'faq',
      'contact'
    ]);
  });

  // ----- Expose helpers globally so main.js can use them -----
  window.NXAnalytics = {
    trackEvent: trackEvent,
    trackSectionView: trackSectionView
  };
})();
