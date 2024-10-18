import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Visual Test Creation",
    description: "Create a project and Suites, Write test cases, Enable/Disable suite."
  },
  {
    title: "Plan and Organize",
    description: "Create smart test suites, tag tests and schedule test runs."
  },
  {
    title: "Test Reports",
    description: "Automation test report PDF exports"
  },
  {
    title: "No Cost",
    description: "free-to-use framework"
  }
];

function Feature({ title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <>{description}</>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
