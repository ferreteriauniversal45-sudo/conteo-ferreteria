let catalogo = {};
let conteo = JSON.parse(localStorage.getItem("conteo")) || {};
let registro = JSON.parse(localStorage.getItem("registro")) || [];

let productoActual = null;

fetch("catalogo.json")
    .then(res => res.json())
    .then(data => {
        catalogo = data;
        renderCatalogo();
        renderConteo();
    });

document.getElementById("busqueda").addEventListener("input", renderCatalogo);

function renderCatalogo() {
    const q = document.getElementById("busqueda").value.toLowerCase();
    const contenedor = document.getElementById("catalogo");
    contenedor.innerHTML = "";

    Object.entries(catalogo)
        .filter(([c, p]) =>
            c.toLowerCase().includes(q) ||
            p.producto.toLowerCase().includes(q) ||
            p.departamento.toLowerCase().includes(q)
        )
        .slice(0, 50)
        .forEach(([codigo, p]) => {
            const div = document.createElement("div");
            div.className = "item";
            div.innerHTML = `
                <div>
                    <div class="codigo">${codigo} - ${p.producto}</div>
                    <div class="departamento">${p.departamento}</div>
                </div>
                <button onclick="abrirModal('${codigo}')">Contar</button>
            `;
            contenedor.appendChild(div);
        });
}

function renderConteo() {
    const contenedor = document.getElementById("conteo");
    contenedor.innerHTML = "";

    Object.entries(conteo).forEach(([codigo, item]) => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <div>
                <div class="codigo">${codigo} - ${item.producto}</div>
                <div class="departamento">${item.departamento}</div>
            </div>
            <strong>${item.cantidad}</strong>
        `;
        contenedor.appendChild(div);
    });
}

function abrirModal(codigo) {
    productoActual = codigo;
    const p = catalogo[codigo];
    document.getElementById("modalProducto").innerText =
        `${codigo} - ${p.producto}`;
    document.getElementById("cantidadInput").value = "";
    document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modal").style.display = "none";
}

function confirmarCantidad() {
    const cantidad = parseInt(document.getElementById("cantidadInput").value);
    if (!cantidad || cantidad <= 0) return;

    const p = catalogo[productoActual];

    if (!conteo[productoActual]) {
        conteo[productoActual] = {
            producto: p.producto,
            departamento: p.departamento,
            cantidad: 0
        };
    }

    conteo[productoActual].cantidad += cantidad;

    const ahora = new Date();
    registro.push({
        fecha: ahora.toLocaleDateString(),
        hora: ahora.toLocaleTimeString(),
        codigo: productoActual,
        producto: p.producto,
        cantidad
    });

    guardar();
    cerrarModal();
}

function guardar() {
    localStorage.setItem("conteo", JSON.stringify(conteo));
    localStorage.setItem("registro", JSON.stringify(registro));
    renderConteo();
}

function limpiarConteo() {
    if (!confirm("¿Borrar todo el conteo y registro?")) return;
    conteo = {};
    registro = [];
    guardar();
}

function exportarExcel() {
    const wb = XLSX.utils.book_new();

    // Hoja 1 - Resumen
    const resumen = [["Código", "Producto", "Departamento", "Cantidad"]];
    Object.entries(conteo).forEach(([c, i]) =>
        resumen.push([c, i.producto, i.departamento, i.cantidad])
    );
    XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(resumen),
        "Resumen"
    );

    // Hoja 2 - Registro
    const log = [["Fecha", "Hora", "Código", "Producto", "Cantidad"]];
    registro.forEach(r =>
        log.push([r.fecha, r.hora, r.codigo, r.producto, r.cantidad])
    );
    XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(log),
        "Registro"
    );

    XLSX.writeFile(wb, `conteo_${new Date().toISOString().slice(0,10)}.xlsx`);
}
