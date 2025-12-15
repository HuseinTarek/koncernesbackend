const logoutBtn = document.getElementById("logoutBtn");
const usernameDisplay = document.getElementById("usernameDisplay");
const userContent=document.getElementById("userContent")
const menuItems = document.querySelectorAll(".menu-item");
let currentSort = "name-asc";

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        window.location.href = "/logout";
    });
}

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        const view = item.getAttribute("data-view");
        switch (view) {
            case "cars":
                loadCars();
                break;
            case "bookings":
                loadBookings();
                break;
            case "cart":
                loadCart();
                break;
        }
    })
})

function normalizeArray(obj) {
    if (!obj) return [];

    if (Array.isArray(obj)) return obj;

    for (const value of Object.values(obj)) {
        if (Array.isArray(value)) return value;
    }

    return [];
}


async function loadCars() {
    clearUserContent();
    renderSortingBar();
    const cars = await fetchCars();
    const sortedCars = sortCars(cars, currentSort);
    renderCarsHeader();
    renderCars(sortedCars);
}


async function fetchCars() {
    const res = await fetch("/api/v1/cars", {
        credentials: "include"
    });
    return await res.json();
}


function renderSortingBar() {
    const bar = document.createElement("div");
    bar.classList.add("sorting-bar");
    bar.innerHTML = `
        <label>Sortera:</label>
        <select id="sortSelect">
            <option value="name-asc">Namn A–Ö</option>
            <option value="name-desc">Namn Ö–A</option>
            <option value="type-asc">Typ A–Ö</option>
            <option value="type-desc">Typ Ö–A</option>
        </select>
    `;
    userContent.appendChild(bar);

    const select = bar.querySelector("#sortSelect");
    select.value = currentSort;
    select.onchange = () => {
        currentSort = select.value;
        loadCars();
    };
}

function renderCarsHeader() {
    const header = document.createElement("div");
    header.classList.add("car-titles");

    ["ID","Name","Type","Model","Price","Image","Feature1","Feature2","Feature3",""]
        .forEach(t => header.appendChild(createCell(t)));

    userContent.appendChild(header);
}


function renderCars(cars) {
    if (!cars || cars.length === 0) {
        renderEmpty("Inga bilar hittades");
        return;
    }
    cars.forEach(renderCarRow);
}

function renderCarRow(car) {
    const row = document.createElement("div");
    row.classList.add("car-row");

    [car.id, car.name, car.type, car.model, car.price]
        .forEach(v => row.appendChild(createCell(v)));

    row.appendChild(createImageCell(car.image));

    [car.feature1, car.feature2, car.feature3]
        .forEach(v => row.appendChild(createCell(v)));

    row.appendChild(createChooseButton(car));
    userContent.appendChild(row);
}

function addToCart(car) {
    localStorage.setItem("selectedCar", JSON.stringify(car));
}

function loadCart() {
    clearUserContent();
    const stored = localStorage.getItem("selectedCar");
    if (!stored) {
        renderEmpty("Inga bilar valda");
        return;
    }

    const car = JSON.parse(stored);

    const box = document.createElement("div");
    box.className = "cart-box";

    box.innerHTML = `
    <h2>Din beställning</h2>

    <p>Bil: ${car.name}</p>
    <p>Typ: ${car.type}</p>
    <p>Model: ${car.model}</p>
    <p>Pris: ${car.price} kr / dag</p>

    <hr>

    <label>Från datum</label><br>
    <input type="date" id="fromDate" class="dateInput"><br><br>

    <label>Till datum</label><br>
    <input type="date" id="toDate" class="dateInput">

    <hr>

    <button id="confirmBtn">Bekräfta</button>
    <button id="clearBtn">Ta bort</button>
`;

    userContent.appendChild(box);

    document.getElementById("clearBtn").onclick = () => {
        localStorage.removeItem("selectedCar");
        loadCart();
    };

    document.getElementById("confirmBtn").onclick = () => {
        confirmBooking(car);
    };
}

async function confirmBooking(car) {
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

    if (!fromDate || !toDate) {
        alert("Vänligen välj start- och slutdatum.");
        return;
    }

    const bookingDetails = {
        carId: car.id,
        fromDate: fromDate,
        toDate: toDate
    };

    try {
        const res = await fetch("/api/v1/bookings", {

            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(bookingDetails)
        });

        if (res.ok) {
            alert("Bokning bekräftad!");
            localStorage.removeItem("selectedCar");
            loadBookings();
        } else {
            const errorText = await res.text();
            alert("Bokningen misslyckades: " + errorText);
        }
    } catch (error) {
        console.error("Error during booking:", error);
        alert("Ett nätverksfel inträffade. Försök igen.");
    }
}


function clearUserContent() {
    userContent.innerHTML = "";
}

function renderEmpty(text) {
    const d = document.createElement("div");
    d.className = "empty";
    d.textContent = text;
    userContent.appendChild(d);
}

function createCell(value) {
    const d = document.createElement("div");
    d.textContent = value ?? "-";
    return d;
}

function createImageCell(image) {
    const cell = document.createElement("div");
    const img = document.createElement("img");
    if (image) {
        img.src = "data:image/jpeg;base64," + image;
        img.classList.add("car-image");
        img.onerror = () => img.style.display = "none";
    }
    cell.appendChild(img);
    return cell;
}

function createChooseButton(car) {
    const cell = document.createElement("div");
    const btn = document.createElement("button");
    btn.textContent = "Välj bil";
    btn.onclick = () => {
        addToCart(car);
        loadCart();
    };
    cell.appendChild(btn);
    return cell;
}


function sortCars(cars, rule) {
    switch (rule) {
        case "name-asc":
            return cars.sort((a, b) => a.name.localeCompare(b.name, "sv"));
        case "name-desc":
            return cars.sort((a, b) => b.name.localeCompare(a.name, "sv"));
        case "type-asc":
            return cars.sort((a, b) => a.type.localeCompare(b.type, "sv"));
        case "type-desc":
            return cars.sort((a, b) => b.type.localeCompare(a.type, "sv"));
        default:
            return cars;
    }
}


async function loadBookings() {
    if (!userContent) return;

    clearUserContent();

    try {
        const bookings = await fetchMyBookings();
        renderBookingHeader();
        renderBookings(bookings);
    } catch {
        renderEmpty("Network error loading bookings");
    }
}

async function fetchMyBookings() {
    const res = await fetch("/api/v1/bookings/me", {
        credentials: "include"
    });

    if (!res.ok) {
        if (res.status === 401 || res.status === 403) return [];
        const body = await res.text();
        throw new Error(body);
    }

    return await res.json();
}



function renderBookingHeader() {
    const h = document.createElement("div");
    h.classList.add("booking-titles");

    ["ID","Active","Car","User","From","To","Price"]
        .forEach(t => h.appendChild(createCell(t)));

    userContent.appendChild(h);
}

function renderBookings(bookings) {
    if (!bookings || bookings.length === 0) {
        renderEmpty("No bookings found");
        return;
    }
    bookings.forEach(renderBookingRow);
}


function renderBookingRow(b) {
    const r = document.createElement("div");
    r.classList.add("booking-row");

    [
        b.id,
        b.active,
        b.carId,
        b.fromDate,
        b.toDate
    ].forEach(v => r.appendChild(createCell(v)));

    userContent.appendChild(r);
}

function clearUserContent() {
    userContent.innerHTML = "";
}

function renderEmpty(text) {
    const d = document.createElement("div");
    d.className = "empty";
    d.textContent = text;
    userContent.appendChild(d);
}

function createCell(value) {
    const d = document.createElement("div");
    d.textContent = value ?? "-";
    return d;
}
