import React from 'react';
import { Accordion } from 'react-bootstrap';

const HelpFaqsAccordion = ({
  faqs,
  showAllFaqs,
  onToggleShowAll,
}) => {
  return (
    <section className="help-card-section" aria-label="Frequently Asked Questions">
      <div className="help-section-header-row">
        <div>
          <h2>Frequently Asked Questions</h2>
          <p>Find quick answers to the most common questions.</p>
        </div>
        <button
          type="button"
          className="help-view-all-link"
          onClick={onToggleShowAll}
        >
          {showAllFaqs ? 'Show less FAQs' : 'View all FAQs'}
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <Accordion className="help-accordion" defaultActiveKey={null}>
        {faqs.length === 0 ? (
          <p className="text-muted small py-2 mb-0">No questions found matching your query.</p>
        ) : (
          faqs.map((faq, index) => (
            <Accordion.Item eventKey={String(index)} key={faq.id || index}>
              <Accordion.Header>{faq.question}</Accordion.Header>
              <Accordion.Body>{faq.answer}</Accordion.Body>
            </Accordion.Item>
          ))
        )}
      </Accordion>
    </section>
  );
};

export default HelpFaqsAccordion;
