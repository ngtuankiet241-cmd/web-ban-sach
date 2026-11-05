(function () {
  "use strict";

  var storage = window.Bookstore || window.BookStoreStorage;
  var app = document.getElementById("admin-app");
  var catalog = document.getElementById("catalog-admin");
  var sessionKey = "bookstore.adminSession";

  function setCatalogVisible(visible) {
    if (catalog) catalog.hidden = !visible;
  }

  function isLoggedIn() {
    return sessionStorage.getItem(sessionKey) === "true";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value) || 0);
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("vi-VN");
  }

  function dateInputValue(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    var offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }

  function canChangeOrderStatus(oldStatus, newStatus) {
    if (oldStatus === newStatus) return true;
    if (oldStatus === "Mới đặt") return newStatus === "Đã xử lý" || newStatus === "Hủy";
    if (oldStatus === "Đã xử lý") return newStatus === "Đã giao" || newStatus === "Hủy";
    return false;
  }

  function showMessage(message, type) {
    var existing = app.querySelector(".admin-message");
    if (existing) existing.remove();
    var box = document.createElement("div");
    box.className = "admin-message " + (type || "success");
    box.textContent = message;
    app.prepend(box);
  }

  function renderLogin() {
    setCatalogVisible(false);
    app.innerHTML =
      '<section class="panel admin-login">' +
        "<h2>Đăng nhập quản trị</h2>" +
        '<form id="admin-login-form" class="form-grid">' +
          '<label>Tài khoản<input name="username" autocomplete="username" required></label>' +
          '<label>Mật khẩu<input type="password" name="password" autocomplete="current-password" required></label>' +
          '<button class="button primary" type="submit">Đăng nhập</button>' +
        "</form>" +
        '<p class="muted">Tài khoản demo: <strong>admin</strong> / <strong>admin123</strong></p>' +
      "</section>";

    document.getElementById("admin-login-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var form = new FormData(event.currentTarget);
      if (form.get("username") === "admin" && form.get("password") === "admin123") {
        sessionStorage.setItem(sessionKey, "true");
        renderAdmin();
      } else {
        showMessage("Sai tài khoản hoặc mật khẩu quản trị.", "error");
      }
    });
  }

  function renderAdmin() {
    setCatalogVisible(true);
    app.innerHTML =
      '<section class="admin-shell">' +
        '<aside class="admin-nav panel">' +
          "<h2>Danh mục quản trị</h2>" +
          '<button class="admin-tab active" data-tab="customers">Khách hàng</button>' +
          '<button class="admin-tab" data-tab="receipts">Phiếu nhập</button>' +
          '<button class="admin-tab" data-tab="orders">Đơn hàng</button>' +
          '<button class="button danger" id="admin-reset-demo" type="button">Khôi phục dữ liệu demo</button>' +
          '<button class="button" id="admin-logout" type="button">Đăng xuất</button>' +
        "</aside>" +
        '<div class="admin-content panel"><div id="admin-tab-content"></div></div>' +
      "</section>";

    app.querySelectorAll(".admin-tab").forEach(function (button) {
      button.addEventListener("click", function () {
        app.querySelectorAll(".admin-tab").forEach(function (item) { item.classList.remove("active"); });
        button.classList.add("active");
        renderTab(button.dataset.tab);
      });
    });

    document.getElementById("admin-logout").addEventListener("click", function () {
      sessionStorage.removeItem(sessionKey);
      renderLogin();
    });

    document.getElementById("admin-reset-demo").addEventListener("click", function () {
      if (window.confirm("Khôi phục toàn bộ dữ liệu demo? Các thay đổi hiện tại sẽ bị mất.")) {
        storage.resetDemoData();
        renderTab("customers");
        showMessage("Đã khôi phục dữ liệu demo.", "success");
      }
    });

    renderTab("customers");
  }

  function renderTab(tab) {
    if (tab === "customers") renderCustomers();
    if (tab === "receipts") renderReceipts();
    if (tab === "orders") renderOrders();
  }

  function renderCustomers() {
    var customers = storage.getCustomers();
    var content = document.getElementById("admin-tab-content");
    function customerRows(items) {
      return items.map(function (customer) {
      var locked = customer.status === "locked";
      return "<tr>" +
        "<td>" + escapeHtml(customer.id) + "</td>" +
        "<td><strong>" + escapeHtml(customer.name) + "</strong><br><span class=\"muted\">" + escapeHtml(customer.email) + "</span></td>" +
        "<td>" + escapeHtml(customer.phone) + "</td>" +
        "<td><span class=\"status " + (locked ? "locked" : "active") + "\">" + (locked ? "Đã khóa" : "Đang hoạt động") + "</span></td>" +
        '<td class="table-actions">' +
          '<button class="button small" type="button" data-reset-key="' + escapeHtml(customer.id) + '">Reset mật khẩu</button> ' +
          '<button class="button small ' + (locked ? "" : "danger") + '" type="button" data-toggle-customer="' + escapeHtml(customer.id) + '">' + (locked ? "Mở khóa" : "Khóa") + "</button>" +
        "</td>" +
      "</tr>";
      }).join("");
    }

    var rows = customerRows(customers);

    content.innerHTML =
      "<h2>Khách hàng</h2>" +
      '<div class="admin-toolbar">' +
        '<input id="customer-search" type="search" placeholder="Tìm tên, email hoặc số điện thoại">' +
      "</div>" +
      '<div class="table-wrap"><table><thead><tr><th>Mã</th><th>Khách hàng</th><th>Điện thoại</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="customer-rows">' + rows + "</tbody></table></div>";

    var search = document.getElementById("customer-search");
    search.addEventListener("input", function () {
      var term = search.value.trim().toLowerCase();
      var filtered = customers.filter(function (customer) {
        return [customer.id, customer.name, customer.email, customer.phone].join(" ").toLowerCase().includes(term);
      });
      document.getElementById("customer-rows").innerHTML = customerRows(filtered);
    });

    content.onclick = function (event) {
      var resetButton = event.target.closest("[data-reset-key]");
      var toggleButton = event.target.closest("[data-toggle-customer]");
      var latest = storage.getCustomers();

      if (resetButton) {
        var resetId = resetButton.dataset.resetKey;
        var resetCustomer = latest.find(function (item) { return item.id === resetId; });
        if (!resetCustomer) return;
        resetCustomer.password = "123456";
        storage.setCustomers(latest);
        showMessage("Đã reset mật khẩu của " + resetCustomer.name + " về 123456.", "success");
      }

      if (toggleButton) {
        var toggleId = toggleButton.dataset.toggleCustomer;
        var customer = latest.find(function (item) { return item.id === toggleId; });
        if (!customer) return;
        customer.status = customer.status === "locked" ? "active" : "locked";
        storage.setCustomers(latest);
        renderCustomers();
        showMessage(customer.status === "locked" ? "Đã khóa tài khoản " + customer.name + "." : "Đã mở khóa tài khoản " + customer.name + ".", "success");
      }
    };
  }

  function renderReceipts() {
    var content = document.getElementById("admin-tab-content");
    var books = storage.getBooks();
    var receipts = storage.getReceipts();

    function receiptRows(items) {
      return items.map(function (receipt) {
        var completed = receipt.status === "completed";
        var itemCount = receipt.items ? receipt.items.length : 0;
        return "<tr>" +
          "<td><strong>" + escapeHtml(receipt.id) + "</strong></td>" +
          "<td>" + escapeHtml(dateInputValue(receipt.receivedAt)) + "</td>" +
          "<td>" + itemCount + "</td>" +
          '<td><span class="status ' + (completed ? "active" : "draft") + '">' + (completed ? "Đã hoàn tất" : "Nháp") + "</span></td>" +
          '<td class="table-actions">' +
            '<button class="button small" type="button" data-view-receipt="' + escapeHtml(receipt.id) + '">Xem/sửa</button> ' +
            (!completed ? '<button class="button small primary" type="button" data-complete-receipt="' + escapeHtml(receipt.id) + '">Hoàn tất</button>' : "") +
          "</td></tr>";
      }).join("");
    }

    content.innerHTML =
      "<h2>Phiếu nhập kho</h2>" +
      '<div class="admin-toolbar">' +
        '<input id="receipt-search" type="search" placeholder="Tìm mã phiếu">' +
        '<button class="button primary" id="new-receipt" type="button">Tạo phiếu nhập</button>' +
      "</div>" +
      '<div class="table-wrap"><table><thead><tr><th>Mã phiếu</th><th>Ngày nhập</th><th>Số dòng sách</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="receipt-rows">' + receiptRows(receipts) + "</tbody></table></div>" +
      '<div id="receipt-editor"></div>';

    document.getElementById("receipt-search").addEventListener("input", function (event) {
      var term = event.target.value.trim().toLowerCase();
      var filtered = receipts.filter(function (receipt) {
        return String(receipt.id).toLowerCase().includes(term) || formatDate(receipt.receivedAt).toLowerCase().includes(term);
      });
      document.getElementById("receipt-rows").innerHTML = receiptRows(filtered);
    });

    document.getElementById("new-receipt").addEventListener("click", function () {
      openReceiptEditor(null, books);
    });

    content.onclick = function (event) {
      var view = event.target.closest("[data-view-receipt]");
      var complete = event.target.closest("[data-complete-receipt]");
      if (view) {
        var receipt = storage.getReceipts().find(function (item) { return item.id === view.dataset.viewReceipt; });
        if (receipt) openReceiptEditor(receipt, storage.getBooks());
      }
      if (complete) completeReceipt(complete.dataset.completeReceipt);
    };
  }

  function openReceiptEditor(receipt, books) {
    var editor = document.getElementById("receipt-editor");
    var isCompleted = receipt && receipt.status === "completed";
    var firstItem = receipt && receipt.items && receipt.items[0] ? receipt.items[0] : { bookId: books[0] ? books[0].id : "", quantity: 1, costPrice: books[0] ? books[0].costPrice : 0 };
    var bookOptions = books.map(function (book) {
      return '<option value="' + escapeHtml(book.id) + '" ' + (book.id === firstItem.bookId ? "selected" : "") + ">" + escapeHtml(book.title) + " (" + escapeHtml(book.code) + ")</option>";
    }).join("");

    editor.innerHTML =
      '<section class="editor-box"><h3>' + (receipt ? "Chi tiết phiếu nhập " + escapeHtml(receipt.id) : "Tạo phiếu nhập mới") + "</h3>" +
      '<form id="receipt-form" class="form-grid">' +
        '<label>Ngày nhập<input name="receivedAt" type="datetime-local" required value="' + (receipt ? toLocalDateTime(receipt.receivedAt) : toLocalDateTime(new Date().toISOString())) + '"' + (isCompleted ? " disabled" : "") + "></label>" +
        '<label>Sách<select name="bookId" required ' + (isCompleted ? "disabled" : "") + ">" + bookOptions + "</select></label>" +
        '<label>Giá nhập<input name="costPrice" type="number" min="0" required value="' + escapeHtml(firstItem.costPrice || 0) + '"' + (isCompleted ? " disabled" : "") + "></label>" +
        '<label>Số lượng<input name="quantity" type="number" min="1" required value="' + escapeHtml(firstItem.quantity || 1) + '"' + (isCompleted ? " disabled" : "") + "></label>" +
        '<div class="form-actions">' +
          (!isCompleted ? '<button class="button primary" type="submit">' + (receipt ? "Lưu thay đổi" : "Tạo phiếu") + "</button>" : "") +
          (receipt && !isCompleted ? '<button class="button primary" type="button" id="complete-editor-receipt">Hoàn tất phiếu</button>' : "") +
        "</div>" +
      "</form></section>";

    if (isCompleted) return;

    document.getElementById("receipt-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(event.currentTarget);
      var bookId = String(data.get("bookId"));
      var quantity = Number(data.get("quantity"));
      var costPrice = Number(data.get("costPrice"));
      var receivedDate = new Date(String(data.get("receivedAt")));
      if (!bookId || !Number.isInteger(quantity) || quantity < 1 ||
          !Number.isFinite(costPrice) || costPrice < 0 || Number.isNaN(receivedDate.getTime())) {
        showMessage("Vui lòng nhập đầy đủ và hợp lệ thông tin phiếu.", "error");
        return;
      }
      var receivedAt = receivedDate.toISOString();

      var receipts = storage.getReceipts();
      if (!storage.getBooks().some(function (book) { return book.id === bookId; })) {
        showMessage("Sách trong phiếu nhập không còn tồn tại.", "error");
        return;
      }
      var item = { bookId: bookId, quantity: quantity, costPrice: costPrice };
      if (receipt) {
        var current = receipts.find(function (itemReceipt) { return itemReceipt.id === receipt.id; });
        if (!current || current.status === "completed") {
          showMessage("Phiếu đã hoàn tất không thể sửa.", "error");
          return;
        }
        current.receivedAt = receivedAt;
        current.items = [item];
      } else {
        receipts.unshift({
          id: "PN" + String(Date.now()).slice(-6),
          receivedAt: receivedAt,
          status: "draft",
          items: [item]
        });
      }
      storage.setReceipts(receipts);
      showMessage(receipt ? "Đã lưu thay đổi phiếu nhập." : "Đã tạo phiếu nhập nháp.");
      renderReceipts();
    });

    var completeButton = document.getElementById("complete-editor-receipt");
    if (completeButton) {
      completeButton.addEventListener("click", function () {
        completeReceipt(receipt.id);
      });
    }
  }

  function completeReceipt(receiptId) {
    var receipts = storage.getReceipts();
    var receipt = receipts.find(function (item) { return item.id === receiptId; });
    if (!receipt) return;
    if (receipt.status === "completed") {
      showMessage("Phiếu nhập đã hoàn tất trước đó.", "error");
      return;
    }
    if (!window.confirm("Hoàn tất phiếu nhập này và cộng tồn kho?")) return;

    var books = storage.getBooks();
    var invalidItem = receipt.items.find(function (item) {
      return !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 ||
        !Number.isFinite(Number(item.costPrice)) || Number(item.costPrice) < 0 ||
        !books.some(function (book) { return book.id === item.bookId; });
    });
    if (invalidItem) {
      showMessage("Phiếu nhập có sách không tồn tại hoặc số liệu không hợp lệ.", "error");
      return;
    }
    var categories = storage.getCategories();
    var movements = storage.getStockMovements();
    receipt.items.forEach(function (item) {
      var book = books.find(function (value) { return value.id === item.bookId; });
      book.stock = Number(book.stock || 0) + Number(item.quantity || 0);
      var itemCostPrice = Number(item.costPrice);
      if (Number.isFinite(itemCostPrice) && itemCostPrice >= 0) {
        book.costPrice = itemCostPrice;
      }
      var marginPercent = null;
      if (book.marginPercent !== null && book.marginPercent !== undefined && book.marginPercent !== "") {
        marginPercent = Number(book.marginPercent);
      }
      if (!Number.isFinite(marginPercent)) {
        var category = categories.find(function (value) { return value.id === book.categoryId; });
        marginPercent = category ? Number(category.marginPercent || 0) : 0;
      }
      book.sellingPrice = Math.round(Number(book.costPrice) * (1 + marginPercent / 100));
      movements.push({
        id: storage.createId("mv"),
        bookId: book.id,
        direction: "in",
        quantity: Number(item.quantity || 0),
        occurredAt: receipt.receivedAt,
        referenceId: receipt.id
      });
    });
    receipt.status = "completed";
    storage.setBooks(books);
    storage.setReceipts(receipts);
    storage.setStockMovements(movements);
    showMessage("Đã hoàn tất phiếu " + receipt.id + " và cập nhật tồn kho.");
    renderReceipts();
  }

  function toLocalDateTime(value) {
    var date = new Date(value);
    var offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  function renderOrders() {
    var content = document.getElementById("admin-tab-content");
    var orders = storage.getOrders();
    var from = "";
    var to = "";
    var status = "";

    content.innerHTML =
      "<h2>Đơn hàng</h2>" +
      '<div class="admin-toolbar">' +
        '<label>Từ<input id="order-from" type="date"></label>' +
        '<label>Đến<input id="order-to" type="date"></label>' +
        '<label>Trạng thái<select id="order-status"><option value="">Tất cả</option><option>Mới đặt</option><option>Đã xử lý</option><option>Đã giao</option><option>Hủy</option></select></label>' +
        '<button class="button primary" id="order-filter" type="button">Tra cứu</button>' +
      "</div>" +
      '<div class="table-wrap"><table><thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="order-rows"></tbody></table></div>' +
      '<div id="order-detail"></div>';

    document.getElementById("order-filter").addEventListener("click", filterOrders);
    filterOrders();

    function filterOrders() {
      from = document.getElementById("order-from").value;
      to = document.getElementById("order-to").value;
      status = document.getElementById("order-status").value;
      var filtered = storage.getOrders().filter(function (order) {
        var datePart = dateInputValue(order.orderedAt);
        var fromOk = !from || datePart >= from;
        var toOk = !to || datePart <= to;
        var statusOk = !status || order.status === status;
        return fromOk && toOk && statusOk;
      });
      document.getElementById("order-rows").innerHTML = filtered.map(function (order) {
        return "<tr>" +
          "<td><strong>" + escapeHtml(order.id) + "</strong></td>" +
          "<td>" + escapeHtml(formatDate(order.orderedAt)) + "</td>" +
          "<td>" + escapeHtml(formatMoney(order.total)) + "</td>" +
          "<td>" + escapeHtml(order.paymentMethod) + "</td>" +
          '<td><span class="status order-status-' + statusClass(order.status) + '">' + escapeHtml(order.status) + "</span></td>" +
          '<td class="table-actions"><button class="button small" type="button" data-view-order="' + escapeHtml(order.id) + '">Xem chi tiết</button></td>' +
        "</tr>";
      }).join("") || '<tr><td colspan="6">Không tìm thấy đơn hàng phù hợp.</td></tr>';
    }

    document.getElementById("order-rows").addEventListener("click", function (event) {
      var button = event.target.closest("[data-view-order]");
      if (!button) return;
      openOrderDetail(button.dataset.viewOrder);
    });
  }

  function statusClass(status) {
    if (status === "Đã giao") return "delivered";
    if (status === "Đã xử lý") return "processed";
    if (status === "Hủy") return "cancelled";
    return "new";
  }

  function openOrderDetail(orderId) {
    var order = storage.getOrders().find(function (item) { return item.id === orderId; });
    if (!order) return;
    var customers = storage.getCustomers();
    var customer = customers.find(function (item) { return item.id === order.customerId; });
    var items = order.items.map(function (item) {
      return "<li>" + escapeHtml(item.title) + " × " + item.quantity + " — " + escapeHtml(formatMoney(item.price * item.quantity)) + "</li>";
    }).join("");

    var statusOptions = '<option value="Mới đặt">Mới đặt</option><option value="Đã xử lý">Đã xử lý</option><option value="Đã giao">Đã giao</option><option value="Hủy">Hủy</option>';
    var terminalStatus = order.status === "Đã giao" || order.status === "Hủy";
    document.getElementById("order-detail").innerHTML =
      '<section class="editor-box"><h3>Chi tiết đơn ' + escapeHtml(order.id) + "</h3>" +
      "<p><strong>Khách hàng:</strong> " + escapeHtml(customer ? customer.name : order.customerId) + "</p>" +
      "<p><strong>Địa chỉ:</strong> " + escapeHtml(order.deliveryAddress) + "</p>" +
      "<p><strong>Thanh toán:</strong> " + escapeHtml(order.paymentMethod) + "</p>" +
      "<p><strong>Ngày đặt:</strong> " + escapeHtml(formatDate(order.orderedAt)) + "</p>" +
      "<ul>" + items + "</ul>" +
      "<p><strong>Tổng cộng:</strong> " + escapeHtml(formatMoney(order.total)) + "</p>" +
      '<label>Trạng thái mới<select id="order-new-status"' + (terminalStatus ? " disabled" : "") + ">" + statusOptions + "</select></label>" +
      '<button class="button primary" type="button" id="save-order-status"' + (terminalStatus ? " disabled" : "") + ">Cập nhật trạng thái</button>" +
      "</section>";

    var select = document.getElementById("order-new-status");
    select.value = order.status;
    document.getElementById("save-order-status").addEventListener("click", function () {
      updateOrderStatus(orderId, select.value);
    });
  }

  function updateOrderStatus(orderId, newStatus) {
    var orders = storage.getOrders();
    var order = orders.find(function (item) { return item.id === orderId; });
    if (!order) {
      showMessage("Không tìm thấy đơn hàng.", "error");
      return;
    }
    if (!canChangeOrderStatus(order.status, newStatus)) {
      showMessage("Không thể chuyển trạng thái đơn theo quy trình hiện tại.", "error");
      return;
    }
    if (order.status === newStatus) {
      showMessage("Trạng thái đơn chưa thay đổi.", "success");
      return;
    }

    var oldStatus = order.status;
    var books = storage.getBooks();
    var movements = storage.getStockMovements();
    var changed = false;

    if (oldStatus !== "Hủy" && newStatus === "Hủy") {
      var missingBook = order.items.some(function (item) {
        return !books.some(function (book) { return book.id === item.bookId; });
      });
      if (missingBook) {
        showMessage("Không thể hủy đơn vì có sách trong đơn không còn tồn tại.", "error");
        return;
      }
      var cancelReference = order.id + "-cancel";
      var alreadyRestocked = movements.some(function (movement) {
        return movement.referenceId === cancelReference && movement.direction === "in";
      });
      if (alreadyRestocked) {
        showMessage("Đơn này đã được hoàn kho trước đó.", "error");
        return;
      }
      order.items.forEach(function (item) {
        var book = books.find(function (value) { return value.id === item.bookId; });
        book.stock = Number(book.stock || 0) + Number(item.quantity || 0);
        movements.push({ id: storage.createId("mv"), bookId: book.id, direction: "in", quantity: Number(item.quantity || 0), occurredAt: new Date().toISOString(), referenceId: cancelReference });
      });
      changed = true;
    }

    order.status = newStatus;
    storage.setOrders(orders);
    if (changed) {
      storage.setBooks(books);
      storage.setStockMovements(movements);
    }
    showMessage("Đã cập nhật trạng thái đơn " + order.id + " thành " + newStatus + ".");
    renderTab("orders");
  }

  if (!storage) {
    app.innerHTML = '<section class="panel"><p>Không thể tải dữ liệu quản trị.</p></section>';
    return;
  }

  if (isLoggedIn()) renderAdmin();
  else renderLogin();
})();
