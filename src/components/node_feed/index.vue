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
  slot(name="wrapper")
  //- wrapper
  div(
    :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: borderRadius,
      ...styles,
    }`).row.full-width.items-start.content-start
    slot(name="wrapper-inside")
    //- HEADER: author, createdAt, actions, date, views
    div(
      v-if="showHeader && node.oid"
      :style=`{
        order: orderHeader,
      }`
      ).row.full-width.items-center.content-center.q-pa-xs
      q-btn(
        v-if="showAuthorAlways || node.rateUser !== null"
        :to="'/user/'+node.author.oid"
        round flat color="white" no-caps
        :style=`{
          paddingLeft: '0px',
        }`).row.q-px-sm
        user-avatar(:url="node.author.thumbUrl" :width="24" :height="24").q-ml-sm
        .col
          .row.items-center.content-center.q-px-sm
            span.text-grey-4 {{ node.author.name }}
            .row.full-width
              //- small(:style=`{lineHeight: 0.8}`).text-grey-8 {{ node.author.username }}
      div(
        v-else
        :style=`{
          height: '40px',
        }`
        ).row.items-center.content-center.q-pa-sm
        div(:style=`{width: '24px',minWidth: '24px',height: '24px',minHeight: '24px',borderRadius: '50%',}`).b-50.q-mr-sm
        .col
          div(:style=`{width: '80px', minWidth: '80px', height: '14px', borderRadius: '10px'}`).b-40
      .col
      .row.items-center.content-center.justify-end.q-pt-sm
        small.text-grey-8 {{ $date(node.createdAt, 'DD.MM.YYYY') }}
        .row.full-width.items-center.content-center.justify-end
          small(:style=`{lineHeight: 0.8}`).text-grey-8.q-mr-xs {{ node.countStat.countViews }}
          q-icon(name="visibility" color="grey-9")
      kalpa-menu-actions(
        :title="node.name"
        :actions="actions" icon="more_vert")
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
        order: orderName,
        minHeight: '60px',
        fontSize: fontSize+'px',
        textAlign: 'center',
      }`
      ).row.full-width.items-center.content-center.justify-center.q-pa-md
      span(
        :class=`{
          'text-bold': node.name.length < 20
        }`
        ).text-white {{ nodeName }}
    //- SPHERES
    node-spheres(
      v-if="showSpheres && node.spheres.length > 0"
      :node="node"
      :style=`{
        order: orderSpheres,
      }`)
    //- div(
      v-if="showSpheres && node.spheres.length > 0"
      :style=`{
        order: orderSpheres,
      }`
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
            padding: 0,
          }`).q-mr-sm
          span(
            :style=`{
              whiteSpace: 'nowrap',
            }`
            ).text-grey-4.q-mx-sm {{ s.name }}
  //- FOOTER: actions, slot
  node-actions(
    v-if="showActions && node.oid"
    :node="node"
    :nodeBackgroundColor="nodeBackgroundColor"
    :nodeActionsColor="nodeActionsColor"
    :isActive="isActive"
    :isVisible="isVisible"
    :style=`{
      order: orderActions,
    }`)
  slot(name="footer")
</template>

<script>

import { ObjectApi } from 'src/api/object'
import { i18n } from 'src/boot/i18n'

import nodeItem from './node_item.vue'
import nodeItems from './node_items.vue'
import nodeActions from 'components/node/node_actions/index.vue'
import nodeSpheres from 'components/node/node_spheres/index.vue'

export default {
  name: 'nodeFeed',
  components: {
    nodeItem,
    nodeItems,
    nodeActions,
    nodeSpheres,
  },
  props: {
    node: {type: Object},
    nodeBackgroundColor: {type: String, default: 'rgb(30,30,30)'},
    nodeActionsColor: {type: String, default: 'rgb(200,200,200)'},
    isActive: {type: Boolean},
    isVisible: {type: Boolean},
    showHeader: {type: Boolean, default: true},
    showName: {type: Boolean, default: true},
    showAuthorAlways: {type: Boolean, default: false},
    showActions: {type: Boolean, default: true},
    showSpheres: {type: Boolean, default: true},
    showSpheresAlways: {type: Boolean, default: false},
    showCategory: {type: Boolean, default: true},
    showItems: {type: Boolean, default: true},
    orderHeader: {type: Number, default: -1},
    orderName: {type: Number, default: 1},
    orderSpheres: {type: Number, default: 2},
    orderActions: {type: Number, default: 3},
    itemsStyles: { type: Array, default () { return [{}, {}] } },
    styles: {type: Object},
    borderRadius: {type: String, default: '10px'},
    actionsColor: {type: String, default: 'grey-9'}
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
        return `/graph/${this.node.items[0].oid}?oid=${this.node.oid}`
      }
      else {
        // return '/node/' + this.node.oid
        return '/sphere-full/' + this.node.sphereFromName.oid
      }
    },
    category () {
      if (!this.node) return null
      return this.$store.state.ui.nodeCategories.find(c => c.type === this.node.category)
    },
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    },
    nodeIsMine () {
      return this.node.author.oid === this.$store.getters.currentUser().oid
    },
    actions () {
      let res = {
        copyLink: {
          name: 'Скопировать ссылку',
          cb: async () => {
            this.$log('copyLink')
            // TODO: handle copy link...
          }
        }
      }
      if (this.$store.getters.currentUser().profile.role === 'GUEST') {
        return res
      }
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
        // res.hideAll = {
        //   name: i18n.t('Hide source', 'Скрыть источник'),
        //   color: 'white',
        //   cb: async () => {
        //     this.$log('hide source')
        //     if (this.node.author) await this.$rxdb.hideObjectOrSource(null, this.node.author.oid)
        //   }
        // }
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
  },
  mounted () {
    // this.$log('mounted', this.node.name)
  }
}
</script>
