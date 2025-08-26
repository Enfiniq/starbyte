interface Section {
  title: string;
  content: string[];
}

const privacySections: Record<string, Section> = {
  introduction: {
    title: "Privacy Policy Overview",
    content: [
      "This privacy policy explains how Starbyte collects, uses, and protects your personal information when you use our application.",
      "We are committed to maintaining the privacy and security of your data while providing you with the best possible experience.",
    ],
  },
  dataCollection: {
    title: "Information We Collect",
    content: [
      "Account Information: When you create an account, we collect your email address and display name.",
      "Activity Data: We track your challenge progress, comments, submissions, and earned rewards to provide personalized features.",
      "Usage Analytics: We collect anonymized data about how you interact with the app to improve our services.",
    ],
  },
  dataSharing: {
    title: "Sharing with Reward Providers",
    content: [
      "When you claim a reward, we share your email address and display name with the reward provider.",
      "This sharing is necessary for reward fulfillment and allows providers to deliver your earned rewards.",
      "Reward providers may use this information to understand their audience and improve their offerings.",
    ],
  },
  communications: {
    title: "Email Communications",
    content: [
      "We send emails for essential account functions including password resets, email verification, and verification code delivery.",
      "You will receive receipts when claiming rewards and notifications about important account activities.",
      "All communications are limited to necessary service functions and reward confirmations.",
    ],
  },
  notifications: {
    title: "App Notifications",
    content: [
      "We send push notifications for social interactions such as new followers and community engagement.",
      "You receive notifications when completing challenges, earning rewards, or when others interact with your content.",
      "All notifications can be managed through your device settings.",
    ],
  },
  security: {
    title: "Data Security",
    content: [
      "We implement industry standard security measures to protect your personal information.",
      "Your passwords are never shared with anyone and are securely hashed in our database using industry standard encryption.",
      "Your data is stored on secure servers with encryption and access controls.",
      "We regularly review and update our security practices to maintain data protection standards.",
    ],
  },
  changes: {
    title: "Policy Updates",
    content: [
      "We may update this privacy policy as our services evolve.",
      "Users will be notified of significant changes through the app or email.",
      "Continued use of Starbyte after updates constitutes acceptance of the revised policy.",
    ],
  },
  contact: {
    title: "Contact Information",
    content: [
      "For questions about this privacy policy or data handling practices, contact us at help@neploom.com.",
      "We respond to all privacy inquiries and are committed to addressing your concerns promptly.",
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

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: August 26, 2025
          </p>
        </div>

        <div className="space-y-6">
          {Object.values(privacySections).map((section, index) => (
            <Section key={index} {...section} />
          ))}
        </div>
      </div>
    </div>
  );
}
