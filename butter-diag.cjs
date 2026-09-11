// Диагностика ButterSquish: открывает preview, включает ADHD+butter, скриншотит, ловит ошибки.
const { launch } = require("puppeteer-core");

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

(async () => {
  const browser = await launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--use-angle=swiftshader", "--enable-webgl", "--window-size=600,900"],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("[console.error] " + m.text());
  });
  page.on("pageerror", (e) => errors.push("[pageerror] " + e.message));

  // включить ADHD + butter через persist-стор
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    localStorage.setItem(
      "ved-lecture",
      JSON.stringify({
        state: {
          xp: 0,
          theme: "light",
          haptics: false,
          adhd: { on: true, subway: false, miku: false, popit: false, butter: true },
        },
        version: 0,
      }),
    );
  });
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2500));

  // консольные ошибки до скриншота
  console.log("ERRORS:", errors.length ? errors.join("\n") : "none");

  await page.screenshot({ path: "/tmp/butter-full.png" });
  console.log("screenshot: /tmp/butter-full.png");
  await browser.close();
})();