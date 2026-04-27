import { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What is a cryptocurrency exchange?",
    answer:
      "Cryptocurrency exchanges are digital marketplaces that enable users to buy and sell cryptocurrencies like Bitcoin, Ethereum, and Tether. The Binance exchange is the largest crypto exchange by trade volume.",
  },
  {
    question: "What products does the platform offer?",
    answer: (
      <>
        <p style={{ marginBottom: "16px" }}>
          As the leading global cryptocurrency trading platform, the platform currently serves over 150
          million registered users across more than 180 countries/regions. With low transaction fees, the
          platform offers over 350 tradable cryptocurrencies, making it the preferred choice for trading
          Bitcoin, altcoins, and other digital assets.
        </p>
        <p style={{ marginBottom: "12px" }}>On the platform, users can:</p>
        <ol style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
          <li style={{ marginBottom: "6px" }}>1. Trade hundreds of digital currencies and trading pairs.</li>
          <li style={{ marginBottom: "6px" }}>
            2. Buy and sell cryptocurrencies through the platform's spot trading.
          </li>
          <li style={{ marginBottom: "6px" }}>
            3. Earn cryptocurrency interest through the platform's wealth management
          </li>
          <li style={{ marginBottom: "6px" }}>
            <Link
              to="/customer-service"
              style={{
                color: "#ffffff",
                textDecoration: "underline",
                fontWeight: 500,
                opacity: 0.95,
              }}
            >
              4. Service
            </Link>
          </li>
        </ol>
      </>
    ),
  },
  {
    question: "How to trade cryptocurrencies on the platform",
    answer:
      "On the platform, you can trade hundreds of cryptocurrencies in the spot, futures, and options markets. To start trading, users need to register an account on the platform, complete identity verification, and deposit/purchase cryptocurrencies, then they can begin trading.",
  },
  {
    question: "Is this platform a secure cryptocurrency exchange?",
    answer:
      "This platform is committed to providing a secure and trustworthy trading platform. We have one of the most advanced security technologies and maintenance teams in the world, including a dedicated security team that is constantly working to ensure the security of your assets and accounts. We have also undergone independent proof of reserves verification to confirm that all user assets are supported at a 1:1 ratio.",
  },
  {
    question: "How to solve forgotten login password?",
    answer: `You can click "Forgot Password" on the login page, and then reset the "Login Password".`,
  },
  {
    question: "Why do you need Identity Authentication?",
    answer:
      "For the safety of your funds and the occurrence of money laundering activities, we need to ensure that your receiving account is associated with the current account identity information.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section style={{ background: "#000000", padding: "80px 0 96px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        {/* Title */}
        <h2
          style={{
            textAlign: "center",
            fontSize: "2.7rem",
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: "48px",
            fontFamily: "'Inter','Segoe UI',sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          Frequently Asked Questions
        </h2>

        {/* FAQ Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  background: isOpen ? "#1a1a1a" : "transparent",
                  borderRadius: isOpen ? "12px" : "0px",
                  marginBottom: isOpen ? "4px" : "0px",
                  transition: "background 0.3s ease, border-radius 0.3s ease, margin 0.3s ease",
                  overflow: "hidden",
                }}
              >
                {/* Question Row */}
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "28px 24px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: 400,
                      color: "#ffffff",
                      fontFamily: "'Inter','Segoe UI',sans-serif",
                      lineHeight: 1.5,
                    }}
                  >
                    {faq.question}
                  </span>
                  {/* Arrow icon */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      marginLeft: 16,
                      transition: "transform 0.3s ease",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                </button>

                {/* Answer — animated expand/collapse */}
                <div
                  style={{
                    maxHeight: isOpen ? "600px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.45s cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <div
                    style={{
                      padding: "0 24px 28px 24px",
                      fontSize: "1.05rem",
                      color: "rgba(255,255,255,0.55)",
                      fontFamily: "'Inter','Segoe UI',sans-serif",
                      lineHeight: 1.75,
                    }}
                  >
                    {faq.answer}
                  </div>
                </div>

                {/* Divider — only show when closed */}
                {!isOpen && (
                  <div
                    style={{
                      height: "1px",
                      background: "rgba(255,255,255,0.06)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
