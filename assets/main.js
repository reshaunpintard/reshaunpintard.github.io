window.onload = () => {}

const colorize = elementId => {
    const element = document.getElementById(elementId),
        letters = element.innerHTML.split("")
    let output = ""
    letters.forEach(letter => output += colorLetter(letter))
    element.innerHTML = output
}

const colorLetter = letter => {
    const color = `hsl(${~~(360 * Math.random())}, 75%, 75%)`
    return `<span style="color:${color}">${letter}</span>`
}

const countDown = count => {
    let timer = document.getElementById("timer")
    timer.innerHTML = count--
    if (count > 0) setTimeout(() => countDown(count), 1000)
    else window.location.href = "index.html"
}