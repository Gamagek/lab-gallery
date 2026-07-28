// app.js - Cloudflare Media & Comparison Studio Frontend
let globalData = [];
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyMa1xbj8MAeSXIoCK_tJ9_1GKbJl09UrpltoR5N-zIUVxeQItbPVH9PuWfzcGpRqromw/exec";
const ADMIN_PASSWORD = "SecretAdminPassword123";

async function loadData() {
    const galleryGrid = document.getElementById('public-gallery') || document.getElementById('gallery');
    if (galleryGrid) {
        galleryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--card-bg, #fff); border-radius: 12px; border: 1px solid var(--border-color, #dee2e6);">
                <div style="font-size: 1.5rem; margin-bottom: 10px;">⏳</div>
                <h3 style="margin: 0 0 5px 0; color: var(--text-main, #212529);">Loading Intelligence Feed...</h3>
                <p style="margin: 0; color: var(--text-muted, #6c757d);">Synchronizing multi-tier web grounding and SEO panels.</p>
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
        const comparisonText = seo.comparison || "Comprehensive multi-tier web-grounded benchmark audit comparing devices across optical sensors and performance thresholds.";
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
                    📊 <strong>Resilient Grounding Intelligence:</strong> <span class="display-comp">${comparisonText}</span>
                </div>
                
                <div style="background: rgba(227, 116, 0, 0.08); border-left: 4px solid #e37400; padding: 10px 12px; border-radius: 4px; font-size: 0.85rem; color: #e37400; font-weight: 500; margin-bottom: 14px; line-height: 1.5;">
                    🚀 <strong>VIP Upgrade Guidance & Pricing Tricks:</strong> <span class="display-vip">${vipText}</span>
                </div>

                <details style="margin-top: auto; border: 1px solid var(--border-color, #dee2e6); border-radius: 8px; padding: 12px; background: rgba(0,0,0,0.01);">
                    <summary style="cursor: pointer; font-weight: 700; font-size: 0.88rem; color: var(--accent, #0d6efd); user-select: none;">⚡ Run Resilient Grounding Pipeline</summary>
                    <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
                        <div>
                            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 3px;">Enter Products to Compare</label>
                            <input type="text" class="grounding-query-input" value="iPhone vs Samsung comparison" style="width: 100%; padding: 8px; border: 1px solid var(--border-color, #dee2e6); border-radius: 6px; font-size: 0.85rem; box-sizing: border-box; background: #fff; color: #000;">
                        </div>
                        <button onclick="runLiveWebGrounding(${index})" class="ground-btn" style="background: var(--accent, #0d6efd); color: #fff; border: none; padding: 8px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; width: 100%;">🌐 Run Resilient Grounding</button>

                        <hr style="border: 0; border-top: 1px solid var(--border-color, #dee2e6); margin: 6px 0;">

                        <div>
                            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 3px;">Edit Title</label>
                            <input type="text" class="edit-title-input" value="${title}" style="width: 100%; padding: 8px; border: 1px solid var(--border-color, #dee2e6); border-radius: 6px; font-size: 0.85rem; box-sizing: border-box; background: #fff; color: #000;">
                        </div>
                        <div>
                            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 3px;">Edit Rich Description</label>
                            <textarea class="edit-desc-input" rows="2" style="width: 100%; padding: 8px; border: 1px solid var(--border-color, #dee2e6); border-radius: 6px; font-size: 0.85rem; box-sizing: border-box; background: #fff; color: #000;">${desc}</textarea>
                        </div>
                        <div>
                            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 3px;">Edit Grounded Comparison Details</label>
                            <textarea class="edit-comp-input" rows="3" style="width: 100%; padding: 8px; border: 1px solid var(--border-color, #dee2e6); border-radius: 6px; font-size: 0.85rem; box-sizing: border-box; background: #fff; color: #000;">${comparisonText}</textarea>
                        </div>
                        <div>
                            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 3px;">Edit Super Rich VIP Upgrade Tips</label>
                            <textarea class="edit-vip-input" rows="2" style="width: 100%; padding: 8px; border: 1px solid var(--border-color, #dee2e6); border-radius: 6px; font-size: 0.85rem; box-sizing: border-box; background: #fff; color: #000;">${vipText}</textarea>
                        </div>
                        <button onclick="publishCardChanges(${index})" style="background: #198754; color: #fff; border: none; padding: 10px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; width: 100%;">💾 Publish Changes Permanently</button>
                    </div>
                </details>
            </div>
        `;
        galleryGrid.appendChild(card);
    });
}

async function runLiveWebGrounding(index) {
    const cards = document.querySelectorAll('.media-card');
    const card = cards[index];
    if (!card) return;

    const query = card.querySelector('.grounding-query-input').value.trim();
    if (!query) { alert('Please enter comparison query.'); return; }

    const btn = card.querySelector('.ground-btn');
    btn.textContent = "⏳ Running Resilient Pipeline...";
    btn.disabled = true;

    try {
        const payload = {
            action: "run_grounding_comparison",
            password: ADMIN_PASSWORD,
            comparisonQuery: query,
            videoUrl: globalData[index].url || "",
            imageUrl: ""
        };

        const response = await fetch(GAS_WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const res = await response.json();
        if (res.success && res.data) {
            const d = res.data;
            card.querySelector('.edit-title-input').value = d.title || "";
            card.querySelector('.edit-desc-input').value = d.description || "";
            card.querySelector('.edit-comp-input').value = d.comparison || "";
            card.querySelector('.edit-vip-input').value = d.vipTip || "";
            
            globalData[index].seo = d;
            alert('✓ Multi-tier intelligence fetched successfully! Review and click Publish.');
        } else {
            alert('Grounding Error: ' + (res.error || 'Unknown error'));
        }
    } catch (err) {
        console.error(err);
        alert('Network error connecting to backend.');
    } finally {
        btn.textContent = "🌐 Run Resilient Grounding";
        btn.disabled = false;
    }
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

    alert('✓ Changes published locally! Save via Admin Studio to persist permanently to your Sheet and feed.');
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
