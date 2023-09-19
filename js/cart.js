// Obtener el objeto localStorage
const miLocalStorage = window.localStorage;
const carritoSelector2 = document.querySelector("#columna");
let cantidadCarrito = 0;
let carrito = JSON.parse(miLocalStorage.getItem("carrito")) || [];
let dbProductos = JSON.parse(miLocalStorage.getItem("dbProductos")) || [];
let btnComprar = "";

// Función para sumar la cantidad de productos en el carrito
function sumarCantidadCarrito(carrito) {
  return carrito.reduce((suma, producto) => suma + producto.cantidad, 0);
}

const subtotal = document.querySelector("#subtotal");
const columna2 = document.querySelector("#columna2");
const numeroCarrito = document.querySelector("#numeroCarrito");

// Verificar elementos en el carrito al cargar la página
window.onpageshow = function () {
  verificarElementosEnCarrito();
};

// Función para renderizar el carrito
function renderizarCarrito() {
  carritoSelector2.innerHTML = "";
  cantidadCarrito = sumarCantidadCarrito(carrito);
  let contador = carrito.reduce(
    (suma, producto) => suma + producto.precio * producto.cantidad,
    0
  );
  let descuento =
    contador >= 50000 ? parseInt((contador * 0.05).toFixed(0)) : 0;
  let total = contador - descuento;
  numeroCarrito.innerHTML = cantidadCarrito;

  if (carrito.length > 0) {
    let carritoHTML2 = "";
    carrito.forEach((producto) => {
      const { id, nombre, precio, cantidad, imagen } = producto;
      carritoHTML2 += `
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

    carritoSelector2.innerHTML = carritoHTML2;

    let conOSinDescuento = "";

    if (contador >= 50000) {
      conOSinDescuento = `
     <div class="row mb-1" style="max-width: 350px; margin: 0 auto; width: 100%;color:green;" id="lineaDescuento">
       <div class="col s7 px-0" >Descuento del 5%</div>
       <div class="col s5 px-0 right-align" id="descuento">-$${descuento.toLocaleString(
         undefined
       )}</div>
       <p style="margin: 0;font-weight: 700;font-size: 12px;padding: 0;"> (Compra mayor a $50.000)</p>
     </div>
<div class="row" style="margin: 2em 0 !important; font-weight: bold;max-width: 350px; width: 100%;">
       <div class="col s7 px-0">TOTAL</div>
       <div id="totalDesc" class="col s5 px-0 right-align">$${total.toLocaleString(
         undefined
       )}</div>
     </div>
     <button id="botonCompra" class="botonCompra" onclick="comprarBoton()">Iniciar Compra</button>
   </div>
   </div>
        `;
    } else {
      total = contador;
      conOSinDescuento = `   
     <div class="row" style="margin: 2em 0 !important; font-weight: bold;max-width: 350px; width: 100%;">
       <div class="col s7 px-0">TOTAL</div>
       <div id="totalDesc" class="col s5 px-0 right-align">$${total.toLocaleString(
         undefined
       )}</div>
     </div>
     <button id="botonCompra" class="botonCompra" onclick="comprarBoton()">Iniciar Compra</button>
   </div>
   </div>
        `;
    }

    columna2.innerHTML = "";
    columna2.innerHTML = `
    <div class="checkCol2-21">
   <div class="popCarritoCheck">
     <div class="h6 fw-700">RESUMEN DE COMPRA</div>
             <div>(${cantidadCarrito} productos)</div>
   </div>
   <div class="popCarritoCheck" id="totales-cart">
     <div class="row mb-1" style="max-width: 350px; margin: 0 auto; width: 100%">
       <div class="col s7 px-0">Subtotal</div>
       <div class="col s5 px-0 right-align" id="subtotal">$${contador.toLocaleString(
         undefined
       )}</div>
     </div>
     ${conOSinDescuento}
     `;
  } else {
    carritoSelector2.innerHTML = `
    <p class="my-5 texto-xl">No hay productos en tu carrito</p>
          `;

    columna2.innerHTML = `
          <div class="checkCol2-21">
         <div class="popCarritoCheck">
           <div class="h6 fw-700">RESUMEN DE COMPRA</div>
                   <div>(${cantidadCarrito} productos)</div>
         </div>
         <div class="popCarritoCheck" id="totales-cart">
           <div class="row mb-1" style="max-width: 350px; margin: 0 auto; width: 100%">
             <div class="col s7 px-0">Subtotal</div>
             <div class="col s5 px-0 right-align" id="subtotal">$${contador.toLocaleString(
               undefined
             )}</div>
           </div>
           <div class="row" style="margin: 2em 0 !important; font-weight: bold;max-width: 350px; width: 100%;">
           <div class="col s7 px-0">TOTAL</div>
           <div id="totalDesc" class="col s5 px-0 right-align">$0</div>
         </div>
         <button id="botonCompra" onclick="comprarBoton()" class="botonCompra">Iniciar Compra</button>
       </div>
       </div>
           `;
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
    localStorage.removeItem("carrito");
  } else {
    localStorage.carrito = JSON.stringify(carrito);
  }

  renderizarCarrito();
}

// Renderizar el carrito al cargar la página
renderizarCarrito();

// Evento click para eliminar un producto del carrito
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btnEliminar")) {
    const id = e.target.id.replace("Eliminar", "");
    const productoBusqueda = carrito.findIndex(
      (producto) => producto.id === parseInt(id)
    );
    eliminarDelCarrito(productoBusqueda);
  }
});

// Verificar elementos en el carrito
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
    console.log(carrito);
    console.log(dbProductos);
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

// Función para el botón de comprar
function comprarBoton() {
  Swal.fire("Proximamente...");
}
