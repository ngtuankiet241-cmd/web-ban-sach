// Tiện ích giao diện dùng chung cho bốn trang HTML; hiện cập nhật năm ở chân trang.
const year = document.querySelector("[data-current-year]");

if (year) {
  year.textContent = new Date().getFullYear();
}
