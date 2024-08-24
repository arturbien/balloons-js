import { balloons } from "../src/index";

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("releastBalloonsButton");

  button?.addEventListener("click", async () => {
    await balloons();
  });
});
