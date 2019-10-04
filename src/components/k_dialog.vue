<template lang="pug">
q-dialog(ref="kdialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down" @hide="$emit('hide')")
  div(@click.self="$refs.kdialog.hide()").row.fit.justify-center.items-end
    div(:style=`{borderRadius: '10px 10px 0 0', overflow: 'hidden', maxHeight: 'calc(var(--vh, 1vh) * 100 - 0px)', maxWidth: '600px'}`).row.fit
      slot(name="default" @shit="shit")
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
