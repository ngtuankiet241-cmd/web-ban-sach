(function () {
  "use strict";
  const root = document.querySelector("#cart-app");
  if (!root) { return; }

  const STATUS_NEW = "Mới đặt";
  const PAY = { cash: "Tiền mặt khi nhận hàng", transfer: "Chuyển khoản ngân hàng", online: "Thanh toán trực tuyến" };
  const money = new Intl.NumberFormat("vi-VN");
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.from((r || document).querySelectorAll(s)); };
  const num = function (v) { return Number.isFinite(Number(v)) ? Number(v) : 0; };
  const fmt = function (v) { return money.format(num(v)) + " ₫"; };
  const esc = function (v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  if (!window.Bookstore) { console.error("Thiếu js/storage.js"); return; }

  function read(name) { const v = Bookstore.read(name); return Array.isArray(v) ? v : []; }
  function write(name, value) {
    Bookstore.write(name, value);
    window.dispatchEvent(new CustomEvent("bookstore:changed", { detail: { key: name } }));
  }
  function currentCustomer() {
    const id = Bookstore.read("currentCustomerId");
    return read("customers").find(function (c) { return c.id === id; }) || null;
  }
  function renderCount() {
    const total = read("cart").reduce(function (s, l) { return s + Math.max(0, num(l.quantity)); }, 0);
    $$("[data-cart-count]").forEach(function (el) { el.textContent = total; });
  }

  function init() {
    renderCount();
    const customer = currentCustomer();
    if (!customer || customer.status === "locked") {
      $("#login-required").hidden = false;
      if (customer) {
        $("#login-title").textContent = "Tài khoản đang bị khóa";
        $("#login-text").textContent = "Vui lòng liên hệ cửa hàng để được mở khóa trước khi mua hàng.";
      }
      return;
    }
    root.hidden = false;

    let draft = null;
    let busy = false;

    const msg = function (text, type) {
      const a = $("#cart-alert");
      a.textContent = text; a.className = type === "ok" ? "ok" : ""; a.hidden = !text;
    };

    function lines() {
      const books = read("books"), cart = read("cart"), out = [];
      cart.forEach(function (l) {
        const book = books.find(function (b) { return b.id === l.bookId; });
        if (book && book.active && num(book.stock) > 0) {
          out.push({ book: book, quantity: Math.max(1, Math.min(num(l.quantity), num(book.stock))) });
        }
      });
      const changed = out.length !== cart.length || out.some(function (l, i) { return l.quantity !== num(cart[i].quantity); });
      if (changed) {
        write("cart", out.map(function (l) { return { bookId: l.book.id, quantity: l.quantity }; }));
        msg("Giỏ hàng đã được cập nhật do có sách ngừng bán, hết hàng hoặc vượt số lượng tồn.");
      }
      return out;
    }
    const total = function (ls) { return ls.reduce(function (s, l) { return s + num(l.book.sellingPrice) * l.quantity; }, 0); };

    function renderCart() {
      const ls = lines();
      $("#cart-empty").hidden = ls.length > 0;
      $("#cart-table").hidden = !ls.length;
      $("#to-checkout").disabled = !ls.length;
      $("#cart-body").innerHTML = ls.map(function (l) {
        return '<tr data-id="' + esc(l.book.id) + '"><td><div class="cart-prod"><img src="' + esc(l.book.image) + '" alt=""><span>' + esc(l.book.title) + "</span></div></td>" +
          "<td>" + fmt(l.book.sellingPrice) + "</td>" +
          '<td><div class="qty"><button type="button" data-act="dec" aria-label="Giảm số lượng">−</button>' +
          '<input type="number" min="1" max="' + num(l.book.stock) + '" value="' + l.quantity + '" data-act="set" aria-label="Số lượng">' +
          '<button type="button" data-act="inc" aria-label="Tăng số lượng">+</button></div></td>' +
          "<td>" + fmt(num(l.book.sellingPrice) * l.quantity) + "</td>" +
          '<td><button type="button" class="link-danger" data-act="rm">Xóa</button></td></tr>';
      }).join("");
      $("#cart-total").textContent = fmt(total(ls));
      renderCount();
    }

    function setQty(id, q) {
      const book = read("books").find(function (b) { return b.id === id; });
      const max = book ? num(book.stock) : 1;
      q = Math.floor(q) || 1;
      const real = Math.max(1, Math.min(q, max));
      write("cart", read("cart").map(function (l) { return l.bookId === id ? { bookId: id, quantity: real } : l; }));
      msg(q > max ? "Chỉ còn " + max + " cuốn trong kho." : "");
    }
    $("#cart-body").addEventListener("click", function (e) {
      const b = e.target.closest("button[data-act]"); if (!b) { return; }
      const id = b.closest("tr").dataset.id;
      const cur = read("cart").find(function (l) { return l.bookId === id; });
      if (b.dataset.act === "rm") { write("cart", read("cart").filter(function (l) { return l.bookId !== id; })); msg(""); }
      else { setQty(id, num(cur && cur.quantity) + (b.dataset.act === "inc" ? 1 : -1)); }
      renderCart();
    });
    $("#cart-body").addEventListener("change", function (e) {
      if (e.target.dataset.act === "set") { setQty(e.target.closest("tr").dataset.id, Number(e.target.value)); renderCart(); }
    });

    function go(n) {
      ["1", "2", "3", "done"].forEach(function (s) { $("#step-" + s).hidden = String(n) !== s; });
      $$("#steps li").forEach(function (li, i) {
        li.classList.toggle("active", i + 1 === n);
        li.classList.toggle("done", n === "done" || i + 1 < n);
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    function tab(name) {
      $("#tab-checkout").hidden = name !== "checkout";
      $("#tab-orders").hidden = name !== "orders";
      $$(".tabs button").forEach(function (b) { b.classList.toggle("active", b.dataset.tab === name); });
      msg("");
      if (name === "orders") { renderOrders(); } else { go(1); renderCart(); }
    }
    $$(".tabs button").forEach(function (b) { b.addEventListener("click", function () { tab(b.dataset.tab); }); });
    $("#to-checkout").addEventListener("click", function () { if (lines().length) { msg(""); go(2); } else { renderCart(); } });
    $("#back-1").addEventListener("click", function () { go(1); });
    $("#back-2").addEventListener("click", function () { go(2); });

    function savedAddresses() {
      return (Array.isArray(customer.addresses) ? customer.addresses : []).map(function (a) {
        if (typeof a === "string") { return { recipient: customer.name, phone: customer.phone || "", address: a }; }
        return {
          recipient: a.recipient || a.name || customer.name, phone: a.phone || customer.phone || "",
          address: a.address || a.fullAddress || [a.street, a.ward, a.district, a.city].filter(Boolean).join(", ")
        };
      }).filter(function (a) { return a.address; });
    }
    const saved = savedAddresses();
    $("#addr-list").innerHTML = saved.map(function (a, i) {
      return '<label class="choice"><input type="radio" name="addr" value="s' + i + '"' + (i === 0 ? " checked" : "") + "> " +
        esc(a.recipient) + (a.phone ? " · " + esc(a.phone) : "") + " · " + esc(a.address) + "</label>";
    }).join("") || '<p class="muted">Tài khoản chưa có địa chỉ đã lưu, hãy nhập địa chỉ mới.</p>';
    if (!saved.length) { $('input[name=addr][value=new]').checked = true; }
    const syncForm = function () {
      $("#new-addr").hidden = $("input[name=addr]:checked").value !== "new";
      const pay = $("input[name=pay]:checked").value;
      $("#pay-transfer").hidden = pay !== "transfer";
      $("#pay-online").hidden = pay !== "online";
    };
    $$("#step-2 input[type=radio]").forEach(function (r) { r.addEventListener("change", syncForm); });
    syncForm();

    function collect() {
      $$("#step-2 .error").forEach(function (s) { s.textContent = ""; });
      let ok = true;
      const val = function (id) { return $("#" + id).value.trim(); };
      const bad = function (id, text) {
        const el = $("#" + id); el.closest(".field").querySelector(".error").textContent = text;
        if (ok) { el.focus(); } ok = false;
      };
      const mode = $("input[name=addr]:checked").value, pay = $("input[name=pay]:checked").value;
      let ship;
      if (mode !== "new") {
        ship = saved[Number(mode.slice(1))];
      } else {
        if (val("recvName").length < 2) { bad("recvName", "Nhập họ tên người nhận."); }
        if (!/^(0|\+84)\d{9}$/.test(val("recvPhone").replace(/[\s.-]/g, ""))) { bad("recvPhone", "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0."); }
        if (!val("city")) { bad("city", "Chọn tỉnh / thành phố."); }
        if (!val("district")) { bad("district", "Nhập quận / huyện."); }
        if (!val("ward")) { bad("ward", "Nhập phường / xã."); }
        if (!val("street")) { bad("street", "Nhập số nhà, tên đường."); }
        ship = { recipient: val("recvName"), phone: val("recvPhone"), address: [val("street"), val("ward"), val("district"), val("city")].join(", ") };
      }
      if (pay === "online" && !val("onlineMethod")) { bad("onlineMethod", "Chọn hình thức thanh toán trực tuyến."); }
      return ok ? { ship: ship, pay: pay, detail: pay === "online" ? val("onlineMethod") : "" } : null;
    }
    const shipText = function (s) { return s.recipient + (s.phone ? " · " + s.phone : "") + " · " + s.address; };
    const payText = function (d) { return PAY[d.pay] + (d.detail ? " – " + d.detail : ""); };

    $("#step-2").addEventListener("submit", function (e) {
      e.preventDefault();
      const d = collect(); if (!d) { return; }
      draft = d;
      const ls = lines(); if (!ls.length) { go(1); renderCart(); return; }
      $("#review").innerHTML =
        "<p><strong>Người nhận:</strong> " + esc(d.ship.recipient) + " · " + esc(d.ship.phone) + "<br>" +
        "<strong>Địa chỉ:</strong> " + esc(d.ship.address) + "<br><strong>Thanh toán:</strong> " + esc(payText(d)) + "</p>" +
        '<div class="table-wrap"><table class="data-table"><thead><tr><th>Sách</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr></thead><tbody>' +
        ls.map(function (l) {
          return "<tr><td>" + esc(l.book.title) + "</td><td>" + fmt(l.book.sellingPrice) + "</td><td>" + l.quantity + "</td><td>" + fmt(num(l.book.sellingPrice) * l.quantity) + "</td></tr>";
        }).join("") + '</tbody></table></div><p class="total-line">Tổng cộng: <strong>' + fmt(total(ls)) + "</strong></p>";
      go(3);
    });

    $("#place-order").addEventListener("click", function () {
      const ls = lines();
      if (!ls.length || !draft) { go(1); renderCart(); return; }
      const fresh = currentCustomer();
      if (!fresh || fresh.status === "locked") { location.reload(); return; }
      busy = true;
      try {
        const now = new Date().toISOString(), id = "DH" + Date.now();
        const order = {
          id: id, customerId: fresh.id,
          items: ls.map(function (l) { return { bookId: l.book.id, title: l.book.title, price: num(l.book.sellingPrice), quantity: l.quantity }; }),
          deliveryAddress: shipText(draft.ship), recipient: draft.ship.recipient, phone: draft.ship.phone,
          paymentMethod: draft.pay, paymentDetail: draft.detail,
          status: STATUS_NEW, orderedAt: now, total: total(ls)
        };
        const books = read("books").map(function (b) {
          const l = ls.find(function (x) { return x.book.id === b.id; });
          return l ? Object.assign({}, b, { stock: num(b.stock) - l.quantity }) : b;
        });
        const moves = read("stockMovements").concat(ls.map(function (l, i) {
          return { id: "move-" + Date.now() + "-" + i, bookId: l.book.id, direction: "out", quantity: l.quantity, occurredAt: now, referenceId: id };
        }));
        write("orders", read("orders").concat(order));
        write("stockMovements", moves);
        write("books", books);
        write("cart", []);
        draft = null;
        $("#done-text").textContent = "Mã đơn hàng " + id + ". Tổng tiền " + fmt(order.total) + ". Trạng thái: " + order.status + ".";
        go("done");
      } catch (error) {
        console.error(error); msg(error.message || "Không thể tạo đơn hàng.");
      } finally { busy = false; renderCount(); }
    });
    $("#see-orders").addEventListener("click", function () { tab("orders"); });

    function renderOrders() {
      const mine = read("orders").filter(function (o) { return o.customerId === customer.id; })
        .sort(function (a, b) { return new Date(b.orderedAt) - new Date(a.orderedAt); });
      $("#orders-list").innerHTML = mine.length ? mine.map(function (o) {
        return "<details><summary><span><strong>" + esc(o.id) + "</strong> · " + new Date(o.orderedAt).toLocaleString("vi-VN") + "</span>" +
          '<span>' + fmt(o.total) + ' <span class="status-pill">' + esc(o.status) + "</span></span></summary>" +
          "<p>Địa chỉ: " + esc(o.deliveryAddress) + "<br>Thanh toán: " + esc(PAY[o.paymentMethod] || o.paymentMethod) + (o.paymentDetail ? " – " + esc(o.paymentDetail) : "") + "</p>" +
          "<ul>" + (o.items || []).map(function (i) { return "<li>" + esc(i.title) + " × " + num(i.quantity) + " – " + fmt(num(i.price) * num(i.quantity)) + "</li>"; }).join("") + "</ul></details>";
      }).join("") : '<p>Bạn chưa có đơn hàng nào. <a href="index.html">Mua sắm ngay</a>.</p>';
    }

    const refresh = function () {
      if (busy) { return; }
      renderCount();
      if (!$("#tab-orders").hidden) { renderOrders(); } else if (!$("#step-1").hidden) { renderCart(); }
    };
    window.addEventListener("bookstore:changed", refresh);
    window.addEventListener("storage", function (e) { if (e.key && e.key.indexOf("bookstore.") === 0) { refresh(); } });

    tab(location.hash === "#orders" ? "orders" : "checkout");
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
}());
