/*
window.onload = () =>
    (window.localStorage.getItem("mode") === "dark") ? darkMode() : lightMode();

const darkMode = () => {
    document.querySelector('body').classList.add('dark');
    window.localStorage.setItem("mode", "dark");
    document.getElementById("checkbox").checked = true;
}

const lightMode = () => {
    document.querySelector('body').classList.remove('dark');
    window.localStorage.setItem("mode", "light");
    document.getElementById("checkbox").checked = false;
}
*/

// Misc countdown function
let count = 10;
const countDown = () => {
    let timer = document.getElementById("timer");
    if (count > 0) {
        timer.innerHTML =
            `You'll be redirected to the <a href='index.html'>home page</a>
            in <span style='color: #0382C0; font-size: 110%; font-weight: bold;'>
            ${count--}</span> secs (:`;
        setTimeout("countDown()", 1000);
    } else
        window.location.href = "index.html";
}