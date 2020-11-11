<template lang="pug">
q-page(
  :style=`{
    paddingTop: '4px',
  }`)
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000}`).b-30
    //- types
    //- .row.full-width.q-px-sm
      .row.full-width.items-start.content-start.scroll.q-pt-xs
        .row.items-center.content-center.no-wrap
          q-btn(
            @click="type = t"
            v-for="(t,ii) in types" :key="t.id"
            flat no-caps dense
            :color="(type && type.id === t.id) ? 'green' : 'grey-7'"
            :class=`{
              'b-40': type && type.id === t.id
            }`
            :style=`{}`).q-mr-xs.q-px-xs {{ t.name }}
  kalpa-loader(
    v-if="query"
    :immediate="true"
    :query="query" :limit="1000" v-slot=`{items,next,nexting}`)
    .row.full-width.items-start.content-start.q-pa-sm
      item(
        v-for="(item,ii) in items" :key="ii"
        @click.native="$emit('item', item)"
        :item="item"
        :style=`{
        }`
        ).q-mb-sm
        template(v-slot:tint=`{item}`)
          slot(name="tint" :item="item")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'kalpaFinder_pageWorkspace',
  props: ['searchString', 'kalpaTypes'],
  components: {
    item: () => import('./item.vue')
  },
  data () {
    return {
      type: null
    }
  },
  computed: {
    // types () {
    //   return [
    //     {id: 'VIDEO', name: 'Видео', selector: {types: ['VIDEO']}},
    //     {id: 'IMAGE', name: 'Картинки', selector: {types: ['IMAGE']}},
    //     {id: 'NODE', name: 'Ядра', selector: {types: ['NODE']}},
    //     {id: 'JOINT', name: 'Связи', selector: {types: ['JOINT']}},
    //     {id: 'USER', name: 'Люди', selector: {types: ['USER']}},
    //     {id: 'SPHERE', name: 'Сферы', selector: {types: ['WORD', 'SENTENCE']}}
    //   ].filter(t => {
    //     if (this.kalpaTypes) return this.kalpaTypes.includes(t.id)
    //     else return t
    //   })
    // },
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.$store.getters.currentUser().oid,
          oidAuthor: {$eq: this.$store.getters.currentUser().oid},
          sortStrategy: 'AGE',
          // querySearch: this.searchString,
        },
        populateObjects: true,
      }
    },
    // query () {
    //   let res = {
    //     selector: {
    //       rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
    //       querySearch: this.searchString,
    //     },
    //     // populateObjects: true,
    //     limit: 100
    //   }
    //   if (this.type) {
    //     res.selector.objectTypeEnum = {$in: this.type.selector.types}
    //   }
    //   else {
    //     res.selector.objectTypeEnum = {
    //       $in: this.types.reduce((acc, val) => {
    //         val.selector.types.map(type => {
    //           acc.push(type)
    //         })
    //         return acc
    //       }, [])
    //     }
    //   }
    //   // else {}
    //   return res
    // },
  },
  methods: {
  },
  created () {
    this.$log('created')
    // this.type = this.types[0]
  }
}
</script>
