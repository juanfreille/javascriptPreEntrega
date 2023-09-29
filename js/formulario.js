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
const formulario = $d.querySelector("#formularioAgregar");
const nombre = $d.querySelector("#nombre");
const precio = $d.querySelector("#precio");
const imagen = $d.querySelector("#imagen");
const tipo = $d.querySelector("#tipo");
const stocks = $d.querySelector("#stocks");
const btnAddProduct = $d.querySelector("#btnAddProduct");
const btnRemoveProduct = $d.querySelector("#btnRemoveProduct");
let selectTipo = $d.querySelector("#selectTipo");
let selectNombre = $d.querySelector("#selectNombre");

// Cargar los productos de la API al cargar la página
$d.addEventListener("DOMContentLoaded", llenarDBProductos);

// Función para sumar la cantidad de productos en el carrito
function sumarCantidadCarrito(carrito) {
  return carrito.reduce((suma, producto) => suma + producto.cantidad, 0);
}

// Obtener los datos de la API y cargar los productos en el select y filtrar
async function llenarDBProductos() {
  const response = await fetch(apiAddress);
  if (response.ok) {
    const data = await response.json();
    dbProductos = data;
    renderizarSelectTipo();
    filtrarOpciones();
  } else {
    mostrarError("Error al obtener los datos de la API");
  }
}

// Guardar un nuevo producto en la base de datos
async function guardarDBProductos(nuevoElemento) {
  const response = await fetch(apiAddress, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nuevoElemento),
  });
  if (response.ok) {
    const data = await response.json();
    console.log(data);
    // Mostrar una alerta indicando que se ha agregado un nuevo elemento a la base de datos
    mostrarAlerta(`'${data.nombre}' ha sido agregado!`, "success");
    llenarDBProductos();
  } else {
    mostrarError("Error al guardar el producto");
  }
}

// Agregar un evento de escucha al formulario para agregar un nuevo elemento
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();
  // Obtener la ruta de la imagen por defecto
  const imagenPorDefecto = obtenerRutaImagen(imagen.value);
  // Crear un nuevo objeto con los valores del formulario
  const nuevoElemento = {
    id: dbProductos.length + 1,
    nombre: nombre.value,
    precio: parseInt(precio.value),
    imagen: imagenPorDefecto,
    tipo: tipo.value,
    stock: stocks.value,
  };
  // Validar el formulario
  const errores = validarFormulario();
  if (errores.length > 0) {
    // Mostrar errores en una alerta
    mostrarErrores(errores);
  } else {
    const productoExistente = dbProductos.find(
      (producto) => producto.nombre === nuevoElemento.nombre
    );
    // Corroborar si es un elemento nuevo o es para actualizar
    if (productoExistente) {
      enviarDataForm(productoExistente, nuevoElemento);
    } else {
      // Guardar el nuevo elemento en la base de datos
      await guardarDBProductos(nuevoElemento);
    }
    limpiarFormulario();
    // Actualizar el selectTipo y selectNombre
    renderizarSelectTipo();
    filtrarOpciones();
  }
});

// Función para obtener la ruta de la imagen por defecto
function obtenerRutaImagen(ruta) {
  const rutaPorDefecto = "../assets/img/sinlogo.webp";
  if (ruta === "default") {
    return rutaPorDefecto;
  }
  return ruta;
}

// Función para validar los valores ingresados en el formulario
function validarFormulario() {
  let errores = [];
  if (nombre.value.trim() === "") {
    errores.push("El nombre del producto es obligatorio");
  }
  if (precio.value.trim() === "") {
    errores.push("El precio del producto es obligatorio");
  } else if (isNaN(parseInt(precio.value))) {
    errores.push("El precio del producto debe ser un número");
  }
  if (imagen.value.trim() === "") {
    errores.push("La imagen del producto es obligatoria");
  }
  if (tipo.value.trim() === "") {
    errores.push("El tipo de producto es obligatorio");
  }
  if (stocks.value.trim() === "") {
    errores.push("El stock es obligatorio");
  } else if (isNaN(parseInt(stocks.value))) {
    errores.push("Debe ser un número");
  }
  return errores;
}

// Función para renderizar las opciones del selectTipo
function renderizarSelectTipo() {
  selectTipo.innerHTML = "";
  // Obtener opciones únicas de tipos de productos
  const opcionesUnicas = [...new Set(dbProductos.map((opcion) => opcion.tipo))];
  // Crear opciones en el selectTipo
  opcionesUnicas.forEach((opcion) => {
    const option = $d.createElement("option");
    option.text = opcion.charAt(0).toUpperCase() + opcion.slice(1);
    option.value = opcion;
    option.classList.add(opcion.clase);
    selectTipo.add(option);
  });
}

// Función para filtrar las opciones del selectNombre
function filtrarOpciones() {
  // Obtener el valor seleccionado en el selectTipo
  const tipoSeleccionado = selectTipo.value;
  // Filtrar los productos por el tipo seleccionado
  const productosFiltrados = dbProductos.filter(
    (producto) => producto.tipo === tipoSeleccionado
  );
  // Limpiar las opciones actuales del selectNombre
  selectNombre.innerHTML = "";
  // Crear las nuevas opciones basadas en los productos filtrados
  productosFiltrados.forEach((producto) => {
    const opcion = $d.createElement("option");
    opcion.value = producto.id;
    opcion.textContent = producto.nombre;
    selectNombre.appendChild(opcion);
  });
}

// Agregar evento de cambio al selectTipo para filtrar las opciones del selectNombre
selectTipo.addEventListener("change", filtrarOpciones);

// Eliminar un producto
async function eliminarItem() {
  const nombreSeleccionado = selectNombre.value;
  const index = dbProductos.findIndex(
    (producto) => producto.id === nombreSeleccionado
  );
  const productoEncontrado = dbProductos[index];
  const productoStock = productoEncontrado.stock;
  if (productoStock > 1) {
    dbProductos[index].stock = productoStock - 1;
    await eliminarItemAsync(nombreSeleccionado, productoStock - 1);
  } else {
    await eliminarProductoAsync(nombreSeleccionado);
  }
}

async function eliminarProductoAsync(id) {
  const response = await fetch(`${apiAddress}/${id}`, {
    method: "DELETE",
  });
  if (response.ok) {
    const data = await response.json();
    mostrarAlerta(`'${data.nombre}' ha sido eliminado!`, "success");
    llenarDBProductos();
  } else {
    mostrarError("Error al eliminar el producto");
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
    mostrarAlerta(
      `Ha eliminado 1 ${data.nombre} del inventario, aún quedan ${data.stock} en stock`,
      "success"
    );
    llenarDBProductos();
  } else {
    mostrarError("Error al eliminar el producto");
  }
}

function enviarDataForm(productoExistente, nuevoElemento) {
  const editarElemento = {
    id: productoExistente.id,
    nombre: productoExistente.nombre,
    precio: nuevoElemento.precio,
    imagen: productoExistente.imagen,
    tipo: productoExistente.tipo,
    stock: parseInt(productoExistente.stock) + parseInt(nuevoElemento.stock),
  };
  console.log(productoExistente);
  console.log(nuevoElemento);
  editarProductoAsync(editarElemento.id, editarElemento);
}

async function editarProductoAsync(id, editarElemento) {
  const resp = await fetch(`${apiAddress}/${id}`, {
    method: "PUT",
    body: JSON.stringify(editarElemento),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await resp.json();
  mostrarAlerta(`El producto '${data.nombre}' ha sido editado!`, "success");
  llenarDBProductos();
}

// Agregar evento de clic al botón de eliminar producto
btnRemoveProduct.addEventListener("click", eliminarItem);

// Limpiar el formulario
function limpiarFormulario() {
  formulario.reset();
}

async function eliminarProducto(id) {
  // Filtrar el arreglo de productos para eliminar el producto seleccionado del array
  dbProductos = dbProductos.filter((producto) => producto.id !== id);
  console.log(dbProductos);
}

// Mostrar errores en una alerta
function mostrarErrores(errores) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    html: errores.join("<br>"),
  });
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
