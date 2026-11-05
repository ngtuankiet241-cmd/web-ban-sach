(function () {
  "use strict";

  function updateYear() {
    var yearEl = document.querySelector("[data-current-year]");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  function syncHeaderState() {
    var storage = window.Bookstore;
    if (!storage || typeof storage.read !== "function") {
      return;
    }

    try {
      // 1. Đồng bộ số lượng giỏ hàng trên badge header
      var cart = storage.read("cart") || [];
      var totalItems = Array.isArray(cart)
        ? cart.reduce(function (sum, item) {
            var qty = Number(item && item.quantity) || 0;
            return sum + (qty > 0 ? qty : 0);
          }, 0)
        : 0;

      document.querySelectorAll("[data-cart-count]").forEach(function (el) {
        el.textContent = totalItems;
      });

      // 2. Hiển thị thông tin tài khoản đang đăng nhập trên thanh điều hướng
      var customerId = storage.read("currentCustomerId");
      var customers = storage.read("customers") || [];
      var currentCustomer = null;

      if (customerId && Array.isArray(customers)) {
        currentCustomer = customers.find(function (c) {
          return c.id === customerId && c.status !== "locked";
        });
      }

      document.querySelectorAll(".site-header nav a").forEach(function (link) {
        var href = link.getAttribute("href") || "";
        if (href.indexOf("account.html") !== -1) {
          if (currentCustomer && currentCustomer.name) {
            var parts = currentCustomer.name.trim().split(/\s+/);
            var shortName = parts[parts.length - 1] || currentCustomer.name;
            link.textContent = "Tài khoản (" + shortName + ")";
            link.title = "Đang đăng nhập: " + currentCustomer.name;
          } else {
            link.textContent = "Tài khoản";
            link.removeAttribute("title");
          }
        }
      });
    } catch (e) {
      console.warn("Lỗi đồng bộ header:", e);
    }
  }

  function init() {
    updateYear();
    syncHeaderState();

    window.addEventListener("storage", function (e) {
      if (e.key && e.key.indexOf("bookstore.") === 0) {
        syncHeaderState();
      }
    });

    window.addEventListener("bookstore:changed", function () {
      syncHeaderState();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
