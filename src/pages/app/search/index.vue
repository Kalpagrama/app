<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30.q-pt-sm.q-px-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
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
        //- header
        .row.full-width.justify-start.q-py-sm
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
              //- node, joint
              //- content
              router-link(
                v-if="['VIDEO', 'IMAGE'].includes(item.type)"
                :to="'/content/'+item.oid"
                :style=`{}`
                ).row.items-center.content-center.q-pa-sm
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
                v-else-if="item.type === 'WORD'"
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

export default {
  name: 'pageApp_search',
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
          querySearch: this.searchString,
          objectTypeEnum: {$in: ['NODE', 'VIDEO', 'USER', 'WORD', 'SPHERE']}
        },
        populateObjects: true,
        limit: 100
      }
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
