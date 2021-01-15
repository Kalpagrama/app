<style lang="sass">
.sphere-item
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    //- border: isActive ? '2px solid red' : '2px solid rgb(30,30,30)',
    ...styles,
  }`
  ).row.full-width.items-start.content-start
  //- wrapper
  div(
    :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: borderRadius,
    }`).row.full-width.items-start.content-start
    //- HEADER: author, createdAt, actions, date, views
    div(
      v-if="showHeader && node.oid"
      ).row.full-width.items-center.content-center.q-pa-xs
      q-btn(
        :to="'/user/'+node.author.oid"
        round flat color="white" no-caps :style=`{paddingLeft: '0px',}`).row.q-px-sm
        user-avatar(:url="node.author.thumbUrl" :width="24" :height="24").q-ml-sm
        .col
          .row.items-center.content-center.q-px-sm
            span.text-grey-4 {{ node.author.name }}
            .row.full-width
              small(:style=`{lineHeight: 0.8}`).text-grey-8 {{ node.author.username }}
      .col
      .row.items-center.content-center.justify-end.q-pt-sm
        small.text-grey-8 {{ $date(node.createdAt, 'DD.MM.YYYY') }}
        .row.full-width.items-center.content-center.justify-end
          small(:style=`{lineHeight: 0.8}`).text-grey-8.q-mr-xs {{ node.countViews }}
          q-icon(name="visibility" color="grey-9")
      kalpa-menu-actions(
        :title="node.name"
        :actions="actions" icon="more_vert")
      //- small.text-grey-8.q-mr-xs {{ node.countViews }}
      //- q-icon(name="visibility" color="grey-8").q-mr-md
      //- small.text-grey-8.q-mr-xs {{ $date(node.createdAt, 'DD.MM.YYYY') }}
      //- kalpa-menu-actions(:actions="actions")
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
    //- NAME: dynamic link/ dynamic fontSize
    slot(name="name")
    router-link(
      v-if="showName && node.oid"
      :to="nodeEssenceLink"
      :style=`{
        minHeight: '60px',
        fontSize: nodeNameSize+'px',
        textAlign: 'center',
      }`
      ).row.full-width.items-center.content-center.justify-center.q-px-sm
      span.text-white.text-bold {{ nodeName }}
    //- SPHERES
    div(
      v-if="showSpheres && node.spheres.length > 0"
      ).row.full-width.q-pa-sm
      q-tabs(
        :value="null"
        flat no-caps dense dark
        align="center"
        indicator-color="rgb(30,30,30)"
       ).full-width
        //- :label="s.name"
        q-route-tab(
          v-for="(s,si) in node.spheres" :key="s.oid"
          :to="'/sphere/'+s.oid"
          :style=`{
            borderRadius: '10px',
            background: 'rgb(40,40,40)',
            //- overflow: 'hidden',
          }`).q-mr-sm
          span(
            :style=`{
              whiteSpace: 'nowrap',
              //- background: 'rgb(45,45,45)',
              //- borderRadius: '10px',
            }`
            ).text-white.q-pa-xs {{ s.name }}
  //- FOOTER: slot, actions
  slot(name="footer")
  node-actions(v-if="showActions && node.oid" :node="node" :isActive="isActive" :isVisible="isVisible")
</template>

<script>

import { ObjectApi } from 'src/api/object'
import { i18n } from 'src/boot/i18n'

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
    showSpheresAlways: {type: Boolean, default: false},
    showCategory: {type: Boolean, default: true},
    showItems: {type: Boolean, default: true},
    itemsStyles: { type: Array, default () { return [{}, {}] } },
    styles: {type: Object},
    borderRadius: {type: String, default: '10px'}
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
        return 'Ассоциация'
      }
      else {
        return this.$nodeItemType(this.node.vertices[0]).name + '  -  ' + this.$nodeItemType(this.node.vertices[1]).name
      }
    },
    nodeEssenceLink () {
      if (this.node.items.length === 2) {
        // return '/links/' + this.node.items[0].oid + '?joint=' + this.node.oid
        return '/node/' + this.node.oid
      }
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
      if (l < 20) return 18
      else if (l >= 20 && l < 50) return 16
      else if (l >= 50 && l < 100) return 14
      else if (l >= 100) return 12
      else return 10
    },
    nodeIsMine () {
      return this.node.author.oid === this.$store.getters.currentUser().oid
    },
    actions () {
      let res = {}
      if (this.nodeIsMine) {
        res.delete = {
          // name: i18n.t('Delete', 'Удалить'),
          name: 'Снять с публикации',
          color: 'red',
          cb: async () => {
            this.$log('nodeDelete...')
            await ObjectApi.unPublish(this.node.oid)
          }
        }
      }
      else {
        res.hide = {
          name: i18n.t('Hide', 'Скрыть'),
          color: 'white',
          cb: async () => {
            this.$log('hide...')
            await this.$rxdb.hideObjectOrSource(this.node.oid, null)
          }
        }
        res.hideAll = {
          name: i18n.t('Hide source', 'Скрыть источник'),
          color: 'white',
          cb: async () => {
            this.$log('hide source')
            if (this.node.author) await this.$rxdb.hideObjectOrSource(null, this.node.author.oid)
          }
        }
        res.report = {
          name: i18n.t('Claim', 'Пожаловаться'),
          color: 'red',
          cb: () => {
            this.$log('report...')
            let reason = prompt(i18n.t('specify the reason', 'укажите причину'))
          }
        }
      }
      return res
    }
  }
}
</script>
