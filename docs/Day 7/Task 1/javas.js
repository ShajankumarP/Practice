const products = [];

class Product {
    constructor(name, price, quantity) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }
}
function addProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('name_input').value.trim();
    const price = parseFloat(document.getElementById('price_input').value);
    const quantity = parseInt(document.getElementById('quantity_input').value);

    const alertMsg = document.getElementById('alert');
    const inventoryList = document.getElementById('inventoryList');

    if (name && !isNaN(price) && !isNaN(quantity)) {
        if (productExists(name)) {
            alertMsg.textContent = 'Product already exists';
            alertMsg.style.color = "red";
        } else {
            const product = { name, price, quantity };
            products.push(product);
            updateInventoryDisplay();
            document.querySelector('.productForm').reset();
            alertMsg.textContent = '';
        }
    } else {
        alertMsg.textContent = 'Please fill all fields with valid data';
        alertMsg.style.color = "red";
    }
    alertMsg.style.display = 'flex';
    alertMsg.style.justifyContent = 'center';
}

function productExists(name) {
    return products.some(product => product.name.toLowerCase() === name.toLowerCase());
}

function updateInventoryDisplay() {
    const inventoryList = document.getElementById('inventoryList');
    inventoryList.innerHTML = `
        <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
        </tr>
    `;
    
    products.forEach((product, index) => {
        const row = inventoryList.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td class="actions">
                <i class="fa-solid fa-pen-to-square icon-btn" onclick="editProduct(${index})"></i>
                <i class="fa-solid fa-trash icon-btn" onclick="deleteProduct(${index})"></i>
            </td>
        `;
    });
}

function editProduct(index) {
    const product = products[index];
    document.getElementById('name_input').value = product.name;
    document.getElementById('price_input').value = product.price;
    document.getElementById('quantity_input').value = product.quantity;
    
    document.querySelector('button[type="submit"]').textContent = "Save Changes";
    document.querySelector('button[type="submit"]').onclick = function(e) {
        e.preventDefault();
        saveEditedProduct(index);
    };
}

function saveEditedProduct(index) {
    const name = document.getElementById('name_input').value.trim();
    const price = parseFloat(document.getElementById('price_input').value);
    const quantity = parseInt(document.getElementById('quantity_input').value);

    const alertMsg = document.getElementById('alert');

    if (name && !isNaN(price) && !isNaN(quantity)) {
        const nameExists = products.some((p, i) => i !== index && p.name.toLowerCase() === name.toLowerCase());
        
        if (nameExists) {
            alertMsg.textContent = 'Product already exists';
            alertMsg.style.color = "red";
        } else {
            products[index].name = name;
            products[index].price = price;
            products[index].quantity = quantity;
            updateInventoryDisplay();
            document.querySelector('.productForm').reset();
            document.querySelector('button[type="submit"]').textContent = "Add Product";
            alertMsg.textContent = "Product updated successfully";
            alertMsg.style.color = "green";
            setTimeout(() => {
                alertMsg.textContent = '';
                alertMsg.style.display = 'none';
            }, 2000);
        }
    } else {
        alertMsg.textContent = 'Please fill all fields with valid data';
        alertMsg.style.color = "red";
    }
    alertMsg.style.display = 'flex';
    alertMsg.style.justifyContent = 'center';
}

function deleteProduct(index) {
    products.splice(index, 1);
    updateInventoryDisplay();
    const alertMsg = document.getElementById('alert');
    alertMsg.textContent = "Product deleted successfully";
    alertMsg.style.color = "green";
    alertMsg.style.display = 'flex';
    alertMsg.style.justifyContent = 'center';
    setTimeout(() => {
        alertMsg.textContent = '';
        alertMsg.style.display = 'none';
    }, 2000);
}
