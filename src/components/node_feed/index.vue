<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start
  div(
    :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: '10px', overflow: 'hidden',
    }`).row.full-width
    //- header: author, createdAt
    div(
      v-if="showHeader"
      ).row.full-width.items-center.content-center.q-pa-xs
      q-btn(
        :to="'/user/'+node.author.oid"
        flat color="white" dense no-caps)
        user-avatar(:url="node.author.thumbUrl" :width="24" :height="24")
        span.text-grey-4.q-ml-sm {{ node.author.name }}
      .col
      small.text-grey-8.q-mr-xs {{ node.countViews }}
      q-icon(name="visibility" color="grey-8").q-mr-xs
      small.text-grey-8.q-mr-xs {{ $date(node.createdAt, 'DD.MM.YYYY') }}
      q-btn(round flat dense icon="more_horiz" color="grey-9")
        q-popup-proxy(
          maximized position="bottom" dark
          cover anchor="top right" self="top right").b-40
          div(
            :style=`{
              borderRadius: '10px',
            }`
            ).row.full-width.items-start.content-start.b-40
            q-btn(
              @click="a.cb()"
              v-for="(a,akey) in actions" :key="akey"
              flat no-caps
              :color="a.color || 'white'"
              :style=`{height: '50px',}`).full-width
              span.text-bold {{ a.name }}
    //- items wrapper
    div(
      :style=`{
        position: 'relative',
        paddingBottom: Math.min(Math.round(ratio*100), 100)+'%',
      }`
      ).row.full-width
      composition-player(
        :composition="node.items[0]" :isVisible="isVisible" :isActive="isActive"
        :options=`{height: '100%', objectFit: 'contain', loop: true}`
        :style=`{
          position: 'absolute', zIndex: 100, top: 0,
        }`)
      //- content-player(
        :contentKalpa=`{
        }`)
    //- essence
    div(:style=`{position: 'relative',}`).row.full-width
      router-link(
        :to="'/node/'+node.oid"
        :style=`{
          position: 'relative',
          textAlign: 'center',
        }`
        ).row.full-width.items-start.content-start.justify-center.cursor-pointer
        slot(name="name-left")
        .col
          div(
            :style=`{
              position: 'relative',
              minHeight: '44px',
              textAlign: 'center',
            }`).row.full-width.items-center.content-center.justify-center.q-pa-sm
            slot(name="name")
            span(
              :style=`{
                fontSize: nodeNameSize+'px',
              }`).text-white.text-bold.cursor-pointer {{ node.name }}
          div(
            v-if="showSpheres && !$slots['name-bottom'] && node.spheres.length > 0").row.full-width.scroll
            .row.full-width.justify-start.no-wrap.q-pl-sm
              div(
                v-for="(s,si) in node.spheres" :key="s.oid"
                ).row.items-start.content-start.justify-start.q-pr-sm.q-pb-sm
                q-btn(
                  flat color="white" dense no-caps
                  :to="'/sphere/'+s.oid"
                  :style=`{borderRadius: '10px', whiteSpace: 'nowrap',}`).row.b-40.q-px-sm.text-grey-4 {{ s.name }}
          slot(name="name-bottom")
        slot(name="name-right")
    .row.full-width
      slot(name="footer")
  //- footer
  node-actions(v-if="showActions" :node="node" :isActive="isActive" :isVisible="isVisible")
</template>

<script>

export default {
  name: 'nodeFeed',
  components: {
    contentPlayer: () => import('components/content_player/index.vue'),
    compositionPlayer: () => import('components/composition/composition_player/index.vue'),
    nodeActions: () => import('components/node/node_actions.vue')
  },
  props: {
    node: {type: Object},
    isActive: {type: Boolean},
    isVisible: {type: Boolean},
    showHeader: {type: Boolean, default: true},
    showActions: {type: Boolean, default: true},
    showSpheres: {type: Boolean, default: true}
  },
  data () {
    return {
      showMore: false,
    }
  },
  computed: {
    ratio () {
      let height = this.node.items[0].thumbHeight
      return this.node.items[0].thumbHeight / this.node.items[0].thumbWidth
    },
    // TODO: impl better way
    nodeNameSize () {
      let l = this.node.name.length
      if (l < 50) return 18
      else if (l >= 50 && l < 100) return 14
      else if (l >= 100) return 12
      else return 10
    },
    actions () {
      return {
        share: {
          name: 'Поделиться',
          cb: () => {
            this.$log('share...')
          }
        },
        report: {
          name: 'Пожаловаться',
          color: 'red',
          cb: () => {
            this.$log('report...')
          }
        },
        delete: {
          name: 'Удалить',
          color: 'red',
          cb: () => {
            this.$log('delete...')
          }
        }
      }
    }
  },
  methods: {
  }
}
</script>
