<template lang="pug">
video-editor(:inCreator="false" :fragmentInput="fragment")
</template>

<script>
import contentVideoNodes from './content_video_nodes'
import videoEditor from 'components/video_editor'
// TODO: when nodeClick not go to this node? find this node in this content? logic yeah
// TODO: remember extra information of the route for caching
// TODO: remembering last route when opens the app again? like node creator?
export default {
  name: 'contentExplorer__contentVideo',
  components: {contentVideoNodes, videoEditor},
  props: {
    content: {type: Object},
    inEditor: {type: Boolean, default () { return false }}
  },
  data () {
    return {
      me: null,
      player: null,
      width: 500,
      nodes: [],
      nowSec: 0,
      menus: [],
      tab: 'content'
    }
  },
  computed: {
    isDesktop () {
      return this.$q.screen.width > 850
    },
    barNow () {
      return (this.nowSec * (this.width - 20)) / this.content.duration
    },
    fragment () {
      return {
        id: 'zxc',
        tags: ['isdfji'],
        relativePoints: [],
        relativeScale: [],
        content: this.content
      }
    }
  },
  watch: {
    content: {
      immediate: true,
      async handler (to, from) {
        this.$log('content CHANGED', to)
        this.nodes = await this.nodesLoad(to.oid)
      }
    }
  },
  methods: {
    contentMenuClick () {
      this.$log('contentMenuClick')
    },
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      // this.$router.push(`/app/node/${n.oid}`)
      // TODO: open context menu for  desiding what to do
      // TODO: context menu for app?
      // TODO: what fragment to take? first or second? takes first...
      if (!this.isDesktop) this.$refs.kpanels.goTo('content')
      this.player.setCurrentTime(n.fragmentsPoints[0].relativePoints[0]['x'])
    },
    async nodesLoad (oid) {
      this.$log('nodesLoad start')
      let {data: {sphereNodes}} = await this.$apollo.query({
        query: gql`
          query contentNodes($oid: OID!) {
            sphereNodes (sphereOid: $oid, pagination: {pageSize: 100}, sortStrategy: HOT) {
              items {
                oid
                type
                name
              }
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('nodesLoad done', sphereNodes)
      // return nodes
      // return nodes.map(n => n.objectShort)
      // return nodes.map(n => {
      //   return {fragmentsPoints: n.fragments, ...n.objectShort}
      // })
      return []
    },
    timeUpdate (e) {
      this.nowSec = this.player.currentTime
      this.$emit('now', this.player.currentTime)
    },
    playing (e) {
      this.$log('VIDEO STARTED')
    },
    onResize (e) {
      this.$log('onResize', e)
      this.$set(this, 'width', e.width)
    }
  },
  mounted () {
    this.$log('mounted')
    // this.$refs.kresize.trigger()
    // this.me = new self.MediaElementPlayer(this.$refs.kvideo, {
    //   loop: true,
    //   autoplay: true,
    //   controls: false,
    //   showPosterWhenPaused: false,
    //   clickToPlayPause: true,
    //   iPadUseNativeControls: false,
    //   iPhoneUseNativeControls: false,
    //   AndroidUseNativeControls: false,
    //   pauseOtherPlayers: false,
    //   alwaysShowControls: true,
    //   stretching: 'fill',
    //   success: async (mediaElement, originalNode, instance) => {
    //     this.player = mediaElement
    //     this.player.addEventListener('timeupdate', this.timeUpdate, false)
    //     this.player.addEventListener('playing', this.playing, false)
    //     this.$log('player LOADED')
    //   }
    // })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.player.removeEventListener('timeupdate', this.timeUpdate)
    // this.player.removeEventListener('playing', this.playing)
  }
}
</script>
