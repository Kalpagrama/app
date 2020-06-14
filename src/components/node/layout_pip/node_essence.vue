<style lang="sass" scoped>
.essence
  cursor: pointer
  &:hover
    // background: rgb(100,100,100) !important
</style>

<template lang="pug">
div(
  :style=`{
    height: '60px'
  }`
  ).row.full-width
  .col
    .row.fit.items-center.content-center.q-py-sm.q-pl-md.cursor-pointer
      router-link(
        :to="'/node/'+node.oid"
        ).row.full-width.items-start.content-start.essence
        span(:style=`{userSelect: 'none'}`).text-white.text-bold {{ node.name }}
  //- div(:style=`{}`).row.full-height.items-center.content-center.justify-center.q-px-sm
  //-   q-btn(round flat color="grey-6" icon="more_vert")
  //-     kalpa-menu-popup(:actions="actions")
</template>

<script>
// :class=`{
//   'b-50': !visible && !active,
//   'b-70': visible && !active,
//   'b-90': visible && active
// }`
export default {
  name: 'nodeLayoutPip-nodeEssence',
  props: ['node', 'nodeFull', 'visible', 'active', 'mini'],
  data () {
    return {
    }
  },
  computed: {
    nodeIsMine () {
      if (this.nodeFull) {
        return this.nodeFull.author.oid === this.$store.getters.currentUser().oid
      }
      else {
        return true
      }
    },
    actions () {
      let res = {
        explore: {
          name: 'Explore node',
          fn: () => {
            this.$log('Explore')
            this.$router.push(`/node/${this.node.oid}`).catch(e => e)
          }
        },
        share: {
          name: 'Share node',
          fn: () => {
            this.$log('Share node')
          }
        },
        subscribe: {
          name: 'Subscribe',
          fn: () => {
            this.$log('Subscribe')
            // TODO: subscribe to node.sphere?
          }
        },
        save: {
          name: 'Save to Workspace',
          fn: () => {
            this.$log('Save to Workspace')
            // TODO: save node to WS
            // need normalization, layer.id, content.id, ?
            // this.$router.push('/workspace/share')
          }
        },
        report: {
          name: 'Report',
          fn: () => {
            this.$log('Report')
            // TODO: report on the whole node
          }
        }
      }
      if (this.nodeIsMine) {
        res.delete = {
          name: 'Delete',
          fn: () => {
            this.$log('Delete')
          }
        }
      }
      return res
    }
  },
  methods: {
  }
}
</script>
