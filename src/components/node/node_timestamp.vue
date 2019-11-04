<template lang="pug">
div(:style=`{height: '30px', paddingLeft: '20px'}`).row.full-width.items-start.justify-between.q-pr-xs
  small.text-grey-6 {{getTime}}
</template>

<script>
export default {
  name: 'nodeTimestamp',
  props: ['node'],
  computed: {
    getTime () {
      let now = Date.now()
      let from = this.node.createdAt
      // TODO: live ago shit? only when the node is active?
      // if (now - from < 1000 * 60 * 60) return 'minutes'
      // else return this.$date(from)
      return this.$date(from)
    }
  }
}
</script>
