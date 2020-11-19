<template lang="pug">
q-page(
  :style=`{
    paddingTop: '8px',
    paddingBottom: pageHeight+'px'
  }`
  ).row.full-width.justify-center
  q-page-sticky(
    expand
    position="top"
    :style=`{
      zIndex: 4000
    }`).b-30
    slot(name="top")
  q-page-sticky(
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
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`
    ).row.full-width.items-start.content-start.q-pa-sm
    slot(name="body")
    div(
      v-for="(i,ii) in 100" :key="ii"
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
          .row.full-width.items-center.content-center.q-pa-xs
            img(:src="node.thumbUrl" :style=`{width: '28px', height: '28px', borderRadius: '50%',}`).q-ml-xs
            .col.q-px-sm
              .row.full-width.items-center.content-center
                .col
                  small.text-white Author Name
                small.text-grey-8 17.11.2020
          .row.full-width.items-start.content-start
            .row.full-width.items-start.content-start.q-px-sm
              div(:style=`{borderRadius: '10px',}`).row.full-width.items-start.content-start.b-40
                img(
                  v-if="true"
                  :src="node.thumbUrl"
                  :style=`{
                    borderRadius: '10px',
                    height: '40px',
                  }`)
                .col.full-height
                  .row.fit.items-center.content-center.q-pa-sm
                    small.text-white суть которую я увидел в ядре выше
            .row.full-width.q-px-sm.q-pt-sm
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
            .row.full-width.justify-start.q-pt-sm.q-px-sm
              q-btn(
                v-for="s in 3" :key="s"
                round flat dense color="grey-2" no-caps).q-px-sm.b-40.q-mr-sm.q-mb-sm сфера {{s}}
        div(:style=`{height: '50px',}`).row.full-width.items-start.content-start
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
export default {
  name: 'node_pageInside',
  props: ['node', 'pageHeight', 'pageWidth'],
  components: {
    creator: () => import('./create.vue'),
  }
}
</script>
