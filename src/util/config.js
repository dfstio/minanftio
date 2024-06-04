const { REACT_APP_NET_URL, REACT_APP_NET_NAME } = process.env;

module.exports = {
  footerText: "Copyright © DFST 2024 ",
  footerTextLink: "https://dfst.io",
  footerAgreement: ` Terms and Conditions and Limited License `,
  footerAgreementLink: `https://minanft.io/agreement/terms.pdf`,
  footerTwitter: ` Twitter `,
  footerTwitterLink: `https://twitter.com/minanft_io`,
  footerDocs: ` Docs `,
  footerDocsLink: `https://docs.minanft.io`,
  footerGitHub: ` GitHub `,
  footerGitHubLink: `https://github.com/dfstio`,
  footerTestnet: " " + REACT_APP_NET_NAME + " ",
  footerTestnetLink: REACT_APP_NET_URL,
  footerContact: ` Contact us `,
  footerEmail: `mailto:hello@minanft.io`,
  accountingEmail: `mailto:accounting@minanft.io`,
};
