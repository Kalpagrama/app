<template lang="pug">
.row.full-width
  //- .row.full-width.text-white
    span text
    span h
    span p
    span node
    span user
    span sphere
    span joint
    span image
    span video
    span tweet
    span group
  node-finder(v-if="viewId === 'element'")
  div(
    v-if="viewId === null"
    ).row.full-width
    q-btn(
      v-close-popup
      @click="$emit('node', {type: 'h', items: [], links: [], class: '', styles: {}, item: {text: ''}})"
      flat no-caps
      :style=`{
        height: '80px',
      }`).col-6 Title
    q-btn(
      v-close-popup
      @click="$emit('node', {type: 'p', items: [], links: [], class: '', styles: {}, item: {text: ''}})"
      flat no-caps
      :style=`{
        height: '80px',
      }`).col-6 Paragraph
    q-btn(
      @click="viewId = 'element'"
      flat no-caps
      :style=`{
        height: '80px',
      }`
      ).full-width Element
</template>

<script>
export default {
  name: 'nodeAdder',
  components: {
    nodeFinder: () => import('./node_finder.vue'),
  },
  data () {
    return {
      viewId: null,
    }
  }
}
</script>
