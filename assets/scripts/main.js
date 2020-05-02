// Load local storage items
function load() {
    // Mode control
    if (window.localStorage.getItem("mode") == "dark") {
        darkMode();
    } else {
        lightMode();
    }
}
// Page mode changer
function modeChange() {
    document.querySelector('#checkbox').onchange = function () {
        if (this.checked) {
            darkMode();
        } else {
            lightMode();
        }
    }
}
// Dark page mode
function darkMode() {
    document.querySelector('body').classList.add('dark');
    //$('body').addClass('dark');
    window.localStorage.setItem("mode", "dark");
    document.getElementById("checkbox").checked = true;
}
// Light page mode
function lightMode() {
    document.querySelector('body').classList.remove('dark');
    //$('body').removeClass('dark');
    window.localStorage.setItem("mode", "light");
    document.getElementById("checkbox").checked = false;
}
// Misc countdown function
var count = 10;
function countDown() {
    var timer = document.getElementById("timer");
    if (count > 0) {
        timer.innerHTML =
            "You'll be redirected to the <a href='index.html'>home page</a> in <span style='color: #0382C0; font-size: 110%; font-weight: bold;'>" +
            count-- + "</span> secs (:";
        setTimeout("countDown()", 1000); // delay to start counting
    } else {
        window.location.href = "index.html";
    }
}