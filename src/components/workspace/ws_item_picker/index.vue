<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px 10px 0 0',
    overflow: 'hidden',
  }`
  ).column.full-width.b-30
  //- header: navigation
  .row.full-width.items-center.content-center.q-pa-xs
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
    span.text-white.text-bold {{ title }}
  //- body
  .col.full-width
    q-tab-panels(
      v-model="tab"
      swipeable infinite animated
      :style=`{background: 'none'}`
      ).fit
      q-tab-panel(
        v-for="t in tabsFiltered" :key="t.id"
        :name="t.id"
        :style=`{padding: 0, margin: 0, background: 'none'}`
        ).fit
        component(
          :is="t.component"
          mode="picker"
          :options="options[t.id]"
          @chain="$emit('item', {type: 'chain', item: $event})"
          @node="$emit('item', {type: 'node', item: $event})"
          @composition="$emit('item', {type: 'composition', item: $event})"
          @content="$emit('item', {type: 'content', item: $event})"
          @sphere="$emit('item', {type: 'sphere', item: $event})"
          @close="$emit('close')")
  //- footer: tabsFiltered if more than 1
  div(
    v-if="tabsFiltered.length > 1"
    ).row.full-width.items-end.content-end.justify-center
    q-tabs(
      v-model="tab" dense active-color="green"
      align="center" no-caps
      ).text-white
      q-tab(
        v-for="(t,ti) in tabsFiltered" :key="t.id"
        :name="t.id" :label="t.name"
        :style=`{}`)
</template>

<script>
export default {
  name: 'wsItemPicker',
  props: {
    title: {type: String, default () { return 'Item picker' }},
    description: {type: String},
    options: {
      type: Object,
      default () {
        return {
          node: {typesAll: true, types: []},
          composition: {typesAll: true, types: []},
          content: {typesAll: true, types: [], needComposition: false},
          chain: {typesAll: true, types: []},
          sphere: {typesAll: true, types: []},
        }
      }
    }
  },
  data () {
    return {
      tab: null
    }
  },
  computed: {
    tabs () {
      return [
        {id: 'sphere', name: this.$t('wsItemPicker_sphereList', 'Сферы'), component: 'ws-sphere-list'},
        {id: 'content', name: this.$t('wsItemPicker_contentList', 'Контент'), component: 'ws-content-list'},
        {id: 'composition', name: this.$t('wsItemPicker_compositionList', 'Образы'), component: 'ws-composition-list'},
        {id: 'node', name: this.$t('wsItemPicker_nodeList', 'Ядра'), component: 'ws-node-list'},
        {id: 'chain', name: this.$t('wsItemPicker_chainList', 'Цепочки'), component: 'ws-chain-list'},
      ]
    },
    tabsFiltered () {
      return this.tabs.filter(tab => this.options[tab.id])
    }
  },
  watch: {
    // set first tab from tabsFiltered
    tabsFiltered: {
      immediate: true,
      handler (to, from) {
        if (to && to.length > 0) this.tab = to[0].id
      }
    }
  },
}
</script>
