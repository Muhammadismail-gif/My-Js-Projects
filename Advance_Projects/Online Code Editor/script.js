// Default Code
const defaultHTML = `<h1>Hello Ismail 👋</h1>`;
const defaultCSS = `body { color: red; }`;
const defaultJS = `console.log("Working!")`;

// Editors
const htmlEditor = CodeMirror.fromTextArea(
  document.getElementById("html-code"),
  { mode: "xml", theme: "dracula", lineNumbers: true }
);

const cssEditor = CodeMirror.fromTextArea(
  document.getElementById("css-code"),
  { mode: "css", theme: "dracula", lineNumbers: true }
);

const jsEditor = CodeMirror.fromTextArea(
  document.getElementById("js-code"),
  { mode: "javascript", theme: "dracula", lineNumbers: true }
);

// Set default values
htmlEditor.setValue(defaultHTML);
cssEditor.setValue(defaultCSS);
jsEditor.setValue(defaultJS);

// Run Code
function runCode() {
  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();
  const js = jsEditor.getValue();

  const frame = document.getElementById("preview-frame");

  frame.srcdoc = `
    <html>
    <style>${css}</style>
    <body>
      ${html}
      <script>${js}<\/script>
    </body>
    </html>
  `;
}

// Reset Code
function resetCode() {
  htmlEditor.setValue(defaultHTML);
  cssEditor.setValue(defaultCSS);
  jsEditor.setValue(defaultJS);
  runCode();
}

// Buttons
document.getElementById("runBtn").addEventListener("click", runCode);
document.getElementById("resetBtn").addEventListener("click", resetCode);

// Auto run
window.onload = runCode;