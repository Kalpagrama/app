<template lang="pug">
q-page(
  :style=`{
    paddingTop: 70+'px'
  }`
  ).row.full-width.justify-center.q-px-sm
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000}`
    ).b-30
    .row.full-width.items-start.content-start.b-30.q-px-sm.q-pt-sm
      slot(name="top" :collection="collection")
      //- search
      .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width
          .col
            div(
              :style=`{
                background: 'rgb(35,35,35)',
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).row.fit
              q-input(
                v-model="searchString"
                borderless dark color="green"
                autofocus
                placeholder="Поиск"
                :debounce="600"
                :input-style=`{
                  paddingLeft: '10px',
                }`
                ).full-width
                //- template(v-slot:append)
                  q-icon(v-if="searchString.length > 0" name="clear" color="grey-4" @click="searchString = '', $emit('close')").q-mr-sm
          q-btn(
            @click="$emit('close')"
            round flat color="grey-4" icon="clear")
  kalpa-loader(
    v-if="searchString.length >= 3"
    :immediate="true" :query="query" :limit="100" v-slot=`{items,next,nexting}`)
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
      div(
        v-for="(item, ii) in items" :key="ii"
        :style=`{
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`
        ).row.full-width.q-mb-sm.br
        small.text-white {{ item }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'trends_viewSearch',
  data () {
    return {
      searchString: '',
      typesSelected: [],
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
          querySearch: this.searchString,
          // objectTypeEnum: {$in: ['NODE', 'VIDEO', 'USER', 'WORD', 'SENTENCE']}
        },
        // populateObjects: true,
        limit: 100
      }
      if (this.typesSelected.length === 0) {
        res.selector.objectTypeEnum = {$in: ['NODE', 'VIDEO', 'USER', 'WORD', 'SENTENCE']}
      }
      else {
        res.selector.objectTypeEnum = {$in: this.typesQuery}
      }
      return res
    },
    types () {
      return [
        {id: 'NODE', name: 'Ядра', types: ['NODE']},
        {id: 'CONTENT', name: 'Контент', types: ['VIDEO', 'IMAGE']},
        {id: 'JOINT', name: 'Связи', types: ['JOINT']},
        {id: 'USER', name: 'Пользователи', types: ['USER']},
        {id: 'SPHERE', name: 'Сферы', types: ['WORD', 'SENTENCE']}
      ]
    },
    typesQuery () {
      return this.typesSelected.reduce((acc, val) => {
        val.types.map(t => {
          acc.push(t)
        })
        return acc
      }, [])
    }
  },
  methods: {
    typeClick (type) {
      this.$log('typeClick', type)
      if (this.typeSelected(type)) {
        this.typesSelected = this.typesSelected.filter(t => t.id !== type.id)
      }
      else {
        this.typesSelected.push(type)
      }
    },
    typeSelected (type) {
      return this.typesSelected.findIndex(t => t.id === type.id) >= 0
    }
  }
}
</script>
