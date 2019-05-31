<template lang="pug">
.column.fit.bg-white
  //- header with animated height
  div(:style=`{height: headerHeight+'px', borderBottom: '1px solid #eee'}`).column.full-width
    //- header
    div(v-if="bodyType === 'local'" style=`height: 60px`).row.full-width.items-center.justify-end
      div(style=`height: 60px; width: 60px`).row.items-center.justify-center
        q-btn(flat round dense icon="clear" color="primary" @click="$emit('close')")
    //- body
    .col
      .row.fit.items-center.content-center
        .row.full-width
          .col.q-pl-sm
            q-input(v-model="search" filled placeholder="Найди видео или вставь ссылку" @click="searchClick"
              :class="{'q-pr-sm': bodyType === 'local'}" :debounce="600").fit
              template(v-slot:prepend)
                q-icon(name="search")
          div(v-if="bodyType === 'list'" style=`height: 60px; width: 60px`).row.items-center.justify-center
            q-btn(flat round icon="clear" @click="cancelClick" color="primary")
        div(v-if="bodyType === 'local'").row.full-width.justify-center
          small.text-center.text-grey-8.q-my-sm из YouTube, Вконаткте или Vimeo
  //- videos list
  div(v-if="showVideoList" style=`overflowX: hidden`).col.scroll.bg-grey-2
    list(v-if="bodyType === 'list'" :search="search"
      @videoSelect="$event => $emit('videoSelect', $event)"
      @close="$emit('close')")
    local(v-if="bodyType === 'local'")
</template>

<script>
import list from './list'
import local from './local'
export default {
  name: 'findVideo',
  components: { list, local },
  data () {
    return {
      headerHeight: this.$store.state.ui.width,
      search: '',
      bodyType: 'local',
      bodyTypes: ['local', 'list'],
      items: []
    }
  },
  methods: {
    itemClick (item) {
      this.$log('itemClick', item)
    },
    cancelClick () {
      this.$log('cancelClick')
      this.bodyType = 'local'
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
  // watch: {},
  computed: {
    showVideoList () {
      // TODO: depends on the platform what to show
      // on cordova we ask permission to see videos from
      return true
    }
  },
  mounted () {
    this.$log('mounted')
    // TODO: it can be aggregator from any source, youtube, vk or local
    // load popular videos of what??? at the beginning
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
