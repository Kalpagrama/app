<template lang="pug">
div(
  :style=`{
    borderRadius: '10px',
    background: 'rgb(35,35,35)',
  }`
  ).column.fit.justify-end
  node-mini(
    v-if="isOpened"
    :node="node" :isActive="isOpened" :isVisible="true")
    template(v-if="!isOpened" v-slot:name)
      div(:style=`{height: '60px', textAlign: 'center'}`).row.full-width.items-center.content-center.justify-center.q-pa-sm
        q-icon(name="filter_tilt_shift" color="white" size="24px")
  div(
    v-if="!isOpened"
    ).col.full-width
    img(
      :src="node.thumbUrl"
      :style=`{
        borderRadius: '10px',
        objectFit: 'cover',
      }`).fit
  div(
    v-if="!isOpened"
    :style=`{height: '60px', textAlign: 'center'}`).row.full-width.items-center.content-center.justify-center
    q-icon(name="filter_tilt_shift" color="white" size="24px")
</template>

<script>
export default {
  name: 'fromNode',
  props: ['node', 'isOpened'],
  data () {
    return {
    }
  }
}
</script>
