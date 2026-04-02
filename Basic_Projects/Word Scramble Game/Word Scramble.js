const words = ["javascript", "programming", "developer", "computer", "scramble", "keyboard", "internet", "function", "variable", "object", "array", "string", "boolean", "condition", "loop", "event", "listener", "document", "element", "style", "window", "browser", "debug", "compile", "execute", "syntax", "algorithm", "data", "structure", "class", "method", "property", "inheritance", "encapsulation", "polymorphism", "abstraction", "interface", "module", "package", "library", "framework", "api", "json", "xml", "http", "https", "server", "client", "database", "query", "index", "cache", "session"];
let currentWord = "";
let scrambled = "";

// Function to shuffle letters of a word
function shuffleWord(word) {
    return word.split("").sort(() => Math.random() - 0.5).join("");
}

// Function to pick a new word and scramble it
function newWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    scrambled = shuffleWord(currentWord);
    document.getElementById("scrambledWord").innerText = scrambled;
    document.getElementById("userInput").value = "";
    document.getElementById("result").innerText = "";
}

// Function to check user answer
function checkAnswer() {
    let userGuess = document.getElementById("userInput").value.toLowerCase();
    if (userGuess === currentWord) {
        document.getElementById("result").innerText = "✅ Correct!";
    } else {
        document.getElementById("result").innerText = `❌ Wrong! The correct word was: ${currentWord}`;
    }
}

// Load a word when the game starts
newWord();
