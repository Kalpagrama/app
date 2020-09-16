<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page(:style=`{paddingTop: '0px',}`)
      router-view
        template(v-slot:header)
          .row.full-width.items-center.content-center.q-py-sm
            .row.full-width.items-between.content-between
              //- q-btn(round flat color="white" icon="keyboard_arrow_left")
              .col.q-px-sm
                div(:style=`{height: '60px', borderRadius: '10px',}`).row.full-width.items-center.content-center.b-40
                  q-icon(name="school" size="30px" color="white").q-mx-md
                  .col
                    span(:style=`{fontSize: '18px'}`).text-white.text-bold Мастерская
                  q-btn(
                    flat color="white" no-caps icon-right="keyboard_arrow_down"
                    )
                    span(:style=`{fontSize: '18px'}`).text-bold {{ pages.find(p => p.id.split('.')[1] === $route.name.split('.')[1]).name }}
                    q-menu
                      div(:style=`{maxWidth: '160px'}`).row.b-40
                        q-btn(
                          @click="$router.push({name: p.id})"
                          v-for="p in pages" :key="p.id"
                          v-if="p.id.split('.')[1] !== $route.name.split('.')[1]"
                          flat color="white" no-caps
                          align="right"
                          ).full-width.q-my-sm.q-pr-lg
                          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ p.name }}
                  //- router-link(
                    :to=`{name: p.id}`
                    v-for="p in pages" :key="p.id"
                    :class=`{
                      'text-bold': $route.name.includes(p.id),
                      'text-grey-8': !$route.name.includes(p.id),
                      'text-white': $route.name.includes(p.id),
                    }`
                    :style=`{
                      fontSize: '18px'
                    }`).text-bold.q-mr-md {{ p.name }}
            //- q-btn(
              v-if="$q.screen.width > 960"
              round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
            //- q-icon(name="school" size="30px" color="white")
            //- .col
              .row.fit.items-center.content-center.justify-start.q-py-sm
            //- .row.full-width.q-px-lg
              q-tabs(
                :value="$route.name.split('.')[1]"
                @input="$router.push({name: 'workspace.'+$event})"
                active-color="white" switch-indicator
                align="left" no-caps
                :style=`{fontSize: '16px !important'}`).full-width.text-grey-7
                q-tab(
                  v-for="t in pages" :key="t.id"
                  :name="t.id.split('.')[1]" :label="t.name"
                  :style=`{fontSize: '16px !important'}`)
</template>

<script>
export default {
  name: 'pageApp_wsIndex',
  computed: {
    pages () {
      return [
        // {id: 'workspace.pages', name: this.$t('pageWs_pages', 'Цепочки')},
        {id: 'workspace.contents', name: this.$t('pageWs_content', 'Контент')},
        {id: 'workspace.nodes', name: this.$t('pageWs_nodes', 'Ядра')},
        {id: 'workspace.spheres', name: this.$t('pageWs_spheres', 'Сферы')},
      ]
    },
  }
}
</script>
