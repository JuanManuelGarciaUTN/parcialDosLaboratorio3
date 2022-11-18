//variables globales
const urlPhp = 'http://localhost/vehiculoAereoTerrestre.php'; //URL para hacer las consultas
var datos = []; //array que contiene todos los datos del ABM

var formularioDatos; //elemento html formulario Datos
var formularioABM; //elemento html formulario ABM
var spinner; //elemento html spinner de carga

window.onload = OnLoadHandler; //al cargar la pagina llamar la funcion

//funcion llamada al cargarse la pagina
function OnLoadHandler(){

    //asigno a la variable los elementos del html
    VincularFormDatosEnVariables();
    VincularFormAbmEnVariables();

    //realiza peticion al servidor y carga los datos si la respuesta es OK
    CargarDatosDesdeServidor();
}

//realiza una peticion GET al servidor para obtener un json con los datos de los vehiculos
function CargarDatosDesdeServidor()
{
    let promesa = fetch(urlPhp, {
        method: 'GET',
        mode: 'cors', 
        cache: 'no-cache', 
        credentials: 'same-origin',
        redirect: 'follow', 
        referrerPolicy: 'no-referrer'
    });

    promesa.then((respuesta)=>{
        respuesta.text().then((texto)=>{
            
            if(respuesta.status > 199 && respuesta.status < 300)
            {
                CargarDatosDesdeJson(texto);
                GenerarTablaDatos();
                MostrarFormDatos();
            }
            else
            {
                MostrarError("Error en el servidor. No se puedo obtener lista inicial" + texto);
            }
        }); 
    });
    promesa.catch(()=>{
        CambiarEstadoSpinner();
        MostrarFormDatos();
        MostrarError("No hubo respuesta del Servidor");
    });
}

//carga los datos del string JSON y los almacena en el vector datos
//esta funcion aplica map()
function CargarDatosDesdeJson(json)
{
    mapeador = (objeto) => {
        if(objeto.hasOwnProperty("id") && objeto.hasOwnProperty("modelo") && objeto.hasOwnProperty("anoFab") && objeto.hasOwnProperty("velMax"))
        {
            if (objeto.hasOwnProperty("autonomia"))
            {
                let aereo = new Aereo(objeto.id, objeto.modelo, objeto.anoFab, objeto.velMax, objeto.autonomia, objeto.altMax);
                return aereo;
            }
            else if(objeto.hasOwnProperty("cantPue"))
            {
                let terrestre = new Terrestre(objeto.id, objeto.modelo, objeto.anoFab, objeto.velMax, objeto.cantPue, objeto.cantRue);
                return terrestre;
            }
        }
    };
    datos = JSON.parse(json);
    datos = datos.map(mapeador);
}

//Vincula una referencia a los elementos HTML del formulario ABM para poder acceder mas facilmente luego
function VincularFormAbmEnVariables()
{
    //asigno a la variable el formulario ABM
    formularioABM = document.getElementById("formularioABM");

    //añado los sub elementos del formulario ABM
    formularioABM.tipoDeVehiculo = document.getElementById("formularioABM-tipoDeVehiculo");
    formularioABM.idDato = document.getElementById("formularioABM-id");
    formularioABM.modelo = document.getElementById("formularioABM-modelo");
    formularioABM.anoFab = document.getElementById("formularioABM-anoFab");
    formularioABM.velMax = document.getElementById("formularioABM-velMax");
    formularioABM.autonomia = document.getElementById("formularioABM-autonomia");
    formularioABM.altMax = document.getElementById("formularioABM-altMax");
    formularioABM.cantPue = document.getElementById("formularioABM-cantPue");
    formularioABM.cantRue = document.getElementById("formularioABM-cantRue");

    //asigno el encabezado
    formularioABM.encabezado = document.getElementById("formularioABM-encabezado");

    //añado los botones del ABM
    formularioABM.botonAlta = document.getElementById("formularioABM-botonAlta");
    formularioABM.botonEliminar = document.getElementById("formularioABM-botonEliminar");
    formularioABM.botonModificar = document.getElementById("formularioABM-botonModificar");
}

//Vincula una referencia al formulario de Datos en vista y sus subcomponentes
function VincularFormDatosEnVariables()
{
    //asigno a la variable los elementos del html
    formularioDatos = document.getElementById("formularioDatos");

    //tabla
    formularioDatos.tabla = document.getElementById("formularioDatos-tabla");
}

//genera la tabla de la vista segundos los datos almacenados en el vector datos
function GenerarTablaDatos()
{
    for (elemento of datos)
    {
        AgregarElementoATabla(elemento);
    }
}

//recibe un elemento de tipo Vehiculo o descendientes de Vehiculo para agregarlos a la vista del formulario Datos
function AgregarElementoATabla(elemento)
{
    let celdaTabla;

    //genera la fila de la tabla
    let tableRow = document.createElement("tr");
    tableRow.setAttribute("id", elemento.id);
    tableRow.classList.add(elemento.constructor.name);

    //añade cada columna a la fila segun los datos del elemento
    celdaTabla = document.createElement("td");
    celdaTabla.textContent = elemento.id;
    tableRow.appendChild(celdaTabla);

    celdaTabla = document.createElement("td");
    celdaTabla.textContent = elemento.modelo;
    tableRow.appendChild(celdaTabla);

    celdaTabla = document.createElement("td");
    celdaTabla.textContent = elemento.anoFab;
    tableRow.appendChild(celdaTabla);

    celdaTabla = document.createElement("td");
    celdaTabla.textContent = elemento.velMax;
    tableRow.appendChild(celdaTabla);

    celdaTabla = document.createElement("td");
    celdaTabla.textContent = elemento.autonomia || "N/A";
    tableRow.appendChild(celdaTabla);

    celdaTabla = document.createElement("td");
    celdaTabla.textContent = elemento.altMax || "N/A";
    tableRow.appendChild(celdaTabla);

    celdaTabla = document.createElement("td");
    celdaTabla.textContent = elemento.cantPue || "N/A";
    tableRow.appendChild(celdaTabla);

    celdaTabla = document.createElement("td");
    celdaTabla.textContent = elemento.cantRue || "N/A";
    tableRow.appendChild(celdaTabla);

    celdaTabla = document.createElement("td");
    boton = document.createElement("button");
    boton.textContent = "Modificar";
    boton.onclick = () => {MostrarAbmComoModificar(elemento)};
    celdaTabla.appendChild(boton);
    tableRow.appendChild(celdaTabla);

    celdaTabla = document.createElement("td");
    boton = document.createElement("button");
    boton.textContent = "Eliminar";
    boton.onclick = () => {MostrarAbmComoEliminar(elemento)};
    celdaTabla.appendChild(boton);
    tableRow.appendChild(celdaTabla);

    //añade el elemento a la tabla de la vista
    formularioDatos.tabla.appendChild(tableRow);
}

//inicializa el formulario ABM en el estado Agregar y oculta el formulario de Datos
function IniciarAbmAgregar()
{
    formularioDatos.hidden = true;
    formularioABM.hidden = false;

    formularioABM.botonAlta.hidden = false;
    formularioABM.botonEliminar.hidden = true;
    formularioABM.botonModificar.hidden = true;

    //habilita poder ingresar datos
    formularioABM.tipoDeVehiculo.disabled = false;
    formularioABM.modelo.disabled  = false;
    formularioABM.anoFab.disabled  = false;
    formularioABM.velMax.disabled  = false;
    formularioABM.autonomia.disabled  = false;
    formularioABM.altMax.disabled  = false;
    formularioABM.cantRue.disabled  = false;
    formularioABM.cantPue.disabled  = false;
    
    formularioABM.encabezado.textContent = "Alta";

    LimpiarInputsAbm();
    MostrarOpcionesAbmCorrectas();
}

//limpia todos los inputs del ABM excepto el ID
function LimpiarInputsAbm()
{
    formularioABM.idDato.value = "";
    formularioABM.modelo.value = "";
    formularioABM.anoFab.value = "";
    formularioABM.velMax.value = "";
    formularioABM.autonomia.value = "";
    formularioABM.altMax.value = "";
    formularioABM.cantPue.value = "";
    formularioABM.cantRue.value = "";
}

//filtra las casillas del formulario ABM para que solo se muestren las correspondientes al tipo de dato actualmente seleccionado
function MostrarOpcionesAbmCorrectas()
{
    let tipoSelecionado = formularioABM.tipoDeVehiculo.options[formularioABM.tipoDeVehiculo.selectedIndex].value;

    if(tipoSelecionado == "Aereo")
    {
        formularioABM.autonomia.parentNode.hidden = false;
        formularioABM.altMax.parentNode.hidden = false;

        formularioABM.cantPue.parentNode.hidden = true;
        formularioABM.cantRue.parentNode.hidden = true;
    }
    else
    {
        formularioABM.autonomia.parentNode.hidden = true;
        formularioABM.altMax.parentNode.hidden = true;

        formularioABM.cantPue.parentNode.hidden = false;
        formularioABM.cantRue.parentNode.hidden = false;
    }
}

//verifica si los datos actuales son validos y si lo son añade una vehiculo al formulario
function AgregarVehiculoEnVista(datosObtenidos)
{
    let vehiculo = null;
    
    if(datosObtenidos !== null)
    {
        if(datosObtenidos.tipoSelecionado == "Aereo")
        {
            vehiculo = new Aereo(
                datosObtenidos.id, 
                datosObtenidos.modelo, 
                datosObtenidos.anoFab, 
                datosObtenidos.velMax,  
                datosObtenidos.autonomia, 
                datosObtenidos.altMax);
        }
        else
        {
            vehiculo = new Terrestre(
                datosObtenidos.id, 
                datosObtenidos.modelo, 
                datosObtenidos.anoFab, 
                datosObtenidos.velMax, 
                datosObtenidos.cantPue, 
                datosObtenidos.cantRue);
        }
        AgregarElementoATabla(vehiculo);
        datos.push(vehiculo);
    }
    else
    {
        MostrarError("Ingreso Datos Invalidos! \nNo se puede dar de alta.");
    }
}

//obtiene los datos del ABM, verifica si son validos y de serlo devuelve dichos datos en un objeto, si no devuelve null
function VerificarDatosAbm()
{
    let datosObtenidos = {};
    
    //obtiene todos los datos del ABM
    datosObtenidos.id = formularioABM.idDato.value.trim();
    datosObtenidos.modelo = formularioABM.modelo.value.trim();
    datosObtenidos.anoFab = formularioABM.anoFab.value.trim();
    datosObtenidos.velMax = parseInt(formularioABM.velMax.value.trim());
    datosObtenidos.autonomia = formularioABM.autonomia.value.trim();
    datosObtenidos.altMax = parseInt(formularioABM.altMax.value.trim());
    datosObtenidos.cantPue = parseInt(formularioABM.cantPue.value.trim());
    datosObtenidos.cantRue = parseInt(formularioABM.cantRue.value.trim());

    datosObtenidos.tipoSelecionado = formularioABM.tipoDeVehiculo.options[formularioABM.tipoDeVehiculo.selectedIndex].value;

    //verifica los datos
    if(datosObtenidos.velMax > 0 && datosObtenidos.modelo !== "" && datosObtenidos.anoFab > 1885)
    {
        if(datosObtenidos.tipoSelecionado == "Aereo")
        {
            if(datosObtenidos.altMax > 0 && datosObtenidos.autonomia > 0)
            {
                return datosObtenidos;
            }
        }
        else
        {
            if(datosObtenidos.cantPue > 0 && datosObtenidos.cantRue > 0)
            {
                return datosObtenidos;
            }
        }
    }
    return null;
}

//obtiene el ID del formulario ABM y lo devuelve
function ObtenerIdAbm()
{
    return formularioABM.idDato.value.trim();
}

//Muestra el formulario de Datos y oculta el ABM
function MostrarFormDatos()
{
    formularioDatos.hidden = false;
    formularioABM.hidden = true;
}

//Cambia el estado actual del spinner.
//Mostrandolo si estaba oculto
//Ocultandolo si estaba en vista
function CambiarEstadoSpinner()
{
    if(spinner)
    {
        EliminarSpinner();
    }
    else
    {
        MostrarSpinner();
    }
}

function EliminarSpinner()
{
    document.body.removeChild(spinner);
    spinner = null;
}

function MostrarSpinner()
{
    let pantallaCompleta = document.createElement("div");
    pantallaCompleta.setAttribute("class", "pantalla-semi-transparente");

    let contenedor = document.createElement("div");
    contenedor.setAttribute("id", "spinner");
    contenedor.setAttribute("class", "formulario");

    let texto = document.createElement("h3");
    texto.textContent = "Procesando Petición";

    let animacion = document.createElement("div");
    animacion.setAttribute("class", "spin");

    document.body.appendChild(pantallaCompleta);
    pantallaCompleta.appendChild(contenedor);
    contenedor.appendChild(texto);
    contenedor.appendChild(animacion);

    spinner = pantallaCompleta;
}

function MostrarError(mensaje)
{
    let pantallaCompleta = document.createElement("div");
    pantallaCompleta.setAttribute("class", "pantalla-semi-transparente");

    let contenedor = document.createElement("div");
    contenedor.setAttribute("class", "error");

    let texto = document.createElement("h3");
    texto.textContent = mensaje;

    let boton = document.createElement("button");
    boton.onclick = ()=>OcultarError(pantallaCompleta);
    boton.textContent = "OK";

    document.body.appendChild(pantallaCompleta);
    pantallaCompleta.appendChild(contenedor);
    contenedor.appendChild(texto);
    contenedor.appendChild(boton);
}

function OcultarError(error)
{
    document.body.removeChild(error);
}

//Inicializa el ABM en el estado Eliminar con los datos recibidor por parametro
function MostrarAbmComoEliminar(elemento)
{
    CargarAbmConDatos(elemento);
    formularioDatos.hidden = true;
    formularioABM.hidden = false;

    formularioABM.botonAlta.hidden = true;
    formularioABM.botonEliminar.hidden = false;
    formularioABM.botonModificar.hidden = true;

    //deshabilita poder modificar datos
    formularioABM.tipoDeVehiculo.disabled  = true;
    formularioABM.modelo.disabled  = true;
    formularioABM.anoFab.disabled  = true;
    formularioABM.velMax.disabled  = true;
    formularioABM.autonomia.disabled  = true;
    formularioABM.altMax.disabled  = true;
    formularioABM.cantRue.disabled  = true;
    formularioABM.cantPue.disabled  = true;

    formularioABM.encabezado.textContent = "Baja";

    MostrarOpcionesAbmCorrectas();
}

//Inicializa el ABM en el estado Modificar con los datos recibidor por parametro
function MostrarAbmComoModificar(elemento)
{
    CargarAbmConDatos(elemento);
    formularioDatos.hidden = true;
    formularioABM.hidden = false;

    formularioABM.botonAlta.hidden = true;
    formularioABM.botonEliminar.hidden = true;
    formularioABM.botonModificar.hidden = false;

    formularioABM.tipoDeVehiculo.disabled  = true;

    //habilita poder modificar datos excepto el tipo de vehiculo
    formularioABM.modelo.disabled  = false;
    formularioABM.anoFab.disabled  = false;
    formularioABM.velMax.disabled  = false;
    formularioABM.autonomia.disabled  = false;
    formularioABM.altMax.disabled  = false;
    formularioABM.cantRue.disabled  = false;
    formularioABM.cantPue.disabled  = false;

    formularioABM.encabezado.textContent = "Modificacion";

    MostrarOpcionesAbmCorrectas();
}

//lee los datos recibidos, asigna al ABM dichos datos
function CargarAbmConDatos(elemento)
{
    //asigna el tipo selecto en el ABM segun el tipo del elemento recibido
    for (let i=0; i<formularioABM.tipoDeVehiculo.options.length; i++) 
    {
        let opcion = formularioABM.tipoDeVehiculo.options[i];
      
        if (opcion.value === elemento.constructor.name) {
            opcion.setAttribute('selected', true);
            opcion.selected = true;
        }
        else{
            opcion.setAttribute('selected', false);
            opcion.selected = false;
        }
    }   

    //asigna cada dato a su correspondiente input
    formularioABM.idDato.value = elemento.id;
    formularioABM.modelo.value = elemento.modelo;
    formularioABM.anoFab.value = elemento.anoFab;
    formularioABM.velMax.value = elemento.velMax;
    formularioABM.autonomia.value = elemento.autonomia || "";
    formularioABM.altMax.value = elemento.altMax || "";
    formularioABM.cantPue.value = elemento.cantPue || "";
    formularioABM.cantRue.value = elemento.cantRue || "";
}

//toma los datos del ABM para realizar una peticion al servidor para dar de alta una Vehiculo
//si los datos son validos realiza la peticion
//si la peticion es correcta, se agrega en vista la nueva vehiculo
function AltaVehiculo()
{
    let datosObtenidos = VerificarDatosAbm();
    if(datosObtenidos !== null)
    {
        AgregarVehiculoPeticionHttp(datosObtenidos);
    }
    else
    {
        MostrarError("Ingreso Datos Invalidos! \nNo se puede dar de alta.");
    }
}

//verifica si los datos ingresados son correctos, de serlos modifica el vehiculo segun su id y vuelve al formulario Datos
function ModificarVehiculo()
{
    let datosObtenidos = VerificarDatosAbm();
    if(datosObtenidos !== null)
    {
        ModificarVehiculoPeticionHttp(datosObtenidos);
    }
    else
    {
        MostrarError("Ingreso Datos Invalidos! \nNo se puede modificar.");
    }
}

async function EliminarVehiculo()
{
    let id = ObtenerIdAbm();
    if(id != null)
    {
        EliminarVehiculoPeticionHttp(id);
    }
}

//realiza una peticion al servidor para eliminar una vehiculo.
//segun la respuesta recibida elimina el vehiculo en memoria y en la vista.
async function EliminarVehiculoPeticionHttp(idRecibida)
{
    CambiarEstadoSpinner();
    datosJson = JSON.stringify({id:idRecibida});

    let respuesta = await fetch(urlPhp, {
        method: 'DELETE',
        mode: 'cors', 
        cache: 'no-cache', 
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer', 
        body: datosJson
    });

    let texto = await respuesta.text();
    
    if(respuesta.status > 199 && respuesta.status < 300)
    {
        EliminarVehiculoEnVista(idRecibida);
        CambiarEstadoSpinner();
        MostrarFormDatos();
    }
    else
    {
        CambiarEstadoSpinner();
        MostrarFormDatos();
        MostrarError(texto);
    }
}

//realiza una peticion al servidor para modificar los datos de una vehiculo.
//segun la respuesta recibida modifica el vehiculo en memoria y en la vista.
async function ModificarVehiculoPeticionHttp(datosRecibidos)
{
    CambiarEstadoSpinner();
    
    datosJson = JSON.stringify(datosRecibidos);

    let respuesta = await fetch(urlPhp, {
        method: 'POST',
        mode: 'cors', 
        cache: 'no-cache', 
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer', 
        body: datosJson
    });

    let texto = await respuesta.text();
    
    if(respuesta.status > 199 && respuesta.status < 300)
    {
        EliminarVehiculoEnVista(datosRecibidos.id);
        AgregarVehiculoEnVista(datosRecibidos);
        CambiarEstadoSpinner();
        MostrarFormDatos();
    }
    else
    {
        CambiarEstadoSpinner();
        MostrarFormDatos();
        MostrarError(texto);
    }
}

//realiza una peticion al servidor para agregar una vehiculo.
//segun la respuesta recibida agrega el vehiculo en memoria y en la vista.
function AgregarVehiculoPeticionHttp(datosRecibidos)
{
    CambiarEstadoSpinner();
    datosJson = JSON.stringify(datosRecibidos);
    console.log(datosJson);

    xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = () => {
        if(xhttp.readyState == 4)
        {
            let texto = xhttp.responseText;
            if(xhttp.status > 199 && xhttp.status < 300)
            {
                texto = JSON.parse(texto);
                datosRecibidos.id = texto.id;
                AgregarVehiculoEnVista(datosRecibidos);
                CambiarEstadoSpinner();
                MostrarFormDatos();
            }
            else
            {  
                CambiarEstadoSpinner();
                MostrarFormDatos();
                MostrarError(texto);
            }
        }
    };
    xhttp.open("PUT", urlPhp);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(datosJson);
}

//elimina el vehiculo actulamente en el ABM segun su ID y vuelve al formulario de Datos
function EliminarVehiculoEnVista(id)
{
    for(i in datos)
    {
        if(datos[i].id == id)
        {
            datos.splice(i, 1);
        }
    }
    let filaTabla = document.getElementById(id);
    filaTabla.parentNode.removeChild(filaTabla);
}



//declaracion de las clases
class Vehiculo{
    //atributos
    id;
    modelo;
    anoFab;
    velMax;

    constructor(id, modelo, anoFab, velMax)
    {
        if (velMax !== null && !isNaN(velMax) && velMax > 0)
        {
            this.velMax = velMax;
        }
        if (id !== null && !isNaN(id))
        {
            this.id = id;
        }
        if (anoFab !== null && !isNaN(anoFab) && anoFab > 1885)
        {
            this.anoFab = anoFab;
        }

        this.modelo = modelo || "N";
    }
}

class Aereo extends Vehiculo{
    //atributos
    autonomia;
    altMax;

    constructor(id, modelo, anoFab, velMax, autonomia, altMax)
    {
        super(id, modelo, anoFab, velMax);

        if (altMax !== null && altMax > 0)
        {
            this.altMax = altMax;
        }
        else{
            this.altMax = 1;
        }

        if (autonomia !== null && autonomia > 0)
        {
            this.autonomia = autonomia;
        }
        else{
            this.autonomia = 1;
        }
    }
}

class Terrestre extends Vehiculo{
    //atributos
    cantPue;
    cantRue;

    constructor(id, modelo, anoFab, velMax, cantPue, cantRue)
    {
        super(id, modelo, anoFab, velMax);

        if(cantPue !== null && cantPue > 0)
        {
            this.cantPue = cantPue;
        } 
        else{
            this.cantPue = 1;
        }

        if(cantRue !== null && cantRue > 0)
        {
            this.cantRue = cantRue;
        } 
        else{
            this.cantRue = 1;
        }
    }
}