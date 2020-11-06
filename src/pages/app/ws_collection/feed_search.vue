<template lang="pug">
q-input(
  v-model="searchString"
  borderless dense dark color="green"
  placeholder="Поиск или URL"
  :input-style=`{
    paddingLeft: '10px',
  }`
  @focus="focused = true"
  @blur="focused = false"
  ).full-width
  template(v-slot:append)
    q-icon(v-if="searchString.length > 0" name="clear" color="grey-4" @click="searchString = ''").q-mr-sm
</template>

<script>
import { ContentApi } from 'src/api/content'

export default {
  name: 'feedSearch',
  data () {
    return {
      focused: false,
      searchString: '',
      contentKalpa: null,
    }
  },
  watch: {
    searchString: {
      async handler (to, from) {
        if (this.isURL(to)) {
          this.searchString = ''
          this.contentKalpa = await ContentApi.contentCreateFromUrl(to)
          this.$log('contentKalpa', this.contentKalpa)
          this.$emit('content', this.contentKalpa)
        }
        else {
          this.$emit('searchString', to)
        }
      }
    }
  },
  methods: {
    isURL (str) {
      let a = document.createElement('a')
      a.href = str
      return (a.host && a.host !== window.location.host)
    },
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
