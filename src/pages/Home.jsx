import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import './Home.css'

function Home() {
  const { isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()
  const [activeAccordion, setActiveAccordion] = useState(0)
  const [formStatus, setFormStatus] = useState('')

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? -1 : index)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormStatus('Sending...')
    
    const form = e.target
    const formData = new FormData(form)
    
    try {
      const response = await fetch('https://formspree.io/f/mpzvnvjo', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        setFormStatus('Thank you! We will contact you soon.')
        form.reset()
      } else {
        setFormStatus('Oops! There was a problem. Please try again.')
      }
    } catch (error) {
      setFormStatus('Oops! There was a problem. Please try again.')
    }
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home" id="home">
        <div className="container">
          <h1 className="wow slideInLeft">Transform Your<span> Body</span></h1>
          <h1 className="wow slideInRight">Elevate Your <span>Life</span></h1>
          <a href="#contact" className="cta-button">Start Your Journey</a>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="container">
          <div className="content">
            <div className="box wow bounceInUp">
              <div className="inner">
                <div className="img">
                  <img src="/images/about1.jpg" alt="Free consultation" />
                </div>
                <div className="text">
                  <h4>Free Consultation</h4>
                  <p>Kickstart your fitness journey with a free consultation! Our experts are here to help you create a personalized plan to achieve your goals. Book now and take the first step towards a healthier you!</p>
                </div>
              </div>
            </div>
            <div className="box wow bounceInUp">
              <div className="inner">
                <div className="img">
                  <img src="/images/about2.jpg" alt="Best training" />
                </div>
                <div className="text">
                  <h4>Best Training</h4>
                  <p>Kickstart your fitness journey with a free consultation! Our experts are here to help you create a personalized plan to achieve your goals. Book now and take the first step towards a healthier you!</p>
                </div>
              </div>
            </div>
            <div className="box wow bounceInUp">
              <div className="inner">
                <div className="img">
                  <img src="/images/about3.jpg" alt="Build perfect body" />
                </div>
                <div className="text">
                  <h4>Build Perfect Body</h4>
                  <p>Achieve your dream physique with our expert guidance! Customized workouts and nutrition plans designed to sculpt and tone your body. Start your transformation now and build the perfect body!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="service" id="service">
        <div className="container">
          <div className="content">
            <div className="text box wow slideInLeft">
              <h2>Services</h2>
              <p>At Minakshi Fitness Club, we offer a range of top-notch fitness services to help you reach your goals. Our certified personal trainers provide customized workout plans, while our dynamic group fitness classes cater to all levels, from HIIT to Cardio. We also offer specialized programs for weight loss, muscle building, and sports conditioning, ensuring you get the targeted support you need</p>
              <p>In addition to our fitness offerings, we provide personalized nutrition coaching and Competition Training like Powerlifting and Bodybuilding. With state-of-the-art equipment and a supportive community, Minakshi Fitness Club is dedicated to helping you achieve lasting results and maintain a healthy lifestyle. Join us today and transform your fitness journey!</p>
              <a href="#contact" className="btn">Start Now</a>
            </div>
            <div className="accordian box wow slideInRight">
              {[
                {
                  title: 'Cardiovascular Equipment',
                  content: 'Our gym features top-of-the-line cardiovascular equipment to elevate your cardio workouts. Choose from a variety of machines, including treadmills, ellipticals, stationary bikes, and rowing machines, all equipped with the latest technology for an effective and engaging exercise experience. Whether you\'re looking to burn calories, improve endurance, or boost heart health, our cardio equipment is designed to help you achieve your fitness goals.'
                },
                {
                  title: 'Strength Training Equipment',
                  content: 'Our gym is equipped with a wide range of strength training equipment to help you build muscle, increase strength, and improve overall fitness. We offer free weights, including dumbbells and barbells, as well as resistance machines and cable systems. Whether you\'re targeting specific muscle groups or looking for a full-body workout, our high-quality equipment supports all your strength training needs.'
                },
                {
                  title: 'Personal Training',
                  content: 'Experience personalized fitness with our expert personal trainers. Each session is tailored to your unique goals, whether it\'s weight loss, muscle gain, or overall wellness. Our trainers provide professional guidance, motivation, and support, ensuring you get the most out of every workout. Achieve your fitness aspirations with a plan designed just for you.'
                },
                {
                  title: 'Other Services',
                  content: 'In addition to our core offerings, Minakshi Fitness Club provides a range of supplementary services to enhance your fitness journey. From nutrition coaching and wellness workshops to massage therapy and chiropractic care, we offer comprehensive support for your overall well-being. Our goal is to empower you with the tools and resources you need to thrive both inside and outside the gym.'
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`accordian-container ${activeAccordion === index ? 'active' : ''}`}
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="head">
                    <h4>{item.title}</h4>
                    <span className={`fa ${activeAccordion === index ? 'fa-angle-down' : 'fa-angle-up'}`}></span>
                  </div>
                  <div className="body" style={{ display: activeAccordion === index ? 'block' : 'none' }}>
                    <p>{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section className="classes" id="classes">
        <div className="container">
          <div className="content">
            <div className="box img wow slideInLeft">
              <img src="/images/class2.png" alt="Group fitness class in action" />
            </div>
            <div className="box text wow slideInRight">
              <h2>Our Classes</h2>
              <p>Join our energizing fitness classes designed to help you reach your goals and have fun doing it! From high-intensity interval training (HIIT) to strength and conditioning, our diverse range of classes caters to all fitness levels and interests. Led by experienced instructors, our classes offer a motivating atmosphere where you can challenge yourself and progress towards your fitness aspirations.</p>
              <div className="class-items">
                <div className="item wow bounceInUp">
                  <div className="item-img">
                    <img src="/images/gallery6.jpg" alt="Strength training workout session" />
                    <div className="price">₹500</div>
                  </div>
                  <div className="item-text">
                    <h4>Strength Training</h4>
                    <p>Build strength and transform your body with our expert-led strength training classes. Get ready to lift, tone, and sculpt with personalized guidance from our certified trainers.</p>
                  </div>
                </div>
                <div className="item wow bounceInUp">
                  <div className="item-text">
                    <h4>Cardio Sessions</h4>
                    <p>Elevate your heart rate and boost your endurance with our dynamic cardio sessions led by knowledgeable instructors</p>
                  </div>
                  <div className="item-img">
                    <img src="/images/gallery7.jpg" alt="High-intensity cardio workout" />
                    <div className="price">₹500</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="ai-features-section" id="ai-features">
        <div className="container">
          <h2 className="wow slideInDown">🤖 AI-Powered Fitness Features</h2>
          <p className="section-subtitle wow slideInUp">Next-generation training powered by artificial intelligence</p>
          
          <div className="ai-features-grid">
            <div className="ai-feature-card wow bounceInUp" onClick={() => isAuthenticated() ? navigate('/ai-features') : navigate('/login')}>
              <div className="feature-icon">💬</div>
              <h3>AI Fitness Chatbot</h3>
              <p>Get instant answers to your fitness questions 24/7</p>
              {!isAuthenticated() && <div className="login-overlay">🔒 Login Required</div>}
            </div>

            <div className="ai-feature-card wow bounceInUp" onClick={() => isAuthenticated() ? navigate('/ai-features') : navigate('/login')}>
              <div className="feature-icon">🍽️</div>
              <h3>AI Meal Planner</h3>
              <p>Generate personalized meal plans based on your goals</p>
              {!isAuthenticated() && <div className="login-overlay">🔒 Login Required</div>}
            </div>

            <div className="ai-feature-card wow bounceInUp" onClick={() => isAuthenticated() ? navigate('/ai-features') : navigate('/login')}>
              <div className="feature-icon">🏋️</div>
              <h3>AI Workout Generator</h3>
              <p>Generate personalized workout plans based on your goals</p>
              {!isAuthenticated() && <div className="login-overlay">🔒 Login Required</div>}
            </div>

            <div className="ai-feature-card wow bounceInUp" onClick={() => isAuthenticated() ? navigate('/ai-features') : navigate('/login')}>
              <div className="feature-icon">📹</div>
              <h3>AI Form Analyzer</h3>
              <p>Real-time exercise form correction using computer vision</p>
              {!isAuthenticated() && <div className="login-overlay">🔒 Login Required</div>}
            </div>

            <div className="ai-feature-card wow bounceInUp" onClick={() => isAuthenticated() ? navigate('/ai-features') : navigate('/login')}>
              <div className="feature-icon">📊</div>
              <h3>AI Progress Tracker</h3>
              <p>Smart analytics and predictions for your fitness journey</p>
              {!isAuthenticated() && <div className="login-overlay">🔒 Login Required</div>}
            </div>

            <div className="ai-feature-card wow bounceInUp" onClick={() => isAuthenticated() ? navigate('/ai-features') : navigate('/login')}>
              <div className="feature-icon">🎙️</div>
              <h3>AI Voice Coach</h3>
              <p>Voice-guided workouts with real-time motivation</p>
              {!isAuthenticated() && <div className="login-overlay">🔒 Login Required</div>}
            </div>

            <div className="ai-feature-card wow bounceInUp" onClick={() => isAuthenticated() ? navigate('/ai-features') : navigate('/login')}>
              <div className="feature-icon">📈</div>
              <h3>PR Tracker</h3>
              <p>Track personal records and predict your next milestone</p>
              {!isAuthenticated() && <div className="login-overlay">🔒 Login Required</div>}
            </div>

            <div className="ai-feature-card wow bounceInUp" onClick={() => isAuthenticated() ? navigate('/ai-features') : navigate('/login')}>
              <div className="feature-icon">📸</div>
              <h3>Body Transformation</h3>
              <p>Track progress with photos and measurements</p>
              {!isAuthenticated() && <div className="login-overlay">🔒 Login Required</div>}
            </div>
          </div>

          {!isAuthenticated() && (
            <div className="ai-cta wow fadeIn">
              <p>🔐 Login to unlock all AI-powered features and transform your fitness journey!</p>
              <a href="/login" className="btn">Login Now</a>
            </div>
          )}
        </div>
      </section>

      {/* Start Today Section */}
      <section className="start-today">
        <div className="container">
          <div className="content">
            <div className="box text wow slideInLeft">
              <h2>Start Your Training Today</h2>
              <p>Embark on your fitness journey today and take the first step towards a healthier, stronger you! With personalized training plans, expert guidance, and state-of-the-art equipment, there's no better time to start than now. Join us and unlock your full potential!</p>
              <a href="#contact" className="btn">Start Now</a>
            </div>
            <div className="box img wow slideInRight">
              <img src="/images/gallery5.jpg" alt="Motivated athlete training" />
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="schedule" id="schedule">
        <div className="container">
          <div className="content">
            <div className="box text wow slideInLeft">
              <h2>Community Classes Schedule</h2>
              <p>Join us for invigorating workouts throughout the week!</p>
              <p>Cardio Sessions:</p>
              <p>Tuesdays and Fridays at 7:00 am - Elevate your heart rate and boost your endurance with our dynamic cardio sessions.</p>
              <br />
              <p>Strength Training Sessions:</p>
              <p>Mondays, Wednesdays, Thursdays, and Saturdays at 7:00 am - Build strength and transform your body with our expert-led strength training classes.</p>
              <br />
              <p>Set your alarm and start your mornings strong with our energizing classes!</p>
              <br />
              <p>And Get your free PDF by clicking Here!!</p>
              <a 
                href="https://drive.google.com/file/d/1liTFRqj-sHRqVCz6_MBk8CxelbLGFW8u" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="button-33"
              >
                Download Free Workout PDF
              </a>
            </div>
            <div className="box timing wow slideInRight">
              <table className="table">
                <tbody>
                  <tr>
                    <td className="day">Monday</td>
                    <td><strong>7:00 AM</strong></td>
                    <td>Chest & <br /> Back</td>
                    <td><a href="https://youtu.be/9zZB3cJnPyQ?si=WMSjp5YHrqHn36RD&t=28" target="_blank" rel="noopener noreferrer">Start Now</a></td>
                  </tr>
                  <tr>
                    <td className="day">Tuesday</td>
                    <td><strong>7:00 AM</strong></td>
                    <td>ABS <br /> Cardio</td>
                    <td><a href="https://youtu.be/aFtdWn_ZC-Y?si=J8IoS00PLa8CwI8N&t=30" target="_blank" rel="noopener noreferrer">Start Now</a></td>
                  </tr>
                  <tr>
                    <td className="day">Wednesday</td>
                    <td><strong>7:00 AM</strong></td>
                    <td>Biceps & <br /> Triceps</td>
                    <td><a href="https://youtu.be/xgStSYkW5Z8?si=MtfipI4Dk1dBMpqo&t=28" target="_blank" rel="noopener noreferrer">Start Now</a></td>
                  </tr>
                  <tr>
                    <td className="day">Thursday</td>
                    <td><strong>7:00 AM</strong></td>
                    <td>Shoulders & <br /> Traps</td>
                    <td><a href="https://youtu.be/4WIPOdjO9-4?si=GkOg1VT64GzQS2q4" target="_blank" rel="noopener noreferrer">Start Now</a></td>
                  </tr>
                  <tr>
                    <td className="day">Friday</td>
                    <td><strong>7:00 AM</strong></td>
                    <td>ABS <br /> Cardio</td>
                    <td><a href="https://youtu.be/aFtdWn_ZC-Y?si=J8IoS00PLa8CwI8N&t=30" target="_blank" rel="noopener noreferrer">Start Now</a></td>
                  </tr>
                  <tr>
                    <td className="day">Saturday</td>
                    <td><strong>7:00 AM</strong></td>
                    <td>Legs [Quads,Hams & <br /> Calves]</td>
                    <td><a href="https://youtu.be/QuWdLXwMTio?si=Khl2fno72t2w67LJ&t=28" target="_blank" rel="noopener noreferrer">Start Now</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery" id="gallery">
        <h2>Workout Gallery</h2>
        <div className="content">
          <div className="box wow slideInLeft">
            <img src="/images/gallery1.jpg" alt="Gym equipment and training area" />
          </div>
          <div className="box wow slideInRight">
            <img src="/images/gallery2.jpg" alt="Personal training session" />
          </div>
          <div className="box wow slideInLeft">
            <img src="/images/gallery3.jpg" alt="Weight training area" />
          </div>
          <div className="box wow slideInRight">
            <img src="/images/gallery4.jpg" alt="Cardio workout zone" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="price-package" id="price">
        <div className="container">
          <h2>Choose Your Package</h2>
          <p className="title-p">Discover the perfect fitness plan tailored to your goals and lifestyle with our flexible packages. Whether you're looking for personalized training, access to group classes, or a combination of both, we have options to suit every need. Select from our range of membership packages and start your fitness journey with confidence. With expert guidance, state-of-the-art facilities, and a supportive community, achieving your goals has never been easier. Choose your package today and commit to a healthier, stronger you!</p>
          <div className="content">
            <div className="box wow bounceInUp">
              <div className="inner">
                <div className="price-tag">₹700/Month</div>
                <div className="img">
                  <img src="/images/price1.jpg" alt="Basic gym membership package" />
                </div>
                <div className="text">
                  <h3>Gym Access</h3>
                  <p>Get Free WiFi✅</p>
                  <p>Month to Month✅</p>
                  <p>No Time Restrictions✅</p>
                  <p>Gym and Cardio✅</p>
                  <p>Workout and Diet Planner❌</p>
                  <p>Service Locker Rooms❌</p>
                  <p>Selective Single Training❌</p>
                  <a href="#contact" className="btn">Join Now</a>
                </div>
              </div>
            </div>
            <div className="box wow bounceInUp">
              <div className="inner">
                <div className="price-tag">₹1500/Month</div>
                <div className="img">
                  <img src="/images/price2.jpeg" alt="Personal training package" />
                </div>
                <div className="text">
                  <h3>Personal Training [PT]</h3>
                  <p>Get Free WiFi✅</p>
                  <p>Month to Month✅</p>
                  <p>No Time Restrictions✅</p>
                  <p>Gym and Cardio✅</p>
                  <p>Workout and Diet Planner✅</p>
                  <p>Service Locker Rooms✅</p>
                  <p>Selective Single Training❌</p>
                  <a href="#contact" className="btn">Join Now</a>
                </div>
              </div>
            </div>
            <div className="box wow bounceInUp">
              <div className="inner">
                <div className="price-tag">₹3000/Month</div>
                <div className="img">
                  <img src="/images/price3.jpg" alt="Competition training package" />
                </div>
                <div className="text">
                  <h3>Competition Training</h3>
                  <p>Get Free WiFi✅</p>
                  <p>Month to Month✅</p>
                  <p>No Time Restrictions✅</p>
                  <p>Gym and Cardio✅</p>
                  <p>Workout and Diet Planner✅</p>
                  <p>Service Locker Rooms✅</p>
                  <p>Selective Single Training✅</p>
                  <a href="#contact" className="btn">Join Now</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="container">
          <div className="content">
            <div className="box form wow slideInLeft">
              <form onSubmit={handleFormSubmit} id="contact-form">
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input type="text" name="name" id="name" placeholder="Enter Name" required />
                
                <label htmlFor="phone" className="sr-only">Phone Number</label>
                <input type="tel" id="phone" name="phone" placeholder="Phone Number (10 digits)" required pattern="[0-9]{10}" />
                
                <label htmlFor="program" className="sr-only">Select Program</label>
                <input type="text" list="browsers" name="program" id="program" placeholder="Select Program" />
                <datalist id="browsers">
                  <option value="Gym Access" />
                  <option value="Personal Training [PT]" />
                  <option value="Competition Training" />
                  <option value="Strength Training" />
                  <option value="Cardio Sessions" />
                </datalist>
                
                <label htmlFor="message" className="sr-only">Message</label>
                <textarea placeholder="Enter Message" name="message" id="message" rows="5"></textarea>
                
                <button type="submit">Send Message</button>
                {formStatus && <div className="form-status" role="status">{formStatus}</div>}
              </form>
            </div>
            <div className="box text wow slideInRight">
              <h2>Get Connected with Gym</h2>
              <p className="title-p">Come and Experience the Best Gym Experience ever</p>
              <div className="info">
                <ul>
                  <li><span className="fa fa-map-marker"></span> Orai Road Near Naher Bypass, Rath</li>
                  <li><span className="fa fa-phone"></span> +91 9826030890</li>
                  <li><span className="fa fa-envelope"></span> ojasnahta2004@gmail.com</li>
                </ul>
              </div>
              <div className="social">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Visit our Facebook page">
                  <span className="fa fa-facebook"></span>
                </a>
                <a href="https://www.instagram.com/minakshi_gym_rath?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Visit our Instagram page">
                  <span className="fa fa-instagram"></span>
                </a>
              </div>
              <div className="copy">
                Powered By &copy; Ojas Nahta 
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
