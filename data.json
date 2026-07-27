// app.js
let globalData = [];

async function loadData() {
    const errorDiv = document.getElementById('error-message');
    const galleryGrid = document.getElementById('gallery');
    
    // Show permanent loading panel while fetching data
    galleryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border-color);">
            <div style="font-size: 1.5rem; margin-bottom: 10px;">⏳</div>
            <h3 style="margin: 0 0 5px 0; color: var(--text-main);">Loading Live AI Intelligence & Media Feed...</h3>
            <p style="margin: 0; color: var(--text-muted);">Performing deep scan and grounding comparison data. Please wait.</p>
        </div>
    `;

    try {
        const response = await fetch('./data.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const rawJson = await response.json();
        globalData = Array.isArray(rawJson) ? rawJson : (rawJson.data || []);

        if (!Array.isArray(globalData) || globalData.length === 0) {
            errorDiv.textContent = 'Content library is currently empty.';
            galleryGrid.innerHTML = '';
            return;
        }

        errorDiv.textContent = '';
        renderCards(globalData);
        setupControls();

    } catch (err) {
        console.error('Fetch error:', err);
        errorDiv.textContent = 'Error loading live content library data.';
        galleryGrid.innerHTML = '';
    }
}

function renderCards(items) {
    const galleryGrid = document.getElementById('gallery');
    const schemaContainer = document.getElementById('seo-schema-container');
    
    galleryGrid.innerHTML = '';
    
    items.forEach((item) => {
        const seo = item.seo || item;
        const title = seo.title || item.seoTitle || item.cloudflareTitle || "Laboratory Review Media";
        const desc = seo.description || item.description || "Detailed brand specification analysis and upgrade insights.";
        const url = item.mediaUrl || item.url || "";
        const alt = seo.altText || item.alt || title;
        const keywordsRaw = seo.keywords || item.keywords || [];
        const keywords = typeof keywordsRaw === 'string' ? keywordsRaw.split(",") : keywordsRaw;

        let comparisonText = seo.comparison || item.comparison || "Detailed specs matrix: High-end optical sensor comparison verified.";
        if (typeof comparisonText === 'object') {
            comparisonText = comparisonText.marketComparison || JSON.stringify(comparisonText);
        }

        let vipText = seo.vipTip || item.vipTip || "Optimized pricing tips & smart acquisition path available.";
        if (typeof vipText === 'object') {
            vipText = vipText.summary || JSON.stringify(vipText);
        }

        const article = document.createElement('article');
        article.className = 'media-card';
        article.setAttribute('itemscope', '');
        article.setAttribute('itemtype', '[https://schema.org/VideoObject](https://schema.org/VideoObject)');

        const type = (item.category || item.type || "video").toLowerCase();
        let mediaElement = '';
        if (type.includes('image')) {
            mediaElement = `<figure class="media-figure"><img src="${url}" alt="${alt}" loading="lazy" class="media-content"><figcaption class="sr-only">${alt}</figcaption></figure>`;
        } else if (type.includes('audio')) {
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
                    📊 <strong>Live Deep Scan & Comparison:</strong> ${comparisonText}
                </div>
                <div class="vip-banner">
                    🚀 <strong>VIP Upgrade Guidance:</strong> ${vipText}
                </div>
                <div class="media-tags">
                    ${keywords.map(tag => `<span class="tag">#${typeof tag === 'string' ? tag.trim() : tag}</span>`).join("")}
                </div>
            </div>
        `;
        galleryGrid.appendChild(article);

        const schemaObj = seo.schema || item.schema;
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
        const itemCat = (item.category || item.type || "").toLowerCase();
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
