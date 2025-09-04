document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.getElementById("menu");
    const navigation = document.querySelector(".navigation");

    menuButton.addEventListener("click", function () {
        navigation.classList.toggle("open");
        menuButton.classList.toggle("open");
    });
});