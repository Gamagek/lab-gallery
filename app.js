"use strict";

let media = [];

fetch("data.json", { cache: "no-store" })
    .then(res => res.json())
    .then(data => {
        media = data;
        render(media);
    })
    .catch(err => {
        console.error("Error loading data.json:", err);
        const gallery = document.getElementById("gallery");
        if (gallery) {
            gallery.innerHTML = "<p style='padding: 20px; color: red; text-align: center;'>Error loading media content library.</p>";
        }
    });

function render(items) {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;
    
    gallery.innerHTML = "";
    
    items.forEach(item => {
        const article = document.createElement("article");
        let mediaHTML = "";
        
        const type = (item.type || "").toLowerCase();
        const title = item.seoTitle || item.rawTitle || "Media Review";
        const description = item.description || "";
        const keywords = item.keywords || "";
        const alt = item.alt || title;
        const url = item.url || "";
        const pageLink = item.id ? `pages/${item.id}.html` : "#";

        if (type === "video") {
            mediaHTML = `<video controls preload="none"><source src="${url}"></video>`;
        } else if (type === "audio") {
            mediaHTML = `<audio controls preload="none"><source src="${url}"></audio>`;
        } else {
            mediaHTML = `<img src="${url}" alt="${escapeHTML(alt)}" loading="lazy">`;
        }
        
        article.innerHTML = `
            <figure>
                <a href="${pageLink}">${mediaHTML}</a>
                <figcaption>
                    <h2><a href="${pageLink}">${escapeHTML(title)}</a></h2>
                    <p>${escapeHTML(description)}</p>
                    <small>${escapeHTML(keywords)}</small>
                </figcaption>
            </figure>
        `;
        
        gallery.appendChild(article);

        if (item.schema) {
            try {
                const script = document.createElement("script");
                script.type = "application/ld+json";
                script.textContent = typeof item.schema === 'object' ? JSON.stringify(item.schema) : item.schema;
                article.appendChild(script);
            } catch (e) {
                console.warn("Schema injection error", e);
            }
        }
    });
}

const searchInput = document.getElementById("search");
if (searchInput) {
    searchInput.addEventListener("input", e => {
        const q = e.target.value.toLowerCase().trim();
        const filtered = media.filter(item => {
            const title = (item.seoTitle || item.rawTitle || "").toLowerCase();
            const desc = (item.description || "").toLowerCase();
            const keys = (item.keywords || "").toLowerCase();
            return title.includes(q) || desc.includes(q) || keys.includes(q);
        });
        render(filtered);
    });
}

function escapeHTML(text) {
    if (text == null) return "";
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
