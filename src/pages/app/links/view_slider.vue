<template lang="pug">
.row.full-width.justify-center
  div(
    v-if="joint"
    :style=`{
      maxWidth: '600px',
    }`
    ).row.full-width
      div(
        :style=`{
          height: $q.screen.height/2+'px',
        }`
        ).row.full-width
        img(
          :src="joint.items[0].thumbUrl"
          :style=`{
            objectFit: 'contain',
          }`
          ).fit.bg-black
      div(
        v-for="(r,ri) in 10" :key="ri"
        :style=`{
          position: 'relative',
          zIndex: ri+10,
          height: $q.screen.height/2+'px',
          overflowX: 'auto',
          overflowY: 'visible',
        }`
        ).row.full-width
        div(
          :style=`{
            //- position: 'relative',
            minWidth: '100%',
            minHeight: '100%',
            overflowY: 'visible',
          }`
          ).row.fit.no-wrap
          div(
            v-for="(item,ii) in items" :key="item.oid"
            :style=`{
              //- position: 'relative',
              minWidth: '100%',
              overflowY: 'visible',
            }`
            ).row.fit.br
            //- div(
              :style=`{
                position: 'absolute', height: '60px', top: '-30px', zIndex: ri+11,
              }`
              ).row.full-width.bg-red
            img(
              :src="item.thumbUrl"
              :style=`{
                objectFit: 'contain',
                minWidth: '100%',
              }`
              ).fit.bg-black
</template>

<script>
export default {
  name: 'pageApp__links__viewSlider',
  data () {
    return {
    }
  }
}
</script>
