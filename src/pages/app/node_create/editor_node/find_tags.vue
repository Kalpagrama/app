<template lang="pug">
.column.fit.bg-white
  //- header with animated height
  div(:style=`{height: headerHeight+'px', borderBottom: '1px solid #eee'}`
    ).column.full-width
    //- header
    div(v-if="bodyType === 'device'" style=`height: 60px`).row.full-width.items-center.justify-end
      div(style=`height: 60px; width: 60px`).row.items-center.justify-center
        q-btn(flat round dense icon="clear" color="primary" @click="$emit('close')")
    //- body
    .col
      .row.fit.items-center.content-center
        .row.full-width
          .col.q-pl-sm
            q-input(v-model="search" filled placeholder="Найти сферы сути" @click="searchClick"
              :maxlength="50"
              :class="{'q-pr-sm': bodyType === 'device'}").fit
              template(v-slot:prepend)
                q-icon(name="search")
          div(v-if="bodyType === 'list'" style=`height: 60px; width: 60px`).row.items-center.justify-center
            q-btn(flat round icon="clear" @click="cancelClick" color="primary")
  //- tags list
  .col.scroll.bg-grey-2
    apollo-query(v-if="bodyType === 'list'" :query="query" :variables="variables" :throttle="5000" @result="handleResult")
      template(v-slot="{ result: { loading, error, data } }")
        template(v-if="data && data.feed")
          div(v-for="(t, ti) in data.feed.items" :key="ti" @click="$emit('tagAdd', t), $emit('close')"
            style=`height: 40px; borderTop: 1px solid #eee`
              ).row.full-width.items-center.q-px-sm.bg-white.hr.cursor-pointer
            span #
            span {{ t.name }}
</template>

<script>
import gql from 'graphql-tag'
export default {
  name: 'findTags',
  data () {
    return {
      mounted: false,
      search: '',
      headerHeight: this.$store.state.ui.width,
      tagsOptions: [],
      bodyType: 'device',
      query: gql`
        query feed ($filter: String!) {
          feed(type: AUTOCOMPLETE pagination: {pageSize:10}  filter: {text: $filter, types: [WORD, SENTENCE]} ){
            count
            totalCount
            nextPageToken
            items {
              oid
              type
              name
              thumbUrl(preferWidth:10 preferHeight:20)
              createdAt
              ... on FeedItem {
                id
                  description
                  weight
                  rate
                  viewed
                  author {
                    name        
                  }
              }         
            }
          }
        }
      `
    }
  },
  computed: {
    variables () {
      return {
        filter: this.search
      }
    }
  },
  methods: {
    handleResult (e) {
      this.$log('handleResult', e)
    },
    cancelClick () {
      this.$log('cancelClick')
      this.bodyType = 'device'
      var interval = setInterval(() => {
        if (this.headerHeight < this.$store.state.ui.width) this.headerHeight = this.headerHeight + 3
        else clearInterval(interval)
      }, 1)
    },
    searchClick () {
      this.$log('searchClick')
      this.bodyType = 'list'
      var interval = setInterval(() => {
        if (this.headerHeight > 70) this.headerHeight = this.headerHeight - 3
        else clearInterval(interval)
      }, 1)
    }
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(2000)
    this.mounted = true
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
