import React from 'react';
import '../styles/Help.css';

const Help = () => {
  const faqs = [
    {
      question: 'How do I add a new child to the system?',
      answer: 'Navigate to the "Children" page from the sidebar and click the "Add New Child" button. This will open the multi-step form to enter the child\'s information.',
    },
    {
      question: 'How can I send a message to another admin?',
      answer: 'Only the Super Admin can initiate new messages. If you are a Super Admin, go to the "Messages" page and click the "Compose" button. Regular admins can only reply to messages they receive.',
    },
    {
      question: 'Where can I change my password?',
      answer: 'You can change your password on the "Settings" page, under the "User Profile" section.',
    },
  ];

  return (
    <div className="help-container">
      <h2>Help & FAQ</h2>
      
      <div className="faq-section">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h4 className="faq-question">{faq.question}</h4>
            <p className="faq-answer">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="support-section">
          <h3>Contact Support</h3>
          <p>If you need further assistance, please email us at <a href="mailto:support@example.com">support@example.com</a>.</p>
      </div>
    </div>
  );
};

export default Help;
