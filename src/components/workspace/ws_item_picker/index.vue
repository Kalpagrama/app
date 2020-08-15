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
          :is="t.component" mode="picker"
          :types="types[t.id].types"
          @node="$emit('item', {type: 'node', item: $event})"
          @composition="$emit('item', {type: 'composition', item: $event})"
          @content="$emit('item', {type: 'content', item: $event})")
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
        :style=`{}`
        )
</template>

<script>
export default {
  name: 'wsItemPicker',
  props: {
    title: {type: String, default () { return 'Item picker' }},
    types: {type: Object, default () { return {node: true, content: true, composition: true} }}
  },
  data () {
    return {
      tab: null,
      tabs: [
        {id: 'node', name: 'Nodes', component: 'ws-node-list'},
        {id: 'composition', name: 'Clips', component: 'ws-composition-list'},
        {id: 'content', name: 'Content', component: 'ws-content-list'},
      ]
    }
  },
  computed: {
    tabsFiltered () {
      return this.tabs.filter(tab => this.types[tab.id])
    }
  },
  watch: {
    tabsFiltered: {
      immediate: true,
      handler (to, from) {
        if (to && to.length > 0) this.tab = to[0].id
      }
    }
  },
  methods: {
  }
}
</script>
