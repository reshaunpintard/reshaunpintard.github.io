let interval

// Populate title with colored letters
window.onload = () => {
    let title = document.getElementById("title")
    let letters = title.innerHTML.split("")
    let output = ""
    const slider = document.getElementById("epilepsy-stop")
    letters.forEach(letter => output += colorLetter(letter))
    title.innerHTML = output
    slider.value = window.localStorage.getItem("slider")
    repeatPrint(title, letters, output, slider.value)
    slider.onchange = () => {
        window.localStorage.setItem("slider", slider.value)
        clearInterval(interval)
        console.log(slider.value)
        repeatPrint(title, letters, output, slider.value)
    }
}

const repeatPrint = (title, letters, output, rate) => {
    let time
    if (rate == 1) time = 800
    else if (rate == 2) time = 1
    else time = 0
    output = ""
    interval = setInterval(() => {
        letters.forEach(letter => output += colorLetter(letter))
        title.innerHTML = output
        output = ""
    }, time)
    if (time == 0) clearInterval(interval)
}

const colorLetter = letter => {
    let color = `hsla(${~~(360 * Math.random())}, 75%, 75%, 0.9)`
    return `<span style="color: ${color}">${letter}</span>`
}

// Misc countdown function
const countDown = count => {
    let timer = document.getElementById("timer")
    timer.innerHTML = count--
    if (count > 0) setTimeout(() => countDown(count), 1000)
    else window.location.href = "index.html"
}