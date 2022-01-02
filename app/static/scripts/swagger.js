(function () {
  window.addEventListener("load", function () {
    setTimeout(function () {
      const opens = document.querySelectorAll(".is-open");
      opens.forEach(el => {
        el.children[0].click();
      })
    });
  });
})();