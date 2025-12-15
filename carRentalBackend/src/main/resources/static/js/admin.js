const logoutBtn = document.getElementById("logoutBtn");
const usernameDisplay = document.getElementById("usernameDisplay");
const adminContent=document.getElementById("adminContent")
const menuItems = document.querySelectorAll(".menu-item");
let currentSort = "id-asc";

let adminSort = {
    column: null,
    direction: "asc"
};

logoutBtn.addEventListener("click", () => {
    window.location.href = "/logout";
});

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        const view = item.getAttribute("data-view");
        switch (view) {
            case "users":
                loadUsers();
                break;
            case "cars":
                loadCars();
                break
            case "bookings":
                loadBookings();
                break;
        }
    })
})


async function loadUsers() {
    if (!adminContent) return;

    adminContent.innerHTML = "";
    renderSortingBar();

    try {
        const users = await fetchUsers();
        sortUsersList(users, currentSort);
        renderUsersTable(users);
    } catch (e) {
        adminContent.textContent = "Fel vid hämtning av användare\n";
    }
}

async function fetchUsers() {
    const res = await fetch("/api/v1/users", { credentials: "include" })

    if (!res.ok) throw new Error("Fetch failed");
    const json = await res.json();

    if (Array.isArray(json)) {
        return json;
    }

    if (json.data) {
        return json.data;
    }

    return [];
}

function renderSortingBar() {
    const bar = document.createElement("div");
    bar.classList.add("sorting-bar");
    bar.innerHTML = `
        <label>Sortera:</label>
        <select id="sortSelect">
            <option value="id-asc">ID 1–9</option>
            <option value="id-desc">ID 9–1</option>
            <option value="email-asc">Email A–Ö</option>
            <option value="email-desc">Email Ö–A</option>
            <option value="first-name-asc">Förnamn A–Ö</option>
            <option value="first-name-desc">Förnamn Ö–A</option>
            <option value="last-name-asc">Efternamn A–Ö</option>
            <option value="last-name-desc">Efternamn Ö–A</option>
            <option value="phone-asc">Telefonnummer 0–9</option>
            <option value="phone-desc">Telefonnummer 9–0</option>
            <option value="username-asc">Användarnamn A–Ö</option>
            <option value="username-desc">Användarnamn Ö–A</option>
        </select>
    `;
    adminContent.appendChild(bar);

    const select = bar.querySelector("#sortSelect");
    select.value = currentSort;
    select.onchange = () => {
        currentSort = select.value;
        loadUsers();
    };
}

function renderUsersTable(users) {
    renderHeaders();
    users.forEach(renderUserRow);
}

function renderHeaders() {
    const row = document.createElement("div");
    row.classList.add("user-titles");
    ["ID", "Email", "First Name", "Last Name", "Phone", "Username"]
        .forEach(t => row.appendChild(createCell(t)));
    adminContent.appendChild(row);
}

function renderUserRow(u) {
    const row = document.createElement("div");
    row.classList.add("user-row");
    [u.id, u.email, u.firstName, u.lastName, u.phone, u.username]
        .forEach(v => row.appendChild(createCell(v)));
    adminContent.appendChild(row);
}

function createCell(value) {
    const d = document.createElement("div");
    d.textContent = value ?? "-";
    return d;
}


function sortUsersList(users, sortKey) {

    switch (sortKey) {

        case "id-asc":
            users.sort((a, b) => a.id - b.id);
            break;

        case "id-desc":
            users.sort((a, b) => b.id - a.id);
            break;

        case "email-asc":
            users.sort((a, b) => a.email.localeCompare(b.email, "sv"));
            break;

        case "email-desc":
            users.sort((a, b) => b.email.localeCompare(a.email, "sv"));
            break;

        case "first-name-asc":
            users.sort((a, b) => a.firstName.localeCompare(b.firstName, "sv"));
            break;

        case "first-name-desc":
            users.sort((a, b) => b.firstName.localeCompare(a.firstName, "sv"));
            break;

        case "last-name-asc":
            users.sort((a, b) => a.lastName.localeCompare(b.lastName, "sv"));
            break;

        case "last-name-desc":
            users.sort((a, b) => b.lastName.localeCompare(a.lastName, "sv"));
            break;

        case "phone-asc":
            users.sort((a, b) => (a.phone || "").localeCompare(b.phone || "", "sv"));
            break;

        case "phone-desc":
            users.sort((a, b) => (b.phone || "").localeCompare(a.phone || "", "sv"));
            break;

        case "username-asc":
            users.sort((a, b) => a.username.localeCompare(b.username, "sv"));
            break;

        case "username-desc":
            users.sort((a, b) => b.username.localeCompare(a.username, "sv"));
            break;
    }
}


async function loadCars() {
    if (!adminContent) return;

    adminContent.innerHTML = "";
    renderCarSortingBar();

    try {
        const cars = await fetchCars();
        sortCarsList(cars, window.currentCarSort);
        renderCarsTable(cars);
    } catch {
        adminContent.textContent = "Fel vid hämtning av bilar";
    }
}

async function fetchCars() {
    const res = await fetch("/api/v1/cars", { credentials: "include" })
    ;
    if (!res.ok) throw new Error();
    const json = await res.json();
    return Array.isArray(json) ? json : json.data || [];
}

function renderCarSortingBar() {
    if (!window.currentCarSort) window.currentCarSort = "id-asc";

    const bar = document.createElement("div");
    bar.classList.add("sorting-bar");
    bar.innerHTML = `
        <label>Sortera:</label>
        <select id="sortCars">
            <option value="id-asc">ID 1–9</option>
            <option value="id-desc">ID 9–1</option>
            <option value="name-asc">Name A–Ö</option>
            <option value="name-desc">Name Ö–A</option>
            <option value="type-asc">Type A–Ö</option>
            <option value="type-desc">Type Ö–A</option>
            <option value="model-asc">Model A–Ö</option>
            <option value="model-desc">Model Ö–A</option>
            <option value="price-asc">Price Low → High</option>
            <option value="price-desc">Price High → Low</option>
        </select>
    `;
    adminContent.appendChild(bar);

    const select = bar.querySelector("#sortCars");
    select.value = window.currentCarSort;
    select.onchange = () => {
        window.currentCarSort = select.value;
        loadCars();
    };
}

function renderCarsTable(cars) {
    renderCarHeaders();
    cars.forEach(renderCarRow);
}

function renderCarHeaders() {
    const row = document.createElement("div");
    row.classList.add("car-titles");
    ["ID","Name","Type","Model","Price","Image","Feature1","Feature2","Feature3"]
        .forEach(t => row.appendChild(createCell(t)));
    adminContent.appendChild(row);
}

function renderCarRow(car) {
    const row = document.createElement("div");
    row.classList.add("car-row");

    [car.id, car.name, car.type, car.model, car.price]
        .forEach(v => row.appendChild(createCell(v)));

    const imgCell = document.createElement("div");
    const img = document.createElement("img");
    if (car.image) img.src = "data:image/jpeg;base64," + car.image;
    img.classList.add("car-image");
    imgCell.appendChild(img);
    row.appendChild(imgCell);

    [car.feature1, car.feature2, car.feature3]
        .forEach(v => row.appendChild(createCell(v)));

    adminContent.appendChild(row);
}

function createCell(value) {
    const d = document.createElement("div");
    if (value === null || value === undefined) {
        d.textContent = "-";
    } else {
        d.textContent = value;
    }
    return d;
}

function sortCarsList(cars, sortKey) {
    switch (sortKey) {
        case "id-asc":
            return cars.sort((a, b) => a.id - b.id);

        case "id-desc":
            return cars.sort((a, b) => b.id - a.id);

        case "name-asc":
            return cars.sort((a, b) => a.name.localeCompare(b.name, "sv"));

        case "name-desc":
            return cars.sort((a, b) => b.name.localeCompare(a.name, "sv"));

        case "type-asc":
            return cars.sort((a, b) => a.type.localeCompare(b.type, "sv"));

        case "type-desc":
            return cars.sort((a, b) => b.type.localeCompare(a.type, "sv"));

        case "model-asc":
            return cars.sort((a, b) => a.model.localeCompare(b.model, "sv"));

        case "model-desc":
            return cars.sort((a, b) => b.model.localeCompare(a.model, "sv"));

        case "price-asc":
            return cars.sort((a, b) => a.price - b.price);

        case "price-desc":
            return cars.sort((a, b) => b.price - a.price);

        default:
            return cars;
    }
}


async function loadBookings() {
    if (!adminContent) return;

    adminContent.innerHTML = "";
    renderBookingSortingBar();

    try {
        const bookings = await fetchBookings();
        sortBookingsList(bookings, window.currentBookingSort);
        renderBookingsTable(bookings);
    } catch {
        adminContent.textContent = "Error while fetching bookings";
    }
}

async function fetchBookings() {
    const res = await fetch("/api/v1/bookings", { credentials: "include" })
    ;
    if (!res.ok) throw new Error();
    const json = await res.json();
    return Array.isArray(json) ? json : json.data || [];
}

function renderBookingSortingBar() {
    if (!window.currentBookingSort) window.currentBookingSort = "id-asc";

    const bar = document.createElement("div");
    bar.classList.add("sorting-bar");
    bar.innerHTML = `
        <label>Sortera:</label>
        <select id="sortBookings">
            <option value="id-asc">ID 1–9</option>
            <option value="id-desc">ID 9–1</option>
            <option value="active-asc">Active Off → On</option>
            <option value="active-desc">Active On → Off</option>
            <option value="car-asc">Car A–Ö</option>
            <option value="car-desc">Car Ö–A</option>
            <option value="user-asc">User A–Ö</option>
            <option value="user-desc">User Ö–A</option>
            <option value="from-asc">From ↑</option>
            <option value="from-desc">From ↓</option>
            <option value="to-asc">To ↑</option>
            <option value="to-desc">To ↓</option>
            <option value="price-asc">Price Low → High</option>
            <option value="price-desc">Price High → Low</option>
        </select>
    `;
    adminContent.appendChild(bar);

    const select = bar.querySelector("#sortBookings");
    select.value = window.currentBookingSort;
    select.onchange = () => {
        window.currentBookingSort = select.value;
        loadBookings();
    };
}

function renderBookingsTable(bookings) {
    renderBookingHeaders();
    bookings.forEach(renderBookingRow);
}

function renderBookingHeaders() {
    const row = document.createElement("div");
    row.classList.add("booking-titles");
    ["ID","Active","Car","User","From","To","Price"]
        .forEach(t => row.appendChild(createCell(t)));
    adminContent.appendChild(row);
}

function renderBookingRow(b) {
    const row = document.createElement("div");
    row.classList.add("booking-row");

    [
        b.id,
        b.active,
        b.carId,
        b.userId,
        b.fromDate,
        b.toDate,
        b.price
    ].forEach(v => row.appendChild(createCell(v)));

    adminContent.appendChild(row);
}

function createCell(value) {
    const d = document.createElement("div");
    if (value == null) {
        d.textContent = "-";
    } else {
        d.textContent = value;
    }
    return d;
}

function sortBookingsList(bookings, sortKey) {

    switch (sortKey) {

        case "id-asc":
            bookings.sort((a, b) => a.id - b.id);
            break;

        case "id-desc":
            bookings.sort((a, b) => b.id - a.id);
            break;

        case "active-asc":
            bookings.sort((a, b) => Number(a.active) - Number(b.active));
            break;

        case "active-desc":
            bookings.sort((a, b) => Number(b.active) - Number(a.active));
            break;

        case "car-asc":
            bookings.sort((a, b) => (a.car?.name ?? "").localeCompare(b.car?.name ?? "", "sv"));
            break;

        case "car-desc":
            bookings.sort((a, b) => (b.car?.name ?? "").localeCompare(a.car?.name ?? "", "sv"));
            break;

        case "user-asc":
            bookings.sort((a, b) => (a.user?.username ?? "").localeCompare(b.user?.username ?? "", "sv"));
            break;

        case "user-desc":
            bookings.sort((a, b) => (b.user?.username ?? "").localeCompare(a.user?.username ?? "", "sv"));
            break;

        case "from-asc":
            bookings.sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));
            break;

        case "from-desc":
            bookings.sort((a, b) => new Date(b.fromDate) - new Date(a.fromDate));
            break;

        case "to-asc":
            bookings.sort((a, b) => new Date(a.toDate) - new Date(b.toDate));
            break;

        case "to-desc":
            bookings.sort((a, b) => new Date(b.toDate) - new Date(a.toDate));
            break;

        case "price-asc":
            bookings.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
            break;

        case "price-desc":
            bookings.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
            break;
    }
}


