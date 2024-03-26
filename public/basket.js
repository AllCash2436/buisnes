// JavaScript-код для получения товаров из корзины и их отображения на странице
fetch('/basket')
    .then(response => response.json())
    .then(basketItems => {
        const basketItemsContainer = document.getElementById('basket-items');

        // Очищаем контейнер с товарами
        basketItemsContainer.innerHTML = '';

        // Перебираем товары в корзине и добавляем их в контейнер
        basketItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('basket-item');
            itemElement.innerHTML = `
                <img src="${item.изображение}" alt="${item.название}" width=150 height=150>
                <div class="item-details">
                    <h3>${item.название}</h3>
                    <p>Цена: ${item.цена} руб.</p>
                    <button class="btn_rm" onclick="removeItemFromCart(${item.id}, ${item.orderId})">Удалить из корзины</button> <!-- Кнопка удаления товара -->
                </div>
            `;
            basketItemsContainer.appendChild(itemElement);
        });

        // Вычисляем общую стоимость товаров в корзине
        const totalPrice = basketItems.reduce((total, item) => total + item.цена, 0);

        // Отображаем общую стоимость на странице
        const totalPriceContainer = document.getElementById('total-price');
        totalPriceContainer.innerHTML = `<p>Общая стоимость: ${totalPrice} руб.</p>`;
    })
    .catch(error => console.error('Ошибка загрузки данных о корзине:', error));

// Функция для удаления товара из корзины
function removeItemFromCart(itemId, orderId) {
    fetch(`/remove-from-cart/${orderId}/${itemId}`, { method: 'DELETE' })
    .then(response => {
        if (response.ok) {
            // Обновляем список товаров в корзине после успешного удаления
            fetchBasketData();
            // Отправляем запрос на обновление статуса заказа
            updateOrderStatus(orderId);
        } else {
            throw new Error('Ошибка при удалении товара из корзины');
        }
    })
    .catch(error => console.error('Ошибка удаления товара из корзины:', error));
}

// Функция для обновления статуса заказа
function updateOrderStatus(orderId) {
    fetch(`/update-order-status/${orderId}`, { method: 'PUT' })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при обновлении статуса заказа');
        }
    })
    .catch(error => console.error('Ошибка обновления статуса заказа:', error));
}


// Функция для получения данных о корзине после удаления товара
function fetchBasketData() {
    fetch('/basket')
    .then(response => response.json())
    .then(basketItems => {
        // Обновляем отображение корзины на основе полученных данных
        updateBasketView(basketItems);
    })
    .catch(error => console.error('Ошибка загрузки данных о корзине:', error));
}

// Функция для обновления отображения корзины после удаления товара
function updateBasketView(basketItems) {
    const basketItemsContainer = document.getElementById('basket-items');

    // Очищаем контейнер с товарами
    basketItemsContainer.innerHTML = '';

    // Перебираем товары в корзине и добавляем их в контейнер
    basketItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('basket-item');
        itemElement.innerHTML = `
            <img src="${item.изображение}" alt="${item.название}" width=150 height=150>
            <div class="item-details">
                <h3>${item.название}</h3>
                <p>Цена: ${item.цена} руб.</p>
                <button onclick="removeItemFromCart(${item.id}, ${item.orderId})">Удалить из корзины</button> <!-- Кнопка удаления товара -->
            </div>
        `;
        basketItemsContainer.appendChild(itemElement);
    });

    // Вычисляем общую стоимость товаров в корзине
    const totalPrice = basketItems.reduce((total, item) => total + item.цена, 0);

    // Отображаем общую стоимость на странице
    const totalPriceContainer = document.getElementById('total-price');
    totalPriceContainer.innerHTML = `<p>Общая стоимость: ${totalPrice} руб.</p>`;
}

