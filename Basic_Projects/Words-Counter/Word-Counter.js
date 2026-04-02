document.getElementById("textInput").addEventListener("input", function () {
    let text = this.value.trim();

    // Word count
    let words = text === "" ? 0 : text.split(/\s+/).length;

    // Letter count (excluding spaces)
    let letters = text.replace(/\s+/g, "").length;

    // Display results
    document.getElementById("wordCount").innerText = words;
    document.getElementById("letterCount").innerText = letters;
});
