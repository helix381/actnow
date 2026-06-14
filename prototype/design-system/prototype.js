document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-open]");
  if (!target) return;
  const href = target.getAttribute("data-open");
  if (href) window.location.href = href;
});
