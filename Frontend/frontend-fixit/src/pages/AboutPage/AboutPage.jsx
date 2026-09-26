import AboutHero from './components/AboutHero';
import AboutProblem from './components/AboutProblem';
import AboutSolution from './components/AboutSolution';
import AboutWorkflow from './components/AboutWorkflow';
import AboutRoles from './components/AboutRoles';
import AboutCategories from './components/AboutCategories';
import AboutImpact from './components/AboutImpact';
import AboutBottomCta from './components/AboutBottomCta';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page-wrapper">
      <AboutHero />
      <AboutProblem />
      <AboutSolution />
      <AboutWorkflow />
      <AboutRoles />
      <AboutCategories />
      <AboutImpact />
      <AboutBottomCta />
    </div>
  );
};

export default AboutPage;
