<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden'
  }`
  ).column.fit.b-50
  div(:style=`{height: '70px'}`
    ).row.full-width.items-center.content-center.q-px-sm
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
    span.text-white.text-bold {{ value.name }}
  .col.full-width
    composition(
      ctx="workspace"
      :value="value")
      template(v-slot:editor=`{player, meta}`)
        div(
          :style=`{
            height: toolsHeight+'px'
          }`
          ).column.full-width
          .col.full-width.scroll
          //- footer
          div(
            :style=`{
              height: 60+'px'
            }`
            ).row.full-width.items-center.content-center.q-px-sm
            q-btn(
              round flat color="white" @click="editStart()"
              :icon="editing ? 'keyboard_arrow_up' : 'edit' ").b-70
</template>

<script>
export default {
  name: 'wsContentEditor',
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      toolsHeight: 60,
      editing: false
    }
  },
  watch: {
    editing: {
      handler (to, from) {
        this.$log('editing CHANGED', to)
        this.$tween.to(this, 0.5, {toolsHeight: to ? 500 : 60})
      }
    }
  },
  methods: {
    editStart () {
      this.$log('editStart')
      this.editing = !this.editing
      // let h = this.$el.clientHeight
      // this.$log('h', h)
      // this.$tween.to(this, 0.5, {toolsHeight: 500})
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
