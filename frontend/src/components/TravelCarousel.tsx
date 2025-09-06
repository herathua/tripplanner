import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface TravelDestination {
  place: string;
  title: string;
  title2: string;
  description: string;
  image: string;
}

const data: TravelDestination[] = [
  {
    place: 'Switzerland Alps',
    title: 'SAINT',
    title2: 'ANTONIEN',
    description: 'Tucked away in the Switzerland Alps, Saint Antönien offers an idyllic retreat for those seeking tranquility and adventure alike. It\'s a hidden gem for backcountry skiing in winter and boasts lush trails for hiking and mountain biking during the warmer months.',
    image: 'https://assets.codepen.io/3685267/timed-cards-1.jpg'
  },
  {
    place: 'Japan Alps',
    title: 'NANGANO',
    title2: 'PREFECTURE',
    description: 'Nagano Prefecture, set within the majestic Japan Alps, is a cultural treasure trove with its historic shrines and temples, particularly the famous Zenkō-ji. The region is also a hotspot for skiing and snowboarding, offering some of the country\'s best powder.',
    image: 'https://assets.codepen.io/3685267/timed-cards-2.jpg'
  },
  {
    place: 'Sahara Desert - Morocco',
    title: 'MARRAKECH',
    title2: 'MEROUGA',
    description: 'The journey from the vibrant souks and palaces of Marrakech to the tranquil, starlit sands of Merzouga showcases the diverse splendor of Morocco. Camel treks and desert camps offer an unforgettable immersion into the nomadic way of life.',
    image: 'https://assets.codepen.io/3685267/timed-cards-3.jpg'
  },
  {
    place: 'Sierra Nevada - USA',
    title: 'YOSEMITE',
    title2: 'NATIONAL PARK',
    description: 'Yosemite National Park is a showcase of the American wilderness, revered for its towering granite monoliths, ancient giant sequoias, and thundering waterfalls. The park offers year-round recreational activities, from rock climbing to serene valley walks.',
    image: 'https://assets.codepen.io/3685267/timed-cards-4.jpg'
  },
  {
    place: 'Tarifa - Spain',
    title: 'LOS LANCES',
    title2: 'BEACH',
    description: 'Los Lances Beach in Tarifa is a coastal paradise known for its consistent winds, making it a world-renowned spot for kitesurfing and windsurfing. The beach\'s long, sandy shores provide ample space for relaxation and sunbathing, with a vibrant atmosphere of beach bars and cafes.',
    image: 'https://assets.codepen.io/3685267/timed-cards-5.jpg'
  },
  {
    place: 'Cappadocia - Turkey',
    title: 'Göreme',
    title2: 'Valley',
    description: 'Göreme Valley in Cappadocia is a historical marvel set against a unique geological backdrop, where centuries of wind and water have sculpted the landscape into whimsical formations. The valley is also famous for its open-air museums, underground cities, and the enchanting experience of hot air ballooning.',
    image: 'https://assets.codepen.io/3685267/timed-cards-6.jpg'
  },
];

const TravelCarousel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<number[]>([0, 1, 2, 3, 4, 5]);
  const detailsEvenRef = useRef<boolean>(true);
  const clicksRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { innerHeight: height, innerWidth: width } = window;
    
    let offsetTop = height - 430;
    let offsetLeft = width - 830;
    let cardWidth = 60;
    let cardHeight = 90;
    let gap = 10;
    let numberSize = 15;
    const ease = "sine.inOut";

    function getCard(index: number) {
      return `#card${index}`;
    }

    function getCardContent(index: number) {
      return `#card-content-${index}`;
    }

    function getSliderItem(index: number) {
      return `#slide-item-${index}`;
    }

    function animate(target: string, duration: number, properties: any) {
      return new Promise((resolve) => {
        gsap.to(target, {
          ...properties,
          duration: duration,
          onComplete: resolve,
        });
      });
    }

    function init() {
      const [active, ...rest] = orderRef.current;
      const detailsActive = detailsEvenRef.current ? "#details-even" : "#details-odd";
      const detailsInactive = detailsEvenRef.current ? "#details-odd" : "#details-even";

      // Position cards in bottom-right corner
      const bottomRightOffsetX = width - (data.length * (cardWidth + gap)) - 50; // Distance from right edge
      const bottomRightOffsetY = height - cardHeight - 50; // Distance from bottom edge

      gsap.set("#pagination", {
        top: bottomRightOffsetY - 40,
        left: bottomRightOffsetX,
        y: 200,
        opacity: 0,
        zIndex: 60,
      });

      gsap.set(getCard(active), {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      });
      gsap.set(getCardContent(active), { x: 0, y: 0, opacity: 0 });
      gsap.set(detailsActive, { opacity: 0, zIndex: 22, x: -200 });
      gsap.set(detailsInactive, { opacity: 0, zIndex: 12 });
      gsap.set(`${detailsInactive} .text`, { y: 100 });
      gsap.set(`${detailsInactive} .title-1`, { y: 100 });
      gsap.set(`${detailsInactive} .title-2`, { y: 100 });
      gsap.set(`${detailsInactive} .desc`, { y: 50 });
      gsap.set(`${detailsInactive} .cta`, { y: 60 });

      // Progress bar removed

      rest.forEach((i, index) => {
        gsap.set(getCard(i), {
          x: bottomRightOffsetX + index * (cardWidth + gap),
          y: bottomRightOffsetY,
          width: cardWidth,
          height: cardHeight,
          zIndex: 30,
          borderRadius: 10,
        });
        gsap.set(getCardContent(i), {
          x: bottomRightOffsetX + index * (cardWidth + gap),
          zIndex: 40,
          y: bottomRightOffsetY + cardHeight - 100,
        });
        // Slide numbers removed
      });

      gsap.set(".indicator", { x: -window.innerWidth });

      const startDelay = 1.2;

      gsap.to(".cover", {
        x: width + 400,
        delay: 1.0,
        ease,
        onComplete: () => {
          setTimeout(() => {
            loop();
          }, 1000);
        },
      });

      rest.forEach((i, index) => {
        gsap.to(getCard(i), {
          x: bottomRightOffsetX + index * (cardWidth + gap),
          zIndex: 30,
          delay: startDelay + 0.05 * index,
          ease,
        });
        gsap.to(getCardContent(i), {
          x: bottomRightOffsetX + index * (cardWidth + gap),
          zIndex: 40,
          delay: startDelay + 0.05 * index,
          ease,
        });
      });
      gsap.to("#pagination", { y: 0, opacity: 1, ease, delay: startDelay });
      gsap.to(detailsActive, { opacity: 1, x: 0, ease, delay: startDelay });
    }

    function step() {
      return new Promise((resolve) => {
        orderRef.current.push(orderRef.current.shift()!);
        detailsEvenRef.current = !detailsEvenRef.current;

        const detailsActive = detailsEvenRef.current ? "#details-even" : "#details-odd";
        const detailsInactive = detailsEvenRef.current ? "#details-odd" : "#details-even";

        const activeData = data[orderRef.current[0]];
        const activeElement = container.querySelector(`${detailsActive} .place-box .text`);
        const title1Element = container.querySelector(`${detailsActive} .title-1`);
        const title2Element = container.querySelector(`${detailsActive} .title-2`);
        const descElement = container.querySelector(`${detailsActive} .desc`);

        if (activeElement) activeElement.textContent = activeData.place;
        if (title1Element) title1Element.textContent = activeData.title;
        if (title2Element) title2Element.textContent = activeData.title2;
        if (descElement) descElement.textContent = activeData.description;

        gsap.set(detailsActive, { zIndex: 22 });
        gsap.to(detailsActive, { opacity: 1, delay: 0.4, ease });
        gsap.to(`${detailsActive} .text`, {
          y: 0,
          delay: 0.1,
          duration: 0.7,
          ease,
        });
        gsap.to(`${detailsActive} .title-1`, {
          y: 0,
          delay: 0.15,
          duration: 0.7,
          ease,
        });
        gsap.to(`${detailsActive} .title-2`, {
          y: 0,
          delay: 0.15,
          duration: 0.7,
          ease,
        });
        gsap.to(`${detailsActive} .desc`, {
          y: 0,
          delay: 0.3,
          duration: 0.4,
          ease,
        });
        gsap.to(`${detailsActive} .cta`, {
          y: 0,
          delay: 0.35,
          duration: 0.4,
          onComplete: resolve,
          ease,
        });
        gsap.set(detailsInactive, { zIndex: 12 });

        const [active, ...rest] = orderRef.current;
        const prv = rest[rest.length - 1];

        gsap.set(getCard(prv), { zIndex: 10 });
        gsap.set(getCard(active), { zIndex: 20 });
        gsap.to(getCard(prv), { scale: 1.5, ease });

        gsap.to(getCardContent(active), {
          y: offsetTop + cardHeight - 10,
          opacity: 0,
          duration: 0.3,
          ease,
        });
        // Slide number animations removed
        // Progress bar animation removed

        gsap.to(getCard(active), {
          x: 0,
          y: 0,
          ease,
          width: window.innerWidth,
          height: window.innerHeight,
          borderRadius: 0,
          onComplete: () => {
            const bottomRightOffsetX = width - (data.length * (cardWidth + gap)) - 50;
            const bottomRightOffsetY = height - cardHeight - 50;
            const xNew = bottomRightOffsetX + (rest.length - 1) * (cardWidth + gap);
            gsap.set(getCard(prv), {
              x: xNew,
              y: bottomRightOffsetY,
              width: cardWidth,
              height: cardHeight,
              zIndex: 30,
              borderRadius: 10,
              scale: 1,
            });

            gsap.set(getCardContent(prv), {
              x: xNew,
              y: bottomRightOffsetY + cardHeight - 100,
              opacity: 1,
              zIndex: 40,
            });
            // Slide number positioning removed

            gsap.set(detailsInactive, { opacity: 0 });
            gsap.set(`${detailsInactive} .text`, { y: 100 });
            gsap.set(`${detailsInactive} .title-1`, { y: 100 });
            gsap.set(`${detailsInactive} .title-2`, { y: 100 });
            gsap.set(`${detailsInactive} .desc`, { y: 50 });
            gsap.set(`${detailsInactive} .cta`, { y: 60 });
            clicksRef.current -= 1;
            if (clicksRef.current > 0) {
              step();
            }
          },
        });

        rest.forEach((i, index) => {
          if (i !== prv) {
            const bottomRightOffsetX = width - (data.length * (cardWidth + gap)) - 50;
            const bottomRightOffsetY = height - cardHeight - 50;
            const xNew = bottomRightOffsetX + index * (cardWidth + gap);
            gsap.set(getCard(i), { zIndex: 30 });
            gsap.to(getCard(i), {
              x: xNew,
              y: bottomRightOffsetY,
              width: cardWidth,
              height: cardHeight,
              ease,
              delay: 0.1 * (index + 1),
            });

            gsap.to(getCardContent(i), {
              x: xNew,
              y: bottomRightOffsetY + cardHeight - 100,
              opacity: 1,
              zIndex: 40,
              ease,
              delay: 0.1 * (index + 1),
            });
            // Slide number animation removed
          }
        });
      });
    }

    async function loop() {
      await animate(".indicator", 4, { x: 0 });
      await animate(".indicator", 1.6, { x: window.innerWidth, delay: 0.6 });
      gsap.set(".indicator", { x: -window.innerWidth });
      await step();
      loop();
    }

    async function loadImage(src: string) {
      return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    }

    async function loadImages() {
      const promises = data.map(({ image }) => loadImage(image));
      return Promise.all(promises);
    }

    async function start() {
      try {
        await loadImages();
        init();
      } catch (error) {
        console.error("One or more images failed to load", error);
      }
    }

    start();

    return () => {
      // Cleanup function
      gsap.killTweensOf("*");
    };
  }, []);

  const cards = data.map((item, index) => (
    <div
      key={index}
      className="card absolute left-0 top-0 bg-cover bg-center shadow-2xl"
      id={`card${index}`}
      style={{ backgroundImage: `url(${item.image})` }}
    />
  ));

  const cardContents = data.map((item, index) => (
    <div key={index} className="card-content absolute left-0 top-0 text-white pl-4" id={`card-content-${index}`}>
      {/* Text content removed - cards now show only images */}
    </div>
  ));

  const slideNumbers = data.map((_, index) => (
    <div key={index} className="item absolute w-6 h-6 text-white top-0 left-0 flex items-center justify-center text-sm font-bold" id={`slide-item-${index}`}>
      {index + 1}
    </div>
  ));

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-gray-900 font-inter">
      {/* Indicator */}
      <div className="indicator fixed left-0 right-0 top-0 h-1 z-50 bg-yellow-400"></div>

      {/* Demo Container */}
      <div id="demo" className="relative w-full h-full">
        {cards}
        {cardContents}
      </div>

      {/* Main Landing Page Content Overlay */}
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="block">
              Plan Your Dream
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Adventure
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Transform your travel dreams into reality with our AI-powered trip planning platform. 
            Create personalized itineraries, discover hidden gems, and connect with fellow travelers worldwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => window.location.href = '/login'}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-500 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 hover:-translate-y-2"
            >
              <span className="flex items-center">
                Start Planning Now
                <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-white text-white px-10 py-5 rounded-2xl text-xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-500 backdrop-blur-sm hover:backdrop-blur-none"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Details Even - Positioned to not overlap with main content */}
      <div className="details absolute top-60 left-16 z-20" id="details-even" style={{ display: 'none' }}>
        <div className="place-box h-12 overflow-hidden">
          <div className="text pt-4 text-xl relative text-white">
            {data[0].place}
            <div className="absolute top-0 left-0 w-8 h-1 rounded-full bg-white"></div>
          </div>
        </div>
        <div className="title-box-1 mt-1 h-24 overflow-hidden">
          <div className="title-1 text-6xl font-semibold font-oswald text-white">{data[0].title}</div>
        </div>
        <div className="title-box-2 mt-1 h-24 overflow-hidden">
          <div className="title-2 text-6xl font-semibold font-oswald text-white">{data[0].title2}</div>
        </div>
        <div className="desc mt-4 w-96 text-gray-200 leading-relaxed">{data[0].description}</div>
        <div className="cta w-96 mt-6 flex items-center">
          <button className="bookmark border-none bg-yellow-400 w-9 h-9 rounded-full text-white flex items-center justify-center hover:bg-yellow-500 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="discover border border-white bg-transparent h-9 rounded-full text-white px-6 text-xs ml-4 uppercase hover:bg-white hover:text-gray-900 transition-all duration-300">
            Discover Location
          </button>
        </div>
      </div>

      {/* Details Odd - Positioned to not overlap with main content */}
      <div className="details absolute top-60 left-16 z-20" id="details-odd" style={{ display: 'none' }}>
        <div className="place-box h-12 overflow-hidden">
          <div className="text pt-4 text-xl relative text-white">
            {data[1].place}
            <div className="absolute top-0 left-0 w-8 h-1 rounded-full bg-white"></div>
          </div>
        </div>
        <div className="title-box-1 mt-1 h-24 overflow-hidden">
          <div className="title-1 text-6xl font-semibold font-oswald text-white">{data[1].title}</div>
        </div>
        <div className="title-box-2 mt-1 h-24 overflow-hidden">
          <div className="title-2 text-6xl font-semibold font-oswald text-white">{data[1].title2}</div>
        </div>
        <div className="desc mt-4 w-96 text-gray-200 leading-relaxed">{data[1].description}</div>
        <div className="cta w-96 mt-6 flex items-center">
          <button className="bookmark border-none bg-yellow-400 w-9 h-9 rounded-full text-white flex items-center justify-center hover:bg-yellow-500 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="discover border border-white bg-transparent h-9 rounded-full text-white px-6 text-xs ml-4 uppercase hover:bg-white hover:text-gray-900 transition-all duration-300">
            Discover Location
          </button>
        </div>
      </div>

      {/* Pagination - Positioned in bottom-right area */}
      <div className="pagination absolute right-12 bottom-20 inline-flex" id="pagination">
        <div className="arrow arrow-left z-50 w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white/60 transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 stroke-2 text-white/60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </div>
        <div className="arrow arrow-right z-50 w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center ml-2 hover:border-white/60 transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 stroke-2 text-white/60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
        {/* Progress bar and slide numbers removed */}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </div>

      {/* Cover */}
      <div className="cover absolute left-0 top-0 w-full h-full bg-white z-50"></div>
    </div>
  );
};

export default TravelCarousel;
