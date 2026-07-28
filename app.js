// app.js
let globalData = [];

async function loadData() {
    const galleryGrid = document.getElementById('gallery');
    if (galleryGrid) {
        galleryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border-color);">
                <div style="font-size: 1.5rem; margin-bottom: 10px;">⏳</div>
                <h3 style="margin: 0 0 5px 0; color: var(--text-main);">Loading Cloudflare Media Gallery & Comparisons...</h3>
                <p style="margin: 0; color: var(--text-muted);">Retrieving web-grounded video feeds and sub-item inspection blocks.</p>
            </div>
        `;
    }

    try {
        const response = await fetch('./data.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const rawJson = await response.json();
        globalData = Array.isArray(rawJson) ? rawJson : (rawJson.data || []);

        if (!Array.isArray(globalData) || globalData.length === 0) {
            if (galleryGrid) galleryGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No media reviews available yet.</p>';
            return;
        }

        renderCards(globalData);
        setupControls();
    } catch (err) {
        console.error('Fetch error:', err);
        if (galleryGrid) galleryGrid.innerHTML = '<p style="text-align:center; color:red; grid-column:1/-1;">Error loading content library.</p>';
    }
}

function renderCards(items) {
    const galleryGrid = document.getElementById('gallery');
    const schemaContainer = document.getElementById('seo-schema-container') || document.head;
    
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';
    
    items.forEach((item) => {
        const seo = item.seo || item;
        const title = seo.title || item.rawTitle || "Cloudflare Media Review";
        const desc = seo.description || "Detailed specification analysis and upgrade insights.";
        const videoUrl = seo.videoUrl || (item.type === 'video' ? item.url : "");
        const imageUrl = seo.imageUrl || (item.type === 'image' ? item.url : "");
        const alt = seo.altText || title;
        const keywordsRaw = seo.keywords || [];
        const keywords = typeof keywordsRaw === 'string' ? keywordsRaw.split(",") : keywordsRaw;

        const comparisonText = seo.comparison || "Detailed specs matrix verified.";
        const vipText = seo.vipTip || "Optimized pricing tips available.";
        const subItems = seo.subItems || [];

        const article = document.createElement('article');
        article.className = 'media-card';
        article.setAttribute('itemscope', '');
        article.setAttribute('itemtype', 'https://schema.org/TechArticle');

        let mediaElement = '';
        if (videoUrl) {
            mediaElement = `<figure class="media-figure" style="margin:0;"><video controls preload="metadata" style="width:100%; height:240px; background:#000; object-fit:cover;"><source src="${videoUrl}" type="video/mp4">Your browser does not support video.</video></figure>`;
        } else if (imageUrl) {
            mediaElement = `<figure class="media-figure" style="margin:0;"><img src="${imageUrl}" alt="${alt}" loading="lazy" style="width:100%; height:240px; object-fit:cover;"></figure>`;
        }

        // Sub-items comparison blocks rendered under the review
        let subItemsHtml = '';
        if (Array.isArray(subItems) && subItems.length > 0) {
            subItemsHtml = `<div class="sub-items-container" style="margin-top: 15px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
                <h4 style="font-size: 0.95rem; margin: 0 0 8px 0; color: var(--accent);">🔍 Sub-Item & Variant Comparisons:</h4>
                ${subItems.map(sub => `
                    <div style="display: flex; gap: 10px; margin-bottom: 10px; background: rgba(0,0,0,0.02); padding: 8px; border-radius: 6px; align-items: center;">
                        ${sub.imageUrl ? `<img src="${sub.imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" loading="lazy">` : ''}
                        <div>
                            <strong style="font-size: 0.85rem; display: block; color: var(--text-main);">${sub.title || 'Variant'}</strong>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">${sub.comparison || ''}</span>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }

        article.innerHTML = `
            ${mediaElement}
            <div class="media-info" style="padding: 20px;">
                <h2 class="media-title" itemprop="headline" style="font-size: 1.2rem; margin-bottom: 8px;">${title}</h2>
                <p class="media-desc" itemprop="description" style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 15px;">${desc}</p>
                <div class="comparison-box" style="background: rgba(13, 110, 253, 0.08); border-left: 4px solid var(--accent); padding: 10px 12px; border-radius: 4px; font-size: 0.88rem; margin-bottom: 10px;">
                    📊 <strong>Web-Grounded Comparison:</strong> ${comparisonText}
                </div>
                <div class="vip-banner" style="background: rgba(227, 116, 0, 0.1); border-left: 4px solid var(--vip-color); padding: 10px 12px; border-radius: 4px; font-size: 0.85rem; color: var(--vip-color); margin-bottom: 12px; font-weight: 500;">
                    🚀 <strong>VIP Upgrade Guidance:</strong> ${vipText}
                </div>
                ${subItemsHtml}
                <div class="media-tags" style="display:flex; flex-wrap:wrap; gap:5px; margin-top: 12px;">
                    ${keywords.map(tag => `<span class="tag" style="background:rgba(13,110,253,0.1); color:var(--accent); font-size:0.75rem; padding:3px 8px; border-radius:4px;">#${typeof tag === 'string' ? tag.trim() : tag}</span>`).join("")}
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
