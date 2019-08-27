<template lang="pug">
div(:style=`{position: 'relative', zIndex: zIndex+100, ...getRadius, overflow: 'hidden'}`).row.full-width.items-start.bg-grey-3
  //- menu
  q-btn(
    v-if="!noFragmentMenu"
    round outline icon="more_vert" color="grey-3"
    :style=`{position: 'absolute', zIndex: zIndex+2000, right: '8px', top: '8px'}`).shadow-1
    q-popup-proxy(position="bottom" auto-close anchor="bottom right" self="top right")
      div(:style=`{maxWidth: $q.screen.width < 451 ? '100%' : '230px'}` :class="{'q-pa-md': $q.screen.width <= 450}").row.fit
        div(:style=`{borderRadius: '4px'}`).row.full-width.bg-white
          div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.q-px-md.scroll
            router-link(v-if="fragment" :to="`/app/content/${fragment.content.oid}`")
              span(v-if="fragment" :style=`{whiteSpace: 'nowrap'}`).text-bold {{ fragment.content.name | cut(45) }}
            //- span(v-if="fragment" :style=`{'whiteSpace': 'nowrap'}`).text-bold {{ fragment.content.name || fragment.content.oid }}
          div(v-for="(m, mi) in menus" :key="m.id" @click="menuClick(m)"
            :style=`{height: '50px'}`
            ).row.full-width.items-center.justify-center.q-px-md.hr.cursor-pointer.scroll
            span(:style=`{color: m.color, whiteSpace: 'nowrap'}`) {{ m.name }}
        //- cancel
        div(v-if="$q.screen.width < 451" :style=`{height: '50px', borderRadius: '4px'}`
          ).row.full-width.items-center.justify-center.q-mt-sm.q-px-md.bg-grey-1
          span(:style=`{color: 'red'}`).text-bold {{ $t('Отмена') }}
  //- preview for size
  img(v-if="preview" :src="preview" :style=`{zIndex: zIndex+20, width: '100%', ...getStyles}` @error="previewError" draggable="false")
  //- active fragment
  div(
    v-if="needFull && fragment"
    :style=`{position: 'absolute', zIndex: zIndex+50, top: '0px', maxHeight: '100%', opacity: fragmentReady ? 1 : 0}`).row.fit.bg-grey-3
    node-video(v-if="fragment.content.type === 'VIDEO'" :fragment="fragment" :active="active" :index="index" :inEditor="inEditor" @ready="fragmentReady = true")
    //- node-image
  //- fragment slot
  slot(name="fragment" :index="index")
</template>

<script>
import nodeVideo from './node_video_css'

export default {
  name: 'nodeFragmentCss',
  components: {nodeVideo},
  props: ['oid', 'name', 'index', 'zIndex', 'preview', 'needFull', 'fragment', 'maxHeight', 'noFragmentMenu', 'active', 'inEditor'],
  data () {
    return {
      menus: [
        {id: 'explore_content', name: 'Исследовать контент'},
        {id: 'fork_fragment', name: 'Создать ядро с этим фрагментом'},
        // {id: 'add_content_to_workspace', name: 'Добавить конент в мастерскую'}
      ],
      fragmentReady: false,
      videoPlaying: false
    }
  },
  computed: {
    getRadius () {
      return {
        borderBottomLeftRadius: '100%8px',
        borderBottomRightRadius: '100%8px',
        borderTopLeftRadius: '100%8px',
        borderTopRightRadius: '100%8px'
      }
    },
    getStyles () {
      return {
        objectFit: 'contain',
        maxHeight: 'calc(' + this.maxHeight + ' / 2 - 20px)'
      }
    }
  },
  watch: {
    active: {
      immediate: true,
      handler (to, from) {
        this.$log('active CHANGED')
      }
    }
  },
  methods: {
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
          // prepare node
          let f = JSON.parse(JSON.stringify(this.fragment))
          let n = { name: '', thumbUrl: [], fragments: [], spheres: [], author: this.$store.state.auth.user }
          n.fragments[this.index] = {
            oid: f.content.oid,
            relativePoints: f.relativePoints.map(p => {
              delete p.__typename
              return p
            }),
            relativeScale: f.relativeScale,
            url: f.url,
            content: f.content
          }
          n.thumbUrl[this.index] = this.preview
          this.$log('forkFragment', n)
          // save node to store
          this.$store.commit('workspace/state', ['node', n])
          this.$router.push('/app/create/node')
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
    },
    previewError (e) {
      this.$log('previewError', this.oid, this.name)
      e.target.src = 'https://storage.yandexcloud.net/kalpa-thumbs/7n/r9/132596514735333573_600_1.jpg'
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
