// Shared JavaScript functionality for Christopher Lam's website

// Timer functionality
function initializeTimer() {
    const timeElement = document.getElementById("time");
    if (!timeElement) return;

    let date = new Date();
    let time = date.toLocaleTimeString("en-US", {
        timeZone: "America/Los_Angeles",
    });
    timeElement.innerHTML = time;

    let updateTimer = true;

    setInterval(function() {
        if (!updateTimer) {
            return;
        }
        date = new Date();
        let time = date.toLocaleTimeString("en-US", {
            timeZone: "America/Los_Angeles",
        });
        timeElement.innerHTML = time.split(" ")[0] + "." + date.getMilliseconds().toString().slice(0, 2);
    }, 1);

    function pauseTimer() {
        updateTimer = false;
        setTimeout(function() {
            updateTimer = true;
        }, 1500);
    }

    setTimeout(function() {
        pauseTimer();
        setInterval(function() {
            pauseTimer();
        }, 60000);
    }, 60000 - date.getSeconds() * 1000 - date.getMilliseconds() - 1500);
}

// Image flip functionality
function initializeFlipImages() {
    const images = document.getElementsByClassName("flip");

    for (let i = 0; i < images.length; i++) {
        images[i].addEventListener("mousedown", function() {
            const imageList = this.getAttribute("data-image_list").split(", ");
            const currentImage = this.getAttribute("src");
            const nextImage = imageList[(imageList.indexOf(currentImage) + 1) % imageList.length];
            this.setAttribute("src", nextImage);
        });
    }
}

// Project list sorting functionality
function initializeProjectSorting() {
    const projectList = document.getElementById("projectList");
    if (!projectList) return;

    const projects = Array.from(projectList.querySelectorAll("a[data-date]"));

    // Sort projects by data-date attribute
    projects.sort((a, b) => {
        const dateA = new Date(a.getAttribute("data-date"));
        const dateB = new Date(b.getAttribute("data-date"));
        return dateB - dateA; // Descending order (newest first)
    });

    // Append sorted projects with formatted dates
    projects.forEach(project => {
        const projectDate = new Date(project.getAttribute("data-date"));
        const formattedDate = projectDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

        // Add the date next to the project name
        project.innerHTML += ` <span style="color: gray; font-size: 0.9em;">(${formattedDate})</span>`;
        projectList.appendChild(project);
    });
}

// Writings list sorting functionality
function initializeWritingsSorting() {
    const writingsList = document.getElementById("writings");
    if (!writingsList) return;

    const writings = Array.from(writingsList.querySelectorAll("a[data-date]"));

    // Sort writings by data-date attribute
    writings.sort((a, b) => {
        const dateA = new Date(a.getAttribute("data-date"));
        const dateB = new Date(b.getAttribute("data-date"));
        return dateB - dateA; // Descending order (newest first)
    });

    // Append sorted writings with formatted dates
    writings.forEach(writing => {
        const writingDate = new Date(writing.getAttribute("data-date"));
        const formattedDate = writingDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

        // Add the date next to the writing name
        writing.innerHTML += ` <span style="color: gray; font-size: 0.9em;">(${formattedDate})</span>`;
        writingsList.appendChild(writing);
    });
}

// Initialize all functionality when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    initializeTimer();
    initializeFlipImages();
    initializeProjectSorting();
    initializeWritingsSorting();
});
