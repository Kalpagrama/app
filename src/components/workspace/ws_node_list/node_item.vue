<style lang="sass" scoped>
.node
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '50px',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.items-start.content-start.b-70.q-mb-xs.node
  .col.full-height
    div(
      @click="nodeClick()"
      ).row.fit.items-center.content-center.q-pl-md
      span(
        :style=`{
          userSelect: 'none'
        }`
        ).text-white.text-bold {{ nodeName }}
  div(:style=`{}`).row.full-height.items-center.content-center.justify-center.q-px-sm
    q-btn(round flat dense color="grey-6" icon="more_vert")
      kalpa-menu-popup(:actions="actions")
</template>

<script>
export default {
  name: 'wsNodeList-nodeItem',
  props: ['node', 'nodeIndex'],
  data () {
    return {
    }
  },
  computed: {
    nodeName () {
      return this.node.name
    },
    actions () {
      let res = {
        edit: {
          name: 'Edit',
          fn: () => {
            this.$log('Edit')
            this.$emit('edit')
          }
        },
        preview: {
          name: 'Preview',
          fn: () => {
            this.$log('Preview')
          }
        },
        share: {
          name: 'Share',
          fn: () => {
            this.$log('Share')
          }
        },
        delete: {
          name: 'Delete',
          fn: () => {
            this.$log('Delete')
            this.$emit('delete')
          }
        }
      }
      return res
    }
  },
  methods: {
    nodeClick () {
      this.$log('nodeClick')
      this.$emit('edit')
    }
  }
}
</script>
