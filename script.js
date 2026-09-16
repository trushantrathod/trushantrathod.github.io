"use strict";


/* =====================================================
   GLOBAL
===================================================== */

const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


const isTouchDevice =
    window.matchMedia(
        "(pointer: coarse)"
    ).matches;


const $ = (selector, root = document) =>
    root.querySelector(selector);


const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];


/* =====================================================
   THREE.JS SPACE BACKGROUND
===================================================== */

function initSpaceBackground() {

    const container =
        document.getElementById(
            "space-background"
        );


    if (
        !container ||
        typeof THREE === "undefined"
    ) {
        return;
    }


    const scene =
        new THREE.Scene();


    const camera =
        new THREE.PerspectiveCamera(
            70,
            window.innerWidth /
            window.innerHeight,
            0.1,
            3000
        );


    camera.position.z =
        520;


    const renderer =
        new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            1.5 
        )
    );


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    container.appendChild(
        renderer.domElement
    );


    /* ------------------------------------------
       PRIMARY STARFIELD
    ------------------------------------------ */

    const primaryGeometry =
        new THREE.BufferGeometry();

    const primaryCount =
        window.innerWidth < 600
            ? 500
            : 1000;


    const primaryPositions =
        new Float32Array(
            primaryCount * 3
        );


    for (
        let i = 0;
        i < primaryPositions.length;
        i++
    ) {

        primaryPositions[i] =
            (
                Math.random() - .5
            ) * 2200;

    }


    primaryGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            primaryPositions,
            3
        )
    );


    const primaryMaterial =
        new THREE.PointsMaterial({

            size:
                window.innerWidth < 600
                    ? 2.1
                    : 2.5,

            color:
                0xA29BFE,

            transparent:
                true,

            opacity:
                .72,

            blending:
                THREE.AdditiveBlending,

            depthWrite:
                false

        });


    const primaryStars =
        new THREE.Points(
            primaryGeometry,
            primaryMaterial
        );


    scene.add(
        primaryStars
    );


    /* ------------------------------------------
       CYAN STARFIELD
    ------------------------------------------ */

    const secondaryGeometry =
        new THREE.BufferGeometry();

    const secondaryCount =
        window.innerWidth < 600
            ? 150
            : 400;


    const secondaryPositions =
        new Float32Array(
            secondaryCount * 3
        );


    for (
        let i = 0;
        i < secondaryPositions.length;
        i++
    ) {

        secondaryPositions[i] =
            (
                Math.random() - .5
            ) * 2700;

    }


    secondaryGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            secondaryPositions,
            3
        )
    );


    const secondaryMaterial =
        new THREE.PointsMaterial({

            size:
                1.5,

            color:
                0x67E8F9,

            transparent:
                true,

            opacity:
                .30,

            blending:
                THREE.AdditiveBlending,

            depthWrite:
                false

        });


    const secondaryStars =
        new THREE.Points(
            secondaryGeometry,
            secondaryMaterial
        );


    scene.add(
        secondaryStars
    );


    /* ------------------------------------------
       MOUSE TARGET
    ------------------------------------------ */

    let mouseX = 0;

    let mouseY = 0;

    let targetX = 0;

    let targetY = 0;


    let currentMouseX = 0;

    let currentMouseY = 0;


    if (!isTouchDevice) {

        document.addEventListener(
            "mousemove",
            (event) => {

                mouseX =
                    (
                        event.clientX /
                        window.innerWidth
                    ) * 2 - 1;


                mouseY =
                    (
                        event.clientY /
                        window.innerHeight
                    ) * 2 - 1;

            }
        );

    }


    /* ------------------------------------------
       SMOOTH SCROLL VELOCITY LERP
    ------------------------------------------ */

    let previousScrollY =
        window.scrollY;


    let currentScrollY =
        window.scrollY;


    let scrollVelocity =
        0;


    window.addEventListener(
        "scroll",
        () => {

            currentScrollY =
                window.scrollY;

        },
        {
            passive:
                true
        }
    );


    /* ------------------------------------------
       ANIMATION
    ------------------------------------------ */

    const clock =
        new THREE.Clock();


    function animate() {

        requestAnimationFrame(
            animate
        );


        const elapsed =
            clock.getElapsedTime();


        /*
         * Smooth mouse-following rotation
         */

        targetX =
            mouseX * .08;


        targetY =
            mouseY * .045;


        currentMouseX +=
            (
                targetX -
                currentMouseX
            ) * .025;


        currentMouseY +=
            (
                targetY -
                currentMouseY
            ) * .025;


        /*
         * Slow natural motion
         */

        primaryStars.rotation.y +=
            .00075;


        primaryStars.rotation.x +=
            .00012;


        secondaryStars.rotation.y -=
            .00035;


        secondaryStars.rotation.x +=
            .00008;


        /*
         * Cursor interaction
         */

        primaryStars.rotation.y +=
            currentMouseX *
            .0017;


        primaryStars.rotation.x +=
            currentMouseY *
            .0012;


        secondaryStars.rotation.y +=
            currentMouseX *
            .00065;


        secondaryStars.rotation.x +=
            currentMouseY *
            .00045;


        /*
         * Scroll warp with smoothing applied
         */

        let rawVelocity =
            currentScrollY -
            previousScrollY;

        previousScrollY =
            currentScrollY;

        // The key to silky smooth stars: Lerp the raw velocity
        scrollVelocity +=
            (rawVelocity - scrollVelocity) * 0.15;


        primaryStars.position.z +=
            scrollVelocity *
            .30;


        if (
            primaryStars.position.z >
            350
        ) {

            primaryStars.position.z =
                -350;

        }


        if (
            primaryStars.position.z <
            -350
        ) {

            primaryStars.position.z =
                350;

        }


        /*
         * Slight camera depth breathing
         */

        camera.position.x +=
            (
                currentMouseX * 3 -
                camera.position.x
            ) * .01;


        camera.position.y +=
            (
                -currentMouseY * 3 -
                camera.position.y
            ) * .01;


        camera.lookAt(
            scene.position
        );


        renderer.render(
            scene,
            camera
        );

    }


    animate();


    /* ------------------------------------------
       RESIZE
    ------------------------------------------ */

    window.addEventListener(
        "resize",
        () => {

            camera.aspect =
                window.innerWidth /
                window.innerHeight;


            camera.updateProjectionMatrix();


            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );

        }
    );

}


/* =====================================================
   CURSOR + CURSOR LIGHT
===================================================== */

function initCursor() {

    if (isTouchDevice) {
        return;
    }


    const cursor =
        document.getElementById(
            "cursor"
        );


    const cursorRing =
        document.getElementById(
            "cursorRing"
        );


    const cursorLight =
        document.getElementById(
            "cursor-light"
        );


    if (
        !cursor ||
        !cursorRing
    ) {
        return;
    }


    let mouseX =
        window.innerWidth / 2;


    let mouseY =
        window.innerHeight / 2;


    let ringX =
        mouseX;


    let ringY =
        mouseY;


    let lightX =
        mouseX;


    let lightY =
        mouseY;


    document.addEventListener(
        "mousemove",
        (event) => {

            mouseX =
                event.clientX;

            mouseY =
                event.clientY;


            cursor.style.left =
                `${mouseX}px`;

            cursor.style.top =
                `${mouseY}px`;

        }
    );


    function animateCursor() {

        ringX +=
            (
                mouseX -
                ringX
            ) * .14;


        ringY +=
            (
                mouseY -
                ringY
            ) * .14;


        lightX +=
            (
                mouseX -
                lightX
            ) * .045;


        lightY +=
            (
                mouseY -
                lightY
            ) * .045;


        cursorRing.style.left =
            `${ringX}px`;


        cursorRing.style.top =
            `${ringY}px`;


        if (cursorLight) {

            cursorLight.style.left =
                `${lightX}px`;


            cursorLight.style.top =
                `${lightY}px`;

        }


        requestAnimationFrame(
            animateCursor
        );

    }


    animateCursor();


    const interactiveElements =
        $$(
            "a, button, .skill-card, .project-card, .contact-link"
        );


    interactiveElements.forEach(
        (element) => {

            element.addEventListener(
                "mouseenter",
                () => {

                    cursorRing.classList.add(
                        "active"
                    );

                }
            );


            element.addEventListener(
                "mouseleave",
                () => {

                    cursorRing.classList.remove(
                        "active"
                    );

                }
            );

        }
    );

}


/* =====================================================
   MAGNETIC BUTTONS
===================================================== */

function initMagneticElements() {

    if (
        isTouchDevice ||
        prefersReducedMotion
    ) {
        return;
    }


    $$(".magnetic").forEach(
        (element) => {

            element.addEventListener(
                "mousemove",
                (event) => {

                    const rect =
                        element.getBoundingClientRect();


                    const x =
                        event.clientX -
                        (
                            rect.left +
                            rect.width / 2
                        );


                    const y =
                        event.clientY -
                        (
                            rect.top +
                            rect.height / 2
                        );


                    element.style.transform =
                        `translate(${x * .07}px, ${y * .07}px)`;

                }
            );


            element.addEventListener(
                "mouseleave",
                () => {

                    element.style.transform =
                        "";

                }
            );

        }
    );

}


/* =====================================================
   GSAP REVEALS
===================================================== */

function initRevealAnimations() {

    if (
        typeof gsap === "undefined"
    ) {
        return;
    }


    if (
        typeof ScrollTrigger !== "undefined"
    ) {

        gsap.registerPlugin(
            ScrollTrigger
        );

    }


    const elements =
        $$(".reveal");


    if (
        prefersReducedMotion
    ) {

        elements.forEach(
            (element) => {

                element.style.opacity =
                    "1";

                element.style.transform =
                    "none";

            }
        );

        return;

    }


    elements.forEach(
        (element) => {

            gsap.to(
                element,
                {

                    scrollTrigger: {

                        trigger:
                            element,

                        start:
                            "top 87%",

                        once:
                            true

                    },

                    opacity:
                        1,

                    y:
                        0,

                    duration:
                        .9,

                    ease:
                        "power3.out"

                }
            );

        }
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

function initNavigation() {


    const nav =
        document.getElementById(
            "topNav"
        );


    const mobileButton =
        document.getElementById(
            "mobileMenuButton"
        );


    const mobileNavigation =
        document.getElementById(
            "mobileNavigation"
        );


    /* ------------------------------------------
       MOBILE MENU
    ------------------------------------------ */

    if (
        mobileButton &&
        mobileNavigation
    ) {

        mobileButton.addEventListener(
            "click",
            () => {

                const open =
                    mobileButton.classList.toggle(
                        "open"
                    );


                mobileNavigation.classList.toggle(
                    "open",
                    open
                );


                mobileButton.setAttribute(
                    "aria-expanded",
                    String(open)
                );


                document.body.style.overflow =
                    open
                        ? "hidden"
                        : "";

            }
        );


        $$("#mobileNavigation a")
            .forEach(
                (link) => {

                    link.addEventListener(
                        "click",
                        () => {

                            mobileButton.classList.remove(
                                "open"
                            );


                            mobileNavigation.classList.remove(
                                "open"
                            );


                            mobileButton.setAttribute(
                                "aria-expanded",
                                "false"
                            );


                            document.body.style.overflow =
                                "";

                        }
                    );

                }
            );

    }


    /* ------------------------------------------
       NAV SHRINK
    ------------------------------------------ */

    window.addEventListener(
        "scroll",
        () => {

            if (!nav) {
                return;
            }


            nav.classList.toggle(
                "scrolled",
                window.scrollY > 30
            );

        },
        {
            passive:
                true
        }
    );


    /* ------------------------------------------
       ACTIVE SECTION
    ------------------------------------------ */

    const sections =
        [
            "about",
            "projects",
            "research",
            "experience",
            "contact"
        ]
        .map(
            (id) =>
                document.getElementById(
                    id
                )
        )
        .filter(Boolean);


    const navLinks =
        $$(
            "[data-section-link]"
        );


    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {

                            return;

                        }


                        navLinks.forEach(
                            (link) => {

                                const active =
                                    link.getAttribute(
                                        "href"
                                    ) ===
                                    `#${entry.target.id}`;


                                link.classList.toggle(
                                    "active",
                                    active
                                );

                            }
                        );

                    }
                );

            },
            {
                threshold:
                    .45
            }
        );


    sections.forEach(
        (section) => {

            observer.observe(
                section
            );

        }
    );

}


/* =====================================================
   BOTTOM SCROLL DOCK
===================================================== */

function initScrollDock() {

    const dock =
        document.getElementById(
            "scrollDock"
        );


    const progress =
        document.getElementById(
            "scrollDockProgress"
        );


    const glow =
        document.getElementById(
            "scrollDockGlow"
        );


    const sectionText =
        document.getElementById(
            "scrollDockSection"
        );


    if (
        !dock ||
        !progress
    ) {
        return;
    }


    const sectionNames = {

        home:
            "HOME",

        about:
            "ABOUT",

        projects:
            "MISSIONS",

        research:
            "RESEARCH",

        experience:
            "MISSION LOG",

        contact:
            "CONTACT"

    };


    let ticking =
        false;


    function updateScrollDock() {

        if (
            ticking
        ) {
            return;
        }


        ticking =
            true;


        requestAnimationFrame(
            () => {

                const scrollTop =
                    window.scrollY ||
                    0;


                const scrollable =
                    Math.max(
                        document.documentElement
                            .scrollHeight -
                        window.innerHeight,
                        1
                    );


                const progressValue =
                    Math.min(
                        1,
                        Math.max(
                            0,
                            scrollTop /
                            scrollable
                        )
                    );


                /*
                 * The line grows outward from the
                 * center instead of behaving like a
                 * conventional percentage progress bar.
                 */

                dock.style.setProperty(
                    "--scroll-progress",
                    progressValue.toFixed(4)
                );


                dock.classList.toggle(
                    "has-scroll",
                    progressValue > .015
                );


                dock.classList.toggle(
                    "near-end",
                    progressValue > .96
                );


                if (glow) {
                    glow.style.opacity = String(.22 + progressValue * .78);
                    glow.style.transform = `translate(-50%, -50%) scale(${.55 + progressValue * 1.35})`;
                    glow.style.left = `${progressValue * 100}%`;
                }


                /*
                 * Current visible section
                 */

                const sections =
                    $$(
                        "main section"
                    );


                let currentSection =
                    "home";


                let smallestDistance =
                    Infinity;


                sections.forEach(
                    (section) => {

                        const rect =
                            section.getBoundingClientRect();


                        const distance =
                            Math.abs(
                                rect.top -
                                window.innerHeight *
                                .28
                            );


                        if (
                            distance <
                            smallestDistance
                        ) {

                            smallestDistance =
                                distance;


                            currentSection =
                                section.id;

                        }

                    }
                );


                if (
                    sectionText
                ) {

                    sectionText.textContent =
                        sectionNames[
                            currentSection
                        ] ||
                        currentSection.toUpperCase();

                }


                ticking =
                    false;

            }
        );

    }


    window.addEventListener(
        "scroll",
        updateScrollDock,
        {
            passive:
                true
        }
    );


    window.addEventListener(
        "resize",
        updateScrollDock
    );


    updateScrollDock();

}


/* =====================================================
   CURSOR-REACTIVE STAR LAYERS
===================================================== */

function initParallaxStars() {

    const container =
        document.getElementById(
            "parallax-stars"
        );


    if (
        !container
    ) {
        return;
    }


    const reduced =
        prefersReducedMotion;


    const mobile =
        window.innerWidth < 700;


    const count =
        mobile
            ? 20
            : 40;


    container.innerHTML =
        "";


    const stars =
        [];


    let mouseX =
        0;


    let mouseY =
        0;


    let smoothX =
        0;


    let smoothY =
        0;


    let scrollTarget =
        0;


    let smoothScroll =
        0;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const star =
            document.createElement(
                "span"
            );


        star.className =
            "parallax-star";


        const depth =
            .15 +
            Math.random() *
            .95;


        const size =
            Math.random() < .88
                ? (
                    .8 +
                    Math.random() *
                    1.7
                )
                : (
                    2.1 +
                    Math.random() *
                    2.1
                );


        const x =
            Math.random() *
            100;


        const y =
            Math.random() *
            100;


        const drift =
            .08 +
            Math.random() *
            .20;


        const twinkle =
            1.6 +
            Math.random() *
            4.5;


        const delay =
            Math.random() *
            -5;


        const hue =
            Math.random() > .78
                ? "cyan"
                : "violet";


        star.style.setProperty(
            "--star-size",
            `${size}px`
        );


        star.style.setProperty(
            "--star-x",
            `${x}vw`
        );


        star.style.setProperty(
            "--star-y",
            `${y}vh`
        );


        star.style.setProperty(
            "--star-depth",
            depth.toFixed(3)
        );


        star.style.setProperty(
            "--star-drift",
            `${drift}s`
        );


        star.style.setProperty(
            "--star-twinkle",
            `${twinkle}s`
        );


        star.style.setProperty(
            "--star-delay",
            `${delay}s`
        );


        star.dataset.hue =
            hue;


        container.appendChild(
            star
        );


        stars.push({

            el:
                star,

            x:
                x,

            y:
                y,

            depth:
                depth,

            drift:
                drift,

            phase:
                Math.random() *
                Math.PI *
                2,

            twinkle:
                .2 +
                Math.random() *
                1.1

        });

    }


    if (
        !isTouchDevice
    ) {

        document.addEventListener(
            "mousemove",
            (event) => {

                mouseX =
                    (
                        event.clientX /
                        window.innerWidth
                    ) -
                    .5;


                mouseY =
                    (
                        event.clientY /
                        window.innerHeight
                    ) -
                    .5;

            },
            {
                passive:
                    true
            }
        );

    }


    window.addEventListener(
        "scroll",
        () => {

            scrollTarget =
                window.scrollY;

        },
        {
            passive:
                true
        }
    );


    const clock =
        performance.now();


    function render(
        now
    ) {

        smoothX +=
            (
                mouseX -
                smoothX
            ) * .035;


        smoothY +=
            (
                mouseY -
                smoothY
            ) * .035;

        // Increased easing for snappier, smoother scroll tracking on DOM stars
        smoothScroll +=
            (
                scrollTarget -
                smoothScroll
            ) * .08;


        const time =
            (
                now -
                clock
            ) * .001;


        stars.forEach(
            (star) => {

                const cursorX =
                    smoothX *
                    star.depth *
                    26;


                const cursorY =
                    smoothY *
                    star.depth *
                    20;


                const orbitalX =
                    Math.sin(
                        time *
                        star.drift +
                        star.phase
                    ) *
                    (
                        2 +
                        star.depth *
                        3
                    );


                const orbitalY =
                    Math.cos(
                        time *
                        star.drift *
                        .7 +
                        star.phase
                    ) *
                    (
                        1.5 +
                        star.depth *
                        2
                    );


                const scrollY =
                    -(
                        smoothScroll *
                        (
                            .006 +
                            star.depth *
                            .012
                        )
                    );


                star.el.style.transform =
                    `
                        translate3d(
                            ${
                                cursorX +
                                orbitalX
                            }px,
                            ${
                                cursorY +
                                orbitalY +
                                scrollY
                            }px,
                            0
                        )
                    `;

            }
        );


        if (
            !reduced
        ) {

            requestAnimationFrame(
                render
            );

        }

    }


    if (
        reduced
    ) {

        stars.forEach(
            (star) => {

                star.el.style.transform =
                    "none";

            }
        );

    }
    else {

        requestAnimationFrame(
            render
        );

    }

}


/* =====================================================
   CASE STUDY MODAL
===================================================== */

function initCaseStudies() {


    const modal =
        document.getElementById(
            "caseModal"
        );


    const close =
        document.getElementById(
            "caseModalClose"
        );


    const backdrop =
        document.getElementById(
            "caseModalBackdrop"
        );


    const modalNumber =
        document.getElementById(
            "modalNumber"
        );


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const modalSummary =
        document.getElementById(
            "modalSummary"
        );


    const modalPoints =
        document.getElementById(
            "modalPoints"
        );


    const modalTags =
        document.getElementById(
            "modalTags"
        );


    const modalRole =
        document.getElementById(
            "modalRole"
        );


    if (
        !modal
    ) {
        return;
    }


    const caseStudies = {

        conscia: {

            number:
                "01",

            title:
                "Conscia — Ethical Shopping AI",

            summary:
                "An end-to-end NLP and responsible-AI system that maps product-review language to four ethical dimensions and makes predictions interpretable.",

            points: [

                "Teacher model: lexicon-based weak supervision generated initial labels for Environment, Labor Rights, Animal Welfare and Corporate Governance.",

                "Student model: TensorFlow/Keras neural network trained using TF-IDF features with dense layers, dropout and sigmoid outputs.",

                "Explainability: LIME identifies influential words behind model predictions.",

                "Backend: Flask exposes prediction and explanation endpoints.",

                "Gemini API converts model outputs and explanation signals into natural-language summaries.",

                "The research paper reports 91.5% classification accuracy."

            ],

            tags: [

                "TensorFlow",
                "Keras",
                "TF-IDF",
                "LIME",
                "Flask",
                "Gemini API"

            ],

            role:
                "End-to-end project covering NLP preprocessing, model training, explainability, backend integration and product interface."

        },


        blockchain: {

            number:
                "02",

            title:
                "Blockchain Certificate Verification",

            summary:
                "A decentralized document verification workflow designed to make credential integrity independently checkable.",

            points: [

                "Ethereum smart contracts store document hashes on-chain.",

                "IPFS stores encrypted documents off-chain while blockchain records preserve the integrity reference.",

                "Web3.js and MetaMask provide wallet-connected interactions.",

                "Hash comparison validates uploaded documents against blockchain-stored references.",

                "The architecture reduces dependence on a single central verification authority."

            ],

            tags: [

                "Solidity",
                "Ethereum",
                "IPFS",
                "Web3.js",
                "Node.js",
                "MetaMask"

            ],

            role:
                "Full-stack blockchain project covering smart contracts, storage architecture, verification logic and Web3 integration."

        },


        socialdash: {

            number:
                "03",

            title:
                "SocialDash — Real-Time Analytics",

            summary:
                "A full-stack analytics platform built around live growth signals, session velocity and milestone-based progress tracking.",

            points: [

                "React frontend renders analytics and dynamic progress visualizations.",

                "FastAPI powers the backend API and delta-based update logic.",

                "MongoDB provides analytics persistence.",

                "Firebase Authentication provides secure user access.",

                "The system emphasizes live metrics rather than static reporting."

            ],

            tags: [

                "React",
                "FastAPI",
                "MongoDB",
                "Firebase",
                "REST API",
                "Real-Time"

            ],

            role:
                "Full-stack project covering frontend development, APIs, authentication, persistence and analytics visualization."

        }

    };


    function openModal(
        key
    ) {

        const data =
            caseStudies[key];


        if (
            !data
        ) {
            return;
        }


        modalNumber.textContent =
            data.number;


        modalTitle.textContent =
            data.title;


        modalSummary.textContent =
            data.summary;


        modalPoints.innerHTML =
            data.points
                .map(
                    (point) => `
                        <div class="modal-point">
                            ${point}
                        </div>
                    `
                )
                .join("");


        modalTags.innerHTML =
            data.tags
                .map(
                    (tag) => `
                        <span>
                            ${tag}
                        </span>
                    `
                )
                .join("");


        modalRole.textContent =
            data.role;


        modal.classList.add(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "modal-open"
        );

    }


    function closeModal() {

        modal.classList.remove(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "modal-open"
        );

    }


    $$(
        "[data-case-study]"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    openModal(
                        button.dataset.caseStudy
                    );

                }
            );

        }
    );


    close?.addEventListener(
        "click",
        closeModal
    );


    backdrop?.addEventListener(
        "click",
        closeModal
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {

                closeModal();

            }

        }
    );

}


/* =====================================================
   SMOOTH INTERNAL LINKS
===================================================== */

function initSmoothLinks() {


    $$(
        'a[href^="#"]'
    )
    .forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const selector =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !selector ||
                        selector === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            selector
                        );


                    if (
                        !target
                    ) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({

                        behavior:
                            prefersReducedMotion
                                ? "auto"
                                : "smooth",

                        block:
                            "start"

                    });

                }
            );

        }
    );

}


/* =====================================================
   HERO ORBIT PARALLAX
===================================================== */

function initHeroParallax() {
    if (isTouchDevice || prefersReducedMotion) {
        return;
    }

    const hero = document.querySelector(".hero");
    const orbit = document.querySelector(".hero-orbit-system");
    const interactiveLayers = document.querySelectorAll(".orbit-label, .satellite");

    if (!hero || !orbit) {
        return;
    }

    let mouseX = 0;
    let mouseY = 0;
    let ticking = false;

    hero.addEventListener("mousemove", (event) => {
        const rect = hero.getBoundingClientRect();
        mouseX = (event.clientX - rect.left) / rect.width - 0.5;
        mouseY = (event.clientY - rect.top) / rect.height - 0.5;

        if (!ticking) {
            requestAnimationFrame(() => {
                orbit.style.transform = `translate3d(${mouseX * 20}px, ${mouseY * 15}px, 0)`;
                interactiveLayers.forEach((layer) => {
                    layer.style.transform = `translate3d(${mouseX * 45}px, ${mouseY * 45}px, 0)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    hero.addEventListener("mouseleave", () => {
        requestAnimationFrame(() => {
            orbit.style.transform = "";
            interactiveLayers.forEach((layer) => {
                layer.style.transform = "";
            });
        });
    });
}


/* =====================================================
   INITIALIZATION
===================================================== */

function initializePortfolio() {

    initSpaceBackground();

    initParallaxStars();

    initCursor();

    initNavigation();

    initScrollDock();

    initRevealAnimations();

    initMagneticElements();

    initCaseStudies();

    initSmoothLinks();

    initHeroParallax();

}


window.addEventListener(
    "DOMContentLoaded",
    initializePortfolio
);
