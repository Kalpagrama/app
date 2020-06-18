<style lang="sass" scoped>
.node
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(:style=`{borderRadius: '10px', overflow: 'hidden',}`).row.full-width.items-end.b-60
  div(v-if="node.stage === 'saved'").row.full-width
    img(
      :src="node.thumbOid"
      :style=`{
        objectFit: 'cover',
        borderRadius: '10px',
        overflow: 'hidden',
        maxHeight: '100px',
        maxWidth: '100px',
      }`
      )
  div(
    v-else
    :style=`{
      position: 'relative',
      minHeight: '50px',
      borderRadius: '10px',
      overflow: 'hidden',
    }`
    ).row.full-width.items-start.content-start.b-70.node
    div(
      @click="nodeClick()"
      v-if="node.items.length > 0"
      :style=`{
        borderRadius: '10px',
        overflow: 'hidden',
      }`
      ).row.full-width
      div(
        v-for="(i,ii) in node.items" :key="ii"
        :style=`{height: 150+'px'}`
        ).col.bg-black
        img(
          :src="i.thumbOid"
          :style=`{objectFit: 'contain'}`
          ).fit.cursor-pointer
    div(
      v-if="true"
      :style=`{height: '50px'}`).row.full-width
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
