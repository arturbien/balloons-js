import { balloons } from "../src/index";

document.addEventListener("DOMContentLoaded", () => {
  balloons();
  const button = document.getElementById("releastBalloonsButton");

  button?.addEventListener("click", () => {
    balloons();
  });
});
