<template lang="pug">
div(:style=`{position: 'relative', width: width+'px', height: height+'px'}`).row
  slot(v-if="!fragment" name="empty")
  //- preview
  div(v-if="mini && !readyContent").row.fit
    img(v-if="preview" :src="preview" :width="width+'px'")
  //- actions
  div(:style=`{position: 'absolute', zIndex: zIndex+500, right: '0px', top: (height/2)-15+'px'}`).row
    q-btn(round flat icon="more_vert" color="white" size="md").q-mr-sm
      q-menu(auto-close anchor="center left" self="center right")
        div(style=`width: 220px`).row
          div(v-for="(a, ai) in actions" :key="a.id" @click="actionClick(a, ai)"
            style=`height: 40px; borderBottom: 1px solid #eee`
              ).row.full-width.items-center.cursor-pointer.hr.q-px-sm
            span {{$t(a.name)}}
  //- content
  div(v-if="!mini && visible").row.fit
    node-video(
      v-if="getType === 'VIDEO'"
      @started="videoStarted"
      :index="index"
      :zIndex="zIndex"
      :preview="preview"
      :url="fragment.url"
      :startSec="getStartSec"
      :endSec="getEndSec"
      :width="width"
      :height="height")
    node-image(
      v-if="getType === 'IMAGE'"
      :index="index"
      :zIndex="zIndex"
      :url="fragment.url"
      :width="width"
      :height="height")
    //- node-book(v-if="type === 'BOOK'")
    //- node-code(v-if="type === 'CODE'")
    //- node-audio(v-if="type === 'AUDIO'")
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
    fragment: {type: Object},
    preview: {type: String},
    visible: {type: Boolean},
    mini: {type: Boolean},
    height: {type: Number},
    width: {type: Number}
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
      ]
    }
  },
  methods: {
    async videoStarted () {
      this.$log('videoStarted')
      this.readyContent = true
    },
    actionClick (a, ai) {
      this.$log('actionClick', this.fragment)
      switch (a.id) {
        case 'explore_content': {
          this.$log('explore_content')
          this.$router.push({path: '/app/content/' + this.fragment.content.oid})
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
  },
  computed: {
    getType () {
      if (this.fragment) return this.fragment.content.type
      else return null
    },
    getHeight () {
      return this.fragment.content.height
    },
    getStartSec () {
      if (this.fragment.relativePoints.length > 0) {
        return this.fragment.relativePoints[0]['x']
      } else {
        return 0
      }
    },
    getEndSec () {
      if (this.fragment.relativePoints.length > 1) {
        return this.fragment.relativePoints[1]['x']
      } else {
        return 10
      }
    }
  }
}
</script>
