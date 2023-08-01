const { Builder, By, Browser, Capabilities, until } = require("selenium-webdriver");
const proxy = require("selenium-webdriver/proxy");
const BPromise = require("bluebird");
const DND = require("html-dnd").code;
const SleepTimingType = require("../enums/SleepTimingType");
//const ScreenshotConditionType = require("../enums/ScreenshotConditionType");
const WebActionTypes = require("../../config/web_action_types.json");
const TestStatus = require("../enums/TestStatus");
const merge = require("lodash/merge");
const Job = require("./Job");

const ActionsTypes = Object.keys(WebActionTypes);
class TestRunner extends Job {
  constructor(job) {
    super(job);
    this.settings.capability = this.settings.capability || "chrome";
    this.sleepTimingType = this.settings.sleep?.timeType;
    this.sleepInterval = this.settings.sleep?.interval;
    this.Builder = new Builder();

    if (global.config.SELENIUM_GRID_URL) {
      this.Builder.usingServer(global.config.SELENIUM_GRID_URL);
    }

    const chromeCapabilities = Capabilities.chrome();
    chromeCapabilities.setBrowserVersion("114.0");
    chromeCapabilities.setAcceptInsecureCerts(true);
    const args = [
      "--window-size=1920,1080",
      "--test-type",
      "--incognito",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--ignore-certificate-errors",
      "--ignore-ssl-errors",
      "--ignore-certificate-errors-spki-list",
      "--proxy-bypass-list=127.0.0.1,localhost,10.*",
      "--tls1.2"
    ];

    if (global.config.bypass) {
      args.push("--proxy-bypass-list=" + global.config.bypass);
    }
    chromeCapabilities.set("chromeOptions", { args });
    chromeCapabilities.set("se:recordVideo", "true");
    chromeCapabilities.set("se:timeZone", "Asia/Kolkata");
    chromeCapabilities.set("se:screenResolution", "1920x1080");
    this.Builder.forBrowser(Browser.CHROME).withCapabilities(chromeCapabilities);
    if (global.config.bypass) {
      this.Builder.setProxy(
        proxy.manual({
          bypass: global.config.bypass
        })
      );
    }
    this.WebDriver = this.Builder.build();
    this.stepExecutor = this.stepExecutor.bind(this);
  }

  async before() {
    const manage = this.WebDriver.manage();
    manage.setTimeouts({ implicit: 300000, pageLoad: 30000 });
    await manage.window().maximize();
    const winSize = await manage.window().getSize();
    this.extras.seleniumSession = await this.WebDriver.getSession();
    logger.info("WebTestRunner WINSIZE:", winSize);
    this.notifyJob(TestStatus.RUNNING);
    return BPromise.resolve(true);
  }

  async stepExecutor(accumulator, event) {
    let stepOutcome = {
      stepNo: accumulator.length + 1,
      result: TestStatus.RUNNING,
      startTime: Date.now(),
      type: event.actionType,
      event: event
    };

    if (event.enabled && !this.stopRunning && !this.skipSteps) {
      try {
        if (ActionsTypes.includes(event.actionType)) {
          if (this.sleepTimingType === SleepTimingType.Before || this.sleepTimingType === SleepTimingType.BeforeAndAfter) {
            logger.info("WebTestRunner:SleepTimingType: Executing Before-", this.sleepTimingType, ", SleepInterval:", this.sleepInterval);
            await this.WebDriver.sleep(this.sleepInterval);
          }

          logger.info("WebTestRunner:Executing:", event.actionType, ", Payload:", event.data);
          const hanndlerOutput = await getActionHandler(this.WebDriver, event.actionType, event.data);
          logger.info("WebTestRunner:Outcome:", event.actionType, ", Outcome:", JSON.stringify(hanndlerOutput));
          stepOutcome = merge({}, stepOutcome, hanndlerOutput);
          logger.info("WebTestRunner:Merged Outcome", event.actionType, ", Outcome:", JSON.stringify(stepOutcome));
          if (this.sleepTimingType === SleepTimingType.After || this.sleepTimingType === SleepTimingType.BeforeAndAfter) {
            logger.info("WebTestRunner:SleepTimingType: Executing After-", this.sleepTimingType, ", SleepInterval:", this.sleepInterval);
            await this.WebDriver.sleep(this.sleepInterval);
          }
        } else {
          logger.info("WebTestRunner:Skipping:", event.actionType);
          stepOutcome.result = TestStatus.SKIP;
          stepOutcome.actual = "Invalid test case";
        }
      } catch (e) {
        logger.error("WebTestRunner:stepExecutor", e);
        stepOutcome.result = TestStatus.FAIL;
        stepOutcome.actual = e.message;
      }
      if (stepOutcome.result === TestStatus.FAIL) {
        await this.captureScreenshot(stepOutcome.stepNo);
      }
    } else {
      stepOutcome.actual = "Test case is disabled";
      stepOutcome.result = TestStatus.SKIP;
    }
    stepOutcome.endTime = Date.now();
    stepOutcome.stepTime = stepOutcome.endTime - stepOutcome.startTime;
    this.addStep(stepOutcome);
    return accumulator.concat(stepOutcome);
  }

  async execute() {
    this.steps = await BPromise.reduce(this.testcase?.execSteps, this.stepExecutor, []);
    const outcome = this.steps.find((s) => s.result === TestStatus.FAIL) || { result: TestStatus.PASS };
    this.actual = { actualResult: outcome };
    this.result = outcome?.result;
    if (this.result === TestStatus.PASS) {
      await this.captureScreenshot("Evidence");
    }
    return Promise.resolve(true);
  }

  async captureScreenshot(stepNo) {
    try {
      const image = await this.WebDriver.takeScreenshot();
      let buffer = Buffer.from(image, "base64").toJSON();
      if (buffer.data?.length === 0) return Promise.resolve(true);
      buffer = Buffer.from(buffer, "binary").toString("base64");
      return await this.saveScreenshot({
        stepNo,
        buffer
      });
    } catch (e) {
      logger.error("WebTestRunner:captureScreenshot", e);
      return Promise.resolve(true);
    }
  }

  async after() {
    await this.WebDriver.close();
    await this.WebDriver.quit();
    return Promise.resolve(true);
  }

  async stop() {
    await this.WebDriver.close();
  }
}

module.exports = TestRunner;

async function getActionHandler(driver, type, data) {
  const getElement = (by, ele, type = "elementLocated") => driver.wait(until[type](By[by](ele)), 5000);

  const Handlers = {
    navigateToURL: async ({ value, interval = 5000 }) => {
      await driver.get(value);
      await driver.sleep(interval);
      return {
        result: TestStatus.PASS
      };
    },
    delay: async ({ interval = 1000 }) => {
      await driver.sleep(interval);
      return {
        result: TestStatus.PASS
      };
    },
    click: async ({ by, element }) => {
      const webElement = await getElement(by, element);
      const rs = await webElement?.click();
      return {
        actual: rs,
        result: TestStatus.PASS
      };
    },
    doubleClick: async ({ by, element }) => {
      const webElement = await getElement(by, element);
      const rs = await driver.actions({ async: true }).doubleClick(webElement).perform();

      return {
        actual: rs,
        result: TestStatus.PASS
      };
    },
    setText: async ({ by, element, value }) => {
      const webElement = await getElement(by, element);
      await webElement?.clear();
      return {
        actual: await webElement?.sendKeys(value),
        result: TestStatus.PASS
      };
    },
    setEditorText: async ({ value }) => {
      const webElement = await getElement("css", "textarea.ace_text-input");
      await driver.executeScript("ace.edit('ace-editor').setValue('');");
      await driver.executeScript("ace.edit('ace-editor').navigateFileEnd();");
      await webElement?.clear();
      return {
        actual: await webElement?.sendKeys(value),
        result: TestStatus.PASS
      };
    },
    dragAndDrop: async ({ by, from, to, x, y }) => {
      const draggableElement = await getElement(by, from);
      const droppableElement = await getElement(by, to);
      return {
        actual: await driver.executeScript(DND, draggableElement, droppableElement, {
          dropOffset: [x, y]
        }),
        result: TestStatus.PASS
      };
    },
    verifyElementHasTextValue: async ({ by, element, value }) => {
      const webElement = await getElement(by, element);
      const text = await webElement?.getText();
      return {
        actual: text,
        result: text === value ? TestStatus.PASS : TestStatus.FAIL
      };
    },
    verifyElementVisible: async ({ by, element }) => {
      const webElement = await getElement(by, element);
      const isDisplayed = await webElement?.isDisplayed();
      return {
        actual: webElement,
        result: isDisplayed ? TestStatus.PASS : TestStatus.FAIL
      };
    },
    verifyElementNotVisible: async ({ by, element }) => {
      const webElement = await getElement(by, element);
      const isDisplayed = await webElement?.isDisplayed();
      return {
        actual: webElement,
        result: !isDisplayed ? TestStatus.PASS : TestStatus.FAIL
      };
    },
    verifyElementPresent: async ({ by, element }) => {
      const webElement = await getElement(by, element);
      const isDisplayed = await webElement?.isDisplayed();
      return {
        actual: webElement,
        result: isDisplayed ? TestStatus.PASS : TestStatus.FAIL
      };
    },
    verifyElementNotPresent: async ({ by, element }) => {
      const webElement = await getElement(by, element);
      const isDisplayed = await webElement?.isDisplayed();
      return {
        actual: webElement,
        result: !isDisplayed ? TestStatus.PASS : TestStatus.FAIL
      };
    },
    verifyElementAttributeValue: async ({ by, element, value, attribute = "value" }) => {
      const webElement = await getElement(by, element);
      const attrValue = await webElement?.getAttribute(attribute);
      return {
        actual: attrValue,
        result: value === attrValue ? TestStatus.PASS : TestStatus.FAIL
      };
    },
    verifyElementChecked: async ({ by, element }) => {
      const webElement = await getElement(by, element);
      const isSelected = await webElement?.isSelected();
      return {
        actual: webElement,
        result: isSelected ? TestStatus.PASS : TestStatus.FAIL
      };
    },
    verifyElementNotChecked: async ({ by, element }) => {
      const webElement = await getElement(by, element);
      const isSelected = await webElement?.isSelected();
      return {
        actual: webElement,
        result: !isSelected ? TestStatus.PASS : TestStatus.FAIL
      };
    },
    verifyElementClickable: async ({ by, element }) => {
      const webElement = await getElement(by, element);
      return {
        actual: webElement,
        result: typeof webElement?.click === "funciton" ? TestStatus.PASS : TestStatus.FAIL
      };
    },
    verifyElementNotClickable: async ({ by, element }) => {
      const webElement = await getElement(by, element);
      return {
        actual: webElement,
        result: typeof webElement?.click !== "funciton" ? TestStatus.PASS : TestStatus.FAIL
      };
    },
    verifyElementHasAttribute: async ({ by, element, attribute }) => {
      const webElement = await getElement(by, element);
      const attr = webElement?.getAttribute(attribute);
      return {
        actual: attr,
        result: attr !== null ? TestStatus.PASS : TestStatus.FAIL
      };
    },
    verifyElementNotHasAttribute: async ({ by, element, attribute }) => {
      const webElement = await getElement(by, element);
      const attr = webElement?.getAttribute(attribute);
      return {
        actual: attr,
        result: attr === null ? TestStatus.PASS : TestStatus.FAIL
      };
    }
  };

  return await Handlers[type](data);
}
