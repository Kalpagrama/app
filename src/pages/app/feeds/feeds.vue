<style lang="sass" scoped>
.feed-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
.row.full-width
  //- header
  .row.full-width.justify-center.q-pt-sm.q-px-sm
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
      div(
        :style=`{
          height: '60px', borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.b-40
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        q-icon(name="view_week" color="white" size="30px").q-mr-sm
        .col
          span(:style=`{fontSize: '18px'}`).text-white.text-bold Ленты
        q-btn(round flat color="green" icon="add" @click="$router.push('/feeds/edit/new')")
  //- feeds
  .row.full-width.justify-center.q-pt-sm.q-px-sm
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-sm
      div(v-if="feeds.length > 0").row.full-width.items-start.content-start
        //- feed wrapper
        div(
          v-for="(f,fi) in feeds" :key="f.id"
          ).col-xs-12.col-sm-6.q-pr-xs.q-mb-sm
          div(
            :style=`{
              position: 'relative',
              height: '100px', borderRadius: '10px',
            }`
            ).row.full-width.b-40.feed-item
            //- feed left side
            div(
              @click="$router.push(`/feeds/${f.id}`)"
              ).col
              //- feed header
              .row.full-width.q-px-md.q-py-sm
                span.text-white {{ f.name }}
              //- feed items preview 5 first ?
              .row.full-width
                div(
                  v-for="(i,ii) in f.items" :key="i"
                  v-if="ii < 6 && subscriptions[i] && !['WORD'].includes(subscriptions[i].type)"
                  :style=`{width: '50px', height: '50px'}`
                  ).row.items-center.content-center.justify-center
                  img(
                    draggable="false"
                    :src="subscriptions[i].thumbUrl"
                    :style=`{
                      objectFit: 'cover',
                      width: '30px', height: '30px',
                      borderRadius: '50px',
                    }`)
            //- feed actions: edit
            .row.full-height.items-start.content-start.q-pa-xs
              q-btn(
                @click="$router.push(`/feeds/edit/${f.id}`)"
                round flat dense color="grey-9" icon="settings")
</template>

<script>
export default {
  name: 'pageApp_feeds_feeds',
  props: ['feeds', 'subscriptions'],
  data () {
    return {
    }
  }
}
</script>
