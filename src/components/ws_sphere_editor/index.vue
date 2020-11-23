<template lang="pug">
.row.full-width.q-py-sm
  .row.full-width
    div(
      v-for="(sphere,si) in spheres"  :key="sphere"
      :style=`{}`).row.items-center.content-center.q-mr-xs.q-mb-xs
      ws-sphere-item(:id="sphere").b-60
        template(v-slot:append)
          q-icon(
            @click="sphereDelete(sphere)"
            name="clear" color="white" size="14px").q-mr-sm.cursor-pointer
  q-btn(
    flat color="green" no-caps icon="add"
    ).full-width.b-40 Добавить сферу
</template>

<script>
export default {
  name: 'wsSphereEditor',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
    }
  }
}
</script>
