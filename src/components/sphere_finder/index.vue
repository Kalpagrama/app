<template lang="pug">
.column.fit.bg-white
  //- header
  div(style=`height: 70px; borderBottom: 1px solid #eee`).row.full-width.items-center.justify-end
    .col.q-pl-sm
      q-input(v-model="search" filled :placeholder="$t('spheres_find')"
        @keyup.esc="cancelClick"
        :maxlength="30" autofocus).fit
        template(v-slot:prepend)
          q-icon(name="search")
    div(style=`height: 60px; width: 60px`).row.items-center.justify-center
      q-btn(flat round dense icon="clear" color="primary" @click="$emit('close')")
  //- shperes list
  .col.scroll.bg-grey-2
    apollo-query(v-if="search.length > 1" :query="query" :variables="variables" :throttle="500" @result="handleResult")
      template(v-slot="{ result: { loading, error, data } }")
        //- loading
        div(v-if="loading" style=`height: 100px`).row.full-width.items-center.justify-center
            q-spinner(size="50px" color="primary" :thickness="2")
        //- error
        div(v-else-if="error" style=`height: 100px`).row.full-width.items-center.justify-center
          span {{ error }} : (
        //- data
        template(v-else-if="data")
          div(v-if="data.feed.items && data.feed.items.length > 0").row.full-width.items-start.content-start
            div(v-for="(s, si) in data.feed.items" :key="si" @click="sphereClick(s)"
              style=`height: 40px; borderTop: 1px solid #eee`
                ).row.full-width.items-center.q-px-sm.bg-white.hr.cursor-pointer
              span #
              span {{ s.name }}
          div(v-else style=`height: 70px`).row.full-width.items-center.justify-center
            q-btn(no-caps style=`height: 40px; borderRadius: 8px` color="primary" @click="sphereClick({name: search})") Create: {{search}}
        //- nothing
        div(v-else style=`height: 100px;`).row.full-width.items-center.justify-center
          q-spinner(size="50px" :thickness="2" color="primary")
</template>

<script>
import gql from 'graphql-tag'
export default {
  name: 'sphereFinder',
  data () {
    return {
      mounted: false,
      search: '',
      headerHeight: this.$store.state.ui.width,
      tagsOptions: [],
      bodyType: 'device',
      query: gql`
        query feed ($search: String!) {
          feed(type: AUTOCOMPLETE, pagination: {pageSize: 50}, filter: {text: $search, types: [WORD, SENTENCE]} ){
            count
            totalCount
            nextPageToken
            items {
              oid
              type
              name       
            }
          }
        }
      `
    }
  },
  computed: {
    variables () {
      return {
        search: this.search
      }
    }
  },
  // watch: {
  //   search: {
  //     handler (to, from) {
  //       if (to.length === 0) {
  //         this.bodyType = 'device'
  //         this.$tween.to('.kheader', 0.5, {height: this.$store.state.ui.width + 'px'})
  //       } else {
  //         this.bodyType = 'list'
  //         this.$tween.to('.kheader', 0.5, {height: '70px'})
  //       }
  //     }
  //   }
  // },
  methods: {
    sphereClick (s) {
      this.$log('sphereClick', s)
      this.$emit('ready', {name: s.name})
      this.$emit('close')
    },
    handleResult (e) {
      this.$log('handleResult', e)
    },
    cancelClick () {
      this.$log('cancelClick')
      this.search = ''
      this.bodyType = 'device'
      this.$tween.to('.kheader', 0.5, {height: this.$store.state.ui.width + 'px'})
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
