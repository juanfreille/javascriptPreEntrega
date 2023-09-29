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

// Obtener los elementos del formulario
const carritoSelector2 = $d.querySelector("#columna");
const subtotalLine = $d.querySelector("#subtotal");
const cantiProd = $d.querySelector("#cantiProd");
const totalDesc = $d.querySelector("#totalDesc");
const lineaDescuento = $d.querySelector("#lineaDescuento");
const botonCompra = $d.querySelector("#botonCompra");
botonCompra.addEventListener("click", comprarBoton);

// let subtotal = 0;

// Llamada a funciones
llenarDBProductos();
mostrarCantidadCarrito();
calcularDescuento();

// Función para sumar la cantidad de productos en el carrito
function sumarCantidadCarrito(carrito) {
  return carrito.reduce((suma, producto) => suma + producto.cantidad, 0);
}

// Obtener los datos de la API y verificar si hay elementos en el carrito que no esten en la DB
async function llenarDBProductos() {
  const response = await fetch(apiAddress);
  if (!response.ok) {
    mostrarError("Error al obtener los datos de la API");
  }
  const data = await response.json();
  dbProductos = data;
  verificarElementosEnCarrito();
}

// Función para mostrar la cantidad de productos en el carrito
function mostrarCantidadCarrito() {
  const cantidadCarrito = sumarCantidadCarrito(carrito);
  numeroCarrito.textContent = cantidadCarrito;
  cantiProd.textContent = `(${cantidadCarrito} productos)`;
}

// Función para calcular si hay o no descuento y aplicarlo
function calcularDescuento() {
  const subtotal = carrito.reduce(
    (suma, producto) => suma + producto.precio * producto.cantidad,
    0
  );
  let descuento = 0;
  let totalConDesc = subtotal;

  if (subtotal >= 50000) {
    descuento = (subtotal * 0.05).toFixed(0);
    lineaDescuento.innerHTML = `
      <div class="col s7 px-0" >Descuento del 5%</div>
      <div class="col s5 px-0 right-align" id="descuento">-$${descuento.toLocaleString(
        undefined
      )}</div>
      <p style="margin: 0;font-weight: 700;font-size: 12px;padding: 0;"> (Compra mayor a $50.000)</p>
    `;
    totalConDesc = subtotal - descuento;
  } else {
    lineaDescuento.innerHTML = "";
  }
  totalDesc.textContent = "$" + totalConDesc.toLocaleString(undefined);
  subtotalLine.textContent = "$" + subtotal.toLocaleString(undefined);
}

// Función para renderizar el carrito en el HTML
function actualizarCarrito() {
  if (carrito.length === 0) {
    carritoSelector2.innerHTML = `<p class="my-5 texto-xl">No hay productos en tu carrito</p>`;
    botonCompra.disabled = true;
    botonCompra.style.cursor = "not-allowed";
  } else {
    botonCompra.disabled = false;
    botonCompra.style.cursor = "pointer";
    const carritoHTML = carrito.map((producto) => {
      const { id, nombre, precio, cantidad, imagen } = producto;
      return `
      <div class="carrito21Box">
        <div class="carrito21BoxCol1">
          <img src="${imagen}" alt="Producto 2" style="max-width: 100%; height: auto" />
        </div>
        <div class="carrito21BoxCol2">
          <p class="tituloNombreCart">
            <label class="tituloProductoCart">${nombre}</label>
          </p>
          <div class="fw-700">
            CANTIDAD:
            <div class="atributosCart"><strong>${cantidad}</strong></div>
          </div>
          <div class="fw-700">
            PRECIO:
            <div class="atributosCart"><strong>$ ${(
              precio * cantidad
            ).toLocaleString(undefined)}</strong></div>
          </div>
        </div>
        <button class="btnEliminar" style="align-self: start;font-size:20px;color:black;" id="${id}Eliminar">x</button>
      </div>
    `;
    });
    carritoSelector2.innerHTML = carritoHTML.join("");
  }
}

// Función para eliminar un producto del carrito
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
  mostrarCantidadCarrito();
  actualizarCarrito();
  calcularDescuento();
}

// Evento para eliminar un producto del carrito al hacer click en el botón de eliminar
$d.addEventListener("click", (e) => {
  if (e.target.classList.contains("btnEliminar")) {
    const id = e.target.id.replace("Eliminar", "");
    const buscarProducto = carrito.findIndex((producto) => producto.id === id);
    eliminarDelCarrito(buscarProducto);
  }
});

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

// Actualizar el carrito
actualizarCarrito();

// Función para redirigir a la página de pago
function comprarBoton() {
  window.location.href = "./pay.html";
}

// Mostrar un mensaje de error en una alerta
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

// Mostrar una alerta
function mostrarAlerta(mensaje, icono) {
  const Toast = Swal.mixin({
    toast: true,
    position: "center-end",
    customClass: {
      popup: "colored-toast",
    },
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
  Toast.fire({
    icon: icono,
    html: `<label style='color: black;'>${mensaje}</label>`,
  });
}
