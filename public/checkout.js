// Функция для загрузки и отображения товаров из корзины
function loadCartItems() {
    fetch('/basket')
    .then(response => response.json())
    .then(basketItems => {
        const orderDetailsContainer = document.getElementById('order-details');

        // Очищаем контейнер с деталями заказа
        orderDetailsContainer.innerHTML = '';

        // Перебираем товары в корзине и добавляем их в контейнер
        basketItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('basket-item');
            itemElement.innerHTML = `
                <img src="${item.изображение}" alt="${item.название}" width=200 height=150>
                <div class="item-details">
                    <h3>${item.название}</h3>
                    <p>Цена: ${item.цена} руб.</p>
                </div>
            `;
            orderDetailsContainer.appendChild(itemElement);
        });

        // Сохраняем ID заказа из корзины
        const orderId = basketItems[0].orderId; // Предположим, что ID заказа находится в поле orderId первого товара
        console.log('ID заказа:', orderId); // Добавим вывод ID заказа в консоль

        // Устанавливаем обработчик события на кнопку оформления заказа
        const placeOrderBtn = document.getElementById('place-order-btn');
        placeOrderBtn.onclick = function() {
            placeOrder(orderId);
        };
    })
    .catch(error => console.error('Ошибка загрузки данных о корзине:', error));
}

// Функция для оформления заказа
function placeOrder(orderId) {
    // Отправляем запрос на сервер для оформления заказа
    fetch('/place-order', { 
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId }) // Передаем ID заказа на сервер
    })
    .then(response => {
        if (response.ok) {
            console.log('Заказ успешно оформлен');
            alert('Ваш заказ успешно оформлен!');
            // Можно выполнить дополнительные действия после успешного оформления заказа
        } else {
            throw new Error('Ошибка при оформлении заказа');
        }
    })
    .catch(error => console.error('Ошибка оформления заказа:', error));
}

// Загрузка товаров из корзины при загрузке страницы
window.onload = loadCartItems;
