// Shared JavaScript functionality for Christopher Lam's website

// Respect the user's motion preference — gates the split-flap animation
// on the projects list, and (by design) its accompanying thunk sound.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Stagger-timeout bookkeeping for the projects list's filter-triggered
// reveals, so a rapid new filter click can cancel whatever the previous
// click hadn't finished animating yet.
let pendingFlapTimeouts = [];

function clearPendingFlaps() {
    pendingFlapTimeouts.forEach(id => clearTimeout(id));
    pendingFlapTimeouts = [];
}

// Flips `el` in after `delayMs`. `reveal` un-hides a filtered-out row in the
// same tick the animation class is added, so it never has a visible frame
// before the flip starts. `sound` plays a thunk alongside the flip.
function scheduleFlapIn(el, delayMs, { reveal = false, sound = false, flapSound = null } = {}) {
    const id = setTimeout(() => {
        if (reveal) el.classList.remove("filtered-out");
        el.classList.remove("flap-in");
        void el.offsetWidth; // force reflow so a retriggered animation restarts cleanly
        el.classList.add("flap-in");
        if (sound && flapSound) flapSound.playThunk();
    }, delayMs);
    pendingFlapTimeouts.push(id);
}

// Hides `el` (triggering the existing filtered-out fade) after `delayMs`,
// with a "lift" sound alongside it — the counterpart to scheduleFlapIn.
function scheduleFlapOut(el, delayMs, { sound = false, flapSound = null } = {}) {
    const id = setTimeout(() => {
        el.classList.remove("flap-in");
        el.classList.add("filtered-out");
        if (sound && flapSound) flapSound.playLift();
    }, delayMs);
    pendingFlapTimeouts.push(id);
}

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
        previewImg.setAttribute("src", link ? link.getAttribute("data-preview") : defaultSrc);
    });

    grid.addEventListener("mouseleave", function() {
        previewImg.setAttribute("src", defaultSrc);
    });
}

// Synthesized "thunk" for the projects-list flip effect — no audio assets.
// The AudioContext is created lazily on the first call, which must happen
// inside a real user gesture (a filter-button click) to satisfy browser
// autoplay policy.
function initializeFlapSound() {
    let audioCtx = null;
    let masterBus = null;
    let noiseBuffer = null;

    function ensureContext() {
        if (audioCtx) return audioCtx;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;

        audioCtx = new AudioContextClass();

        // A compressor acts as a gain ceiling: several staggered thunks
        // overlapping during a fast filter cascade get tamed automatically
        // instead of summing into something loud.
        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-30, audioCtx.currentTime);
        compressor.knee.setValueAtTime(12, audioCtx.currentTime);
        compressor.ratio.setValueAtTime(14, audioCtx.currentTime);
        compressor.attack.setValueAtTime(0.001, audioCtx.currentTime);
        compressor.release.setValueAtTime(0.15, audioCtx.currentTime);

        // Dulls the whole voice — keeps the wood-knock resonances below from
        // ever reading as bright/clacky.
        const masterLowpass = audioCtx.createBiquadFilter();
        masterLowpass.type = "lowpass";
        masterLowpass.frequency.setValueAtTime(1800, audioCtx.currentTime);

        const outputGain = audioCtx.createGain();
        outputGain.gain.setValueAtTime(0.55, audioCtx.currentTime); // muted/dulled by design, nudged up slightly

        compressor.connect(masterLowpass).connect(outputGain).connect(audioCtx.destination);
        masterBus = compressor;

        return audioCtx;
    }

    function getNoiseBuffer(ctx) {
        if (noiseBuffer) return noiseBuffer;
        const duration = 0.12;
        const frameCount = Math.floor(ctx.sampleRate * duration);
        noiseBuffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return noiseBuffer;
    }

    function playThunk() {
        if (prefersReducedMotion) return;

        const ctx = ensureContext();
        if (!ctx) return; // no Web Audio support: silent no-op
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const jitter = () => 0.95 + Math.random() * 0.1; // +/-5% per hit so a cascade doesn't sound robotic

        // The settle of a small solid object landing: a sine pitched
        // quickly downward (the same trick a kick drum uses) rather than a
        // resonant/bandpassed tone — a fixed pitch rings and reads as a
        // struck object (wood block, bell), while a falling pitch reads as
        // mass coming to rest with no ring or rattle.
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(210 * jitter(), now);
        osc.frequency.exponentialRampToValueAtTime(70 * jitter(), now + 0.05);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.5, now + 0.004);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(oscGain).connect(masterBus);
        osc.start(now);
        osc.stop(now + 0.08);

        // A very brief, heavily muffled noise tick right at the onset —
        // the moment of contact — with a wide/undamped lowpass (low Q) so
        // it adds texture without ringing at any particular pitch.
        const noise = ctx.createBufferSource();
        noise.buffer = getNoiseBuffer(ctx);

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(500 * jitter(), now);
        lowpass.Q.setValueAtTime(0.3, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.2, now + 0.001);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        noise.connect(lowpass).connect(noiseGain).connect(masterBus);
        noise.start(now);
        noise.stop(now + 0.03);
    }

    // The counterpart to playThunk, for rows leaving the list: pitch rises
    // instead of falling, and it's quieter/shorter — reads as something
    // small lifting away rather than a solid object landing.
    function playLift() {
        if (prefersReducedMotion) return;

        const ctx = ensureContext();
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const jitter = () => 0.95 + Math.random() * 0.1;

        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(90 * jitter(), now);
        osc.frequency.exponentialRampToValueAtTime(260 * jitter(), now + 0.04);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.28, now + 0.003);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(oscGain).connect(masterBus);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    return { playThunk, playLift };
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
function initializeProjectFilters(flapSound) {
    const projectList = document.getElementById("projectList");
    if (!projectList) return;

    const FILTER_FLAP_STAGGER_MS = 50;
    const HIDE_TO_REVEAL_PAUSE_MS = 180; // beat of silence between the leave cascade and the populate cascade

    const categoryButtons = document.querySelectorAll("#categoryFilters .filter-btn");
    const yearButtons = document.querySelectorAll("#yearFilters .year-btn");
    const filterCount = document.getElementById("filterCount");

    // Default to whichever buttons are marked active in the HTML
    const activeCategoryBtn = document.querySelector("#categoryFilters .filter-btn.active");
    const activeYearBtn = document.querySelector("#yearFilters .year-btn.active");
    let activeCategory = activeCategoryBtn ? activeCategoryBtn.getAttribute("data-filter") : "all";
    let activeYear = activeYearBtn ? activeYearBtn.getAttribute("data-year") : "all";

    // `isInitial` is true only for the one-time call that establishes the
    // default filter state on page load — that call must apply filtered-out
    // instantly with no stagger/sound, since every row looks "previously
    // visible" (no classes have been touched yet) and would otherwise flip
    // and thunk/lift on load, which is not a real user gesture.
    function updateFilters(isInitial = false) {
        const projects = Array.from(projectList.querySelectorAll("a[data-date]"));
        let visibleCount = 0;
        let totalCount = projects.length;

        const toReveal = [];
        const toHide = [];

        projects.forEach(project => {
            const categories = (project.getAttribute("data-categories") || "").split(",");
            const year = project.getAttribute("data-year");

            let categoryMatch = activeCategory === "all" || categories.includes(activeCategory);
            let yearMatch = activeYear === "all" || year === activeYear;
            const shouldShow = categoryMatch && yearMatch;
            const wasHidden = project.classList.contains("filtered-out");

            if (shouldShow) {
                visibleCount++;
                if (wasHidden && !isInitial && !prefersReducedMotion) {
                    toReveal.push(project);
                } else {
                    project.classList.remove("filtered-out");
                }
            } else if (!wasHidden && !isInitial && !prefersReducedMotion) {
                toHide.push(project);
            } else {
                project.classList.remove("flap-in");
                project.classList.add("filtered-out");
            }
        });

        // Leaving rows always cascade first, then newly-revealed rows start
        // after a brief pause — a single filter change never plays a
        // "populate" thunk before every "leave" lift has started, and the
        // pause keeps the handoff from sounding like one surprised jumble.
        toHide.forEach((project, index) => {
            scheduleFlapOut(project, index * FILTER_FLAP_STAGGER_MS, {
                sound: true,
                flapSound,
            });
        });
        const revealBaseDelay = toHide.length > 0
            ? toHide.length * FILTER_FLAP_STAGGER_MS + HIDE_TO_REVEAL_PAUSE_MS
            : 0;
        toReveal.forEach((project, index) => {
            scheduleFlapIn(project, revealBaseDelay + index * FILTER_FLAP_STAGGER_MS, {
                reveal: true,
                sound: true,
                flapSound,
            });
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
            clearPendingFlaps();
            updateFilters();
        });
    });

    // Year filter handlers
    yearButtons.forEach(button => {
        button.addEventListener("click", function() {
            yearButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            activeYear = this.getAttribute("data-year");
            clearPendingFlaps();
            updateFilters();
        });
    });

    // Initialize count
    updateFilters(true);
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
    const flapSound = initializeFlapSound();
    initializeProjectFilters(flapSound);
});
