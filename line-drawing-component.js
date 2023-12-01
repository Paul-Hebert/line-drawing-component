class LineDrawing extends HTMLElement {
  connectedCallback() {
    this.addGlobalStyles();

    const elements = [...document.querySelectorAll("path")];

    elements.forEach((element) => {
      element.style.setProperty("--line-length", element.getTotalLength());
    });
  }

  addGlobalStyles() {
    const id = "line-drawing-styles";

    if (!document.querySelector("#" + id)) {
      const styleTag = document.createElement("style");
      styleTag.id = id;

      styleTag.innerHTML = `
:root {
  --line-drawing-duration: 0.5s;
  --line-drawing-easing: ease-out;
}

line-drawing :where(path) {
  animation: 
    line-drawing-stroke 
    var(--line-drawing-duration) 
    var(--line-drawing-easing)
    forwards;
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

// Define our custom element so it can be used.
customElements.define("line-drawing", LineDrawing);
