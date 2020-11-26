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
    //- HEADER: author, createdAt
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
      kalpa-menu-actions(:actions="actions")
    //- ITEMS: one or two
    slot(name="items")
    node-item(v-if="showItems && !$slots.items && node.items.length === 1" v-bind="$props")
    node-items(v-if="showItems && !$slots.items && node.items.length === 2" v-bind="$props")
    //- ESSENCE:
    slot(name="name")
    div(
      v-if="showName && node.name.length > 0"
      :style=`{position: 'relative',}`).row.full-width
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
              minHeight: '60px',
              textAlign: 'center',
            }`).row.full-width.items-center.content-center.justify-center.q-pa-sm
            slot(name="name")
            span(
              :style=`{
                fontSize: nodeNameSize+'px',
              }`).text-white.text-bold.cursor-pointer {{ node.name }}
      //- SPHERES: category & spheres...
      div(
        v-if="showSpheres && !$slots['name-bottom'] && node.spheres.length > 0").row.full-width.scroll.q-pb-sm
        .row.no-wrap.q-pl-sm
          router-link(
            v-for="(s,si) in node.spheres" :key="s.oid"
            :to="'/sphere/'+s.oid"
            :style=`{
              whiteSpace: 'nowrap',
              borderRadius: '10px',
            }`
            ).text-grey-4.q-py-xs.q-px-sm.b-50.q-mr-sm
            q-icon(name="blur_on" size="18px" color="grey-4" :style=`{marginBottom: '2px',}`).q-mr-xs
            span {{ s.name }}
          slot(name="name-bottom")
        slot(name="name-right")
    .row.full-width
      slot(name="footer")
  //- FOOTER: share, vote, link?
  node-actions(v-if="showActions" :node="node" :isActive="isActive" :isVisible="isVisible")
</template>

<script>

export default {
  name: 'nodeFeed',
  components: {
    nodeItem: () => import('./node_item.vue'),
    nodeItems: () => import('./node_items.vue'),
    nodeActions: () => import('components/node/node_actions.vue')
  },
  props: {
    node: {type: Object},
    isActive: {type: Boolean},
    isVisible: {type: Boolean},
    showHeader: {type: Boolean, default: true},
    showName: {type: Boolean, default: true},
    showActions: {type: Boolean, default: true},
    showSpheres: {type: Boolean, default: true},
    showItems: {type: Boolean, default: true}
  },
  data () {
    return {
    }
  },
  computed: {
    // TODO: impl better way
    nodeNameSize () {
      let l = this.node.name.length
      if (l < 50) return 18
      else if (l >= 50 && l < 100) return 14
      else if (l >= 100) return 12
      else return 10
    },
    nodeIsMine () {
      return this.node.author.oid === this.$store.getters.currentUser().oid
    },
    actions () {
      let res = {
        report: {
          name: 'Пожаловаться',
          color: 'red',
          cb: () => {
            this.$log('report...')
          }
        },
      }
      if (this.nodeIsMine) {
        res.delete = {
          name: 'Удалить',
          color: 'red',
          cb: () => {
            this.$log('nodeDelete...')
          }
        }
      }
      return res
    }
  }
}
</script>
