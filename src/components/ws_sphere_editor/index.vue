<style lang="sass">
.q-field--outlined .q-field__control
  border-radius: 10px
</style>

<template lang="pug">
.row.full-width
  //- q-dialog(
    v-model="sphereDialogShow"
    position="bottom")
    .column.full-width
  .row.full-width.q-pb-sm.q-px-xs
    div(
      v-for="(sphere, si) in item.spheres"  :key="sphere"
      :style=`{}`).row.full-width.q-mb-xs
      q-btn(
        round flat dense icon="drag_indicator" color="grey-9")
      .col.q-px-xs
        q-input(
          v-model="sphere.name"
          :outlined="sphereFocused === si"
          :borderless="sphereFocused !== si"
          dense dark color="green"
          autofocus
          @focus="sphereFocused = si"
          @blur="sphereFocused = null"
          :input-style=`{
            textAlign: 'center'
          }`
          :style=`{
            borderRadius: '10px',
          }`
          ).full-width.b-40
          //- template(v-slot:prepend)
            q-icon(name="blur_on" color="grey-9")
      q-btn(
        @click="sphereDelete(si)"
        round flat dense icon="delete_outline" color="grey-9")
      //- ws-sphere-item(:id="sphere").b-60
        template(v-slot:append)
          q-icon(
            @click="sphereDelete(sphere)"
            name="clear" color="white" size="14px").q-mr-sm.cursor-pointer
  //- ADD
  div(
    v-if="item.spheres.length < 3"
    :style=`{paddingLeft: '42px', paddingRight: '42px',}`).row.full-width.q-pb-sm
    q-btn(
      @click="sphereAddStart"
      flat color="green" no-caps
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
      sphereDialogShow: false,
      sphereFocused: null,
    }
  },
  methods: {
    sphereDelete (sphereIndex) {
      this.$delete(this.item.spheres, sphereIndex)
    },
    sphereAddStart () {
      this.$log('sphereAddStart')
      this.item.spheres.push({name: ''})
    }
  }
}
</script>
