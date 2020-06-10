/*jshint esversion: 6 */

// URL for CSV file
const file = "./courses.csv";
// Assemble node list of courses from DOM
let coursesHTML = [];
// Variables of active dashboard courses
let coursesVars = [];
// Specialization tabs for accordion pane
const specializations = document.getElementsByClassName("specs");
// Space to insert prereq queue data
const insertSpace = document.getElementById("prereq-action-space");
// The trash can
let trash = document.getElementById("trash");
// List of movable course objects
const movables = [];
// List of selected course objects
let selected = [];
// Page positioning variables
let startX, startY, endX, endY = 0;

// Gets courses asynchronously from file
async function getCourses() {
    let request = await fetch(file);
    let data = await request.text();
    let objects = csvObjects(data);

    arrayProperties(objects, ["prereqs", "varPrereqs"]);

    return objects;
}

// Populate courses on page load
window.onload = function () {
    populate();
};

// Checks for addEventListener
if (document.addEventListener) {
    // Disable drag capability
    document.querySelector('#drag-interact').onchange = function () {
        if (this.checked)
            for (let i in movables)
                movables[i].enable();
        else
            for (let i in movables)
                movables[i].disable();
    }
    // Show group of courses by toggling checkboxes
    document.getElementById("col-one").onclick = function () {
        var section = document.getElementById("fundamentals");
        this.checked ? section.style.display = "grid" : section.style.display = "none";
    }
    document.getElementById("col-two").onclick = function () {
        var section = document.getElementById("engineering-fundamentals");
        this.checked ? section.style.display = "grid" : section.style.display = "none";
    }
    document.getElementById("col-three").onclick = function () {
        var section = document.getElementById("gateway-electives");
        this.checked ? section.style.display = "grid" : section.style.display = "none";
    }
    document.getElementById("col-four").onclick = function () {
        var section = document.getElementById("specialization-electives");
        this.checked ? section.style.display = "grid" : section.style.display = "none";
    }
    // Adds event listener to specialization bottons
    for (var i = 0; i < specializations.length; i++) {
        specializations[i].addEventListener("click", accordion);
    }
    // Add event listener to tracing button
    document.getElementsByClassName("tracing")[0].addEventListener("click", tracingOption);
    document.getElementsByClassName("tracing")[1].addEventListener("click", tracingOption);
    // Listen to close popup
    document.getElementById("close-button").onclick = () => {
        document.getElementById("popup").style.display = "none";
        for (let i = 0; i < coursesHTML.length; i++) {
            coursesHTML[i].classList.remove("looking");
            coursesHTML[i].classList.remove("looking-prereq");
        }
    }
    document.onkeydown = e => {
        if (e.key == "Escape") {
            document.getElementById("popup").style.display = "none";
            for (let i = 0; i < coursesHTML.length; i++) {
                coursesHTML[i].classList.remove("looking");
                coursesHTML[i].classList.remove("looking-prereq");
            }
        }
        if (e.key == "Delete" || e.key == "Backspace") {
            for (let i = 0; i < coursesHTML.length; i++) {
                if (coursesHTML[i].classList.contains("looking")) {
                    coursesHTML[i].parentElement.remove();
                    document.getElementById("popup").style.display = "none";
                }
            }
            for (var elements of selected) {
                elements.parentElement.remove();
            }
            trash.style.display = "none";
        }
    }
} else if (document.attachEvent) {
    for (var i = 0; i < specializations.length; i++) {
        specializations[i].attachEvent("onclick", accordion);
    }
    document.getElementById("close-button").attachEvent("onclick", () => {
        document.getElementById("popup").style.display = "none";
    });
}

/*
* An accordion pane event handler
*/
function accordion() {
    if (this.classList.contains("active")) {
        this.classList.toggle("active", false);
        this.nextElementSibling.classList.toggle("show", false);
    } else {
        for (var i = 0; i < specializations.length; i++) {
            specializations[i].classList.toggle("active", false);
            specializations[i].nextElementSibling.classList.toggle("show", false);
        }
        this.classList.toggle("active");
        this.nextElementSibling.classList.toggle("show");
    }
}

/*
* The tracing option in summary view
*/
function tracingOption() {
    if (this.id === "prereq-button") {
        this.classList.toggle("active", true);
        document.getElementById("prereq-action-pane").classList.toggle("show", true);
        document.getElementById("filter-button").classList.toggle("active", false);
        document.getElementById("filter-action-pane").classList.toggle("show", false);
    } else if (this.id === "filter-button") {
        this.classList.toggle("active", true);
        document.getElementById("filter-action-pane").classList.toggle("show", true);
        document.getElementById("prereq-button").classList.toggle("active", false);
        document.getElementById("prereq-action-pane").classList.toggle("show", false);
    }
}

/*
*
* Populate the UI with field data from course object
* array
*
*/
async function populate() {
    let csvs = await getCourses();
    // Placement locations
    let fundamentals = document.getElementById("fundamentals");
    let engineering = document.getElementById("engineering-fundamentals");
    let gateway = document.getElementById("gateway-electives");
    let specialization = document.getElementById("specialization-electives");
    let pharma = document.getElementById("pharma-pane");
    let microdevices = document.getElementById("microdevices-pane");
    let biosignals = document.getElementById("biosignals-pane");
    let rehabilitation = document.getElementById("rehabilitation-pane");
    let regenerative = document.getElementById("regenerative-pane");

    for (let i = 0; i < csvs.length; i++) {
        if (csvs[i].designation == "freshman") {
            buildCourse("f", fundamentals, i, csvs);
        } else if (csvs[i].designation == "sophomore") {
            buildCourse("ef", engineering, i, csvs);
        } else if (csvs[i].designation == "junior") {
            buildCourse("ge", gateway, i, csvs);
        } else if (csvs[i].designation == "senior") {
            buildCourse("se", specialization, i, csvs);
        } else if (csvs[i].designation == "pharma") {
            buildCourse("se", pharma, i, csvs);
        } else if (csvs[i].designation == "microdevices") {
            buildCourse("se", microdevices, i, csvs);
        } else if (csvs[i].designation == "biosignals") {
            buildCourse("se", biosignals, i, csvs);
        } else if (csvs[i].designation == "rehabilitation") {
            buildCourse("se", rehabilitation, i, csvs);
        } else if (csvs[i].designation == "regenerative") {
            buildCourse("se", regenerative, i, csvs);
        }
    }
    // z-Index counter for precedence
    let count = 0;
    // Designations
    let designations = ["freshman", "sophomore", "junior", "senior"];
    // Adds Draggabilly on all course elements
    for (var i = 0; i < coursesHTML.length; i++) {
        if (designations.indexOf(coursesHTML[i].variable.designation) !== -1) {
            var movable = new Draggabilly(coursesHTML[i], { containment: '#middle', grid: [10, 10] });
            var clickTime, pressTime = 0;
            var click, longPress = null;
            var x, y = 0;
            var wait = 500;

            movable.on('pointerDown', function () {
                // Long press functionality
                var element = this.element;
                x = this.dragPoint.x;
                y = this.dragPoint.y;
                pressTime = new Date().getTime();

                longPress = setTimeout(() => {
                    element.classList.toggle("highlight");
                }, wait);
            }).on('pointerMove', function () {
                if (this.dragPoint.x !== 0 && this.dragPoint.y !== 0) {
                    clearTimeout(longPress);
                    longPress = null;
                }
            }).on('pointerUp', function () {
                if (this.dragPoint.x === x && this.dragPoint.y === y && (new Date().getTime() - pressTime) < wait) {
                    if ((new Date().getTime() - clickTime) < wait) {
                        // Double click
                        this.element.parentElement.remove();
                        clearTimeout(click)
                        clickTime = 0;
                    } else {
                        // Single click
                        for (let i = 0; i < coursesHTML.length; i++) {
                            coursesHTML[i].classList.remove("looking");
                        }
                        clickTime = new Date().getTime();
                        click = setTimeout(traceCourse, wait - 200, this.element);
                    }
                }
                pressTime = 0;
                if (longPress !== null) {
                    clearTimeout(longPress);
                    longPress = null;
                }
            }).on('dragStart', function () {
                // Bring to front
                if (count > 100) {
                    count = 0;
                }
                this.element.style.zIndex = ++count;
            });

            movables.push(movable);
        } else {
            var container = "#" + coursesHTML[i].variable.designation + "-pane";
            var movable = new Draggabilly(coursesHTML[i], { containment: container });
            movable.on('staticClick', function () {
                traceCourse(this.element);
            });
            movable.on('dragStart', function () {
                if (count > 1000) {
                    count = 0;
                }
                count += 1;
                this.element.style.zIndex = count;
            });
            movables.push(movable);
        }
    }
    // Log courses
    console.log(coursesVars);

    // Add selection functionality
    const selection = new Selection({
        class: 'selection-box',
        selectables: ['.course'],
        startareas: ['#middle'],
        boundaries: ['#middle'],
        mode: 'touch',
        disableTouch: false,
        singleClick: true
    });

    selection.on('start', ({ inst }) => {
        startX = event.pageX;
        startY = event.pageY;
        console.log("START\nx: " + startX + ", y: " + startY);

        for (var elements of selected) {
            elements.classList.remove("selected");
        }
        inst.clearSelection();
        trash.style.display = "none";
    }).on('move', ({ changed: { removed, added } }) => {
        for (const elements of added) {
            elements.classList.add("selected");
        }
        for (const elements of removed) {
            elements.classList.remove("selected");
        }
    }).on('stop', ({ inst }) => {
        endX = event.pageX;
        endY = event.pageY;
        console.log("END\nx: " + endX + ", y: " + endY);

        inst.keepSelection();
        selected = selection.getSelection();
        if (selected.length !== 0) {
            trash.style.display = "block";
            // group();
        }
        console.log(selected);
    });

    document.querySelector('#select-interact').onchange = function () {
        if (this.checked)
            selection.enable();
        else
            selection.disable();
    }

    trash.onclick = () => {
        trash.style.display = "none";
        for (var elements of selected) {
            elements.parentElement.remove();
        }
        selection.clearSelection();
        selected = [];
        console.log(selected);
    };
}

/*
*
* Builds the course elements
*
*/
function buildCourse(order, section, index, coursesCSV) {
    // Create elements
    var item = document.createElement("div");
    var course = document.createElement("span");
    var courseIDs = document.createElement("span");
    var courseNames = document.createElement("span");
    var label = document.createElement("span");
    var indicator = document.createElement("span");
    var red = document.createElement("div");
    var blue = document.createElement("div");
    // Add classes to the elements
    item.classList.add("item");
    item.classList.add(order);
    course.classList.add("course");
    courseIDs.classList.add("course-ids");
    courseNames.classList.add("course-names");
    label.classList.add("labels")
    indicator.classList.add("indicators");
    red.classList.add("rect", "red");
    blue.classList.add("rect", "blue");
    // Assign features to the elements
    course.id = coursesCSV[index].courseID;
    course.variable = coursesCSV[index];
    courseIDs.innerHTML = coursesCSV[index].courseID.replace(/([^\d\s%])(\d)/g, '$1 $2');
    courseNames.innerHTML = coursesCSV[index].courseName.replace(/"/g, "");
    // Place elements in respective places
    section.appendChild(item);
    item.appendChild(course);
    course.appendChild(courseIDs);
    course.appendChild(courseNames);
    course.appendChild(label);
    course.appendChild(indicator);
    if (coursesCSV[index].isNCSU) {
        indicator.appendChild(red);
    }
    if (coursesCSV[index].isUNC) {
        indicator.appendChild(blue);
    }
    // Add elements to diagnostic and functional arrays
    coursesVars.push(course.variable);
    coursesHTML.push(course);
}

/*
*
* Takes string of csv data and forms an array of
* objects by rows and properties by headers in the first
* row of the spreadsheet
*
*/
function csvObjects(data) {
    let objects = [];
    let headers = [];
    let rows = data.split(/\r|\n/);

    rows.forEach((line, index) => {
        line = line.trim();
        let state = 0;
        let temp = [];
        let row = [];

        for (let i = 0; i < line.length; i++) {
            let c = line[i];

            if (state == 0) {
                if (c == '"') {
                    state = 1;
                } else if (c == ',') {
                    row.push(temp.join(''));
                    temp = [];
                } else {
                    temp.push(c);
                }
            } else if (state == 1) {
                if (c == '"') {
                    if (line[i + 1] == '"') {
                        temp.push('"');
                        i++;
                    } else {
                        state = 0;
                        row.push(temp.join(''));
                        temp = [];
                        i++;
                    }
                } else if (c == '\\' && (i == 0 || (i > 0 && line[i - 1] != '\\')) && i != line.length - 1) {
                    let e = line[i + 1];
                    if (e == 'n') {
                        temp.push('\n');
                        i += 1;
                    } else if (e == 't') {
                        temp.push('\t');
                        i += 1;
                    } else if (e == 'r') {
                        temp.push('\r');
                        i += 1;
                    } else if (e == '"') {
                        temp.push('"');
                        i += 1;
                    }
                } else {
                    temp.push(c);
                }
            }
        }

        if (temp.length > 0) {
            row.push(temp.join(''));
            temp = [];
        }

        if (index == 0) {
            headers.push(...row);
        } else {
            if (headers.length == row.length) {
                let object = {};
                for (let k = 0; k < row.length; k++) {
                    let cell = row[k];

                    if (cell.length == 0) {
                        cell = null;
                    } else if (!isNaN(cell)) {
                        cell = Number(cell);
                    } else if (cell.toLowerCase() == 'true') {
                        cell = true;
                    } else if (cell.toLowerCase() == 'false') {
                        cell = false;
                    }
                    object[headers[k]] = cell;
                }
                objects.push(object);
            }
        }
    });
    return objects;
}

/*
*
* Takes an array of objects and an array of titles, cycles through the
* objects and turns the data of given titles into arrays
*
*/
function arrayProperties(objects, titles) {
    for (let i = 0; i < objects.length; i++) {
        titles.forEach(title => {
            if (objects[i].hasOwnProperty(title) && typeof objects[i][title] == 'string') {
                objects[i][title] = objects[i][title].replace(/ /, '').split(',');
            }
        });
    }
}

/*
*
* Trace the prerequisites of a chosen course
* by cross referencing the prereq and varprereq
* properties of a coursesCSV object
*
*/
function traceCourse(element) {
    try {
        console.log(element.variable);
        clearQueue();
        buildPopup(element.variable);
        prereqQueue(element);
    } catch (error) {
        var o = element.id.toUpperCase().replace(/([^\d\s%])(\d)/g, '$1 $2');

        alert(o + ": This course does not exist in the system database.");
        console.error(o + ": Course not listed in database \n\n CAUGHT: "
            + error.name + "\n\n Course object.variable not assigned data during populate().");
    }
}

/*
*
*/
function clearQueue() {
    for (let i = 0; i < coursesHTML.length; i++) {
        coursesHTML[i].classList.remove("looking");
        coursesHTML[i].classList.remove("looking-prereq");
    }
    while (insertSpace.firstChild)
        insertSpace.firstChild.remove();
}

/*
*
*/
function prereqQueue(elements) {
    // initialize new buffer array
    var temp = [];
    // check if elements is an array
    if (Array.isArray(elements)) {
        let columnInsert = document.createElement("span");
        columnInsert.classList.add("column-insert");
        insertSpace.appendChild(columnInsert);
        // go through array of elements
        for (let i in elements) {
            let itemInsert = document.createElement("span");
            itemInsert.classList.add("item-insert");
            columnInsert.appendChild(itemInsert);
            itemInsert.innerHTML = elements[i].variable.courseID.replace(/([^\d\s%])(\d)/g, '$1 $2');
            itemInsert.addEventListener("click", () => {
                for (let j in coursesHTML)
                    if (coursesHTML[j].variable.courseID === elements[i].variable.courseID)
                        coursesHTML[j].classList.remove("hovered");
                traceCourse(elements[i]);
            });
            itemInsert.addEventListener("mouseover", () => {
                for (let j in coursesHTML)
                    if (coursesHTML[j].variable.courseID === elements[i].variable.courseID)
                        coursesHTML[j].classList.add("hovered");
            });
            itemInsert.addEventListener("mouseout", () => {
                for (let j in coursesHTML)
                    if (coursesHTML[j].variable.courseID === elements[i].variable.courseID)
                        coursesHTML[j].classList.remove("hovered");
            });
            elements[i].classList.add("looking-prereq"); // TODO
            // check if element has prereq
            if (elements[i].variable.hasPrereq) {
                // go through prereqs and locate courses in database
                for (let j in elements[i].variable.prereqs) {
                    for (let k in coursesHTML) {
                        // place course in buffer
                        if (coursesHTML[k].variable.courseID === elements[i].variable.prereqs[j]) {
                            temp.push(coursesHTML[k]);
                        }
                    }
                }
            }
        }
        if (temp.length !== 0) {
            var unique = [...new Set(temp)];
            prereqQueue(unique);
        }
        if (!columnInsert.hasChildNodes())
            columnInsert.remove();
    } else {
        // check if given has prereq
        if (elements.variable.hasPrereq) {
            let columnInsert = document.createElement("span");
            columnInsert.classList.add("column-insert");
            insertSpace.appendChild(columnInsert);

            let itemInsert = document.createElement("span");
            itemInsert.classList.add("item-insert");
            columnInsert.appendChild(itemInsert);

            itemInsert.innerHTML = elements.variable.courseID.replace(/([^\d\s%])(\d)/g, '$1 $2');
            elements.classList.add("looking");
            // go through prereqs and locate courses in database
            for (let i in elements.variable.prereqs) {
                for (let j in coursesHTML) {
                    // place course in buffer
                    if (coursesHTML[j].variable.courseID === elements.variable.prereqs[i]) {
                        temp.push(coursesHTML[j]);
                    }
                }
            }
            prereqQueue(temp);
        }
    }
}

/*
* Populate the popup summary view with course data
*/
function buildPopup(event) {
    document.getElementById("popup").style.display = "flex";
    document.getElementById("course-name").innerHTML = event.courseName.replace(/"/g, "");

    if (event.hours == null) {
        document.getElementById("bubble").innerHTML = "?";
    } else {
        document.getElementById("bubble").innerHTML = event.hours;
    }

    if (event.isNCSU && !event.isUNC) {
        document.getElementById("offering").innerHTML = "<i>This course is offered at NC State.</i>";
    } else if (!event.isNCSU && event.isUNC) {
        document.getElementById("offering").innerHTML = "<i>This course is offered at UNC.</i>";
    } else {
        document.getElementById("offering").innerHTML = "<i>This course is offered on both campuses.</i>";
    }
    document.getElementById("description").innerHTML = event.description;
}

/*
*
*/
function group() {
    var width = Math.abs(endX - startX);
    var group = document.createElement("div");
    group.classList.add("group");
    group.style.width = width + "px";
    group.style.left = String(startX) + "px";
    group.style.bottom = String(document.body.scrollHeight - startY) + "px";
    document.getElementById("app").appendChild(group);

    console.log("Selection width: " + width);

    for (var elements of selected) {
        group.appendChild(elements.parentElement);
    }
    // var movable = new Draggabilly(group, { handle: ".course" });
}