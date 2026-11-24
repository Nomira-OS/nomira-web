// Copy buttons for code blocks. Without JavaScript or without the
// clipboard API nothing changes: the blocks stay selectable as before.
(function () {
  "use strict";
  if (!navigator.clipboard || !window.isSecureContext) return;

  var status = document.createElement("p");
  status.className = "visually-hidden";
  status.setAttribute("aria-live", "polite");
  document.body.appendChild(status);

  var blocks = document.querySelectorAll("main pre");
  for (var i = 0; i < blocks.length; i++) {
    var pre = blocks[i];
    var wrap = document.createElement("div");
    wrap.className = "code";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "copy";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code");
    wrap.appendChild(button);

    button.addEventListener("click", (function (pre, button) {
      return function () {
        var text = pre.innerText.replace(/\n$/, "");
        navigator.clipboard.writeText(text).then(function () {
          button.textContent = "Copied";
          status.textContent = "Code copied to the clipboard";
          setTimeout(function () {
            button.textContent = "Copy";
            status.textContent = "";
          }, 2000);
        }, function () {
          status.textContent = "Copying failed. Select the code and copy it by hand.";
        });
      };
    })(pre, button));
  }
})();
