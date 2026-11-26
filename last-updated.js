/* Renders "Page last updated: <date>" from the freshest retrieved_at in predictions.json. */
(function () {
  var tags = document.querySelectorAll("[data-last-updated]");
  if (!tags.length) return;

  fetch("predictions.json", { cache: "no-store" })
    .then(function (res) { return res.json(); })
    .then(function (items) {
      var times = (items || [])
        .map(function (item) { return item && item.retrieved_at; })
        .filter(Boolean)
        .map(function (d) { return new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? d + "T00:00:00" : d); })
        .filter(function (d) { return !isNaN(d.getTime()); });

      if (!times.length) return;

      var latest = new Date(Math.max.apply(null, times));
      var label = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(latest);

      tags.forEach(function (el) {
        el.textContent = "Page last updated: " + label;
        el.hidden = false;
        el.setAttribute("datetime", latest.toISOString().slice(0, 10));
      });
    })
    .catch(function () { /* leave hidden if the data can't be loaded */ });
})();
