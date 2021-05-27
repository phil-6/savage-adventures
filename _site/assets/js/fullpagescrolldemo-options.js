//initialise fullpage scroll
new fullpage('#fullpage', {
    //options here
    licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE',
    //Navigation
    menu: '#menu',
    lockAnchors: false,
    anchors:['yourJourney', 'isItForUs', 'nervous', 'sortOf', 'containers', 'serverless'],
    navigation: true,
    navigationPosition: 'right',
    navigationTooltips: ['Your Journey', 'Is it for us?', 'We\'re Nervous', 'Sort Of There', 'We Want Containers', 'Let\'s Go Serverless'],
    showActiveTooltip: false,
    slidesNavigation: false,
    slidesNavPosition: 'bottom',

    //Scrolling
    css3: true,
    scrollingSpeed: 700,
    autoScrolling: true,
    fitToSection: true,
    fitToSectionDelay: 1000,
    scrollBar: false,
    easing: 'easeInOutCubic',
    easingcss3: 'ease',
    loopBottom: false,
    loopTop: false,
    loopHorizontal: true,
    continuousVertical: false,
    continuousHorizontal: false,
    scrollHorizontally: false,
    interlockedSlides: false,
    dragAndMove: false,
    offsetSections: false,
    resetSliders: false,
    fadingEffect: false,
    normalScrollElements: '#element1, .element2',
    scrollOverflow: false,
    scrollOverflowReset: false,
    scrollOverflowOptions: null,
    touchSensitivity: 15,
    normalScrollElementTouchThreshold: 5,
    bigSectionsDestination: null,

    //Accessibility
    keyboardScrolling: true,
    animateAnchor: true,
    recordHistory: true,

    //Design
    controlArrows: true,
    verticalCentered: true,
    paddingTop: '3em',
    paddingBottom: '10px',
    fixedElements: '#header, .footer',
    responsiveWidth: 0,
    responsiveHeight: 0,
    responsiveSlides: false,
    parallax: false,
    parallaxOptions: {type: 'reveal', percentage: 62, property: 'translate'},

    //Custom selectors
    sectionSelector: '.section',
    slideSelector: '.slide',

    lazyLoading: true,

    //events
    onLeave: function(origin, destination, direction){},
    afterLoad: function(origin, destination, direction){},
    afterRender: function(){},
    afterResize: function(width, height){},
    afterResponsive: function(isResponsive){},
    afterSlideLoad: function(section, origin, destination, direction){},
    onSlideLeave: function(section, origin, destination, direction){}
});

//methods
fullpage_api.setAllowScrolling(true);