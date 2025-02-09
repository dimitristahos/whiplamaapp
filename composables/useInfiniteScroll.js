export default function createInfiniteScroll(config = {}) {
  // Default configuration with destructuring
  const {
    threshold = 1000, // Distance from bottom (in pixels) to trigger
    throttleDelay = 1000, // Delay in milliseconds to prevent multiple triggers
    onTrigger = () => {
      alert("ook");
    }, // Callback function when scroll trigger occurs
  } = config;

  // Keep track of last scroll position to determine direction
  let lastScrollY = 0;

  // Flag to prevent multiple triggers while loading
  let isLoading = false;

  // Throttle function to limit how often the scroll check runs
  function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Function to check if user has scrolled to bottom
  function isNearBottom() {
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold;
  }

  // Main scroll handler
  const handleScroll = throttle(() => {
    const currentScrollY = window.scrollY;

    // Only trigger if scrolling down and not currently loading
    if (currentScrollY > lastScrollY && !isLoading && isNearBottom()) {
      isLoading = true;

      // Call the trigger callback
      Promise.resolve(onTrigger()).finally(() => {
        isLoading = false;
      });
    }

    lastScrollY = currentScrollY;
  }, throttleDelay);

  // Clean up function to remove event listener
  const cleanup = () => {
    window.removeEventListener("scroll", handleScroll);
  };

  // Initialize scroll listener
  const init = () => {
    // Set initial scroll position
    lastScrollY = window.scrollY;
    window.addEventListener("scroll", handleScroll);
  };

  return {
    init,
    cleanup,
    // Method to manually set loading state
    setLoading: (state) => {
      isLoading = state;
    },
  };
}
