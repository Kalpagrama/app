<template lang="pug">
  .row.full-width.justify-center.b-30
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-px-md
      div(:style=`{height: '40px'}`).row.full-width.items-center.content-center
        q-input(
          ref="searchInput"
          v-model="pageInfo.searchString"
          flat borderless dark dense
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
            q-icon(name="search" :color="pageInfo.search ? 'green' : 'white'" size="30px").q-ml-md
          template(v-slot:append)
            q-btn(
              v-if="pageInfo.search"
              @click="pageInfo.search=false, pageInfo.searchString = ''"
              round flat dense color="white" icon="clear").q-mr-sm
      q-tabs(
        v-if="!pageInfo.search"
        v-model="pageInfo.pageId"
        dense no-caps active-color="green" switch-indicator=false
        @input="$router.replace({query: {pageId: $event}})"
      ).full-width.text-grey-8
        q-tab(
          v-for="p in pageInfo.pages"
          :key="p.id"
          :icon="p.icon"
          :name="p.id"
          :label="p.label")
          // q-menu(anchor="top right" self="top left" dark
            transition-show="scale"
            transition-hide="scale"
            )
</template>

<script>
export default {
  name: 'navTabs',
  props: ['pageInfo'],
  mounted () {
    // if (this.pageInfo.search) {
    //   setTimeout(() => this.$refs.searchInput.focus(), 500)
    // }
  }
}
</script>
