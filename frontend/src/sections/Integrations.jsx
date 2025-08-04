import Tag from "../components/Tag";
import IntegrationColumn from "../components/IntegrationColumn";

import figmaIcon from "../assets/images/figma-logo.svg";
import notionIcon from "../assets/images/notion-logo.svg";
import slackIcon from "../assets/images/slack-logo.svg";
import relumeIcon from "../assets/images/relume-logo.svg";
import framerIcon from "../assets/images/framer-logo.svg";
import githubIcon from "../assets/images/github-logo.svg";

const integrations = [
  {
    name: "ServiceNow",
    icon: figmaIcon,
    description: "Seamless integration with ServiceNow for comprehensive ITSM workflows.",
  },
  {
    name: "Jira Service Management",
    icon: notionIcon,
    description: "Connect with Jira Service Management for agile service desk operations.",
  },
  {
    name: "Slack",
    icon: slackIcon,
    description: "Real-time notifications and team collaboration through Slack integration.",
  },
  {
    name: "Microsoft Teams",
    icon: relumeIcon,
    description: "Enhanced communication and ticket updates via Microsoft Teams.",
  },
  {
    name: "Zendesk",
    icon: framerIcon,
    description: "Integrate with Zendesk for unified customer support management.",
  },
  {
    name: "Freshdesk",
    icon: githubIcon,
    description: "Connect with Freshdesk for streamlined ticket management and automation.",
  },
];

export function Integrations() {
  return (
    <section className="py-24 overflow-hidden justify-items-center">
      <div className="container">
        <div className="grid lg:grid-cols-2 items-center lg:gap-16">
          {/* Left Column */}
          <div>
            <Tag>Integrations</Tag>
            <h2 className="text-6xl font-medium mt-6">
              Works with your <span className="text-blue-600">existing tools</span>
            </h2>
            <p className="text-gray-600 mt-4 text-lg">
              Our AI-powered skill intelligence platform integrates seamlessly with your existing ITSM tools and platforms, enhancing your current workflow without disruption.
            </p>
          </div>

          {/* Right Column */}
          <div>
            <div className="grid md:grid-cols-2 gap-4 lg:h-[800px] h-[400px] lg:mt-0 mt-8 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
              <IntegrationColumn integrations={integrations} />
              <IntegrationColumn
                integrations={[...integrations].reverse()}
                className="hidden md:flex"
                reverse
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
