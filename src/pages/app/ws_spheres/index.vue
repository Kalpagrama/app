<template lang="pug">
//- q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.b-30
        div(
          :style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between.q-px-md
          span(:style=`{fontSize: '19px'}`).text-white.text-bold {{ $t('wsSpheres_title', 'Сферы') }}
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: '800px'}`).row.full-width
        slot(name="header")
        .row.full-width.q-px-sm
          div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
            q-input(
              v-model="searchString"
              filled dark dense color="white"
              :placeholder="$t('wsSpheres_searchPlaceholder', 'Найти сферу')"
              ).full-width
              template(v-slot:append)
                q-btn(
                  v-if="searchString.length > 0"
                  flat dense color="white" icon="clear" @click="searchString = ''")
                //- q-btn(
                  flat dense color="white" icon="filter_list")
  q-page-container
    q-page
</template>

<script>
export default {
  name: 'pageApp_wsSpheres',
  data () {
    return {
      searchString: ''
    }
  }
}
</script>
