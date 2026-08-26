/* =========================================================
   LANDING PAGE — Scroll effects, stats counter, animations
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    initScrollNav();
    loadStats();
});

/* ── Navbar scroll effect ── */
function initScrollNav() {
    const nav = document.getElementById('landing-nav');
    if (!nav) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

/* ── Animated stats counter ── */
async function loadStats() {
    try {
        const res = await fetch(`${window.location.origin}/api/v1/admin/public-stats`);
        if (!res.ok) throw new Error('Stats unavailable');
        const data = await res.json();

        animateCounter('stat-properties', data.properties || 0);
        animateCounter('stat-tenants', data.tenants || 0);
        animateCounter('stat-payments', data.payments || 0);

        const revenueEl = document.getElementById('stat-revenue');
        if (revenueEl) {
            animateRevenue(revenueEl, data.revenue || 0);
        }
    } catch (e) {
        document.getElementById('stat-properties').textContent = '0';
        document.getElementById('stat-tenants').textContent = '0';
        document.getElementById('stat-payments').textContent = '0';
        document.getElementById('stat-revenue').textContent = 'Ksh 0';
    }
}

function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        el.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function animateRevenue(element, target) {
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        element.textContent = `Ksh ${current.toLocaleString()}`;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}
