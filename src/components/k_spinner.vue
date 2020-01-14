<template lang="pug">
.row.full-width.justify-center.items-center
  div(:style=`{width: width+'px', height: height+'px', borderRadius: '100%', overflow: 'hidden'}`).row.justify-center.items-center
    <svg width="100%" height="100%" viewBox="0 0 306 306" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M153 303C235.843 303 303 235.843 303 153C303 70.1573 235.843 3 153 3C70.1573 3 3 70.1573 3 153C3 235.843 70.1573 303 153 303Z" fill="url(#paint0_radial)"/>
      <path d="M227.521 24.7305L80.036 279.238M78.8631 24.7305L226.055 278.359M6 153.042H300.922M294.23 116.782H10.0088M296.57 123.853L199 291.82M296.286 181.579L193.509 10.3632L50.5173 257.345M294.23 189.303H10.0088M251.737 44.1342H53.7042M255.528 48.8893L113.348 294.225M108.277 12.4096L9.21703 183.985M112.92 11.6079L255.516 256.944M50.3688 48.0876L192.658 293.424M8.70784 121.448L107.574 291.82M54.506 261.697H250.935M153.046 8L280.006 225.563H27.2579L153.046 8ZM279.469 80.4369H27.0133L153.089 298L279.469 80.4369Z" stroke="white" stroke-opacity="0.3" stroke-width="1"/>
      <path ref="st" d="M282.933 228L275.43 215.008L217.966 115.5L160.503 15.9925L153.002 3M23.0674 228H38.0674H153H267.933H282.933H23.0674ZM23.0674 228L30.5699 215.008L88.0336 115.5L145.498 15.9911L153.002 3L23.0674 228ZM23.0674 228L16.2155 214.653C7.72539 195.846 3 174.975 3 153C3 75.2131 62.2103 11.2555 138.019 3.7387L153.002 3L23.0674 228ZM23.0674 228L31.2189 240.594C58.4542 278.392 102.853 303 153 303C203.147 303 247.546 278.392 274.781 240.594L282.933 228H23.0674ZM282.933 228L289.785 214.653C298.275 195.846 303 174.975 303 153C303 75.2142 243.791 11.2573 167.984 3.73901L153.002 3L282.933 228Z" stroke="white" stroke-width="5"/>
      //- кольцо вокруг
      <path d="M303 153C303 75.2142 243.791 11.2573 167.984 3.73901L153.002 3L138.019 3.7387C62.2103 11.2555 3 75.2131 3 153C3 174.975 7.72539 195.846 16.2155 214.653L23.0674 228L31.2189 240.594C58.4542 278.392 102.853 303 153 303C203.147 303 247.546 278.392 274.781 240.594L282.933 228L289.785 214.653C298.275 195.846 303 174.975 303 153Z" stroke="white" stroke-width="7"/>
      <path ref="nd" d="M23.0672 78L30.5698 90.9921L88.0329 190.5L145.498 290.008L152.998 303M282.932 78H267.932H153H38.0672H23.0672H282.932ZM282.932 78L275.43 90.9921L217.967 190.5L160.502 290.008L152.998 303L282.932 78ZM282.932 78L289.785 91.3478C298.275 110.154 303 131.025 303 153C303 230.788 243.791 294.744 167.981 302.261L152.998 303L282.932 78ZM282.932 78L274.781 65.4064C247.545 27.6075 203.147 3 153 3C102.853 3 58.455 27.6075 31.2189 65.4064L23.0672 78H282.932ZM23.0672 78L16.2154 91.3478C7.72542 110.154 3 131.025 3 153C3 230.786 62.2093 294.744 138.017 302.261L152.998 303L23.0672 78Z" stroke="white" stroke-width="5"/>
      <path ref="rd" d="M282.933 228L275.43 215.008L217.966 115.5L160.503 15.9925L153.002 3M23.0674 228H38.0674H153H267.933H282.933H23.0674ZM23.0674 228L30.5699 215.008L88.0336 115.5L145.498 15.9911L153.002 3L23.0674 228ZM23.0674 228L16.2155 214.653C7.72539 195.846 3 174.975 3 153C3 75.2131 62.2103 11.2555 138.019 3.7387L153.002 3L23.0674 228ZM23.0674 228L31.2189 240.594C58.4542 278.392 102.853 303 153 303C203.147 303 247.546 278.392 274.781 240.594L282.933 228H23.0674ZM282.933 228L289.785 214.653C298.275 195.846 303 174.975 303 153C303 75.2142 243.791 11.2573 167.984 3.73901L153.002 3L282.933 228Z" stroke="white" stroke-width="5"/>
      <path ref="th" d="M23.0672 78L30.5698 90.9921L88.0329 190.5L145.498 290.008L152.998 303M282.932 78H267.932H153H38.0672H23.0672H282.932ZM282.932 78L275.43 90.9921L217.967 190.5L160.502 290.008L152.998 303L282.932 78ZM282.932 78L289.785 91.3478C298.275 110.154 303 131.025 303 153C303 230.788 243.791 294.744 167.981 302.261L152.998 303L282.932 78ZM282.932 78L274.781 65.4064C247.545 27.6075 203.147 3 153 3C102.853 3 58.455 27.6075 31.2189 65.4064L23.0672 78H282.932ZM23.0672 78L16.2154 91.3478C7.72542 110.154 3 131.025 3 153C3 230.786 62.2093 294.744 138.017 302.261L152.998 303L23.0672 78Z" stroke="white" stroke-width="5"/>
      <path ref="th1" d="M282.933 228L275.43 215.008L217.966 115.5L160.503 15.9925L153.002 3M23.0674 228H38.0674H153H267.933H282.933H23.0674ZM23.0674 228L30.5699 215.008L88.0336 115.5L145.498 15.9911L153.002 3L23.0674 228ZM23.0674 228L16.2155 214.653C7.72539 195.846 3 174.975 3 153C3 75.2131 62.2103 11.2555 138.019 3.7387L153.002 3L23.0674 228ZM23.0674 228L31.2189 240.594C58.4542 278.392 102.853 303 153 303C203.147 303 247.546 278.392 274.781 240.594L282.933 228H23.0674ZM282.933 228L289.785 214.653C298.275 195.846 303 174.975 303 153C303 75.2142 243.791 11.2573 167.984 3.73901L153.002 3L282.933 228Z" stroke="white" stroke-width="5"/>
      <path ref="th2" d="M23.0672 78L30.5698 90.9921L88.0329 190.5L145.498 290.008L152.998 303M282.932 78H267.932H153H38.0672H23.0672H282.932ZM282.932 78L275.43 90.9921L217.967 190.5L160.502 290.008L152.998 303L282.932 78ZM282.932 78L289.785 91.3478C298.275 110.154 303 131.025 303 153C303 230.788 243.791 294.744 167.981 302.261L152.998 303L282.932 78ZM282.932 78L274.781 65.4064C247.545 27.6075 203.147 3 153 3C102.853 3 58.455 27.6075 31.2189 65.4064L23.0672 78H282.932ZM23.0672 78L16.2154 91.3478C7.72542 110.154 3 131.025 3 153C3 230.786 62.2093 294.744 138.017 302.261L152.998 303L23.0672 78Z" stroke="white" stroke-width="5"/>
      <path ref="th3" d="M282.933 228L275.43 215.008L217.966 115.5L160.503 15.9925L153.002 3M23.0674 228H38.0674H153H267.933H282.933H23.0674ZM23.0674 228L30.5699 215.008L88.0336 115.5L145.498 15.9911L153.002 3L23.0674 228ZM23.0674 228L16.2155 214.653C7.72539 195.846 3 174.975 3 153C3 75.2131 62.2103 11.2555 138.019 3.7387L153.002 3L23.0674 228ZM23.0674 228L31.2189 240.594C58.4542 278.392 102.853 303 153 303C203.147 303 247.546 278.392 274.781 240.594L282.933 228H23.0674ZM282.933 228L289.785 214.653C298.275 195.846 303 174.975 303 153C303 75.2142 243.791 11.2573 167.984 3.73901L153.002 3L282.933 228Z" stroke="white" stroke-width="5"/>
      <defs>
        <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(152.363 152.438) scale(149.46)">
        <stop offset="0.0529" stop-color="#A1D4DF"/>
        <stop offset="0.172" stop-color="#50CBDF"/>
        <stop offset="0.3012" stop-color="#13ACD6"/>
        <stop offset="0.4259" stop-color="#139CCC"/>
        <stop offset="0.5319" stop-color="#1472AC"/>
        <stop offset="0.6852" stop-color="#2D478D"/>
        <stop offset="0.8175" stop-color="#672D7A"/>
        <stop offset="0.9603" stop-color="#682D7A"/>
        </radialGradient>
      </defs>
    </svg>
</template>

<script>
import { TimelineLite, Linear, gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
// import { TimelineMax } from 'gsap'
export default {
  name: 'kSpinner',
  components: {TimelineLite, MotionPathPlugin, Linear, gsap},
  props: {
    width: {
      type: Number,
      default () {
        return 100
      }
    },
    height: {
      type: Number,
      default () {
        return 100
      }
    }
  },
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  },
  mounted () {
    gsap.registerPlugin(MotionPathPlugin);
    // ST
    const st = this.$refs.st
    const stTimeline = new TimelineLite({repeat: -1, repeatDelay: 9, ease: Linear.easeNone})
    stTimeline.fromTo(st, 3,
      {rotation: 0, autoAlpha: 1, scale: 1, transformOrigin: '50% 50%', ease: Linear.easeNone},
      {
        rotation: 360,
        scale: 2,
        autoAlpha: 0,
        ease: Linear.easeNone
      })
    // ND
    const nd = this.$refs.nd
    const ndTimeline = new TimelineLite({repeat: -1, repeatDelay: 6, ease: Linear.easeNone})
    ndTimeline.fromTo(nd, 3,
    {
      rotation: 0,
      scale: 0.5,
      autoAlpha: 1,
      transformOrigin: '50% 50%',
      ease: Linear.easeNone
    },
    {
      rotation: -360,
      scale: 1,
      autoAlpha: 1,
      transformOrigin: '50% 50%',
      ease: Linear.easeNone
    }
    )
    ndTimeline.to(nd, 3,
    {
      rotation: -540,
      scale: 2,
      autoAlpha: 0,
      ease: Linear.easeNone
    })
    ndTimeline.repeat(-1)
    // RD
    const rd = this.$refs.rd
    const rdTimeline = new TimelineLite({repeat: -1, repeatDelay: 3, ease: Linear.easeNone})
    rdTimeline.set(rd, {scale: 0.25, transformOrigin: '50% 50%'})
    rdTimeline.to(rd, 3,
      {
        rotation: 360,
        scale: 0.5,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    rdTimeline.to(rd, 3,
      {
        rotation: 720,
        scale: 1,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    rdTimeline.to(rd, 3,
    {
      rotation: 1080,
      scale: 2,
      autoAlpha: 0,
      ease: Linear.easeNone
    })
    rdTimeline.repeat(-1)
    // TH
    const th = this.$refs.th
    const thTimeline = new TimelineLite({ease: Linear.easeNone})
    thTimeline.set(th, {scale: 0, transformOrigin: '50% 50%'})
    thTimeline.to(th, 3,
      {
        rotation: -360,
        scale: 0.25,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    thTimeline.to(th, 3,
      {
        rotation: -720,
        scale: 0.5,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    thTimeline.to(th, 3,
      {
        rotation: -1080,
        scale: 1,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    thTimeline.to(th, 3,
    {
      rotation: -1440,
      scale: 2,
      autoAlpha: 0,
      ease: Linear.easeNone
    })
    thTimeline.repeat(-1)
    // TH1
    const th1 = this.$refs.th1
    const th1Timeline = new TimelineLite()
    th1Timeline.set(th1, {scale: 0, transformOrigin: '50% 50%'})
    th1Timeline.set(th1, {delay: 3})
    th1Timeline.to(th1, 3,
      {
        rotation: 360,
        scale: 0.25,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    th1Timeline.to(th1, 3,
      {
        rotation: 720,
        scale: 0.5,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    th1Timeline.to(th1, 3,
      {
        rotation: 1080,
        scale: 1,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    th1Timeline.repeat(-1)
    // TH2
    const th2 = this.$refs.th2
    const th2Timeline = new TimelineLite({ease: Linear.easeNone})
    th2Timeline.set(th2, {scale: 0, transformOrigin: '50% 50%'})
    th2Timeline.set(th2, {delay: 6})
    th2Timeline.to(th2, 3,
      {
        rotation: -360,
        scale: 0.25,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    th2Timeline.to(th2, 3,
      {
        rotation: -720,
        scale: 0.5,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    th2Timeline.repeat(-1)
    // TH3
    const th3 = this.$refs.th3
    const th3Timeline = new TimelineLite({ease: Linear.easeNone})
    th3Timeline.set(th3, {scale: 0, transformOrigin: '50% 50%'})
    th3Timeline.set(th3, {delay: 9})
    th3Timeline.to(th3, 3,
      {
        rotation: 360,
        scale: 0.25,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    th3Timeline.repeat(-1)
  }
}
</script>

<style lang="stylus" scoped>
.another
  transform: rotate(180deg)
</style>
