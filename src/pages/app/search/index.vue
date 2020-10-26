<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30.q-pt-sm.q-px-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        //- header
        div(
          :style=`{
            height: '60px', borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.justify-between.q-pa-sm.b-40
          q-icon(name="search" color="white" size="30px").q-mx-sm
          .col
            span(
              :style=`{fontSize: '18px', userSelect: 'none'}`
              ).text-bold.text-white {{$t('pageApp_search_title', 'Поиск')}}
        //- search
        .row.full-width.justify-start.q-pt-sm
          div(:style=`{maxWidth: '700px',}`).row.full-width
            .col
              div(
                :style=`{
                  background: 'rgb(35,35,35)',
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).row.fit
                q-input(
                  v-model="searchString"
                  borderless dense dark color="green"
                  placeholder="Поиск"
                  :debounce="600"
                  :input-style=`{
                    paddingLeft: '10px',
                  }`
                  ).full-width
                  template(v-slot:append)
                    q-icon(v-if="searchString.length > 0" name="clear" color="grey-4" @click="searchString = ''").q-mr-sm
            q-btn(
              round flat color="grey-4" icon="tune")
        //- types
        .row.full-width.q-py-xs
          q-btn(
            @click="typeClick(type)"
            v-for="(type,ii) in types" :key="type.id"
            flat no-caps dense
            :color="typeSelected(type) ? 'green' : 'grey-7'"
            :class=`{
              'b-40': typeSelected(type)
            }`
            :style=`{}`).q-mr-xs.q-mb-xs.q-px-xs {{ type.name }}
  q-page-container
    q-page.row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        kalpa-loader(
          v-if="searchString.length >= 3"
          :immediate="true" :query="query" :limit="100" v-slot=`{items,next}`)
          .row.full-width.items-start.content-start
            div(
              v-for="(item,ii) in items" :key="ii"
              :style=`{
                borderRadius: '10px',
              }`
              ).row.full-width.q-mb-sm.b-40
              //- node
              router-link(
                v-if="item.type === 'NODE'"
                :to="'/node/'+item.oid"
                :style=`{}`
                ).row.full-width.items-center.content-center
                img(
                  draggable="false"
                  :src="item.thumbUrl"
                  :style=`{height: '100px', borderRadius: '10px',}`)
                .col.q-px-sm
                  span.text-white {{ item.name }}
              //- joint
              router-link(
                v-else-if="item.type === 'JOINT'"
                :to="'/joint/'+item.oid"
                :style=`{}`
                ).row.full-width.items-center.content-center
                img(
                  draggable="false"
                  :src="item.thumbUrl"
                  :style=`{height: '100px', borderRadius: '10px',}`)
                .col.q-px-sm
                  span.text-white {{ item.name }}
              //- content
              router-link(
                v-else-if="['VIDEO', 'IMAGE'].includes(item.type)"
                :to="'/content/'+item.oid"
                :style=`{}`
                ).row.full-width.items-center.content-center.q-pa-sm
                img(
                  draggable="false"
                  :src="item.thumbUrl"
                  :style=`{height: '50px', borderRadius: '10px',}`
                  )
                .col.q-px-sm
                  span.text-white {{ item.name.slice(0, 50) }}
              //- user
              router-link(
                v-else-if="item.type === 'USER'"
                :to="'/user/'+item.oid"
                ).row.full-width.q-pa-sm
                img(
                  draggable="false"
                  :src="item.thumbUrl"
                  :style=`{height: '40px', borderRadius: '50%',}`)
                .col.q-px-sm
                  span.text-white {{ item.name }}
              //- content
              router-link(
                v-else-if="['VIDEO', 'IMAGE'].includes(item.type)"
                :to="'/content/'+item.oid"
                ).row.full-width.items-center.content-center.q-pa-sm
                img(
                  draggable="false"
                  :src="item.thumbUrl"
                  :style=`{height: '100px', borderRadius: '10px',}`)
                .col.q-px-sm
                  span.text-white {{ item.name }}
              //- sphere
              router-link(
                v-else-if="['WORD', 'SENTENCE'].includes(item.type)"
                :to="'/sphere/'+item.oid"
                ).row.full-width.items-center.content-center.q-pa-sm
                q-icon(name="blur_on" color="white" size="30px")
                span.text-white.q-mx-sm {{ item.name }}
              //- item fallback
              div(
                v-else
                ).row.bg-blue
                small.text-white {{ item }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

// TODO: save last searchString in $router.query object...
// so we can return to it, and refresh the page...

export default {
  name: 'pageApp_search',
  data () {
    return {
      searchString: '',
      typesSelected: []
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
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
