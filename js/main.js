// Shared JavaScript functionality for Christopher Lam's website

// Timer functionality — mimics Swiss railway clock: freeze display for last 2s of each minute
function initializeTimer() {
    const timeElement = document.getElementById("time");
    if (!timeElement) return;

    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    function tick() {
        const now = new Date();
        const elapsed = now.getSeconds() + now.getMilliseconds() / 1000;

        if (elapsed < 58) {
            const parts = formatter.formatToParts(now);
            const h = parts.find(p => p.type === "hour").value;
            const m = parts.find(p => p.type === "minute").value;
            const s = parts.find(p => p.type === "second").value;
            const cs = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, "0");
            timeElement.innerHTML = `${h}:${m}:${s}.${cs}`;
        }

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
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

// On phones, point "home" links at the mobile homepage so the blog
// (the only desktop-chrome pages reachable on mobile) navigates natively.
function initializeMobileHome() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;

    document.querySelectorAll('a[href="/index.html"]').forEach(link => {
        link.setAttribute("href", "/index_mobile.html");
    });
}

// Project preview-on-hover functionality
function initializeProjectPreview() {
    const previewImg = document.querySelector("#preview img");
    const grid = document.getElementById("image_grid");
    if (!previewImg || !grid) return;

    // Remember the default image so we can restore it on mouse-out
    const defaultSrc = previewImg.getAttribute("src");

    // Delegated on the whole grid so both the archive list and the
    // "Currently" block drive the preview image on hover.
    grid.addEventListener("mouseover", function(event) {
        const link = event.target.closest("a[data-preview]");
        if (!link) return;
        previewImg.setAttribute("src", link.getAttribute("data-preview"));
    });

    grid.addEventListener("mouseleave", function() {
        previewImg.setAttribute("src", defaultSrc);
    });
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

// Log list sorting functionality
function initializeLogSorting() {
    const logList = document.getElementById("log");
    if (!logList) return;

    const entries = Array.from(logList.querySelectorAll("a[data-date]"));

    // Sort entries by data-date attribute (newest first)
    entries.sort((a, b) => {
        const dateA = new Date(a.getAttribute("data-date"));
        const dateB = new Date(b.getAttribute("data-date"));
        return dateB - dateA;
    });

    // Append sorted entries with formatted dates
    entries.forEach(entry => {
        const entryDate = new Date(entry.getAttribute("data-date"));
        const formattedDate = entryDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

        entry.innerHTML += ` <span style="color: gray; font-size: 0.9em;">(${formattedDate})</span>`;
        logList.appendChild(entry);
    });
}

// Project filtering functionality
function initializeProjectFilters() {
    const projectList = document.getElementById("projectList");
    if (!projectList) return;

    const categoryButtons = document.querySelectorAll("#categoryFilters .filter-btn");
    const yearButtons = document.querySelectorAll("#yearFilters .year-btn");
    const filterCount = document.getElementById("filterCount");

    // Default to whichever buttons are marked active in the HTML
    const activeCategoryBtn = document.querySelector("#categoryFilters .filter-btn.active");
    const activeYearBtn = document.querySelector("#yearFilters .year-btn.active");
    let activeCategory = activeCategoryBtn ? activeCategoryBtn.getAttribute("data-filter") : "all";
    let activeYear = activeYearBtn ? activeYearBtn.getAttribute("data-year") : "all";

    function updateFilters() {
        const projects = projectList.querySelectorAll("a[data-date]");
        let visibleCount = 0;
        let totalCount = projects.length;

        projects.forEach(project => {
            const categories = (project.getAttribute("data-categories") || "").split(",");
            const year = project.getAttribute("data-year");

            let categoryMatch = activeCategory === "all" || categories.includes(activeCategory);
            let yearMatch = activeYear === "all" || year === activeYear;

            if (categoryMatch && yearMatch) {
                project.classList.remove("filtered-out");
                visibleCount++;
            } else {
                project.classList.add("filtered-out");
            }
        });

        // Update count display
        if (activeCategory === "all" && activeYear === "all") {
            filterCount.textContent = `showing all ${totalCount} projects`;
        } else {
            filterCount.textContent = `showing ${visibleCount} of ${totalCount} projects`;
        }
    }

    // Category filter handlers
    categoryButtons.forEach(button => {
        button.addEventListener("click", function() {
            categoryButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            activeCategory = this.getAttribute("data-filter");
            updateFilters();
        });
    });

    // Year filter handlers
    yearButtons.forEach(button => {
        button.addEventListener("click", function() {
            yearButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            activeYear = this.getAttribute("data-year");
            updateFilters();
        });
    });

    // Initialize count
    updateFilters();
}

// Initialize all functionality when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    initializeMobileHome();
    initializeTimer();
    initializeFlipImages();
    initializeProjectPreview();
    initializeProjectSorting();
    initializeWritingsSorting();
    initializeLogSorting();
    initializeProjectFilters();
});
