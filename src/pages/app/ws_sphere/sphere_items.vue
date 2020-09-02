<style lang="sass" scoped>
.sphere-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
q-page(
  :style=`{paddingTop: '20px', paddingBottom: '400px'}`
  ).row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
      masonry(
        :cols="$q.screen.width < 800 ? Math.round($q.screen.width/200) : 4"
        :gutter="{default: 10}")
        div(
          v-for="(i,ii) in sphere.items" :key="i.id || i.oid"
          @click="itemSelected = i.oid"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.full-width.b-40.q-mb-sm
          //- default header preview
          div(
            :style=`{
              position: 'relative', zIndex: 100, transform: 'translate3d(0,0,0)',
              borderRadius: '10px',
            }`
            ).row.full-width.items-start.content-start.b-40.sphere-item
            img(
              :src="i.thumbOid" draggable="false"
              :style=`{borderRadius: '10px', overflow: 'hidden'}`
              ).full-width
            .row.full-width.q-pa-sm
              //- small.text-white {{ i.type }}
              q-icon(:name="itemIcon(i.type)" color="grey-4" size="16px").q-mr-sm
              small.text-white {{ i.name }}
          //- selected
          div(
            v-if="itemSelected === i.oid"
            :style=`{
              position: 'relative', zIndex: 90,
              marginTop: '-10px', paddingTop: '10px',
            }`
            ).row.full-width.items-center.content-center.bg-green
            q-btn(round flat dense color="green-8" icon="delete_outline" @click="itemDelete(i,ii)")
            .col
            q-btn(round flat dense color="white" icon="launch" @click="itemLaunch(i,ii)")
</template>

<script>
export default {
  name: 'pageApp_wsSphere_items',
  props: ['sphere'],
  data () {
    return {
      itemSelected: null,
    }
  },
  methods: {
    itemLaunch (item) {
      this.$log('itemLaunch', item)
      if (item.type === 'NODE') {
        this.$router.push(`/node/${item.oid}`).catch(e => e)
      }
      else {
        this.$q.notify({type: 'negative', message: 'Not supported :('})
      }
    },
    itemDelete (item, itemIndex) {
      this.$log('itemDelete', item, itemIndex)
      if (!confirm('Delete item?')) return
      this.$delete(this.sphere.items, itemIndex)
    },
    itemIcon (type) {
      let types = {
        NODE: 'filter_tilt_shift',
      }
      return types[type] ? types[type] : 'blur_on'
    }
  }
}
</script>
