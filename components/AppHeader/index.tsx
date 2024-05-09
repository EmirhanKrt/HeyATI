import Link from "next/link";

export const AppHeader = ({
  pageTitle,
}: {
  pageTitle: "Private Message" | "Dashboard" | "Server";
}) => {
  let isHomeButtonActive = false;

  if (pageTitle === "Private Message" || pageTitle === "Dashboard") {
    isHomeButtonActive = true;
  }
  return (
    <div className="app-header">
      <div className="app-header-title">
        <div
          className={`navigation-panel-server-navigation-list-item ${
            isHomeButtonActive ? "active" : ""
          }`}
        >
          <Link href={`/`}>
            <svg
              stroke="currentColor"
              fill="currentColor"
              viewBox="0 0 20 20"
              height="20px"
              width="20px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z"
                clipRule="evenodd"
              ></path>
            </svg>
          </Link>
        </div>
        <h4>{pageTitle}</h4>
      </div>
      <div className="app-header-search">
        <input type="text" placeholder="Search ..." />
      </div>
      <div className="app-header-notification"></div>
    </div>
  );
};
