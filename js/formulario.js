// Obtener el objeto localStorage
const miLocalStorage = window.localStorage;
// const dbProductos = JSON.parse(localStorage.getItem('nombreDelArray')) || [];
// Obtener el arreglo de productos del localStorage
let dbProductos = JSON.parse(miLocalStorage.getItem("dbProductos"));

// Si no hay productos en el localStorage, crear un arreglo inicial y guardarlo en el localStorage
if (!dbProductos) {
  const dbProductosInicial = [
    {
      id: 1,
      nombre: "Pantalon Babucha",
      precio: 16500,
      imagen: "../assets/img/babucha.webp",
      tipo: "pantalones",
    },
    {
      id: 2,
      nombre: "Pantalon Jeans",
      precio: 15500,
      imagen: "../assets/img/jeans.webp",
      tipo: "pantalones",
    },
    {
      id: 3,
      nombre: "Pantalon Joggers",
      precio: 15500,
      imagen: "../assets/img/joggers.webp",
      tipo: "pantalones",
    },
    {
      id: 4,
      nombre: "Pantalon Baggy",
      precio: 15500,
      imagen: "../assets/img/baggy.webp",
      tipo: "pantalones",
    },
    {
      id: 5,
      nombre: "Buzo blue",
      precio: 16500,
      imagen: "../assets/img/buzo.webp",
      tipo: "buzos",
    },
    {
      id: 6,
      nombre: "Buzo escoces",
      precio: 16500,
      imagen: "../assets/img/camisa.webp",
      tipo: "buzos",
    },
    {
      id: 7,
      nombre: "Sweater grey",
      precio: 12500,
      imagen: "../assets/img/sweater.webp",
      tipo: "buzos",
    },
    {
      id: 8,
      nombre: "Canguro b&w",
      precio: 16500,
      imagen: "../assets/img/canguro.webp",
      tipo: "buzos",
    },
  ];

  // Guardar el arreglo inicial en el localStorage
  miLocalStorage.setItem("dbProductos", JSON.stringify(dbProductosInicial));

  // Asignar el arreglo inicial a la variable dbProductos
  dbProductos = dbProductosInicial;
}
const numeroCarrito = document.querySelector("#numeroCarrito");
let carrito = JSON.parse(miLocalStorage.getItem("carrito")) || [];
const cantidadCarrito = sumarCantidadCarrito(carrito);
numeroCarrito.innerHTML = cantidadCarrito;

// document.addEventListener("DOMContentLoaded", function () {
// });

// Obtener los elementos del formulario
const formulario = document.querySelector("#formularioAgregar");
const nombre = document.querySelector("#nombre");
const precio = document.querySelector("#precio");
const imagen = document.querySelector("#imagen");
const tipo = document.querySelector("#tipo");
const btnAddProduct = document.querySelector("#btnAddProduct");
const btnRemoveProduct = document.querySelector("#btnRemoveProduct");

let selectTipo = document.querySelector("#selectTipo");
let selectNombre = document.querySelector("#selectNombre");

// Función para sumar la cantidad de productos en el carrito
function sumarCantidadCarrito(carrito) {
  return carrito.reduce((suma, producto) => suma + producto.cantidad, 0);
}

// Agregar un evento de escucha al formulario para agregar un nuevo elemento
formulario.addEventListener("submit", (e) => {
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
  };

  // Validar el formulario
  const errores = validarFormulario();
  if (errores.length > 0) {
    // Mostrar errores en una alerta
    Swal.fire({
      icon: "error",
      title: "Oops...",
      html: errores.join("<br>"),
    });
  } else {
    // Agregar el nuevo elemento al arreglo de productos
    dbProductos.push(nuevoElemento);

    // Mostrar una alerta indicando que se ha agregado un nuevo elemento a la base de datos
    const Toast = Swal.mixin({
      toast: true,
      position: "center-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
    Toast.fire({
      icon: "success",
      title: "Producto agregado!",
    });

    // Mostrar el arreglo de productos actualizado en la consola
    console.log(dbProductos);

    // Guardar el arreglo de productos actualizado en el localStorage
    miLocalStorage.setItem("dbProductos", JSON.stringify(dbProductos));

    // Limpiar los valores del formulario
    nombre.value = "";
    precio.value = "";
    imagen.value = "";
    tipo.value = "";

    // Actualizar el selectTipo y selectNombre
    rederizarSelectTipo();
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

// Función que se ejecuta cuando se carga o recarga la página
window.onpageshow = function () {
  rederizarSelectTipo();
  filtrarOpciones();
};

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
  return errores;
}

// Función para renderizar las opciones del selectTipo
function rederizarSelectTipo() {
  selectTipo.innerHTML = "";

  // Obtener opciones únicas de tipos de productos
  const opcionesUnicas = [...new Set(dbProductos.map((opcion) => opcion.tipo))];
  console.log(opcionesUnicas);

  // Crear opciones en el selectTipo
  opcionesUnicas.forEach((opcion) => {
    const option = document.createElement("option");
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
    const opcion = document.createElement("option");
    opcion.value = producto.id;
    opcion.textContent = producto.nombre;
    selectNombre.appendChild(opcion);
  });
}

// Agregar evento de cambio al selectTipo para filtrar las opciones del selectNombre
selectTipo.addEventListener("change", filtrarOpciones);

// Función para eliminar un producto
function eliminarItem() {
  // Obtener el valor seleccionado en el selectNombre (id)
  const nombreSeleccionado = parseInt(selectNombre.value);

  // Filtrar el arreglo de productos para eliminar el producto seleccionado
  dbProductos = dbProductos.filter(
    (producto) => producto.id !== nombreSeleccionado
  );

  // Mostrar una alerta indicando que se ha eliminado un producto
  const Toast = Swal.mixin({
    toast: true,
    position: "center-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
  Toast.fire({
    icon: "success",
    title: "Producto eliminado!",
  });

  // Actualizar el localStorage con el arreglo de productos actualizado
  miLocalStorage.setItem("dbProductos", JSON.stringify(dbProductos));

  // Actualizar el selectTipo y selectNombre
  rederizarSelectTipo();
  filtrarOpciones();

  console.log(
    `Se eliminó el producto con ID ${nombreSeleccionado} de dbProductos.`
  );
}

// Agregar evento de clic al botón de eliminar producto
btnRemoveProduct.addEventListener("click", eliminarItem);
