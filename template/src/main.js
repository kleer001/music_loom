// Entry point. Builds the graph lazily on the first gesture — an AudioContext
// created before one starts suspended and stays that way.

const startButton = document.querySelector("#start");
const hint = document.querySelector("#hint");

let ctx = null;

startButton.addEventListener("click", async () => {
  if (!ctx) {
    ctx = new AudioContext();
    // TODO: build the graph here. Keep it offline-renderable — the same
    // builder must run against an OfflineAudioContext for the render harness.
  }
  await ctx.resume();
  hint.textContent = `running at ${ctx.sampleRate} Hz`;
});
