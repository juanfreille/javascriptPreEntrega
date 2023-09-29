// Obtener el objeto localStorage
const miLocalStorage = window.localStorage;

// Arreglo para almacenar los productos y arreglo para almacenar clientes y sus datos para luego pasar a plataforma de pago
let dbProductos,
  dbClientes = [];

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
const carritoSelector2 = $d.querySelector("#columna3");
const subtotalLine = $d.querySelector("#subtotal");
const cantiProd = $d.querySelector("#cantiProd");
const totalDesc = $d.querySelector("#totalDesc");
const lineaDescuento = $d.querySelector("#lineaDescuento");
const formulario = $d.querySelector("#formularioPagar");
const btnPagar = $d.querySelector("#btnPagar");
const nombre = $d.querySelector("#nombre");
const apellido = $d.querySelector("#apellido");
const calle = $d.querySelector("#calle");
const numeracion = $d.querySelector("#numeracion");
const selectProvincia = $d.querySelector("#provincia");
const provincia = $d.querySelector("#provincia");
const codPostal = $d.querySelector("#codPostal");
const localidad = $d.querySelector("#localidad");
const email = $d.querySelector("#email");
const telefono = $d.querySelector("#telefono");
const dni = $d.querySelector("#dni");

let Globtotal = 0;
let Globsubtotal = 0;

llenarDBProductos();
mostrarCantidadCarrito();
calcularDescuento();

// Función para sumar la cantidad de productos en el carrito
function sumarCantidadCarrito(carrito) {
  return carrito.reduce((suma, producto) => suma + producto.cantidad, 0);
}

// Obtener los datos de la API
async function llenarDBProductos() {
  const response = await fetch(apiAddress);
  if (response.ok) {
    const data = await response.json();
    dbProductos = data;
  } else {
    mostrarErrorObtenerDatosAPI("Error al obtener los datos de la API");
  }
}

formulario.addEventListener("submit", (e) => {
  e.preventDefault();
  const nuevoElemento = obtenerValoresFormulario();

  const errores = validarFormulario();
  if (errores.length > 0) {
    mostrarErrores(errores);
  } else {
    dbClientes.push(nuevoElemento);
    limpiarFormulario();
    esperandoElPago()
      .then((res) => {
        popUpPagoOk(res, nuevoElemento);
        eliminarElementosCoincidentes();
      })
      .catch((err) => {
        popUpPagoNotOk(err);
      });
  }
});

function mostrarCantidadCarrito() {
  const cantidadCarrito = carrito.reduce(
    (suma, producto) => suma + producto.cantidad,
    0
  );
  numeroCarrito.innerHTML = cantidadCarrito;
  cantiProd.innerHTML = `(${cantidadCarrito} productos)`;
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
      <p style="margin: 0;font-weight: 700;font-size: 12px;padding: 0;" class="ocultar-mobile"> (Compra mayor a $50.000)</p>
    `;
    totalConDesc = subtotal - descuento;
  } else {
    lineaDescuento.innerHTML = ``;
  }
  totalDesc.textContent = "$" + totalConDesc.toLocaleString(undefined);
  subtotalLine.textContent = "$" + subtotal.toLocaleString(undefined);
  Globsubtotal = subtotal;
  Globtotal = totalConDesc;
}

function obtenerValoresFormulario() {
  return {
    id: dbClientes.length + 1,
    nombre: nombre.value,
    apellido: apellido.value,
    calle: calle.value,
    numeracion: parseInt(numeracion.value),
    selectProvincia: selectProvincia.value,
    codPostal: codPostal.value,
    localidad: localidad.value,
    email: email.value,
    telefono: parseInt(telefono.value),
    dni: parseInt(dni.value),
    productos: carrito,
  };
}

function validarFormulario() {
  let errores = [];
  if (nombre.value.trim() === "") {
    errores.push("El nombre es obligatorio");
  }
  if (apellido.value.trim() === "") {
    errores.push("El apellido es obligatorio");
  }
  if (calle.value.trim() === "") {
    errores.push("El nombre de la calle es obligatorio");
  }
  if (numeracion.value.trim() === "") {
    errores.push("El número de calle es obligatorio");
  } else if (isNaN(parseInt(numeracion.value))) {
    errores.push("El número de calle debe ser un número");
  }
  if (selectProvincia.value.trim() === "") {
    errores.push("Debe seleccionar una provincia");
  }
  if (codPostal.value.trim() === "") {
    errores.push("El Código postal es obligatorio");
  }
  if (localidad.value.trim() === "") {
    errores.push("Debe escribir una localidad");
  }
  if (email.value.trim() === "") {
    errores.push("El campo de email es obligatorio");
  }
  if (telefono.value.trim() === "") {
    errores.push("El teléfono es obligatorio");
  } else if (isNaN(parseInt(telefono.value))) {
    errores.push("El teléfono debe ser un número");
  }
  if (dni.value.trim() === "") {
    errores.push("El dni es obligatorio");
  } else if (isNaN(parseInt(dni.value))) {
    errores.push("El dni debe ser un número");
  }
  return errores;
}

function mostrarErrores(errores) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    html: errores.join("<br>"),
  });
}

function limpiarFormulario() {
  formulario.reset();
}

function popUpPagoOk(res, nuevoElemento) {
  Swal.fire({
    customClass: {
      confirmButton: "btn btn-success",
    },
    buttonsStyling: false,
    title: res,
    html: `Compra realizada a nombre de ${nuevoElemento.nombre} ${nuevoElemento.apellido} por un total de $${Globtotal}. 
    <br><br><br>
    <strong>¡Muchas gracias por confiar en nosotros!</strong>`,
    icon: "success",
    showCancelButton: false,
    confirmButtonText: "Ok",
  }).then((result) => {
    if (result.isConfirmed) {
      redirectIndex();
    }
  });
}

function popUpPagoNotOk(err) {
  Toastify({
    text: `${err}`,
    duration: 3000,
    position: "center",
    gravity: "bottom",
    style: {
      background: "linear-gradient(to right, #ff5858, #ff6d6d)",
    },
    close: true,
  }).showToast();
}

// Eliminar los elementos del carrito de la DB, quitandolos del stock, aca deberia actualizar tambien la db de la api dbProductos pero a los efectos de prueba
// no actualizare para no tener que cargar una y otra vez los productos al desplazar por las diferentes paginas.
function eliminarElementosCoincidentes() {
  for (const productoDB of dbProductos) {
    for (const productoCarrito of Object.values(carrito)) {
      if (productoDB.id === productoCarrito.id) {
        const cantidadCarrito = productoCarrito.cantidad;
        const elementoDB = productoDB;
        const index = dbProductos.findIndex(
          (producto) => producto.id === elementoDB.id
        );

        // Hacer algo con las variables cantidadCarrito y elementoDB
        console.log(cantidadCarrito);
        console.log(elementoDB);
        console.log(index);
        const productoStock = elementoDB.stock;
        if (productoStock > cantidadCarrito) {
          dbProductos[index].stock = productoStock - cantidadCarrito;
          eliminarItemAsync(elementoDB.id, productoStock - cantidadCarrito);
        } else {
          eliminarProductoAsync(elementoDB.id);
        }
      }
    }
  }
  miLocalStorage.removeItem("carrito");
}

async function eliminarProductoAsync(id) {
  const response = await fetch(`${apiAddress}/${id}`, {
    method: "DELETE",
  });
  if (response.ok) {
    const data = await response.json();
    llenarDBProductos();
  } else {
    mostrarError("Error al comunicarse con la api");
  }
}

async function eliminarItemAsync(id, stockNuevo) {
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock: stockNuevo }),
  };
  const response = await fetch(`${apiAddress}/${id}`, requestOptions);
  if (response.ok) {
    const data = await response.json();
    llenarDBProductos();
  } else {
    mostrarError("Error al comunicarse con la api");
  }
}

function mostrarErrorObtenerDatosAPI() {
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
    title: "Error al obtener los datos de la API",
  });
}

//aca iria a pasarela de pago para realizar la compra, pero en vez de eso se utiliza un numero random entre 0 y 1
//para validar el pago segun sea menor a 0.5 y devolver true o false
function esperandoElPago() {
  return new Promise((resolve, reject) => {
    const validarPago = Math.random() < 0.5;
    setTimeout(() => {
      if (validarPago) {
        resolve("El pago fue exitoso!");
      } else {
        reject("El pago no fue exitoso");
      }
    }, 3000);
  });
}

let carritoHTML2 = "";
carrito.forEach((producto) => {
  const { id, nombre, precio, cantidad, imagen } = producto;
  carritoHTML2 += `
      <div class="carrito21Box" style="zoom: 75%;">
        <div class="carrito21BoxCol1 nopict">
          <img src="${imagen}" alt="Producto 2" style="max-width: 100%; height: auto" />
        </div>
        <div class="carrito21BoxCol2" style="font-size: 16px;">
          <p class="tituloNombreCart max-content">
            <label class="tituloProductoCart">${nombre}</label>
          </p>
          <div class="fw-700 formuS">
            CANTIDAD:
            <div class="atributosCart" style="font-size: 16px;"><strong>${cantidad}</strong></div>
          </div>
          <div class="fw-700 formuS">
          PRECIO:
          <div class="atributosCart" style="font-size: 16px;"><strong>$ ${(
            precio * cantidad
          ).toLocaleString(undefined)}</strong></div>
          </div>
        </div>
        </div>
        `;
});

carritoSelector2.innerHTML = carritoHTML2;

// Función para redirigir a la página de pago
function redirectIndex() {
  window.location.href = "./index.html";
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
