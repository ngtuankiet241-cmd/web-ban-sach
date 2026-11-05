// Đăng ký, đăng nhập, hồ sơ và lịch sử mua cho account.html; chia sẻ khách/đơn với các trang qua storage.js.
(function () {
  const authView = document.querySelector("[data-auth-view]");
  const dashboardView = document.querySelector("[data-dashboard-view]");
  const authMessage = document.querySelector("[data-auth-message]");
  const profileMessage = document.querySelector("[data-profile-message]");
  const authForms = {
    login: document.querySelector("[data-login-form]"),
    register: document.querySelector("[data-register-form]")
  };
  const profileForm = document.querySelector("[data-profile-form]");

  if (!authView || !dashboardView || !window.Bookstore) {
    return;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("vi-VN").format(Number(value) || 0) + " ₫";
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Ngày đặt chưa xác định";
    }
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);
  }

  function setMessage(element, message, type) {
    if (!element) return;
    element.textContent = message || "";
    element.classList.toggle("is-error", type === "error");
    element.classList.toggle("is-success", type === "success");
  }

  function isValidPhone(value) {
    return /^0\d{9}$/.test(String(value || "").trim());
  }

  function showStorageError(error) {
    const element = document.querySelector("[data-storage-error]");
    if (!element) return;
    element.hidden = false;
    element.textContent = error.message || "Không thể đọc dữ liệu tài khoản.";
  }

  function setAuthMode(mode) {
    const activeMode = mode === "register" ? "register" : "login";
    Object.keys(authForms).forEach(function (key) {
      authForms[key].hidden = key !== activeMode;
      const tab = document.querySelector('[data-auth-mode="' + key + '"]');
      tab.classList.toggle("is-active", key === activeMode);
      tab.setAttribute("aria-pressed", String(key === activeMode));
    });
    setMessage(authMessage, "");
  }

  function renderOrders(orders) {
    const orderList = document.querySelector("[data-order-list]");
    const sortedOrders = orders.slice().sort(function (first, second) {
      return new Date(second.orderedAt).getTime() - new Date(first.orderedAt).getTime();
    });

    if (sortedOrders.length === 0) {
      orderList.innerHTML =
        '<div class="account-empty">' +
          '<span class="account-empty__icon" aria-hidden="true">▤</span>' +
          "<strong>Chưa có đơn hàng nào</strong>" +
          "<p>Những cuốn sách bạn đặt sẽ xuất hiện ở đây.</p>" +
          '<a class="button button--primary" href="index.html">Khám phá sách</a>' +
        "</div>";
      return;
    }

    const statuses = {
      "Mới đặt": { label: "Mới đặt", className: "new" },
      "Đã xử lý": { label: "Đã xử lý", className: "processed" },
      "Đã giao": { label: "Đã giao", className: "delivered" },
      "Đã hủy": { label: "Đã hủy", className: "cancelled" }
    };

    orderList.innerHTML = sortedOrders.map(function (order) {
      const status = statuses[order.status] || { label: order.status || "Đang cập nhật", className: "other" };
      const items = Array.isArray(order.items) ? order.items : [];
      const itemMarkup = items.map(function (item) {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return "<li>" +
          "<span>" + escapeHtml(item.title || "Sách") + " <span class=\"account-order__quantity\">× " + quantity + "</span></span>" +
          "<strong>" + formatMoney(price * quantity) + "</strong>" +
        "</li>";
      }).join("");

      return '<article class="account-order">' +
        '<div class="account-order__header">' +
          "<div><span class=\"account-order__caption\">Mã đơn hàng</span><strong>" + escapeHtml(order.id) + "</strong></div>" +
          "<div><span class=\"account-order__caption\">Ngày đặt</span><strong>" + escapeHtml(formatDate(order.orderedAt)) + "</strong></div>" +
          '<span class="account-order__status account-order__status--' + status.className + '">' + escapeHtml(status.label) + "</span>" +
        "</div>" +
        '<ul class="account-order__items">' + itemMarkup + "</ul>" +
        '<div class="account-order__footer"><span>' + escapeHtml(order.paymentMethod || "Phương thức thanh toán chưa cập nhật") +
          "</span><strong>Tổng cộng: " + formatMoney(order.total) + "</strong></div>" +
        (order.deliveryAddress ? '<p class="account-order__address">Giao đến: ' + escapeHtml(order.deliveryAddress) + "</p>" : "") +
      "</article>";
    }).join("");
  }

  function renderDashboard(customer) {
    const orders = Bookstore.getOrders().filter(function (order) {
      return order.customerId === customer.id;
    });
    const spending = orders.reduce(function (total, order) {
      return order.status === "Đã hủy" ? total : total + (Number(order.total) || 0);
    }, 0);

    document.querySelector("[data-account-name]").textContent = customer.name;
    document.querySelector("[data-account-avatar]").textContent = (customer.name || "S").trim().charAt(0).toLocaleUpperCase("vi-VN");
    document.querySelector("[data-order-count]").textContent = orders.length;
    document.querySelector("[data-order-spending]").textContent = formatMoney(spending);

    profileForm.elements.namedItem("name").value = customer.name || "";
    profileForm.elements.namedItem("email").value = customer.email || "";
    profileForm.elements.namedItem("phone").value = customer.phone || "";
    renderOrders(orders);
    authView.hidden = true;
    dashboardView.hidden = false;
  }

  function render() {
    try {
      const currentCustomerId = Bookstore.read(Bookstore.keys.currentCustomerId, null);
      const customers = Bookstore.getCustomers();
      const customer = customers.find(function (item) {
        return item.id === currentCustomerId;
      });

      if (customer && customer.status !== "locked") {
        dashboardView.hidden = false;
        authView.hidden = true;
        renderDashboard(customer);
        return;
      }

      dashboardView.hidden = true;
      authView.hidden = false;
      setAuthMode("login");

      if (currentCustomerId && customer && customer.status === "locked") {
        Bookstore.write(Bookstore.keys.currentCustomerId, null);
        Bookstore.write(Bookstore.keys.cart, []);
        setMessage(authMessage, "Tài khoản này hiện đã bị khóa. Vui lòng liên hệ quản trị viên.", "error");
      } else if (currentCustomerId && !customer) {
        Bookstore.write(Bookstore.keys.currentCustomerId, null);
        setMessage(authMessage, "Không tìm thấy tài khoản đang đăng nhập. Vui lòng đăng nhập lại.", "error");
      }
    } catch (error) {
      showStorageError(error);
    }
  }

  function clearSession() {
    Bookstore.write(Bookstore.keys.currentCustomerId, null);
    Bookstore.write(Bookstore.keys.cart, []);
  }

  document.querySelectorAll("[data-auth-mode]").forEach(function (button) {
    button.addEventListener("click", function () {
      setAuthMode(button.dataset.authMode);
    });
  });

  authForms.login.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(authForms.login);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    try {
      const customer = Bookstore.getCustomers().find(function (item) {
        return String(item.email || "").trim().toLowerCase() === email;
      });
      if (!customer || customer.password !== password) {
        setMessage(authMessage, "Email hoặc mật khẩu chưa chính xác.", "error");
        return;
      }
      if (customer.status === "locked") {
        setMessage(authMessage, "Tài khoản này đã bị khóa. Vui lòng liên hệ quản trị viên.", "error");
        return;
      }

      Bookstore.write(Bookstore.keys.currentCustomerId, customer.id);
      setMessage(authMessage, "");
      render();
    } catch (error) {
      setMessage(authMessage, error.message, "error");
    }
  });

  authForms.register.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(authForms.register);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    if (password !== confirmPassword) {
      setMessage(authMessage, "Mật khẩu nhập lại chưa khớp.", "error");
      return;
    }
    if (!isValidPhone(phone)) {
      setMessage(authMessage, "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.", "error");
      return;
    }

    try {
      const customers = Bookstore.getCustomers();
      if (customers.some(function (customer) {
        return String(customer.email || "").trim().toLowerCase() === email;
      })) {
        setMessage(authMessage, "Email này đã được sử dụng. Hãy đăng nhập hoặc dùng email khác.", "error");
        return;
      }

      const customer = {
        id: Bookstore.createId("customer"),
        name: name,
        email: email,
        phone: phone,
        password: password,
        status: "active",
        addresses: []
      };
      Bookstore.setCustomers(customers.concat(customer));
      Bookstore.write(Bookstore.keys.currentCustomerId, customer.id);
      render();
    } catch (error) {
      setMessage(authMessage, error.message, "error");
    }
  });

  profileForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(profileForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const phone = String(formData.get("phone") || "").trim();
    if (!isValidPhone(phone)) {
      setMessage(profileMessage, "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.", "error");
      return;
    }

    try {
      const currentCustomerId = Bookstore.read(Bookstore.keys.currentCustomerId, null);
      const customers = Bookstore.getCustomers();
      const customer = customers.find(function (item) {
        return item.id === currentCustomerId;
      });
      if (!customer || customer.status === "locked") {
        setMessage(profileMessage, "Không thể cập nhật hồ sơ khi tài khoản chưa đăng nhập hoặc đã bị khóa.", "error");
        render();
        return;
      }
      if (customers.some(function (item) {
        return item.id !== customer.id && String(item.email || "").trim().toLowerCase() === email;
      })) {
        setMessage(profileMessage, "Email này đã được sử dụng bởi một tài khoản khác.", "error");
        return;
      }

      const previousName = customer.name;
      const previousPhone = customer.phone;
      customer.name = name;
      customer.email = email;
      customer.phone = phone;
      customer.addresses = (Array.isArray(customer.addresses) ? customer.addresses : []).map(function (address) {
        const updatedAddress = Object.assign({}, address);
        if (updatedAddress.recipient === previousName) updatedAddress.recipient = name;
        if (updatedAddress.phone === previousPhone) updatedAddress.phone = phone;
        return updatedAddress;
      });
      Bookstore.setCustomers(customers);
      render();
      setMessage(profileMessage, "Thông tin cá nhân đã được cập nhật.", "success");
    } catch (error) {
      setMessage(profileMessage, error.message, "error");
    }
  });

  document.querySelector("[data-logout]").addEventListener("click", function () {
    try {
      clearSession();
      authForms.login.reset();
      authForms.register.reset();
      setAuthMode("login");
      render();
      setMessage(authMessage, "Bạn đã đăng xuất. Hẹn gặp lại!", "success");
    } catch (error) {
      showStorageError(error);
    }
  });

  window.addEventListener("storage", function (event) {
    if (event.key && event.key.indexOf(Bookstore.prefix) === 0) {
      render();
    }
  });

  setAuthMode("login");
  render();
}());
