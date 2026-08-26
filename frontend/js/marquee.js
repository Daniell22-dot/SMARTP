/* =========================================================
   RATING MARQUEE — Auto-scrolling testimonials
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    initMarquee();
});

const REVIEWS = [
    { name: 'Grace M.', role: 'Tenant, Westlands', text: 'Paying rent has never been easier. The M-Pesa QR code is so convenient — no more queuing at the bank!', stars: 5 },
    { name: 'James K.', role: 'Landlord, Kilimani', text: 'I can track all my tenants and payments in one dashboard. The reports feature saves me hours every month.', stars: 5 },
    { name: 'Faith W.', role: 'Tenant, Karen', text: 'Maintenance requests are handled so quickly now. I just submit through the app and get updates in real time.', stars: 5 },
    { name: 'Peter O.', role: 'Landlord, Lavington', text: 'The utility tracking feature is a game changer. My tenants know exactly what they owe for water and wifi.', stars: 5 },
    { name: 'Sarah N.', role: 'Tenant, Kileleshwa', text: 'Love the messaging feature. I can communicate directly with my landlord without phone tag.', stars: 5 },
    { name: 'David M.', role: 'Landlord, South B', text: 'Managing multiple properties is so much easier now. The dashboard gives me a clear picture of everything.', stars: 5 },
    { name: 'Mercy A.', role: 'Tenant, Donholm', text: 'The notifications remind me before rent is due. No more late fees! Highly recommend Tuiya Belong.', stars: 5 },
    { name: 'Brian K.', role: 'Landlord, Kasarani', text: 'Setting up was incredibly simple. My tenants were onboarded within a day. Great customer support too.', stars: 5 },
];

function initMarquee() {
    const container = document.getElementById('marquee-container');
    if (!container) return;

    const track = document.createElement('div');
    track.className = 'marquee-track';

    const reviewHTML = REVIEWS.map(review => createReviewCard(review)).join('');
    track.innerHTML = reviewHTML + reviewHTML;

    container.appendChild(track);
}

function createReviewCard(review) {
    const stars = Array(review.stars).fill('<i class="fas fa-star"></i>').join('');
    const initials = review.name.split(' ').map(n => n[0]).join('');

    return `
        <div class="review-card">
            <div class="review-stars">${stars}</div>
            <p>"${review.text}"</p>
            <div class="review-author">
                <div class="review-avatar">${initials}</div>
                <div class="review-author-info">
                    <strong>${review.name}</strong>
                    <span>${review.role}</span>
                </div>
            </div>
        </div>
    `;
}
