<template lang="pug">
q-dialog(
  ref="kdialog" :maximized="true"
  transition-show="slide-up" transition-hide="slide-down"
  @hide="$emit('hide'), dialogShowing = false" @show="$emit('show'), dialogShowing = true")
  //- wrapper
  div(@click.self="$refs.kdialog.hide()").row.fit.justify-center.items-end
    div(:style=`{borderRadius: '10px 10px 0 0', overflow: 'hidden', maxHeight: 'calc(var(--vh, 1vh) * 100 - 60px)', maxWidth: '600px'}`).row.fit.bg-white
      //- close btn
      div(
        v-if="dialogShowing" @click="$refs.kdialog.hide()"
        :style=`{position: 'absolute', height: '60px', top: '0px', opacity: 0.5}`
        ).row.full-width.items-center.justify-end.q-px-sm
        q-btn(round flat icon="clear" size="md" color="white" @click="$refs.kdialog.hide()")
      slot(name="default")
</template>

<script>
// TODO: drag and scroll control like in native app
// TODO: max height and levels of nested k-dialogs
export default {
  name: 'kDialog',
  props: ['value'],
  data () {
    return {
      showDialog: false,
      mini: false,
      dialogShowing: false
    }
  },
  watch: {
    value: {
      handler (to, from) {
        this.$log('value CHANGED', to)
        if (to) this.show()
        else this.hide()
      }
    }
  },
  methods: {
    shit (e) {
      this.$log('shit', e)
    },
    show () {
      this.$refs.kdialog.show()
    },
    hide () {
      this.$refs.kdialog.hide()
    },
    toggle () {
      this.$refs.kdialog.toggle()
    }
  },
  mounted () {
    this.$log('KDIALOG MOUNTED')
    if (this.value) this.$refs.kdialog.show()
  },
  beforeDestroy () {
    this.$log('KDIALOG DESTROYED')
  }
}
</script>

<style lang="stylus">
</style>
