<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page(:style=`{paddingTop: '0px', paddingBottom: '200px'}`)
      //- header
      .row.full-width.justify-center.q-px-sm.q-pt-sm
        div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
          div(:style=`{height: '60px',borderRadius: '10px', overflow: 'hidden',}`
            ).row.full-width.items-center.content-center.b-40.q-px-sm
            q-btn(
              @click="$router.back()"
              round flat color="white" icon="keyboard_arrow_left")
            q-icon(name="link" color="white" size="30px").q-mx-sm.q-my-xs
            div(:style=`{overflowX: 'auto'}`).col
              span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ $t('Link creator', 'Создание связи') }}
            q-btn(
              @click="link()"
              color="green" no-caps
              :loading="linking"
              ).q-px-md
              span.text-white.text-bold {{ $t('Link', 'Связать') }}
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start.q-pt-md
          //- items wrapper
          //- TODO: dynamic height, and mobile positions
          .row.full-width.justify-center
            div(
              :style=`{
                height: 'auto',
                maxWidth: '900px',
                paddingLeft: '2px', paddingRight: '2px'
              }`
              ).row.full-width
              //- left item
              div(:style=`{marginRight: '-10px'}`).col.full-height
                item(
                  :item="leftItem" :types="types" :typesShow="jointName.length === 0"
                  :classes="['justify-end']"
                  :style=`{
                    transform: 'perspective(1000px) rotateY(20deg)',
                  }`)
              //- divider
              .row.items-center.content-center.justify-center
                q-icon(name="link" color="green" size="24px")
              //- right item
              div(:style=`{marginLeft: '-10px'}`).col.full-height
                item(
                  :item="rightItem" :types="types" :typesShow="jointName.length === 0"
                  :style=`{
                    transform: 'perspective(1000px) rotateY(-20deg)',
                  }`)
          //- name editor
          .row.full-width
            edit-name(:value="jointName" @input="jointName = $event").q-mb-md
          //- view selector
          .row.full-width
            q-tabs(
              v-model="viewId"
              dense active-color="white" no-caps
              ).full-width.text-grey-6
              q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
          //- view component
          component(:is="`from-${viewId}`")
            //- NEED TO EXPOSE TINT SLOT WITH ITEM PROP WITH UNIQUE ID !
            template(v-slot:tint=`{item, itemKey}`)
              div(
                v-if="item && itemKey"
                :style=`{
                  position: 'absolute', zIndex: 300,
                  borderRadius: '10px', overflow: 'hidden',
                }`
                @mouseenter="itemOver = itemKey"
                @mouseleave="itemOver = null"
                ).row.fit
                div(
                  v-for="(i,ii) in 2" :key="i"
                  @click="itemClick(viewId, item, ii)"
                  v-ripple=`{color: 'white'}`
                  :style=`{
                    position: 'relative'
                  }`
                  ).col.full-height.cursor-pointer
                  div(
                    v-if="itemOver === itemKey"
                    :style=`{
                      background: 'rgba(0,0,0,0.2)'
                    }`
                    ).row.fit.items-center.conten-center.justify-center
                    q-icon(
                      size="50px" color="green"
                      :name="ii === 0 ? 'keyboard_arrow_left' : 'keyboard_arrow_right'")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'

export default {
  name: 'pageApp_linkCreate',
  components: {
    item: () => import('./item.vue'),
    editName: () => import('./edit-name.vue'),
    fromGifs: () => import('./from-gifs.vue')
  },
  data () {
    return {
      viewId: 'gifs',
      itemOver: null,
      leftItem: null,
      rightItem: null,
      jointName: '',
      linking: false,
    }
  },
  computed: {
    views () {
      return [
        { id: 'nodes', name: this.$t('Nodes', 'Ядра') },
        { id: 'video', name: this.$t('Videos', 'Видео') },
        { id: 'image', name: this.$t('Images', 'Изображения') },
        { id: 'books', name: this.$t('Books', 'Книги') },
        { id: 'audio', name: this.$t('Music', 'Аудио') },
        { id: 'speher', name: this.$t('Spheres', 'Сферы') },
        { id: 'bookmarks', name: this.$t('Bookmarks', 'Закладки') },
        { id: 'gifs', name: this.$t('GIFs', 'Гифки') },
      ]
    },
    types () {
      return [
        { id: 'CAUSE', pair: 'EFFECT', name: this.$t('Cause', 'Причина') },
        { id: 'EFFECT', pair: 'CAUSE', name: this.$t('Effect', 'Следствие') },
        { id: 'PROBLEM', pair: 'SOLUTION', name: this.$t('Problem', 'Проблема') },
        { id: 'SOLUTION', pair: 'PROBLEM', name: this.$t('Solution', 'Решение') },
        { id: 'TRUE', pair: 'FALSE', name: this.$t('True', 'Правда') },
        { id: 'FALSE', pair: 'TRUE', name: this.$t('False', 'Ложь') },
        { id: 'FROM', pair: 'TO', name: this.$t('From', 'Первое') },
        { id: 'TO', pair: 'FROM', name: this.$t('To', 'Второе') },
      ]
    },
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        this.$log('$route TO', to)
        if (to.query.leftoid) {
          this.$log('to.quey.leftoid', to.query.leftoid)
          let itemInput = {
            body: null,
            type: 'SOLUTION',
            cover: false,
            readOnly: true
          }
          itemInput.body = await this.$rxdb.get(RxCollectionEnum.OBJ, to.query.leftoid)
          this.$set(this, 'leftItem', itemInput)
        }
      }
    }
  },
  methods: {
    async itemClick (viewId, item, ii) {
      this.$log('itemClick', viewId, item, ii)
      let itemInput
      if (viewId === 'gifs') {
        let url = item.media[0].mediumgif.url
        itemInput = {
          body: {
            url: url,
            urlOriginal: url,
            thumbUrl: url,
            type: 'IMAGE',
            contentSource: 'KALPA',
            contentProvider: 'CUSTOM_URL',
            name: '',
            oid: null,
          },
          type: 'SOLUTION',
          cover: true,
          readOnly: false
        }
        // do not create content in kalpa before the LINK...?
        // let content = await ContentApi.contentCreateFromUrl(url)
        // this.$log('content', content)
        // if ii === 0 make a switch of items?
        // this.$set(this, 'rightItem', itemInput)
      }
      // set itemInput in leftItem/rightItem...
      if (ii === 0) {
        if (this.leftItem && this.leftItem.readOnly) {
          // swap!
          let t = this.leftItem
          this.rightItem = t
          this.leftItem = itemInput
        }
        else {
          this.leftItem = itemInput
        }
      }
      else if (ii === 1) {
        if (this.rightItem && this.rightItem.readOnly) {
          // swap!
          let t = this.rightItem
          this.leftItem = this.rightItem
          this.rightItem = itemInput
        }
        else {
          this.rightItem = itemInput
        }
      }
      // go on top to see what uve done...
    },
    async link () {
      try {
        this.$log('link start')
        this.linking = true
        await this.$wait(1000)
        // make jointInput
        // preview joint?
        // create joint
        // go to joint page?
        this.$log('link done')
        this.linking = false
      }
      catch (e) {
        this.$log('link error', e)
        this.linking = false
      }
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
