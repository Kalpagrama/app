<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        div(:style=`{height: '50px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-pl-md.q-pr-xs.b-40
          q-icon(name="home" color="white" size="30px").q-mr-sm
          span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white {{$t('pageApp_Home_title', 'Домашняя')}}
          .col
  q-page-container
    q-page(:style=`{paddingTop: '50px', paddingBottom: '200px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
            template(v-slot=`{items,next}`)
              list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
                q-infinite-scroll(@load="next" :offset="250")
                template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
                  div(
                    :style=`{
                      background: 'rgb(35,35,35)',
                      borderRadius: '10px', overflow: 'hidden'
                    }`
                    ).row.full-width
                    //- event reason and subject
                    .row.full-width.q-py-xs.q-px-sm
                      .col
                      small.text-grey-6.q-mr-md why: {{ item.matter.reason }}
                      small.text-grey-6 from: {{ item.subject.name }}
                    //- event object : node wrapper
                    div(:style=`{borderRadius: '10px',overflow: 'hidden'}`).row.full-width.b-40
                      node-lite(
                        v-if="item.object.type === 'NODE'"
                        :node="item.object" :isActive="isActive" :isVisible="isVisible"
                        :marginBottom="0")
                      div(
                        v-if="item.object.type === 'WORD'"
                        ).row.full-width.items-center.content-center.q-pa-md
                        q-icon(name="blur_on" color="white" size="30px").q-mr-sm
                        span.text-bold.text-white {{ item.object.name }}
                  //- div(v-for="(p, pkey) in i" :key="pkey").full-width.q-mb-sm
                    span.text-white.q-mr-sm {{ pkey }}:
                    small.text-white {{ p }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp__home',
  data () {
    return {
      feed: 'one',
      feeds: [
        {oid: 'one', name: 'Все подряд'},
        {oid: 'two', name: 'Программисты'},
        {oid: 'three', name: 'Стартапы'},
        {oid: 'four', name: 'Саморазвитие'},
        {oid: 'five', name: 'Спортик'}
      ]
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser() ? this.$store.getters.currentUser().oid : null
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_FEED,
          oidSphere: this.sphereOid
        }
      }
    }
  }
}
</script>
