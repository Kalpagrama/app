<template lang="pug">
.row.fit
  //- image
  div(v-if="item.type === 'IMAGE'").row.full-width
    img(
      :src="item.urlOriginal || item.url"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        marginBottom: '72px',
      }`
      ).full-width
  //- node
  div(
    v-if="item.type === 'NODE'"
    :style=`{
      borderRadius: '10px',
    }`
    ).column.fit.b-50
    .col.full-width
      node-mini(
        :node="item" :isActive="isActive" :isVisible="isVisible"
        :showName="false")
      router-link(
        :to="'/node/'+item.oid"
        :style=`{
          height: '50px',
          textAlign: 'center',
        }`
        ).row.full-width.items-center.content-center.justify-center.q-pa-sm
        span.text-white.text-bold.shaking {{ itemName }}
      //- img(
        :src="item.items[0].thumbUrl"
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
          objectFit: 'contain',
        }`).fit
    //- .row.full-width.items-center.content-center.justify-center.q-pa-sm
      span.text-white {{ item.name }}
  .row.full-width
    slot(name="footer")
</template>

<script>
export default {
  name: 'jointFeed_jointItem',
  props: ['joint', 'item', 'isActive', 'isVisible', 'mini'],
  data () {
    return {
    }
  },
  computed: {
    itemName () {
      if (this.item.name.length > 0) {
        if (this.mini) {
          return this.item.name.slice(0, 10) + '...'
        }
        else {
          if (this.$q.screen.width > 600) {
            if (this.item.name.length > 60) return this.item.name.slice(0, 60) + '...'
            else return this.item.name
          }
          else {
            if (this.item.name.length > 20) return this.item.name.slice(0, 20) + '...'
            else return this.item.name
          }
        }
      }
      else return ''
    }
  }
}
</script>
