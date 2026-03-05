/**
 * Throttling means limiting how often an action can run in a given time period.
 * Instead of running a function every time an event happens, throttling allows it to run only once every fixed interval.
 */

function throttling(func, delay) {
  let prevCallTime = 0;
  return function (...args) {
    let now = Date.now();
    if (now - prevCallTime >= delay) {
      prevCallTime = now;
      return func(...args);
    }
  };
}

function search(text) {
  console.log(`Searching for ${text}`);
}

searchThrottle = throttling(search, 300);

// searchThrottle("Hi");
// searchThrottle("Hi! How");
// searchThrottle("Hi! How are");
// searchThrottle("Hi! How are you?");
// searchThrottle("Hi2");
// searchThrottle("Hi! How2");
// searchThrottle("Hi! How are2");
// searchThrottle("Hi! How are you?2");

setTimeout(() => {
  searchThrottle("Hi");
}, 200);
setTimeout(() => {
  searchThrottle("Hi! How");
}, 400);
setTimeout(() => {
  searchThrottle("Hi! How are");
}, 600);
setTimeout(() => {
  searchThrottle("Hi! How are you?");
}, 800);
setTimeout(() => {
  searchThrottle("Hi2");
}, 1000);
setTimeout(() => {
  searchThrottle("Hi! How2");
}, 1200);
setTimeout(() => {
  searchThrottle("Hi! How are2");
}, 1400);
setTimeout(() => {
  searchThrottle("Hi! How are you?2");
}, 1600);
