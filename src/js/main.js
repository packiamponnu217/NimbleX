(function () {
      // ===== Smooth-scroll nav links (offset for fixed topbar) =====
      var topbarEl = document.getElementById('topbar');
      function scrollToTarget(targetEl) {
        if (!targetEl) return;
        var offset = (topbarEl ? topbarEl.offsetHeight : 65) + 16;
        var top = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
      document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          var id = link.getAttribute('href').slice(1);
          scrollToTarget(document.getElementById(id));
        });
      });

      // ===== Secondary buttons -> scroll to Why NimbleX =====
      document.querySelectorAll('.btn-secondary').forEach(function (btn) {
        btn.addEventListener('click', function () {
          scrollToTarget(document.getElementById('why'));
        });
      });

      // ===== Contact section "Discover More" -> scroll to Why NimbleX =====
      var contactDiscoverBtn = document.getElementById('contactDiscoverBtn');
      if (contactDiscoverBtn) {
        contactDiscoverBtn.addEventListener('click', function () {
          scrollToTarget(document.getElementById('why'));
        });
      }

      // ===== Signup Modal =====
      var modalOverlay = document.getElementById('signupModal');
      var modalForm = document.getElementById('modalForm');
      var modalSuccess = document.getElementById('modalSuccess');
      var signupForm = document.getElementById('signupForm');
      var modalSubmitBtn = document.getElementById('modalSubmitBtn');

      function openModal() {
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
      function closeModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
        // Reset to form view after a beat, in case it was left on success
        setTimeout(function () {
          modalForm.style.display = '';
          modalSuccess.classList.remove('open');
        }, 200);
      }

      // Topbar CTA, final CTA button, and hero primary CTA open the same modal
      document.querySelectorAll('.nav-cta, #finalCtaBtn, #heroCtaPrimary').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openModal();
          if (window.NXAnalytics) {
            window.NXAnalytics.trackEvent('cta_click', { cta_id: btn.id || 'nav_cta' });
          }
        });
      });

      document.getElementById('modalClose').addEventListener('click', closeModal);
      modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeModal();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
      });

      // ===== Mobile hamburger menu =====
      var mobileMenuBtn = document.getElementById('mobileMenuBtn');
      var mobileNavOverlay = document.getElementById('mobileNavOverlay');
      var mobileNavClose = document.getElementById('mobileNavClose');
      var mobileNavCta = document.getElementById('mobileNavCta');

      function openMobileNav() {
        if (!mobileNavOverlay) return;
        mobileNavOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      function closeMobileNav() {
        if (!mobileNavOverlay) return;
        mobileNavOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }

      if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileNav);
      if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
      if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', function (e) {
          if (e.target === mobileNavOverlay) closeMobileNav();
        });
      }
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileNavOverlay && mobileNavOverlay.classList.contains('open')) closeMobileNav();
      });

      document.querySelectorAll('.mobile-nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          closeMobileNav();
          var targetId = link.getAttribute('data-target');
          setTimeout(function () {
            scrollToTarget(document.getElementById(targetId));
          }, 260);
          if (window.NXAnalytics) {
            window.NXAnalytics.trackEvent('nav_click', { nav_target: targetId, nav_type: 'mobile' });
          }
        });
      });

      if (mobileNavCta) {
        mobileNavCta.addEventListener('click', function () {
          closeMobileNav();
          setTimeout(openModal, 260);
          if (window.NXAnalytics) {
            window.NXAnalytics.trackEvent('cta_click', { cta_id: 'mobile_nav_cta' });
          }
        });
      }

      function validateField(groupId, isValid) {
        var group = document.getElementById(groupId);
        group.classList.toggle('has-error', !isValid);
        return isValid;
      }

      signupForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var name = document.getElementById('field-name').value.trim();
        var mobile = document.getElementById('field-mobile').value.trim();
        var email = document.getElementById('field-email').value.trim();
        var city = document.getElementById('field-city').value.trim();
        var level = document.getElementById('field-level').value;
        // var course = document.getElementById('field-course').value; // COURSE FIELD — disabled

        var mobilePattern = /^[+0-9\s-]{7,15}$/;
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        var validName = validateField('group-name', name.length > 1);
        var validMobile = validateField('group-mobile', mobilePattern.test(mobile));
        var validEmail = validateField('group-email', emailPattern.test(email));
        var validCity = validateField('group-city', city.length > 1);
        var validLevel = validateField('group-level', level !== '');
        // var validCourse = validateField('group-course', course !== ''); // COURSE FIELD — disabled

        if (!(validName && validMobile && validEmail && validCity && validLevel)) {
          return;
        }

        modalSubmitBtn.disabled = true;
        modalSubmitBtn.textContent = 'Submitting…';

        submitToGoogleSheets(
          { name: name, mobile: mobile, email: email, city: city, level: level },
          onSubmitSuccess
        );


        function onSubmitSuccess() {
          modalForm.style.display = 'none';
          modalSuccess.classList.add('open');
          modalSubmitBtn.disabled = false;
          modalSubmitBtn.textContent = 'Submit & Start Journey →';
          if (window.NXAnalytics) {
            window.NXAnalytics.trackEvent('sign_up', {
              method: 'signup_form',
              experience_level: level,
              city: city
            });
          }
          signupForm.reset();
          // Reset custom dropdowns
          document.querySelectorAll('.custom-select-trigger').forEach(function(t) {
            t.querySelector('.trigger-text').textContent = 'Select one'; // course reset removed
            t.classList.add('placeholder');
          });
          document.querySelectorAll('.custom-select-option').forEach(function(o) { o.classList.remove('selected'); });
          document.querySelectorAll('.form-group').forEach(function (g) { g.classList.remove('has-error'); });
        }
      });

      // ===== Role-strip tab navigation =====
      document.querySelectorAll('.role-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          document.querySelectorAll('.role-tab').forEach(function (t) {
            t.classList.remove('active');
            var dot = t.querySelector('.role-dot');
            if (dot) dot.style.background = 'transparent';
          });
          tab.classList.add('active');
          var activeDot = tab.querySelector('.role-dot');
          if (activeDot) activeDot.style.background = 'var(--primary)';

          var targetId = tab.getAttribute('data-target');
          if (targetId) {
            scrollToTarget(document.getElementById(targetId));
          }
          if (window.NXAnalytics) {
            window.NXAnalytics.trackEvent('nav_click', { nav_target: targetId, nav_type: 'desktop' });
          }
        });
      });

      // ===== Keep role tabs in sync with scroll position =====
      var navSections = ['why', 'how-it-works', 'mentors', 'manager', 'roadmap', 'faq', 'contact'];
      var navTabs = document.querySelectorAll('.role-tab');
      var mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
      // Sections with no nav tab fall through to the next one that does
      var sectionTabMap = {
        'why': 'why',
        'how-it-works': 'how-it-works',
        'projects': 'how-it-works',
        'mentors': 'mentors',
        'manager': 'manager',
        'tracking': 'manager',
        'roadmap': 'roadmap',
        'faq': 'faq',
        'contact': 'contact'
      };

      function syncActiveTabOnScroll() {
        var offset = (topbarEl ? topbarEl.offsetHeight : 65) + 20;
        var currentId = null;
        navSections.forEach(function (id) {
          var el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top - offset <= 0) {
            currentId = id;
          }
        });
        // Force contact tab active when at bottom of page
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 10) {
          currentId = 'contact';
        }
        var activeTab = currentId !== null ? (sectionTabMap[currentId] || currentId) : null;
        navTabs.forEach(function (t) {
          var isMatch = activeTab !== null && t.getAttribute('data-target') === activeTab;
          t.classList.toggle('active', isMatch);
          var dot = t.querySelector('.role-dot');
          if (dot) dot.style.background = isMatch ? 'var(--primary)' : 'transparent';
        });
        mobileNavLinks.forEach(function (link) {
          link.classList.toggle('active', activeTab !== null && link.getAttribute('data-target') === activeTab);
        });
      }
      window.addEventListener('scroll', syncActiveTabOnScroll, { passive: true });
      syncActiveTabOnScroll();


      // ===== FAQ TOGGLE =====
      document.querySelectorAll('.faq-q').forEach(function (q) {
        q.addEventListener('click', function () {
          var item = q.closest('.faq-item');
          var isOpen = item.classList.contains('open');
          // Close all
          document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
          // Toggle clicked
          if (!isOpen) {
            item.classList.add('open');
            if (window.NXAnalytics) {
              window.NXAnalytics.trackEvent('faq_open', {
                faq_question: q.textContent.trim()
              });
            }
          }
        });
      });

      // ===== LEFT TERMINAL — Typing Animation =====
      (function () {
        var container = document.getElementById('termLeftBody');
        if (!container) return;

        // Lines to type: [prompt?, html_content, delay_after_ms]
        var lines = [
          [true, '<span style="color:var(--primary);">$</span> <span style="color:#C9D1D9;">start journey</span>', 700],
          [false, '<span style="color:#484F58;">Initializing your path...</span>', 500],
          [false, '<span style="color:#10B981;">✓ Learn fundamentals</span>', 350],
          [false, '<span style="color:#10B981;">✓ Practice coding daily</span>', 350],
          [false, '<span style="color:#10B981;">✓ Build real projects</span>', 350],
          [false, '<span style="color:#484F58;">&nbsp;</span>', 200],
          [false, '<span style="color:#8B949E; font-family:Inter,sans-serif; font-size:10px; font-weight:700; letter-spacing:0.05em;">PROGRESS</span>', 200],
          [false, '<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px;"><span style="color:#8B949E;font-family:Inter,sans-serif;">Journey</span><span style="color:#F59E0B;font-weight:700;font-family:Inter,sans-serif;">35%</span></div><div style="height:4px;background:rgba(255,255,255,0.07);border-radius:100px;overflow:hidden;"><div style="height:100%;width:35%;background:linear-gradient(90deg,var(--primary),#F59E0B);border-radius:100px;"></div></div>', 800],
          [true, '<span style="color:var(--primary);">$</span> <span style="color:#C9D1D9;"><span class="cursor"></span></span>', 2000],
        ];

        var lineIdx = 0;
        var charIdx = 0;
        var currentDiv = null;
        var plain = ''; // plain text version for char counting

        function makeDiv() { return document.createElement('div'); }

        function typeNext() {
          if (lineIdx >= lines.length) {
            // Pause then restart
            setTimeout(function () {
              container.innerHTML = '';
              lineIdx = 0; charIdx = 0; currentDiv = null;
              typeNext();
            }, 2000);
            return;
          }

          var item = lines[lineIdx];
          var isPromptLine = item[0];
          var html = item[1];
          var delayAfter = item[2];

          if (charIdx === 0) {
            currentDiv = makeDiv();
            currentDiv.className = 'tl';
            // For non-prompt lines, inject immediately
            if (!isPromptLine) {
              currentDiv.innerHTML = html;
              container.appendChild(currentDiv);
              lineIdx++;
              setTimeout(typeNext, delayAfter);
              return;
            }
            // Prompt lines: inject a cursor first
            currentDiv.innerHTML = html.replace(/<\/span>$/, '</span><span class="cursor"></span>');
            container.appendChild(currentDiv);
            // wait a beat then "type"
            setTimeout(function () {
              currentDiv.innerHTML = html;
              lineIdx++;
              setTimeout(typeNext, delayAfter);
            }, 350 + Math.random() * 200);
            return;
          }
        }

        // Simpler: just reveal lines one-by-one with a delay that feels like typing
        function revealLines() {
          container.innerHTML = '';
          var i = 0;
          function next() {
            if (i >= lines.length) {
              setTimeout(function () { revealLines(); }, 2400);
              return;
            }
            var item = lines[i];
            var div = document.createElement('div');
            div.className = 'tl';
            div.innerHTML = item[1];
            container.appendChild(div);
            i++;
            var waitMs = item[0] ? (40 + Math.random() * 60) : item[2];
            setTimeout(next, waitMs * (item[0] ? 8 : 1));
          }
          next();
        }
        revealLines();
      })();

      // ===== RIGHT TERMINAL — Pipeline Badge Animation =====
      (function () {
        var build = document.getElementById('buildBadge');
        var deploy = document.getElementById('deployBadge');
        var review = document.getElementById('reviewBadge');
        if (!build || !deploy || !review) return;

        function runCycle() {
          // Reset
          build.className = 'pipe-badge pipe-run'; build.textContent = 'RUNNING';
          deploy.className = 'pipe-badge pipe-wait'; deploy.textContent = 'QUEUED';
          review.className = 'pipe-badge pipe-wait'; review.textContent = 'QUEUED';

          setTimeout(function () {
            build.className = 'pipe-badge pipe-pass'; build.textContent = 'PASS';
            deploy.className = 'pipe-badge pipe-run'; deploy.textContent = 'RUNNING';
          }, 2200);

          setTimeout(function () {
            deploy.className = 'pipe-badge pipe-pass'; deploy.textContent = 'PASS';
            review.className = 'pipe-badge pipe-run'; review.textContent = 'RUNNING';
          }, 4200);

          setTimeout(function () {
            review.className = 'pipe-badge pipe-pass'; review.textContent = 'PASS';
          }, 6000);

          // Restart cycle after a pause
          setTimeout(runCycle, 9500);
        }
        setTimeout(runCycle, 1000);
      })();

      // ===== PARALLAX SCROLL OBSERVER =====
      (function () {
        var stepCards = document.querySelectorAll('.hiw-step-card');
        var stepNumEl = document.getElementById('hiw-step-num');
        var stepTitleEl = document.getElementById('hiw-visual-title');
        var progressFill = document.getElementById('hiw-progress');

        if (stepCards.length > 0 && window.IntersectionObserver) {
          var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                stepCards.forEach(function (c) { c.classList.remove('in-view'); });
                entry.target.classList.add('in-view');

                var step = entry.target.getAttribute('data-step');
                var title = entry.target.getAttribute('data-title');

                if (stepNumEl) stepNumEl.innerText = '0' + step;
                if (stepTitleEl) stepTitleEl.innerText = title;
                if (progressFill) {
                  var pct = (step / 6) * 100;
                  progressFill.style.width = pct + '%';
                }
              }
            });
          }, {
            root: null,
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0
          });

          stepCards.forEach(function (card) { observer.observe(card); });
        }
      })();

      // ===== AUTO-OPEN SIGNUP MODAL ONCE PER SESSION =====
      (function() {
        if (sessionStorage.getItem('nx_modal_shown')) return;
        setTimeout(function() {
          var modal = document.getElementById('signupModal');
          if (modal && !modal.classList.contains('open')) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
            sessionStorage.setItem('nx_modal_shown', '1');
            if (window.NXAnalytics) {
              window.NXAnalytics.trackEvent('modal_auto_open', { trigger: 'timed_session' });
            }
          }
        }, 10000);
      })();

      // ===== CUSTOM DROPDOWNS =====
      (function() {
        var dropdowns = [
          { wrap: 'wrap-level',  trigger: 'trigger-level',  panel: 'panel-level',  native: 'field-level' },
          // { wrap: 'wrap-course', trigger: 'trigger-course', panel: 'panel-course', native: 'field-course' } // COURSE FIELD — disabled
        ];

        dropdowns.forEach(function(d) {
          var trigger  = document.getElementById(d.trigger);
          var panel    = document.getElementById(d.panel);
          var native   = document.getElementById(d.native);
          var options  = panel.querySelectorAll('.custom-select-option');

          function openPanel() {
            trigger.classList.add('open');
            panel.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
          }

          function closePanel() {
            trigger.classList.remove('open');
            panel.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
          }

          trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = panel.classList.contains('open');
            // Close all other dropdowns first
            dropdowns.forEach(function(other) {
              document.getElementById(other.trigger).classList.remove('open');
              document.getElementById(other.panel).classList.remove('open');
              document.getElementById(other.trigger).setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) openPanel();
          });

          options.forEach(function(opt) {
            opt.addEventListener('click', function() {
              var val   = opt.getAttribute('data-value');
              var label = opt.textContent.trim();
              // Update trigger label
              trigger.querySelector('.trigger-text').textContent = label;
              trigger.classList.remove('placeholder');
              // Update selected state
              options.forEach(function(o) { o.classList.remove('selected'); });
              opt.classList.add('selected');
              // Sync hidden native select
              native.value = val;
              native.dispatchEvent(new Event('change'));
              closePanel();
              // Clear validation error
              var grp = document.getElementById('group-' + d.native.replace('field-', ''));
              if (grp) grp.classList.remove('has-error');
            });
          });
        });

        // Close on outside click
        document.addEventListener('click', function() {
          dropdowns.forEach(function(d) {
            document.getElementById(d.trigger).classList.remove('open');
            document.getElementById(d.panel).classList.remove('open');
            document.getElementById(d.trigger).setAttribute('aria-expanded', 'false');
          });
        });

        // Close on Escape
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            dropdowns.forEach(function(d) {
              document.getElementById(d.trigger).classList.remove('open');
              document.getElementById(d.panel).classList.remove('open');
              document.getElementById(d.trigger).setAttribute('aria-expanded', 'false');
            });
          }
        });
      })();

    })();

  // ===== Parallax & 3D Tilt Effects =====
(function () {
      var sceneLeft = document.getElementById('parallax-scene-left');
      var sceneRight = document.getElementById('parallax-scene-right');
      if (sceneLeft && typeof Parallax !== 'undefined') new Parallax(sceneLeft);
      if (sceneRight && typeof Parallax !== 'undefined') new Parallax(sceneRight);

      // Initialize 3D Tilt for cards and dashboard
      if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".card"), {
          max: 15,
          speed: 400,
          glare: true,
          "max-glare": 0.2,
        });
        VanillaTilt.init(document.querySelector(".dash-panel"), {
          max: 5,
          speed: 400,
          glare: true,
          "max-glare": 0.1,
        });
      }
    })();

    // ======= Download Brochure Button ========== //

document.getElementById("downloadBrochure").addEventListener("click", function (e) {
    e.preventDefault();

    const link = document.createElement("a");
    link.href = "docs/brochure.pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("download", "NimbleX_Brochure.pdf");
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.NXAnalytics) {
        window.NXAnalytics.trackEvent("file_download", {
            file_name: "NimbleX_Brochure.pdf",
            link_url: "docs/brochure.pdf"
        });
    }
});
