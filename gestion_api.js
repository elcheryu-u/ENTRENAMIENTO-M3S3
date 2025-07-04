const urlAPI = "http://localhost:3000";

// Get product list
async function getProducts() {
    return fetch(`${urlAPI}/productos`)
        .then(response => response.json())
        .then(data => {
            console.log("Products:", data);
            return data;
        })
        .catch(error => {
            console.error("Error:", error);
            alert('Ocurrio un error al obtener los productos.');
            return [];
        });
}

// Add product
function addProduct(obj) {
    fetch(`${urlAPI}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Product added", data);
            window.location.reload()
        })
        .catch(error => console.error("Error:", error));
}

// Get product data to update
function getUpdateProductData(product) {
    // Copy from the product
    let updatedProduct = product;

    while (true) {
        try {
            const res = prompt(`
¿Qué quieres actualizar de "${product.nombre}"?

1. Nombre
2. Precio`)

            if (!res && typeof res !== "string") return false;
            
            if (res.length < 1) throw new Error("Valor inválido");

            if (res.startsWith("1") || res.startsWith("2")) {
                const definitions = {
                    1: 'nombre',
                    2: 'precio'
                }

                const newValue = prompt(`Escribe el nuevo valor para ${definitions[res]}`)
                
                if (!newValue) continue;

                if (res === "1" && res.length < 1 || res === "2" && !Number(newValue)) throw new Error("Valor inválido")

                updatedProduct[definitions[res]] = newValue;

                const confirmChanges = prompt(`
El nuevo ${definitions[res]} para ${product.nombre} será "${newValue}".

1. Confirmar
2. Continuar editando`)

                switch (confirmChanges) {
                        case '1': 
                            return updatedProduct;
                        case '2': 
                            continue
                        default: 
                            throw new Error("Valor inválido");
                    }
            } else {
                throw new Error("Valor inválido")
            }
        } catch (error) {
            console.error(error)
            if (error.message === "Valor inválido") {
                alert(error.message)
                continue;
            }

            break;
        }
    }

}

// Update product
function updateProduct(id, obj) {
    fetch(`${urlAPI}/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Product updated', data)
            window.location.reload();
        })
        .catch(error => console.error('Error:', error));
}

// Delete product
function deleteProduct(id) {
    fetch(`${urlAPI}/productos/${id}`, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(data => {
            console.log('Product deleted', data);
            alert(`El producto "${data.nombre}" ha sido eliminado.`)
            window.location.reload();
        })
        .catch(error => console.error("Error", error))
}

function validateProduct(product) {
    if (!product.nombre || typeof product.precio !== "number") {
        console.error("Invalid product data");
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    // Show products in table
    if ("content" in document.createElement("template")) {
        const t = document.querySelector("#product-row");
        const tbody = document.querySelector("tbody");

        getProducts()
            .then(products => {
                products.forEach(product => {
                    // Clone the template
                    let clone = document.importNode(t.content, true);
                    let td = clone.querySelectorAll("td");

                    // Fill the data
                    td[0].textContent = product.nombre;
                    td[1].textContent = product.precio;

                    // Add action buttons
                    td[2].innerHTML = `
                        <button class="btn edit" data-id="${product.id}">Editar</button>
                        <button class="btn delete" data-id="${product.id}">Eliminar</button>
                    `
                    
                    // Add row to tbody
                    tbody.appendChild(clone);
                });

                // Table buttons event listeners

                document.querySelectorAll(".btn.edit").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const id = btn.dataset.id;
                        const prod = products.find(prod => prod.id === id)

                        const obj = getUpdateProductData(prod);

                        // getUpdateProductData will return a bool or a object
                        if (!obj) return;

                        updateProduct(id, obj);
                    })
                });

                document.querySelectorAll('.btn.delete').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.dataset.id;
                        const prod = products.find(prod => prod.id === id)

                        if (confirm(`¿Deseas eliminar el producto ${id}: ${prod.nombre}`)) {
                            deleteProduct(id);
                        }
                    })
                })
            })
    } else {
        alert('Tu navegador es incompatible. Te recomendamos usar Google Chrome');
        window.location.reload();
    }

    // Add product form event listener
    const form = document.getElementById('addProductForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formElements = form.elements;

        const obj = {
            nombre: formElements[0].value,
            precio: Number(formElements[1].value)
        }

        if (validateProduct(obj)) addProduct(obj);
    })
})