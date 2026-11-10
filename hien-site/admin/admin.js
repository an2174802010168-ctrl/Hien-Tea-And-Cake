(() => {
  const STORAGE = {
    session: "hien-admin-session",
    menu: "hien-admin-menu",
    bookings: "hien-admin-bookings",
    orders: "hien-admin-orders",
  };
  const page = location.pathname.split("/").pop();
  const loginForm = document.querySelector(".login form");

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function readList(key, seed) {
    const stored = localStorage.getItem(key);
    if (stored === null) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }

    const value = JSON.parse(stored);
    if (!Array.isArray(value)) {
      throw new Error(`Dữ liệu quản trị không hợp lệ: ${key}`);
    }
    return value;
  }

  function saveList(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
  }

  function notice(container, message, isError = false) {
    let node = container.querySelector(".admin-notice");
    if (!node) {
      node = document.createElement("p");
      node.className = "admin-notice";
      node.setAttribute("role", "status");
      container.prepend(node);
    }
    node.textContent = message;
    node.classList.toggle("error", isError);
  }

  function protectPage() {
    if (page === "login.html") {
      if (sessionStorage.getItem(STORAGE.session)) location.replace("index.html");
      return;
    }
    if (!sessionStorage.getItem(STORAGE.session)) location.replace("login.html");

    const profile = document.querySelector(".side .me");
    const toolbar = document.querySelector(".main .tb");
    if (profile && toolbar) {
      const email = sessionStorage.getItem(STORAGE.session);
      const logout = document.createElement("button");
      logout.className = "admin-logout";
      logout.type = "button";
      logout.textContent = "Đăng xuất";
      logout.addEventListener("click", () => {
        sessionStorage.removeItem(STORAGE.session);
        location.replace("login.html");
      });
      toolbar.append(logout);
      if (email) profile.title = email;
    }
  }

  function updateAdminSummary() {
    const orders = localStorage.getItem(STORAGE.orders);
    const bookings = localStorage.getItem(STORAGE.bookings);
    const orderItems = orders === null ? null : JSON.parse(orders);
    const bookingItems = bookings === null ? null : JSON.parse(bookings);

    if (Array.isArray(orderItems)) {
      const badge = document.querySelector('.side a[href="orders.html"] .n');
      if (badge) badge.textContent = String(orderItems.filter((item) => item.status === "Mới").length);
      if (page === "index.html") {
        const orderStat = document.querySelector(".stats .stat:nth-child(2)");
        if (orderStat) {
          orderStat.querySelector("b").textContent = String(orderItems.filter((item) => item.status === "Mới").length);
          orderStat.querySelector("span").textContent = "Đang chờ xử lý";
        }
        const table = document.querySelector(".tbl tbody");
        if (table) {
          table.innerHTML = orderItems.slice(0, 5).map((item) => `<tr>
            <td><b>${escapeHtml(item.id)}</b><br><span class="muted small">${escapeHtml(item.time)}</span></td>
            <td>${escapeHtml(item.customer)}</td><td class="small">${escapeHtml(item.items)}</td>
            <td><b>${escapeHtml(item.total)}</b></td><td class="small">${escapeHtml(item.payment)}</td>
            <td><span class="st ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
            <td><a class="btn ghost sm" href="orders.html">Xem</a></td></tr>`).join("");
        }
      }
    }

    if (Array.isArray(bookingItems)) {
      const badge = document.querySelector('.side a[href="bookings.html"] .n');
      if (badge) badge.textContent = String(bookingItems.filter((item) => item.status === "Chờ xác nhận").length);
      if (page === "index.html") {
        const bookingStat = document.querySelector(".stats .stat:nth-child(3)");
        if (bookingStat) {
          bookingStat.querySelector("small").textContent = "Lượt đặt bàn";
          bookingStat.querySelector("b").textContent = String(bookingItems.length);
          bookingStat.querySelector("span").textContent = "Trong danh sách demo";
        }
        const upcoming = document.querySelector(".cols .box:nth-child(2) .dl");
        if (upcoming) {
          upcoming.innerHTML = bookingItems.slice(0, 4).map((item) => `<div>
            <b>${escapeHtml(item.time)} · ${escapeHtml(item.name)}</b>
            <span class="st ${item.status === "Đã xác nhận" ? "s-ok" : item.status === "Đã từ chối" ? "s-no" : "s-new"}">${escapeHtml(item.status)}</span>
          </div>`).join("");
        }
      }
    }

    if (page === "index.html") {
      const subtitle = document.querySelector(".tb p");
      if (subtitle && !subtitle.textContent.includes("Bản demo")) {
        subtitle.textContent += " · Bản demo: dữ liệu lưu trong trình duyệt này.";
      }
    }
  }

  function statusClass(status) {
    return ({
      "Mới": "s-new",
      "Đang chuẩn bị": "s-prep",
      "Đang giao": "s-ship",
      "Hoàn tất": "s-ok",
      "Đã huỷ": "s-no",
      "Đã từ chối": "s-no",
    })[status] || "s-new";
  }

  function setupLogin() {
    if (!loginForm) return;
    const info = document.createElement("p");
    info.className = "admin-demo-note";
    info.textContent = "Bản demo giao diện: thông tin đăng nhập chỉ dùng để mở phiên trong trình duyệt này, không thay thế xác thực bảo mật phía máy chủ.";
    loginForm.querySelector(".center").after(info);

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = loginForm.querySelector("#u").value.trim();
      sessionStorage.setItem(STORAGE.session, email);
      location.assign("index.html");
    });
  }

  function menuSeed() {
    return [...document.querySelectorAll(".tbl tbody tr")].map((row, index) => {
      const cells = row.querySelectorAll("td");
      const checkbox = row.querySelector('input[type="checkbox"]');
      return {
        id: `menu-${index + 1}`,
        image: row.querySelector("img")?.getAttribute("src") || "",
        name: cells[1]?.innerText.trim() || "",
        category: cells[2]?.innerText.trim() || "",
        price: Number((cells[3]?.innerText || "").replace(/\D/g, "")),
        available: Boolean(checkbox?.checked),
        description: "",
      };
    });
  }

  function setupMenu() {
    const table = document.querySelector(".tbl tbody");
    const form = document.querySelector(".cols form");
    if (!table || !form) return;
    const items = readList(STORAGE.menu, menuSeed());
    const formContainer = form.querySelector(".fgrid");

    function render() {
      table.innerHTML = items.map((item) => `<tr data-id="${escapeHtml(item.id)}">
        <td>${item.image ? `<img src="${escapeHtml(item.image)}" alt="">` : ""}</td>
        <td><b>${escapeHtml(item.name)}</b></td>
        <td class="small">${escapeHtml(item.category)}</td>
        <td>${Number(item.price).toLocaleString("vi-VN")}đ</td>
        <td><label class="sw"><input type="checkbox" data-action="availability" ${item.available ? "checked" : ""} aria-label="${item.available ? "Đang bán" : "Tạm ngừng bán"}"><span></span></label></td>
        <td><button class="btn ghost sm" type="button" data-action="edit">Sửa</button></td>
      </tr>`).join("");
      const count = document.querySelector(".tb p");
      if (count) count.textContent = `${items.length} món · bật/tắt để ẩn món hết hàng khỏi website.`;
    }

    table.addEventListener("change", (event) => {
      const input = event.target.closest('[data-action="availability"]');
      if (!input) return;
      const item = items.find((entry) => entry.id === input.closest("tr").dataset.id);
      item.available = input.checked;
      saveList(STORAGE.menu, items);
      notice(formContainer, `${item.name}: ${item.available ? "đang bán" : "đã tạm ngừng bán"}.`);
    });

    table.addEventListener("click", (event) => {
      const button = event.target.closest('[data-action="edit"]');
      if (!button) return;
      const item = items.find((entry) => entry.id === button.closest("tr").dataset.id);
      const name = window.prompt("Tên món", item.name);
      if (name === null) return;
      const price = window.prompt("Giá (đ)", String(item.price));
      if (price === null) return;
      const parsedPrice = Number(price.replace(/\D/g, ""));
      if (!name.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
        notice(formContainer, "Tên món và giá hợp lệ là bắt buộc.", true);
        return;
      }
      item.name = name.trim();
      item.price = parsedPrice;
      saveList(STORAGE.menu, items);
      render();
      notice(formContainer, "Đã cập nhật món.");
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.querySelector("#a1").value.trim();
      const category = form.querySelector("#a2").value;
      const price = Number(form.querySelector("#a3").value);
      const file = form.querySelector("#a6").files[0];
      if (!name || !Number.isFinite(price) || price < 0) {
        notice(formContainer, "Vui lòng nhập tên món và giá hợp lệ.", true);
        return;
      }

      const addItem = (image = "") => {
        items.push({
          id: `menu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name,
          category,
          price,
          image,
          available: true,
          description: form.querySelector("#a5").value.trim(),
        });
        saveList(STORAGE.menu, items);
        render();
        form.reset();
        notice(formContainer, "Đã thêm món vào thực đơn.");
      };

      if (!file) {
        addItem();
      } else if (file.size > 1024 * 1024) {
        notice(formContainer, "Ảnh quá lớn. Vui lòng chọn ảnh dưới 1 MB.", true);
      } else {
        const reader = new FileReader();
        reader.addEventListener("load", () => addItem(String(reader.result)));
        reader.addEventListener("error", () => notice(formContainer, "Không thể đọc ảnh đã chọn.", true));
        reader.readAsDataURL(file);
      }
    });
    render();
  }

  function bookingSeed() {
    return [...document.querySelectorAll(".tbl tbody tr")].map((row, index) => {
      const cells = row.querySelectorAll("td");
      return {
        id: `booking-${index + 1}`,
        time: cells[0]?.innerText.trim() || "",
        date: cells[1]?.innerText.trim() || "",
        name: cells[2]?.childNodes[0]?.textContent.trim() || "",
        phone: cells[2]?.querySelector("span")?.innerText.trim() || "",
        party: cells[3]?.innerText.trim() || "",
        area: cells[4]?.innerText.trim() || "",
        status: cells[5]?.innerText.includes("Chờ") ? "Chờ xác nhận" : "Đã xác nhận",
      };
    });
  }

  function setupBookings() {
    const table = document.querySelector(".tbl tbody");
    if (!table || page !== "bookings.html") return;
    const items = readList(STORAGE.bookings, bookingSeed());
    const filterLinks = [...document.querySelectorAll(".fl .chip")];
    let filter = "all";

    function render() {
      const visible = items.filter((item) => filter === "all" ||
        (filter === "pending" ? item.status === "Chờ xác nhận" : item.status === "Đã xác nhận"));
      table.innerHTML = visible.map((item) => `<tr data-id="${escapeHtml(item.id)}">
        <td><b>${escapeHtml(item.time)}</b></td><td>${escapeHtml(item.date)}</td>
        <td>${escapeHtml(item.name)}<br><span class="muted small">${escapeHtml(item.phone)}</span></td>
        <td>${escapeHtml(item.party)}</td><td>${escapeHtml(item.area)}</td>
        <td><span class="st ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td><div class="act">${item.status === "Chờ xác nhận"
          ? `<button class="btn sm" type="button" data-action="confirm">Xác nhận</button><button class="btn ghost sm" type="button" data-action="decline">Từ chối</button>`
          : `<button class="btn ghost sm" type="button" data-action="details">Chi tiết</button>`}</div></td>
      </tr>`).join("");
      filterLinks.forEach((link, index) => {
        link.classList.toggle("on", ["all", "pending", "confirmed"][index] === filter);
        const status = ["all", "Chờ xác nhận", "Đã xác nhận"][index];
        const count = status === "all" ? items.length : items.filter((item) => item.status === status).length;
        link.textContent = `${["Tất cả", "Chờ xác nhận", "Đã xác nhận"][index]} ${count}`;
      });
    }

    document.querySelector(".fl").addEventListener("click", (event) => {
      const link = event.target.closest(".chip");
      if (!link) return;
      event.preventDefault();
      filter = ["all", "pending", "confirmed"][filterLinks.indexOf(link)];
      render();
    });
    table.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const item = items.find((entry) => entry.id === button.closest("tr").dataset.id);
      if (button.dataset.action === "details") {
        window.alert(`${item.name}\n${item.phone}\n${item.date} · ${item.time}\n${item.party} · ${item.area}\n${item.status}`);
        return;
      }
      if (button.dataset.action === "confirm") item.status = "Đã xác nhận";
      else if (button.dataset.action === "decline") item.status = "Đã từ chối";
      saveList(STORAGE.bookings, items);
      render();
    });

    const add = document.querySelector(".tb .btn");
    add?.addEventListener("click", (event) => {
      event.preventDefault();
      const name = window.prompt("Tên khách");
      if (name === null) return;
      const phone = window.prompt("Số điện thoại");
      if (phone === null) return;
      const time = window.prompt("Giờ đặt (ví dụ 14:30)");
      if (time === null) return;
      const date = window.prompt("Ngày đặt");
      if (date === null) return;
      if (![name, phone, time, date].every((value) => value.trim())) {
        notice(document.querySelector(".box"), "Vui lòng nhập đầy đủ thông tin đặt bàn.", true);
        return;
      }
      items.push({
        id: `booking-${Date.now()}`, name: name.trim(), phone: phone.trim(),
        time: time.trim(), date: date.trim(), party: "2 người", area: "Để Hiên chọn",
        status: "Chờ xác nhận",
      });
      saveList(STORAGE.bookings, items);
      render();
    });
    render();
  }

  function orderSeed() {
    return [...document.querySelectorAll(".tbl tbody tr")].map((row, index) => {
      const cells = row.querySelectorAll("td");
      return {
        id: cells[0]?.querySelector("b")?.innerText.trim() || `#HIEN-${index + 1}`,
        time: cells[0]?.querySelector("span")?.innerText.trim() || "",
        customer: cells[1]?.innerText.trim() || "",
        items: cells[2]?.innerText.trim() || "",
        total: cells[3]?.innerText.trim() || "",
        payment: cells[4]?.innerText.trim() || "",
        status: cells[5]?.innerText.trim() || "Mới",
      };
    });
  }

  function setupOrders() {
    const table = document.querySelector(".tbl tbody");
    if (!table || page !== "orders.html") return;
    const items = readList(STORAGE.orders, orderSeed());
    const filters = [...document.querySelectorAll(".fl .chip")];
    const detail = document.querySelector(".cols > .box:last-child");
    const labels = ["Tất cả", "Mới", "Đang chuẩn bị", "Đang giao", "Hoàn tất", "Đã huỷ"];
    const states = ["all", "Mới", "Đang chuẩn bị", "Đang giao", "Hoàn tất", "Đã huỷ"];
    let filter = "all";
    let selected = items.find((item) => item.id === "#HIEN-00128") || items[0];

    function renderDetail() {
      if (!selected || !detail) return;
      const next = ({ "Mới": "Đang chuẩn bị", "Đang chuẩn bị": "Đang giao", "Đang giao": "Hoàn tất" })[selected.status];
      detail.innerHTML = `<h3>${escapeHtml(selected.id)} <span class="st ${statusClass(selected.status)}">${escapeHtml(selected.status)}</span></h3>
        <div class="dl"><div><span>Khách</span><b>${escapeHtml(selected.customer)}</b></div>
        <div><span>Món</span><b>${escapeHtml(selected.items)}</b></div><div><span>Tổng</span><b class="price">${escapeHtml(selected.total)}</b></div>
        <div><span>Thanh toán</span><b>${escapeHtml(selected.payment)}</b></div>
        <div><span>Thời gian</span><b>${escapeHtml(selected.time)}</b></div></div><hr>
        <div class="act">${next ? `<button class="btn sm" type="button" data-action="advance">${escapeHtml(next)}</button>` : ""}
        ${selected.status !== "Đã huỷ" && selected.status !== "Hoàn tất" ? `<button class="btn ghost sm" type="button" data-action="cancel">Huỷ đơn</button>` : ""}</div>`;
    }

    function render() {
      const visible = items.filter((item) => filter === "all" || item.status === filter);
      table.innerHTML = visible.map((item) => `<tr class="${selected?.id === item.id ? "sel" : ""}" data-id="${escapeHtml(item.id)}">
        <td><b>${escapeHtml(item.id)}</b><br><span class="muted small">${escapeHtml(item.time)}</span></td>
        <td>${escapeHtml(item.customer)}</td><td class="small">${escapeHtml(item.items)}</td>
        <td><b>${escapeHtml(item.total)}</b></td><td class="small">${escapeHtml(item.payment)}</td>
        <td><span class="st ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td><button class="btn ghost sm" type="button" data-action="view">Xem</button></td></tr>`).join("");
      filters.forEach((link, index) => {
        link.classList.toggle("on", states[index] === filter);
        const count = states[index] === "all" ? items.length : items.filter((item) => item.status === states[index]).length;
        link.textContent = `${labels[index]} ${count}`;
      });
      renderDetail();
    }

    document.querySelector(".fl").addEventListener("click", (event) => {
      const link = event.target.closest(".chip");
      if (!link) return;
      event.preventDefault();
      filter = states[filters.indexOf(link)];
      render();
    });
    table.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      selected = items.find((item) => item.id === button.closest("tr").dataset.id);
      render();
    });
    detail?.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]")?.dataset.action;
      if (action === "advance") {
        selected.status = ({ "Mới": "Đang chuẩn bị", "Đang chuẩn bị": "Đang giao", "Đang giao": "Hoàn tất" })[selected.status];
      } else if (action === "cancel") {
        selected.status = "Đã huỷ";
      } else {
        return;
      }
      saveList(STORAGE.orders, items);
      render();
    });
    render();
  }

  protectPage();
  setupLogin();
  setupMenu();
  setupBookings();
  setupOrders();
  updateAdminSummary();
})();
