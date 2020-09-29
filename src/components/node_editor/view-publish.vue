<template lang="pug">
.row.full-width.items-start.content-start.q-pt-md.q-px-sm
  .row.full-width.q-px-sm
    edit-description(:value="name")
  .row.full-width.q-px-sm.q-py-md
    q-btn(
      color="green" size="xl" no-caps
      align="left"
      :style=`{maxWidth: '240px'}`
      ).full-width
      span.text-white.text-bold Publish it
</template>

<script>
export default {
  name: 'viewPublish',
  components: {
    editDescription: () => import('./edit-description.vue')
  },
  data () {
    return {
      name: ''
    }
  }
}
</script>
