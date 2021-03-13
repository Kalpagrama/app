<template lang="pug">
.row.full-width.items-start.justify-center.b-30
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`).row.full-width.items-start.q-px-md
    q-tabs(
      no-caps active-color="green" align="justify"
      stretch :breakpoint="100" inline-label
      dense
      :switch-indicator="true").full-width.text-grey-8
      q-route-tab(
        v-for="t in tabs" :key="t.id"
        @click="tabClick(t)"
        inline-label
        :to="t.id" :name="t.id" :label="t.name").q-px-sm
</template>

<script>
export default {
  name: 'navTabs',
  props: ['tabs'],
  methods: {
    tabClick (t) {
      this.$log('tabClick', t)
      this.$store.commit('ui/stateSet', ['listFeedNeedDrop', true])
    }
  },
}
</script>
