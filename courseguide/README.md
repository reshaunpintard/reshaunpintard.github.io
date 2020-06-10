# CourseGuide

## INTRO

This project is designed for the joint **NCSU & UNC Biomedical Engineering program**
to assist undergraduate students in course planning. This documentation serves as an instruction manual for administrative use. Some guidelines and also standard use-case functionalities of the app.

## Administrator Instruction

This app was developed around administrators having no need to understand or program. If there are changes to be made however, there will also be a simple outline of how to make some changes very easily with **HTML/CSS**. Changes to the complimenting Excel file (explained in **#Excel Spreadsheets**) can also change the web app in certain ways too.

### # Making Page Changes

The following are some example HTML/CSS changes:

- Adding courses to the app.
  - There may be limited space depending on screen resolution.
- Removing courses from the app.

### HTML

To edit HTML files you need code editor software or a standard text editor. To view HTML files, you can right click it and open it as [Browser] or drag the file into a browser.

- In **CourseGuide.html** a section of the page looks like this:

```html
<section class="sections" id="fundamentals">
</section>
```

- In a section of the page, an individual course item looks like this:

```html
<div class="f item">
    <span class="course" id="ma141">
        <span class="course-ids"></span>
        <span class="course-names"></span>
    </span>
</div>
```

The whole block of code for a course item can be deleted to remove page elements, or copied and pasted to include page elements. You can test the limitations of how many duplicates you can make before things start looking weird by simply copying and pasting, and looking at the results in a browser.

The web format of this app is not meant to squeeze or alter dimensions of the elements dynamically, so any other arrangements would require an update.

- To change the course reflected in an element, you must change the id tag. *i.e. `id="ma141"` to `id="py208"`*

### # File Structure

The given file structure for this project is imperative for the whole program to work properly. **Files should not be deleted, moved or renamed**. Below is the ideal file structure for the single page application:

```
~ CourseGuide
|   |
|   + README.md
|   |
|   + CourseGuide.html
|   |
|   + courses.csv
|   |
|   + assets
|   |   |
|   |   + style
|   |   |   |
|   |   |   + style.css
|   |   + scripts
|   |   |   |
|   |   |   + CourseGuide.js
|   |
|   + .git
```

It is safe to assume that files that aren't listed in the above directory aren't important.

### # Excel Spreadsheets

The most important part of this project is the course list that makes it run and execute tasks. It is expected that administrators have the capabilities to follow the the syntax established in the ***courses.csv*** file.

> A CSV file is a file format of comma-separated values. It is like a flattened version of an excel file (.xlsx). To create one, all that is required that you save/export the file as a CSV from Google Sheets or Microsoft Excel.

The ***courses.csv*** is provided in this project but over time it is expected that administrative changes will occur as courses in the catalog are swapped around, added, or removed.

The established syntax and customs for the ***courses.csv*** file are based on 10 different column headers. The **headers** (the first row of items) **must NEVER be changed or altered**. Each **row** subsequent to the headers all represent courses, and the contents (*column data*) of these courses (*individual rows*) must coincide with the label (*the header cell of the respective column*). Here is a brief glossary of how the data should be organized:

| Syntax | Type | Description |
| ------ | ---- | ----------- |
| ***courseID*** | *string* | The course's ID *i.e. ma141 or math231*. There must be no spaces and the letters must be lowercase. |
| ***courseName*** | *string* | The course's full name should be entered. It doesn't matter is there are spaces, commas, quotations, it can be entered just the way it is in the course catalog. |
| ***hours*** | *int* | The number of credit hours for the course must be added here. |
| ***hasPrereq*** | *boolean* | If the course has prerequisites, simply type TRUE. If not, type FALSE. |
| ***hasVarPrereq*** | *boolean* | Meaning variant prerequisites. This should be TRUE if the course has co-requisites **OR** prerequisites that can count as alternatives to the typical prerequisites. FALSE if not. |
| ***prereqs*** | *string[ ]* | This is a list of the prerequisites. To enter data in these cells, you will be making a list of courses following the same technique you used in ***courseID***. The courses must all be separated by a comma *i.e. ma241, py205*. If no courses exist, leave blank. |
| ***varPrereqs*** | *string[ ]* | This is just like ***prereqs*** but it includes only co-requisites, or alternative courses that can also be used as prerequisites. If no courses exist, leave blank. |
| ***description*** | *string* | This is a cell where you can enter a full description of the course. |
| ***isNCSU*** | *boolean* | Enter TRUE if the course in question is offered at NC State. False if not. |
| ***isUNC*** | *boolean* | Enter TRUE if the course is offered at UNC. False if not. |

### TIPS

- You can save the given CSV file as an XLSX file using any spreadsheet software.
- You don't need the file to be in excel format to edit it. You can also open CSV files in microsoft excel or google spreadsheets.
- The file can potential weigh in over hundreds of rows of data. To make your task easier, you can have the spreadsheet software *FREEZE* the first row so you can always see if you are entering data in the right spot. (Google how to do this on your platform of choice)
- If the data becomes too hard to see, you can automatically align all rows and columns to adjust their widths and heights to make everything visible. (Also google how to do this)
- If you've made errors to the **courses.csv** file, you can always download a new backed up one from this repository.
- If permanent, substantial changes are made to the **courses.csv** you should consult someone about updating the file on this repository.
- You can alphebatize data by column to keep spreadsheets neat.

### # Warnings ⚠️  ⚠️

- Changes to this repository should not be executed unless consulted by a professional.
