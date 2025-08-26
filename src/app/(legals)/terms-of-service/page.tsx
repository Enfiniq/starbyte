interface Section {
  title: string;
  content: string[];
}

const termsSections: Record<string, Section> = {
  introduction: {
    title: "Terms of Service",
    content: [
      "By using Starbyte, you agree to these terms of service.",
      "These terms govern your use of our application and establish the rules for community participation.",
    ],
  },
  rewards: {
    title: "Reward System",
    content: [
      "All earned rewards are permanent and cannot be revoked by reward providers once claimed.",
      "Rewards are currently non - refundable and cannot be exchanged or transferred.",
      "Users are responsible for verifying reward details before claiming.",
      "Reward providers may have additional terms that apply to specific rewards.",
    ],
  },
  conduct: {
    title: "Community Standards",
    content: [
      "Users must maintain respectful communication in all interactions within the app.",
      "Discrimination based on religion, ethnicity, gender, race, caste, or personal identity is prohibited.",
      "Harassment, hate speech, or abusive behavior will result in account suspension or permanent ban.",
      "Users are expected to contribute positively to the community environment.",
    ],
  },
  fairPlay: {
    title: "Fair Use of Features",
    content: [
      "Users must not exploit or manipulate app features including stardust, challenge creation, or proof approval systems.",
      "Gaming the system for unfair advantage over other users is prohibited.",
      "All challenge submissions and proof approvals must be genuine and honest.",
      "Stardust must be earned through legitimate completion of challenges and activities.",
    ],
  },
  community: {
    title: "Community Participation",
    content: [
      "Users are encouraged to help others and participate constructively in community activities.",
      "Sharing knowledge and supporting fellow users enhances the experience for everyone.",
      "Users should ask for help when needed and offer assistance when possible.",
    ],
  },
  enforcement: {
    title: "Rule Enforcement",
    content: [
      "Violations of these terms may result in warnings, temporary suspension, or permanent account termination.",
      "The severity of enforcement action depends on the nature and frequency of violations.",
      "Users may appeal enforcement decisions by contacting support.",
    ],
  },
  changes: {
    title: "Terms Updates",
    content: [
      "These terms may be updated as Starbyte evolves and new features are added.",
      "Users will be notified of significant changes through the app or email.",
      "Continued use of the app after changes constitutes acceptance of updated terms.",
    ],
  },
  support: {
    title: "Support and Contact",
    content: [
      "For questions about these terms or to report violations, contact us at help@neploom.com.",
      "Our team reviews all reports and responds to inquiries promptly.",
      "We are committed to maintaining a fair and enjoyable experience for all users.",
      "If your queries or issues are not resolved by the support team, you can send a direct email to the founder of Starbyte at enfiniq@gmail.com, attaching a screenshot of not getting help from the support team.",
    ],
  },
};

function Section({ title, content }: Section) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <div className="space-y-3">
        {content.map((paragraph, index) => (
          <p
            key={index}
            className="text-gray-700 dark:text-gray-300 leading-relaxed"
          >
            {paragraph.includes("help@neploom.com") ||
            paragraph.includes("enfiniq@gmail.com") ? (
              <>
                {paragraph
                  .split(/(help@neploom\.com|enfiniq@gmail\.com)/)
                  .map((part, partIndex) => {
                    if (part === "help@neploom.com") {
                      return (
                        <a
                          key={partIndex}
                          href="mailto:help@neploom.com"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          help@neploom.com
                        </a>
                      );
                    } else if (part === "enfiniq@gmail.com") {
                      return (
                        <a
                          key={partIndex}
                          href="mailto:enfiniq@gmail.com"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          enfiniq@gmail.com
                        </a>
                      );
                    }
                    return part;
                  })}
              </>
            ) : (
              paragraph
            )}
          </p>
        ))}
      </div>
    </section>
  );
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: August 26, 2025
          </p>
        </div>

        <div className="space-y-6">
          {Object.values(termsSections).map((section, index) => (
            <Section key={index} {...section} />
          ))}
        </div>
      </div>
    </div>
  );
}
