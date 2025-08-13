

import configuraciones from "./config.js";
// Esperamos a que todo el contenido del HTML se haya cargado
document.addEventListener('DOMContentLoaded', () => {

    const listaProductos = document.getElementById('lista-productos');
    const formulario = document.getElementById('formulario-producto');
    const nombreInput = document.getElementById('nombre-producto');
    const precioInput = document.getElementById('precio-producto');




    // La URL base de nuestra API que creamos con Node.js
    const API_URL = configuraciones.API_BACKEND;
    // --- FUNCIÓN PARA OBTENER Y MOSTRAR TODOS LOS PRODUCTOS (GET) ---
    const obtenerProductos = () => {
        // Usamos axios para hacer una petición GET
        axios.get(API_URL)
            .then(response => {
                // Si la petición es exitosa, la respuesta de la API está en `response.data`
                const productos = response.data.productos;
                
                // Limpiamos la lista actual antes de añadir los nuevos productos
                listaProductos.innerHTML = '';

                // Recorremos el array de productos y creamos un elemento <li> para cada uno
                productos.forEach(producto => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${producto.nombre}</span>
                        <span class="precio">$${producto.precio}</span>
                    `;
                    listaProductos.appendChild(li);
                });
            })
            .catch(error => {
                // Si hay un error, lo mostramos en la consola
                console.error('Error al obtener los productos:', error);
                listaProductos.innerHTML = '<li>Error al cargar los productos. Asegúrate de que el servidor esté corriendo.</li>';
            });
    };

    // --- FUNCIÓN PARA AÑADIR UN NUEVO PRODUCTO (POST) ---
    formulario.addEventListener('submit', (event) => {
        // Prevenimos que la página se recargue al enviar el formulario
        event.preventDefault();

        // Creamos el objeto con los datos del nuevo producto
        const nuevoProducto = {
            nombre: nombreInput.value,
            precio: parseFloat(precioInput.value)
        };

        // Usamos axios para hacer una petición POST, enviando el nuevo producto en el cuerpo de la petición
        axios.post(API_URL, nuevoProducto)
            .then(response => {
                // Si la petición es exitosa, mostramos un mensaje y volvemos a cargar la lista
                console.log('Producto añadido:', response.data.message);
                
                // Limpiamos los campos del formulario
                nombreInput.value = '';
                precioInput.value = '';
                
                // Actualizamos la lista de productos para que se vea el nuevo
                obtenerProductos(); 
            })
            .catch(error => {
                // Si hay un error, lo mostramos en la consola
                console.error('Error al añadir el producto:', error);
            });
    });

    // --- Carga inicial de los productos cuando la página se abre por primera vez ---
    obtenerProductos();
});
