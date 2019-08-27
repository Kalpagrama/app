<template lang="pug">
div(
  :style=`{position: 'relative', zIndex: zIndex+50, overflow: 'hidden', ...getRadius}`
  @click="fragmentClick" @mouseover="mouseOver" @mouseleave="mouseLeave"
  ).row.full-width.bg-grey-2
  //- menu
  q-btn(
    v-if="false"
    v-show="menuBtnShow"
    round flat icon="more_vert" color="white"
    :style=`{position: 'absolute', zIndex: zIndex+2000, right: '6px', top: '40%'}`).shadow-1
    q-popup-proxy(position="bottom" auto-close anchor="bottom right" self="top right")
      div(:style=`{maxWidth: $q.screen.width < 451 ? '100%' : '230px'}` :class="{'q-pa-md': $q.screen.width <= 450}").row.fit
        div(:style=`{borderRadius: '4px'}`).row.full-width.bg-white
          div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.q-px-md
            span(v-if="fragment").text-bold {{ fragment.content.name || fragment.content.oid }}
          div(v-for="(m, mi) in menus" :key="m.id" @click="menuClick(m)"
            :style=`{height: '50px'}`
            ).row.full-width.items-center.q-px-md.hr.cursor-pointer
            span(:style=`{color: m.color}`) {{ m.name }}
        //- cancel
        div(v-if="$q.screen.width < 451" :style=`{height: '50px', borderRadius: '4px'}`
          ).row.full-width.items-center.justify-center.q-mt-sm.q-px-md.bg-grey-1
          span(:style=`{color: 'red'}`).text-bold {{ $t('Отмена') }}
  slot(v-if="!fragment")
  slot(name="fragmentExplorer" :index="index")
  //- preview
  img(
    v-if="preview" v-show="imgLoaded" :src="preview" draggable="false"
    :style=`{width: '100%', zIndex: zIndex+10, maxHeight: '100%', objectFit: 'contain'}`
    @error="imgError" @load="imgLoad")
  div(
    v-if="needFull && fragment"
    :style=`{position: 'absolute', top: '0px', maxHeight: '100%', opacity: fragmentReady ? 1 : 0}`).row.fit.bg-grey-3
    video(ref="kvideo" :src="fragment.url" :style=`{width: '100%', maxHeight: '100%', objectFit: 'contain'}`
      @playing="videoStarted" loop playsinline)
  //- node-image
  //- node-book
  //- node-code
</template>

<script>
import nodeVideo from './node_video'
import nodeImage from './node_image'

export default {
  name: 'nodeFragment',
  components: { nodeVideo, nodeImage },
  props: {
    mini: {type: Boolean},
    index: {type: Number},
    zIndex: {type: Number},
    name: {type: String},
    preview: {type: String},
    fragment: {type: Object},
    active: {type: Boolean},
    needFull: {type: Boolean},
    height: {type: String}
  },
  data () {
    return {
      menus: [
        {id: 'explore_content', name: 'Исследовать контент'},
        {id: 'fork_fragment', name: 'Форкнуть фрагмент'},
        {id: 'add_content_to_workspace', name: 'Добавить конент в мастерскую'}
      ],
      imgLoaded: false,
      fragmentReady: false
    }
  },
  computed: {
    getRadius () {
      return {
        borderBottomLeftRadius: '100%7px',
        borderBottomRightRadius: '100%7px',
        borderTopLeftRadius: '100%7px',
        borderTopRightRadius: '100%7px'
      }
    },
    menuBtnShow () {
      return true
    }
  },
  watch: {
    active: {
      handler (to, from) {
        this.$log('active CHANGED')
        if (!this.$refs.kvideo) return
        if (to) this.$refs.kvideo.play()
        else this.$refs.kvideo.pause()
      }
    }
  },
  methods: {
    async imgLoad (e) {
      // this.$log('imgLoad', this.name, this.index, e.target.height)
      this.imgLoaded = true
      this.$emit('height', e.target.height)
    },
    async videoStarted () {
      this.$log('videoStarted', this.name, this.index)
      this.fragmentReady = true
    },
    imgError (e) {
      // this.$log('imgError', e)
      e.target.src = 'https://storage.yandexcloud.net/kalpa-thumbs/7a/97/122539424771809403_600_0.jpg'
    },
    mouseOver (e) {
      // this.$log('onMouserover', e)
    },
    mouseLeave (e) {
      // this.$log('onMouseleave', e)
    },
    fragmentClick () {
      this.$log('fragmentClick')
      // TODO: desktop and mobile behavior
    },
    menuClick (m, mi) {
      this.$log('actionClick')
      switch (m.id) {
        case 'explore_content': {
          this.$log('actionClick', m.id)
          this.$router.push(`/app/content/${this.fragment.content.oid}`)
          break
        }
        case 'fork_fragment': {
          this.$log('actionClick', m.id)
          break
        }
        case 'add_content_to_workspace': {
          this.$log('actionClick', m.id)
          break
        }
        case 'add_node_to_workspace': {
          this.$log('actionClick', m.id)
          break
        }
      }
    }
  }
}
</script>
