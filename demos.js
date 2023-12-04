let uploadedSvg;

const uploadInput = document.querySelector(".js-upload");
const uploadWrapper = document.querySelector(".js-file-upload-wrapper");
const uploadModeCheckbox = document.querySelector(".js-upload-drawing-mode");
const replayButtons = document.querySelectorAll(".js-replay");
const demoExamples = document.querySelectorAll(".demo-example");

uploadInput.addEventListener("change", (e) => {
  const reader = new FileReader();
  reader.onload = function (e) {
    uploadedSvg = e.target.result;
    insertUploadedExample();
  };
  reader.readAsText(uploadInput.files[0]);
});
uploadModeCheckbox.addEventListener("change", insertUploadedExample);

function insertUploadedExample() {
  if (!uploadedSvg) return;

  uploadWrapper.innerHTML = /* html */ `
    <line-drawing drawing-mode="${
      uploadModeCheckbox.checked ? "series" : "simultaneous"
    }">
      ${uploadedSvg}

      <button class="replay">Replay</button>
    </line-drawing>
  `;
  uploadWrapper.removeAttribute("hidden");
}

demoExamples.forEach((example) => {
  example.addEventListener("click", (e) => {
    if (e.target.classList.contains("replay")) {
      example.innerHTML = example.innerHTML + " ";
    }
  });
});
