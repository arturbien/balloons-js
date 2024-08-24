import { balloons } from "../src/index";

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("inflateButton");

  button?.addEventListener("click", async () => {
    await balloons();
    alert("DONE");
  });
});
