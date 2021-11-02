<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    .row.full-width.items-center.content-center.q-pa-md
      q-btn(round flat icon="west" color="white" @click="$router.back()")
      .col
      span(:style=`{fontSize: '20px',}`).text-white.text-bold {{$t('Help center')}}
      .col
      router-link(
        v-if="!$store.getters.isGuest"
        :to="'/user/'+$store.getters.currentUser.oid")
        img(
          :src="$store.getters.currentUser.thumbUrl"
          :style=`{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
          }`)
    //- search
    .row.full-width
      q-input(
        v-model="searchString"
        borderless dark
        :placeholder="$t('Search')"
        :debounce="300"
        :input-style=`{
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
          padding: '10px',
        }`
        ).full-width
    //- docs list
    //- .row.full-width.justify-center.br
    .row.full-width.items-start.content-start.q-pt-sm
      router-link(
        v-for="(d,di) in docFiltered" :key="d.id"
        :to="d.id"
        :style=`{
          minHeight: '50px',
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm
        span.text-white {{ d.name }}
</template>

<script>
export default {
  name: 'pageHelpHome',
  data () {
    return {
      searchString: '',
      docs: [],
    }
  },
  computed: {
    docFiltered () {
      if (this.searchString.length > 0) {
        return this.docs.filter(d => {
          return d.name.includes(this.searchString)
        })
      }
      else {
        return this.docs
      }
    }
  },
  watch: {
    searchString: {
      handler (to, from) {
        this.$log('searchString TO', to)
      }
    }
  },
  methods: {
    async getDocs () {
      this.$log('getDocs')
      const id = this.$store.getters.currentUser.profile.lang.toLowerCase()
      const fieldId = `kalpa_app_${id}`
      this.$log('id', id)
      const {items: [doc]} = await this.$contentful.getEntries({
        content_type: 'docs_pack',
        // 'fields.id': 'kalpa_app_rus',
        'fields.id': fieldId,
      })
      this.docs = doc.fields.docs.map(d => {
        return {
          id: d.sys.id,
          name: d.fields.name,
          body: d.fields.body
        }
      })
    },
  },
  async mounted () {
    this.$log('mounted')
    await this.getDocs()
  }
}
</script>
