<template lang="pug">
q-dialog(ref="kdialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down" @hide="$emit('hide')")
  //- maxHeight: 'calc(var(--vh, 1vh) * 100)',
  div(@click.self="$refs.kdialog.hide()").row.fit.justify-center.items-end
    div(:style=`{borderRadius: '10px 10px 0 0', overflow: 'hidden', maxHeight: 'calc(var(--vh, 1vh) * 100 - 60px)', maxWidth: '600px'}`).row.fit
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
      mini: false
    }
  },
  watch: {
    value: {
      handler (to, from) {
        if (to) this.show()
        else this.hide()
      }
    }
  },
  methods: {
    scroll (e) {
      this.$log('scroll', e)
      this.$q.notify('scroll')
    },
    show () {
      this.$refs.kdialog.show()
      // this.$root.$emit('kdialog_toggle', true)
      // this.showDialog = true
      // this.$refs.kdialog.show()
    },
    hide () {
      this.$refs.kdialog.hide()
      // this.$refs.kdialog.hide()
      // this.showDialog = false
      // this.$root.$emit('kdialog_toggle', false)
    },
    toggle () {
      this.$refs.kdialog.toggle()
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

<style lang="stylus">
.no-pointer-events
  // background: red
  // pointer-events: auto !important
</style>
