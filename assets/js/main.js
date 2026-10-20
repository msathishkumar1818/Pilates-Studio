/**
 * PILATES STUDIO — CENTRALIZED GLOBAL SCRIPTS
 * Handles: Preloader, Dark Mode (#000000), RTL/LTR, Click-Only Home Dropdown,
 * Mobile Drawer & Accordion, Active Navigation, and Scroll-to-Top.
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Branded Preloader
  // -------------------------------------------------------------------------
  function initPreloader() {
    const preloader = document.getElementById('page-preloader');
    if (!preloader) return;

    const hidePreloader = () => {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.style.display = 'none';
        }
      }, 550);
    };

    if (document.readyState === 'complete') {
      setTimeout(hidePreloader, 300);
    } else {
      window.addEventListener('load', () => setTimeout(hidePreloader, 350));
      // Safety fallback
      setTimeout(hidePreloader, 2000);
    }
  }

  // -------------------------------------------------------------------------
  // 2. Dark Mode Toggle (#000000 Strict Base)
  // -------------------------------------------------------------------------
  function initDarkMode() {
    const themeToggles = document.querySelectorAll('.theme-toggle-btn');
    const savedTheme = localStorage.getItem('pilates_theme');

    const applyTheme = (isDark) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('pilates_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('pilates_theme', 'light');
      }
      updateThemeIcons(isDark);
    };

    const updateThemeIcons = (isDark) => {
      themeToggles.forEach(btn => {
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        const sunPath = btn.querySelector('.theme-icon-sun');
        const moonPath = btn.querySelector('.theme-icon-moon');
        const textSpan = btn.querySelector('.theme-text-label');
        if (sunPath && moonPath) {
          sunPath.style.display = isDark ? 'block' : 'none';
          moonPath.style.display = isDark ? 'none' : 'block';
        }
        if (textSpan) {
          textSpan.textContent = isDark ? 'LIGHT' : 'DARK';
        }
      });
    };

    // Initial state
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    applyTheme(initialDark);

    // Click handler
    themeToggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentlyDark = document.documentElement.classList.contains('dark');
        applyTheme(!currentlyDark);
      });
    });
  }

  // -------------------------------------------------------------------------
  // 3. RTL / LTR Direction Persistence
  // -------------------------------------------------------------------------
  function initDirection() {
    const rtlToggles = document.querySelectorAll('.rtl-toggle-btn');
    const savedDir = localStorage.getItem('pilates_dir');

    const applyDirection = (dir) => {
      document.documentElement.dir = dir;
      localStorage.setItem('pilates_dir', dir);
      rtlToggles.forEach(btn => {
        btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to left to right' : 'Switch to right to left');
        const label = btn.querySelector('.rtl-label');
        if (label) {
          label.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
        }
      });
    };

    // Initial state (default 'ltr' unless explicitly stored 'rtl')
    applyDirection(savedDir === 'rtl' ? 'rtl' : 'ltr');

    rtlToggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentDir = document.documentElement.dir;
        applyDirection(currentDir === 'rtl' ? 'ltr' : 'rtl');
      });
    });
  }

  // -------------------------------------------------------------------------
  // 4. Click-Only Desktop Home Dropdown
  // -------------------------------------------------------------------------
  function initDesktopDropdown() {
    const dropdownItems = document.querySelectorAll('.has-dropdown');

    dropdownItems.forEach(item => {
      const toggleBtn = item.querySelector('.dropdown-toggle');
      if (!toggleBtn) return;

      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = item.classList.contains('dropdown-open');
        // Close any other open dropdowns
        dropdownItems.forEach(other => {
          if (other !== item) other.classList.remove('dropdown-open');
        });

        item.classList.toggle('dropdown-open', !isOpen);
        toggleBtn.setAttribute('aria-expanded', String(!isOpen));
      });

      // Clicking sublinks closes the dropdown
      const subLinks = item.querySelectorAll('.dropdown-link');
      subLinks.forEach(subLink => {
        subLink.addEventListener('click', () => {
          item.classList.remove('dropdown-open');
          toggleBtn.setAttribute('aria-expanded', 'false');
        });
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      dropdownItems.forEach(item => {
        if (!item.contains(e.target)) {
          item.classList.remove('dropdown-open');
          const toggleBtn = item.querySelector('.dropdown-toggle');
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Keyboard escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdownItems.forEach(item => {
          item.classList.remove('dropdown-open');
          const toggleBtn = item.querySelector('.dropdown-toggle');
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  // -------------------------------------------------------------------------
  // 5. Mobile Drawer & Mobile Accordion
  // -------------------------------------------------------------------------
  function initMobileMenu() {
    const openBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('mobile-drawer-close');
    const backdrop = document.getElementById('mobile-backdrop');
    const drawer = document.getElementById('mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link:not(.accordion-toggle), .mobile-sub-link, .mobile-login-btn, .mobile-cta-btn');

    if (!drawer) return;

    const accordionToggles = document.querySelectorAll('.accordion-toggle');

    // Helper to close all mobile accordions
    const closeAllAccordions = () => {
      accordionToggles.forEach(btn => {
        const parentItem = btn.closest('.mobile-nav-item');
        if (parentItem) {
          parentItem.classList.remove('accordion-open');
        }
        btn.setAttribute('aria-expanded', 'false');
      });
    };

    const openMenu = () => {
      // Ensure dropdown is always closed by default when opening menu
      closeAllAccordions();
      drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
      // Automatically close dropdown when closing menu
      closeAllAccordions();
      drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    };

    if (openBtn) openBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);

    // Any navigation item click closes the mobile menu and dropdown
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeAllAccordions();
        closeMenu();
      });
    });

    // Mobile Accordion: Click ONLY on Home toggle button opens/toggles the dropdown
    accordionToggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const parentItem = btn.closest('.mobile-nav-item');
        if (!parentItem) return;

        const isOpen = parentItem.classList.contains('accordion-open');
        // Close any other accordions first
        closeAllAccordions();

        // Toggle open state only on this button click
        if (!isOpen) {
          parentItem.classList.add('accordion-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Auto-close dropdown when clicking anywhere else inside the drawer
    drawer.addEventListener('click', (e) => {
      const clickedNavItem = e.target.closest('.mobile-nav-item');
      // If click is not inside the accordion nav item, automatically close dropdown
      if (!clickedNavItem || !clickedNavItem.querySelector('.accordion-toggle')) {
        closeAllAccordions();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllAccordions();
        closeMenu();
      }
    });
  }

  // -------------------------------------------------------------------------
  // 6. Active Navigation Detection
  // -------------------------------------------------------------------------
  function initActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const allLinks = document.querySelectorAll('.nav-link, .dropdown-link, .mobile-nav-link, .mobile-sub-link');

    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkFile = href.split('/').pop().split('#')[0];
      if (linkFile === currentPath || (currentPath === '' && linkFile === 'index.html')) {
        link.classList.add('active');
        // If it's a dropdown link, also mark parent
        const parentItem = link.closest('.has-dropdown');
        if (parentItem) {
          const parentToggle = parentItem.querySelector('.dropdown-toggle');
          if (parentToggle) parentToggle.classList.add('active');
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // 7. Scroll to Top & Header Shadow
  // -------------------------------------------------------------------------
  function initScrollBehavior() {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const header = document.querySelector('.site-header');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      // Header shadow
      if (header) {
        if (scrollY > 15) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      // Scroll to top button visibility
      if (scrollToTopBtn) {
        if (scrollY > 300) {
          scrollToTopBtn.classList.add('show');
        } else {
          scrollToTopBtn.classList.remove('show');
        }
      }
    }, { passive: true });

    if (scrollToTopBtn) {
      scrollToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  // -------------------------------------------------------------------------
  // 8. Auth Portal Tabs (Sign In / Register Switcher)
  // -------------------------------------------------------------------------
  function initAuthTabs() {
    const tabBtns = document.querySelectorAll('.auth-tab-btn, .auth-tab-pill');
    const tabPanels = document.querySelectorAll('.auth-panel');
    const switchLinks = document.querySelectorAll('[data-switch-tab]');

    if (!tabBtns.length || !tabPanels.length) return;

    function activateTab(targetId) {
      tabBtns.forEach(btn => {
        const matches = btn.getAttribute('data-tab') === targetId;
        btn.classList.toggle('active', matches);
        btn.setAttribute('aria-selected', matches ? 'true' : 'false');
      });

      tabPanels.forEach(panel => {
        const matches = panel.id === targetId;
        panel.classList.toggle('active', matches);
        panel.hidden = !matches;
      });
    }

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-tab');
        if (target) activateTab(target);
      });
    });

    switchLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-switch-tab');
        if (target) activateTab(target);
      });
    });
  }

  // -------------------------------------------------------------------------
  // 9. Dashboard Slot Booking & Filter Engine
  // -------------------------------------------------------------------------
  function initDashboardInteractions() {
    // Sidebar Toggle (Mobile Drawer & Desktop Collapse)
    const sidebarToggle = document.getElementById('dash-sidebar-toggle');
    const sidebar = document.getElementById('dash-sidebar');
    const layoutContainer = document.querySelector('.dash-layout-container');
    const backdrop = document.getElementById('dash-sidebar-backdrop');
    const sidebarClose = document.getElementById('dash-sidebar-close');

    if (sidebarToggle && sidebar) {
      const openSidebar = () => {
        sidebar.classList.add('mobile-open');
        if (backdrop) backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
      };

      const closeSidebar = () => {
        sidebar.classList.remove('mobile-open');
        if (backdrop) backdrop.classList.remove('open');
        document.body.style.overflow = '';
      };

      sidebarToggle.addEventListener('click', () => {
        if (window.innerWidth <= 1032) {
          if (sidebar.classList.contains('mobile-open')) {
            closeSidebar();
          } else {
            openSidebar();
          }
        } else if (layoutContainer) {
          layoutContainer.classList.toggle('sidebar-collapsed');
        }
      });

      if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
      }

      if (backdrop) {
        backdrop.addEventListener('click', closeSidebar);
      }

      // Close sidebar when clicking a nav item on mobile
      const navItems = sidebar.querySelectorAll('.dash-nav-item');
      navItems.forEach(item => {
        item.addEventListener('click', () => {
          if (window.innerWidth <= 1032) {
            closeSidebar();
          }
        });
      });
    }

    // Slot Filters by Level and Instructor
    const filterPills = document.querySelectorAll('.filter-pill-btn');
    const slotCards = document.querySelectorAll('.slot-booking-card');

    if (filterPills.length && slotCards.length) {
      let activeLevel = 'all';
      let activeInstructor = 'all';

      filterPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
          e.preventDefault();
          const group = pill.getAttribute('data-filter-group');
          const value = pill.getAttribute('data-filter-value');

          // Highlight active pill in group
          document.querySelectorAll(`.filter-pill-btn[data-filter-group="${group}"]`).forEach(btn => {
            btn.classList.remove('active');
          });
          pill.classList.add('active');

          if (group === 'level') activeLevel = value;
          if (group === 'instructor') activeInstructor = value;

          // Filter cards
          slotCards.forEach(card => {
            const cardLevel = card.getAttribute('data-level');
            const cardInst = card.getAttribute('data-instructor');

            const matchLevel = (activeLevel === 'all' || cardLevel === activeLevel);
            const matchInst = (activeInstructor === 'all' || cardInst === activeInstructor);

            card.style.display = (matchLevel && matchInst) ? 'flex' : 'none';
          });
        });
      });
    }

    // Reserve Slot Action Feedback
    const reserveBtns = document.querySelectorAll('.slot-reserve-btn');
    reserveBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isBooked = btn.classList.contains('booked');
        if (!isBooked) {
          btn.classList.add('booked');
          btn.innerHTML = '<span>Slot Confirmed ✓</span>';
          btn.setAttribute('aria-label', 'Slot booked successfully');
        } else {
          btn.classList.remove('booked');
          btn.innerHTML = '<span>Reserve Slot</span>';
          btn.setAttribute('aria-label', 'Reserve reformer slot');
        }
      });
    });

    // Auto-Renewal Toggle Switch text feedback
    const renewCheckbox = document.getElementById('renewal-checkbox');
    const renewStatusText = document.getElementById('renewal-status-text');
    if (renewCheckbox && renewStatusText) {
      renewCheckbox.addEventListener('change', () => {
        if (renewCheckbox.checked) {
          renewStatusText.textContent = 'Active Auto-Renewal ($285/mo)';
          renewStatusText.style.color = '#16a34a';
        } else {
          renewStatusText.textContent = 'Auto-Renewal Paused';
          renewStatusText.style.color = 'var(--text-muted)';
        }
      });
    }
  }

  // -------------------------------------------------------------------------
  // 10. Password Visibility Toggle (Show / Hide Password)
  // -------------------------------------------------------------------------
  function initPasswordToggle() {
    const toggles = document.querySelectorAll('.auth-password-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const wrap = toggle.closest('.auth-field-input-wrap');
        if (!wrap) return;
        const input = wrap.querySelector('input');
        const eyeShow = toggle.querySelector('.eye-show');
        const eyeHide = toggle.querySelector('.eye-hide');
        if (input) {
          const isPassword = input.type === 'password';
          input.type = isPassword ? 'text' : 'password';
          if (eyeShow && eyeHide) {
            eyeShow.style.display = isPassword ? 'none' : 'block';
            eyeHide.style.display = isPassword ? 'block' : 'none';
          }
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // Initialize Everything on DOMContentLoaded
  // -------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initDarkMode();
    initDirection();
    initDesktopDropdown();
    initMobileMenu();
    initActiveNav();
    initScrollBehavior();
    initAuthTabs();
    initPasswordToggle();
    initDashboardInteractions();
  });
})();


