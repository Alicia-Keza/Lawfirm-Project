// Every service the firm offers, grouped by category.
// `formService` is the value used by the contact and appointment forms.

const categories = [
  {
    id: 'notarial',
    icon: '📜',
    title: 'Notarial Services',
    summary:
      'Official certification, authentication, and verification of legal documents and instruments.',
    services: [
      {
        slug: 'document-certification',
        icon: '✅',
        title: 'Certification of Documents & Copies',
        description:
          'We certify original documents and true copies of documents, verifying their authenticity for use in legal, administrative, and official contexts both locally and internationally.',
        formService: 'notarial'
      },
      {
        slug: 'signature-authentication',
        icon: '✍️',
        title: 'Authentication of Signatures',
        description:
          'We verify and authenticate signatures on documents, confirming the identity of signatories and the validity of their consent for legally binding purposes.',
        formService: 'notarial'
      },
      {
        slug: 'notarization-of-agreements',
        icon: '📋',
        title: 'Notarization of Agreements & Contracts',
        description:
          'Legal agreements and contracts are formally notarized to give them official legal standing, making them enforceable and recognized by courts and authorities.',
        formService: 'notarial'
      },
      {
        slug: 'affidavits',
        icon: '🗂️',
        title: 'Affidavits & Statutory Declarations',
        description:
          'We prepare and witness sworn affidavits and statutory declarations for use in court proceedings, administrative processes, and personal legal matters.',
        formService: 'notarial'
      }
    ]
  },
  {
    id: 'legal',
    icon: '⚖️',
    title: 'Legal Services',
    summary:
      'Expert legal consultation, drafting, and compliance support for individuals and businesses.',
    services: [
      {
        slug: 'legal-consultation',
        icon: '💬',
        title: 'Legal Consultation & Advisory',
        description:
          'Receive clear, professional legal advice tailored to your specific situation. We help you understand your rights, obligations, and the best course of action under Rwandan law.',
        formService: 'legal-advisory'
      },
      {
        slug: 'contract-drafting',
        icon: '📝',
        title: 'Contract Drafting & Review',
        description:
          'We draft, review, and revise a wide range of contracts — including employment agreements, service contracts, sale agreements, and partnership deeds — to protect your interests.',
        formService: 'contract'
      },
      {
        slug: 'company-registration',
        icon: '🏢',
        title: 'Company Registration & Corporate Compliance',
        description:
          'We guide you through the full process of registering a company in Rwanda and assist with ongoing corporate compliance, including governance documents and statutory filings.',
        formService: 'company-reg'
      },
      {
        slug: 'property-transactions',
        icon: '🏠',
        title: 'Property & Land Transaction Assistance',
        description:
          'We provide legal support for property and land transactions, including sale agreements, title verification, transfer documentation, and compliance with land law requirements.',
        formService: 'property'
      }
    ]
  },
  {
    id: 'specialized',
    icon: '🔑',
    title: 'Specialized Services',
    summary: 'Tailored solutions for complex or specialized legal and notarial requirements.',
    services: [
      {
        slug: 'power-of-attorney',
        icon: '🖊️',
        title: 'Power of Attorney Preparation',
        description:
          'We draft and notarize Powers of Attorney (General and Special), enabling you to authorize another person to act legally on your behalf in specific or general matters.',
        formService: 'power-of-attorney'
      },
      {
        slug: 'due-diligence',
        icon: '🔍',
        title: 'Legal Due Diligence',
        description:
          'We conduct thorough legal due diligence investigations for business transactions, investments, mergers, and acquisitions to identify legal risks and ensure informed decision-making.',
        formService: 'due-diligence'
      },
      {
        slug: 'court-documents',
        icon: '⚖️',
        title: 'Court Document Preparation',
        description:
          'We prepare and organize court-ready legal documents including pleadings, motions, affidavits, and other required instruments for civil and administrative proceedings.',
        formService: 'court-docs'
      },
      {
        slug: 'legal-interpretation',
        icon: '🌐',
        title: 'Legal Interpretation & Documentation Support',
        description:
          'We provide expert interpretation of legal texts, regulations, and contracts, and assist with accurate preparation and organization of all supporting legal documentation.',
        formService: 'other'
      }
    ]
  }
];

const allServices = categories.flatMap((category) =>
  category.services.map((service) => ({ ...service, category }))
);

function findService(slug) {
  return allServices.find((service) => service.slug === slug) || null;
}

module.exports = { categories, allServices, findService };
