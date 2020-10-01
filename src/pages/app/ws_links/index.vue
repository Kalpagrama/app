<style lang="stylus" scoped>
.link-item
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
    kalpa-loader(
      :immediate="true"
      :query="query" :limit="1000"
      v-slot=`{items,next}`)
      //- .row.full-width.items-start.contents-start
      masonry(
        :cols="3"
        :gutter="{default: 6}").full-width.q-pr-sm
        div(
          @click="$router.push('/workspace/link/'+l.id)"
          v-for="(l,li) in items" :key="l.id"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.full-width.q-mb-md.q-pa-sm.b-40.cursor-pointer.link-item
          //- items wrapper
          .row.full-width
            .col-6.br
              div(v-if="l.items[0]").row.full-width
                small.text-white {{l.items[0].name}}
            .col-6.br
              div(v-if="l.items[1]").row.full-width
                small.text-white {{l.items[1].name}}
          .row.full-width.justify-center.q-pa-sm
            small.text-white {{ l.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsLinks',
  data () {
    return {
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_JOINT,
        },
        sort: [{updatedAt: 'desc'}]
      }
      // add name filter
      // if (this.searchString.length > 0) {
      //   let nameRegExp = new RegExp(this.searchString, 'i')
      //   res.selector.name = {$regex: nameRegExp}
      // }
      return res
    }
  }
}
</script>
