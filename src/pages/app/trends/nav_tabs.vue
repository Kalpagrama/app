<template lang="pug">
  .row.full-width.justify-center.b-30
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px', height: height + 'px'}`).row.full-width.q-px-md
      transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        q-input(
          v-if="pageInfo.rootPageId === 'search'"
          ref="searchInput"
          v-model="pageInfo.searchString"
          flat borderless dark dense autofocus
          icon="search"
          :placeholder="$t('Type here to search...')"
          :debounce="500"
          :input-style=`{
                    width: '500px',
                    color: 'grey',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }`
          @focus="pageInfo.search=true"
        ).full-width
          template(v-slot:prepend)
            q-icon(name="search" :color="pageInfo.search ? 'green' : 'white'" size="25px").q-mx-lg
          template(v-slot:append)
            q-btn(
              @click="pageInfo.searchString = '', pageInfo.rootPageId = pageInfo.rootPages[1].id"
              round flat dense color="white" icon="clear").q-mr-sm
        q-tabs(
          v-if="pageInfo.rootPageId !== 'search'"
          v-model="pageInfo.rootPageId"
          align="justify"
          dense no-caps active-color="green" switch-indicator=true
        ).full-width.text-grey-8
          q-tab(
            v-for="p in pageInfo.rootPages"
            :key="p.id"
            :icon="p.icon"
            :name="p.id"
            :label="p.label")
            //q-menu(
            //  v-model="showSearchInput"
            //  anchor="top right" self="top left" dark persistent no-parent-event
            //  transition-show="slide-right"
            //  transition-hide="slide-left"
            //  )
</template>

<script>
export default {
  name: 'navTabs',
  props: ['pageInfo', 'height'],
  data() {
    return {
      showSearchInput: false,
    }
  },
  watch: {
    'pageInfo.rootPageId': {
      immediate: true,
      handler (to, from) {
        if (to) this.$router.replace({query: {rootPageId: to}})
        this.showSearchInput = to === 'search'
      }
    }
  },
  mounted () {
    // if (this.pageInfo.search) {
    //   setTimeout(() => this.$refs.searchInput.focus(), 500)
    // }
  }
}
</script>
