// Debouncing means waiting for a short pause before running an action, so that the action runs only once instead of many times.
// Suppose user is typing some text and in the middle, he stopped for sometime, in that time we will trigger the search for the typed text

function debounceFunc(func, delay) {
  let timeout_id; // This timeout_id will form a closure and all function calls will reference the same timeout_id

  return function wrapperFunc(...args) {
    clearTimeout(timeout_id); // We are first cancelling the previous timeout because before the timeout complete, the user typed other word
    timeout_id = setTimeout(func, delay, ...args);
  };
}

function search(text) {
  console.log(`Searching for ${text}`);
}

searchDebounce = debounceFunc(search, 1000);

searchDebounce("Hi");
searchDebounce("Hi! How");
searchDebounce("Hi! How are");
searchDebounce("Hi! How are you?");

setTimeout(() => {
  searchDebounce("Hi2");
  searchDebounce("Hi! How2");
  searchDebounce("Hi! How are2");
  searchDebounce("Hi! How are you?2");
}, 1000);
