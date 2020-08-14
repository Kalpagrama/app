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
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
    span.text-white.text-bold {{ title }}
  //- body
  .col.full-width
    q-tab-panels(
      v-model="tab"
      swipeable infinite animated
      :style=`{background: 'none'}`
      ).fit
      q-tab-panel(
        v-for="t in tabs" :key="t.id"
        :name="t.id"
        :style=`{padding: 0, margin: 0, background: 'none'}`
        ).fit
        component(
          :is="t.component" mode="picker"
          @node="$emit('item', {type: 'node', item: $event})"
          @composition="$emit('item', {type: 'composition', item: $event})"
          @content="$emit('item', {type: 'content', item: $event})")
  //- footer
  .row.full-width.items-end.content-end.justify-center
    q-tabs(
      v-model="tab" dense active-color="green"
      align="center" no-caps
      ).text-white
      q-tab(
        v-for="(t,ti) in tabs" :key="t.id"
        :name="t.id" :label="t.name"
        :style=`{}`
        )
</template>

<script>
export default {
  name: 'wsItemPicker',
  props: {
    title: {type: String, default () { return 'Item picker' }}
  },
  data () {
    return {
      tab: 'nodes',
      tabs: [
        {id: 'nodes', name: 'Nodes', component: 'ws-node-list'},
        {id: 'compositions', name: 'Clips', component: 'ws-composition-list'},
        {id: 'content', name: 'Content', component: 'ws-content-list'},
      ]
    }
  },
  methods: {
  }
}
</script>
