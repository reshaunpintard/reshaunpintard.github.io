/*jshint esversion: 6 */

// URL for CSV file
const CSV_FILE = "./courses.csv";
// Assemble node list of courses from DOM
let coursesHTML = [];
// Assemble list of course variables
let coursesCSV = [];
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
// z-Index counter for precedence
let count = 0;
// Database entries not found in middle pane
let databaseEntries = [];
// The global reference to a course click
let globalClick;

// Placement locations
let middle = document.getElementById("interaction-area");
let fundamentals = document.getElementById("fundamentals");
let engineering = document.getElementById("engineering-fundamentals");
let gateway = document.getElementById("gateway-electives");
let specialization = document.getElementById("specialization-electives");
let pharma = document.getElementById("pharma-pane");
let microdevices = document.getElementById("microdevices-pane");
let biosignals = document.getElementById("biosignals-pane");
let rehabilitation = document.getElementById("rehabilitation-pane");
let regenerative = document.getElementById("regenerative-pane");
let database = document.getElementById("database");

// Log all courses in middle panel
console.log("HTML", coursesHTML);
console.log("CSV", coursesCSV);

// Gets courses asynchronously from file
async function getCourses() {
    let request = await fetch(CSV_FILE);
    let data = await request.text();
    let objects = csvObjects(data);
    let titles = ["prereqs", "varPrereqs"];
    // Takes objects and titles and turns property values into arrays
    for (let i in objects) {
        titles.forEach(title => {
            if (objects[i].hasOwnProperty(title) && typeof objects[i][title] == 'string') {
                objects[i][title] = objects[i][title].replace(/\s/g, '').split(',');
            }
        });
    }
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
    let toggle1 = { button: document.getElementById("toggle-one"), designation: "f" };
    let toggle2 = { button: document.getElementById("toggle-two"), designation: "ef" };
    let toggle3 = { button: document.getElementById("toggle-three"), designation: "ge" };
    let toggles = [toggle1, toggle2, toggle3];

    toggles.forEach(toggle => {
        toggle.button.onclick = function () {
            if (this.checked) {
                for (let i in coursesHTML)
                    if (coursesHTML[i].parentElement.classList.contains(toggle.designation))
                        coursesHTML[i].parentElement.style.display = "flex";
            } else {
                for (let i in coursesHTML)
                    if (coursesHTML[i].parentElement.classList.contains(toggle.designation))
                        coursesHTML[i].parentElement.style.display = "none";
            }
        }
    });
    // Adds event listener to specialization bottons
    for (var i = 0; i < specializations.length; i++) {
        specializations[i].addEventListener("click", accordion);
    }
    // Add event listener to tracing button
    document.getElementsByClassName("tracing")[0].addEventListener("click", executeOption);
    document.getElementsByClassName("tracing")[1].addEventListener("click", executeOption);
    // Listen to close popup or course delete
    document.getElementById("close-button").onclick = () => {
        document.getElementById("popup").style.display = "none";
        for (let i = 0; i < coursesHTML.length; i++) {
            coursesHTML[i].classList.remove("looking");
            coursesHTML[i].classList.remove("looking-prereq");
            coursesHTML[i].parentElement.classList.remove("pane-looking");
        }
    }
    document.onkeydown = e => {
        if (e.key == "Escape") {
            for (var elements of selected)
                elements.classList.remove("selected");
            selected = [];
            trash.style.display = "none";
            document.getElementById("popup").style.display = "none";

            for (let i = 0; i < coursesHTML.length; i++) {
                coursesHTML[i].classList.remove("looking");
                coursesHTML[i].classList.remove("looking-prereq");
                coursesHTML[i].parentElement.classList.remove("pane-looking");
            }
        }
        if (e.key == "Delete" || e.key == "Backspace")
            deleteCourse(null, selected);
    }
} else
    alert("This application is not supported by your browser.");

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
function executeOption() {
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
    // Array of csv row objects
    let csvObjects = await getCourses();

    // Build the courses on the main panel and in the entry log
    csvObjects.forEach(row => {
        buildEntry(row);
        if (row.designation !== null) {
            buildCourse(row);
        }
    });

    dashboardCheck();

    let targetEntry;
    let hasCourse;

    for (let entry in databaseEntries) {
        databaseEntries[entry].draggable = true;
        databaseEntries[entry].ondragstart = function () {
            middle.style.border = "4px solid #307AFF";
            targetEntry = this;
        };
        databaseEntries[entry].ondragend = function () {
            middle.style.border = "4px solid transparent";
        };
    }
    middle.ondragover = function (event) {
        for (let i in coursesHTML)
            if (targetEntry.variable.courseID == coursesHTML[i].variable.courseID)
                hasCourse = true;
        if (!hasCourse)
            this.style.border = "4px solid #FBDB2C";
        else
            this.style.border = "4px solid #FC7165";
        event.preventDefault();
    }
    middle.ondrop = function () {
        console.log(coursesHTML);
        if (!hasCourse)
            buildCourse(targetEntry.variable);
        hasCourse = false;
        if (document.getElementById("popup").style.display === "flex")
            globalClick();
    }

    // Adds selection functionality for course elements
    const selection = new Selection({
        class: 'selection-box',
        selectables: ['.course'],
        startareas: ['#interaction-area'],
        boundaries: ['#interaction-area'],
        mode: 'touch',
        disableTouch: false,
        singleClick: true
    });
    selection.on('start', ({ inst }) => {
        startX = event.pageX;
        startY = event.pageY;
        // console.log("START\nx: " + startX + ", y: " + startY);
        for (var elements of selected)
            elements.classList.remove("selected");
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
        // console.log("END\nx: " + endX + ", y: " + endY);
        inst.keepSelection();
        selected = selection.getSelection();
        if (selected.length !== 0) {
            trash.style.display = "block";
            // group();
        }
        if (selected.length !== 0)
            console.log(selected);
    });
    // Disable selection capability
    document.querySelector('#select-interact').onchange = function () {
        if (this.checked)
            selection.enable();
        else
            selection.disable();
    }
    // Delete selected courses on trash click
    trash.onclick = () => {
        trash.style.display = "none";
        deleteCourse(null, selected);
        selection.clearSelection();
        selected = [];
    };
}

/*
*
* Checks if database entry exists in middle panel
*
*/
function dashboardCheck() {
    databaseEntries.forEach(entry => {
        let found = coursesHTML.find(course => course.id === entry.variable.courseID);
        if (found)
            entry.style.background = "magenta";
        else
            entry.style.background = "royalblue";
    });
}

/*
*
* Builds the course elements
*
*/
function buildCourse(csvCourse) {
    let order;
    let section;

    if (csvCourse.designation == "freshman") {
        order = "f";
        section = fundamentals;
    } else if (csvCourse.designation == "sophomore") {
        order = "ef";
        section = engineering;
    } else if (csvCourse.designation == "junior") {
        order = "ge";
        section = gateway;
    } else if (csvCourse.designation == "senior") {
        order = "se";
        section = specialization;
    } else if (csvCourse.designation == "pharma") {
        order = "aside";
        section = pharma;
    } else if (csvCourse.designation == "microdevices") {
        order = "aside";
        section = microdevices;
    } else if (csvCourse.designation == "biosignals") {
        order = "aside";
        section = biosignals;
    } else if (csvCourse.designation == "rehabilitation") {
        order = "aside";
        section = rehabilitation;
    } else if (csvCourse.designation == "regenerative") {
        order = "aside";
        section = regenerative;
    } else {
        order = "ent"
        section = fundamentals
    }

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
    label.classList.add("labels");
    indicator.classList.add("indicators");
    red.classList.add("rect", "red");
    blue.classList.add("rect", "blue");
    // Assign features to the elements
    course.id = csvCourse.courseID;
    courseIDs.innerHTML = csvCourse.courseID.replace(/([^\d\s%])(\d)/g, '$1 $2');
    courseNames.innerHTML = csvCourse.courseName.replace(/"/g, "");
    // Place elements in respective places
    section.appendChild(item);
    item.appendChild(course);
    course.appendChild(courseIDs);
    course.appendChild(courseNames);
    course.appendChild(label);
    course.appendChild(indicator);
    if (csvCourse.isNCSU) {
        indicator.appendChild(red);
    }
    if (csvCourse.isUNC) {
        indicator.appendChild(blue);
    }
    // Assign data to element variable
    course.variable = csvCourse;
    course.isDashboard = true; // Is course in dashboard?

    // Designations
    let designations = ["pharma", "microdevices", "biosignals", "rehabilitation", "regenerative"];

    // Adds draggable ability on all course elements
    if (designations.indexOf(course.variable.designation) === -1) {
        var movable = new Draggabilly(course, { containment: '#interaction-area', grid: [10, 10] });
        var clickTime, pressTime = 0;
        var click, longPress = null;
        var x, y = 0;
        const WAIT = 500;

        movable.on('pointerDown', function () {
            // Long press functionality
            var element = this.element;
            x = this.dragPoint.x;
            y = this.dragPoint.y;
            pressTime = new Date().getTime();

            longPress = setTimeout(() => {
                element.classList.toggle("highlight");
            }, (WAIT * 2));
        }).on('pointerMove', function () {
            if (this.dragPoint.x !== 0 && this.dragPoint.y !== 0) {
                clearTimeout(longPress);
                longPress = null;
            }
        }).on('pointerUp', function () {
            if (this.dragPoint.x === x && this.dragPoint.y === y && (new Date().getTime() - pressTime) < WAIT) {
                if ((new Date().getTime() - clickTime) < WAIT) {
                    // Double click
                    deleteCourse(this.element.parentElement, null);
                    clearTimeout(click);
                    clickTime = 0;
                } else {
                    // Single click
                    for (let i = 0; i < coursesHTML.length; i++) {
                        coursesHTML[i].classList.remove("looking");
                    }
                    clickTime = new Date().getTime();
                    click = setTimeout(traceCourse, WAIT - 200, this.element);
                    globalClick = traceCourse.bind(null, this.element);
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
    } else
        course.parentElement.onclick = function () {
            traceCourse(this.firstChild);
            globalClick = traceCourse.bind(null, this.firstChild);
        }

    // Add element to array
    coursesHTML.push(course);
    coursesCSV.push(course.variable);

    dashboardCheck();
}

/*
*
* Destroys the course element
*
*/
function deleteCourse(course, selected) {
    document.getElementById("popup").style.display = "none";
    trash.style.display = "none";

    for (let i = 0; i < coursesHTML.length; i++) {
        coursesHTML[i].classList.remove("looking-prereq");
        if (coursesHTML[i].classList.contains("looking")) {
            coursesHTML[i].parentElement.remove();
            coursesHTML.splice(i, 1);
        }
    }

    if (selected !== null) {
        for (let element of selected) {
            element.parentElement.remove();
            for (let i in coursesHTML)
                if (element.id === coursesHTML[i].variable.courseID)
                    coursesHTML.splice(i, 1);
        }
    }

    if (course !== null) {
        for (let i in coursesHTML)
            if (course.firstChild.id === coursesHTML[i].variable.courseID)
                coursesHTML.splice(i, 1);
        course.remove();
    }

    dashboardCheck();
    console.log(coursesHTML);
}

/*
*
* Builds the course elements
*
*/
function buildEntry(csvCourse) {
    let order;

    if (csvCourse.designation == "freshman")
        order = "f";
    else if (csvCourse.designation == "sophomore")
        order = "ef";
    else if (csvCourse.designation == "junior")
        order = "ge";
    else if (csvCourse.designation == "senior")
        order = "se";
    else if (csvCourse.designation == "pharma")
        order = "aside";
    else if (csvCourse.designation == "microdevices")
        order = "aside";
    else if (csvCourse.designation == "biosignals")
        order = "aside";
    else if (csvCourse.designation == "rehabilitation")
        order = "aside";
    else if (csvCourse.designation == "regenerative")
        order = "aside";
    else
        order = null;

    // Create elements
    var entry = document.createElement("li");
    var courseIDs = document.createElement("span");
    var courseNames = document.createElement("span");
    var label = document.createElement("span");
    // Add classes to the elements
    entry.classList.add("database-entry");
    if (order !== null)
        entry.classList.add(order);
    courseIDs.classList.add("entry-course-ids");
    courseNames.classList.add("entry-course-names");
    label.classList.add("entry-labels")
    // Assign features to the elements
    entry.id = "entry-" + csvCourse.courseID;
    entry.variable = csvCourse;
    courseIDs.innerHTML = csvCourse.courseID.replace(/([^\d\s%])(\d)/g, '$1 $2');
    courseNames.innerHTML = csvCourse.courseName.replace(/"/g, "");
    // Place elements in respective places
    database.appendChild(entry);
    entry.appendChild(label);
    entry.appendChild(courseIDs);
    entry.appendChild(courseNames);

    entry.variable = csvCourse;
    databaseEntries.push(entry);
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
            let char = line[i];
            if (state == 0) {
                if (char == '"')
                    state = 1;
                else if (char == ',') {
                    row.push(temp.join(''));
                    temp = [];
                } else
                    temp.push(char);
            } else if (state == 1) {
                if (char == '"') {
                    if (line[i + 1] == '"') {
                        temp.push('"');
                        i++;
                    } else {
                        state = 0;
                        row.push(temp.join(''));
                        temp = [];
                        i++;
                    }
                } else if (char == '\\' && (i == 0 || (i > 0 && line[i - 1] != '\\')) && i != line.length - 1) {
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
                    temp.push(char);
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
                for (let i in row) {
                    let cell = row[i];
                    if (cell.length == 0)
                        cell = null;
                    else if (!isNaN(cell))
                        cell = Number(cell);
                    else if (cell.toLowerCase() == 'true')
                        cell = true;
                    else if (cell.toLowerCase() == 'false')
                        cell = false;
                    object[headers[i]] = cell;
                }
                objects.push(object);
            }
        }
    });
    return objects;
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
        console.log(element.variable.prereqs);
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

function filterCourse(element) {

}

/*
* Clear previous queue in summary view and all highlighted courses
*/
function clearQueue() {
    for (let i = 0; i < coursesHTML.length; i++) {
        coursesHTML[i].classList.remove("looking");
        coursesHTML[i].classList.remove("looking-prereq");
        coursesHTML[i].parentElement.classList.remove("pane-looking");
    }
    while (insertSpace.firstChild)
        insertSpace.firstChild.remove();
}

/*
* Execute the prereq chain functionality in summary view
*/
function prereqQueue(elements) {
    // initialize new buffer array
    var temp = [];
    // buffer strings
    var tempStrings = [];
    // buffer for all prereqs
    var tempCompare = [];
    // check if elements is an array
    if (Array.isArray(elements)) {
        let columnInsert = document.createElement("span");
        columnInsert.classList.add("column-insert");
        insertSpace.appendChild(columnInsert);

        for (let i in elements) {
            if (elements[i] instanceof Element && elements[i].variable.hasPrereq) {
                for (let j in elements[i].variable.prereqs) {
                    tempCompare.push(elements[i].variable.prereqs[j]);
                }
            }
        }
        console.log(tempCompare);

        // go through array of elements
        for (let i in elements) {
            let itemInsert = document.createElement("span");
            itemInsert.classList.add("item-insert");
            columnInsert.appendChild(itemInsert);

            if (!(elements[i] instanceof Element))
                itemInsert.innerHTML = elements[i].replace(/([^\d\s%])(\d)/g, '$1 $2');
            else {
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

                elements[i].classList.add("looking-prereq");

                // check if element has prereq
                if (elements[i].variable.hasPrereq) {
                    // go through prereqs and locate courses in database
                    for (let j in elements[i].variable.prereqs) {
                        for (let k in coursesHTML) {
                            // place course in buffer
                            if (coursesHTML[k].variable.courseID === elements[i].variable.prereqs[j]) {
                                temp.push(coursesHTML[k]);
                                tempStrings.push(coursesHTML[k].variable.courseID);
                            }
                        }
                    }

                    let diff = elements[i].variable.prereqs.filter(prereqString => !tempStrings.includes(prereqString));
                    temp = [...temp, ...diff];
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
        if (elements.parentElement.classList.contains("aside"))
            elements.parentElement.classList.add("pane-looking");
        else
            elements.classList.add("looking");

        // check if given has prereq
        if (elements.variable.hasPrereq) {
            let columnInsert = document.createElement("span");
            columnInsert.classList.add("column-insert");
            insertSpace.appendChild(columnInsert);

            let itemInsert = document.createElement("span");
            itemInsert.classList.add("item-insert");
            columnInsert.appendChild(itemInsert);

            itemInsert.innerHTML = elements.variable.courseID.replace(/([^\d\s%])(\d)/g, '$1 $2');

            for (let i in elements.variable.prereqs) {
                for (let j in coursesHTML) {
                    // place course in buffer
                    if (coursesHTML[j].variable.courseID === elements.variable.prereqs[i]) {
                        temp.push(coursesHTML[j]);
                        tempStrings.push(coursesHTML[j].variable.courseID);
                    }
                }
            }

            let diff = elements.variable.prereqs.filter(prereqString => !tempStrings.includes(prereqString));
            temp = [...temp, ...diff];
            prereqQueue(temp);
        }
    }
}

/*
* Populate the popup summary view with course data
*/
function buildPopup(element) {
    let prereqButton = document.getElementById("prereq-button");
    let filterButton = document.getElementById("filter-button");
    let prereqPane = document.getElementById("prereq-action-pane");
    let filterPane = document.getElementById("filter-action-pane");

    if (!element.hasPrereq) {
        prereqButton.classList.remove("active");
        filterButton.classList.add("active");
        prereqPane.classList.remove("show");
        filterPane.classList.add("show");
        prereqButton.removeEventListener("click", executeOption);
        filterButton.removeEventListener("click", executeOption);
    } else {
        prereqButton.classList.add("active");
        filterButton.classList.remove("active");
        prereqPane.classList.add("show");
        filterPane.classList.remove("show");
        prereqButton.addEventListener("click", executeOption);
        filterButton.addEventListener("click", executeOption);
    }

    document.getElementById("popup").style.display = "flex";

    document.getElementById("course-name").innerHTML = element.courseName.replace(/"/g, "");

    if (element.hours == null) {
        document.getElementById("bubble").innerHTML = "?";
    } else {
        document.getElementById("bubble").innerHTML = element.hours;
    }

    if (element.isNCSU && !element.isUNC) {
        document.getElementById("offering").innerHTML = "<i>This course is offered at NC State.</i>";
    } else if (!element.isNCSU && element.isUNC) {
        document.getElementById("offering").innerHTML = "<i>This course is offered at UNC.</i>";
    } else {
        document.getElementById("offering").innerHTML = "<i>This course is offered on both campuses.</i>";
    }

    document.getElementById("description").innerHTML = element.description;
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