// app.js
let globalData = [];

async function loadData() {
    const galleryGrid = document.getElementById('public-gallery') || document.getElementById('gallery');
    if (galleryGrid) {
        galleryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--card, #fff); border-radius: 10px; border: 1px solid var(--border, #dee2e6);">
                <div style="font-size: 1.5rem; margin-bottom: 10px;">⏳</div>
                <h3 style="margin: 0 0 5px 0; color: var(--text, #212529);">Loading Crawlable Multi-Product Intelligence Feed...</h3>
                <p style="margin: 0; color: var(--muted, #6c757d);">Synchronizing comparison options, web-grounded metrics, schema, and meta tags.</p>
            </div>
        `;
    }

    try {
        const response = await fetch('./data.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const rawJson = await response.json();
        globalData = Array.isArray(rawJson) ? rawJson : (rawJson.data || []);

        if (!Array.isArray(globalData) || globalData.length === 0) {
            if (galleryGrid) galleryGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:var(--muted);">No published comparison reviews found in data.json.</p>';
            return;
        }

        renderCards(globalData);
        setupControls();
    } catch (err) {
        console.error('Fetch error:', err);
        if (galleryGrid) galleryGrid.innerHTML = '<p style="text-align:center; color:red; grid-column:1/-1;">Error loading data.json feed from GitHub repository.</p>';
    }
}

function renderCards(items) {
    const galleryGrid = document.getElementById('public-gallery') || document.getElementById('gallery');
    const schemaContainer = document.getElementById('seo-schema-container') || document.head;
    const metaContainer = document.getElementById('crawler-meta-container') || document.head;
    
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';
    schemaContainer.innerHTML = '';
    
    items.forEach((item, index) => {
        const seo = item.seo || item;
        const title = seo.title || item.rawTitle || "Multi-Product Comparison Review";
        const desc = seo.description || "Detailed multi-device specification analysis, benchmark audits, and VIP upgrade intelligence.";
        const videoUrl = seo.videoUrl || (item.type === 'video' ? item.url : "");
        const imageUrl = seo.imageUrl || (seo.image || item.url) || "";
        const alt = seo.altText || title;
        const keywordsRaw = seo.keywords || "";
        const keywords = typeof keywordsRaw === 'string' ? keywordsRaw.split(",") : keywordsRaw;

        const comparisonText = seo.comparison || "Comprehensive multi-product benchmark audit comparing optical sensors, thermal thresholds, and hardware performance.";
        const vipText = seo.vipTip || "Insider VIP Upgrade Trick: Avoid launch-window MSRP, leverage seasonal trade-in credits, or buy certified open-box inventory.";

        // Inject first item's meta tags for web crawlers
        if (index === 0 && metaContainer) {
            metaContainer.innerHTML = `
                <meta name="title" content="${title}">
                <meta name="description" content="${desc}">
                <meta name="keywords" content="${keywordsRaw}">
            `;
        }

        const card = document.createElement('article');
        card.className = 'comparison-card media-card';
        card.setAttribute('itemscope', '');
        card.setAttribute('itemtype', 'https://schema.org/TechArticle');

        let mediaElement = '';
        if (videoUrl) {
            mediaElement = `<video controls preload="metadata" style="width:100%; height:220px; background:#000; object-fit:cover;"><source src="${videoUrl}" type="video/mp4">Your browser does not support video.</video>`;
        } else if (imageUrl) {
            mediaElement = `<img src="${imageUrl}" alt="${alt}" loading="lazy" style="width:100%; height:220px; object-fit:cover;">`;
        }

        card.innerHTML = `
            ${mediaElement}
            <div class="comparison-content media-info" style="padding: 20px;">
                <h2 style="font-size:1.15rem; margin-top:0; margin-bottom:8px;" itemprop="headline">${title}</h2>
                <p style="font-size:0.9rem; color:var(--muted, #6c757d); margin-bottom:14px; line-height: 1.5;" itemprop="description">${desc}</p>
                <div class="box-spec comparison-box" style="background: rgba(13, 110, 253, 0.06); border-left: 4px solid var(--accent, #0d6efd); padding: 10px 12px; border-radius: 4px; font-size: 0.88rem; margin-bottom: 10px; line-height: 1.4;">
                    📊 <strong>Web-Grounded Comparison Options:</strong> ${comparisonText}
                </div>
                <div class="box-vip vip-banner" style="background: rgba(227, 116, 0, 0.08); border-left: 4px solid var(--vip, #e37400); padding: 10px 12px; border-radius: 4px; font-size: 0.85rem; color: var(--vip, #e37400); font-weight: 500; margin-bottom: 12px; line-height: 1.4;">
                    🚀 <strong>VIP Upgrade Guidance & Pricing Tricks:</strong> ${vipText}
                </div>
                <div class="media-tags" style="display:flex; flex-wrap:wrap; gap:5px;">
                    ${Array.isArray(keywords) ? keywords.map(tag => `<span class="tag" style="background:rgba(13,110,253,0.1); color:var(--accent, #0d6efd); font-size:0.75rem; padding:3px 8px; border-radius:4px;">#${typeof tag === 'string' ? tag.trim() : tag}</span>`).join("") : ''}
                </div>
            </div>
        `;
        galleryGrid.appendChild(card);

        const schemaObj = seo.schema;
        if (schemaObj && Object.keys(schemaObj).length > 0) {
            try {
                const scriptTag = document.createElement('script');
                scriptTag.type = 'application/ld+json';
                scriptTag.textContent = JSON.stringify(schemaObj);
                schemaContainer.appendChild(scriptTag);
            } catch (e) {
                console.warn("Schema injection warning", e);
            }
        }
    });
}

function setupControls() {
    const searchInput = document.getElementById('search-input') || document.getElementById('products-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = globalData.filter(item => {
                const seo = item.seo || item;
                return (seo.title || "").toLowerCase().includes(query) || (seo.description || "").toLowerCase().includes(query);
            });
            renderCards(filtered);
        });
    }
}

document.addEventListener('DOMContentLoaded', loadData);
