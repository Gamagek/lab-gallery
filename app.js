// app.js
let globalData = [];

async function loadData() {
    const errorDiv = document.getElementById('error-message');
    const galleryGrid = document.getElementById('gallery');
    
    if (galleryGrid) {
        galleryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border-color);">
                <div style="font-size: 1.5rem; margin-bottom: 10px;">⏳</div>
                <h3 style="margin: 0 0 5px 0; color: var(--text-main);">Loading Live Crawlable Intelligence...</h3>
                <p style="margin: 0; color: var(--text-muted);">Retrieving grounded multi-model specs and VIP pricing intelligence.</p>
            </div>
        `;
    }

    try {
        const response = await fetch('./data.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const rawJson = await response.json();
        globalData = Array.isArray(rawJson) ? rawJson : (rawJson.data || []);

        if (!Array.isArray(globalData) || globalData.length === 0) {
            if (errorDiv) errorDiv.textContent = 'Content library is currently empty.';
            if (galleryGrid) galleryGrid.innerHTML = '';
            return;
        }

        if (errorDiv) errorDiv.textContent = '';
        renderCards(globalData);
        setupControls();

    } catch (err) {
        console.error('Fetch error:', err);
        if (errorDiv) errorDiv.textContent = 'Error loading live content library data.';
        if (galleryGrid) galleryGrid.innerHTML = '';
    }
}

function renderCards(items) {
    const galleryGrid = document.getElementById('gallery');
    const schemaContainer = document.getElementById('seo-schema-container') || document.head;
    
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';
    
    items.forEach((item) => {
        const seo = item.seo || item;
        const title = seo.title || item.rawTitle || "Laboratory Review Media";
        const desc = seo.description || "Detailed brand specification analysis and upgrade insights.";
        const url = seo.imageUrl || item.url || "";
        const alt = seo.altText || title;
        const keywordsRaw = seo.keywords || [];
        const keywords = typeof keywordsRaw === 'string' ? keywordsRaw.split(",") : keywordsRaw;

        const comparisonText = seo.comparison || "Detailed specs matrix: High-end optical sensor comparison verified.";
        const vipText = seo.vipTip || "Optimized pricing tips & smart acquisition path available.";

        const article = document.createElement('article');
        article.className = 'media-card';
        article.setAttribute('itemscope', '');
        article.setAttribute('itemtype', 'https://schema.org/TechArticle');

        let mediaElement = `<figure class="media-figure"><img src="${url}" alt="${alt}" loading="lazy" class="media-content" style="width:100%; height:220px; object-fit:cover;"><figcaption class="sr-only">${alt}</figcaption></figure>`;

        article.innerHTML = `
            ${mediaElement}
            <div class="media-info" style="padding: 20px;">
                <h2 class="media-title" itemprop="headline" style="font-size: 1.2rem; margin-bottom: 8px;">${title}</h2>
                <p class="media-desc" itemprop="description" style="font-size: 0.92rem; color: #6c757d; margin-bottom: 15px;">${desc}</p>
                <div class="comparison-box" style="background: rgba(13, 110, 253, 0.08); border-left: 4px solid #0d6efd; padding: 10px 12px; border-radius: 4px; font-size: 0.88rem; margin-bottom: 10px;">
                    📊 <strong>Live Deep Scan & Comparison:</strong> ${comparisonText}
                </div>
                <div class="vip-banner" style="background: rgba(227, 116, 0, 0.1); border-left: 4px solid #e37400; padding: 10px 12px; border-radius: 4px; font-size: 0.85rem; color: #e37400; margin-bottom: 12px; font-weight: 500;">
                    🚀 <strong>VIP Upgrade Guidance:</strong> ${vipText}
                </div>
                <div class="media-tags" style="display:flex; flex-wrap:wrap; gap:5px;">
                    ${keywords.map(tag => `<span class="tag" style="background:rgba(13,110,253,0.1); color:#0d6efd; font-size:0.75rem; padding:3px 8px; border-radius:4px;">#${typeof tag === 'string' ? tag.trim() : tag}</span>`).join("")}
                </div>
            </div>
        `;
        galleryGrid.appendChild(article);

        const schemaObj = seo.schema;
        if (schemaObj && Object.keys(schemaObj).length > 0) {
            try {
                const scriptTag = document.createElement('script');
                scriptTag.type = 'application/ld+json';
                scriptTag.textContent = JSON.stringify(schemaObj);
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

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterAndSearch(query, categoryFilter ? categoryFilter.value : 'all');
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            const category = e.target.value;
            filterAndSearch(searchInput ? searchInput.value.toLowerCase() : '', category);
        });
    }
}

function filterAndSearch(query, category) {
    const filtered = globalData.filter(item => {
        const itemCat = (item.category || "").toLowerCase();
        const matchesCategory = (category === 'all' || itemCat.includes(category.toLowerCase()));
        const seo = item.seo || item;
        const titleText = seo.title || "";
        const descText = seo.description || "";
        const matchesSearch = !query || 
            titleText.toLowerCase().includes(query) ||
            descText.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });
    renderCards(filtered);
}

document.addEventListener('DOMContentLoaded', loadData);
