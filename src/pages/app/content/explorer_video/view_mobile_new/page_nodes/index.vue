<template lang="pug">
q-page(
  :style=`{
    paddingTop: '8px',
    paddingBottom: '100vh',
  }`
  ).row.full-width.justify-center
  //- q-page-sticky(
    expand
    position="top"
    :style=`{
      zIndex: 4000
    }`).b-30
    slot(name="top")
  //- q-page-sticky(
    expand
    position="bottom"
    :style=`{
      zIndex: 4000
    }`).b-30
    .row.full-width.items-center.content-center.q-pl-sm.q-py-xs.q-pr-xs
      q-btn(flat color="green" no-caps dense).q-px-xs.b-50 от Автора
      q-btn(flat color="grey-8" no-caps dense).q-px-xs Все
      .col
      q-btn(round flat color="green" icon="add" dense)
      //- creator()
      //- small.text-white 1933 comments
    slot(name="bottom")
  kalpa-loader(
    :immediate="true"
    :query="nodesQuery" @items="nodesLoaded" v-slot=`{items,next,nexting}`)
    div(
      :style=`{
        //- maxWidth: $store.state.ui.pageWidth+'px',
        maxWidth: '100%',
      }`
      ).row.full-width.items-start.content-start.q-pa-sm
      //- slot(name="body")
      div(
        v-for="(node,nodei) in items" :key="node.oid"
        :style=`{
          borderRadius: '10px',
          overflow: 'hidden',
          paddingRight: '0px',
        }`
        ).row.full-width.items-start.content-start.q-mb-md
          div(
            :style=`{
              background: 'rgb(35,35,35)',
              borderRadius: '10px',
              overflow: 'hidden',
            }`
            ).row.full-width
            .row.full-width.items-center.content-center.q-pa-sm
              img(:src="node.thumbUrl" :style=`{width: '28px', height: '28px', borderRadius: '50%',}`)
              .col.q-px-sm
                .row.full-width.items-center.content-center
                  .col
                    small.text-white {{node.author.name}}
                  small.text-grey-8 17.11.2020
            .row.full-width.items-start.content-start
              .row.full-width.items-start.content-start.q-px-sm
                //- .row.full-width
                  img(
                    v-if="true"
                    :src="node.thumbUrl"
                    :style=`{
                      //- objectFit: 'cover',
                      borderRadius: '10px',
                      height: '40px',
                    }`)
                div(:style=`{borderRadius: '10px',}`).row.full-width.b-40
                  //- img(
                    v-if="true"
                    :src="node.thumbUrl"
                    :style=`{
                      borderRadius: '10px',
                      height: '40px',
                    }`)
                  //- div(:style=`{width: '60px', order: 2}`).row
                    img(
                      :src="node.thumbUrl"
                      :style=`{
                        objectFit: 'contain',
                        borderRadius: '10px',
                      }`).fit.b-30
                  //- .col
                    .row.full-width.items-center.content-center.q-pa-sm
                      span.text-white {{node.name}}
                  .col.q-pa-sm
                    span.text-white.text-bold {{node.name}}
                  .col
                    .row.full-width.items-start.content-start.justify-end
                      img(
                        :src="node.thumbUrl"
                        :style=`{
                          //- objectFit: 'contain',
                          height: '60px',
                          borderRadius: '10px',
                        }`).b-30
              //- .row.full-width.q-px-sm.q-pt-sm
                div(
                  :style=`{
                    borderRadius: '10px',
                  }`
                  ).row.full-width.items-start.content-start.b-40
                  img(
                    v-if="true"
                    :src="node.thumbUrl"
                    :style=`{
                      borderRadius: '10px',
                    }`
                    ).full-width
                  .row.full-width.items-center.content-center.q-pa-sm
                    span.text-white суть ядра которое я прикрепил
              .row.full-width.justify-start.q-pt-sm.q-px-sm.scroll
                .row.no-wrap
                  q-btn(
                    v-for="(sphere,si) in node.spheres" :key="si"
                    round flat dense color="grey-6" no-caps
                    :to="'/sphere/'+sphere.oid"
                    :style=`{whiteSpace: 'nowrap',}`).q-px-sm.b-40.q-mr-sm.q-mb-sm {{ sphere.name }}
          node-actions(:node="node")
          //- div(:style=`{height: '50px',}`).row.full-width.items-start.content-start
            q-btn(round flat color="grey-9" icon="bookmark_outline")
            .col
              div(
                v-if="true"
                :style=`{
                  opacity: 0.5,
                  position: 'relative',
                  height: '5px',
                  marginTop: '18px',
                  borderRadius: '10px', overflow: 'hidden',
                  background: 'rgb(2,0,36)',
                  background: 'linear-gradient(90deg, rgba(255,26,5,1) 0%, rgba(255,221,2,0.7) 25%, rgba(75,172,79,0.7) 50%, rgba(44,85,179,0.7) 75%, rgba(113,49,164,1) 100%)'
                }`).row.full-width
            q-btn(round flat color="grey-9" icon="link")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageNodes',
  // props: ['node', 'pageHeight', 'pageWidth'],
  props: ['contentKalpa'],
  components: {
    // creator: () => import('./create.vue'),
    nodeActions: () => import('components/node/node_actions.vue'),
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.contentKalpa.oid
        },
        populateObjects: true,
      }
      // if (this.onlyMine) {
      //   res.selector.oidAuthor = {$eq: this.$store.getters.currentUser().oid}
      // }
      return res
    },
  },
}
</script>
