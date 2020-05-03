/*jshint esversion: 6 */

// URL for CSV file
const file = "./courses.csv";
// Assemble node list of courses from DOM
let coursesHTML = [];
// Variables of active dashboard courses
let coursesVars = [];
// Specialization tabs for accordion pane
const specializations = document.getElementsByClassName("specs");
// List of movable course objects
const movables = [];

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
    // Adds event listener to specialization bottons
    for (var i = 0; i < specializations.length; i++) {
        specializations[i].addEventListener("click", accordion);
    }
    // Listen to close popup
    document.getElementById("close-button").onclick = () => {
        document.getElementById("popup").style.display = "none";
        for (let i = 0; i < coursesHTML.length; i++) {
            coursesHTML[i].classList.remove("looking");
        }
    }
    document.onkeydown = function (e) {
        if (e.key == "Escape") {
            document.getElementById("popup").style.display = "none";
            for (let i = 0; i < coursesHTML.length; i++) {
                coursesHTML[i].classList.remove("looking");
            }
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
            var movable = new Draggabilly(coursesHTML[i], { containment: '#app', grid: [10, 10] });

            var actionTime = 0;
            var wait = 500;
            var action = null;
            // Clicked without drag
            movable.on('staticClick', function () {
                // Double click else single click action
                if ((new Date().getTime() - actionTime) < wait) {
                    clearTimeout(action)
                    this.element.style.display = "none";
                    actionTime = 0;
                } else {
                    // Single click
                    actionTime = new Date().getTime();
                    action = setTimeout(traceCourse, wait - 200, this.element);
                }
            });

            var pressTimer = null;

            movable.on('pointerDown', function () {
                var element = this.element;
                pressTimer = setTimeout(function () {
                    console.log("long click");
                    element.classList.toggle("highlight");
                }, 1000);
            });
            movable.on('pointerMove', function () {
                if (this.dragPoint.x !== 0 && this.dragPoint.y !== 0) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
            });
            movable.on('pointerUp', function (e) {
                if (pressTimer !== null) {
                    clearTimeout(pressTimer);
                    pressTimer = null;

                    // CANCEL MOUSEUP EVENT
                    // e.stopPropagation();
                }
            });

            // Bring to front
            movable.on('dragStart', function () {
                if (count > 1000) {
                    count = 0;
                }
                count = count + 1;
                this.element.style.zIndex = count;
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
                count = count + 1;
                this.element.style.zIndex = count;
            });
            movables.push(movable);
        }
    }
    // Log courses
    console.log(coursesVars);
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

    rows.forEach((line, j) => {
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

        if (j == 0) {
            headers.push(...row);
        } else {
            if (headers.length == row.length) {
                let o = {};
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

                    o[headers[k]] = cell;
                }
                objects.push(o);
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
        for (let i = 0; i < coursesHTML.length; i++) {
            coursesHTML[i].classList.remove("looking");
        }
        element.classList.add("looking");
        console.log(element.variable);
        buildPopup(element.variable);
    } catch (error) {
        var o = element.id.toUpperCase().replace(/([^\d\s%])(\d)/g, '$1 $2');

        alert(o + ": This course does not exist in the system database.");
        console.error(o + ": Course not listed in database \n\n CAUGHT: "
            + error.name + "\n\n Course object.variable not assigned data during populate().");
    }
}

/*
* Populate the popup summary view with course data
*/
function buildPopup(event) {
    document.getElementById("popup").style.display = "block";
    document.getElementById("course-name").innerHTML = event.courseName.replace(/"/g, "");
    if (event.hours == null) {
        document.getElementById("credit-hours").innerHTML = "Credit hours: hours vary";
    } else {
        document.getElementById("credit-hours").innerHTML = "Credit hours: " + event.hours;
    }
    if (event.isNCSU && !event.isUNC) {
        document.getElementById("offering").innerHTML = "<i>This course is offered only on NC State's campus.</i>";
    } else if (!event.isNCSU && event.isUNC) {
        document.getElementById("offering").innerHTML = "<i>This course is offered only on UNC's campus.</i>";
    } else {
        document.getElementById("offering").innerHTML = "<i>This course is offered on both UNC and NC State's campus.</i>";
    }
    if (event.prereqs == null) {
        document.getElementById("prereqs").innerHTML = "Prerequisites: <i>none</i>";
    } else {
        document.getElementById("prereqs").innerHTML = "Prerequisites: <i>" + event.prereqs + "</i>";
    }
    if (event.varPrereqs == null) {
        document.getElementById("var-prereqs").innerHTML = "Coreqs/Alternatives: <i>none</i>";
    } else {
        document.getElementById("var-prereqs").innerHTML = "Coreqs/Alternatives: <i>" + event.varPrereqs + "</i>";
    }
    document.getElementById("description").innerHTML = event.description;
}