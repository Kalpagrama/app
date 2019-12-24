<template lang="pug">
.row.full-width.justify-center.items-center
  div(:style=`{width: width+'px', height: height+'px', borderRadius: '100%', overflow: 'hidden'}`).row.justify-center.items-center
    <svg width="100%" height="100%" viewBox="0 0 306 306" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M153 303C235.843 303 303 235.843 303 153C303 70.1573 235.843 3 153 3C70.1573 3 3 70.1573 3 153C3 235.843 70.1573 303 153 303Z" fill="url(#paint0_radial)"/>
      <path d="M227.521 24.7305L80.036 279.238M78.8631 24.7305L226.055 278.359M6 153.042H300.922M294.23 116.782H10.0088M296.57 123.853L199 291.82M296.286 181.579L193.509 10.3632L50.5173 257.345M294.23 189.303H10.0088M251.737 44.1342H53.7042M255.528 48.8893L113.348 294.225M108.277 12.4096L9.21703 183.985M112.92 11.6079L255.516 256.944M50.3688 48.0876L192.658 293.424M8.70784 121.448L107.574 291.82M54.506 261.697H250.935M153.046 8L280.006 225.563H27.2579L153.046 8ZM279.469 80.4369H27.0133L153.089 298L279.469 80.4369Z" stroke="white" stroke-opacity="0.3" stroke-width="1"/>
      //- <g ref="st">
      //-   <path d="M36.8078 233.732C39.5002 233.732 42.0077 232.94 44.11 231.577C47.8025 229.182 50.2452 225.023 50.2452 220.295C50.2452 215.322 47.5439 210.98 43.5286 208.656C41.5517 207.512 39.2562 206.857 36.8078 206.857C34.5963 206.857 32.5095 207.391 30.6696 208.338C26.3352 210.568 23.3704 215.085 23.3704 220.295C23.3704 227.716 29.3865 233.732 36.8078 233.732Z" fill="white"/>
      //-   <path d="M153.206 32.171C155.654 32.171 157.949 31.5163 159.926 30.3726C163.763 28.1527 166.4 24.0904 166.628 19.3956C166.638 19.1762 166.644 18.9555 166.644 18.7335C166.644 11.3123 160.628 5.29614 153.206 5.29614C145.785 5.29614 139.769 11.3123 139.769 18.7335C139.769 18.9554 139.774 19.1761 139.785 19.3953C140.013 24.0894 142.649 28.1512 146.484 30.3714C148.462 31.5159 150.757 32.171 153.206 32.171Z" fill="white"/>
      //-   <path d="M269.602 233.732C277.024 233.732 283.04 227.716 283.04 220.295C283.04 215.085 280.075 210.568 275.74 208.338C273.9 207.391 271.814 206.857 269.602 206.857C267.154 206.857 264.858 207.512 262.881 208.656C258.866 210.98 256.165 215.322 256.165 220.295C256.165 225.023 258.608 229.182 262.3 231.577C264.402 232.94 266.91 233.732 269.602 233.732Z" fill="white"/>
      //-   <path d="M50.2452 220.295H153.205H256.165M50.2452 220.295C50.2452 225.023 47.8025 229.182 44.11 231.577M50.2452 220.295C50.2452 215.322 47.5439 210.98 43.5286 208.656M256.165 220.295C256.165 215.322 258.866 210.98 262.881 208.656M256.165 220.295C256.165 225.023 258.608 229.182 262.3 231.577M146.484 30.3714C148.462 31.5159 150.757 32.171 153.206 32.171C155.654 32.171 157.949 31.5163 159.926 30.3726M146.484 30.3714L95.0063 119.514L43.5286 208.656M146.484 30.3714C142.649 28.1512 140.013 24.0894 139.785 19.3953M159.926 30.3726L211.404 119.514L262.881 208.656M159.926 30.3726C163.763 28.1527 166.4 24.0904 166.628 19.3956M166.628 19.3956C166.638 19.1762 166.644 18.9555 166.644 18.7335C166.644 11.3123 160.628 5.29614 153.206 5.29614C145.785 5.29614 139.769 11.3123 139.769 18.7335C139.769 18.9554 139.774 19.1761 139.785 19.3953M166.628 19.3956C234.538 26.1307 287.579 83.425 287.579 153.108C287.579 172.793 283.346 191.49 275.74 208.338M139.785 19.3953C71.873 26.1291 18.8308 83.424 18.8308 153.108C18.8308 172.793 23.0639 191.49 30.6696 208.338M44.11 231.577C42.0077 232.94 39.5002 233.732 36.8078 233.732C29.3865 233.732 23.3704 227.716 23.3704 220.295C23.3704 215.085 26.3352 210.568 30.6696 208.338M44.11 231.577C68.5082 265.438 108.282 287.482 153.205 287.482C198.128 287.482 237.902 265.438 262.3 231.577M43.5286 208.656C41.5517 207.512 39.2562 206.857 36.8078 206.857C34.5963 206.857 32.5095 207.391 30.6696 208.338M262.881 208.656C264.858 207.512 267.154 206.857 269.602 206.857C271.814 206.857 273.9 207.391 275.74 208.338M275.74 208.338C280.075 210.568 283.04 215.085 283.04 220.295C283.04 227.716 277.024 233.732 269.602 233.732C266.91 233.732 264.402 232.94 262.3 231.577" stroke="white" stroke-width="5"/>
      //- </g>
      <path ref="st" d="M282.933 228L275.43 215.008L217.966 115.5L160.503 15.9925L153.002 3M23.0674 228H38.0674H153H267.933H282.933H23.0674ZM23.0674 228L30.5699 215.008L88.0336 115.5L145.498 15.9911L153.002 3L23.0674 228ZM23.0674 228L16.2155 214.653C7.72539 195.846 3 174.975 3 153C3 75.2131 62.2103 11.2555 138.019 3.7387L153.002 3L23.0674 228ZM23.0674 228L31.2189 240.594C58.4542 278.392 102.853 303 153 303C203.147 303 247.546 278.392 274.781 240.594L282.933 228H23.0674ZM282.933 228L289.785 214.653C298.275 195.846 303 174.975 303 153C303 75.2142 243.791 11.2573 167.984 3.73901L153.002 3L282.933 228Z" stroke="white" stroke-width="5"/>
      //- кольцо вокруг
      <path d="M303 153C303 75.2142 243.791 11.2573 167.984 3.73901L153.002 3L138.019 3.7387C62.2103 11.2555 3 75.2131 3 153C3 174.975 7.72539 195.846 16.2155 214.653L23.0674 228L31.2189 240.594C58.4542 278.392 102.853 303 153 303C203.147 303 247.546 278.392 274.781 240.594L282.933 228L289.785 214.653C298.275 195.846 303 174.975 303 153Z" stroke="white" stroke-width="7"/>
      <path ref="nd" d="M282.933 228L275.43 215.008L217.966 115.5L160.503 15.9925L153.002 3M23.0674 228H38.0674H153H267.933H282.933H23.0674ZM23.0674 228L30.5699 215.008L88.0336 115.5L145.498 15.9911L153.002 3L23.0674 228ZM23.0674 228L16.2155 214.653C7.72539 195.846 3 174.975 3 153C3 75.2131 62.2103 11.2555 138.019 3.7387L153.002 3L23.0674 228ZM23.0674 228L31.2189 240.594C58.4542 278.392 102.853 303 153 303C203.147 303 247.546 278.392 274.781 240.594L282.933 228H23.0674ZM282.933 228L289.785 214.653C298.275 195.846 303 174.975 303 153C303 75.2142 243.791 11.2573 167.984 3.73901L153.002 3L282.933 228Z" stroke="white" stroke-width="5"/>
      <path ref="rd" d="M282.933 228L275.43 215.008L217.966 115.5L160.503 15.9925L153.002 3M23.0674 228H38.0674H153H267.933H282.933H23.0674ZM23.0674 228L30.5699 215.008L88.0336 115.5L145.498 15.9911L153.002 3L23.0674 228ZM23.0674 228L16.2155 214.653C7.72539 195.846 3 174.975 3 153C3 75.2131 62.2103 11.2555 138.019 3.7387L153.002 3L23.0674 228ZM23.0674 228L31.2189 240.594C58.4542 278.392 102.853 303 153 303C203.147 303 247.546 278.392 274.781 240.594L282.933 228H23.0674ZM282.933 228L289.785 214.653C298.275 195.846 303 174.975 303 153C303 75.2142 243.791 11.2573 167.984 3.73901L153.002 3L282.933 228Z" stroke="white" stroke-width="5"/>
      <path ref="th" d="M282.933 228L275.43 215.008L217.966 115.5L160.503 15.9925L153.002 3M23.0674 228H38.0674H153H267.933H282.933H23.0674ZM23.0674 228L30.5699 215.008L88.0336 115.5L145.498 15.9911L153.002 3L23.0674 228ZM23.0674 228L16.2155 214.653C7.72539 195.846 3 174.975 3 153C3 75.2131 62.2103 11.2555 138.019 3.7387L153.002 3L23.0674 228ZM23.0674 228L31.2189 240.594C58.4542 278.392 102.853 303 153 303C203.147 303 247.546 278.392 274.781 240.594L282.933 228H23.0674ZM282.933 228L289.785 214.653C298.275 195.846 303 174.975 303 153C303 75.2142 243.791 11.2573 167.984 3.73901L153.002 3L282.933 228Z" stroke="white" stroke-width="5"/>
      <path ref="th1" d="M282.933 228L275.43 215.008L217.966 115.5L160.503 15.9925L153.002 3M23.0674 228H38.0674H153H267.933H282.933H23.0674ZM23.0674 228L30.5699 215.008L88.0336 115.5L145.498 15.9911L153.002 3L23.0674 228ZM23.0674 228L16.2155 214.653C7.72539 195.846 3 174.975 3 153C3 75.2131 62.2103 11.2555 138.019 3.7387L153.002 3L23.0674 228ZM23.0674 228L31.2189 240.594C58.4542 278.392 102.853 303 153 303C203.147 303 247.546 278.392 274.781 240.594L282.933 228H23.0674ZM282.933 228L289.785 214.653C298.275 195.846 303 174.975 303 153C303 75.2142 243.791 11.2573 167.984 3.73901L153.002 3L282.933 228Z" stroke="white" stroke-width="5"/>
      <path ref="th2" d="M282.933 228L275.43 215.008L217.966 115.5L160.503 15.9925L153.002 3M23.0674 228H38.0674H153H267.933H282.933H23.0674ZM23.0674 228L30.5699 215.008L88.0336 115.5L145.498 15.9911L153.002 3L23.0674 228ZM23.0674 228L16.2155 214.653C7.72539 195.846 3 174.975 3 153C3 75.2131 62.2103 11.2555 138.019 3.7387L153.002 3L23.0674 228ZM23.0674 228L31.2189 240.594C58.4542 278.392 102.853 303 153 303C203.147 303 247.546 278.392 274.781 240.594L282.933 228H23.0674ZM282.933 228L289.785 214.653C298.275 195.846 303 174.975 303 153C303 75.2142 243.791 11.2573 167.984 3.73901L153.002 3L282.933 228Z" stroke="white" stroke-width="5"/>
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
    // TH
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
        rotation: 540,
        scale: 1,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    rdTimeline.to(rd, 3,
    {
      rotation: 720,
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
        rotation: -540,
        scale: 0.5,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    thTimeline.to(th, 3,
      {
        rotation: -720,
        scale: 1,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    thTimeline.to(th, 3,
    {
      rotation: -900,
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
        rotation: 540,
        scale: 0.5,
        autoAlpha: 1,
        ease: Linear.easeNone
      })
    th1Timeline.to(th1, 3,
      {
        rotation: 720,
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
      rotation: -540,
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

</style>
