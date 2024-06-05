"use client";

import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";

a11yDark['pre[class*="language-"]'].margin = 0;
a11yDark['pre[class*="language-"]'].borderBottomLeftRadius = 4;
a11yDark['pre[class*="language-"]'].borderBottomRightRadius = 4;
a11yDark['pre[class*="language-"]'].borderTopLeftRadius = 0;
a11yDark['pre[class*="language-"]'].borderTopRightRadius = 0;
a11yDark['pre[class*="language-"]'].backgroundColor =
  "var(--background-color-5)";

const CodeBlock = ({
  language,
  value,
}: {
  language: string;
  value: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) setTimeout(() => setIsCopied(false), 2500);
  }, [isCopied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--background-color-3)",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          padding: "0 .5rem 0 1rem",
        }}
      >
        <p style={{ color: "var(--title-color)" }}>{language}</p>
        <div className="settings-icon-container" onClick={handleCopy}>
          {isCopied ? (
            <svg
              stroke="var(--title-color)"
              fill="var(--title-color)"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16.972,6.251c-0.967-0.538-2.185-0.188-2.72,0.777l-3.713,6.682l-2.125-2.125c-0.781-0.781-2.047-0.781-2.828,0  c-0.781,0.781-0.781,2.047,0,2.828l4,4C9.964,18.792,10.474,19,11,19c0.092,0,0.185-0.006,0.277-0.02  c0.621-0.087,1.166-0.46,1.471-1.009l5-9C18.285,8.005,17.937,6.788,16.972,6.251z" />
            </svg>
          ) : (
            <svg
              stroke="var(--title-color)"
              fill="var(--title-color)"
              strokeWidth="0"
              viewBox="0 0 16 16"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
              ></path>
            </svg>
          )}
        </div>
      </div>
      <SyntaxHighlighter language={language} style={a11yDark}>
        {value}
      </SyntaxHighlighter>
    </>
  );
};

const MarkdownRenderer = ({ input }: { input: string }) => {
  return (
    <Markdown
      components={{
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <CodeBlock
              language={match[1]}
              value={String(children).replace(/\n$/, "")}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {input}
    </Markdown>
  );
};

export default MarkdownRenderer;
