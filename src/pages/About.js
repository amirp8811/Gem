import React from 'react';
import About from '../components/About';
import Newsletter from '../components/Newsletter';

const AboutPage = () => {
  return (
    <div className="about-page" style={{ paddingTop: '100px' }}>
      <About />
      <Newsletter />
    </div>
  );
};

export default AboutPage;
