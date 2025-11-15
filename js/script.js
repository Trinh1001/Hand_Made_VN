/**
 * js/script.js
 * Các hàm JavaScript chung cho website
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Hiệu ứng cuộn cho Header
    const header = document.getElementById('navbar');
    if (header) { // Đảm bảo header tồn tại trước khi thêm event listener
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 2. Placeholder cho các script khác
    // Ví dụ: Lightbox, Carousel, v.v.
});