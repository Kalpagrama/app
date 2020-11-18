<template lang="pug">
q-page(
  :style=`{
    paddingTop: '30px',
  }`
  )
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
    //- .row.full-width.q-px-md.q-py-sm
      small.text-white 1933 comments
    slot(name="bottom")
  .row.full-width.items-start.content-start.q-pa-sm
    slot(name="body")
    div(
      v-for="(i,ii) in 100" :key="ii"
      :style=`{
        //- minHeight: '40px',
        borderRadius: '10px',
        overflow: 'hidden',
      }`
      ).row.full-width.items-start.content-start.b-40.q-mb-sm.q-pa-xs
        .row.full-width.items-center.content-center
          img(:src="node.thumbUrl" :style=`{width: '28px', height: '28px', borderRadius: '50%',}`).q-ml-xs
          .col.q-px-sm
            .row.full-width.items-center.content-center
              small.text-white Author Name
              .row.full-width
                small.text-grey-8 17.11.2020
          q-btn(round flat dense color="grey-9" icon="link")
        .row.full-width.items-start.content-start.q-px-sm.q-py-sm
          span.text-white lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
          img(
            v-if="ii % 3 === 0"
            :src="node.thumbUrl"
            :style=`{
              borderRadius: '10px',
            }`
            ).full-width
</template>

<script>
export default {
  name: 'node_pageInside',
  props: ['node', 'pageHeight', 'pageWidth']
}
</script>
