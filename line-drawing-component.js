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

    this.classList.add("is-drawing");
  }

  configureSettings() {
    this.drawingMode = this.getAttribute("drawing-mode") || "simultaneous";
    this.duration = this.getAttribute("duration-ms") || 2000;
    this.staggeredRatio = this.getAttribute("staggered-ratio") || 1.1;
    this.minimumElementDuration =
      this.getAttribute("minimum-element-duration-ms") || 100;
  }

  addCustomProps() {
    // Grab all of the supported elements that have strokes
    const elements = [
      ...this.querySelectorAll(this.supportedElements.join(", ")),
    ].filter(
      (el) => window.getComputedStyle(el).getPropertyValue("stroke") !== "none"
    );

    // Define a couple of variables that will be used in the "staggered mode"
    let currentDelay = 0;
    let totalLength = 0;

    // If we're doing a staggered drawing, we'll determine each strokes's
    // animation duration based on what percentage of the overall line length
    // the stroke contains. We need to get the total length
    if (this.drawingMode === "staggered") {
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
      element.style.setProperty("--line-length", length);

      // If we're in staggered mode, each stroke's animation takes a percentage
      // of the overall duration based on its relative length.
      // If we're in simultaneous mode, all strokes animate for the full duration.
      let duration =
        this.drawingMode === "staggered"
          ? (this.duration * length) / totalLength
          : this.duration;

      if (duration < this.minimumElementDuration) {
        duration = this.minimumElementDuration;
      }

      element.style.setProperty("--duration", `${duration}ms`);

      // In staggered mode we'll add delays to each element so they run in
      // a sequence
      if (this.drawingMode === "staggered") {
        element.style.setProperty("--delay", `${currentDelay}ms`);

        // TODO: handle the staggered ratio
        currentDelay += duration * 1.1;
      }
    });
  }

  addGlobalStyles() {
    const id = "line-drawing-styles";

    if (!document.querySelector("#" + id)) {
      const styleTag = document.createElement("style");
      styleTag.id = id;

      styleTag.innerHTML = `
:root {
  --easing: ease-out;
}

line-drawing.is-drawing .stroked {
  animation: 
    line-drawing-stroke 
    var(--duration)
    var(--easing)
    forwards;
  animation-delay: var(--delay, 0);
  stroke-dasharray: var(--line-length);
  stroke-dashoffset: var(--line-length);
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

customElements.define("line-drawing", LineDrawing);
