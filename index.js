// Base de datos de productos
let dbProductos = [
  {
    id: 1,
    nombre: "Pantalon Babucha",
    precio: 16500,
    imagen: "./img/babucha.webp",
    tipo: "pantalones",
  },
  {
    id: 2,
    nombre: "Pantalon Jeans",
    precio: 15500,
    imagen: "./img/jeans.webp",
    tipo: "pantalones",
  },
  {
    id: 3,
    nombre: "Pantalon Joggers",
    precio: 15500,
    imagen: "./img/joggers.webp",
    tipo: "pantalones",
  },
  {
    id: 4,
    nombre: "Pantalon Baggy",
    precio: 15500,
    imagen: "./img/baggy.webp",
    tipo: "pantalones",
  },
  {
    id: 5,
    nombre: "Buzo blue",
    precio: 16500,
    imagen: "./img/buzo.webp",
    tipo: "buzos",
  },
  {
    id: 6,
    nombre: "Buzo escoces",
    precio: 16500,
    imagen: "./img/camisa.webp",
    tipo: "buzos",
  },
  {
    id: 7,
    nombre: "Sweater grey",
    precio: 12500,
    imagen: "./img/sweater.webp",
    tipo: "buzos",
  },
  {
    id: 8,
    nombre: "Canguro b&w",
    precio: 16500,
    imagen: "./img/canguro.webp",
    tipo: "buzos",
  },
];

// Verificar si hay datos guardados en el LocalStorage y actualizar la base de datos de productos
let dbLocal = localStorage.getItem("dbProductos");
if (dbLocal && JSON.parse(dbLocal).length > dbProductos.length) {
  dbProductos = JSON.parse(dbLocal);
} else {
  localStorage.setItem("dbProductos", JSON.stringify(dbProductos));
}

// Variables globales
let carrito = [];
let contador = 0;

// Elementos del DOM
const productos = document.querySelector(".productos");
const modal = document.querySelector("#detallesModal");
const tipoSelector = document.getElementById("tipoSelector");
const btnIrAlCarrito = document.querySelector("#btnIrAlCarrito");
const popCarritoElement = document.getElementById("popCarrito");

// Event listener para el selector de tipo de producto
tipoSelector.addEventListener("change", mostrarProductos);

// Event listener para cargar el carrito desde el LocalStorage al cargar la página
window.onpageshow = function () {
  let carritoLocal = localStorage.getItem("carrito");
  if (carritoLocal && carritoLocal.length > 0) {
    carrito = JSON.parse(carritoLocal);
    verificarElementosEnCarrito();
    popCarritoElement.style.right = "1em";
    actualizarCarrito();
  }
};

// Función para mostrar los productos según el tipo seleccionado
function mostrarProductos() {
  const tipoSeleccionado = tipoSelector.value;
  const productosFiltrados = dbProductos.filter(
    (producto) =>
      tipoSeleccionado === "todos" || producto.tipo === tipoSeleccionado
  );
  productos.innerHTML = productosFiltrados
    .map((productoItem) => crearTarjetaDeProducto(productoItem))
    .join("");
  generarModalPorId();
}

// Función para crear la tarjeta de producto
function crearTarjetaDeProducto(productoItem) {
  const { id, nombre, precio, imagen } = productoItem;
  return `
    <div class="col-6 col-xl-3 col-lg-4">
      <div class="items-detalles-link">
        <figure>
          <div class="image-container">
            <div class="producto">
              <img src="${imagen}" alt="Producto 2" />
              <div class="mask"></div>
            </div>
            <figcaption class="ocultar-mobile">
              <button onclick="generarModalPorId()" class="btn-detalles" id="${id}detallesModal" data-bs-toggle="modal" data-bs-target="#detallesModal">
                Ver detalles
              </button>
            </figcaption>
          </figure>
        </div>
        <div class="items-bottom">
          <p class="items-titulo">${nombre}</p>
          <div class="items-precio">$ ${precio.toLocaleString(undefined)}</div>
        </div>
        <div class="items-bottom flexear">
          <button class="btn btn-primary btn-agregar-carrito btnAgregar" id="${id}">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  `;
}

// Función para crear el modal de detalles del producto
function crearModal(productoItem) {
  const { id, nombre, precio, imagen } = productoItem;
  return `
    <div class="modal-dialog modal-dialog-mio modal-dialog-centered">
    <div class="modal-content modal-content-mio">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="detallesModalLabel">${nombre}</h1>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <span
          ><img src="${imagen}" alt="Producto 2" /></span
        >
      </div>
      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-primary btn-mio"
          data-bs-dismiss="modal"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
    `;
}

// Función para generar el modal de detalles del producto según el ID
function generarModalPorId() {
  const btnModales = document.querySelectorAll(".btn-detalles");
  btnModales.forEach((btnModal) => {
    btnModal.addEventListener("click", () => {
      const id = btnModal.id.replace("detallesModal", "");
      const tipoSeleccionado2 = parseInt(id);
      const productosFiltrados = dbProductos.filter(
        (producto) => producto.id === tipoSeleccionado2
      );
      modal.innerHTML = productosFiltrados.map((productoItem) =>
        crearModal(productoItem)
      );
    });
  });
}

// Función para agregar un producto al carrito
function agregarAlCarrito(producto) {
  popCarritoElement.style.right = "1em";
  const productoBusqueda = carrito.find(
    (productoCarrito) => productoCarrito.id === producto.id
  );
  if (productoBusqueda) {
    productoBusqueda.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarrito();
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(id) {
  var item = carrito[id];
  if (item.cantidad > 1) {
    item.cantidad--;
  } else {
    carrito.splice(id, 1);
  }
  if (carrito.length === 0) {
    localStorage.removeItem("carrito");
  } else {
    localStorage.carrito = JSON.stringify(carrito);
  }
  actualizarCarrito();
}

// Función para actualizar el carrito en el DOM
function actualizarCarrito() {
  const carritoSelector2 = document.querySelector(".content-cart");
  const subtotal = document.getElementById("subtotal");
  carritoSelector2.innerHTML = "";
  subtotal.innerHTML = "";
  let contador = 0;
  let cantidadDeProductos = 0;
  if (carrito.length > 0) {
    let carritoHTML2 = "";
    carrito.forEach((producto) => {
      const { id, nombre, precio, cantidad, imagen } = producto;
      contador += precio * cantidad;
      cantidadDeProductos += cantidad;
      carritoHTML2 += `
        <div class="row py-1">
          <div class="col s4">
            <picture>
              <img src="${imagen}" alt="Producto 2" style="max-width: 100%; height: auto" />
            </picture>
          </div>
          <div class="col s8 pr-0">
            <p class="tituloNombreCart">
              <label class="tituloProductoCart" style="color: black">${nombre}</label>
            </p>
            <div class="fw-700 texto-xxs">
              CANTIDAD:
              <div class="atributosCart"><strong>${cantidad}</strong></div>
              <div>$${(precio * cantidad).toLocaleString(
                undefined
              )}</div><br><br>
              <button class="btnEliminar" id="${id}Eliminar">X Eliminar</button>
            </div>
          </div>
        </div>
        <hr>
      `;
    });
    carritoSelector2.innerHTML = carritoHTML2;
    subtotal.innerHTML = `
      <div class="col s6">Subtotal:</div>
      <div class="col s6"><b>$${contador.toLocaleString(undefined)}</b></div>
    `;
  } else {
    carritoSelector2.innerHTML = `<p> No hay productos en el carrito</p>`;
    document.getElementById("popCarrito").style.right = "-30em";
  }
}

// Event listener para los botones de agregar y eliminar productos del carrito
document.addEventListener("click", (e) => {
  const btnAgregar = document.querySelectorAll(".btnAgregar");
  const btnEliminar = document.querySelectorAll(".btnEliminar");
  const btnModal = document.querySelectorAll(".btn-detalles");

  // Agregar producto al carrito
  btnAgregar.forEach((btn) => {
    if (e.target == btn) {
      const id = parseInt(e.target.id);
      const producto = dbProductos.find((producto) => producto.id === id);
      agregarAlCarrito(producto);
    }
  });

  // Eliminar producto del carrito
  btnEliminar.forEach((btnBorrar) => {
    if (e.target == btnBorrar) {
      const id = btnBorrar.id.replace("Eliminar", "");
      const productoBusqueda = carrito.findIndex(
        (producto) => producto.id === parseInt(id)
      );
      eliminarDelCarrito(productoBusqueda);
    }
  });
});

// Función para cerrar el popup del carrito
const btnCerrar = document.getElementById("btnCerrar");
btnCerrar.addEventListener("click", cerrarCarritoPopUp);

// Función para vaciar el carrito
const btnVaciar = document.getElementById("btnVaciar");
btnVaciar.addEventListener("click", vaciarCarrito);

// Función para redirigir al carrito
btnIrAlCarrito.addEventListener("click", irAlCarrito);

// Función para cerrar el popup del carrito
function cerrarCarritoPopUp() {
  document.getElementById("popCarrito").style.right = "-30em";
}

// Función para vaciar el carrito
function vaciarCarrito() {
  Swal.fire({
    title: "Estás seguro?",
    text: "No va a poder revertir los cambios!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonText: "No, cancelar",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, vaciar",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("¡Confirmado!", "Su carrito ha sido vaciado", "success");
      carrito = [];
      localStorage.removeItem("carrito");
      actualizarCarrito();
    }
  });
}

// Función para redirigir al carrito
function irAlCarrito() {
  window.location.href = "./cart.html";
}

// Función para renderizar las opciones del selector de tipo de producto
function renderizarSelect() {
  const opcionesUnicas = [...new Set(dbProductos.map((opcion) => opcion.tipo))];
  opcionesUnicas.forEach((opcion) => {
    const option = document.createElement("option");
    option.text = opcion.charAt(0).toUpperCase() + opcion.slice(1);
    option.value = opcion;
    option.classList.add(opcion.clase);
    tipoSelector.add(option);
  });
}

// Función para verificar si los elementos en el carrito existen en la base de datos de productos
function verificarElementosEnCarrito() {
  if (!carrito) {
    console.log("El carrito está vacío.");
    return;
  }
  const elementosNoEncontrados = carrito.filter(
    (elementoCarrito) =>
      !dbProductos.some((producto) => producto.id === elementoCarrito.id)
  );
  if (elementosNoEncontrados.length === 0) {
    console.log("Todos los elementos en el carrito están en dbProductos.");
  } else {
    console.log(
      "Los siguientes elementos en el carrito no se encontraron en dbProductos:"
    );
    elementosNoEncontrados.forEach((elemento) => {
      console.log(`- ID: ${elemento.id}, Nombre: ${elemento.nombre}`);
      const productoBusqueda = carrito.findIndex(
        (producto) => producto.id === parseInt(elemento.id)
      );
      eliminarDelCarrito(productoBusqueda);
      console.log("producto eliminado");
    });
  }
}

// Mostrar productos y renderizar el selector de tipo de producto al cargar la página
mostrarProductos();
renderizarSelect();
