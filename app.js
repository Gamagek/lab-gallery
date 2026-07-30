"use strict";

let media = [];

// Load JSON data
fetch("data.json")
    .then(res => res.json())
    .then(data => {
        media = data;
        render(media);
    })
    .catch(err => {
        console.error("Error loading data.json:", err);
        const gallery = document.getElementById("gallery");
        if (gallery) {
            gallery.innerHTML = "<p style='padding: 20px; color: red;'>Error loading media content library.</p>";
        }
    });

// Render Gallery
function render(items) {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;
    
    gallery.innerHTML = "";
    
    items.forEach(item => {
        const article = document.createElement("article");
        let mediaHTML = "";
        
        const type = (item.type || "").toLowerCase();
        const title = item.seoTitle || item.title || item.cloudflareTitle || "Media Review";
        const description = item.description || "";
        const keywords = item.keywords || "";
        const alt = item.alt || title;
        const url = item.url || "";

        if (type === "video") {
            mediaHTML = `
                <video controls preload="none">
                    <source src="${url}">
                    Your browser does not support the video tag.
                </video>`;
        } else if (type === "audio") {
            mediaHTML = `
                <audio controls preload="none">
                    <source src="${url}">
                    Your browser does not support the audio tag.
                </audio>`;
        } else {
            mediaHTML = `
                <img src="${url}" alt="${escapeHTML(alt)}" loading="lazy">`;
        }
        
        article.innerHTML = `
            <figure>
                ${mediaHTML}
                <figcaption>
                    <h2>${escapeHTML(title)}</h2>
                    <p>${escapeHTML(description)}</p>
                    <small>${escapeHTML(keywords)}</small>
                </figcaption>
            </figure>
        `;
        
        gallery.appendChild(article);

        // Inject JSON-LD Schema
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

// Client-side Search / Filter
const searchInput = document.getElementById("search");
if (searchInput) {
    searchInput.addEventListener("input", e => {
        const q = e.target.value.toLowerCase().trim();
        const filtered = media.filter(item => {
            const title = (item.seoTitle || item.title || "").toLowerCase();
            const desc = (item.description || "").toLowerCase();
            const keys = (item.keywords || "").toLowerCase();
            return title.includes(q) || desc.includes(q) || keys.includes(q);
        });
        render(filtered);
    });
}

// HTML Escaping Utility
function escapeHTML(text) {
    if (text == null) return "";
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
