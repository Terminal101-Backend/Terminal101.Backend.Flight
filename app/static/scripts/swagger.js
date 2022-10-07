(function () {
  window.addEventListener("load", function () {
    setTimeout(function () {
      const elBaseUrl = document.querySelector(".base-url");
      elBaseUrl.innerHTML = `[ Base URL: ${window.location.origin} ]`;

      const opens = document.querySelectorAll(".is-open");
      opens.forEach(el => {
        el.children[0].click();
      })
    });
  });
})();