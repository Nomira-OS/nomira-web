// Theme toggle. Without JavaScript the site follows the system setting;
// the button stays hidden then.
(function () {
  var root = document.documentElement;
  var button = document.getElementById("theme-toggle");
  if (!button) return;

  function current() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function render() {
    // Icon and name say what a click switches to.
    var next = current() === "dark" ? "light" : "dark";
    button.setAttribute("data-next", next);
    button.setAttribute("aria-label", "Switch to " + next + " theme");
    button.setAttribute("title", "Switch to " + next + " theme");
  }
  button.hidden = false;
  render();
  button.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("nomira-theme", next); } catch (e) {}
    render();
  });
})();
