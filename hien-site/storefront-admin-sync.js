(() => {
  const saved = localStorage.getItem("hien-admin-menu");
  if (saved === null) return;

  const items = JSON.parse(saved);
  if (!Array.isArray(items)) throw new Error("Dữ liệu thực đơn quản trị không hợp lệ.");

  const availability = new Map(items.map((item) => {
    const filename = String(item.image || "").split("/").pop() || "";
    const slug = filename.replace(/\.[^.]+$/, "");
    return [slug, item.available !== false];
  }));
  const slugForPage = (filename) => filename.replace(/^item-/, "").replace(/\.html$/, "");

  document.querySelectorAll('a.card[href^="item-"]').forEach((card) => {
    const slug = slugForPage(card.getAttribute("href").split("/").pop());
    if (availability.get(slug) === false) card.hidden = true;
  });

  const currentSlug = slugForPage(location.pathname.split("/").pop());
  if (availability.get(currentSlug) === false) {
    const productForm = document.querySelector("#app form");
    if (productForm) {
      productForm.hidden = true;
      const notice = document.createElement("p");
      notice.className = "admin-unavailable";
      notice.setAttribute("role", "status");
      notice.textContent = "Món này hiện đang tạm hết. Hiên hẹn bạn lần sau nhé.";
      productForm.before(notice);
    }
  }
})();
