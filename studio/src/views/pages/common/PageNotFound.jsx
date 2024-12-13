import { Centered } from "@utilities/.";
import { Page, PageBody } from "./PageLayoutComponents";

const PageNotFound = () => {
  return (
    <Page>
      <Centered>
        <img src="/assets/img/404.svg" className="w-96 h-96" />
      </Centered>
    </Page>
  );
};

export default PageNotFound;
