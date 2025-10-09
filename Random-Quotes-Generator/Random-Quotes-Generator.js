 const quotes = [
      "The best way to get started is to quit talking and begin doing. – Walt Disney",
      "Don’t let yesterday take up too much of today. – Will Rogers",
      "It’s not whether you get knocked down, it’s whether you get up. – Vince Lombardi",
      "If you are working on something exciting, it will keep you motivated. – Steve Jobs",
      "Success is not in what you have, but who you are. – Bo Bennett",
      "Your limitation—it’s only your imagination.",
      "Push yourself, because no one else is going to do it for you."
    ];

    const quoteElement = document.getElementById('quote');
    const btn = document.getElementById('newQuote');

    btn.addEventListener('click', () => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      quoteElement.textContent = quotes[randomIndex];
    });