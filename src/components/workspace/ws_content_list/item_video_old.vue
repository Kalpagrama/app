<style lang="sass" scoped>
.item
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '100px',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.b-60.q-mb-sm.item
  img(
    @click="$emit('pick')"
    :src="content.thumbOid"
    :style=`{
      height: '120px',
      borderRadius: '10px',
      overflow: 'hidden'
    }`)
  div(
    @click="$emit('pick')"
    ).col.full-height
    .row.fit.items-between.content-between.q-pa-sm
      span(:style=`{fontSize: $q.screen.width > 600 ? '14px' : '12px'}`).text-white.text-bold {{ contentName }}
      //- .row.full-width
      //-   small(:style=`{fontSize: $q.screen.width > 600 ? '12px' : '10px'}`).text-grey-5 {{ contentKalpaName }}
  //- actions
  .row.full-height.items-start.content-start.q-pa-xs
    q-btn(round flat dense color="grey-6" icon="more_vert")
      kalpa-menu-popup(:actions="actions")
</template>

<script>
export default {
  name: 'itemVideo',
  props: ['content', 'contentKalpa'],
  data () {
    return {
    }
  },
  computed: {
    contentName () {
      return this.content.name.slice(0, 50)
    },
    contentKalpaName () {
      return this.contentKalpa.name.slice(0, 50)
    },
    actions () {
      return {
        delete: {
          name: 'Delete',
          fn: async () => {
            this.$emit('delete')
          }
        }
      }
    }
  }
}
</script>
