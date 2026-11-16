(() => {
  const STORAGE = {
    menu: "hien-admin-menu",
    bookings: "hien-admin-bookings",
    orders: "hien-admin-orders",
    cart: "hien-storefront-cart",
    lastOrder: "hien-last-order",
    lastBooking: "hien-last-booking",
  };

  const defaultMenu = [
    { id: "o-long-sua", image: "img/o-long.jpg", name: "Ô long sữa nguyên lá", category: "Trà thủ công", price: 65000, available: true, description: "Hương hoa dịu · Hậu vị ngọt thanh" },
    { id: "croissant-bo-phap", image: "img/croissant.jpg", name: "Croissant bơ Pháp", category: "Bánh mỗi sáng", price: 45000, available: true, description: "Ngàn lớp giòn thơm · Nướng mỗi sáng" },
    { id: "matcha-dau-may", image: "img/matcha.jpg", name: "Matcha dâu mây", category: "Một chút tươi mát", price: 75000, available: true, description: "Matcha Nhật · Dâu rút · Kem sữa" },
    { id: "banh-pho-mai-tra-xanh", image: "img/phomai.jpg", name: "Bánh phô mai trà xanh", category: "Ngọt ngào vừa đủ", price: 68000, available: true, description: "Béo dịu · Thơm trà · Ít ngọt" },
    { id: "o-long-rang-moc", image: "img/lang.jpg", name: "Ô long rang mộc", category: "Trà thủ công", price: 58000, available: true, description: "Thơm hậu gắt · Đậm đà" },
    { id: "tra-sen-thanh-mat", image: "img/sen.jpg", name: "Trà sen thanh mát", category: "Trà thủ công", price: 62000, available: true, description: "Hương sen dịu · Thanh mát" },
    { id: "banh-chuoi-oc-cho", image: "img/chuoi.jpg", name: "Bánh chuối óc chó", category: "Bánh mỗi ngày", price: 48000, available: true, description: "Mềm ẩm · Hạt rang" },
    { id: "banh-quy-bo-tra", image: "img/quy.jpg", name: "Bánh quy bơ trà", category: "Bánh mỗi ngày", price: 35000, available: true, description: "Giòn tan · Thơm bơ sữa" },
  ];

  const defaultOrders = [
    { id: "#HIEN-00131", time: "10:42", customer: "Minh Anh", items: "Ô long sữa ×2, Croissant", total: "175.000đ", payment: "Tiền mặt", status: "Mới" },
    { id: "#HIEN-00130", time: "10:15", customer: "Hoàng Linh", items: "Matcha dâu mây ×3", total: "250.000đ", payment: "Chuyển khoản", status: "Đang chuẩn bị" },
    { id: "#HIEN-00129", time: "09:50", customer: "Thu Hà", items: "Set trà chiều theo mùa", total: "184.000đ", payment: "Chuyển khoản", status: "Đang giao" },
    { id: "#HIEN-00128", time: "09:31", customer: "Quốc Huy", items: "Ô long sữa ×2, Croissant", total: "200.000đ", payment: "Tiền mặt", status: "Đang chuẩn bị" },
    { id: "#HIEN-00127", time: "09:05", customer: "Thảo Nguyên", items: "Bánh phô mai trà xanh ×2", total: "161.000đ", payment: "Chuyển khoản", status: "Hoàn tất" },
  ];

  const defaultBookings = [
    { id: "booking-1", time: "08:30", date: "04/11/2026", name: "Minh Anh", phone: "090 123 45 67", party: "2 người", area: "Bên cửa sổ", status: "Đã xác nhận" },
    { id: "booking-2", time: "11:00", date: "04/11/2026", name: "Hoàng Linh", phone: "093 222 73 18", party: "3–4 người", area: "Góc yên tĩnh", status: "Chờ xác nhận" },
    { id: "booking-3", time: "15:00", date: "05/11/2026", name: "Thu Hà", phone: "098 778 15 22", party: "2 người", area: "Để Hiên chọn", status: "Đã xác nhận" },
    { id: "booking-4", time: "18:30", date: "05/11/2026", name: "Quốc Huy", phone: "091 555 74 07", party: "5–6 người", area: "Bên cửa sổ", status: "Chờ xác nhận" },
  ];

  const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

  function readStored(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
  }

  function writeStored(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function slugify(text) {
    return String(text || "item")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);
  }

  function getCart() {
    return readStored(STORAGE.cart, []);
  }

  function setCart(items) {
    writeStored(STORAGE.cart, items);
    updateCartCount();
  }

  function updateCartCount() {
    const count = getCart().reduce((sum, item) => sum + Number(item.qty || 1), 0);
    document.querySelectorAll(".cartic .cn").forEach((badge) => {
      badge.textContent = String(count);
    });
  }

  function ensureDemoData() {
    readStored(STORAGE.menu, defaultMenu);
    readStored(STORAGE.bookings, defaultBookings);
    readStored(STORAGE.orders, defaultOrders);
    if (!localStorage.getItem(STORAGE.cart)) {
      writeStored(STORAGE.cart, []);
    }
  }

  function getFormSelection(form, groupName) {
    const selected = form.querySelector(`input[name="${groupName}"]:checked`);
    return selected ? selected.value : "";
  }

  function collectOptions(form) {
    const names = [...new Set([...form.querySelectorAll("input[type='radio']")].map((field) => field.name))];
    return names
      .map((name) => getFormSelection(form, name))
      .filter(Boolean);
  }

  function productImageFromPage() {
    const current = document.querySelector(".pic")?.style?.backgroundImage || "";
    const match = current.match(/url\((['"]?)(.*?)\1\)/i);
    return match ? match[2] : "";
  }

  function currentProductInfo() {
    const title = document.querySelector("main h1")?.textContent?.trim() || "Món mới";
    const priceNode = document.querySelector(".price") || document.querySelector("[class*='price']");
    const basePrice = Number(String(priceNode ? priceNode.textContent : "0").replace(/[^\d]/g, "")) || 0;
    const quantityField = document.querySelector("input.qn, input[name='q'], input[type='number']") || { value: "1" };
    const quantity = Math.max(1, Number(quantityField.value || 1));
    return {
      id: `${slugify(title)}-${Date.now()}`,
      name: title,
      price: basePrice,
      qty: quantity,
      options: collectOptions(document.querySelector("form") || document).join(" · "),
      image: productImageFromPage(),
    };
  }

  function addItemToCart(event) {
    const form = event.target.closest("form");
    if (!form || !form.action) return;
    const action = form.action.split("/").pop().toLowerCase();
    if (action !== "cart.html") return;
    event.preventDefault();

    const result = currentProductInfo();
    const cart = getCart();
    const match = cart.find((item) => item.name === result.name && item.options === result.options);
    if (match) {
      match.qty += result.qty;
    } else {
      cart.push(result);
    }
    setCart(cart);
    window.location.href = "cart.html";
  }

  function getLastOrder() {
    return JSON.parse(localStorage.getItem(STORAGE.lastOrder) || "null");
  }

  function renderSuccessPage() {
    const pageName = location.pathname.split("/").pop().toLowerCase();
    const main = document.querySelector("main#app");
    if (!main) return;

    if (pageName === "order-ok.html") {
      const order = getLastOrder();
      if (!order) return;
      const items = order.items || [];
      const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
      const shipping = subtotal > 0 ? 25000 : 0;
      const total = subtotal + shipping;
      main.innerHTML = `
        <section>
          <div class="wrap">
            <p class="small muted crumb"><a href="index.html">Trang chủ</a> / Đặt hàng / Thanh toán / Đặt hàng thành công</p>
            <div class="center">
              <div class="ok">✓</div>
              <p class="eyebrow">Hiên đã nhận đơn của bạn</p>
              <h1>Đặt hàng thành công!</h1>
              <p class="muted">Cảm ơn bạn đã chọn Hiên. Hiên sẽ liên hệ để xác nhận đơn, địa chỉ và thời gian giao phù hợp trước khi chuẩn bị món.</p>
            </div>
            <div class="sech small" style="border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:12px 0;margin-top:20px"><span>Mã đơn hàng <b>${order.id}</b></span><span class="muted">● ${order.status || "Đang chuẩn bị"} · Chờ Hiên xác nhận</span></div>
            <div class="two side">
              <div class="panel">
                <h3>Đơn nhỏ của bạn</h3>
                ${items.map((item) => `
                  <div class="item">
                    <div class="pic " style="background-image:url(${item.image || "img/o-long.jpg"}),var(--grad)" aria-hidden="true"></div>
                    <div><b>${item.name}</b><div class="small muted">${item.options || "Vừa · Nóng"} · ${item.qty}×</div></div>
                    <b>${money(item.price * item.qty)}</b>
                  </div>
                `).join("")}
                <div class="line small"><span>Tạm tính</span><span>${money(subtotal)}</span></div>
                <div class="line small"><span>Giao hàng</span><span>${money(shipping)}</span></div>
                <div class="line small"><span>Ưu đãi</span><span>0đ</span></div>
                <div class="line tot"><b>Tổng thanh toán</b><b class="price">${money(total)}</b></div>
              </div>
              <div>
                <h3>Hiên giao đến bạn</h3>
                <p class="small muted">Giao tận nơi · ${money(shipping)}<br>${order.address || "Địa chỉ bạn đã nhập ở bước thanh toán"}</p>
                <h3>Thanh toán</h3>
                <p class="small muted">${order.payment || "Thanh toán khi nhận hàng"}</p>
                <div class="panel sage small"><b>Bạn cứ thong thả nhé.</b><br><span class="muted">Hiên sẽ báo qua điện thoại khi đơn sẵn sàng.</span></div>
              </div>
            </div>
            <p><a class="btn" href="menu.html">Tiếp tục chọn trà & bánh ↗</a> <a class="btn ghost" href="index.html">Về trang chủ ↗</a></p>
            <p class="small muted">Cần điều chỉnh đơn? Gọi Hiên: 090 123 24 24</p>
          </div>
        </section>
      `;
      return;
    }

    if (pageName === "booking-ok.html") {
      const booking = JSON.parse(localStorage.getItem(STORAGE.lastBooking) || "null");
      if (!booking) return;
      main.innerHTML = `
        <section>
          <div class="wrap">
            <p class="small muted crumb"><a href="index.html">Trang chủ</a> / Đặt bàn / Đặt bàn thành công</p>
            <div class="center">
              <div class="ok">✓</div>
              <p class="eyebrow">Hiên đã ghi nhận yêu cầu của bạn</p>
              <h1>Đặt bàn thành công!</h1>
              <p class="muted">Cảm ơn bạn đã hẹn gặp Hiên. Chúng mình sẽ gọi hoặc nhắn xác nhận trước buổi hẹn bạn mong muốn.</p>
            </div>
            <div class="panel" style="margin-top:24px">
              <h3>Thông tin buổi hẹn</h3>
              <p class="small muted"><b>${booking.name}</b> · ${booking.phone}<br>${booking.date} · ${booking.time}<br>${booking.party} · ${booking.area}</p>
              <p class="small muted">Trạng thái: ${booking.status || "Chờ xác nhận"}</p>
            </div>
            <p><a class="btn" href="menu.html">Xem thực đơn Hiên ↗</a> <a class="btn ghost" href="index.html">Quay về trang chủ ↗</a></p>
          </div>
        </section>
      `;
    }
  }

  function renderCartPage() {
    const pageName = location.pathname.split("/").pop().toLowerCase();
    const main = document.querySelector("main#app");
    if (!main || !(pageName === "cart.html" || pageName === "checkout.html")) return;

    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
    const shipping = subtotal > 0 ? 25000 : 0;
    const total = subtotal + shipping;

    const listHtml = cart.length
      ? cart.map((item) => `
          <div class="item">
            <div class="pic " style="background-image:url(${item.image || "img/o-long.jpg"}),var(--grad)" aria-hidden="true"></div>
            <div><b class="serif">${item.name}</b><div class="small muted">${item.options || "Vừa · Nóng"} · ${item.qty}×</div></div>
            <b class="price">${money(item.price * item.qty)}</b>
          </div>
        `).join("")
      : `<p class="small muted">Giỏ hàng của bạn đang trống. Hãy thêm vài món yêu thích nhé.</p>`;

    if (pageName === "cart.html") {
      main.innerHTML = `
        <section>
          <div class="wrap">
            <p class="small muted crumb"><a href="index.html">Trang chủ</a> / <a href="menu.html">Trà & bánh</a> / Giỏ hàng</p>
            <p class="eyebrow">Giỏ hàng của bạn</p>
            <h1>${cart.length ? "Một chút ngon, sắp đến bên bạn." : "Giỏ hàng chưa có món nào."}</h1>
            <p class="muted">${cart.length ? "02 món nhỏ, được Hiên chuẩn bị bằng thật nhiều thương." : "Hãy chọn một món thơm và để Hiên chuẩn bị trọn vẹn cho bạn."}</p>
            <div class="two side">
              <div>
                <div class="sech small"><b>Món đã chọn</b></div>
                ${listHtml}
                <p class="small"><a class="tl" href="menu.html">← Chọn thêm từ bánh trà</a></p>
              </div>
              <div class="panel sage">
                <h3>Đơn nhỏ của bạn</h3>
                <div class="small muted">Tạm tính · ${cart.reduce((sum, item) => sum + Number(item.qty || 0), 0)} món</div>
                <div class="line tot"><span>Tạm tính</span><b class="price" style="font-size:1.4rem">${money(subtotal)}</b></div>
                <a class="btn wide" href="checkout.html">${cart.length ? "Tiến hành thanh toán" : "Tiếp tục mua hàng"} ↗</a>
                <p class="small muted">Phí giao hàng và ưu đãi sẽ được tính ở bước tiếp theo.</p>
                <p class="small">Hiên đây: 090 123 24 24</p>
              </div>
            </div>
          </div>
        </section>
      `;
      return;
    }

    main.innerHTML = `
      <section>
        <div class="wrap">
          <p class="small muted crumb"><a href="index.html">Trang chủ</a> / <a href="cart.html">Giỏ hàng</a> / Thanh toán</p>
          <p class="eyebrow">Gần xong rồi, thêm chút nữa thôi</p>
          <h1>Hiên giao đến đâu cho bạn?</h1>
          <p class="muted">Thông tin của bạn chỉ dùng để giao hàng và liên hệ khi cần.</p>
          <div class="two side">
            <form id="co" action="order-ok.html">
              <h3>01. Thông tin liên hệ</h3>
              <div class="row">
                <div><label for="nm">Họ và tên *</label><input id="nm" placeholder="Nhập họ và tên" required></div>
                <div><label for="ph">Số điện thoại *</label><input id="ph" inputmode="tel" pattern="[0-9 +]{9,13}" title="Nhập số điện thoại hợp lệ" placeholder="Số điện thoại nhận hàng" required></div>
              </div>
              <label for="em">Email (không bắt buộc)</label><input id="em" type="email" placeholder="Nhập email">
              <h3 style="margin-top:28px">02. Địa chỉ giao hàng</h3>
              <div><label for="ci">Tỉnh / Thành phố *</label><select id="ci" required><option value="">Chọn tỉnh / thành phố</option><option>Hà Nội</option><option>TP. Hồ Chí Minh</option><option>Đà Nẵng</option></select></div>
              <div class="row">
                <div><label for="di">Quận / Huyện *</label><select id="di" required><option value="">Chọn quận / huyện</option><option>Hà Nội</option><option>TP. Hồ Chí Minh</option><option>Đà Nẵng</option></select></div>
                <div><label for="wa">Phường / Xã *</label><select id="wa" required><option value="">Chọn phường / xã</option><option>Hà Nội</option><option>TP. Hồ Chí Minh</option><option>Đà Nẵng</option></select></div>
              </div>
              <label for="ad">Địa chỉ cụ thể *</label><input id="ad" placeholder="Số nhà, tên đường…" required>
              <label for="nt">Ghi chú giao hàng (không bắt buộc)</label><textarea id="nt" rows="3" placeholder="Ví dụ: gọi trước khi đến, để ở bảo vệ…"></textarea>
              <div class="panel sage small" style="margin-top:14px"><b>Giao tận nơi · ${money(shipping)}</b><br><span class="muted">Hiên sẽ gọi báo trước khi tài xế đến.</span></div>
              <h3 style="margin-top:28px">03. Phương thức thanh toán</h3>
              <div class="pay">
                <label class="payc"><input type="radio" name="pay" value="Thanh toán khi nhận hàng" checked><span><b>Thanh toán khi nhận hàng</b><br><small class="muted">Trả tiền mặt khi nhận trà bánh.</small></span></label>
                <label class="payc"><input type="radio" name="pay" value="Chuyển khoản ngân hàng"><span><b>Chuyển khoản ngân hàng</b><br><small class="muted">Thông tin chuyển khoản sẽ hiện sau khi đặt.</small></span></label>
              </div>
            </form>
            <div class="panel">
              <div class="sech"><h3 style="margin:0">Đơn hàng của bạn</h3><a class="tl small" href="cart.html">Chỉnh sửa</a></div>
              ${listHtml}
              <div class="line small"><span>Tạm tính</span><span>${money(subtotal)}</span></div>
              <div class="line small"><span>Giao hàng</span><span>${money(shipping)}</span></div>
              <div class="line small"><span>Ưu đãi</span><span>0đ</span></div>
              <div class="line tot"><b>Tổng thanh toán</b><b class="price">${money(total)}</b></div>
              <button class="btn wide" type="submit" form="co">Đặt hàng · ${money(total)} ↗</button>
              <p class="small muted">Bằng việc đặt hàng, bạn đồng ý với điều khoản của Hiên.</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function handleCheckoutSubmit(event) {
    const form = event.target.closest("form");
    if (!form || !form.action) return;
    const action = form.action.split("/").pop().toLowerCase();
    if (action !== "order-ok.html") return;
    event.preventDefault();

    const cart = getCart();
    if (!cart.length) {
      window.location.href = "menu.html";
      return;
    }

    const name = form.querySelector("#nm")?.value.trim() || "Khách mời";
    const phone = form.querySelector("#ph")?.value.trim() || "";
    const city = form.querySelector("#ci")?.value || "";
    const district = form.querySelector("#di")?.value || "";
    const ward = form.querySelector("#wa")?.value || "";
    const address = form.querySelector("#ad")?.value.trim() || "";
    const payment = form.querySelector("input[name='pay']:checked")?.value || "Thanh toán khi nhận hàng";
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
    const shipping = subtotal > 0 ? 25000 : 0;
    const order = {
      id: `#HIEN-${String(Date.now()).slice(-5)}`,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      customer: name,
      phone,
      items: cart,
      total: subtotal + shipping,
      payment,
      status: "Mới",
      address: `${address}, ${ward}, ${district}, ${city}`.replace(/,\s*,/g, ",").replace(/\s+,/g, ",").trim(),
    };

    const orders = readStored(STORAGE.orders, []);
    orders.unshift(order);
    writeStored(STORAGE.orders, orders);
    writeStored(STORAGE.lastOrder, order);
    writeStored(STORAGE.cart, []);
    updateCartCount();
    window.location.href = "order-ok.html";
  }

  function handleBookingSubmit(event) {
    const form = event.target.closest("form");
    if (!form || !form.action) return;
    const action = form.action.split("/").pop().toLowerCase();
    if (action !== "booking-ok.html") return;
    event.preventDefault();

    const date = form.querySelector("#bd")?.value || "";
    const time = form.querySelector("#bt")?.value || "15:00";
    const party = form.querySelector("input[name='bp']:checked")?.value || "2 người";
    const name = form.querySelector("#bn")?.value.trim() || "Khách mời";
    const phone = form.querySelector("#bph")?.value.trim() || "";
    const area = form.querySelector("input[name='bz']:checked")?.value || "Để Hiên chọn";
    const booking = {
      id: `booking-${Date.now()}`,
      date,
      time,
      party,
      name,
      phone,
      area,
      status: "Chờ xác nhận",
    };

    const bookings = readStored(STORAGE.bookings, []);
    bookings.unshift(booking);
    writeStored(STORAGE.bookings, bookings);
    writeStored(STORAGE.lastBooking, booking);
    window.location.href = "booking-ok.html";
  }

  function bindForms() {
    document.querySelectorAll("form[action*='cart.html']").forEach((form) => {
      form.addEventListener("submit", addItemToCart);
    });

    document.querySelectorAll("form[action*='order-ok.html']").forEach((form) => {
      form.addEventListener("submit", handleCheckoutSubmit);
    });

    document.querySelectorAll("form[action*='booking-ok.html']").forEach((form) => {
      form.addEventListener("submit", handleBookingSubmit);
    });
  }

  function syncMenuAvailability() {
    const items = readStored(STORAGE.menu, defaultMenu);
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
  }

  function init() {
    ensureDemoData();
    syncMenuAvailability();
    updateCartCount();
    renderCartPage();
    renderSuccessPage();
    bindForms();
  }

  init();
})();
