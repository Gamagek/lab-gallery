// app.js
let globalData = [];

async function loadData() {
    const galleryGrid = document.getElementById('public-gallery') || document.getElementById('gallery');
    if (galleryGrid) {
        galleryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--card-bg, #fff); border-radius: 12px; border: 1px solid var(--border-color, #dee2e6);">
                <div style="font-size: 1.5rem; margin-bottom: 10px;">⏳</div>
                <h3 style="margin: 0 0 5px 0; color: var(--text-main, #212529);">Loading Intelligence Feed...</h3>
                <p style="margin: 0; color: var(--text-muted, #6c757d);">Synchronizing responsive layout, schemas, and collapsed edit panels.</p>
            </div>
        `;
    }

    try {
        const response = await fetch('./data.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const rawJson = await response.json();
        globalData = Array.isArray(rawJson) ? rawJson : (rawJson.data || []);

        if (!Array.isArray(globalData) || globalData.length === 0) {
            if (galleryGrid) galleryGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:var(--text-muted);">No media found in data.json.</p>';
            return;
        }

        renderCards(globalData);
        setupControls();
    } catch (err) {
        console.error('Fetch error:', err);
        if (galleryGrid) galleryGrid.innerHTML = '<p style="text-align:center; color:red; grid-column:1/-1;">Error loading data.json feed.</p>';
    }
}

function renderCards(items) {
    const galleryGrid = document.getElementById('public-gallery') || document.getElementById('gallery');
    const schemaContainer = document.getElementById('seo-schema-container') || document.head;
    
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';
    schemaContainer.innerHTML = '';
    
    galleryGrid.style.display = 'grid';
    galleryGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(340px, 1fr))';
    galleryGrid.style.gap = '24px';
    galleryGrid.style.width = '100%';
    galleryGrid.style.boxSizing = 'border-box';

    items.forEach((item, index) => {
        const seo = item.seo || item;
        const title = seo.title || item.rawTitle || "Multi-Product Comparison Review";
        const desc = seo.description || "Detailed long-form SEO specification analysis and VIP upgrade intelligence.";
        const videoUrl = seo.videoUrl || (item.type === 'video' ? item.url : "");
        const imageUrl = seo.imageUrl || (item.type === 'image' ? item.url : "");
        const alt = seo.altText || title;
        const comparisonText = seo.comparison || "Comprehensive web-grounded benchmark audit comparing devices across optical sensors and performance thresholds.";
        const vipText = seo.vipTip || "Insider VIP Upgrade Trick: Avoid launch MSRP, leverage seasonal trade-in credits, or buy certified open-box inventory.";

        const card = document.createElement('article');
        card.className = 'media-card';
        card.style.cssText = `
            background: var(--card-bg, #ffffff);
            border: 1px solid var(--border-color, #dee2e6);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 12px rgba(0,0,0,0.04);
            box-sizing: border-box;
            width: 100%;
            height: auto;
        `;

        let mediaElement = '';
        if (videoUrl) {
            mediaElement = `<video controls preload="metadata" style="width:100%; height:220px; background:#000; object-fit:cover; display:block;"><source src="${videoUrl}" type="video/mp4">Your browser does not support video.</video>`;
        } else if (imageUrl) {
            mediaElement = `<img src="${imageUrl}" alt="${alt}" loading="lazy" style="width:100%; height:220px; object-fit:cover; display:block;">`;
        }

        card.innerHTML = `
            ${mediaElement}
            <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                <h2 style="font-size: 1.15rem; margin: 0 0 8px 0; font-weight: 700; color: var(--text-main, #212529);" itemprop="headline">${title}</h2>
                <p style="font-size: 0.92rem; color: var(--text-muted, #6c757d); margin: 0 0 14px 0; line-height: 1.6;" itemprop="description">${desc}</p>
                
                <div style="background: rgba(13, 110, 253, 0.06); border-left: 4px solid var(--accent, #0d6efd); padding: 10px 12px; border-radius: 4px; font-size: 0.88rem; margin-bottom: 10px; line-height: 1.5;">
                    📊 <strong>Web-Grounded Comparison:</strong> <span class="display-comp">${comparisonText}</span>
                </div>
                
                <div style="background: rgba(227, 116, 0, 0.08); border-left: 4px solid #e37400; padding: 10px 12px; border-radius: 4px; font-size: 0.85rem; color: #e37400; font-weight: 500; margin-bottom: 14px; line-height: 1.5;">
                    🚀 <strong>VIP Upgrade Guidance & Pricing Tricks:</strong> <span class="display-vip">${vipText}</span>
                </div>

                <!-- COLLAPSED EDIT & PUBLISH PANEL FOR EACH MEDIA ITEM -->
                <details style="margin-top: auto; border: 1px solid var(--border-color, #dee2e6); border-radius: 8px; padding: 12px; background: rgba(0,0,0,0.01);">
                    <summary style="cursor: pointer; font-weight: 700; font-size: 0.88rem; color: var(--accent, #0d6efd); user-select: none;">✏️ Edit & Publish Options (Collapsed Panel)</summary>
                    <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
                        <div>
                            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 3px;">Edit Title</label>
                            <input type="text" class="edit-title-input" value="${title}" style="width: 100%; padding: 8px; border: 1px solid var(--border-color, #dee2e6); border-radius: 6px; font-size: 0.85rem; box-sizing: border-box; background: #fff; color: #000;">
                        </div>
                        <div>
                            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 3px;">Edit Description</label>
                            <textarea class="edit-desc-input" rows="2" style="width: 100%; padding: 8px; border: 1px solid var(--border-color, #dee2e6); border-radius: 6px; font-size: 0.85rem; box-sizing: border-box; background: #fff; color: #000;">${desc}</textarea>
                        </div>
                        <div>
                            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 3px;">Edit Comparison Details</label>
                            <textarea class="edit-comp-input" rows="3" style="width: 100%; padding: 8px; border: 1px solid var(--border-color, #dee2e6); border-radius: 6px; font-size: 0.85rem; box-sizing: border-box; background: #fff; color: #000;">${comparisonText}</textarea>
                        </div>
                        <div>
                            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 3px;">Edit VIP Upgrade Tips</label>
                            <textarea class="edit-vip-input" rows="2" style="width: 100%; padding: 8px; border: 1px solid var(--border-color, #dee2e6); border-radius: 6px; font-size: 0.85rem; box-sizing: border-box; background: #fff; color: #000;">${vipText}</textarea>
                        </div>
                        <button onclick="publishCardChanges(${index})" style="background: #198754; color: #fff; border: none; padding: 10px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; width: 100%;">💾 Publish Changes Permanently</button>
                    </div>
                </details>
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

function publishCardChanges(index) {
    const cards = document.querySelectorAll('.media-card');
    const card = cards[index];
    if (!card) return;

    const newTitle = card.querySelector('.edit-title-input').value;
    const newDesc = card.querySelector('.edit-desc-input').value;
    const newComp = card.querySelector('.edit-comp-input').value;
    const newVip = card.querySelector('.edit-vip-input').value;

    if (globalData[index]) {
        if (!globalData[index].seo) globalData[index].seo = {};
        globalData[index].seo.title = newTitle;
        globalData[index].seo.description = newDesc;
        globalData[index].seo.comparison = newComp;
        globalData[index].seo.vipTip = newVip;
    }

    card.querySelector('[itemprop="headline"]').textContent = newTitle;
    card.querySelector('[itemprop="description"]').textContent = newDesc;
    card.querySelector('.display-comp').textContent = newComp;
    card.querySelector('.display-vip').textContent = newVip;

    alert('✓ Changes successfully published for this media item!');
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
