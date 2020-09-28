<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        slot(name="header")
        .row.full-width.q-px-sm
          .col
            div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
              q-input(
                v-model="searchString"
                filled dark dense color="white"
                :placeholder="$t('wsNodeList_searchPlaceholder', 'Найти ядро')"
                ).full-width
                template(v-slot:append)
                  q-btn(
                    v-if="searchString.length > 0"
                    flat dense color="white" icon="clear" @click="searchString = ''")
                  //- q-btn(
                    flat dense color="white" icon="tune")
          q-btn(round flat dense color="green" icon="add" @click="$router.push('/workspace/node/new')")
        div(:style=`{paddingRight: '50px',}`).row.full-width.q-pl-md
          q-tabs(
            :value="$route.name" @input="$router.push({name: $event})"
            dense no-caps active-color="white" align="left" switch-indicator
            ).full-width.text-grey-8
            q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
      q-page-sticky(position="bottom" :offset="[0, 60]")
  q-page-container
    router-view(:searchString="searchString")
</template>

<script>
import assert from 'assert'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp__wsNodes',
  meta () {
    return {
      title: 'Nodes'
    }
  },
  data () {
    return {
      searchString: '',
    }
  },
  computed: {
    types () {
      return [
        // {id: 'workspace.nodes.fragments', name: this.$t('pageApp_wsNodes_fragments', 'Фрагменты')},
        {id: 'workspace.nodes.drafts', name: this.$t('pageApp_wsNodes_drafts', 'Черновики')},
        {id: 'workspace.nodes.published', name: this.$t('pageApp_wsNodes_published', 'Опубликованные')},
        {id: 'workspace.nodes.saved', name: this.$t('pageApp_wsNodes_saved', 'Сохраненные')},
      ]
    },
  },
}
</script>
