// Obtener el objeto localStorage
const miLocalStorage = window.localStorage;

// Arreglo para almacenar los productos
let dbProductos = [];

// Dirección de la API
const apiAddress = "https://650de701a8b42265ec2ccfd9.mockapi.io/dbProductos";

// Tomar el documento
const $d = document;

// Elemento que muestra la cantidad de productos en el carrito
const numeroCarrito = $d.querySelector("#numeroCarrito");

// Obtener el carrito del localStorage
let carrito = JSON.parse(miLocalStorage.getItem("carrito")) || [];

// Calcular la cantidad de productos en el carrito
const cantidadCarrito = sumarCantidadCarrito(carrito);

// Mostrar la cantidad de productos en el carrito
numeroCarrito.textContent = cantidadCarrito;

// Obtener los elementos del formulario y los selectores
const productos = $d.querySelector(".productos");
const modal = $d.querySelector("#detallesModal");
const tipoSelector = $d.getElementById("tipoSelector");
const btnIrAlCarrito = $d.querySelector("#btnIrAlCarrito");
const popCarritoElement = $d.getElementById("popCarrito");
const carritoSelector2 = $d.querySelector(".content-cart");
const subtotal = $d.getElementById("subtotal");
const btnCerrar = $d.getElementById("btnCerrar");
const btnVaciar = $d.getElementById("btnVaciar");
let contador = 0;

// EventListeners para cerrar popUp, vaciar el carrito, redirigir al carrito, selector
btnCerrar.addEventListener("click", cerrarCarritoPopUp);
btnVaciar.addEventListener("click", vaciarCarrito);
btnIrAlCarrito.addEventListener("click", irAlCarrito);
tipoSelector.addEventListener("change", mostrarProductos);

$d.addEventListener(
  "DOMContentLoaded",
  llenarDBProductos,
  renderizarSelect,
  mostrarCantidadCarrito
);

console.log(dbProductos);

// Mostrar los productos según el tipo seleccionado
function mostrarProductos() {
  const tipoSeleccionado = tipoSelector.value;
  const productosFiltrados = dbProductos.filter(
    (producto) =>
      tipoSeleccionado === "todos" || producto.tipo === tipoSeleccionado
  );
  productos.innerHTML = "";
  productosFiltrados.forEach((productoItem) => {
    const tarjetaProducto = crearTarjetaDeProducto(productoItem);
    productos.appendChild(tarjetaProducto);
  });
  generarModalPorId();
}

function slider() {
  if (carrito.length > 0) {
    console.log(carrito);
    popCarritoElement.style.right = "1em";
  } else {
    popCarritoElement.style.right = "-30em";
  }
}

// Obtener los datos de la API y cargar los productos al DOM
async function llenarDBProductos() {
  const response = await fetch(apiAddress);
  if (!response.ok) {
    mostrarError("Error al obtener los datos de la API");
  }
  const data = await response.json();
  dbProductos = data;
  verificarElementosEnCarrito();
  slider();
  actualizarCarrito();
  cargarProductosAlDom();
}

// Función para mostrar la cantidad de productos en el carrito
function mostrarCantidadCarrito() {
  const cantidadCarrito = carrito.reduce(
    (suma, producto) => suma + producto.cantidad,
    0
  );
  numeroCarrito.innerHTML = cantidadCarrito;
}

function cargarProductosAlDom() {
  if (dbProductos.length > 0) {
    mostrarProductos();
    renderizarSelect();
  } else {
    console.log("No hay productos en la base de datos");
  }
}

// Crear la tarjeta de producto
function crearTarjetaDeProducto(productoItem) {
  const { id, nombre, precio, imagen, stock } = productoItem;
  const tarjeta = $d.createElement("div");
  tarjeta.classList.add("col-6", "col-xl-3", "col-lg-4");
  tarjeta.innerHTML = `
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
  `;
  return tarjeta;
}

// Crear el modal de detalles del producto
function crearModal(productoItem) {
  const { id, nombre, precio, imagen, stock } = productoItem;
  const modal = $d.createElement("div");
  modal.classList.add(
    "modal-dialog",
    "modal-dialog-mio",
    "modal-dialog-centered"
  );
  modal.innerHTML = `
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
      <div class="stock-container" style="
    display: flex;
    justify-content: space-between;
"><div class="items-precio">Stock disponible &nbsp;</div><span style="color:green;font-weight: 600;">(${stock})</span></div>
        <button
          type="button"
          class="btn btn-primary btn-mio"
          data-bs-dismiss="modal"
        >
          Cerrar
        </button>
      </div>
    </div>
  `;
  return modal;
}

// Generar el modal de detalles del producto según el ID
function generarModalPorId() {
  const btnModales = $d.querySelectorAll(".btn-detalles");
  btnModales.forEach((btnModal) => {
    btnModal.addEventListener("click", () => {
      const id = btnModal.id.replace("detallesModal", "");
      const producto = dbProductos.find((producto) => producto.id === id);
      modal.innerHTML = "";
      const modalProducto = crearModal(producto);
      modal.appendChild(modalProducto);
    });
  });
}

// Agregar un producto al carrito
function agregarAlCarrito(producto) {
  popCarritoElement.style.right = "1em";
  const buscarProducto = carrito.find(
    (productoCarrito) => productoCarrito.id === producto.id
  );

  if (buscarProducto) {
    if (buscarProducto.cantidad < producto.stock) {
      buscarProducto.cantidad++;
    } else {
      mostrarError("No hay más stock del producto seleccionado");
    }
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  miLocalStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarrito();
}

// Eliminar un producto del carrito
function eliminarDelCarrito(id) {
  const item = carrito[id];
  if (item.cantidad > 1) {
    item.cantidad--;
  } else {
    carrito.splice(id, 1);
  }

  if (carrito.length === 0) {
    miLocalStorage.removeItem("carrito");
  } else {
    miLocalStorage.carrito = JSON.stringify(carrito);
  }
  actualizarCarrito();
}

// Sumar la cantidad de productos en el carrito
function sumarCantidadCarrito(carrito) {
  return carrito.reduce((suma, producto) => suma + producto.cantidad, 0);
}

// Actualizar el carrito en el DOM
function actualizarCarrito() {
  carritoSelector2.innerHTML = "";
  subtotal.innerHTML = "";
  let contador = 0;
  if (carrito.length > 0) {
    let carritoHTML2 = "";
    carrito.forEach((producto) => {
      const { id, nombre, precio, cantidad, imagen, stock } = producto;
      contador += precio * cantidad;
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
    popCarritoElement.style.right = "-30em";
  }
  mostrarCantidadCarrito();
}

// Event listener para los botones de agregar y eliminar productos del carrito
$d.addEventListener("click", (e) => {
  const btnAgregar = $d.querySelectorAll(".btnAgregar");
  const btnEliminar = $d.querySelectorAll(".btnEliminar");

  // Agregar producto al carrito
  btnAgregar.forEach((btn) => {
    if (e.target == btn) {
      const id = e.target.id;
      const producto = dbProductos.find((producto) => producto.id === id);
      agregarAlCarrito(producto);
    }
  });
  // Eliminar producto del carrito
  btnEliminar.forEach((btnBorrar) => {
    if (e.target == btnBorrar) {
      const id = btnBorrar.id.replace("Eliminar", "");
      const buscarProducto = carrito.findIndex(
        (producto) => producto.id === id
      );
      eliminarDelCarrito(buscarProducto);
    }
  });
});

// Cerrar el popup del carrito
function cerrarCarritoPopUp() {
  popCarritoElement.style.right = "-30em";
}

// Vaciar el carrito
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
      miLocalStorage.removeItem("carrito");
      actualizarCarrito();
    }
  });
}

// Redirigir al carrito
function irAlCarrito() {
  window.location.href = "./cart.html";
}

// Renderizar las opciones del selector de tipo de producto
function renderizarSelect() {
  const opcionesUnicas = [...new Set(dbProductos.map((opcion) => opcion.tipo))];
  opcionesUnicas.forEach((opcion) => {
    const option = $d.createElement("option");
    option.text = opcion.charAt(0).toUpperCase() + opcion.slice(1);
    option.value = opcion;
    option.classList.add(opcion.clase);
    tipoSelector.add(option);
  });
}

// Verificar si los elementos en el carrito existen en la base de datos de productos
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
    let resultadoConcatenado = "";
    elementosNoEncontrados.forEach((elemento) => {
      resultadoConcatenado += "- " + elemento.nombre + "\n";
      console.log(`- ID: ${elemento.id}, Nombre: ${elemento.nombre}`);
      const buscarProducto = carrito.findIndex(
        (producto) => producto.id === elemento.id
      );
      eliminarDelCarrito(buscarProducto);
    });
    Toastify({
      text: `Hay falta de stock de alguno/s de los productos que tenias en el carrito y por lo tanto se han eliminado los siguientes:

      ${resultadoConcatenado}`,
      duration: 3000,
      position: "center",
      gravity: "bottom",
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      },
    }).showToast();
  }
}

function mostrarError(mensaje) {
  const Toast = Swal.mixin({
    toast: true,
    position: "center-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
  Toast.fire({
    icon: "error",
    title: mensaje,
  });
}
