const BPromise = require("bluebird");
const merge = require("lodash/merge");
const { Builder, By, Browser, Capabilities, until, Key } = require("selenium-webdriver");
const proxy = require("selenium-webdriver/proxy");

const Task = require("./Task");
const DragAndDrop = require("./html_dnd");
const { httpRequest } = require("../utils");
const { TestStatus, SleepTimingType /*, ScreenshotConditionType*/ } = require("../constants");

const WebActionTypes = require("../config/web_action_types.json");
const ActionsTypes = Object.keys(WebActionTypes);

class TestRunner extends Task {
  constructor(taskInfo) {
    super(taskInfo);
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

    if (global.config.proxy) {
      chromeCapabilities.setProxy({
        httpProxy: global.config.proxy
      });
      args.push("--proxy=" + global.config.proxy);
    }

    if (global.config.bypass) {
      args.push("--proxy-bypass-list=" + global.config.bypass);
    }
    chromeCapabilities.set("chromeOptions", { args });
    chromeCapabilities.set("se:recordVideo", "true");
    chromeCapabilities.set("se:timeZone", "Asia/Kolkata");
    chromeCapabilities.set("se:screenResolution", "1920x1080");
    chromeCapabilities.set("excludeSwitches", ["enable-logging"]);

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
    this.setBuildProperties("seleniumSession", await this.WebDriver.getSession());
    logger.info("WebTestRunner WINSIZE:", winSize);
    return BPromise.resolve(true);
  }

  async stepExecutor(accumulator, event) {
    let stepOutcome = {
      stepNo: accumulator.length + 1,
      result: TestStatus.RUNNING,
      startTime: Date.now(),
      type: event.actionType,
      event
    };

    if (event.enabled && this.shouldTaskContinue()) {
      try {
        if (ActionsTypes.includes(event.actionType)) {
          if (this.sleepTimingType === SleepTimingType.Before || this.sleepTimingType === SleepTimingType.BeforeAndAfter) {
            logger.info("WebTestRunner:SleepTimingType: Executing Before-", this.sleepTimingType, ", SleepInterval:", this.sleepInterval);
            await this.WebDriver.sleep(this.sleepInterval);
          }

          logger.info("WebTestRunner:Executing:", event.actionType, ", Payload:", event.data);
          const hanndlerOutput = await this.getActionHandler(event.actionType, event.data);
          logger.info("WebTestRunner:Outcome:", event.actionType, ", Outcome:", JSON.stringify(hanndlerOutput));
          stepOutcome = merge({}, stepOutcome, hanndlerOutput);
          logger.info("WebTestRunner:Merged Outcome", event.actionType, ", Outcome:", JSON.stringify(stepOutcome));
          if (this.sleepTimingType === SleepTimingType.After || this.sleepTimingType === SleepTimingType.BeforeAndAfter) {
            logger.info("WebTestRunner:SleepTimingType: Executing After-", this.sleepTimingType, ", SleepInterval:", this.sleepInterval);
            await this.WebDriver.sleep(this.sleepInterval);
          }
        } else {
          logger.info("WebTestRunner:Skipping:", event.actionType);
          stepOutcome.actual = "Test step is skipped, Invalid action type";
          stepOutcome.result = TestStatus.SKIP;
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
      stepOutcome.actual = "Test step is skipped";
      stepOutcome.result = TestStatus.SKIP;
    }
    stepOutcome.endTime = Date.now();
    stepOutcome.stepTime = stepOutcome.endTime - stepOutcome.startTime;
    this.addStep(stepOutcome);
    return accumulator.concat(stepOutcome);
  }

  async execute() {
    this.steps = await BPromise.reduce(this.execSteps, this.stepExecutor, []);
    const outcome = this.steps.find((s) => s.result === TestStatus.FAIL) || { result: TestStatus.PASS };
    this.actual = { actualResult: outcome };
    this.result = outcome?.result;
    if (this.result === TestStatus.PASS) {
      await this.captureScreenshot("Evidence");
    }
    return Promise.resolve(true);
  }

  async captureScreenshot(stepNo) {
    if (this._interruptTask) {
      return Promise.resolve(false);
    }
    try {
      const image = await this.WebDriver.takeScreenshot();
      let buffer = Buffer.from(image, "base64").toJSON();
      if (buffer.data?.length === 0) return Promise.resolve(true);
      buffer = Buffer.from(buffer, "binary").toString("base64");
      this.emit("CAPTURE_SCREENSHOT", {
        taskId: this._taskId,
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
    return Promise.resolve(true);
  }

  async stop() {
    try {
      await this.WebDriver.quit();
    } catch (error) {
      logger.error("WebTestRunner, Failed to cleanup", error);
    }
    const seleniumSession = this.getBuildProperties("seleniumSession");

    if (global.config.SELENIUM_GRID_URL && seleniumSession) {
      await httpRequest({
        method: "DELETE",
        baseUrl: global.config.SELENIUM_GRID_URL,
        uri: `/session/${seleniumSession.getId()}`
      });
    }
  }

  async getActionHandler(actionType, data) {
    const getElement = (by, ele, UntilType = "elementLocated") => this.WebDriver.wait(until[UntilType](By[by](ele)), 10000);

    const Handlers = {
      captureScreenshot: async () => {
        await this.captureScreenshot("Capture");
      },
      navigateToURL: async ({ value, interval = 5000 }) => {
        await this.WebDriver.get(value);
        if (interval > 0) {
          await this.WebDriver.sleep(interval);
        }
        return {
          result: TestStatus.PASS
        };
      },
      delay: async ({ interval = 1000 }) => {
        do {
          await this.WebDriver.getTitle();
          await this.WebDriver.sleep(5000);
          interval -= 5000;
        } while (interval > 0);
        return {
          result: TestStatus.PASS
        };
      },
      click: async ({ by, element }) => {
        const webElement = await getElement(by, element);
        const actual = await webElement.click();
        await this.WebDriver.sleep(1000);
        return {
          actual,
          result: TestStatus.PASS
        };
      },
      doubleClick: async ({ by, element }) => {
        const webElement = await getElement(by, element);
        return {
          actual: await this.WebDriver.actions({ async: true }).doubleClick(webElement).perform(),
          result: TestStatus.PASS
        };
      },
      setText: async ({ by, element, value }) => {
        const webElement = await getElement(by, element);
        await webElement.clear();

        const array = String(value).split("\n");
        let actual;
        for (let index = 0; index < array.length; index++) {
          const text = array[index];
          actual = await webElement.sendKeys(text);
          if (array.length > 1) {
            await this.WebDriver.actions().keyDown(Key.ENTER).keyUp(Key.ENTER).perform();
          }
        }
        return {
          actual,
          result: TestStatus.PASS
        };
      },
      setEditorText: async ({ value }) => {
        const webElement = await getElement("css", "textarea.ace_text-input");
        await this.WebDriver.executeScript("ace.edit('ace-editor').setValue('');");
        await this.WebDriver.executeScript("ace.edit('ace-editor').navigateFileEnd();");
        await webElement.clear();
        await this.WebDriver.sleep(1000);
        return {
          actual: await webElement.sendKeys(value),
          result: TestStatus.PASS
        };
      },
      reactSelectDropDown: async ({ element, value }) => {
        const webElement = await getElement("xpath", `//*[@id="select-${element}"]/div/div[1]/div[2]`);
        await webElement.click();
        await this.WebDriver.sleep(3000);
        const inputElement = await getElement("xpath", "/html/body");
        await this.WebDriver.sleep(1000);
        const option = await inputElement.findElement(By.xpath(`//div[text()='${value}']`));
        return {
          actual: await option.click(),
          result: TestStatus.PASS
        };
      },
      dragAndDrop: async ({ by, from, to }) => {
        const draggableElement = await getElement(by, from);
        const droppableElement = await getElement(by, to);
        return {
          actual: await this.WebDriver.actions().dragAndDrop(draggableElement, droppableElement).perform(),
          result: TestStatus.PASS
        };
      },
      dragAndDropBy: async ({ by, from, to, x, y }) => {
        const draggableElement = await getElement(by, from);
        const droppableElement = await getElement(by, to);
        return {
          actual: await this.WebDriver.executeScript(DragAndDrop, draggableElement, droppableElement, { dropOffset: [x, y] }),
          result: TestStatus.PASS
        };
      },
      verifyElementHasTextValue: async ({ by, element, value }) => {
        const webElement = await getElement(by, element);
        const text = await webElement.getText();
        return {
          actual: text,
          result: text === value ? TestStatus.PASS : TestStatus.FAIL
        };
      },
      verifyElementVisible: async ({ by, element }) => {
        const webElement = await getElement(by, element);
        const isDisplayed = await webElement.isDisplayed();
        return {
          actual: isDisplayed,
          result: isDisplayed ? TestStatus.PASS : TestStatus.FAIL
        };
      },
      verifyElementNotVisible: async ({ by, element }) => {
        const webElement = await getElement(by, element);
        const isDisplayed = await webElement.isDisplayed();
        return {
          actual: isDisplayed,
          result: !isDisplayed ? TestStatus.PASS : TestStatus.FAIL
        };
      },
      verifyElementPresent: async ({ by, element }) => {
        const webElement = await getElement(by, element);
        const isDisplayed = await webElement.isDisplayed();
        return {
          actual: isDisplayed,
          result: isDisplayed ? TestStatus.PASS : TestStatus.FAIL
        };
      },
      verifyElementNotPresent: async ({ by, element }) => {
        const webElement = await getElement(by, element);
        const isDisplayed = await webElement.isDisplayed();
        return {
          actual: isDisplayed,
          result: !isDisplayed ? TestStatus.PASS : TestStatus.FAIL
        };
      },
      verifyElementAttributeValue: async ({ by, element, value, attribute = "value" }) => {
        const webElement = await getElement(by, element);
        const attrValue = await webElement.getAttribute(attribute);
        return {
          actual: attrValue,
          result: value === attrValue ? TestStatus.PASS : TestStatus.FAIL
        };
      },
      verifyElementChecked: async ({ by, element }) => {
        const webElement = await getElement(by, element);
        const isSelected = await webElement.isSelected();
        return {
          actual: isSelected,
          result: isSelected ? TestStatus.PASS : TestStatus.FAIL
        };
      },
      verifyElementNotChecked: async ({ by, element }) => {
        const webElement = await getElement(by, element);
        const isSelected = await webElement.isSelected();
        return {
          actual: isSelected,
          result: !isSelected ? TestStatus.PASS : TestStatus.FAIL
        };
      },
      verifyElementClickable: async ({ by, element }) => {
        const webElement = await getElement(by, element);
        return {
          actual: typeof webElement.click === "funciton",
          result: typeof webElement.click === "funciton" ? TestStatus.PASS : TestStatus.FAIL
        };
      },
      verifyElementNotClickable: async ({ by, element }) => {
        const webElement = await getElement(by, element);
        return {
          actual: typeof webElement.click !== "funciton",
          result: typeof webElement.click !== "funciton" ? TestStatus.PASS : TestStatus.FAIL
        };
      },
      verifyElementHasAttribute: async ({ by, element, attribute }) => {
        const webElement = await getElement(by, element);
        const attr = await webElement.getAttribute(attribute);
        return {
          actual: attr,
          result: attr !== null ? TestStatus.PASS : TestStatus.FAIL
        };
      },
      verifyElementNotHasAttribute: async ({ by, element, attribute }) => {
        const webElement = await getElement(by, element);
        const attr = await webElement.getAttribute(attribute);
        return {
          actual: attr,
          result: attr === null ? TestStatus.PASS : TestStatus.FAIL
        };
      }
    };

    return await Handlers[actionType](data);
  }
}

module.exports = TestRunner;
