<style lang="sass">
.sphere-item
  &:hover
    background: rgb(50,50,50)
</style>

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
      borderRadius: '10px',
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
    node-item(
      v-if="showItems && !$slots.items && node.items.length === 1"
      v-bind="$props"
      @itemActive="$emit('itemActive', $event)")
    node-items(
      v-if="showItems && !$slots.items && node.items.length === 2"
      v-bind="$props"
      :itemsStyles="itemsStyles"
      @itemActive="$emit('itemActive', $event)")
    //- ESSENCE:
    .row.full-width
      slot(name="name")
      //- link
      div(
        v-if="showName && node.oid"
        :style=`{
          minHeight: '50px',
        }`
        ).row.full-width.q-pa-xs
        q-btn(
          v-if="node.items.length === 1"
          :to="'/content/'+node.items[0].layers[0].contentOid+'?node='+node.oid"
          round flat color="grey-6" icon="select_all"
          :style=`{width: '50px', height: '50px',}`)
        router-link(
          :to="'/node/'+node.oid"
          :style=`{
            fontSize: nodeNameSize+'px',
          }`
          ).col.full-height
          div(
            v-if="node.items.length === 1"
            :style=`{textAlign: 'center'}`
            ).row.fit.items-center.content-center.justify-center.q-py-sm
            span(
              :style=`{
              }`).text-white.text-bold.cursor-pointer {{ nodeName }}
          div(v-else).row.fit.items-center.content-center
            .col
              .row.full-width.justify-end
                span.text-white.text-bold {{ $nodeItemType(node.vertices[0]).name }}
            span.text-white.text-bold.q-mx-sm -
            .col
              .row.full-width
                span.text-white.text-bold {{ $nodeItemType(node.vertices[1]).name }}
        q-btn(
          v-if="node.items.length === 1"
          :to="'/links/'+node.oid"
          round flat color="grey-6" icon="link"
          :style=`{width: '50px', height: '50px',}`)
    //- SPHERES
    div(
      v-if="showSpheres && node.oid && node.spheres.length > 0").row.full-width.justify-start.scroll.q-pb-sm
      .row.full-width.no-wrap.q-pl-sm
        .col
        //- q-btn(
          :to="'/trends/'+category.sphere.oid"
          flat color="grey-5" no-caps size="md" dense
          ).q-px-sm.q-mr-sm.b-40 {{ category.alias }}
        router-link(
          v-for="(s,si) in node.spheres" :key="s.oid"
          :to="'/sphere/'+s.oid"
          :style=`{
            whiteSpace: 'nowrap',
            borderRadius: '10px',
          }`
          ).text-grey-4.q-py-xs.q-px-sm.b-40.q-mr-sm.sphere-item
          q-icon(name="blur_on" size="18px" color="grey-4" :style=`{marginBottom: '2px',}`).q-mr-xs
          span {{ s.name }}
        .col
  //- FOOTER: slot, actions
  slot(name="footer")
  node-actions(v-if="showActions && node.oid" :node="node" :isActive="isActive" :isVisible="isVisible")
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
    showCategory: {type: Boolean, default: true},
    showItems: {type: Boolean, default: true},
    itemsStyles: { type: Array, default () { return [{}, {}] } }
  },
  data () {
    return {
    }
  },
  computed: {
    nodeName () {
      if (this.node.items.length === 1 || this.node.vertices[0] === 'ESSENCE') {
        return this.node.name
      }
      else if (this.node.vertices[0] === 'ASSOCIATIVE') {
        return 'Похожи'
      }
      else {
        return this.$nodeItemType(this.node.vertices[0]).name + '  -  ' + this.$nodeItemType(this.node.vertices[1]).name
      }
    },
    nodeEssenceLink () {
      if (!this.node) return null
      if (this.node.items[0].layers) {
        return '/content/' + this.node.items[0].layers[0].contentOid + '?node=' + this.node.oid
      }
      // TODO: handle non node/composition case
      else {
        return '/node/' + this.node.oid
      }
    },
    category () {
      if (!this.node) return null
      return this.$store.state.ui.nodeCategories.find(c => c.type === this.node.category)
    },
    // TODO: impl better way
    nodeNameSize () {
      let l = this.node.name.length
      if (l < 20) return 20
      else if (l >= 20 && l < 50) return 18
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
