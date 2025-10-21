import React from 'react';
import Hero from '../components/Hero';
import JewelryCategories from '../components/JewelryCategories';
import FeaturedProducts from '../components/FeaturedProducts';
import About from '../components/About';
import ParallaxDivider from '../components/ParallaxDivider';
import Newsletter from '../components/Newsletter';

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <FeaturedProducts />
      <JewelryCategories />
      <About />
      <ParallaxDivider />
      <Newsletter />
    </div>
  );
};

export default Home;
