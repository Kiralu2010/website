

function scrollToAbout() {
    document.getElementById("about-me").scrollIntoView({ behavior: 'smooth' });
}

function changeHeaderState() {
    const header = document.getElementById("header");
    const header_social_box = header.querySelector("#social-buttons-box");
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

    if(window.scrollY > 300) {
        header_social_box.classList.add("show");
    } else {
        header_social_box.classList.remove("show");
    }

}

function scrolledToBottom() {
    const arrowTop = document.getElementById("back_up_arrow");

    if (!arrowTop) {
        console.error("Elemento #back_up_arrow non trovato!");
        return;
    }

    if (window.scrollY > 500) {
        arrowTop.classList.add("show");
    } else {
        arrowTop.classList.remove("show");
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener("scroll", scrolledToBottom);

window.addEventListener("scroll", changeHeaderState);

