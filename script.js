"use strict";

/* =====================================================
   01. GLOBAL UTILITIES
===================================================== */

const root = document.documentElement;

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

const motion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);


/* =====================================================
   02. RESPONSIVE NAVIGATION
===================================================== */

function initNavigation() {

    const button = $("#menuToggle");
    const nav = $("#navigation");

    const mobile = window.matchMedia(
        "(max-width: 760px)"
    );

    const setOpen = (open, returnFocus = false) => {

        nav.classList.toggle("open", open);

        button.setAttribute(
            "aria-expanded",
            String(open)
        );

        button.setAttribute(
            "aria-label",
            open
                ? "Close navigation"
                : "Open navigation"
        );

        if (returnFocus) {
            button.focus();
        }

    };


    // Toggle hamburger menu

    button.addEventListener("click", () => {

        setOpen(
            button.getAttribute("aria-expanded") !== "true"
        );

    });


    // Close menu after selecting a section

    $$("a", nav).forEach(link => {

        link.addEventListener("click", () => {

            setOpen(false);

        });

    });


    // Close menu using Escape

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            button.getAttribute("aria-expanded") === "true"
        ) {

            setOpen(false, true);

        }

    });


    // Close menu when clicking outside

    document.addEventListener("click", event => {

        if (
            button.getAttribute("aria-expanded") === "true" &&
            !nav.contains(event.target) &&
            !button.contains(event.target)
        ) {

            setOpen(false);

        }

    });


    // Reset navigation when changing screen sizes

    const resetMenu = () => setOpen(false);

    if (mobile.addEventListener) {

        mobile.addEventListener(
            "change",
            resetMenu
        );

    } else {

        mobile.addListener(resetMenu);

    }

}


/* =====================================================
   03. SCROLL PROGRESS AND ACTIVE NAVIGATION
===================================================== */

function initScrollState() {

    const progress = $(".scroll-progress");

    const links = $$("#navigation a");

    const sections = links
        .map(link => $(link.getAttribute("href")))
        .filter(Boolean);

    let frame = 0;
    let active = "";


    const paint = () => {

        frame = 0;

        const max = Math.max(
            1,
            root.scrollHeight - window.innerHeight
        );


        // Update progress bar

        const percentage = Math.min(
            1,
            Math.max(0, window.scrollY / max)
        );

        progress.style.transform =
            `scaleX(${percentage})`;


        // Determine currently visible section

        let current = "";

        const marker = Math.min(
            220,
            window.innerHeight * .33
        );

        for (const section of sections) {

            if (
                section.getBoundingClientRect().top <= marker
            ) {

                current = section.id;

            }

        }


        // Highlight contact at the bottom

        if (
            window.scrollY > 0 &&
            max - window.scrollY < 4
        ) {

            current = "contact";

        }


        // Only update when the active section changes

        if (active !== current) {

            active = current;

            links.forEach(link => {

                if (link.hash === `#${current}`) {

                    link.setAttribute(
                        "aria-current",
                        "location"
                    );

                } else {

                    link.removeAttribute("aria-current");

                }

            });

        }

    };


    // Limit scroll updates to one per animation frame

    const schedule = () => {

        if (!frame) {

            frame = requestAnimationFrame(paint);

        }

    };


    window.addEventListener(
        "scroll",
        schedule,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        schedule,
        { passive: true }
    );

    window.addEventListener(
        "load",
        schedule,
        { once: true }
    );


    // Update progress when case studies expand

    document.addEventListener(
        "toggle",
        schedule,
        true
    );


    if ("ResizeObserver" in window) {

        new ResizeObserver(schedule)
            .observe(document.body);

    }

    paint();

}


/* =====================================================
   04. SCROLL REVEAL ANIMATIONS
===================================================== */

function initMotion() {

    if (motion.matches) {
        return;
    }

    root.classList.add("motion-ready");


    // Content remains visible in unsupported browsers

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const running = new Set();


    const observer = new IntersectionObserver(

        entries => {

            for (const entry of entries) {

                if (!entry.isIntersecting) {
                    continue;
                }


                // Section entrance animation runs once

                observer.unobserve(entry.target);


                if (
                    motion.matches ||
                    root.classList.contains("motion-paused")
                ) {

                    continue;

                }

                const target = entry.target;


                if (
                    target.getBoundingClientRect().top > 0 &&
                    typeof target.animate === "function"
                ) {

                    const animation = target.animate(

                        [
                            {
                                opacity: .15,
                                transform: "translateY(18px)"
                            },

                            {
                                opacity: 1,
                                transform: "translateY(0)"
                            }
                        ],

                        {
                            duration: 600,

                            easing:
                                "cubic-bezier(.22,1,.36,1)"
                        }

                    );

                    running.add(animation);

                    animation.onfinish =
                    animation.oncancel =
                        () => running.delete(animation);

                }

            }

        },

        {
            threshold: 0,
            rootMargin: "0px 0px -35px 0px"
        }

    );


    $$("[data-reveal]").forEach(element => {

        observer.observe(element);

    });


    // Respect system accessibility preferences

    const onMotionChange = () => {

        if (motion.matches) {

            observer.disconnect();

            running.forEach(animation => {

                animation.cancel();

            });

            root.classList.remove("motion-ready");

        }

    };


    if (motion.addEventListener) {

        motion.addEventListener(
            "change",
            onMotionChange
        );

    } else {

        motion.addListener(onMotionChange);

    }

}


/* =====================================================
   05. CONTACT AND COPY EMAIL
===================================================== */

function initContact() {

    const button = $("#copyEmail");
    const status = $("#copyStatus");

    const email = "trushantrathod@gmail.com";

    let resetTimer;


    button.addEventListener("click", async () => {

        let copied = false;


        // Modern Clipboard API

        try {

            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {

                await navigator.clipboard.writeText(email);

                copied = true;

            }

        } catch (error) {

            // Continue with fallback

        }


        // Fallback for older browsers

        if (!copied) {

            const field =
                document.createElement("textarea");

            field.value = email;

            field.setAttribute("readonly", "");

            field.style.cssText = `
                position: fixed;
                left: 0;
                top: 0;
                opacity: 0;
                pointer-events: none;
            `;

            document.body.appendChild(field);

            field.select();

            try {

                copied =
                    document.execCommand("copy");

            } catch (error) {}

            field.remove();

            button.focus();

        }


        // Update button feedback

        button.textContent =
            copied
                ? "Copied!"
                : "Select email";


        status.textContent =
            copied
                ? "Email address copied."
                : "Clipboard unavailable. Select the email address manually.";


        // Manual selection fallback

        if (!copied && window.getSelection) {

            const range = document.createRange();

            range.selectNodeContents(
                $(".email-line strong")
            );

            const selection =
                window.getSelection();

            selection.removeAllRanges();

            selection.addRange(range);

        }


        // Restore original button text

        clearTimeout(resetTimer);

        resetTimer = setTimeout(() => {

            button.textContent = "Copy";

        }, 2400);

    });

}


/* =====================================================
   06. CONTINUOUS BACKGROUND ANIMATION ENGINE

   One shared animation loop for:

   - Moving particles
   - Scroll velocity
   - Background parallax
   - Smooth cursor tracking
   - Cursor lighting
   - Rotating engineering interests

   Desktop: approximately 60 FPS maximum
   Mobile: approximately 30 FPS maximum
===================================================== */

function initAmbient() {

    const canvas = $("#starfield");

    const ctx = canvas.getContext("2d");

    const ring = $("#cursorRing");

    const glow = $("#cursorGlow");

    const grid = $(".ambient-grid");

    const ambientGlow = $(".ambient-glow");

    const role = $("#rotatingRole");


    const fine = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    );


    // Rotating text

    const roles = [

        "Full-stack systems",

        "Applied AI",

        "Backend engineering",

        "Problem solving"

    ];


    // Animation state

    let paused = motion.matches;

    let raf = 0;

    let last = 0;

    let elapsed = 0;

    let roleIndex = 0;


    // Canvas state

    let width = 0;

    let height = 0;

    let stars = [];


    // Scroll state

    let scroll = window.scrollY;

    let smoothScroll = scroll;

    let velocity = 0;


    // Cursor state

    let x = 0;

    let y = 0;

    let cursorX = 0;

    let cursorY = 0;

    let pointerSeen = false;


    /* -------------------------------------------------
       UTILITY FUNCTIONS
    ------------------------------------------------- */

    const wrap = (number, max) => {

        return (
            (number % max) + max
        ) % max;

    };


    // Seeded particle generator

    const rand = (() => {

        let seed = 83;

        return () => {

            seed =
                (seed * 16807) % 2147483647;

            return seed / 2147483647;

        };

    })();


    /* -------------------------------------------------
       RESPONSIVE CANVAS RESIZING
    ------------------------------------------------- */

    function resize() {

        width = window.innerWidth;

        height = window.innerHeight;


        /*
            Limit the canvas pixel count.

            This prevents expensive rendering on
            high-resolution and mobile displays.
        */

        const ratio = Math.min(

            window.devicePixelRatio || 1,

            1.6,

            Math.sqrt(
                3000000 /
                Math.max(1, width * height)
            )

        );


        canvas.width =
            Math.round(width * ratio);

        canvas.height =
            Math.round(height * ratio);


        if (ctx) {

            ctx.setTransform(
                ratio,
                0,
                0,
                ratio,
                0,
                0
            );

        }


        // Reduce particle count on mobile

        const amount =
            width < 760

                ? 70

                : Math.min(
                    190,
                    Math.round(width / 7)
                );


        // Generate individual star depths

        stars = Array.from(

            { length: amount },

            () => ({

                x: rand(),

                y: rand(),

                depth: .15 + rand() * .85,

                phase: rand() * Math.PI * 2

            })

        );


        if (paused || document.hidden) {

            draw();

        }

    }


    /* -------------------------------------------------
       DRAW STARFIELD
    ------------------------------------------------- */

    function draw() {

        if (!ctx || !width || !height) {

            return;

        }


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        for (const star of stars) {

            const depth = star.depth;


            // Natural horizontal movement

            const horizontalMotion =

                Math.sin(
                    elapsed * .00022 + star.phase
                ) * 14 * depth;


            // Mouse-controlled depth movement

            const pointerX =

                pointerSeen

                    ? (
                        cursorX - width / 2
                    ) * .035 * depth

                    : 0;


            const pointerY =

                pointerSeen

                    ? (
                        cursorY - height / 2
                    ) * .035 * depth

                    : 0;


            // Particle positions

            const px = wrap(

                star.x * width +

                horizontalMotion +

                pointerX,

                width

            );


            const py = wrap(

                star.y * height +

                elapsed * .009 * depth -

                smoothScroll * .23 * depth +

                pointerY,

                height

            );


            // Subtle individual particle twinkling

            const alpha =

                (.19 + depth * .55) *

                (
                    .86 +

                    .14 * Math.sin(
                        elapsed * .0015 +
                        star.phase
                    )
                );


            // Scroll velocity creates particle trails

            const length =

                Math.min(
                    22,
                    Math.abs(velocity) * .9
                ) * depth;


            ctx.strokeStyle =

                `rgba(141,210,224,${alpha * .65})`;


            ctx.fillStyle =

                `rgba(184,226,239,${alpha})`;


            /* Draw scroll trail */

            if (length > 1 && !paused) {

                ctx.lineWidth =
                    .75 + depth * .65;

                ctx.beginPath();

                ctx.moveTo(px, py);

                ctx.lineTo(

                    px,

                    py +
                    Math.sign(velocity) * length

                );

                ctx.stroke();

            }


            /* Draw star */

            ctx.beginPath();

            ctx.arc(

                px,

                py,

                .45 + depth * .9,

                0,

                Math.PI * 2

            );

            ctx.fill();

        }

    }


    /* -------------------------------------------------
       MAIN ANIMATION LOOP
    ------------------------------------------------- */

    function tick(now) {

        raf = 0;


        if (paused || document.hidden) {

            return;

        }


        // Frame-rate limiting

        const frameInterval =

            width < 760 || !fine.matches

                ? 1000 / 30

                : 1000 / 60;


        if (
            last &&
            now - last < frameInterval - 1
        ) {

            raf = requestAnimationFrame(tick);

            return;

        }


        // Prevent jumps when returning to the tab

        const dt =

            last

                ? Math.min(60, now - last)

                : 16;


        last = now;

        elapsed += dt;


        // Frame-independent exponential smoothing

        const blend =

            1 - Math.exp(-dt / 95);


        /* ---------------------------------------------
           SCROLL VELOCITY
        --------------------------------------------- */

        const previousScroll = smoothScroll;


        smoothScroll +=

            (scroll - smoothScroll) * blend;


        velocity +=

            (
                (smoothScroll - previousScroll) -

                velocity

            ) * .18;


        /* ---------------------------------------------
           BACKGROUND PARALLAX
        --------------------------------------------- */

        grid.style.setProperty(

            "--grid-shift",

            `${-(smoothScroll * .15) % 72}px`

        );


        ambientGlow.style.setProperty(

            "--glow-y",

            `${Math.sin(smoothScroll * .001) * 105}px`

        );


        /* ---------------------------------------------
           CURSOR FOLLOWING
        --------------------------------------------- */

        if (pointerSeen && fine.matches) {

            cursorX +=

                (x - cursorX) * blend;


            cursorY +=

                (y - cursorY) * blend;


            ring.style.transform =

                `translate3d(${cursorX}px, ${cursorY}px, 0)`;


            glow.style.transform =

                `translate3d(${cursorX}px, ${cursorY}px, 0)`;


            ambientGlow.style.setProperty(

                "--glow-x",

                `${(cursorX - width / 2) * .13}px`

            );

        }


        /* ---------------------------------------------
           AUTOMATIC ROTATING TEXT
        --------------------------------------------- */

        const next =

            Math.floor(elapsed / 3200) %

            roles.length;


        if (next !== roleIndex) {

            roleIndex = next;

            role.textContent = roles[next];


            if (role.animate) {

                role.animate(

                    [

                        {
                            opacity: 0,
                            transform: "translateY(6px)"
                        },

                        {
                            opacity: 1,
                            transform: "translateY(0)"
                        }

                    ],

                    {
                        duration: 300,
                        easing: "ease-out"
                    }

                );

            }

        }


        // Render particles

        draw();


        // Request next frame

        raf = requestAnimationFrame(tick);

    }


    /* -------------------------------------------------
       START ANIMATION ENGINE
    ------------------------------------------------- */

    function start() {

        if (

            !raf &&

            !paused &&

            !document.hidden

        ) {

            last = 0;

            raf = requestAnimationFrame(tick);

        }

    }


    /* -------------------------------------------------
       STOP ANIMATION ENGINE
    ------------------------------------------------- */

    function stop() {

        if (raf) {

            cancelAnimationFrame(raf);

        }

        raf = 0;

        last = 0;

    }


    /* -------------------------------------------------
       SYSTEM ACCESSIBILITY MANAGEMENT

       No manual pause button.
       Animations are enabled automatically unless the
       operating system requests reduced motion.
    ------------------------------------------------- */

    function setPaused(value) {

        paused = value;


        root.classList.toggle(

            "motion-paused",

            paused

        );


        if (paused) {

            stop();

            root.classList.remove(
                "pointer-active"
            );

            pointerSeen = false;

            velocity = 0;


            // Restore counters to their final values

            $$("[data-count]").forEach(element => {

                const value =
                    Number(element.dataset.count);


                element.textContent =

                    value === 3

                        ? "03"

                        : element.dataset.count +

                          (
                              value === 1000
                                  ? "+"
                                  : ""
                          );

            });


            draw();

        } else {

            root.classList.add(
                "motion-ready"
            );

            start();

        }

    }


    /* -------------------------------------------------
       ACCESSIBILITY PREFERENCE CHANGES
    ------------------------------------------------- */

    const onPreference = () => {

        setPaused(motion.matches);

    };


    if (motion.addEventListener) {

        motion.addEventListener(
            "change",
            onPreference
        );

    } else {

        motion.addListener(onPreference);

    }


    /* -------------------------------------------------
       SCROLL EVENTS
    ------------------------------------------------- */

    window.addEventListener(

        "scroll",

        () => {

            scroll = window.scrollY;

        },

        { passive: true }

    );


    /* -------------------------------------------------
       RESIZE EVENTS
    ------------------------------------------------- */

    window.addEventListener(

        "resize",

        resize,

        { passive: true }

    );


    /* -------------------------------------------------
       TAB VISIBILITY OPTIMIZATION

       Automatically suspends rendering when the
       visitor switches to another browser tab.
    ------------------------------------------------- */

    document.addEventListener(

        "visibilitychange",

        () => {

            if (document.hidden) {

                stop();

            } else {

                start();

            }

        }

    );


    /* -------------------------------------------------
       CUSTOM CURSOR EVENTS
    ------------------------------------------------- */

    document.addEventListener(

        "pointermove",

        event => {

            if (

                paused ||

                !fine.matches ||

                event.pointerType === "touch"

            ) {

                return;

            }


            x = event.clientX;

            y = event.clientY;


            // Initialize cursor without jumping

            if (!pointerSeen) {

                cursorX = x;

                cursorY = y;

                pointerSeen = true;

            }


            root.classList.add(
                "pointer-active"
            );


            // Expand cursor around interactive elements

            ring.classList.toggle(

                "hot",

                !!event.target.closest(
                    "a, button, summary"
                )

            );

        },

        { passive: true }

    );


    /* Cursor compression when clicking */

    document.addEventListener(

        "pointerdown",

        () => {

            ring.classList.add("down");

        },

        { passive: true }

    );


    document.addEventListener(

        "pointerup",

        () => {

            ring.classList.remove("down");

        },

        { passive: true }

    );


    document.addEventListener(

        "pointercancel",

        () => {

            ring.classList.remove("down");

        }

    );


    /* Hide cursor outside the browser */

    document.documentElement.addEventListener(

        "pointerleave",

        () => {

            root.classList.remove(
                "pointer-active"
            );

            pointerSeen = false;

        }

    );


    /* Hide cursor when browser loses focus */

    window.addEventListener(

        "blur",

        () => {

            root.classList.remove(
                "pointer-active"
            );

            pointerSeen = false;

        }

    );


    /* Initialize animation engine */

    resize();

    setPaused(paused);

}


/* =====================================================
   07. INTERACTIVE UI EFFECTS
===================================================== */

function initInteractions() {

    const fine = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    );


    // Mouse effects are enabled only on compatible devices

    const enabled = () => {

        return (

            fine.matches &&

            !motion.matches &&

            !root.classList.contains("motion-paused")

        );

    };


    /* -------------------------------------------------
       INTERACTIVE 3D PROFILE PORTRAIT
    ------------------------------------------------- */

    const portrait = $(".portrait-frame");


    portrait.addEventListener(

        "pointermove",

        event => {

            if (!enabled()) {

                return;

            }


            const rect =

                portrait.getBoundingClientRect();


            const relativeX =

                (
                    event.clientX -

                    rect.left -

                    rect.width / 2

                ) / rect.width;


            const relativeY =

                (
                    event.clientY -

                    rect.top -

                    rect.height / 2

                ) / rect.height;


            portrait.style.setProperty(

                "--ry",

                `${relativeX * 11}deg`

            );


            portrait.style.setProperty(

                "--rx",

                `${-relativeY * 11}deg`

            );

        }

    );


    /* Restore portrait rotation */

    portrait.addEventListener(

        "pointerleave",

        () => {

            portrait.style.removeProperty("--ry");

            portrait.style.removeProperty("--rx");

        }

    );


    /* -------------------------------------------------
       MAGNETIC BUTTONS
    ------------------------------------------------- */

    $$(".button").forEach(button => {

        button.addEventListener(

            "pointermove",

            event => {

                if (!enabled()) {

                    return;

                }


                const rect =

                    button.getBoundingClientRect();


                const offsetX =

                    event.clientX -

                    rect.left -

                    rect.width / 2;


                const offsetY =

                    event.clientY -

                    rect.top -

                    rect.height / 2;


                button.style.setProperty(

                    "--mx",

                    `${offsetX * .10}px`

                );


                button.style.setProperty(

                    "--my",

                    `${offsetY * .12}px`

                );

            }

        );


        /* Restore button position */

        button.addEventListener(

            "pointerleave",

            () => {

                button.style.removeProperty("--mx");

                button.style.removeProperty("--my");

            }

        );

    });


    /* -------------------------------------------------
       VIEWPORT ANIMATION MANAGEMENT
    ------------------------------------------------- */

    if ("IntersectionObserver" in window) {

        const view = new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    entry.target.classList.toggle(

                        "in-view",

                        entry.isIntersecting

                    );

                });

            },

            {
                threshold: .1
            }

        );


        $$(

            ".project-visual, .research-card, .hero"

        ).forEach(element => {

            view.observe(element);

        });


        /* ---------------------------------------------
           ANIMATED COUNTERS
        --------------------------------------------- */

        const counts = new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {

                        return;

                    }


                    // Counters run only once

                    counts.unobserve(entry.target);


                    const element = entry.target;

                    const value =

                        Number(element.dataset.count);


                    const final =

                        element.textContent;


                    if (

                        motion.matches ||

                        root.classList.contains(
                            "motion-paused"
                        )

                    ) {

                        return;

                    }


                    const start = performance.now();


                    function animate(now) {

                        if (

                            root.classList.contains(
                                "motion-paused"
                            ) ||

                            motion.matches ||

                            document.hidden

                        ) {

                            element.textContent = final;

                            return;

                        }


                        const t = Math.min(

                            1,

                            (now - start) / 900

                        );


                        const number = Math.round(

                            value *

                            (
                                1 -
                                Math.pow(1 - t, 3)
                            )

                        );


                        element.textContent =

                            t === 1

                                ? final

                                : (

                                    value === 3

                                        ? String(number)
                                            .padStart(2, "0")

                                        : String(number)

                                ) +

                                (
                                    value === 1000
                                        ? "+"
                                        : ""
                                );


                        if (t < 1) {

                            requestAnimationFrame(
                                animate
                            );

                        }

                    }


                    requestAnimationFrame(animate);

                });

            },

            {
                threshold: .5
            }

        );


        $$("[data-count]").forEach(element => {

            counts.observe(element);

        });

    }

}


/* =====================================================
   08. AUTOMATIC PROJECT DEMONSTRATIONS

   No buttons.
   No manual interaction required.
   No backend requests.

   All values are explicitly illustrative sample data.

   Conscia: updates every 3.2 seconds.
   SocialDash: updates every 3.8 seconds.
   Blockchain: advances every 1 second.
===================================================== */

function initProjectDemos() {

    /* -------------------------------------------------
       CONSCIA SAMPLE REVIEWS
    ------------------------------------------------- */

    const samples = [

        {

            text: "“Less plastic, durable packaging.”",

            scores: [82, 65, 75, 58]

        },

        {

            text: "“Too much packaging and waste.”",

            scores: [28, 58, 72, 55]

        },

        {

            text: "“Recyclable box, made to last.”",

            scores: [91, 73, 68, 72]

        }

    ];


    /* -------------------------------------------------
       SOCIALDASH SAMPLE CHART DATA
    ------------------------------------------------- */

    const series = [

        [

            121, 112, 117, 90, 98,

            70, 80, 55, 64, 30,

            42, 20, 5

        ],

        [

            130, 107, 111, 97, 83,

            92, 63, 69, 47, 38,

            45, 15, 9

        ],

        [

            125, 118, 95, 105, 84,

            68, 74, 53, 42, 55,

            29, 20, 7

        ]

    ];


    /* -------------------------------------------------
       CACHE DOM ELEMENTS

       Avoid querying the DOM every animation frame.
    ------------------------------------------------- */

    const conscia = $(".visual-conscia");

    const social = $(".visual-social");

    const chain = $(".visual-chain");


    const review = $(

        ".diagram-review p",

        conscia

    );


    const bars = $$(

        ".score-row i",

        conscia

    );


    const line = $(

        ".chart-line",

        social

    );


    const area = $(

        'path[fill="url(#chartFill)"]',

        social

    );


    const dot = $(

        ".chart circle",

        social

    );


    const nodes = $$(

        ".chain-node",

        chain

    );


    const hash = $(

        ".hash-line span:last-child",

        chain

    );


    // Animation indexes

    let sampleIndex = 0;

    let chartIndex = 0;

    let stage = 0;


    /* -------------------------------------------------
       AUTOMATIC CONSCIA ANALYSIS
    ------------------------------------------------- */

    function updateConscia() {

        sampleIndex =

            (sampleIndex + 1) %

            samples.length;


        const sample = samples[sampleIndex];


        // Replace sample review

        review.textContent = sample.text;


        /*
            Update using CSS scaleX transforms.

            Avoids recalculating the layout when
            the scoring bars change.
        */

        bars.forEach((bar, index) => {

            bar.style.setProperty(

                "--bar",

                sample.scores[index] / 100

            );

        });

    }


    /* -------------------------------------------------
       AUTOMATIC SOCIALDASH CHART
    ------------------------------------------------- */

    function updateSocial() {

        chartIndex =

            (chartIndex + 1) %

            series.length;


        const values = series[chartIndex];


        // Generate the updated SVG path

        const path =

            "M" +

            values.map((value, index) => {

                return (

                    `${Math.round(index * 440 / 12)} ${value}`

                );

            }).join(" ");


        // Update chart line

        line.setAttribute(

            "d",

            path

        );


        // Update gradient area

        area.setAttribute(

            "d",

            path + "V145H0Z"

        );


        // Update the final data point

        dot.setAttribute(

            "cy",

            values[values.length - 1]

        );


        /* Draw the new chart automatically */

        if (line.animate) {

            const length = line.getTotalLength();


            line.animate(

                [

                    {

                        strokeDasharray:

                            `${length} ${length}`,

                        strokeDashoffset:

                            length

                    },

                    {

                        strokeDasharray:

                            `${length} ${length}`,

                        strokeDashoffset:

                            0

                    }

                ],

                {

                    duration: 950,

                    easing: "ease-out"

                }

            );

        }

    }


    /* -------------------------------------------------
       AUTOMATIC BLOCKCHAIN VERIFICATION
    ------------------------------------------------- */

    function updateChain() {

        // Five-stage repeating verification sequence

        stage =

            (stage + 1) % 5;


        nodes.forEach((node, index) => {

            // Mark completed stages

            node.classList.toggle(

                "verified",

                stage > index

            );


            // Highlight current processing stage

            node.classList.toggle(

                "processing",

                stage === index + 1

            );

        });


        const states = [

            "Sample hash pending",

            "Sample document hashed",

            "Sample record checked",

            "✓ Sample hash match",

            "✓ Sample hash match"

        ];


        hash.textContent = states[stage];

    }


    /* =================================================
       09. PERFORMANCE-OPTIMIZED PROJECT SCHEDULER

       Each project uses only one active timeout.

       Animations automatically stop when:

       - The project is outside the viewport.
       - The browser tab is hidden.
       - Reduced motion is requested by the system.

       They resume automatically when visible.
    ================================================= */

    const jobs = new Map([

        [

            conscia,

            {

                run: updateConscia,

                delay: 3200,

                timer: 0,

                visible: false

            }

        ],

        [

            social,

            {

                run: updateSocial,

                delay: 3800,

                timer: 0,

                visible: false

            }

        ],

        [

            chain,

            {

                run: updateChain,

                delay: 1000,

                timer: 0,

                visible: false

            }

        ]

    ]);


    /* Check whether a project should animate */

    const canRun = job => {

        return (

            job.visible &&

            !document.hidden &&

            !motion.matches

        );

    };


    /* -------------------------------------------------
       PROJECT ANIMATION SCHEDULER
    ------------------------------------------------- */

    function sync(job) {

        if (!canRun(job)) {

            clearTimeout(job.timer);

            job.timer = 0;

            return;

        }


        // Prevent duplicate animation loops

        if (job.timer) {

            return;

        }


        // Schedule next automatic update

        job.timer = setTimeout(() => {

            job.timer = 0;


            if (!canRun(job)) {

                return;

            }


            // Execute next project animation

            job.run();


            // Repeat automatically

            sync(job);

        }, job.delay);

    }


    /* -------------------------------------------------
       PROJECT VISIBILITY OBSERVER
    ------------------------------------------------- */

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    const job = jobs.get(entry.target);


                    job.visible = entry.isIntersecting;


                    sync(job);

                });

            },

            {

                threshold: .05

            }

        );


        jobs.forEach((job, panel) => {

            observer.observe(panel);

        });

    } else {

        /* Fallback for older browsers */

        let scheduled = false;


        const check = () => {

            scheduled = false;


            jobs.forEach((job, panel) => {

                const rect =

                    panel.getBoundingClientRect();


                job.visible =

                    rect.bottom > 0 &&

                    rect.top < window.innerHeight;


                sync(job);

            });

        };


        const schedule = () => {

            if (!scheduled) {

                scheduled = true;

                requestAnimationFrame(check);

            }

        };


        window.addEventListener(

            "scroll",

            schedule,

            { passive: true }

        );


        window.addEventListener(

            "resize",

            schedule,

            { passive: true }

        );


        check();

    }


    /* -------------------------------------------------
       AUTOMATIC SUSPENSION AND RESUMPTION
    ------------------------------------------------- */

    const syncAll = () => {

        jobs.forEach(sync);

    };


    document.addEventListener(

        "visibilitychange",

        syncAll

    );


    if (motion.addEventListener) {

        motion.addEventListener(

            "change",

            syncAll

        );

    } else {

        motion.addListener(syncAll);

    }

}


/* =====================================================
   10. INITIALIZE ALL WEBSITE FEATURES
===================================================== */

initNavigation();

initScrollState();

initMotion();

initContact();

initAmbient();

initInteractions();

initProjectDemos();


/* =====================================================
   11. AUTOMATIC FOOTER YEAR
===================================================== */

$("#year").textContent =

    String(new Date().getFullYear());