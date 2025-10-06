// Example file with various web features

// Baseline features
async function fetchData() {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  return data;
}

// Observers
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Element is visible');
    }
  });
});

// Modern JavaScript
const user = { name: 'John', age: 30 };
const { name, ...rest } = user;

const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);

// ES6 features
class MyComponent {
  constructor() {
    this.state = new Map();
  }
}

// Template literals
const message = `Hello, ${name}!`;

// LocalStorage
localStorage.setItem('user', JSON.stringify(user));

// Promise
Promise.all([fetch('/api/1'), fetch('/api/2')])
  .then(responses => console.log(responses));
