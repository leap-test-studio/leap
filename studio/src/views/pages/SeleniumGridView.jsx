import { useContext } from "react";
import WebContext from "@WebContext";

import { PageHeader, Page, PageBody, PageTitle } from "./common/PageLayoutComponents";

export default function SeleniumGridView({ pageTitle }) {
  const { windowDimension } = useContext(WebContext);
  const padding = 50;

  return (
    <Page>
      <PageHeader>
        <PageTitle>{pageTitle}</PageTitle>
      </PageHeader>
      <PageBody>
        <iframe width="100%" height={windowDimension?.maxContentHeight - padding} src="/ui" title={pageTitle} style={{ marginTop: -65 }} />
      </PageBody>
    </Page>
  );
}
