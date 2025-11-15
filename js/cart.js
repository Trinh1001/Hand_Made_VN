/**
 * js/cart.js
 * Logic xử lý giỏ hàng (Hiển thị, cập nhật, tính toán)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Khóa Local Storage và Phí vận chuyển
    const CART_KEY = 'cartItems';
    const SHIPPING_FEE = 30000; // Phí ship cố định

    // Phần tử DOM
    const cartTableBody = document.getElementById('cart-table-body');
    const subtotalElement = document.getElementById('summary-subtotal');
    const shippingElement = document.getElementById('summary-shipping');
    const totalElement = document.getElementById('summary-total-amount');
    const checkoutForm = document.getElementById('checkout-form');
    const navCartCount = document.getElementById('nav-cart-count');
    const cartItemTable = document.getElementById('cart-item-table'); // Thêm
    const checkoutMessage = document.getElementById('checkout-message'); // Thêm

    // Dữ liệu sản phẩm mẫu (Giữ nguyên như của bạn)
    const productData = {
        'HM001': { name: 'Túi Xách Mây Tre Đan Sapa', price: 380000, image: 'images/tui-xach-may-tre-dan-sapa.jpg' }, 
        'HM002': { name: 'Ví Cầm Tay Dệt Thổ Cẩm', price: 250000, image: 'images/vi-tho-cam-dep.jpeg' }, 
        'HM003': { name: 'Giỏ Đựng Đồ Vintage Dây Cói', price: 210000, image: 'images/gio-dung-do-vintage-day-coi.jpg' }, 
        'HM004': { name: 'Khăn Choàng Vải Lanh Cao Cấp', price: 450000, image: 'images/khan-choang-vai-lanh-cao-cap-dep.jpg' },
        'HM005': { name: 'Balo Dây Rút Hoạ Tiết Dân Tộc', price: 590000, image: 'images/balo-day-rut-vai-hoa-tiet-dan-toc.jpg' },
        'HM006': { name: 'Bộ Ấm Chén Gốm Men Ngọc Bích', price: 750000, image: 'images/bo-am-chen-dep-cao-cap-gom-ne-hung-hoa-tiet-song-ngu-at46-1.jpg' }, 
        'HM007': { name: 'Hộp Tròn Đan Tre Cổ Truyền', price: 180000, image: 'images/hop-tre-dan-tre-co-truyen.jpg' }, 
        'HM008': { name: 'Bình Hoa Gốm Trắng Hiện Đại', price: 400000, image: 'images/binh-hoa-gom-decor-mau-trang-toi-gian-hien-dai.jpg' }, 
        'HM009': { name: 'Đèn Lồng Tre Đan Trần Nhà', price: 620000, image: 'images/den_long-tre-dan-tran-nha.jpg' }, 
        'HM010': { name: 'Thảm Trải Sàn Dệt Cói Tự Nhiên', price: 310000, image: 'images/tham-trai-san-det-coi-tu-nhien.jpg' }, 
        'HM011': { name: 'Tranh Thêu Tay "Hoa Sen Vàng"', price: 1800000, image: 'images/tranh-theu-tay-hoa-sen-vang.jpg' }, 
        'HM012': { name: 'Tượng Phật Gỗ Trắc Mini', price: 890000, image: 'images/tuong-phat-di-lac-cam-vang-mini-go-trac-cao-cap.jpg' }, 
        'HM013': { name: 'Nến Thơm Tinh Dầu Quế Hồi', price: 150000, image: 'images/nen-thom-tinh-dau-que-hoi.jpg' },
        'HM014': { name: 'Bộ Đũa Muỗng Tre Khắc Tên', price: 110000, image: 'images/bo-dua-muong-tre-khac-ten-cao-cap.jfif' },
        'HM015': { name: 'Khay Trà Gỗ Hương Cao Cấp', price: 1250000, image: 'images/khay-tra-go-huong-cao-cap.jpg' },
        'HM016': { name: 'Bộ Pha Cà Phê Gỗ Phin Đơn', price: 790000, image: 'images/phin_pha_cafe_cao_co_bep_dun_cf.jpg' },
        'HM017': { name: 'Vòng Cổ Bạc Ta Chạm Khắc', price: 950000, image: 'images/trang-suc-bac-thu-cong.jpg' },
        'HM018': { name: 'Hộp Gỗ Đựng Trang Sức Khảm Trai', price: 1500000, image: 'images/hop-go-dung-trang-suc.jpg' }, 
        'HM019': { name: 'Bộ Khuyên Tai Gỗ Sưa Điêu Khắc', price: 350000, image: 'images/bo-khuyen-tai-go-sua.jpg' }, 
        'HM020': { name: 'Hoa Tai Lông Chim Thổ Cẩm', price: 180000, image: 'images/hoa-tai-long-chim-tho-cam.jpg' } 
    };

    // --- CÁC HÀM CƠ BẢN ---
    
    function formatVND(amount) {
        if (typeof amount !== 'number') {
            amount = 0;
        }
        return amount.toLocaleString('vi-VN') + '₫';
    }

    function getCart() {
        return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCount(); // Cập nhật số lượng mỗi khi lưu
    }

    function updateCartCount() {
        const cart = getCart();
        if (navCartCount) {
            // Sửa logic: Đếm tổng số lượng (quantity) thay vì số loại (length)
            const totalCount = cart.reduce((total, item) => total + item.quantity, 0);
            navCartCount.textContent = totalCount;
        }
    }

    function updateSummary(subtotal) {
        // Chỉ tính phí ship và tổng khi có hàng
        const shipping = subtotal > 0 ? SHIPPING_FEE : 0;
        const total = subtotal + shipping;

        if (subtotalElement) subtotalElement.textContent = formatVND(subtotal);
        if (shippingElement) shippingElement.textContent = formatVND(shipping);
        if (totalElement) totalElement.textContent = formatVND(total);
    }

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN (ĐÃ BỊ TRỐNG TRƯỚC ĐÂY) ---

    /**
     * [MỚI] Vẽ lại toàn bộ giỏ hàng
     */
    function renderCart() {
        // Chỉ chạy nếu đang ở trang giỏ hàng
        if (!cartTableBody) return; 

        const cart = getCart();
        let subtotal = 0;
        let html = '';

        if (cart.length === 0) {
            html = '<tr><td colspan="5" class="empty-cart-message">Giỏ hàng của bạn đang trống.</td></tr>';
        } else {
            cart.forEach(item => {
                const product = productData[item.id];
                
                // Kiểm tra nếu sản phẩm có trong CSDL (productData)
                if (product) {
                    const itemTotal = product.price * item.quantity;
                    subtotal += itemTotal;

                    // Tạo một hàng (row) cho mỗi sản phẩm
                    html += `
                        <tr data-id="${item.id}">
                            <td class="cart-item-product">
                                <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                                <div class="cart-item-details">
                                    <span class="cart-item-name">${product.name}</span>
                                    <span class="cart-item-id">ID: ${item.id}</span>
                                </div>
                            </td>
                            <td class="cart-item-price">${formatVND(product.price)}</td>
                            <td class="cart-item-quantity">
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                            </td>
                            <td class="cart-item-total">${formatVND(itemTotal)}</td>
                            <td class="cart-item-remove">
                                <button class="remove-btn" data-id="${item.id}" aria-label="Xóa sản phẩm">×</button>
                            </td>
                        </tr>
                    `;
                }
            });
        }
        
        // Đưa HTML vào và cập nhật Tóm tắt
        cartTableBody.innerHTML = html;
        updateSummary(subtotal);
        
        // Gắn listener cho các nút vừa tạo
        addCartEventListeners();
    }

    /**
     * [MỚI] Gắn sự kiện cho các nút Xóa và ô Số lượng
     */
    function addCartEventListeners() {
        const quantityInputs = cartTableBody.querySelectorAll('.quantity-input');
        const removeButtons = cartTableBody.querySelectorAll('.remove-btn');

        quantityInputs.forEach(input => {
            input.addEventListener('change', updateQuantity);
        });

        removeButtons.forEach(button => {
            button.addEventListener('click', removeItem);
        });
    }

    /**
     * [MỚI] Xử lý khi thay đổi số lượng
     */
    function updateQuantity(e) {
        const productId = e.target.dataset.id;
        let newQuantity = parseInt(e.target.value);
        let cart = getCart();

        if (newQuantity < 1) {
            newQuantity = 1; // Số lượng ít nhất là 1
            e.target.value = 1; // Cập nhật lại ô input
        }

        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity = newQuantity;
        }
        
        saveCart(cart);
        renderCart(); // Vẽ lại toàn bộ giỏ hàng để cập nhật tổng tiền
    }

    /**
     * [MỚI] Xử lý khi nhấn nút Xóa
     */
    function removeItem(e) {
        const productId = e.target.closest('.remove-btn').dataset.id;
        let cart = getCart();
        
        // Lọc và giữ lại các sản phẩm KHÔNG trùng ID
        cart = cart.filter(item => item.id !== productId);
        
        saveCart(cart);
        renderCart(); // Vẽ lại giỏ hàng
    }

    /**
     * [MỚI] Xử lý khi nhấn nút "Xác nhận & Đặt hàng"
     */
    function handleCheckout(e) {
        e.preventDefault(); // Ngăn form gửi đi
        
        const cart = getCart();
        
        if (cart.length === 0) {
            checkoutMessage.textContent = 'Giỏ hàng của bạn đang trống. Không thể thanh toán.';
            checkoutMessage.style.color = 'var(--error-color)';
            return;
        }

        // Kiểm tra tính hợp lệ của form
        if (!checkoutForm.checkValidity()) {
            checkoutMessage.textContent = 'Vui lòng điền đầy đủ các trường thông tin bắt buộc (*).';
            checkoutMessage.style.color = 'var(--error-color)';
            // Kích hoạt thông báo lỗi HTML5 native
            checkoutForm.reportValidity(); 
            return;
        }

        // --- Giả lập quá trình đặt hàng thành công ---
        
        const formData = new FormData(checkoutForm);
        const customerName = formData.get('name');

        // 1. Hiển thị thông báo thành công
        checkoutMessage.textContent = `Cảm ơn ${customerName}, đơn hàng của bạn đã được đặt thành công!`;
        checkoutMessage.style.color = 'var(--success-color)';
        
        // 2. Vô hiệu hóa form
        checkoutForm.querySelector('button[type="submit"]').disabled = true;
        checkoutForm.querySelectorAll('input, textarea').forEach(el => el.disabled = true);
        
        // 3. Xóa giỏ hàng khỏi localStorage
        localStorage.removeItem(CART_KEY);
        
        // 4. Cập nhật số đếm trên nav về 0
        updateCartCount();

        // 5. Ẩn bảng giỏ hàng và cập nhật tóm tắt
        if (cartItemTable) cartItemTable.style.opacity = '0.3';
        updateSummary(0);
    }

    // --- HÀM GLOBAL ĐỂ THÊM VÀO GIỎ (DÙNG TỪ products.html) ---

    window.addToCart = (productId, quantity = 1) => {
        let cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            // Đã có, tăng số lượng
            cart[itemIndex].quantity += quantity;
        } else {
            // Chưa có, thêm mới
            if (productData[productId]) {
                cart.push({ id: productId, quantity: quantity });
            } else {
                console.warn(`Sản phẩm với ID ${productId} không tồn tại.`);
                return;
            }
        }
        saveCart(cart);
        updateCartCount(); 
    }
    
    // --- KHỞI CHẠY ---

    // 1. Nếu đang ở trang giỏ hàng, gọi hàm renderCart()
    if (document.body.classList.contains('page-cart')) {
        renderCart();
    }
    
    // 2. Gắn sự kiện cho form thanh toán
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
    
    // 3. Luôn cập nhật số lượng trên nav khi tải trang
    updateCartCount(); 
});