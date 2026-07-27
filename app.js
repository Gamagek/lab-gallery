// app.js
document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("open-nobi");
  const chatForm = document.getElementById("nobi-form");
  const msgInput = document.getElementById("nobi-msg");

  // Initialize Nobi if configured
  if (window.Nobi) {
    window.Nobi.initialize({
      // merchantId: 'YOUR_MERCHANT_ID' 
    });
  }

  // Open chat via custom button
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      if (window.Nobi) window.Nobi.openChat();
    });
  }

  // Submit form and pass message context into Nobi
  if (chatForm && msgInput) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = msgInput.value.trim();
      if (!message) return;

      if (window.Nobi) {
        window.Nobi.openChat({ message });
      }
      msgInput.value = "";
    });
  }
});
