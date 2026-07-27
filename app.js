// app.js
let globalData = [];

async function loadData() {
    const errorDiv = document.getElementById('error-message');
    
    try {
        const response = await fetch('./data.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        globalData = await response.json();
        if (!Array.isArray(globalData) || globalData.length === 0) {
            errorDiv.textContent = 'Content library is currently empty.';
            return;
        }

        errorDiv.textContent = '';
        renderCards(globalData);
        setupControls();

    } catch (err) {
        console.error('Fetch error:', err);
        errorDiv.textContent = 'Error loading live content library data.';
    }
}

function renderCards(items) {
    const galleryGrid = document.getElementById('gallery');
    const schemaContainer = document.getElementById('seo-schema-container');
    
    galleryGrid.innerHTML = '';
    
    items.forEach((item) => {
        const title = item.seoTitle || item.cloudflareTitle || "Laboratory Review Media";
        const desc = item.description || "Detailed brand specification analysis and upgrade insights.";
        const url = item.url || "";
        const alt = item.alt || title;
        const keywords = item.keywords || [];
        const comparison = item.comparison || "Detailed specs matrix: High-end optical sensor comparison verified.";
        const vipTip = item.vipTip || "Optimized pricing tips & smart acquisition path available.";

        const article = document.createElement('article');
        article.className = 'media-card';
        article.setAttribute('itemscope', '');
        article.setAttribute('itemtype', 'https://schema.org/VideoObject');

        let mediaElement = '';
        if (item.type === 'image') {
            mediaElement = `<figure class="media-figure"><img src="${url}" alt="${alt}" loading="lazy" class="media-content"><figcaption class="sr-only">${alt}</figcaption></figure>`;
        } else if (item.type === 'audio') {
            mediaElement = `<figure class="media-figure"><audio controls preload="metadata" loading="lazy" class="media-content"><source src="${url}" type="audio/mpeg">Your browser does not support the audio tag.</audio><figcaption class="sr-only">${alt}</figcaption></figure>`;
        } else {
            mediaElement = `<figure class="media-figure"><video controls preload="metadata" loading="lazy" class="media-content"><source src="${url}" type="video/mp4">Your browser does not support the video tag.</video><figcaption class="sr-only">${alt}</figcaption></figure>`;
        }

        article.innerHTML = `
            ${mediaElement}
            <div class="media-info">
                <h2 class="media-title" itemprop="name">${title}</h2>
                <p class="media-desc" itemprop="description">${desc}</p>
                <div class="comparison-box" style="background: rgba(13, 110, 253, 0.08); border-left: 4px solid var(--accent); padding: 10px 12px; border-radius: 4px; font-size: 0.88rem; margin-bottom: 10px; color: var(--text-main);">
                    📊 <strong>Live Deep Scan & Comparison:</strong> ${comparison}
                </div>
                <div class="vip-banner">
                    🚀 <strong>VIP Upgrade Guidance:</strong> ${vipTip}
                </div>
                <div class="media-tags">
                    ${keywords.map(tag => `<span class="tag">#${tag.trim()}</span>`).join("")}
                </div>
            </div>
        `;
        galleryGrid.appendChild(article);

        if (item.schema && Object.keys(item.schema).length > 0) {
            try {
                const scriptTag = document.createElement('script');
                scriptTag.type = 'application/ld+json';
                scriptTag.textContent = JSON.stringify(item.schema);
                schemaContainer.appendChild(scriptTag);
            } catch (e) {
                console.warn("Schema insertion warning", e);
            }
        }
    });
}

function setupControls() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterAndSearch(query, categoryFilter.value);
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            const category = e.target.value;
            filterAndSearch(searchInput.value.toLowerCase(), category);
        });
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });
    }
}

function filterAndSearch(query, category) {
    const filtered = globalData.filter(item => {
        const matchesCategory = (category === 'all' || item.type === category);
        const matchesSearch = !query || 
            (item.seoTitle && item.seoTitle.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query)) ||
            (item.comparison && item.comparison.toLowerCase().includes(query)) ||
            (item.vipTip && item.vipTip.toLowerCase().includes(query)) ||
            (item.keywords && item.keywords.some(k => k.toLowerCase().includes(query)));
        return matchesCategory && matchesSearch;
    });
    renderCards(filtered);
}

document.addEventListener('DOMContentLoaded', loadData);
