<template lang="pug">
div(
  :style=`{
    borderRadius: '10px',
  }`
  ).row.full-width.b-40
  node-mini(:node="node" :isActive="isOpened" :isVisible="true")
    template(v-if="!isOpened" v-slot:name)
      div(:style=`{height: '60px', textAlign: 'center'}`).row.full-width.items-center.content-center.justify-center.q-pa-sm
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
