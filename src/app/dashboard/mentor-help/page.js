export default function MentorHelpPage() {
  const sections = [
    {
      title: 'Getting Started',
      items: [
        { q: 'How do I log in?', a: 'Enter your Company Encryption PIN, then your username and password on the login screen. Select your role (Staff Member, Young Person, or Inspector) before submitting.' },
        { q: 'I forgot my password. What do I do?', a: 'Click the "Forgot Password" link on the login page. Contact your system administrator if you do not receive a reset email.' },
        { q: 'What is the Company Encryption PIN?', a: 'This is a unique security code assigned to your organisation. It is required alongside your credentials to ensure secure access. Contact your administrator if you do not know it.' },
      ],
    },
    {
      title: 'Daily Recording',
      items: [
        { q: 'How do I log an incident?', a: 'Navigate to Health & Safety in the sidebar, then click "Log Incident". Fill in the title, type, severity, time occurred, and a full description. Incidents must be reviewed and signed off by a manager.' },
        { q: 'How does the sign-off process work?', a: 'When an incident is logged, it appears as "Open" and triggers a notification for managers. A manager or director reviews the incident and clicks "Sign Off" to formally acknowledge and close it.' },
        { q: 'How do I record a visitor?', a: 'Go to Visitor/Staff Sign In and click "Sign In Visitor". Enter the visitor\'s name and purpose. Click "Sign Out" when they leave to complete the record.' },
        { q: 'How do staff clock in and out?', a: 'In the Visitor/Staff Sign In module, click the "Staff Clock In/Out" tab. Use "Clock In Staff" to create a shift record, and "Clock Out" when the shift ends.' },
      ],
    },
    {
      title: 'Young People',
      items: [
        { q: 'How do I view a young person\'s profile?', a: 'Go to Young People in the sidebar. Use the search box or scroll to find the person, then click their row to open the detail panel with all profile information.' },
        { q: 'What is a MARS record?', a: 'MARS stands for Medication Administration Record Sheet. It tracks every medication given to a young person, including dose, time, and who administered it. These are essential for Ofsted inspections.' },
      ],
    },
    {
      title: 'HR & Compliance',
      items: [
        { q: 'How do I track DBS checks?', a: 'Go to HR and click the "DBS Checks" tab. Any staff with a DBS expiring within 30 days will be flagged with an alert badge. Update expiry dates in the Staff module.' },
        { q: 'How do training records work?', a: 'Under HR > Training Records, you can see all staff training certificates and expiry dates. Records expiring within 30 days are highlighted in orange, expired records in red.' },
      ],
    },
    {
      title: 'Finance',
      items: [
        { q: 'How do budget alerts work?', a: 'When a home\'s total spend reaches 90% of its budget amount, a red alert banner appears in the Finance module. Directors are shown these alerts in their dashboard.' },
        { q: 'How do I add an expense?', a: 'In Finance, go to the "Expense Records" tab and click "Add Expense". Select a period, category, and enter the amount spent. Add optional notes for context.' },
      ],
    },
    {
      title: 'Support',
      items: [
        { q: 'Who do I contact for technical support?', a: 'Contact your system administrator or the Round Sys support team. Ensure you have your Company ID and a description of the issue ready.' },
        { q: 'Is my data secure?', a: 'Yes. All data is stored on secure UK-based servers with full encryption. The system uses Multi-Factor Authentication and role-based access controls to protect sensitive information.' },
      ],
    },
  ]

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#166534] mb-1">Round Sys Help Centre</h1>
        <p className="text-sm text-gray-500">Find answers to common questions about using the Round Sys platform.</p>
      </div>

      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gradient-to-br from-green-50 to-gray-50">
              <h2 className="font-semibold text-[#166534] text-sm">{section.title}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {section.items.map((item, i) => (
                <div key={i} className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-800 mb-1">{item.q}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border border-[#BBF7D0] rounded p-4 bg-[#F0FDF4]/40">
        <p className="text-sm font-medium text-[#166534] mb-1">Still need help?</p>
        <p className="text-sm text-gray-600">Contact your system administrator or Round Sys support for full documentation and assistance.</p>
      </div>
    </div>
  )
}
