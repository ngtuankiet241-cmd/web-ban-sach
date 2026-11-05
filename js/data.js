// Dữ liệu mẫu cho cửa hàng, tài khoản, giỏ hàng và quản trị; storage.js dùng BookstoreSeed để khởi tạo localStorage.
(function () {
  const categorySeed = [
    { id: "van-hoc", name: "Văn học", active: true, marginPercent: 30 },
    { id: "ky-nang", name: "Kỹ năng sống", active: true, marginPercent: 35 },
    { id: "kinh-te", name: "Kinh tế", active: true, marginPercent: 32 },
    { id: "thieu-nhi", name: "Thiếu nhi", active: true, marginPercent: 28 }
  ];

  const booksSeed = [
    {
      id: "book-001", categoryId: "van-hoc", code: "VH001", title: "Nhà giả kim",
      author: "Paulo Coelho", publisher: "NXB Hội Nhà Văn", publishedYear: 2020, pages: 228,
      description: "Hành trình theo đuổi ước mơ và lắng nghe tiếng gọi của trái tim.",
      costPrice: 56000, sellingPrice: 72800, stock: 18, active: true, cover: "#d7a866"
    },
    {
      id: "book-002", categoryId: "van-hoc", code: "VH002", title: "Cho tôi xin một vé đi tuổi thơ",
      author: "Nguyễn Nhật Ánh", publisher: "NXB Trẻ", publishedYear: 2018, pages: 208,
      description: "Những ký ức tuổi thơ hồn nhiên được kể bằng giọng văn trong trẻo.",
      costPrice: 62000, sellingPrice: 80600, stock: 4, active: true, cover: "#84a99a"
    },
    {
      id: "book-003", categoryId: "van-hoc", code: "VH003", title: "Mắt biếc",
      author: "Nguyễn Nhật Ánh", publisher: "NXB Trẻ", publishedYear: 2019, pages: 300,
      description: "Câu chuyện tình yêu đầu đời và những rung động khó quên.",
      costPrice: 72000, sellingPrice: 93600, stock: 11, active: true, cover: "#8e9abb"
    },
    {
      id: "book-004", categoryId: "van-hoc", code: "VH004", title: "Totto-chan bên cửa sổ",
      author: "Kuroyanagi Tetsuko", publisher: "NXB Văn Học", publishedYear: 2019, pages: 240,
      description: "Một câu chuyện ấm áp về tuổi thơ, giáo dục và sự tôn trọng khác biệt.",
      costPrice: 68000, sellingPrice: 88400, stock: 7, active: true, cover: "#d88972"
    },
    {
      id: "book-005", categoryId: "ky-nang", code: "KN001", title: "Đắc nhân tâm",
      author: "Dale Carnegie", publisher: "NXB Tổng Hợp TP.HCM", publishedYear: 2021, pages: 320,
      description: "Những nguyên tắc giao tiếp và xây dựng quan hệ được nhiều thế hệ tham khảo.",
      costPrice: 78000, sellingPrice: 105300, stock: 22, active: true, cover: "#8ba6b7"
    },
    {
      id: "book-006", categoryId: "ky-nang", code: "KN002", title: "Tuổi trẻ đáng giá bao nhiêu",
      author: "Rosie Nguyễn", publisher: "NXB Hội Nhà Văn", publishedYear: 2020, pages: 285,
      description: "Gợi ý để người trẻ học hỏi, trải nghiệm và chủ động với hành trình của mình.",
      costPrice: 65000, sellingPrice: 87750, stock: 9, active: true, cover: "#e1a95f"
    },
    {
      id: "book-007", categoryId: "ky-nang", code: "KN003", title: "Đi tìm lẽ sống",
      author: "Viktor E. Frankl", publisher: "NXB Tổng Hợp TP.HCM", publishedYear: 2022, pages: 224,
      description: "Suy ngẫm về ý nghĩa sống, nghị lực và lựa chọn của mỗi người.",
      costPrice: 59000, sellingPrice: 79650, stock: 3, active: true, cover: "#899b72"
    },
    {
      id: "book-008", categoryId: "kinh-te", code: "KT001", title: "Tư duy nhanh và chậm",
      author: "Daniel Kahneman", publisher: "NXB Thế Giới", publishedYear: 2020, pages: 612,
      description: "Khám phá hai hệ thống tư duy ảnh hưởng đến phán đoán và quyết định.",
      costPrice: 145000, sellingPrice: 191400, stock: 6, active: true, cover: "#b47f78"
    },
    {
      id: "book-009", categoryId: "kinh-te", code: "KT002", title: "Người giàu có nhất thành Babylon",
      author: "George S. Clason", publisher: "NXB Tổng Hợp TP.HCM", publishedYear: 2019, pages: 208,
      description: "Những câu chuyện ngắn về tiết kiệm, kế hoạch tài chính và sự kiên trì.",
      costPrice: 52000, sellingPrice: 68640, stock: 15, active: true, cover: "#d4ad67"
    },
    {
      id: "book-010", categoryId: "kinh-te", code: "KT003", title: "Kinh tế học hài hước",
      author: "Steven D. Levitt, Stephen J. Dubner", publisher: "NXB Trẻ", publishedYear: 2018, pages: 320,
      description: "Nhìn những hiện tượng thường ngày qua lăng kính dữ liệu và kinh tế học.",
      costPrice: 89000, sellingPrice: 117480, stock: 5, active: true, cover: "#8797b0"
    },
    {
      id: "book-011", categoryId: "thieu-nhi", code: "TN001", title: "Dế Mèn phiêu lưu ký",
      author: "Tô Hoài", publisher: "NXB Kim Đồng", publishedYear: 2021, pages: 160,
      description: "Tác phẩm thiếu nhi kinh điển về những chuyến phiêu lưu và tình bạn.",
      costPrice: 45000, sellingPrice: 57600, stock: 20, active: true, cover: "#74a38e"
    },
    {
      id: "book-012", categoryId: "thieu-nhi", code: "TN002", title: "Hoàng tử bé",
      author: "Antoine de Saint-Exupéry", publisher: "NXB Hội Nhà Văn", publishedYear: 2020, pages: 96,
      description: "Một chuyến du hành dịu dàng về tình bạn, trí tưởng tượng và cách nhìn thế giới.",
      costPrice: 48000, sellingPrice: 61440, stock: 8, active: true, cover: "#86a2c2"
    }
  ];

  function makeCover(book) {
    const safeTitle = String(book.title || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const titleLines = [];
    String(book.title || "").trim().split(/\s+/).forEach(function (word) {
      let remaining = word;
      while (remaining.length > 18) {
        if (titleLines.length && titleLines[titleLines.length - 1].length < 18) {
          const available = 18 - titleLines[titleLines.length - 1].length - 1;
          if (available > 0) {
            titleLines[titleLines.length - 1] += " " + remaining.slice(0, available);
            remaining = remaining.slice(available);
            continue;
          }
        }
        titleLines.push(remaining.slice(0, 18));
        remaining = remaining.slice(18);
      }

      const lastLine = titleLines[titleLines.length - 1];
      if (lastLine && lastLine.length + remaining.length + 1 <= 18) {
        titleLines[titleLines.length - 1] += " " + remaining;
      } else if (remaining) {
        titleLines.push(remaining);
      }
    });
    const lines = titleLines.length ? titleLines : [safeTitle];
    const titleSvg = lines.slice(0, 3).map(function (line, index) {
      const safeLine = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return '<tspan x="50%" dy="' + (index === 0 ? 0 : 25) + '">' + safeLine + "</tspan>";
    }).join("");
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320">' +
      '<rect width="240" height="320" rx="8" fill="' + book.cover + '"/>' +
      '<rect x="14" y="14" width="212" height="292" rx="4" fill="none" stroke="#fff" stroke-opacity=".62"/>' +
      '<path d="M25 42h18v236H25z" fill="#243b32" fill-opacity=".22"/>' +
      '<text x="50%" y="122" text-anchor="middle" fill="#fffdf5" font-family="Arial,sans-serif" font-size="21" font-weight="700">' + titleSvg + "</text>" +
      '<text x="50%" y="255" text-anchor="middle" fill="#fffdf5" font-family="Arial,sans-serif" font-size="13">' +
      book.author.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</text>" +
      '<text x="50%" y="286" text-anchor="middle" fill="#fffdf5" font-family="Arial,sans-serif" font-size="11" letter-spacing="3">HIEU SACH</text>' +
      "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  booksSeed.forEach(function (book) {
    book.image = makeCover(book);
    delete book.cover;
  });

  const stockMovementsSeed = booksSeed.map(function (book) {
    return {
      id: "opening-" + book.id,
      bookId: book.id,
      direction: "in",
      quantity: book.stock + (book.id === "book-001" ? 1 : 0),
      occurredAt: "2026-10-01T00:00:00.000Z",
      referenceId: "opening-balance"
    };
  });
  stockMovementsSeed.push({
    id: "order-movement-001",
    bookId: "book-001",
    direction: "out",
    quantity: 1,
    occurredAt: "2026-11-02T09:30:00.000Z",
    referenceId: "DH001"
  });

  window.BookstoreSeed = {
    categories: categorySeed,
    books: booksSeed,
    customers: [
      {
        id: "customer-1", name: "Nguyễn Minh An", email: "an@example.com",
        phone: "0901234567", password: "123456", status: "active",
        addresses: [{ id: "addr-1", label: "Nhà riêng", recipient: "Nguyễn Minh An", phone: "0901234567", address: "12 Nguyễn Trãi, Quận 5, TP.HCM" }]
      },
      {
        id: "customer-2", name: "Trần Thu Hà", email: "ha@example.com",
        phone: "0912345678", password: "123456", status: "locked",
        addresses: [{ id: "addr-2", label: "Văn phòng", recipient: "Trần Thu Hà", phone: "0912345678", address: "38 Lê Lợi, Quận 1, TP.HCM" }]
      },
      {
        id: "customer-3", name: "Lê Hoàng Nam", email: "nam@example.com",
        phone: "0987654321", password: "123456", status: "active", addresses: []
      }
    ],
    currentCustomerId: null,
    cart: [],
    orders: [
      {
        id: "DH001",
        customerId: "customer-1",
        items: [{ bookId: "book-001", title: "Nhà giả kim", quantity: 1, price: 72800 }],
        deliveryAddress: "12 Nguyễn Trãi, Quận 5, TP.HCM",
        paymentMethod: "Tiền mặt khi nhận hàng",
        status: "Mới đặt",
        orderedAt: "2026-11-02T09:30:00.000Z",
        total: 72800
      }
    ],
    receipts: [
      {
        id: "PN001", receivedAt: "2026-10-30T00:00:00.000Z", status: "draft",
        items: [{ bookId: "book-001", quantity: 3, costPrice: 56000 }]
      }
    ],
    stockMovements: stockMovementsSeed,
    adminSession: null
  };
}());
