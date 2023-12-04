class LineDrawing extends HTMLElement {
  supportedElements = [
    "path",
    "circle",
    "rect",
    "line",
    "polyline",
    "polygon",
    "ellipse",
  ];

  connectedCallback() {
    this.configureSettings();
    this.addGlobalStyles();
    this.addCustomProps();

    if (this.triggerMode === "instant") {
      this.play();
    } else if (this.triggerMode === "in-view") {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          const thisElement = entries[0];

          if (thisElement.intersectionRatio > this.visibilityThreshold) {
            this.play();
            intersectionObserver.disconnect();
          }
        },
        { threshold: this.visibilityThreshold }
      );
      intersectionObserver.observe(this);
    }
  }

  play() {
    this.classList.add("is-drawing");
  }

  pause() {
    this.classList.remove("is-drawing");
  }

  configureSettings() {
    this.drawingMode = this.getAttribute("drawing-mode") || "simultaneous";
    this.seriesRatio = this.getAttribute("series-ratio") || 1;
    this.duration = this.getAttribute("duration-ms") || 2000;
    this.minimumElementDuration =
      this.getAttribute("minimum-element-duration-ms") || 100;
    this.triggerMode = this.getAttribute("trigger-mode") || "in-view";
    this.visibilityThreshold = this.getAttribute("visibility-threshold") || 0.5;
  }

  addCustomProps() {
    // Grab all of the supported elements that have strokes
    const elements = [
      ...this.querySelectorAll(this.supportedElements.join(", ")),
    ].filter(
      (el) => window.getComputedStyle(el).getPropertyValue("stroke") !== "none"
    );

    // Define a couple of variables that will be used in the "series mode"
    let currentDelay = 0;
    let totalLength = 0;

    // If we're doing a series drawing, we'll determine each strokes's
    // animation duration based on what percentage of the overall line length
    // the stroke contains. We need to get the total length
    if (this.drawingMode === "series") {
      elements.forEach((element) => {
        // We'll need this value again later. Instead of calling `getTotalLength`
        // twice, we'll store the result as a property on the element.
        element.lineLength = element.getTotalLength();
        totalLength += element.lineLength;
      });
    }

    elements.forEach((element) => {
      element.classList.add("stroked");

      const length = element.lineLength || element.getTotalLength();
      element.style.setProperty("--line-length", length + 1);

      // If we're in series mode, each stroke's animation takes a percentage
      // of the overall duration based on its relative length.
      // If we're in simultaneous mode, all strokes animate for the full duration.
      let duration =
        this.drawingMode === "series"
          ? (this.duration * length) / totalLength / this.seriesRatio
          : this.duration;

      if (duration < this.minimumElementDuration) {
        duration = this.minimumElementDuration;
      }

      element.style.setProperty("--duration", `${duration}ms`);

      // In series mode we'll add delays to each element so they run in
      // a sequence
      if (this.drawingMode === "series") {
        element.style.setProperty("--delay", `${currentDelay}ms`);

        currentDelay += duration * this.seriesRatio;
      }
    });
  }

  addGlobalStyles() {
    const id = "line-drawing-styles";

    if (!document.querySelector("#" + id)) {
      const styleTag = document.createElement("style");
      styleTag.id = id;

      styleTag.innerHTML = /* css */ `
        :root {
          --easing: ease-out;
        }

        line-drawing .stroked {
          animation: 
            line-drawing-stroke 
            var(--duration)
            var(--easing)
            both;
          animation-delay: var(--delay, 0);
          stroke-dasharray: var(--line-length);
          stroke-dashoffset: var(--line-length);
          animation-play-state: paused;
        }

        line-drawing.is-drawing .stroked {
          animation-play-state: running;
        }

        @keyframes line-drawing-stroke {
          to {
            stroke-dashoffset: 0;
          }
        }
      `;

      document.body.append(styleTag);
    }
  }
}

if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
  customElements.define("line-drawing", LineDrawing);
}
