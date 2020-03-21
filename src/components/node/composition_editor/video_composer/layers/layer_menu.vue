<template lang="pug">
div(
  :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`
  ).column.fit.bg-grey-7
  //- header
  div(:style=`{}`).row.full-width.q-pa-sm
    q-input(
      v-model="layerName"
      filled color="white" dark
      :autofocus="$q.screen.width > 800"
      label="Layer name" placeholder="Set layer name"
      @blur="layerNameEdited"
      @input="layerNameEdited"
      @keyup.enter="layerNameEdited, $emit('hide')"
      :style=`{borderRadius: '10px', overflow: 'hidden'}`
      ).full-width
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-sm
      .row.full-width.q-px-sm
        q-btn(flat no-caps color="white" dense align="left" @click="$emit('hide')"
          :style=`{borderRadius: '10px'}`).full-width
          q-icon(color="white" name="reply" size="20px")
          span.q-ml-sm Export layer
      .row.full-width.q-px-sm
        q-btn(flat no-caps color="white" dense align="left" @click="$emit('hide')"
          :style=`{borderRadius: '10px'}`).full-width
          q-icon(color="white" name="filter_none" size="20px")
          span.q-ml-sm Duplicate layer
      .row.full-width.q-px-sm
        q-btn(flat no-caps color="white" dense align="left" @click="$emit('layerDelete'), $emit('hide')"
          :style=`{borderRadius: '10px'}`).full-width
          q-icon(color="white" name="delete_outline" size="20px")
          span.q-ml-sm Delete layer
</template>

<script>
export default {
  name: 'layerMenu',
  props: ['layer'],
  data () {
    return {
      layerName: ''
    }
  },
  methods: {
    layerNameEdited () {
      this.$log('layerNameEdited')
      if (this.layerName.length === 0) return
      this.layer.spheres = [{name: this.layerName}]
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.layer.spheres.length > 0) {
      this.layerName = this.layer.spheres[0].name
    }
  }
}
</script>
