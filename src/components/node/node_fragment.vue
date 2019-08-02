<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.full-height
  slot(v-if="!getFragment" name="empty" :index="index")
  slot(name="node" :index="index")
  //- preview :style=`{minHeight: '200px'}`
  img(v-if="getPreview && !imgError" :src="getPreview"
    width="100%" height="200px" @error="imageError" draggable="false" style=`object-fit: cover`)
  //- actions
  div(v-if="getFragment" :style=`{position: 'absolute', zIndex: zIndex+100, right: '0px'}`).row
    slot(name="actions" :index="index")
    q-btn(v-if="!$slots.actions" round outline dense icon="more_vert" color="white" size="md").q-ma-sm
      q-menu(auto-close anchor="bottom right" self="top right")
        div(style=`width: 220px`).row
          div(v-for="(a, ai) in actions" :key="a.id" @click="actionClick(a, ai)"
            style=`height: 40px; borderBottom: 1px solid #eee`
              ).row.full-width.items-center.cursor-pointer.hr.q-px-sm
            span {{$t(a.name)}}
  //- content
  div(v-if="!mini" :style=`{position: 'absolute', top: '0px', zIndex: zIndex+50, maxWidth: '100%', maxHeight: '100%'}`).row.fit
    node-video(
      v-if="getType === 'VIDEO'"
      @started="videoStarted"
      :index="index"
      :zIndex="zIndex"
      :preview="getPreview"
      :url="getUrl"
      :startSec="getStartSec"
      :endSec="getEndSec"
      :visible="visible")
</template>

<script>
import nodeVideo from './node_video'
import nodeImage from './node_image'

export default {
  name: 'nodeFragment',
  components: { nodeVideo, nodeImage },
  props: {
    index: {type: Number},
    zIndex: {type: Number},
    node: {type: Object, required: true},
    nodeFull: {type: Object},
    visible: {type: Boolean},
    mini: {type: Boolean}
  },
  data () {
    return {
      ready: false,
      readyContent: false,
      action: null,
      actions: [
        {id: 'explore_content', name: 'explore_content'},
        {id: 'fork_fragment', name: 'fork_fragment'},
        {id: 'add_content_to_workspace', name: 'add_content_to_workspace'},
        {id: 'add_node_to_workspace', name: 'add_node_to_workspace'}
      ],
      imgError: false,
      imgSrc: 'https://c8.alamy.com/comp/F5FHA4/vertical-new-york-the-flatiron-building-one-of-the-first-skyscrapers-F5FHA4.jpg'
    }
  },
  computed: {
    getFragment () {
      if (this.nodeFull) return this.nodeFull.fragments[this.index]
      else return null
    },
    getType () {
      if (this.getFragment) return this.getFragment.content.type
      else return null
    },
    getHeight () {
      if (this.getFragment) return this.getFragment.content.height
      else return 300
    },
    getWidth () {
      if (this.getFragment) return this.getFragment.content.width
      else return 300
    },
    getPreview () {
      return this.node.thumbUrl[this.index]
    },
    getUrl () {
      if (this.getFragment) {
        return this.getFragment.url
      } else {
        return null
      }
    },
    getStartSec () {
      if (this.getType === 'VIDEO') {
        if (this.getFragment.relativePoints.length > 0) return this.getFragment.relativePoints[0]['x']
        else return 0
      } else {
        return null
      }
    },
    getEndSec () {
      if (this.getType === 'VIDEO') {
        if (this.getFragment.relativePoints.length > 1) return this.getFragment.relativePoints[1]['x']
        else return 10
      } else {
        return null
      }
    }
  },
  methods: {
    imageError (e) {
      this.$log('*** imageError', e)
      // this.imgError = true
      // e.target.src = 'https://storage.yandexcloud.net/kalpa-thumbs/cx/2f/127492172013445271_600_1.jpg'
    },
    async videoStarted () {
      this.$log('videoStarted')
      this.readyContent = true
    },
    actionClick (a, ai) {
      this.$log('actionClick')
      switch (a.id) {
        case 'explore_content': {
          this.$log('explore_content')
          this.$router.push({path: '/app/content/' + this.getFragment.content.oid})
          break
        }
        case 'fork_fragment': {
          this.$log('fork_fragment')
          break
        }
        case 'add_content_to_workspace': {
          this.$log('add_content_to_workpsace')
          break
        }
        case 'add_node_to_workspace': {
          this.$log('add_node_to_workspace')
          break
        }
      }
    }
  }
}
</script>
