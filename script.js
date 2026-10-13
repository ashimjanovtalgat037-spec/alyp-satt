const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const productList = document.getElementById("productList");
const noResults = document.getElementById("noResults");

const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const sellerPhone = document.getElementById("sellerPhone");
const productImage = document.getElementById("productImage");
const addProductButton = document.getElementById("addProductButton");
const formMessage = document.getElementById("formMessage");

const STORAGE_KEY = "alypSatProducts";

// Сакталган товарларды жүктөө
function getSavedProducts() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

// Товарды экранга чыгаруу
function showProduct(item, save = false) {
    const product = document.createElement("article");
    product.className = "product";

    if (item.image) {
        const image = document.createElement("img");
        image.className = "product-image";
        image.src = item.image;
        image.alt = item.name;
        product.appendChild(image);
    }

    const title = document.createElement("h3");
    title.textContent = item.name;

    const price = document.createElement("p");
    price.textContent =
        "Баасы: " + Number(item.price).toLocaleString("ky-KG") + " сом";

    const phone = document.createElement("p");
    phone.textContent = "Байланыш: " + item.phone;

    product.append(title, price, phone);
    productList.prepend(product);

    if (save) {
        const products = getSavedProducts();
        products.push(item);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        } catch {
            formMessage.textContent =
                "Сактоого орун жетпей калды. Сүрөттү кичирейтип көр.";
            formMessage.style.color = "red";
        }
    }
}

// Мурун жарыяланган товарларды жүктөө
getSavedProducts().forEach(item => showProduct(item));

// Товар издөө
function searchProducts() {
    const searchText = searchInput.value.trim().toLowerCase();
    const products = productList.querySelectorAll(".product");
    let found = 0;

    products.forEach(product => {
        const matches =
            product.textContent.toLowerCase().includes(searchText);

        product.hidden = !matches;

        if (matches) found++;
    });

    noResults.hidden = found !== 0;
}

searchButton.addEventListener("click", searchProducts);
searchInput.addEventListener("input", searchProducts);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") searchProducts();
});

// Жаңы товар жарыялоо
addProductButton.addEventListener("click", () => {
    const name = productName.value.trim();
    const priceText = productPrice.value.trim();
    const price = Number(priceText);
    const phone = sellerPhone.value.trim();
    const file = productImage.files[0];

    if (!name || !priceText || !phone) {
        formMessage.textContent =
            "Товардын атын, баасын жана телефон номерин толтур!";
        formMessage.style.color = "red";
        return;
    }

    if (!Number.isFinite(price) || price <= 0) {
        formMessage.textContent = "Бааны туура жаз!";
        formMessage.style.color = "red";
        return;
    }

    if (file && !file.type.startsWith("image/")) {
        formMessage.textContent = "Сүрөт файлын танда!";
        formMessage.style.color = "red";
        return;
    }

    if (file && file.size > 1.5 * 1024 * 1024) {
        formMessage.textContent =
            "Сүрөт 1,5 МБдан кичине болушу керек.";
        formMessage.style.color = "red";
        return;
    }

    const addItem = image => {
        const item = { name, price, phone, image };

        try {
            const products = getSavedProducts();
            products.push(item);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        } catch {
            formMessage.textContent =
                "Сактоо ишке ашкан жок. Башка, кичирээк сүрөт танда.";
            formMessage.style.color = "red";
            return;
        }

        showProduct(item);

        productName.value = "";
        productPrice.value = "";
        sellerPhone.value = "";
        productImage.value = "";

        formMessage.textContent =
            "Товар жарыяланды жана браузерге сакталды!";
        formMessage.style.color = "green";

        searchInput.value = "";
        searchProducts();
    };

    if (file) {
        const reader = new FileReader();

        reader.onload = event => addItem(event.target.result);
        reader.onerror = () => {
            formMessage.textContent = "Сүрөттү окуу мүмкүн болгон жок.";
            formMessage.style.color = "red";
        };

        reader.readAsDataURL(file);
    } else {
        addItem("");
    }
});