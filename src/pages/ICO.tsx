import { useState } from "react";

const ICO = () => {
  const [activeTab, setActiveTab] = useState<"preview" | "subscribe" | "allocation">("preview");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-visible" style={{ background: "#000000", paddingTop: "80px", paddingBottom: "120px" }}>
        <div className="max-w-[1440px] mx-auto px-6 py-18">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center justify-between">
            {/* Left Content */}
            <div className="space-y-6 lg:col-span-7">
              <h1 className="text-4xl lg:text-[2.625rem] font-bold text-white mb-4">
                Gathering the World's Best Assets
              </h1>
              <h2 className="text-5xl font-bold mb-6" style={{ color: "#adff00" }}>
                ICO
              </h2>
              <p className="max-w-[700px] text-2xl font-semibold text-white/70 leading-none mb-8">
                ICO is a high-quality blockchain new project selection platform designed to help users become early investors in emerging digital currencies. You can easily participate by holding the required currency.
              </p>
              <button
                className="px-8 py-3 rounded-full text-base font-semibold transition-all duration-300"
                style={{
                  background: "#ffffff",
                  color: "#000000",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "#adff00";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "#ffffff";
                }}
              >
                View my positions
              </button>
            </div>

            {/* Right Image */}
            <div className="flex justify-center lg:justify-end lg:col-span-5">
              <img
                src="/ico/hero-image.png"
                alt="ICO"
                className="w-full max-w-md lg:max-w-lg"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Card Section - Overlapping hero by 18% */}
        <div className="absolute bottom-0 left-0 right-0" style={{ transform: "translateY(82%)" }}>
          <div className="max-w-[1440px]  mx-auto px-6">

            {/* Flex container replaces Grid */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">

              {/* Card 1 - Added max-width to shrink it */}
              <div className="w-full max-w-[420px] h-[200px]">
                <img src="/ico/card-1.png" alt="Proterozoic ICO" className="w-full h-full object-fill rounded-xl"  />
              </div>

              {/* Card 2 - Added max-width to shrink it */}
              <div className="w-full max-w-[420px] h-[200px]">
                <img src="/ico/card-2.png" alt="NFT ICO" className="w-full h-full object-fill rounded-xl" />
              </div>

              {/* Card 3 - Added max-width to shrink it */}
              <div className="w-full max-w-[420px] h-[200px]">
                <img src="/ico/card-3.png" alt="Web 3.0" className="w-full h-full object-fill rounded-xl" />
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* Tab Section */}
      <section className="py-12 bg-white" style={{ marginTop: "160px" }}>
        <div className="max-w-[1440px] mx-auto px-6">
          {/* Tab Navigation */}
          <div className="flex gap-8 border-b-2 border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("preview")}
              className={`pb-3 px-4 text-xl font-semibold transition-colors relative ${activeTab === "preview" ? "text-black" : "text-gray-400"
                }`}
            >
              Preview
              {activeTab === "preview" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "#000000" }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("subscribe")}
              className={`pb-3 px-4 text-xl font-semibold transition-colors relative ${activeTab === "subscribe" ? "text-black" : "text-gray-400"
                }`}
            >
              Subscribe
              {activeTab === "subscribe" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "#000000" }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("allocation")}
              className={`pb-3 px-4 text-xl font-semibold transition-colors relative ${activeTab === "allocation" ? "text-black" : "text-gray-400"
                }`}
            >
              Allocation
              {activeTab === "allocation" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "#000000" }}
                />
              )}
            </button>
            <div className="ml-auto">
              <button className="px-6 py-2.5 rounded text-base font-medium text-white" style={{ background: "#000000" }}>
                Order
              </button>
            </div>
          </div>

          {/* Table - Only show for Preview tab */}
          {activeTab === "preview" && (
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#f9f9f9" }}>
                      <th className="px-4 py-4 text-left text-base font-medium text-gray-600">Name</th>
                      <th className="px-4 py-4 text-left text-base font-medium text-gray-600">Subscription Price</th>
                      <th className="px-4 py-4 text-left text-base font-medium text-gray-600">Subscription Deadline</th>
                      <th className="px-4 py-4 text-left text-base font-medium text-gray-600">Issue Price</th>
                      <th className="px-4 py-4 text-left text-base font-medium text-gray-600">ICO Start Date</th>
                      <th className="px-4 py-4 text-left text-base font-medium text-gray-600">Expected Return</th>
                      <th className="px-4 py-4 text-left text-base font-medium text-gray-600">Actual Return</th>
                      <th className="px-4 py-4 text-left text-base font-medium text-gray-600">Listing Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={8} className="py-24">
                        <div className="flex flex-col items-center justify-center text-center">
                          <img
                            src="/ico/no-data.png"
                            alt="No Data"
                            className="w-32 h-32 mb-4 opacity-30"
                          />
                          <p className="text-gray-400 text-lg">No Data</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Data - Show for Subscribe and Allocation tabs */}
          {(activeTab === "subscribe" || activeTab === "allocation") && (
            <div className="bg-white rounded-lg py-32">
              <div className="flex flex-col items-center justify-center text-center">
                <img
                  src="/ico/no-data.png"
                  alt="No Data"
                  className="w-32 h-32 mb-4 opacity-30"
                />
                <p className="text-gray-400 text-lg">No Data</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How to trade ICO */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <h2 className="text-4xl font-bold text-black mb-16">How to trade ICO</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting lines - dashed and behind icons */}
            <div className="hidden lg:block absolute top-12 left-0 right-0" style={{ height: "2px", zIndex: 0 }}>
              <div className="flex items-center h-full">
                <div className="flex-1"></div>
                <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                <div className="flex-1"></div>
              </div>
            </div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="mb-6 bg-white">
                <img src="/ico/maker-step1.svg" alt="Planning" className="w-24 h-24" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Planning and Preparation:</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Determine your project and business model and develop a detailed ICO plan.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="mb-6 bg-white">
                <img src="/ico/maker-step2.svg" alt="Development" className="w-24 h-24" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Development token:</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Create and develop your token.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="mb-6 bg-white">
                <img src="/ico/maker-step3.svg" alt="KYC" className="w-24 h-24" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">KYC verification:</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                In accordance with local regulatory requirements, "Know Your Customer" (KYC) and "Anti-Money Laundering" (AML) verification procedures are performed to ensure that investors participating in ICO meet compliance standards.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="mb-6 bg-white">
                <img src="/ico/maker-step4.svg" alt="Offering" className="w-24 h-24" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Offering ICO:</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Offer ICO according to a predetermined schedule and accept funds from investors.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ICO;