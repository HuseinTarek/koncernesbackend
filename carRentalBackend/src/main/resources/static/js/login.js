document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);

    if (params.has("error")) {
        document.getElementById("loginError").textContent =
            "Fel användarnamn eller lösenord";
    }

    if (params.has("logout")) {
        document.getElementById("loginError").textContent =
            "Du har loggats ut";
    }
});
