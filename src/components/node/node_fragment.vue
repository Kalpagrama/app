<template lang="pug">
div(
  :style=`{position: 'relative', overflow: 'hidden', ...getRadius}`
  v-on:mouseover="$wait(180).then(() => (hover = true))"
  v-on:mouseleave="hover = false").col.bg-grey-3
  //- menu
  q-btn(
    v-show="!noFragmentActions && menuBtnShow"
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
  //- preview
  .row.fit
    img(v-if="preview" :src="preview" width="100%" draggable="false" :style=`{objectFit: index === 0 ? 'cover' : 'cover'}`
      @load="imageLoaded")
    slot
    //- div(:style=`{position: 'relative'}`).row.fit
    //- div(:style=`{position: 'absolute', zIndex: zIndex}`).row.fit.br.bg-yellow
    node-video(
      v-if="fragment && !mini && getType === 'VIDEO'"
      :style=`{position: 'absolute', zIndex: zIndex+1000, maxHeight: '100%'}`
      @started="videoStarted"
      :index="index"
      :zIndex="zIndex"
      :preview="preview"
      :url="getUrl"
      :startSec="getStartSec"
      :endSec="getEndSec"
      :visible="visible")
  //- fragment
  //- div(:style=`{position: 'relative'}`).row.full-width
  //-   slot(v-if="!getFragment" name="empty" :index="index")
  //-   slot(name="node" :index="index")
  //-   //- preview :style=`{minHeight: '200px'}`
  //-   img(v-if="getPreview && !imgError" :src="getPreview"
  //-     width="100%" height="100%" @error="imageError" draggable="false" style=`object-fit: contain`)
  //-   //- actions
  //-   div(v-if="getFragment" :style=`{position: 'absolute', zIndex: zIndex+100, right: '0px'}`).row
  //-     slot(name="actions" :index="index")
  //-     q-btn(v-if="!$slots.actions" round outline dense icon="more_vert" color="white" size="md").q-ma-sm
  //-       q-menu(auto-close anchor="bottom right" self="top right")
  //-         div(style=`width: 220px`).row
  //-           div(v-for="(a, ai) in actions" :key="a.id" @click="actionClick(a, ai)"
  //-             style=`height: 40px; borderBottom: 1px solid #eee`
  //-               ).row.full-width.items-center.cursor-pointer.hr.q-px-sm
  //-             span {{$t(a.name)}}
  //- content
  //- div(v-if="!mini" :style=`{position: 'absolute', top: '0px', zIndex: zIndex+50, maxWidth: '100%', maxHeight: '100%'}`).row.fit
</template>

<script>
import nodeVideo from './node_video'
import nodeImage from './node_image'

export default {
  name: 'nodeFragment',
  components: { nodeVideo, nodeImage },
  props: {
    zIndex: {type: Number},
    index: {type: Number},
    preview: {type: String},
    fragment: {type: Object},
    visible: {type: Boolean},
    mini: {type: Boolean},
    noFragmentActions: {type: Boolean}
  },
  data () {
    return {
      menus: [
        {id: 'explore_content', name: 'Исследовать контент'},
        {id: 'fork_fragment', name: 'Форкнуть фрагмент'},
        {id: 'add_content_to_workspace', name: 'Добавить конент в мастерскую'}
      ],
      imgError: false,
      imgSrc: 'https://c8.alamy.com/comp/F5FHA4/vertical-new-york-the-flatiron-building-one-of-the-first-skyscrapers-F5FHA4.jpg',
      hover: false
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
      if (this.$q.platform.is.mobile) {
        return true
      } else {
        return this.hover
      }
    },
    getType () {
      return this.fragment.content.type
    },
    getUrl () {
      return this.fragment.url
    },
    getStartSec () {
      return this.fragment.relativePoints[0]['x']
    },
    getEndSec () {
      return this.fragment.relativePoints[1]['x']
    }
  },
  methods: {
    onMouseover (e) {
      this.$log('onMouserover', e)
    },
    onMouseleave (e) {
      this.$log('onMouseleave', e)
    },
    imageLoaded (e) {
      this.$log('imageLoaded', e.path[0].height)
    },
    imageError (e) {
      this.$log('*** imageError', e)
      // this.imgError = true
      // e.target.src = 'https://storage.yandexcloud.net/kalpa-thumbs/cx/2f/127492172013445271_600_1.jpg'
    },
    async videoStarted () {
      this.$log('videoStarted')
      this.readyContent = true
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
