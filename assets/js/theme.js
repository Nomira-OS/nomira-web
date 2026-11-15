// Theme toggle. Without JavaScript the site follows the system setting;
// the button stays hidden then.
(function () {
  var root = document.documentElement;
  var button = document.getElementById("theme-toggle");
  var label = document.getElementById("theme-toggle-label");
  if (!button || !label) return;

  function current() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function render() {
    // The label names what a click switches to.
    label.textContent = current() === "dark" ? "Helles Design" : "Dunkles Design";
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
